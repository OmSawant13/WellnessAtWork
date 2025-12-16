const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['employee', 'admin', 'hr'],
    default: 'employee'
  },
  department: {
    type: String,
    trim: true
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  wellnessProfile: {
    totalPoints: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastActivityDate: {
      type: Date
    },
    badges: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    }],
    level: {
      type: Number,
      default: 1
    },
    monthlyPoints: [{
      month: {
        type: String, // Format: "2024-01"
        required: true
      },
      points: {
        type: Number,
        default: 0
      },
      targetPoints: {
        type: Number,
        default: 1000 // Default monthly target
      },
      counselingRequired: {
        type: Boolean,
        default: false
      }
    }],
    weeklyYoga: [{
      week: {
        type: String, // Format: "2024-W01"
        required: true
      },
      sessions: {
        type: Number,
        default: 0
      },
      targetSessions: {
        type: Number,
        default: 2
      },
      lastWarningDate: Date
    }],
    healthStatus: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'needs-attention', 'critical'],
      default: 'good'
    }
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  refreshToken: {
    type: String,
    select: false
  },
  googleFitToken: {
    type: String,
    select: false
  },
  googleFitRefreshToken: {
    type: String,
    select: false
  },
  googleFitConnectedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ employeeId: 1 });
userSchema.index({ 'wellnessProfile.totalPoints': -1 });
userSchema.index({ team: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update streak
userSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActivity = this.wellnessProfile.lastActivityDate 
    ? new Date(this.wellnessProfile.lastActivityDate)
    : null;
  
  if (lastActivity) {
    lastActivity.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Already logged today
      return;
    } else if (daysDiff === 1) {
      // Consecutive day
      this.wellnessProfile.currentStreak += 1;
    } else {
      // Streak broken
      if (this.wellnessProfile.currentStreak > this.wellnessProfile.longestStreak) {
        this.wellnessProfile.longestStreak = this.wellnessProfile.currentStreak;
      }
      this.wellnessProfile.currentStreak = 1;
    }
  } else {
    // First activity
    this.wellnessProfile.currentStreak = 1;
  }
  
  this.wellnessProfile.lastActivityDate = today;
  
  // Update level based on total points
  this.wellnessProfile.level = Math.floor(this.wellnessProfile.totalPoints / 500) + 1;
};

// Method to add points
userSchema.methods.addPoints = function(points) {
  this.wellnessProfile.totalPoints += points;
  this.wellnessProfile.level = Math.floor(this.wellnessProfile.totalPoints / 500) + 1;
  
  // Update monthly points
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  let monthlyEntry = this.wellnessProfile.monthlyPoints.find(m => m.month === monthKey);
  if (!monthlyEntry) {
    monthlyEntry = {
      month: monthKey,
      points: 0,
      targetPoints: 1000, // Default monthly target
      counselingRequired: false
    };
    this.wellnessProfile.monthlyPoints.push(monthlyEntry);
  }
  
  monthlyEntry.points += points;
  
  // Check if monthly target is met (at end of month)
  if (now.getDate() >= 28) { // Check near end of month
    if (monthlyEntry.points < monthlyEntry.targetPoints) {
      monthlyEntry.counselingRequired = true;
    } else {
      monthlyEntry.counselingRequired = false;
    }
  }
  
  // Update health status based on points
  this.updateHealthStatus();
};

// Method to track weekly yoga sessions
userSchema.methods.trackYogaSession = function() {
  const now = new Date();
  const weekKey = this.getWeekKey(now);
  
  let weeklyEntry = this.wellnessProfile.weeklyYoga.find(w => w.week === weekKey);
  if (!weeklyEntry) {
    weeklyEntry = {
      week: weekKey,
      sessions: 0,
      targetSessions: 2,
      lastWarningDate: null
    };
    this.wellnessProfile.weeklyYoga.push(weeklyEntry);
  }
  
  weeklyEntry.sessions += 1;
  
  // Update health status
  this.updateHealthStatus();
};

