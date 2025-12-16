const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.array('photos', 10), activityController.logActivity);
router.get('/', protect, activityController.getMyActivities);
router.get('/all', protect, authorize('admin', 'hr'), activityController.getAllActivities);
router.get('/unverified', protect, authorize('admin', 'hr'), activityController.getUnverifiedActivities);
router.get('/:id', protect, activityController.getActivity);
router.put('/:id', protect, activityController.updateActivity);
router.delete('/:id', protect, activityController.deleteActivity);
router.post('/:id/verify', protect, authorize('admin', 'hr'), activityController.verifyActivity);
router.post('/:id/reject', protect, authorize('admin', 'hr'), activityController.rejectActivity);

module.exports = router;

