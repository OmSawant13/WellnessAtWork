const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, employeeId } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'employee',
    department,
    employeeId
  });

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // 'none' for cross-origin in production
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        wellnessProfile: user.wellnessProfile
      },
      token
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // 'none' for cross-origin in production
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        wellnessProfile: user.wellnessProfile
      },
      token
    }
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'No refresh token provided'
    });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (user) {
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });
  }

  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    expires: new Date(0)
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('wellnessProfile.badges')
    .populate('team');

  res.json({
    success: true,
    data: user
  });
});

// @desc    Get Google Fit OAuth URL
// @route   GET /api/auth/google-fit/connect
// @access  Private
exports.connectGoogleFit = asyncHandler(async (req, res) => {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/auth/google-fit/callback';
  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    return res.status(500).json({
      success: false,
      message: 'Google Fit integration not configured'
    });
  }
  
  const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=https://www.googleapis.com/auth/fitness.activity.read&` +
    `access_type=offline&` +
    `prompt=consent&` +
    `state=${req.user.id}`; // Pass user ID in state for security
  
  res.json({
    success: true,
    oauthUrl
  });
});

// @desc    Google Fit OAuth callback
// @route   GET /api/auth/google-fit/callback
// @access  Private
exports.googleFitCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  const axios = require('axios');
  
  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard?error=no_code`);
  }
  
  try {
    // Exchange code for token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/auth/google-fit/callback',
      grant_type: 'authorization_code'
    });
    
    // Verify state matches user ID
    const userId = state || req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard?error=user_not_found`);
    }
    
    // Save tokens to user
    user.googleFitToken = tokenResponse.data.access_token;
    user.googleFitRefreshToken = tokenResponse.data.refresh_token;
    user.googleFitConnectedAt = new Date();
    await user.save({ validateBeforeSave: false });
    
    // Redirect to frontend
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard?googleFit=connected`);
  } catch (error) {
    console.error('Google Fit callback error:', error.response?.data || error.message);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard?error=connection_failed`);
  }
});

// @desc    Get Google Fit connection status
// @route   GET /api/auth/google-fit/status
// @access  Private
exports.getGoogleFitStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('googleFitToken googleFitConnectedAt');
  
  res.json({
    success: true,
    data: {
      connected: !!user.googleFitToken,
      connectedAt: user.googleFitConnectedAt
    }
  });
});

// @desc    Disconnect Google Fit
// @route   POST /api/auth/google-fit/disconnect
// @access  Private
exports.disconnectGoogleFit = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  user.googleFitToken = undefined;
  user.googleFitRefreshToken = undefined;
  user.googleFitConnectedAt = undefined;
  await user.save({ validateBeforeSave: false });
  
  res.json({
    success: true,
    message: 'Google Fit disconnected successfully'
  });
});

