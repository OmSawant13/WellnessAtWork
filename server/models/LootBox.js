const mongoose = require('mongoose');

const lootBoxSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  openedAt: {
    type: Date,
    default: Date.now
  },
  reward: {
    type: {
      type: String,
      enum: ['points', 'badge', 'shop_item', 'bonus_challenge', 'streak_boost'],
      required: true
    },
    value: {
      type: Number // Points amount, or item ID
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reward' // If reward is shop_item
    },
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge' // If reward is badge
    },
    description: {
      type: String
    }
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  }
}, {
  timestamps: true
});

// Indexes
lootBoxSchema.index({ user: 1, openedAt: -1 });

module.exports = mongoose.model('LootBox', lootBoxSchema);

