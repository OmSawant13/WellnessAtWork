const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin or hr role
router.use(protect);
router.use(authorize('admin', 'hr'));

router.get('/analytics', adminController.getAnalytics);
router.get('/reports', adminController.generateReport);
router.get('/export/csv', adminController.exportCSV);
router.get('/export/pdf', adminController.exportPDF);
router.get('/participation', adminController.getParticipationStats);
router.get('/team-leaderboard', adminController.getTeamLeaderboard);
router.get('/user-activities', adminController.getUserActivities);
router.get('/users', adminController.getUsers);
router.get('/user-challenges', adminController.getUserChallenges);
router.get('/department-analytics', adminController.getDepartmentAnalytics);
router.post('/challenges/:id/assign-department', adminController.assignChallengeToDepartment);
router.post('/challenges/:id/assign-users', adminController.assignChallengeToUsers);

module.exports = router;


