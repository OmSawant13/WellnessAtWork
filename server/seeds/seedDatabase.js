const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wellnessatwork', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Seed data
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Challenge.deleteMany();
    await Activity.deleteMany();
    await Booking.deleteMany();
    await MentalHealthResource.deleteMany();
    await Reward.deleteMany();
    await Badge.deleteMany();
    await Team.deleteMany();

    console.log('🗑️  Cleared existing data');

    // Create Badges
    const badges = await Badge.insertMany([
      {
        name: 'Early Bird',
        description: 'Log activity before 8 AM',
        icon: '🌅',
        category: 'activity',
        rarity: 'common',
        criteria: { type: 'custom', value: 1 },
        pointsReward: 50
      },
      {
        name: 'Streak Master',
        description: 'Maintain a 7-day activity streak',
        icon: '🔥',
        category: 'streak',
        rarity: 'uncommon',
        criteria: { type: 'streak', value: 7 },
        pointsReward: 100
      },
      {
        name: 'Challenge Champion',
        description: 'Win a challenge',
        icon: '🏆',
        category: 'challenge',
        rarity: 'rare',
        criteria: { type: 'challenges', value: 1 },
        pointsReward: 200
      },
      {
        name: 'Wellness Warrior',
        description: 'Earn 1000+ total points',
        icon: '⚔️',
        category: 'milestone',
        rarity: 'epic',
        criteria: { type: 'points', value: 1000 },
        pointsReward: 500
      },
      {
        name: 'Team Player',
        description: 'Participate in team challenges',
        icon: '👥',
        category: 'social',
        rarity: 'common',
        criteria: { type: 'custom', value: 1 },
        pointsReward: 75
      },
      {
        name: 'Meditation Master',
        description: 'Complete 30 meditation sessions',
        icon: '🧘',
        category: 'activity',
        rarity: 'uncommon',
        criteria: { type: 'activities', value: 30, activityType: 'meditation' },
        pointsReward: 150
      },
      {
        name: 'Step Counter',
        description: 'Log 100,000 steps',
        icon: '🚶',
        category: 'activity',
        rarity: 'rare',
        criteria: { type: 'activities', value: 100000, activityType: 'steps' },
        pointsReward: 300
      }
    ]);

    console.log('✅ Created badges');

    // Create Admin User
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@wellnessatwork.com',
      password: 'admin123',
      role: 'admin',
      department: 'IT',
      employeeId: 'EMP001',
      wellnessProfile: {
        totalPoints: 0,
        currentStreak: 0,
        badges: []
      }
    });

    // Create HR User
    const hr = await User.create({
      name: 'HR Manager',
      email: 'hr@wellnessatwork.com',
      password: 'hr123456',
      role: 'hr',
      department: 'Human Resources',
      employeeId: 'EMP002',
      wellnessProfile: {
        totalPoints: 0,
        currentStreak: 0,
        badges: []
      }
    });

    // Create Employee Users
    const employees = await User.insertMany([
      {
        name: 'John Doe',
        email: 'john.doe@wellnessatwork.com',
        password: 'employee123',
        role: 'employee',
        department: 'Engineering',
        employeeId: 'EMP101',
        wellnessProfile: {
          totalPoints: 1250,
          currentStreak: 5,
          longestStreak: 12,
          lastActivityDate: new Date(),
          badges: [badges[0]._id, badges[1]._id],
          level: 3
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@wellnessatwork.com',
        password: 'employee123',
        role: 'employee',
        department: 'Marketing',
        employeeId: 'EMP102',
        wellnessProfile: {
          totalPoints: 980,
          currentStreak: 3,
          longestStreak: 8,
          lastActivityDate: new Date(),
          badges: [badges[0]._id],
          level: 2
        }
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@wellnessatwork.com',
        password: 'employee123',
        role: 'employee',
        department: 'Sales',
        employeeId: 'EMP103',
        wellnessProfile: {
          totalPoints: 750,
          currentStreak: 2,
          longestStreak: 5,
          lastActivityDate: new Date(),
          badges: [],
          level: 2
        }
      },
      {
        name: 'Sarah Williams',
        email: 'sarah.williams@wellnessatwork.com',
        password: 'employee123',
        role: 'employee',
        department: 'Engineering',
        employeeId: 'EMP104',
        wellnessProfile: {
          totalPoints: 2100,
          currentStreak: 15,
          longestStreak: 20,
          lastActivityDate: new Date(),
          badges: [badges[0]._id, badges[1]._id, badges[3]._id],
          level: 5
        }
      },
      {
        name: 'David Brown',
        email: 'david.brown@wellnessatwork.com',
        password: 'employee123',
        role: 'employee',
        department: 'Operations',
        employeeId: 'EMP105',
        wellnessProfile: {
          totalPoints: 450,
          currentStreak: 1,
          longestStreak: 3,
          lastActivityDate: new Date(),
          badges: [],
          level: 1
        }
      }
    ]);

    console.log('✅ Created users');

    // Create Teams
    const teams = await Team.insertMany([
      {
        name: 'Engineering Team',
        description: 'Software development team',
        department: 'Engineering',
        members: [
          { user: employees[0]._id, role: 'leader' },
          { user: employees[3]._id, role: 'member' }
        ],
        stats: {
          totalPoints: 3350,
          totalActivities: 45,
          averageStreak: 10
        },
        createdBy: admin._id
      },
      {
        name: 'Marketing Squad',
        description: 'Marketing and communications',
        department: 'Marketing',
        members: [
          { user: employees[1]._id, role: 'leader' }
        ],
        stats: {
          totalPoints: 980,
          totalActivities: 28,
          averageStreak: 3
        },
        createdBy: admin._id
      }
    ]);

    // Update users with team references
    await User.updateOne({ _id: employees[0]._id }, { team: teams[0]._id });
    await User.updateOne({ _id: employees[3]._id }, { team: teams[0]._id });
    await User.updateOne({ _id: employees[1]._id }, { team: teams[1]._id });

    console.log('✅ Created teams');

    // Create Challenges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const challenges = await Challenge.insertMany([
      {
        name: '10K Steps Daily Challenge',
        description: 'Walk 10,000 steps every day. Complete today to earn bonus points!',
        type: 'steps',
        startDate: today,
        endDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
        isDailyChallenge: true,
        expiresAt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // 24 hours from today
        rules: {
          targetValue: 10000,
          unit: 'steps',
          pointMultiplier: 1.5
        },
        participants: [
          { 
            user: employees[0]._id, 
            progress: 8500, 
            points: 85,
            dailyProgress: [],
            totalDaysCompleted: 0,
            challengeCompleted: false
          },
          { 
            user: employees[3]._id, 
            progress: 12000, 
            points: 120,
            dailyProgress: [],
            totalDaysCompleted: 0,
            challengeCompleted: false
          },
          { 
            user: employees[1]._id, 
            progress: 7200, 
            points: 72,
            dailyProgress: [],
            totalDaysCompleted: 0,
            challengeCompleted: false
          }
        ],
        isTeamChallenge: false,
        status: 'active',
        rewards: {
          firstPlace: { points: 500, badge: badges[2]._id },
          secondPlace: { points: 300 },
          thirdPlace: { points: 200 },
          participation: { points: 50 }
        },
        createdBy: admin._id
      },
      {
        name: 'Mindful Meditation Daily',
        description: 'Meditate for at least 10 minutes today. Earn 150 points!',
        type: 'meditation',
        startDate: today,
        endDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
        isDailyChallenge: true,
        expiresAt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        rules: {
          targetValue: 10,
          unit: 'minutes',
          pointMultiplier: 1.2
        },
        participants: [
          { 
            user: employees[0]._id, 
            progress: 8, 
            points: 80,
            dailyProgress: [],
            totalDaysCompleted: 0,
            challengeCompleted: false
          },
          { 
            user: employees[3]._id, 
            progress: 15, 
            points: 150,
            dailyProgress: [],
            totalDaysCompleted: 0,
            challengeCompleted: false
          }
        ],
        isTeamChallenge: false,
        status: 'active',
        rewards: {
          firstPlace: { points: 400, badge: badges[5]._id },
          secondPlace: { points: 250 },
          participation: { points: 50 }
        },
        createdBy: hr._id
      },
      {
        name: 'Daily Workout Challenge',
        description: 'Complete a 30-minute workout today. 600 points waiting!',
        type: 'workout',
        startDate: today,
        endDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        isDailyChallenge: true,
        expiresAt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        rules: {
          targetValue: 30,
          unit: 'minutes',
          pointMultiplier: 2
        },
        participants: [
          { 
            user: employees[2]._id, 
            progress: 20, 
            points: 800,
            dailyProgress: [],
            totalDaysCompleted: 0,
            challengeCompleted: false
          },
          { 
            user: employees[4]._id, 
            progress: 15, 
            points: 600,
            dailyProgress: [],
            totalDaysCompleted: 0,
            challengeCompleted: false
          }
        ],
        isTeamChallenge: false,
        status: 'active',
        rewards: {
          firstPlace: { points: 300 },
          participation: { points: 50 }
        },
        createdBy: admin._id
      },
      {
        name: 'Hydration Hero - Today',
        description: 'Drink 8 glasses of water today. Stay hydrated! 40 points reward.',
        type: 'hydration',
        startDate: today,
        endDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
        isDailyChallenge: true,
        expiresAt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        rules: {
          targetValue: 8,
          unit: 'glasses',
          pointMultiplier: 1.3
        },
        participants: [
          { 
            user: employees[1]._id, 
            progress: 6, 
            points: 30,
            dailyProgress: [],
            totalDaysCompleted: 0,
            challengeCompleted: false
          },
          { 
            user: employees[2]._id, 
            progress: 8, 
            points: 40,
            dailyProgress: [],
            totalDaysCompleted: 0,
            challengeCompleted: false
          }
        ],
        isTeamChallenge: false,
        status: 'active',
        rewards: {
          firstPlace: { points: 250 },
          secondPlace: { points: 150 },
          participation: { points: 50 }
        },
        createdBy: hr._id
      },
      {
        name: 'Yoga Session Today',
        description: 'Complete a 20-minute yoga session today. 300 points + weekly requirement!',
        type: 'yoga',
        startDate: today,
        endDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
        isDailyChallenge: true,
        expiresAt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        rules: {
          targetValue: 20,
          unit: 'minutes',
          pointMultiplier: 1.8
        },
        participants: [
          { 
            user: employees[3]._id, 
            progress: 20, 
            points: 720,
            dailyProgress: [],
            totalDaysCompleted: 0,
            challengeCompleted: false
          },
          { 
            user: employees[0]._id, 
            progress: 15, 
            points: 540,
            dailyProgress: [],
            totalDaysCompleted: 0,
            challengeCompleted: false
          }
        ],
        isTeamChallenge: false,
        status: 'active',
        rewards: {
          firstPlace: { points: 400 },
          secondPlace: { points: 250 },
          participation: { points: 50 }
        },
        createdBy: admin._id
      },
      {
        name: 'Sleep Well Today',
        description: 'Get 7 hours of sleep today. 14 points reward!',
        type: 'sleep',
        startDate: today,
        endDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000),
        isDailyChallenge: true,
        expiresAt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        rules: {
          targetValue: 7,
          unit: 'hours',
          pointMultiplier: 1.5
        },
        participants: [
          { 
            user: employees[4]._id, 
            progress: 6, 
            points: 12,
            dailyProgress: [],
            totalDaysCompleted: 0,
            challengeCompleted: false
          },
          { 
            user: employees[1]._id, 
            progress: 7, 
            points: 14,
            dailyProgress: [],
            totalDaysCompleted: 0,
            challengeCompleted: false
          }
        ],
        isTeamChallenge: false,
        status: 'active',
        rewards: {
          firstPlace: { points: 300 },
          participation: { points: 50 }
        },
        createdBy: hr._id
      },
      {
        name: 'Tomorrow\'s Fitness Challenge',
        description: 'Start tomorrow with a daily workout challenge!',
        type: 'workout',
        startDate: tomorrow,
        endDate: new Date(tomorrow.getTime() + 30 * 24 * 60 * 60 * 1000),
        isDailyChallenge: true,
        expiresAt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
        rules: {
          targetValue: 30,
          unit: 'minutes',
          pointMultiplier: 2.0
        },
        participants: [],
        isTeamChallenge: false,
        status: 'upcoming',
        rewards: {
          firstPlace: { points: 1000 },
          secondPlace: { points: 600 },
          thirdPlace: { points: 400 },
          participation: { points: 100 }
        },
        createdBy: admin._id
      }
    ]);

    console.log('✅ Created challenges');

    // Create Activities
    const activities = [];
    const activityTypes = ['steps', 'meditation', 'workout', 'yoga', 'walking', 'running'];
    
    for (let i = 0; i < 50; i++) {
      const user = employees[Math.floor(Math.random() * employees.length)];
      const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const activityDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      let value, unit;
      switch (type) {
        case 'steps':
          value = Math.floor(Math.random() * 15000) + 5000;
          unit = 'steps';
          break;
        case 'meditation':
          value = Math.floor(Math.random() * 30) + 5;
          unit = 'minutes';
          break;
        case 'workout':
        case 'yoga':
        case 'walking':
        case 'running':
          value = Math.floor(Math.random() * 60) + 15;
          unit = 'minutes';
          break;
        default:
          value = Math.floor(Math.random() * 100);
          unit = 'minutes';
      }

      activities.push({
        user: user._id,
        type,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Session`,
        description: `Completed ${value} ${unit} of ${type}`,
        value,
        unit,
        activityDate,
        challenge: Math.random() > 0.5 ? challenges[Math.floor(Math.random() * challenges.length)]._id : null,
        metadata: {
          device: Math.random() > 0.5 ? 'fitbit' : 'manual',
          duration: type !== 'steps' ? value : null
        }
      });
    }

    await Activity.insertMany(activities);
    console.log('✅ Created activities');

    // Create Mental Health Resources
    const resources = await MentalHealthResource.insertMany([
      {
        title: 'Managing Stress in the Workplace',
        description: 'A comprehensive guide to managing stress and maintaining work-life balance',
        type: 'article',
        category: 'stress-management',
        tags: ['stress', 'workplace', 'balance'],
        content: {
          url: 'https://example.com/stress-management',
          text: 'Full article content about managing stress...'
        },
        thumbnail: 'https://via.placeholder.com/300x200',
        author: 'Dr. Jane Wellness',
        duration: 15,
        language: 'en',
        isFeatured: true,
        createdBy: admin._id
      },
      {
        title: '10-Minute Morning Meditation',
        description: 'Start your day with a peaceful meditation session',
        type: 'video',
        category: 'mindfulness',
        tags: ['meditation', 'morning', 'mindfulness'],
        content: {
          url: 'https://example.com/meditation-video',
          embedCode: '<iframe src="..."></iframe>'
        },
        thumbnail: 'https://via.placeholder.com/300x200',
        author: 'Yoga Master',
        duration: 10,
        language: 'en',
        isFeatured: true,
        createdBy: hr._id
      },
      {
        title: 'Sleep Better Tonight',
        description: 'Tips and techniques for improving sleep quality',
        type: 'podcast',
        category: 'sleep',
        tags: ['sleep', 'health', 'wellness'],
        content: {
          url: 'https://example.com/sleep-podcast'
        },
        thumbnail: 'https://via.placeholder.com/300x200',
        author: 'Sleep Expert',
        duration: 25,
        language: 'en',
        isFeatured: false,
        createdBy: admin._id
      },
      {
        title: 'Anxiety Management Workbook',
        description: 'Downloadable workbook with exercises for managing anxiety',
        type: 'worksheet',
        category: 'anxiety',
        tags: ['anxiety', 'workbook', 'exercises'],
        content: {
          fileUrl: 'https://example.com/anxiety-workbook.pdf'
        },
        thumbnail: 'https://via.placeholder.com/300x200',
        author: 'Mental Health Professional',
        language: 'en',
        isFeatured: false,
        createdBy: hr._id
      },
      {
        title: 'Building Resilience',
        description: 'Learn how to build emotional resilience in challenging times',
        type: 'article',
        category: 'general',
        tags: ['resilience', 'emotional', 'wellness'],
        content: {
          url: 'https://example.com/resilience',
          text: 'Article about building resilience...'
        },
        thumbnail: 'https://via.placeholder.com/300x200',
        author: 'Wellness Coach',
        duration: 12,
        language: 'en',
        isFeatured: true,
        createdBy: admin._id
      }
    ]);

    console.log('✅ Created mental health resources');

    // Create Rewards
    const rewards = await Reward.insertMany([
      {
        name: 'Gym Membership Discount',
        description: '50% off annual gym membership',
        type: 'discount',
        category: 'fitness',
        pointsCost: 500,
        image: 'https://via.placeholder.com/300x200',
        availability: {
          total: 20,
          remaining: 15
        },
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        redemptionInstructions: 'Contact HR with your redemption code',
        partner: {
          name: 'FitLife Gym',
          contact: 'contact@fitlifegym.com'
        },
        createdBy: admin._id
      },
      {
        name: 'Wellness App Premium',
        description: '1-year premium subscription to wellness app',
        type: 'digital',
        category: 'wellness',
        pointsCost: 300,
        image: 'https://via.placeholder.com/300x200',
        availability: {
          total: null,
          remaining: null
        },
        redemptionInstructions: 'Code will be emailed to you',
        createdBy: hr._id
      },
      {
        name: 'Massage Therapy Session',
        description: 'One-hour professional massage therapy session',
        type: 'experience',
        category: 'wellness',
        pointsCost: 750,
        image: 'https://via.placeholder.com/300x200',
        availability: {
          total: 10,
          remaining: 8
        },
        redemptionInstructions: 'Book appointment through wellness portal',
        partner: {
          name: 'Spa & Wellness Center',
          contact: 'bookings@spa.com'
        },
        createdBy: admin._id
      },
      {
        name: 'Healthy Meal Voucher',
        description: '$50 voucher for healthy meal delivery service',
        type: 'discount',
        category: 'nutrition',
        pointsCost: 400,
        image: 'https://via.placeholder.com/300x200',
        availability: {
          total: 30,
          remaining: 25
        },
        redemptionInstructions: 'Use code at checkout',
        partner: {
          name: 'FreshMeals Co.',
          contact: 'support@freshmeals.com'
        },
        createdBy: hr._id
      },
      {
        name: 'Wellness Warrior Badge',
        description: 'Exclusive digital badge for reaching 1000 points',
        type: 'badge',
        category: 'general',
        pointsCost: 0,
        image: 'https://via.placeholder.com/300x200',
        availability: {
          total: null,
          remaining: null
        },
        redemptionInstructions: 'Badge will be automatically added to your profile',
        createdBy: admin._id
      }
    ]);

    console.log('✅ Created rewards');

    // Create Bookings
    const bookings = await Booking.insertMany([
      {
        user: employees[0]._id,
        sessionType: 'yoga',
        title: 'Morning Yoga Session',
        description: 'Gentle yoga flow for all levels',
        instructor: 'Yoga Instructor Sarah',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        duration: 60,
        location: 'online',
        meetingLink: 'https://zoom.us/j/123456789',
        status: 'confirmed'
      },
      {
        user: employees[1]._id,
        sessionType: 'counseling',
        title: 'Wellness Counseling',
        description: 'One-on-one wellness counseling session',
        instructor: 'Dr. Wellness',
        scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        duration: 45,
        location: 'onsite',
        status: 'pending'
      },
      {
        user: employees[3]._id,
        sessionType: 'webinar',
        title: 'Nutrition & Wellness Webinar',
        description: 'Learn about healthy eating habits',
        instructor: 'Nutrition Expert',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        duration: 90,
        location: 'online',
        meetingLink: 'https://zoom.us/j/987654321',
        status: 'confirmed'
      }
    ]);

    console.log('✅ Created bookings');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${badges.length} badges`);
    console.log(`   - ${employees.length + 2} users (${employees.length} employees, 1 admin, 1 HR)`);
    console.log(`   - ${teams.length} teams`);
    console.log(`   - ${challenges.length} challenges`);
    console.log(`   - ${activities.length} activities`);
    console.log(`   - ${resources.length} mental health resources`);
    console.log(`   - ${rewards.length} rewards`);
    console.log(`   - ${bookings.length} bookings`);
    console.log('\n🔑 Test Credentials:');
    console.log('   Admin: admin@wellnessatwork.com / admin123');
    console.log('   HR: hr@wellnessatwork.com / hr123456');
    console.log('   Employee: john.doe@wellnessatwork.com / employee123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
if (process.argv[2] === '-d') {
  seedDatabase();
} else {
  mongoose.connection.once('open', () => {
    seedDatabase();
  });
}

