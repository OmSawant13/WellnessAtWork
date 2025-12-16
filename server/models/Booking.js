const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionType: {
    type: String,
    enum: ['yoga', 'meditation', 'counseling', 'webinar', 'fitness', 'nutrition', 'wellness-coaching'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a session title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  instructor: {
    type: String,
    trim: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  location: {
    type: String,
    enum: ['online', 'onsite', 'hybrid'],
    default: 'online'
  },
  meetingLink: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ user: 1, scheduledDate: 1 });
bookingSchema.index({ scheduledDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ sessionType: 1 });

// Validation: scheduledDate must be in the future
bookingSchema.pre('save', function(next) {
  if (this.isNew && this.scheduledDate < new Date()) {
    return next(new Error('Scheduled date must be in the future'));
  }
  next();
});

// Method to cancel booking
bookingSchema.methods.cancel = function(userId, reason) {
  if (this.status === 'cancelled') {
    throw new Error('Booking is already cancelled');
  }
  
  if (this.status === 'completed') {
    throw new Error('Cannot cancel a completed booking');
  }
  
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancelledBy = userId;
  this.cancellationReason = reason;
};

module.exports = mongoose.model('Booking', bookingSchema);

