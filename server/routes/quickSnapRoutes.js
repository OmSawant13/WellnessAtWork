const express = require('express');
const router = express.Router();
const quickSnapController = require('../controllers/quickSnapController');
const { protect } = require('../middleware/auth');

router.post('/', protect, quickSnapController.startQuickSnap);
router.put('/:id/complete', protect, quickSnapController.completeQuickSnap);
router.get('/', protect, quickSnapController.getMyQuickSnaps);
router.get('/types', protect, quickSnapController.getQuickSnapTypes);

module.exports = router;

