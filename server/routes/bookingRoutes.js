const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, bookingController.bookSession);
router.get('/', protect, bookingController.getMyBookings);
router.get('/all', protect, authorize('admin', 'hr'), bookingController.getAllBookings);
router.get('/:id', protect, bookingController.getBooking);
router.put('/:id', protect, bookingController.updateBooking);
router.delete('/:id', protect, bookingController.cancelBooking);

module.exports = router;

