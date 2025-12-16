const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, rewardController.getRewards);
router.get('/:id', protect, rewardController.getReward);
router.post('/', protect, authorize('admin', 'hr'), rewardController.createReward);
router.put('/:id', protect, authorize('admin', 'hr'), rewardController.updateReward);
router.delete('/:id', protect, authorize('admin', 'hr'), rewardController.deleteReward);
router.post('/:id/claim', protect, rewardController.claimReward);
router.get('/my/redemptions', protect, rewardController.getMyRedemptions);

module.exports = router;


