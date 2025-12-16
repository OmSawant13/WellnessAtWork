const User = require('../models/User');
const Activity = require('../models/Activity');
const Challenge = require('../models/Challenge');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('wellnessProfile.badges')
    .populate('team');

  res.json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, department, employeeId } = req.body;

  const user = await User.findById(req.user.id);

  if (name) user.name = name;
  if (department) user.department = department;
  if (employeeId) user.employeeId = employeeId;

  await user.save();

  res.json({
    success: true,
    data: user
  });
});

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Private
exports.getLeaderboard = asyncHandler(async (req, res) => {
  const { type = 'overall', limit = 50 } = req.query;

  let leaderboard;

  if (type === 'team') {
    const Team = require('../models/Team');
    leaderboard = await Team.find({ isActive: true })
      .populate('members.user', 'name email wellnessProfile')
      .sort({ 'stats.totalPoints': -1 })
      .limit(parseInt(limit));
  } else {
    leaderboard = await User.find({ isActive: true, role: 'employee' })
      .select('name email wellnessProfile department')
      .populate('team', 'name')
      .sort({ 'wellnessProfile.totalPoints': -1 })
      .limit(parseInt(limit));
  }

  res.json({
    success: true,
    data: leaderboard
  });
});

// @desc    Get user badges
// @route   GET /api/users/badges
// @access  Private
exports.getBadges = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('wellnessProfile.badges');

  res.json({
    success: true,
    data: user.wellnessProfile.badges
  });
});

// @desc    Get activity summary
// @route   GET /api/users/activity-summary
// @access  Private
exports.getActivitySummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const query = { user: req.user.id };

  if (startDate || endDate) {
    query.activityDate = {};
    if (startDate) query.activityDate.$gte = new Date(startDate);
    if (endDate) query.activityDate.$lte = new Date(endDate);
  }

  const activities = await Activity.find(query).sort({ activityDate: -1 });

  const summary = {
    totalActivities: activities.length,
    totalPoints: activities.reduce((sum, act) => sum + act.points, 0),
    byType: {},
    byDate: {}
  };

  activities.forEach(activity => {
    // By type
    summary.byType[activity.type] = (summary.byType[activity.type] || 0) + 1;

    // By date
    const date = activity.activityDate.toISOString().split('T')[0];
    if (!summary.byDate[date]) {
      summary.byDate[date] = { count: 0, points: 0 };
    }
    summary.byDate[date].count += 1;
    summary.byDate[date].points += activity.points;
  });

  res.json({
    success: true,
    data: summary
  });
});

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
exports.getStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  const totalActivities = await Activity.countDocuments({ user: req.user.id });
  const activeChallenges = await Challenge.countDocuments({
    'participants.user': req.user.id,
    status: 'active'
  });
  
  const recentActivities = await Activity.find({ user: req.user.id })
    .sort({ activityDate: -1 })
    .limit(5);

  // Get current month and week data
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlyEntry = user.wellnessProfile.monthlyPoints.find(m => m.month === monthKey);
  
  const weekKey = user.getWeekKey(now);
  const weeklyEntry = user.wellnessProfile.weeklyYoga.find(w => w.week === weekKey);
  const yogaWarning = user.checkYogaWarning();

  res.json({
    success: true,
    data: {
      wellnessProfile: user.wellnessProfile,
      totalActivities,
      activeChallenges,
      recentActivities,
      monthlyProgress: monthlyEntry ? {
        month: monthlyEntry.month,
        points: monthlyEntry.points,
        targetPoints: monthlyEntry.targetPoints,
        counselingRequired: monthlyEntry.counselingRequired,
        remaining: Math.max(0, monthlyEntry.targetPoints - monthlyEntry.points)
      } : null,
      weeklyYoga: weeklyEntry ? {
        week: weeklyEntry.week,
        sessions: weeklyEntry.sessions,
        targetSessions: weeklyEntry.targetSessions,
        remaining: Math.max(0, weeklyEntry.targetSessions - weeklyEntry.sessions)
      } : null,
      yogaWarning: yogaWarning.warning ? {
        warning: true,
        message: `⚠️ You have ${yogaWarning.daysRemaining} days left to complete ${yogaWarning.sessionsNeeded} yoga session(s). This carries ${yogaWarning.points} points!`,
        daysRemaining: yogaWarning.daysRemaining,
        sessionsNeeded: yogaWarning.sessionsNeeded,
        points: yogaWarning.points
      } : null,
      healthStatus: user.wellnessProfile.healthStatus,
      streak: {
        current: user.wellnessProfile.currentStreak || 0,
        longest: user.wellnessProfile.longestStreak || 0,
        fire: (() => {
          const streak = user.wellnessProfile.currentStreak || 0;
          if (streak >= 30) return '🔥🔥🔥🔥🔥';
          if (streak >= 14) return '🔥🔥🔥🔥';
          if (streak >= 7) return '🔥🔥🔥';
          if (streak >= 3) return '🔥🔥';
          if (streak >= 1) return '🔥';
          return '';
        })()
      }
    }
  });
});

