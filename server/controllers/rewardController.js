const Reward = require('../models/Reward');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all rewards
// @route   GET /api/rewards
// @access  Private
exports.getRewards = asyncHandler(async (req, res) => {
  const { type, category, available, limit = 50, page = 1 } = req.query;
  const query = { isActive: true };

  if (type) query.type = type;
  if (category) query.category = category;
  if (available === 'true') {
    query.$or = [
      { 'availability.total': null },
      { 'availability.remaining': { $gt: 0 } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const rewards = await Reward.find(query)
    .populate('createdBy', 'name')
    .sort({ pointsCost: 1, createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Reward.countDocuments(query);

  res.json({
    success: true,
    count: rewards.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: rewards
  });
});

// @desc    Get single reward
// @route   GET /api/rewards/:id
// @access  Private
exports.getReward = asyncHandler(async (req, res) => {
  const reward = await Reward.findById(req.params.id)
    .populate('createdBy', 'name')
    .populate('redemptions.user', 'name email');

  if (!reward) {
    return res.status(404).json({
      success: false,
      message: 'Reward not found'
    });
  }

  res.json({
    success: true,
    data: reward
  });
});

// @desc    Create reward
// @route   POST /api/rewards
// @access  Private (Admin/HR)
exports.createReward = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    type,
    category,
    pointsCost,
    image,
    availability,
    expiryDate,
    redemptionInstructions,
    partner
  } = req.body;

  const reward = await Reward.create({
    name,
    description,
    type,
    category,
    pointsCost,
    image,
    availability: {
      total: availability?.total || null,
      remaining: availability?.total || null
    },
    expiryDate,
    redemptionInstructions,
    partner,
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    data: reward
  });
});

// @desc    Update reward
// @route   PUT /api/rewards/:id
// @access  Private (Admin/HR)
exports.updateReward = asyncHandler(async (req, res) => {
  const reward = await Reward.findById(req.params.id);

  if (!reward) {
    return res.status(404).json({
      success: false,
      message: 'Reward not found'
    });
  }

  const {
    name,
    description,
    type,
    category,
    pointsCost,
    image,
    availability,
    expiryDate,
    redemptionInstructions,
    partner,
    isActive
  } = req.body;

  if (name) reward.name = name;
  if (description) reward.description = description;
  if (type) reward.type = type;
  if (category) reward.category = category;
  if (pointsCost) reward.pointsCost = pointsCost;
  if (image) reward.image = image;
  if (availability) reward.availability = availability;
  if (expiryDate) reward.expiryDate = expiryDate;
  if (redemptionInstructions) reward.redemptionInstructions = redemptionInstructions;
  if (partner) reward.partner = partner;
  if (isActive !== undefined) reward.isActive = isActive;

  await reward.save();

  res.json({
    success: true,
    data: reward
  });
});

// @desc    Delete reward
// @route   DELETE /api/rewards/:id
// @access  Private (Admin/HR)
exports.deleteReward = asyncHandler(async (req, res) => {
  const reward = await Reward.findById(req.params.id);

  if (!reward) {
    return res.status(404).json({
      success: false,
      message: 'Reward not found'
    });
  }

  await reward.deleteOne();

  res.json({
    success: true,
    message: 'Reward deleted successfully'
  });
});

// @desc    Claim reward
// @route   POST /api/rewards/:id/claim
// @access  Private
exports.claimReward = asyncHandler(async (req, res) => {
  const reward = await Reward.findById(req.params.id);

  if (!reward) {
    return res.status(404).json({
      success: false,
      message: 'Reward not found'
    });
  }

  if (!reward.isAvailable()) {
    return res.status(400).json({
      success: false,
      message: 'Reward is not available'
    });
  }

  const user = await User.findById(req.user.id);

  if (user.wellnessProfile.totalPoints < reward.pointsCost) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient points'
    });
  }

  // Generate redemption code
  const code = `RW-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Redeem reward
  reward.redeem(req.user.id, code);

  // Deduct points
  user.wellnessProfile.totalPoints -= reward.pointsCost;
  await user.save();

  await reward.save();

  res.json({
    success: true,
    message: 'Reward claimed successfully',
    data: {
      reward: {
        id: reward._id,
        name: reward.name,
        type: reward.type
      },
      redemptionCode: code,
      remainingPoints: user.wellnessProfile.totalPoints,
      redemptionInstructions: reward.redemptionInstructions
    }
  });
});

// @desc    Get my redemptions
// @route   GET /api/rewards/my/redemptions
// @access  Private
exports.getMyRedemptions = asyncHandler(async (req, res) => {
  const rewards = await Reward.find({
    'redemptions.user': req.user.id
  })
    .select('name description type pointsCost redemptions')
    .populate('redemptions.user', 'name email');

  const myRedemptions = rewards
    .map(reward => {
      const myRedemption = reward.redemptions.find(
        r => r.user._id.toString() === req.user.id.toString()
      );
      if (myRedemption) {
        return {
          reward: {
            id: reward._id,
            name: reward.name,
            description: reward.description,
            type: reward.type
          },
          redemption: myRedemption
        };
      }
      return null;
    })
    .filter(r => r !== null);

  res.json({
    success: true,
    count: myRedemptions.length,
    data: myRedemptions
  });
});


