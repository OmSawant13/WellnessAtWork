const express = require('express');
const router = express.Router();
const battleController = require('../controllers/battleController');
const { protect } = require('../middleware/auth');

router.post('/', protect, battleController.createBattle);
router.get('/', protect, battleController.getMyBattles);
router.put('/:id/respond', protect, battleController.respondToBattle);
router.put('/:id/progress', protect, battleController.updateBattleProgress);

module.exports = router;

