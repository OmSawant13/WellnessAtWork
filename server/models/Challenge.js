const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a challenge name'],
    trim: true,
    maxlength: [100, 'Challenge name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a challenge description'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['steps', 'meditation', 'workout', 'hydration', 'sleep', 'yoga', 'walking', 'running', 'cycling', 'nutrition', 'healthy-eating', 'custom'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  isDailyChallenge: {
    type: Boolean,
    default: true // Challenges are daily by default (24 hours)
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default: expires 24 hours from start date
      const expiry = new Date(this.startDate);
      expiry.setHours(expiry.getHours() + 24);
      return expiry;
    }
  },
  rules: {
    targetValue: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['steps', 'minutes', 'sessions', 'glasses', 'hours', 'km', 'meals', 'servings', 'items'],
      required: true
    },
    pointMultiplier: {
      type: Number,
      default: 1
    },
    requiresPhoto: {
      type: Boolean,
      default: false // Admin can enable photo requirement per challenge
    },
    photoRequired: {
      type: Boolean,
      default: false // Alias for requiresPhoto
    },
    minPhotos: {
      type: Number,
      default: 1 // Minimum number of photos required
    },
    maxPhotos: {
      type: Number,
      default: 1 // Maximum number of photos allowed (null = unlimited)
    },
    minPhotos: {
      type: Number,
      default: 1 // Minimum photos required (e.g., 2 for before/after)
    },
    maxPhotos: {
      type: Number,
      default: 5 // Maximum photos allowed
    },
    timeGap: {
      type: Number, // For hydration: gap between glasses in hours
      default: null // e.g., 2 hours for 8 glasses challenge
    }
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0
    },
    points: {
      type: Number,
      default: 0
    },
    dailyProgress: [{
      date: {
        type: Date,
        required: true
      },
      value: {
        type: Number,
        default: 0
      },
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: Date
    }],
    totalDaysCompleted: {
      type: Number,
      default: 0
    },
    challengeCompleted: {
      type: Boolean,
      default: false
    },
    challengeCompletedAt: Date,
    pointsLost: {
      type: Number,
      default: 0
    }
  }],
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  isTeamChallenge: {
    type: Boolean,
    default: false
  },
  maxParticipants: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'expired', 'cancelled'],
    default: 'upcoming'
  },
  rewards: {
    firstPlace: {
      points: {
        type: Number,
        default: 0
      },
      badge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge'
      }
    },
    secondPlace: {
      points: {
        type: Number,
        default: 0
      }
    },
    thirdPlace: {
      points: {
        type: Number,
        default: 0
      }
    },
    participation: {
      points: {
        type: Number,
        default: 0
      }
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
challengeSchema.index({ status: 1, startDate: 1 });
challengeSchema.index({ type: 1 });
challengeSchema.index({ 'participants.user': 1 });

// Method to add participant
challengeSchema.methods.addParticipant = function(userId) {
  const existingParticipant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (existingParticipant) {
    throw new Error('User is already a participant');
  }
  
  if (this.maxParticipants && this.participants.length >= this.maxParticipants) {
    throw new Error('Challenge is full');
  }
  
  this.participants.push({
    user: userId,
    joinedAt: new Date(),
    progress: 0,
    points: 0,
    dailyProgress: [],
    totalDaysCompleted: 0
  });
};

// Method to update participant progress (daily tracking)
challengeSchema.methods.updateParticipantProgress = function(userId, progress, points, activityDate) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (!participant) {
    throw new Error('User is not a participant');
  }
  
  // Get today's date (normalized to midnight)
  const today = new Date(activityDate || new Date());
  today.setHours(0, 0, 0, 0);
  
  // Find or create today's progress entry
  let dailyEntry = participant.dailyProgress.find(
    d => {
      const dDate = new Date(d.date);
      dDate.setHours(0, 0, 0, 0);
      return dDate.getTime() === today.getTime();
    }
  );
  
  if (!dailyEntry) {
    dailyEntry = {
      date: today,
      value: 0,
      completed: false
    };
    participant.dailyProgress.push(dailyEntry);
  }
  
  // Update today's progress
  dailyEntry.value += progress;
  
  // Update total progress first
  participant.progress += progress;
  participant.points += points;
  
  // Check if daily target is reached
  let bonusPoints = 0;
  if (!dailyEntry.completed && dailyEntry.value >= this.rules.targetValue) {
    dailyEntry.completed = true;
    dailyEntry.completedAt = new Date();
    participant.totalDaysCompleted += 1;
    
    // Award bonus points for daily completion (only once per day)
    bonusPoints = Math.floor(this.rules.targetValue * this.rules.pointMultiplier);
    participant.points += bonusPoints;
    
    // Mark challenge as completed if daily target was met
    if (!participant.challengeCompleted) {
      participant.challengeCompleted = true;
      participant.challengeCompletedAt = new Date();
    }
  }
  
  return {
    dailyCompleted: dailyEntry.completed,
    dailyProgress: dailyEntry.value,
    targetValue: this.rules.targetValue,
    totalDaysCompleted: participant.totalDaysCompleted,
    bonusPoints: bonusPoints,
    challengeCompleted: participant.challengeCompleted
  };
};

// Method to get today's progress for a user
challengeSchema.methods.getTodayProgress = function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (!participant) {
    return null;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayEntry = participant.dailyProgress.find(
    d => {
      const dDate = new Date(d.date);
      dDate.setHours(0, 0, 0, 0);
      return dDate.getTime() === today.getTime();
    }
  );
  
  return {
    value: todayEntry ? todayEntry.value : 0,
    completed: todayEntry ? todayEntry.completed : false,
    target: this.rules.targetValue,
    remaining: this.rules.targetValue - (todayEntry ? todayEntry.value : 0)
  };
};

// Method to get leaderboard
challengeSchema.methods.getLeaderboard = function() {
  return this.participants
    .sort((a, b) => b.progress - a.progress)
    .map((p, index) => ({
      rank: index + 1,
      user: p.user,
      progress: p.progress,
      points: p.points
    }));
};

// Virtual for participant count
challengeSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

module.exports = mongoose.model('Challenge', challengeSchema);

