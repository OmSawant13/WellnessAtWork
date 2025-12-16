const express = require('express');
const router = express.Router();
const lootBoxController = require('../controllers/lootBoxController');
const { protect } = require('../middleware/auth');

router.post('/open', protect, lootBoxController.openLootBox);
router.get('/', protect, lootBoxController.getMyLootBoxes);
router.get('/check', protect, lootBoxController.checkLootBox);

module.exports = router;

