const Booking = require('../models/Booking');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Book session
// @route   POST /api/bookings
// @access  Private
exports.bookSession = asyncHandler(async (req, res) => {
  const {
    sessionType,
    title,
    description,
    instructor,
    scheduledDate,
    duration,
    location,
    meetingLink,
    notes
  } = req.body;

  // Validate scheduled date is in future
  if (new Date(scheduledDate) < new Date()) {
    return res.status(400).json({
      success: false,
      message: 'Scheduled date must be in the future'
    });
  }

  const booking = await Booking.create({
    user: req.user.id,
    sessionType,
    title,
    description,
    instructor,
    scheduledDate,
    duration,
    location,
    meetingLink,
    notes,
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    data: booking
  });
});

// @desc    Get my bookings
// @route   GET /api/bookings
// @access  Private
exports.getMyBookings = asyncHandler(async (req, res) => {
  const { status, upcoming } = req.query;
  const query = { user: req.user.id };

  if (status) query.status = status;
  if (upcoming === 'true') {
    query.scheduledDate = { $gte: new Date() };
  }

  const bookings = await Booking.find(query)
    .sort({ scheduledDate: 1 });

  res.json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings/all
// @access  Private (Admin/HR)
exports.getAllBookings = asyncHandler(async (req, res) => {
  const { status, sessionType, startDate, endDate } = req.query;
  const query = {};

  if (status) query.status = status;
  if (sessionType) query.sessionType = sessionType;
  if (startDate || endDate) {
    query.scheduledDate = {};
    if (startDate) query.scheduledDate.$gte = new Date(startDate);
    if (endDate) query.scheduledDate.$lte = new Date(endDate);
  }

  const bookings = await Booking.find(query)
    .populate('user', 'name email department')
    .sort({ scheduledDate: 1 });

  res.json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'name email');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check ownership or admin
  if (booking.user._id.toString() !== req.user.id.toString() && 
      !['admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this booking'
    });
  }

  res.json({
    success: true,
    data: booking
  });
});

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check ownership or admin
  if (booking.user.toString() !== req.user.id.toString() && 
      !['admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this booking'
    });
  }

  const {
    sessionType,
    title,
    description,
    instructor,
    scheduledDate,
    duration,
    location,
    meetingLink,
    status,
    notes
  } = req.body;

  if (sessionType) booking.sessionType = sessionType;
  if (title) booking.title = title;
  if (description) booking.description = description;
  if (instructor) booking.instructor = instructor;
  if (scheduledDate) booking.scheduledDate = scheduledDate;
  if (duration) booking.duration = duration;
  if (location) booking.location = location;
  if (meetingLink) booking.meetingLink = meetingLink;
  if (status) booking.status = status;
  if (notes !== undefined) booking.notes = notes;

  await booking.save();

  res.json({
    success: true,
    data: booking
  });
});

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check ownership or admin
  if (booking.user.toString() !== req.user.id.toString() && 
      !['admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this booking'
    });
  }

  const { reason } = req.body;

  booking.cancel(req.user.id, reason);
  await booking.save();

  res.json({
    success: true,
    message: 'Booking cancelled successfully',
    data: booking
  });
});

