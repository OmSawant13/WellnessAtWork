const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['steps', 'meditation', 'workout', 'hydration', 'sleep', 'yoga', 'walking', 'running', 'cycling', 'nutrition', 'healthy-eating', 'other'],
    required: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  value: {
    type: Number,
    required: true,
    min: [0, 'Value cannot be negative']
  },
  unit: {
    type: String,
    enum: ['steps', 'minutes', 'hours', 'sessions', 'glasses', 'km', 'calories', 'meals', 'servings', 'items'],
    required: true
  },
  points: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Points cannot be negative']
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge'
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  photo: {
    type: {
      type: String,
      enum: ['single', 'multiple'],
      default: 'single'
    },
    url: {
      type: String // Single photo URL (for backward compatibility)
    },
    urls: [{
      url: {
        type: String,
        required: true
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      description: {
        type: String // Optional description for each photo
      }
    }],
    uploadedAt: {
      type: Date
    },
    verified: {
      type: Boolean,
      default: false
    },
    minPhotos: {
      type: Number,
      default: 1 // Minimum photos required
    },
    maxPhotos: {
      type: Number,
      default: 10 // Maximum photos allowed
    }
  },
  metadata: {
    duration: Number, // in minutes
    distance: Number, // in km
    calories: Number,
    heartRate: Number,
    device: String, // 'fitbit', 'apple-health', 'manual'
    deviceId: String,
    timeGap: Number // Time gap from last activity (for hydration challenges)
  },
  activityDate: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
activitySchema.index({ user: 1, activityDate: -1 });
activitySchema.index({ type: 1 });
activitySchema.index({ challenge: 1 });
activitySchema.index({ activityDate: -1 });

// Static method to calculate points
activitySchema.statics.calculatePoints = function(type, value, unit) {
  let points = 0;
  
  switch (type) {
    case 'steps':
      points = Math.floor(value / 100); // 1 point per 100 steps
      break;
    case 'meditation':
      points = Math.floor(value / 1) * 10; // 10 points per minute
      break;
    case 'workout':
    case 'yoga':
    case 'walking':
    case 'running':
    case 'cycling':
      points = Math.floor(value / 1) * 20; // 20 points per minute
      break;
    case 'hydration':
      points = value * 5; // 5 points per glass
      break;
    case 'sleep':
      points = Math.floor(value / 1) * 2; // 2 points per hour
      break;
    case 'nutrition':
    case 'healthy-eating':
      points = value * 15; // 15 points per healthy meal/serving
      break;
    default:
      points = Math.floor(value / 1) * 10; // Default: 10 points per unit
  }
  
  return Math.max(0, points);
};

// Pre-save hook to calculate points if not provided
activitySchema.pre('save', function(next) {
  if (this.isNew && this.points === 0) {
    this.points = this.constructor.calculatePoints(this.type, this.value, this.unit);
  }
  next();
});

module.exports = mongoose.model('Activity', activitySchema);

