const User = require('../models/User');
const Activity = require('../models/Activity');
const Challenge = require('../models/Challenge');
const Booking = require('../models/Booking');
const MentalHealthResource = require('../models/MentalHealthResource');
const Reward = require('../models/Reward');
const Team = require('../models/Team');
const asyncHandler = require('../middleware/asyncHandler');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');

// @desc    Get wellness analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin/HR)
exports.getAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  // User statistics
  const totalUsers = await User.countDocuments({ role: 'employee' });
  const activeUsers = await User.countDocuments({
    role: 'employee',
    isActive: true,
    'wellnessProfile.lastActivityDate': {
      $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  });

  // Activity statistics
  const activityFilter = { ...dateFilter };
  const totalActivities = await Activity.countDocuments(activityFilter);
  const totalPoints = await Activity.aggregate([
    { $match: activityFilter },
    { $group: { _id: null, total: { $sum: '$points' } } }
  ]);

  // Challenge statistics
  const challengeFilter = { ...dateFilter };
  const totalChallenges = await Challenge.countDocuments(challengeFilter);
  const activeChallenges = await Challenge.countDocuments({
    ...challengeFilter,
    status: 'active'
  });

  // Activity by type
  const activitiesByType = await Activity.aggregate([
    { $match: activityFilter },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalPoints: { $sum: '$points' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Top performers
  const topPerformers = await User.find({ role: 'employee' })
    .select('name email wellnessProfile department')
    .sort({ 'wellnessProfile.totalPoints': -1 })
    .limit(10);

  // Booking statistics
  const bookingFilter = { ...dateFilter };
  const totalBookings = await Booking.countDocuments(bookingFilter);
  const bookingsByType = await Booking.aggregate([
    { $match: bookingFilter },
    {
      $group: {
        _id: '$sessionType',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
        activePercentage: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : 0
      },
      activities: {
        total: totalActivities,
        totalPoints: totalPoints[0]?.total || 0,
        byType: activitiesByType
      },
      challenges: {
        total: totalChallenges,
        active: activeChallenges
      },
      bookings: {
        total: totalBookings,
        byType: bookingsByType
      },
      topPerformers
    }
  });
});

// @desc    Generate wellness report
// @route   GET /api/admin/reports
// @access  Private (Admin/HR)
exports.generateReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, format = 'json' } = req.query;

  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  const report = {
    generatedAt: new Date(),
    period: {
      startDate: startDate || null,
      endDate: endDate || null
    },
    summary: {
      totalUsers: await User.countDocuments({ role: 'employee' }),
      totalActivities: await Activity.countDocuments(dateFilter),
      totalChallenges: await Challenge.countDocuments(dateFilter),
      totalBookings: await Booking.countDocuments(dateFilter)
    },
    participation: {
      activeUsers: await User.countDocuments({
        role: 'employee',
        'wellnessProfile.lastActivityDate': {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      })
    }
  };

  res.json({
    success: true,
    data: report
  });
});

