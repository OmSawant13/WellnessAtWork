const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './.env' });

// Import models
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Activity = require('../models/Activity');
const Booking = require('../models/Booking');
const MentalHealthResource = require('../models/MentalHealthResource');
const Reward = require('../models/Reward');
const Badge = require('../models/Badge');
const Team = require('../models/Team');

// Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Clear database but keep user credentials
const clearDatabase = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing database...');

    // Clear all collections except Users
    await Challenge.deleteMany({});
    console.log('✅ Cleared Challenges');

    await Activity.deleteMany({});
    console.log('✅ Cleared Activities');

    await Booking.deleteMany({});
    console.log('✅ Cleared Bookings');

    await MentalHealthResource.deleteMany({});
    console.log('✅ Cleared Mental Health Resources');

    await Reward.deleteMany({});
    console.log('✅ Cleared Rewards');

    await Badge.deleteMany({});
    console.log('✅ Cleared Badges');

    await Team.deleteMany({});
    console.log('✅ Cleared Teams');

    // Reset user wellness profiles but keep credentials
    await User.updateMany(
      {},
      {
        $set: {
          wellnessProfile: {
            totalPoints: 0,
            currentStreak: 0,
            longestStreak: 0,
            level: 1,
            badges: [],
            monthlyPoints: [],
            weeklyYogaSessions: [],
            lastActivityDate: null,
            healthStatus: 'Needs Attention',
            healthScore: 0,
            googleFitToken: undefined,
            googleFitRefreshToken: undefined,
            googleFitConnectedAt: undefined
          },
          team: null,
          refreshToken: undefined
        }
      }
    );
    console.log('✅ Reset user wellness profiles');

    // Remove user references from other collections (already cleared above)
    console.log('✅ Kept user credentials (login info)');

    console.log('\n🎉 Database cleared successfully!');
    console.log('📝 User credentials preserved:');
    console.log('   - Admin: admin@wellnessatwork.com / admin123');
    console.log('   - HR: hr@wellnessatwork.com / hr123456');
    console.log('   - Employees: john.doe@wellnessatwork.com / employee123');
    console.log('   - (and other existing users)');

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error clearing database: ${error.message}`);
    process.exit(1);
  }
};

// Run the script
clearDatabase();

