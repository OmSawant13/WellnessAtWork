const mongoose = require('mongoose');

const quickSnapSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['breathing', 'stretch', 'focus', 'energy', 'meditation', 'desk_workout'],
    required: true
  },
  duration: {
    type: Number, // in seconds
    default: 60 // 1 minute default
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  points: {
    type: Number,
    default: 10 // Quick snap gives 10 points
  },
  shared: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
quickSnapSchema.index({ user: 1, createdAt: -1 });
quickSnapSchema.index({ type: 1, completed: 1 });

module.exports = mongoose.model('QuickSnap', quickSnapSchema);

