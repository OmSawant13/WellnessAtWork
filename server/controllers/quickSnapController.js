const QuickSnap = require('../models/QuickSnap');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Start quick snap
// @route   POST /api/quick-snaps
// @access  Private
exports.startQuickSnap = asyncHandler(async (req, res) => {
  const { type, duration } = req.body;

  if (!type) {
    return res.status(400).json({
      success: false,
      message: 'Please provide snap type'
    });
  }

  const snap = await QuickSnap.create({
    user: req.user.id,
    type,
    duration: duration || 60
  });

  res.status(201).json({
    success: true,
    data: snap
  });
});

// @desc    Complete quick snap
// @route   PUT /api/quick-snaps/:id/complete
// @access  Private
exports.completeQuickSnap = asyncHandler(async (req, res) => {
  const snap = await QuickSnap.findById(req.params.id);

  if (!snap) {
    return res.status(404).json({
      success: false,
      message: 'Quick snap not found'
    });
  }

  if (snap.user.toString() !== req.user.id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only complete your own snaps'
    });
  }

  if (snap.completed) {
    return res.status(400).json({
      success: false,
      message: 'Snap already completed'
    });
  }

  snap.completed = true;
  snap.completedAt = new Date();
  snap.shared = req.body.shared || false;

  // Award points
  const user = await User.findById(req.user.id);
  user.addPoints(snap.points);
  user.updateStreak();
  await user.save();

  res.json({
    success: true,
    data: snap
  });
});

// @desc    Get my quick snaps
// @route   GET /api/quick-snaps
// @access  Private
exports.getMyQuickSnaps = asyncHandler(async (req, res) => {
  const snaps = await QuickSnap.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    success: true,
    data: snaps
  });
});

// @desc    Get quick snap types
// @route   GET /api/quick-snaps/types
// @access  Private
exports.getQuickSnapTypes = asyncHandler(async (req, res) => {
  const types = [
    {
      type: 'breathing',
      name: 'Breathing Exercise',
      duration: 60,
      description: '1-minute breathing exercise for calm',
      icon: '🧘'
    },
    {
      type: 'stretch',
      name: 'Quick Stretch',
      duration: 120,
      description: '2-minute desk stretch',
      icon: '🤸'
    },
    {
      type: 'focus',
      name: 'Focus Boost',
      duration: 180,
      description: '3-minute focus exercise',
      icon: '🎯'
    },
    {
      type: 'energy',
      name: 'Energy Boost',
      duration: 120,
      description: '2-minute energy exercise',
      icon: '⚡'
    },
    {
      type: 'meditation',
      name: 'Quick Meditation',
      duration: 300,
      description: '5-minute meditation',
      icon: '🧘‍♀️'
    },
    {
      type: 'desk_workout',
      name: 'Desk Workout',
      duration: 180,
      description: '3-minute desk workout',
      icon: '💪'
    }
  ];

  res.json({
    success: true,
    data: types
  });
});

