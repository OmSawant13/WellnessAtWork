const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Badge = require('../models/Badge');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all challenges
// @route   GET /api/challenges
// @access  Private
exports.getChallenges = asyncHandler(async (req, res) => {
  const { status, type } = req.query;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const today = new Date(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  // Get all challenges
  const allChallenges = await Challenge.find({})
    .populate('participants.user', 'name email')
    .populate('createdBy', 'name email')
    .sort({ startDate: -1 });

  // Categorize challenges
  const categorized = {
    today: [],
    upcoming: [],
    expired: [],
    completed: []
  };

  // Process challenges and handle expired ones
  const expiredChallengesToUpdate = [];
  const currentTime = new Date();
  
  for (const challenge of allChallenges) {
    const challengeObj = challenge.toObject();
    const startDate = new Date(challenge.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(challenge.endDate);
    endDate.setHours(23, 59, 59, 999);
    const expiresAt = challenge.expiresAt ? new Date(challenge.expiresAt) : null;
    
    // Check if user is participant (handle both populated and non-populated)
    const userParticipant = challenge.participants.find(p => {
      const userId = p.user?._id ? p.user._id.toString() : p.user?.toString();
      return userId === req.user.id.toString();
    });

    // Check if challenge is currently active (between start and end date)
    const isCurrentlyActive = startDate <= currentTime && endDate >= currentTime;
    const isToday = startDate.getTime() === today.getTime();
    const isTomorrow = startDate.getTime() === tomorrow.getTime();
    const isExpired = expiresAt && expiresAt < currentTime;
    const isOldExpired = expiresAt && expiresAt < threeDaysAgo;

    // Completed - user completed the challenge (check first)
    if (userParticipant && userParticipant.challengeCompleted) {
      challengeObj.category = 'completed';
      challengeObj.userProgress = {
        progress: userParticipant.progress || 0,
        points: userParticipant.points || 0,
        challengeCompleted: true,
        completedAt: userParticipant.challengeCompletedAt
      };
      categorized.completed.push(challengeObj);
    }
    // Expired - 3+ days ago, not completed
    else if (isOldExpired && challenge.status !== 'completed') {
      challengeObj.category = 'expired';
      challengeObj.isExpired = true;
      
      // Check if user participated and didn't complete
      if (userParticipant && !userParticipant.challengeCompleted) {
        // Deduct points if not already deducted
        if (!userParticipant.pointsLost || userParticipant.pointsLost === 0) {
          const pointsToDeduct = Math.floor((userParticipant.points || 0) * 0.1); // 10% penalty
          if (pointsToDeduct > 0) {
            expiredChallengesToUpdate.push({
              challengeId: challenge._id,
              participantIndex: challenge.participants.findIndex(p => {
                const userId = p.user?._id ? p.user._id.toString() : p.user?.toString();
                return userId === req.user.id.toString();
              }),
              pointsToDeduct
            });
          }
          challengeObj.userProgress = {
            progress: userParticipant.progress || 0,
            points: userParticipant.points || 0,
            challengeCompleted: false,
            pointsLost: pointsToDeduct
          };
        } else {
          challengeObj.userProgress = {
            progress: userParticipant.progress || 0,
            points: userParticipant.points || 0,
            challengeCompleted: false,
            pointsLost: userParticipant.pointsLost
          };
        }
      }
      
      categorized.expired.push(challengeObj);
    }
    // Upcoming - starts tomorrow or future (ONLY for admin, not for regular users)
    else if (challenge.status === 'upcoming' && (isTomorrow || startDate > tomorrow)) {
      // Only show upcoming to admin/HR, hide from regular employees
      if (req.user.role === 'admin' || req.user.role === 'hr') {
        challengeObj.category = 'upcoming';
        categorized.upcoming.push(challengeObj);
      }
      // Regular users don't see upcoming challenges
    }
    // Today's Challenge - all active challenges (24hr, not expired, not completed)
    else if (challenge.status === 'active' && isCurrentlyActive && !isExpired) {
      // Check if challenge is within 24 hours (daily challenge)
      if (expiresAt && expiresAt >= currentTime) {
        challengeObj.category = 'today';
        challengeObj.isExpired = false;
        challengeObj.timeRemaining = Math.max(0, expiresAt - currentTime);
        if (userParticipant) {
          challengeObj.userProgress = {
            progress: userParticipant.progress || 0,
            points: userParticipant.points || 0,
            challengeCompleted: userParticipant.challengeCompleted || false,
            pointsLost: userParticipant.pointsLost || 0
          };
        }
        categorized.today.push(challengeObj);
      } else if (expiresAt && expiresAt < currentTime) {
        // Challenge expired (past 24 hours) - move to expired
        challengeObj.category = 'expired';
        challengeObj.isExpired = true;
        if (userParticipant && !userParticipant.challengeCompleted) {
          challengeObj.userProgress = {
            progress: userParticipant.progress || 0,
            points: userParticipant.points || 0,
            challengeCompleted: false,
            pointsLost: userParticipant.pointsLost || 0
          };
        }
        categorized.expired.push(challengeObj);
      }
    }
  }

  // Process expired challenges and deduct points
  if (expiredChallengesToUpdate.length > 0) {
    const user = await User.findById(req.user.id);
    let totalPointsDeducted = 0;

    for (const update of expiredChallengesToUpdate) {
      const challenge = await Challenge.findById(update.challengeId);
      if (challenge && challenge.participants[update.participantIndex]) {
        challenge.participants[update.participantIndex].pointsLost = update.pointsToDeduct;
        await challenge.save();
        totalPointsDeducted += update.pointsToDeduct;
      }
    }

    if (totalPointsDeducted > 0) {
      user.wellnessProfile.totalPoints = Math.max(0, user.wellnessProfile.totalPoints - totalPointsDeducted);
      await user.save();
    }
  }

  res.json({
    success: true,
    data: {
      today: categorized.today,
      upcoming: categorized.upcoming,
      expired: categorized.expired,
      completed: categorized.completed
    }
  });
});

// @desc    Get single challenge
// @route   GET /api/challenges/:id
// @access  Private
exports.getChallenge = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findById(req.params.id)
    .populate('participants.user', 'name email wellnessProfile')
    .populate('createdBy', 'name email')
    .populate('rewards.firstPlace.badge');

  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    });
  }

  res.json({
    success: true,
    data: challenge
  });
});

