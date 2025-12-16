const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.get('/leaderboard', protect, userController.getLeaderboard);
router.get('/badges', protect, userController.getBadges);
router.get('/activity-summary', protect, userController.getActivitySummary);
router.get('/stats', protect, userController.getStats);

module.exports = router;

