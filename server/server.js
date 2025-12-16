const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const activityRoutes = require('./routes/activityRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const battleRoutes = require('./routes/battleRoutes');
const wellnessPostRoutes = require('./routes/wellnessPostRoutes');
const lootBoxRoutes = require('./routes/lootBoxRoutes');
const quickSnapRoutes = require('./routes/quickSnapRoutes');

// Middleware
app.use(helmet());

// CORS configuration - Allow multiple origins
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://healthtrackker.web.app',
    'https://healthtrackker.firebaseapp.com',
    process.env.CORS_ORIGIN,
    process.env.CLIENT_URL
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // In development, allow all origins
            if (process.env.NODE_ENV !== 'production') {
                callback(null, true);
            } else {
                console.warn(`CORS blocked origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
// Increase payload size limit for image uploads (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Rate limiting - Disabled in development, enabled in production
if (process.env.NODE_ENV === 'production') {
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 200, // 200 requests per 15 minutes
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req) => {
            return req.path === '/api/health';
        }
    });
    app.use('/api/', limiter);
} else {
    // Development: Very lenient rate limiting (5000 requests per 15 minutes)
    const devLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5000, // 5000 requests per 15 minutes (very lenient for development)
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req) => {
            // Skip rate limiting for health checks and in development
            return req.path === '/api/health' || process.env.NODE_ENV !== 'production';
        }
    });
    app.use('/api/', devLimiter);
}

// Auth rate limiting (stricter)
if (process.env.NODE_ENV === 'production') {
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        message: 'Too many login attempts, please try again later.',
        standardHeaders: true,
        legacyHeaders: false
    });
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/register', authLimiter);
} else {
    // Development: Very lenient (500 login attempts per 15 minutes)
    const devAuthLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 500,
        standardHeaders: true,
        legacyHeaders: false
    });
    app.use('/api/auth/login', devAuthLimiter);
    app.use('/api/auth/register', devAuthLimiter);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/battles', battleRoutes);
app.use('/api/wellness-posts', wellnessPostRoutes);
app.use('/api/loot-boxes', lootBoxRoutes);
app.use('/api/quick-snaps', quickSnapRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'WellnessAtWork API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Connect to MongoDB with better error handling
const connectDB = async() => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            console.error('❌ MONGODB_URI environment variable is not set!');
            process.exit(1);
        }

        console.log('🔄 Attempting to connect to MongoDB...');
        console.log(`📍 Connection string: ${mongoURI.replace(/:[^:@]+@/, ':****@')}`); // Hide password in logs

        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000, // 30 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds socket timeout
        });

        console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);

        // Start server only after MongoDB connection
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 API URL: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('❌ MongoDB connection error:');
        console.error(`   Error Name: ${error.name}`);
        console.error(`   Error Message: ${error.message}`);

        if (error.name === 'MongooseServerSelectionError') {
            console.error('   ⚠️  Possible causes:');
            console.error('   1. MongoDB Atlas Network Access - Add 0.0.0.0/0 to allow all IPs');
            console.error('   2. Incorrect connection string');
            console.error('   3. Database credentials are wrong');
        }

        process.exit(1);
    }
};

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
});

// Connect to database
connectDB();

module.exports = app;