// Helper to get week key (YYYY-W##)
userSchema.methods.getWeekKey = function(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d - week1) / 86400000 + week1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
};

// Method to check yoga warning
userSchema.methods.checkYogaWarning = function() {
  const now = new Date();
  const weekKey = this.getWeekKey(now);
  
  let weeklyEntry = this.wellnessProfile.weeklyYoga.find(w => w.week === weekKey);
  if (!weeklyEntry) {
    weeklyEntry = {
      week: weekKey,
      sessions: 0,
      targetSessions: 2,
      lastWarningDate: null
    };
    this.wellnessProfile.weeklyYoga.push(weeklyEntry);
  }
  
  const daysInWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  const daysRemaining = 7 - daysInWeek;
  const sessionsNeeded = weeklyEntry.targetSessions - weeklyEntry.sessions;
  
  // Send warning if less than 3 days left and sessions needed
  if (daysRemaining <= 3 && sessionsNeeded > 0) {
    // Only send warning once per day
    const lastWarning = weeklyEntry.lastWarningDate 
      ? new Date(weeklyEntry.lastWarningDate)
      : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!lastWarning || lastWarning.getTime() !== today.getTime()) {
      weeklyEntry.lastWarningDate = new Date();
      return {
        warning: true,
        daysRemaining,
        sessionsNeeded,
        points: 300 // Points for completing yoga sessions
      };
    }
  }
  
  return {
    warning: false,
    daysRemaining,
    sessionsNeeded,
    sessionsCompleted: weeklyEntry.sessions
  };
};

// Method to update health status
userSchema.methods.updateHealthStatus = function() {
  const totalPoints = this.wellnessProfile.totalPoints;
  const currentStreak = this.wellnessProfile.currentStreak;
  
  // Check monthly points
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlyEntry = this.wellnessProfile.monthlyPoints.find(m => m.month === monthKey);
  const monthlyPoints = monthlyEntry ? monthlyEntry.points : 0;
  const monthlyTarget = monthlyEntry ? monthlyEntry.targetPoints : 1000;
  
  // Check weekly yoga
  const weekKey = this.getWeekKey(now);
  const weeklyEntry = this.wellnessProfile.weeklyYoga.find(w => w.week === weekKey);
  const yogaSessions = weeklyEntry ? weeklyEntry.sessions : 0;
  const yogaTarget = weeklyEntry ? weeklyEntry.targetSessions : 2;
  
  // Calculate health status
  let healthScore = 0;
  
  // Points contribution (40%)
  if (totalPoints >= 5000) healthScore += 40;
  else if (totalPoints >= 3000) healthScore += 30;
  else if (totalPoints >= 1500) healthScore += 20;
  else if (totalPoints >= 500) healthScore += 10;
  
  // Monthly target (30%)
  if (monthlyPoints >= monthlyTarget) healthScore += 30;
  else if (monthlyPoints >= monthlyTarget * 0.7) healthScore += 20;
  else if (monthlyPoints >= monthlyTarget * 0.5) healthScore += 10;
  
  // Yoga sessions (20%)
  if (yogaSessions >= yogaTarget) healthScore += 20;
  else if (yogaSessions >= yogaTarget * 0.5) healthScore += 10;
  
  // Streak (10%)
  if (currentStreak >= 30) healthScore += 10;
  else if (currentStreak >= 14) healthScore += 7;
  else if (currentStreak >= 7) healthScore += 5;
  
  // Set health status
  if (healthScore >= 80) this.wellnessProfile.healthStatus = 'excellent';
  else if (healthScore >= 60) this.wellnessProfile.healthStatus = 'good';
  else if (healthScore >= 40) this.wellnessProfile.healthStatus = 'fair';
  else if (healthScore >= 20) this.wellnessProfile.healthStatus = 'needs-attention';
  else this.wellnessProfile.healthStatus = 'critical';
};

module.exports = mongoose.model('User', userSchema);

