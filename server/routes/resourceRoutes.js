const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, resourceController.getResources);
router.get('/:id', protect, resourceController.getResource);
router.post('/', protect, authorize('admin', 'hr'), resourceController.createResource);
router.put('/:id', protect, authorize('admin', 'hr'), resourceController.updateResource);
router.delete('/:id', protect, authorize('admin', 'hr'), resourceController.deleteResource);
router.post('/:id/access', protect, resourceController.trackAccess);
router.post('/:id/rating', protect, resourceController.rateResource);
router.post('/check-in', resourceController.anonymousCheckIn);

module.exports = router;

