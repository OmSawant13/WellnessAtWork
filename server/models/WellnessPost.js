const mongoose = require('mongoose');

const wellnessPostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['story', 'post', 'achievement', 'meme', 'tip'],
    default: 'post'
  },
  content: {
    text: {
      type: String,
      maxlength: 500
    },
    image: {
      type: String // URL to uploaded image
    },
    video: {
      type: String // URL to uploaded video
    }
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true,
      maxlength: 200
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: {
    type: Number,
    default: 0
  },
  isStory: {
    type: Boolean,
    default: false
  },
  storyExpiresAt: {
    type: Date // Stories expire after 24 hours
  },
  tags: [{
    type: String
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes
wellnessPostSchema.index({ user: 1, createdAt: -1 });
wellnessPostSchema.index({ isStory: 1, storyExpiresAt: 1 });
wellnessPostSchema.index({ type: 1, createdAt: -1 });

// Auto-expire stories after 24 hours
wellnessPostSchema.pre('save', function(next) {
  if (this.isStory && !this.storyExpiresAt) {
    this.storyExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('WellnessPost', wellnessPostSchema);

