const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a team name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Team name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  department: {
    type: String,
    trim: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['member', 'leader'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  stats: {
    totalPoints: {
      type: Number,
      default: 0
    },
    totalActivities: {
      type: Number,
      default: 0
    },
    averageStreak: {
      type: Number,
      default: 0
    }
  },
  challenges: [{
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
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
teamSchema.index({ name: 1 });
teamSchema.index({ department: 1 });
teamSchema.index({ 'stats.totalPoints': -1 });
teamSchema.index({ 'members.user': 1 });

// Method to add member
teamSchema.methods.addMember = function(userId, role = 'member') {
  const existingMember = this.members.find(
    m => m.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    throw new Error('User is already a team member');
  }
  
  this.members.push({
    user: userId,
    role: role,
    joinedAt: new Date()
  });
};

// Method to remove member
teamSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(
    m => m.user.toString() !== userId.toString()
  );
};

// Method to update stats
teamSchema.methods.updateStats = async function() {
  const User = mongoose.model('User');
  const Activity = mongoose.model('Activity');
  
  const memberIds = this.members.map(m => m.user);
  
  // Calculate total points
  const users = await User.find({ _id: { $in: memberIds } });
  this.stats.totalPoints = users.reduce((sum, user) => sum + (user.wellnessProfile?.totalPoints || 0), 0);
  
  // Calculate total activities
  const activityCount = await Activity.countDocuments({ user: { $in: memberIds } });
  this.stats.totalActivities = activityCount;
  
  // Calculate average streak
  const totalStreak = users.reduce((sum, user) => sum + (user.wellnessProfile?.currentStreak || 0), 0);
  this.stats.averageStreak = users.length > 0 ? totalStreak / users.length : 0;
};

module.exports = mongoose.model('Team', teamSchema);