// @desc    Create challenge
// @route   POST /api/challenges
// @access  Private (Admin/HR)
exports.createChallenge = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    type,
    startDate,
    endDate,
    rules,
    isTeamChallenge,
    maxParticipants,
    rewards
  } = req.body;

  // Check daily limit: Admin can only create 1 challenge per day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayChallenge = await Challenge.findOne({
    createdBy: req.user.id,
    createdAt: {
      $gte: today,
      $lt: tomorrow
    }
  });

  if (todayChallenge) {
    return res.status(400).json({
      success: false,
      message: 'You can only create 1 challenge per day. Please create the next challenge for tomorrow or later.'
    });
  }

  // Parse start date
  const start = new Date(startDate);
  const now = new Date();
  
  // If start date is today, make it active and set 24hr expiration
  // If start date is future, make it upcoming
  let expiresAt = null;
  let status = 'upcoming';
  
  if (start.toDateString() === today.toDateString()) {
    // Challenge for today - active for 24 hours
    expiresAt = new Date(now);
    expiresAt.setHours(expiresAt.getHours() + 24);
    status = 'active';
  } else if (start > now) {
    // Challenge for future - upcoming
    status = 'upcoming';
    expiresAt = new Date(start);
    expiresAt.setHours(expiresAt.getHours() + 24);
  } else {
    // Challenge for past - set as active with 24hr from now
    expiresAt = new Date(now);
    expiresAt.setHours(expiresAt.getHours() + 24);
    status = 'active';
  }

  const challenge = await Challenge.create({
    name,
    description,
    type,
    startDate: start,
    endDate: new Date(endDate),
    rules,
    isTeamChallenge,
    maxParticipants,
    rewards,
    isDailyChallenge: true, // All challenges are daily (24hr)
    expiresAt,
    createdBy: req.user.id,
    status
  });

  res.status(201).json({
    success: true,
    data: challenge
  });
});

