const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a badge name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Badge name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a badge description'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  icon: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['activity', 'challenge', 'streak', 'achievement', 'social', 'milestone'],
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  criteria: {
    type: {
      type: String,
      enum: ['points', 'streak', 'activities', 'challenges', 'custom'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    activityType: String,
    challengeType: String
  },
  pointsReward: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
badgeSchema.index({ category: 1 });
badgeSchema.index({ rarity: 1 });
badgeSchema.index({ 'criteria.type': 1 });

module.exports = mongoose.model('Badge', badgeSchema);