// @desc    Export data as CSV
// @route   GET /api/admin/export/csv
// @access  Private (Admin/HR)
exports.exportCSV = asyncHandler(async (req, res) => {
  const { type = 'activities', startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  let data = [];
  let filename = 'export.csv';

  if (type === 'activities') {
    const activities = await Activity.find(dateFilter)
      .populate('user', 'name email')
      .populate('challenge', 'name');

    data = activities.map(activity => ({
      Date: activity.activityDate.toISOString().split('T')[0],
      User: activity.user.name,
      Email: activity.user.email,
      Type: activity.type,
      Value: activity.value,
      Unit: activity.unit,
      Points: activity.points,
      Challenge: activity.challenge?.name || 'N/A'
    }));

    filename = `activities_${Date.now()}.csv`;
  } else if (type === 'users') {
    const users = await User.find({ role: 'employee' })
      .select('name email department wellnessProfile');

    data = users.map(user => ({
      Name: user.name,
      Email: user.email,
      Department: user.department || 'N/A',
      TotalPoints: user.wellnessProfile.totalPoints,
      CurrentStreak: user.wellnessProfile.currentStreak,
      LongestStreak: user.wellnessProfile.longestStreak,
      Level: user.wellnessProfile.level
    }));

    filename = `users_${Date.now()}.csv`;
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // Simple CSV generation
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    res.write(headers.join(',') + '\n');
    data.forEach(row => {
      res.write(headers.map(header => `"${row[header] || ''}"`).join(',') + '\n');
    });
  }

  res.end();
});

// @desc    Export data as PDF
// @route   GET /api/admin/export/pdf
// @access  Private (Admin/HR)
exports.exportPDF = asyncHandler(async (req, res) => {
  const { type = 'summary' } = req.query;

  const doc = new PDFDocument();
  const filename = `wellness_report_${Date.now()}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  doc.pipe(res);

  doc.fontSize(20).text('WellnessAtWork Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown(2);

  if (type === 'summary') {
    const totalUsers = await User.countDocuments({ role: 'employee' });
    const totalActivities = await Activity.countDocuments();
    const totalChallenges = await Challenge.countDocuments({ status: 'active' });

    doc.fontSize(16).text('Summary Statistics');
    doc.moveDown();
    doc.fontSize(12).text(`Total Users: ${totalUsers}`);
    doc.text(`Total Activities: ${totalActivities}`);
    doc.text(`Active Challenges: ${totalChallenges}`);
  }

  doc.end();
});

// @desc    Get participation statistics
// @route   GET /api/admin/participation
// @access  Private (Admin/HR)
exports.getParticipationStats = asyncHandler(async (req, res) => {
  const { challengeId, startDate, endDate } = req.query;

  let participationData = {};

  if (challengeId) {
    const challenge = await Challenge.findById(challengeId)
      .populate('participants.user', 'name email department');

    participationData = {
      challenge: {
        id: challenge._id,
        name: challenge.name,
        type: challenge.type
      },
      totalParticipants: challenge.participants.length,
      participants: challenge.participants.map(p => ({
        user: p.user,
        progress: p.progress,
        points: p.points
      }))
    };
  } else {
    const challenges = await Challenge.find({ status: 'active' });
    const users = await User.find({ role: 'employee' });

    participationData = {
      totalChallenges: challenges.length,
      totalUsers: users.length,
      averageParticipation: challenges.length > 0
        ? (challenges.reduce((sum, c) => sum + c.participants.length, 0) / challenges.length).toFixed(2)
        : 0
    };
  }

  res.json({
    success: true,
    data: participationData
  });
});

// @desc    Get team leaderboard
// @route   GET /api/admin/team-leaderboard
// @access  Private (Admin/HR)
exports.getTeamLeaderboard = asyncHandler(async (req, res) => {
  const teams = await Team.find({ isActive: true })
    .populate('members.user', 'name email wellnessProfile')
    .sort({ 'stats.totalPoints': -1 });

  const leaderboard = teams.map(team => ({
    team: {
      id: team._id,
      name: team.name,
      department: team.department
    },
    stats: team.stats,
    memberCount: team.members.length
  }));

  res.json({
    success: true,
    data: leaderboard
  });
});

// @desc    Get user activities (admin view)
// @route   GET /api/admin/user-activities
// @access  Private (Admin/HR)
exports.getUserActivities = asyncHandler(async (req, res) => {
  const { userId, startDate, endDate, limit = 100 } = req.query;
  const query = {};

  if (userId) query.user = userId;
  if (startDate || endDate) {
    query.activityDate = {};
    if (startDate) query.activityDate.$gte = new Date(startDate);
    if (endDate) query.activityDate.$lte = new Date(endDate);
  }

  const activities = await Activity.find(query)
    .populate('user', 'name email department')
    .populate('challenge', 'name type')
    .sort({ activityDate: -1 })
    .limit(parseInt(limit));

  res.json({
    success: true,
    count: activities.length,
    data: activities
  });
});

// @desc    Get all users (admin view)
// @route   GET /api/admin/users
// @access  Private (Admin/HR)
exports.getUsers = asyncHandler(async (req, res) => {
  const { department, search, limit = 100 } = req.query;
  const query = { role: 'employee' };

  if (department) query.department = department;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('name email department employeeId wellnessProfile isActive')
    .sort({ 'wellnessProfile.totalPoints': -1 })
    .limit(parseInt(limit));

  res.json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Get user challenges (admin view)
// @route   GET /api/admin/user-challenges
// @access  Private (Admin/HR)
exports.getUserChallenges = asyncHandler(async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  const challenges = await Challenge.find({
    'participants.user': userId
  })
    .populate('participants.user', 'name email')
    .select('name description type status startDate endDate rules participants rewards');

  const userChallenges = challenges.map(challenge => {
    const participant = challenge.participants.find(
      p => p.user._id.toString() === userId.toString()
    );
    return {
      ...challenge.toObject(),
      participant: participant ? {
        progress: participant.progress,
        points: participant.points,
        joinedAt: participant.joinedAt
      } : null
    };
  });

  res.json({
    success: true,
    count: userChallenges.length,
    data: userChallenges
  });
});

// @desc    Get department analytics
// @route   GET /api/admin/department-analytics
// @access  Private (Admin/HR)
exports.getDepartmentAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  // Get all departments
  const departments = await User.distinct('department', { role: 'employee', department: { $ne: null } });

  const departmentStats = await Promise.all(
    departments.map(async (department) => {
      const users = await User.find({ role: 'employee', department });
      const userIds = users.map(u => u._id);

      const activities = await Activity.find({
        user: { $in: userIds },
        ...dateFilter
      });

      const totalPoints = activities.reduce((sum, a) => sum + a.points, 0);
      const avgPoints = users.length > 0 ? totalPoints / users.length : 0;
      const activeUsers = users.filter(u => 
        u.wellnessProfile.lastActivityDate &&
        new Date(u.wellnessProfile.lastActivityDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length;

      return {
        department,
        totalUsers: users.length,
        activeUsers,
        totalActivities: activities.length,
        totalPoints,
        avgPoints: Math.round(avgPoints),
        avgStreak: users.length > 0
          ? Math.round(users.reduce((sum, u) => sum + (u.wellnessProfile.currentStreak || 0), 0) / users.length)
          : 0
      };
    })
  );

  res.json({
    success: true,
    data: departmentStats.sort((a, b) => b.totalPoints - a.totalPoints)
  });
});

// @desc    Assign challenge to department
// @route   POST /api/admin/challenges/:id/assign-department
// @access  Private (Admin/HR)
exports.assignChallengeToDepartment = asyncHandler(async (req, res) => {
  const { department } = req.body;
  const challenge = await Challenge.findById(req.params.id);

  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    });
  }

  const users = await User.find({ role: 'employee', department });

  for (const user of users) {
    try {
      challenge.addParticipant(user._id);
    } catch (error) {
      // User already participant, skip
    }
  }

  await challenge.save();

  res.json({
    success: true,
    message: `Challenge assigned to ${users.length} users in ${department}`,
    data: {
      challenge: challenge._id,
      department,
      assignedUsers: users.length
    }
  });
});

// @desc    Assign challenge to specific users
// @route   POST /api/admin/challenges/:id/assign-users
// @access  Private (Admin/HR)
exports.assignChallengeToUsers = asyncHandler(async (req, res) => {
  const { userIds } = req.body;
  const challenge = await Challenge.findById(req.params.id);

  if (!challenge) {
    return res.status(404).json({
      success: false,
      message: 'Challenge not found'
    });
  }

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'User IDs array is required'
    });
  }

  let assigned = 0;
  let skipped = 0;

  for (const userId of userIds) {
    try {
      challenge.addParticipant(userId);
      assigned++;
    } catch (error) {
      skipped++;
    }
  }

  await challenge.save();

  res.json({
    success: true,
    message: `Challenge assigned to ${assigned} users`,
    data: {
      challenge: challenge._id,
      assigned,
      skipped
    }
  });
});