// @desc    Join challenge
// @route   POST /api/challenges/:id/join
// @access  Private
exports.joinChallenge = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findById(req.params.id);

  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    });
  }

  if (challenge.status === 'completed' || challenge.status === 'cancelled') {
    return res.status(400).json({
      success: false,
      message: 'Cannot join a completed or cancelled challenge'
    });
  }

  // Check if user already has an active challenge of same type today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingChallenge = await Challenge.findOne({
    type: challenge.type,
    status: 'active',
    startDate: { $lte: tomorrow },
    endDate: { $gte: today },
    'participants.user': req.user.id
  });

  if (existingChallenge && existingChallenge._id.toString() !== challenge._id.toString()) {
    return res.status(400).json({
      success: false,
      message: `You already have an active ${challenge.type} challenge today. Only one challenge per day is allowed.`
    });
  }

  try {
    challenge.addParticipant(req.user.id);
    await challenge.save();

    // Award participation points if configured
    if (challenge.rewards.participation.points > 0) {
      const user = await User.findById(req.user.id);
      user.addPoints(challenge.rewards.participation.points);
      await user.save();
    }

    res.json({
      success: true,
      message: 'Successfully joined challenge',
      data: challenge
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Leave challenge
// @route   DELETE /api/challenges/:id/leave
// @access  Private
exports.leaveChallenge = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findById(req.params.id);

  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    });
  }

  const participantIndex = challenge.participants.findIndex(
    p => p.user.toString() === req.user.id.toString()
  );

  if (participantIndex === -1) {
    return res.status(400).json({
      success: false,
      message: 'You are not a participant in this challenge'
    });
  }

  challenge.participants.splice(participantIndex, 1);
  await challenge.save();

  res.json({
    success: true,
    message: 'Successfully left challenge'
  });
});

// @desc    Get challenge leaderboard
// @route   GET /api/challenges/:id/leaderboard
// @access  Private
exports.getChallengeLeaderboard = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findById(req.params.id)
    .populate('participants.user', 'name email department');

  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    });
  }

  const leaderboard = challenge.getLeaderboard();

  res.json({
    success: true,
    data: {
      challenge: {
        id: challenge._id,
        name: challenge.name,
        type: challenge.type
      },
      leaderboard
    }
  });
});

// @desc    Get my progress in challenge
// @route   GET /api/challenges/:id/my-progress
// @access  Private
exports.getMyProgress = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findById(req.params.id);

  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    });
  }

  const participant = challenge.participants.find(
    p => p.user.toString() === req.user.id.toString()
  );

  if (!participant) {
    return res.status(404).json({
      success: false,
      message: 'You are not a participant in this challenge'
    });
  }

  const todayProgress = challenge.getTodayProgress(req.user.id);

  res.json({
    success: true,
    data: {
      challenge: {
        id: challenge._id,
        name: challenge.name,
        type: challenge.type,
        targetValue: challenge.rules.targetValue,
        unit: challenge.rules.unit
      },
      totalProgress: participant.progress,
      totalPoints: participant.points,
      totalDaysCompleted: participant.totalDaysCompleted,
      todayProgress: todayProgress,
      joinedAt: participant.joinedAt
    }
  });
});

// @desc    Update challenge
// @route   PUT /api/challenges/:id
// @access  Private (Admin/HR)
exports.updateChallenge = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findById(req.params.id);

  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    });
  }

  const {
    name,
    description,
    startDate,
    endDate,
    rules,
    status,
    rewards
  } = req.body;

  if (name) challenge.name = name;
  if (description) challenge.description = description;
  if (startDate) challenge.startDate = startDate;
  if (endDate) challenge.endDate = endDate;
  if (rules) challenge.rules = rules;
  if (status) challenge.status = status;
  if (rewards) challenge.rewards = rewards;

  await challenge.save();

  res.json({
    success: true,
    data: challenge
  });
});

// @desc    Delete challenge
// @route   DELETE /api/challenges/:id
// @access  Private (Admin/HR)
exports.deleteChallenge = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findById(req.params.id);

  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    });
  }

  await challenge.deleteOne();

  res.json({
    success: true,
    message: 'Challenge deleted successfully'
  });
});

