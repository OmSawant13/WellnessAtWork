const LootBox = require('../models/LootBox');
const User = require('../models/User');
const Reward = require('../models/Reward');
const Badge = require('../models/Badge');
const asyncHandler = require('../middleware/asyncHandler');

// Reward probabilities
const REWARD_TYPES = {
  common: ['points'],
  uncommon: ['points', 'badge'],
  rare: ['points', 'badge', 'shop_item'],
  epic: ['points', 'badge', 'shop_item', 'bonus_challenge'],
  legendary: ['points', 'badge', 'shop_item', 'bonus_challenge', 'streak_boost']
};

const REWARD_VALUES = {
  common: { points: [10, 25, 50] },
  uncommon: { points: [50, 100, 150] },
  rare: { points: [100, 200, 300] },
  epic: { points: [200, 400, 500] },
  legendary: { points: [500, 1000, 1500] }
};

// @desc    Open daily loot box
// @route   POST /api/loot-boxes/open
// @access  Private
exports.openLootBox = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if user already opened today
  const todayLootBox = await LootBox.findOne({
    user: req.user.id,
    openedAt: { $gte: today }
  });

  if (todayLootBox) {
    return res.status(400).json({
      success: false,
      message: 'You have already opened your daily loot box today. Come back tomorrow!'
    });
  }

  // Determine rarity (weighted random)
  const rarityRoll = Math.random();
  let rarity;
  if (rarityRoll < 0.5) rarity = 'common';
  else if (rarityRoll < 0.75) rarity = 'uncommon';
  else if (rarityRoll < 0.9) rarity = 'rare';
  else if (rarityRoll < 0.98) rarity = 'epic';
  else rarity = 'legendary';

  // Determine reward type
  const possibleTypes = REWARD_TYPES[rarity];
  const rewardType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];

  let reward = {
    type: rewardType,
    value: 0,
    description: ''
  };

  // Generate reward based on type
  if (rewardType === 'points') {
    const pointsOptions = REWARD_VALUES[rarity].points;
    reward.value = pointsOptions[Math.floor(Math.random() * pointsOptions.length)];
    reward.description = `You earned ${reward.value} points!`;
    
    // Add points to user
    const user = await User.findById(req.user.id);
    user.addPoints(reward.value);
    await user.save();
  } else if (rewardType === 'badge') {
    // Get random badge
    const badges = await Badge.find();
    if (badges.length > 0) {
      const randomBadge = badges[Math.floor(Math.random() * badges.length)];
      reward.badge = randomBadge._id;
      reward.description = `You earned the ${randomBadge.name} badge!`;
      
      // Add badge to user
      const user = await User.findById(req.user.id);
      if (!user.wellnessProfile.badges.includes(randomBadge._id)) {
        user.wellnessProfile.badges.push(randomBadge._id);
        await user.save();
      }
    } else {
      // Fallback to points if no badges
      reward.type = 'points';
      reward.value = REWARD_VALUES[rarity].points[0];
      reward.description = `You earned ${reward.value} points!`;
      
      const user = await User.findById(req.user.id);
      user.addPoints(reward.value);
      await user.save();
    }
  } else if (rewardType === 'shop_item') {
    // Get random shop item
    const shopItems = await Reward.find({ available: true });
    if (shopItems.length > 0) {
      const randomItem = shopItems[Math.floor(Math.random() * shopItems.length)];
      reward.item = randomItem._id;
      reward.value = randomItem.cost;
      reward.description = `You got ${randomItem.name} for free!`;
      
      // Add item to user (implement redemption logic)
      const user = await User.findById(req.user.id);
      // Note: You'll need to implement reward redemption logic
    } else {
      // Fallback to points
      reward.type = 'points';
      reward.value = REWARD_VALUES[rarity].points[0];
      reward.description = `You earned ${reward.value} points!`;
      
      const user = await User.findById(req.user.id);
      user.addPoints(reward.value);
      await user.save();
    }
  } else if (rewardType === 'streak_boost') {
    reward.value = 1;
    reward.description = 'You got a streak boost! Your streak won\'t break for 1 day.';
    
    // Implement streak boost logic (add to user model if needed)
  }

  // Create loot box
  const lootBox = await LootBox.create({
    user: req.user.id,
    reward,
    rarity
  });

  await lootBox.populate('reward.badge reward.item', 'name');

  res.json({
    success: true,
    data: lootBox
  });
});

// @desc    Get my loot box history
// @route   GET /api/loot-boxes
// @access  Private
exports.getMyLootBoxes = asyncHandler(async (req, res) => {
  const lootBoxes = await LootBox.find({ user: req.user.id })
    .populate('reward.badge reward.item', 'name')
    .sort({ openedAt: -1 })
    .limit(30);

  res.json({
    success: true,
    data: lootBoxes
  });
});

// @desc    Check if can open loot box today
// @route   GET /api/loot-boxes/check
// @access  Private
exports.checkLootBox = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayLootBox = await LootBox.findOne({
    user: req.user.id,
    openedAt: { $gte: today }
  });

  res.json({
    success: true,
    data: {
      canOpen: !todayLootBox,
      lastOpened: todayLootBox ? todayLootBox.openedAt : null
    }
  });
});

