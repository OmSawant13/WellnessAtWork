const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, challengeController.getChallenges);
router.get('/:id', protect, challengeController.getChallenge);
router.get('/:id/my-progress', protect, challengeController.getMyProgress);
router.post('/', protect, authorize('admin', 'hr'), challengeController.createChallenge);
router.post('/:id/join', protect, challengeController.joinChallenge);
router.delete('/:id/leave', protect, challengeController.leaveChallenge);
router.get('/:id/leaderboard', protect, challengeController.getChallengeLeaderboard);
router.put('/:id', protect, authorize('admin', 'hr'), challengeController.updateChallenge);
router.delete('/:id', protect, authorize('admin', 'hr'), challengeController.deleteChallenge);

module.exports = router;

