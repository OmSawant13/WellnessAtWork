const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
  challenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  opponent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'active', 'completed', 'declined'],
    default: 'pending'
  },
  challengerProgress: {
    type: Number,
    default: 0
  },
  opponentProgress: {
    type: Number,
    default: 0
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  reward: {
    points: {
      type: Number,
      default: 100
    }
  }
}, {
  timestamps: true
});

// Indexes
battleSchema.index({ challenger: 1, status: 1 });
battleSchema.index({ opponent: 1, status: 1 });
battleSchema.index({ status: 1, endDate: 1 });

module.exports = mongoose.model('Battle', battleSchema);

