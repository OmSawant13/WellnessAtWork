const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a reward name'],
    trim: true,
    maxlength: [100, 'Reward name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a reward description'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['physical', 'digital', 'experience', 'discount', 'badge', 'points'],
    required: true
  },
  category: {
    type: String,
    enum: ['wellness', 'fitness', 'mental-health', 'nutrition', 'lifestyle', 'general'],
    default: 'general'
  },
  pointsCost: {
    type: Number,
    required: [true, 'Please provide points cost'],
    min: [0, 'Points cost cannot be negative']
  },
  image: {
    type: String,
    trim: true
  },
  availability: {
    total: {
      type: Number,
      default: null // null means unlimited
    },
    remaining: {
      type: Number,
      default: null
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiryDate: {
    type: Date
  },
  redemptionInstructions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Instructions cannot exceed 1000 characters']
  },
  partner: {
    name: String,
    contact: String
  },
  redemptions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    redeemedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'fulfilled', 'cancelled'],
      default: 'pending'
    },
    code: {
      type: String,
      trim: true
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
rewardSchema.index({ type: 1, isActive: 1 });
rewardSchema.index({ pointsCost: 1 });
rewardSchema.index({ category: 1 });

// Method to check availability
rewardSchema.methods.isAvailable = function() {
  if (!this.isActive) return false;
  if (this.expiryDate && this.expiryDate < new Date()) return false;
  if (this.availability.total !== null && this.availability.remaining <= 0) return false;
  return true;
};

// Method to redeem reward
rewardSchema.methods.redeem = function(userId, code) {
  if (!this.isAvailable()) {
    throw new Error('Reward is not available');
  }
  
  if (this.availability.total !== null) {
    if (this.availability.remaining <= 0) {
      throw new Error('Reward is out of stock');
    }
    this.availability.remaining -= 1;
  }
  
  this.redemptions.push({
    user: userId,
    redeemedAt: new Date(),
    status: 'pending',
    code: code || null
  });
};

module.exports = mongoose.model('Reward', rewardSchema);

