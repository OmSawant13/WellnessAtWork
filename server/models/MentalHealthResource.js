const mongoose = require('mongoose');

const mentalHealthResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a resource title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a resource description'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['article', 'video', 'podcast', 'ebook', 'worksheet', 'tool', 'app'],
    required: true
  },
  category: {
    type: String,
    enum: ['stress-management', 'anxiety', 'depression', 'mindfulness', 'sleep', 'work-life-balance', 'relationships', 'self-care', 'general'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  content: {
    url: {
      type: String,
      trim: true
    },
    embedCode: {
      type: String
    },
    text: {
      type: String
    },
    fileUrl: {
      type: String
    }
  },
  thumbnail: {
    type: String,
    trim: true
  },
  author: {
    type: String,
    trim: true
  },
  duration: {
    type: Number, // in minutes for videos/podcasts
    min: 0
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de', 'hi']
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  accessCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
mentalHealthResourceSchema.index({ type: 1, category: 1 });
mentalHealthResourceSchema.index({ tags: 1 });
mentalHealthResourceSchema.index({ isFeatured: 1, isActive: 1 });
mentalHealthResourceSchema.index({ 'rating.average': -1 });

// Method to increment access count
mentalHealthResourceSchema.methods.incrementAccess = function() {
  this.accessCount += 1;
};

// Method to update rating
mentalHealthResourceSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating.average * this.rating.count) + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
};

module.exports = mongoose.model('MentalHealthResource', mentalHealthResourceSchema);

