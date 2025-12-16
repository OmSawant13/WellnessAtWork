const Battle = require('../models/Battle');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create 1v1 battle
// @route   POST /api/battles
// @access  Private
exports.createBattle = asyncHandler(async (req, res) => {
  const { opponentId, challengeId } = req.body;

  if (!opponentId || !challengeId) {
    return res.status(400).json({
      success: false,
      message: 'Please provide opponent and challenge'
    });
  }

  // Check if opponent exists
  const opponent = await User.findById(opponentId);
  if (!opponent) {
    return res.status(404).json({
      success: false,
      message: 'Opponent not found'
    });
  }

  // Check if challenge exists
  const challenge = await Challenge.findById(challengeId);
  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    });
  }

  // Check if battle already exists
  const existingBattle = await Battle.findOne({
    challenger: req.user.id,
    opponent: opponentId,
    challenge: challengeId,
    status: { $in: ['pending', 'accepted', 'active'] }
  });

  if (existingBattle) {
    return res.status(400).json({
      success: false,
      message: 'Battle already exists with this opponent'
    });
  }

  // Create battle
  const battle = await Battle.create({
    challenger: req.user.id,
    opponent: opponentId,
    challenge: challengeId,
    endDate: challenge.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: 'pending'
  });

  await battle.populate('challenger opponent challenge', 'name email title');

  res.status(201).json({
    success: true,
    data: battle
  });
});

// @desc    Accept/Decline battle
// @route   PUT /api/battles/:id/respond
// @access  Private
exports.respondToBattle = asyncHandler(async (req, res) => {
  const { response } = req.body; // 'accept' or 'decline'

  const battle = await Battle.findById(req.params.id);

  if (!battle) {
    return res.status(404).json({
      success: false,
      message: 'Battle not found'
    });
  }

  if (battle.opponent.toString() !== req.user.id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only respond to battles where you are the opponent'
    });
  }

  if (battle.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Battle is not pending'
    });
  }

  if (response === 'accept') {
    battle.status = 'accepted';
    // Auto-activate if challenge is active
    const challenge = await Challenge.findById(battle.challenge);
    if (challenge && challenge.status === 'active') {
      battle.status = 'active';
    }
  } else if (response === 'decline') {
    battle.status = 'declined';
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid response. Use "accept" or "decline"'
    });
  }

  await battle.save();
  await battle.populate('challenger opponent challenge', 'name email title');

  res.json({
    success: true,
    data: battle
  });
});

// @desc    Get my battles
// @route   GET /api/battles
// @access  Private
exports.getMyBattles = asyncHandler(async (req, res) => {
  const battles = await Battle.find({
    $or: [
      { challenger: req.user.id },
      { opponent: req.user.id }
    ]
  })
    .populate('challenger opponent challenge winner', 'name email title')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: battles
  });
});

// @desc    Update battle progress
// @route   PUT /api/battles/:id/progress
// @access  Private
exports.updateBattleProgress = asyncHandler(async (req, res) => {
  const battle = await Battle.findById(req.params.id);

  if (!battle) {
    return res.status(404).json({
      success: false,
      message: 'Battle not found'
    });
  }

  if (battle.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Battle is not active'
    });
  }

  // Update progress based on user
  if (battle.challenger.toString() === req.user.id.toString()) {
    battle.challengerProgress = req.body.progress || battle.challengerProgress;
  } else if (battle.opponent.toString() === req.user.id.toString()) {
    battle.opponentProgress = req.body.progress || battle.opponentProgress;
  } else {
    return res.status(403).json({
      success: false,
      message: 'You are not part of this battle'
    });
  }

  // Check if battle is complete
  const challenge = await Challenge.findById(battle.challenge);
  if (challenge) {
    const targetValue = challenge.rules?.targetValue || 0;
    
    if (battle.challengerProgress >= targetValue || battle.opponentProgress >= targetValue) {
      battle.status = 'completed';
      
      // Determine winner
      if (battle.challengerProgress >= targetValue && battle.opponentProgress >= targetValue) {
        // Both completed - winner is who completed first or has more progress
        battle.winner = battle.challengerProgress > battle.opponentProgress 
          ? battle.challenger 
          : battle.opponent;
      } else if (battle.challengerProgress >= targetValue) {
        battle.winner = battle.challenger;
      } else {
        battle.winner = battle.opponent;
      }

      // Award points to winner
      if (battle.winner) {
        const winner = await User.findById(battle.winner);
        winner.addPoints(battle.reward.points);
        await winner.save();
      }
    }
  }

  await battle.save();
  await battle.populate('challenger opponent challenge winner', 'name email title');

  res.json({
    success: true,
    data: battle
  });
});

