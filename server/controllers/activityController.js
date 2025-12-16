const Activity = require('../models/Activity');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Badge = require('../models/Badge');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Log activity
// @route   POST /api/activities
// @access  Private
exports.logActivity = asyncHandler(async (req, res) => {
  // Parse photo from body if it's a JSON string (from FormData)
  let photo = req.body.photo;
  if (typeof photo === 'string') {
    try {
      photo = JSON.parse(photo);
    } catch (e) {
      // If parsing fails, treat as undefined
      photo = undefined;
    }
  }

  let { type, title, description, value, unit, challenge, activityDate, metadata, autoFetch } = req.body;

  // Validate required fields
  if (!type) {
    return res.status(400).json({
      success: false,
      message: 'Activity type is required'
    });
  }

  let finalValue = value;
  let verified = false;

  // If steps and auto-fetch enabled, fetch from Google Fit
  if (type === 'steps' && autoFetch && req.user.googleFitToken) {
    try {
      const { fetchStepsFromGoogleFit, refreshGoogleFitToken } = require('../utils/googleFit');
      
      try {
        finalValue = await fetchStepsFromGoogleFit(req.user.googleFitToken, activityDate ? new Date(activityDate) : new Date());
        verified = true; // Auto-verified from Google Fit
        
        if (!finalValue || finalValue === 0) {
          return res.status(400).json({
            success: false,
            message: 'No steps data found in Google Fit for the selected date. Please try manual entry.',
            allowManual: true
          });
        }
      } catch (error) {
        // If token expired, try to refresh
        if (error.message.includes('expired') && req.user.googleFitRefreshToken) {
          try {
            const newToken = await refreshGoogleFitToken(req.user.googleFitRefreshToken);
            req.user.googleFitToken = newToken;
            await req.user.save({ validateBeforeSave: false });
            
            // Retry with new token
            finalValue = await fetchStepsFromGoogleFit(newToken, activityDate ? new Date(activityDate) : new Date());
            verified = true;
          } catch (refreshError) {
            return res.status(400).json({
              success: false,
              message: 'Google Fit connection expired. Please reconnect.',
              allowManual: true,
              reconnectRequired: true
            });
          }
        } else {
          return res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch steps from Google Fit. Please try manual entry.',
            allowManual: true
          });
        }
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch steps from Google Fit. Please try manual entry.',
        allowManual: true
      });
    }
  }

  // Parse value from FormData (might be string) - only if not auto-fetched
  if (finalValue !== undefined && finalValue !== null && !autoFetch) {
    finalValue = parseFloat(finalValue);
    if (isNaN(finalValue)) {
      return res.status(400).json({
        success: false,
        message: 'Activity value must be a valid number'
      });
    }
  }

  if (finalValue === undefined || finalValue === null || finalValue === '') {
    return res.status(400).json({
      success: false,
      message: 'Activity value is required'
    });
  }

  // Process uploaded files
  const uploadedPhotoUrls = [];
  if (req.files && req.files.length > 0) {
    uploadedPhotoUrls.push(...req.files.map(file => ({
      url: `/uploads/photos/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    })));
  }

  // If challenge is specified, check requirements
  let challengeDoc = null;
  if (challenge) {
    challengeDoc = await Challenge.findById(challenge);
    
    if (challengeDoc) {
      // Check if photo is required
      if (challengeDoc.rules?.requiresPhoto) {
        const minPhotos = challengeDoc.rules?.minPhotos || 1;
        const uploadedCount = uploadedPhotoUrls.length;
        const urlCount = photo?.urls?.length || (photo?.url ? 1 : 0);
        const totalPhotoCount = uploadedCount + urlCount;
        
        if (totalPhotoCount < minPhotos) {
          return res.status(400).json({
            success: false,
            message: `This challenge requires at least ${minPhotos} photo(s). Please upload ${minPhotos - totalPhotoCount} more photo(s).`
          });
        }
        
        const maxPhotos = challengeDoc.rules?.maxPhotos || 5;
        if (totalPhotoCount > maxPhotos) {
          return res.status(400).json({
            success: false,
            message: `Maximum ${maxPhotos} photos allowed for this challenge.`
          });
        }
      }

      // Check time gap for hydration challenges (e.g., 2 hours between glasses)
      if (challengeDoc.rules?.timeGap && type === 'hydration') {
        const lastActivity = await Activity.findOne({
          user: req.user.id,
          type: 'hydration',
          challenge: challenge,
          activityDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }).sort({ activityDate: -1 });

        if (lastActivity) {
          const timeDiff = (new Date() - new Date(lastActivity.activityDate)) / (1000 * 60 * 60); // hours
          const requiredGap = challengeDoc.rules.timeGap;
          
          if (timeDiff < requiredGap) {
            const nextTime = new Date(new Date(lastActivity.activityDate).getTime() + requiredGap * 60 * 60 * 1000);
            return res.status(400).json({
              success: false,
              message: `Wait! Drink your next glass after ${requiredGap} hours. Next glass at ${nextTime.toLocaleTimeString()}`
            });
          }
          
          // Store time gap in metadata
          if (!metadata) metadata = {};
          metadata.timeGap = timeDiff;
        }
      }
    }
  }

  // Calculate points (use finalValue which may be from Google Fit)
  const points = Activity.calculatePoints(type, finalValue, unit);

  // Create activity
  const activityData = {
    user: req.user.id,
    type,
    title,
    description,
    value: finalValue, // Use finalValue (from Google Fit or manual)
    unit,
    points,
    challenge,
    activityDate: activityDate || new Date(),
    metadata,
    verified: verified // Auto-verified if from Google Fit
  };

  // Add photo(s) if provided - prioritize uploaded files over URLs/base64
  if (uploadedPhotoUrls.length > 0) {
    // Use uploaded files
    activityData.photo = {
      type: uploadedPhotoUrls.length > 1 ? 'multiple' : 'single',
      urls: uploadedPhotoUrls,
      uploadedAt: new Date(),
      verified: false,
      minPhotos: challengeDoc?.rules?.minPhotos,
      maxPhotos: challengeDoc?.rules?.maxPhotos
    };
    // Set single URL for backward compatibility
    activityData.photo.url = uploadedPhotoUrls[0].url;
  } else if (photo) {
    // Handle URL-based photos (including base64 data URLs)
    if (photo.urls && Array.isArray(photo.urls) && photo.urls.length > 0) {
      // Multiple photos - handle both URL objects and direct strings
      const processedUrls = photo.urls.map(p => {
        // If p is an object with url property
        if (typeof p === 'object' && p.url) {
          return {
            url: p.url,
            description: p.description || '',
            uploadedAt: new Date()
          };
        }
        // If p is a direct string (base64 or URL)
        if (typeof p === 'string') {
          return {
            url: p,
            uploadedAt: new Date()
          };
        }
        return null;
      }).filter(Boolean);

      if (processedUrls.length > 0) {
        activityData.photo = {
          type: processedUrls.length > 1 ? 'multiple' : 'single',
          urls: processedUrls,
          uploadedAt: new Date(),
          verified: false
        };
        // Also set single URL for backward compatibility (first photo)
        activityData.photo.url = processedUrls[0].url;
      }
    } else if (photo.url) {
      // Single photo (backward compatibility)
      activityData.photo = {
        type: 'single',
        url: photo.url,
        uploadedAt: new Date(),
        verified: false
      };
    }
  }

  const activity = await Activity.create(activityData);

  // Update user points and streak
  const user = await User.findById(req.user.id);
  user.addPoints(points);
  user.updateStreak();
  
  // Track yoga sessions if activity is yoga
  if (type === 'yoga') {
    user.trackYogaSession();
  }
  
  await user.save();
  
  // Check for yoga warning
  const yogaWarning = user.checkYogaWarning();

  // Update challenge progress if applicable
  let challengeUpdate = null;
  if (challenge && challengeDoc) {
    if (challengeDoc.status === 'active') {
      // Check if activity type matches challenge type
      if (challengeDoc.type === type) {
        const progress = value; // Use value as progress
        challengeUpdate = challengeDoc.updateParticipantProgress(
          req.user.id, 
          progress, 
          points,
          activityDate || new Date()
        );
        await challengeDoc.save();
        
        // If daily target completed, update user points with bonus (already added in challenge, just update user)
        if (challengeUpdate.dailyCompleted && challengeUpdate.bonusPoints > 0) {
          user.addPoints(challengeUpdate.bonusPoints);
          await user.save();
        }
      }
    }
  } else {
    // Auto-link to active challenge of same type if exists
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const activeChallenge = await Challenge.findOne({
      type: type,
      status: 'active',
      startDate: { $lte: tomorrow },
      endDate: { $gte: today },
      'participants.user': req.user.id
    });
    
    if (activeChallenge) {
      challengeUpdate = activeChallenge.updateParticipantProgress(
        req.user.id,
        value,
        points,
        activityDate || new Date()
      );
      await activeChallenge.save();
      activity.challenge = activeChallenge._id;
      await activity.save();
      
      // If daily target completed, update user points with bonus
      if (challengeUpdate.dailyCompleted && challengeUpdate.bonusPoints > 0) {
        user.addPoints(challengeUpdate.bonusPoints);
        await user.save();
      }
    }
  }

  // Check for badge achievements
  await checkBadgeAchievements(req.user.id, type, points);

  res.status(201).json({
    success: true,
    data: activity,
    challengeUpdate: challengeUpdate ? {
      dailyCompleted: challengeUpdate.dailyCompleted,
      dailyProgress: challengeUpdate.dailyProgress,
      targetValue: challengeUpdate.targetValue,
      remaining: Math.max(0, challengeUpdate.targetValue - challengeUpdate.dailyProgress),
      totalDaysCompleted: challengeUpdate.totalDaysCompleted
    } : null,
    yogaWarning: yogaWarning.warning ? {
      warning: true,
      message: `⚠️ You have ${yogaWarning.daysRemaining} days left to complete ${yogaWarning.sessionsNeeded} yoga session(s). This carries ${yogaWarning.points} points!`,
      daysRemaining: yogaWarning.daysRemaining,
      sessionsNeeded: yogaWarning.sessionsNeeded,
      points: yogaWarning.points
    } : null
  });
});

// @desc    Get my activities
// @route   GET /api/activities
// @access  Private
exports.getMyActivities = asyncHandler(async (req, res) => {
  const { startDate, endDate, type, limit = 50, page = 1 } = req.query;
  const query = { user: req.user.id };

  if (startDate || endDate) {
    query.activityDate = {};
    if (startDate) query.activityDate.$gte = new Date(startDate);
    if (endDate) query.activityDate.$lte = new Date(endDate);
  }

  if (type) query.type = type;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const activities = await Activity.find(query)
    .populate('challenge', 'name type')
    .sort({ activityDate: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Activity.countDocuments(query);

  res.json({
    success: true,
    count: activities.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: activities
  });
});

// @desc    Get all activities (Admin)
// @route   GET /api/activities/all
// @access  Private (Admin/HR)
exports.getAllActivities = asyncHandler(async (req, res) => {
  const { startDate, endDate, type, userId, limit = 50, page = 1 } = req.query;
  const query = {};

  if (userId) query.user = userId;
  if (type) query.type = type;
  if (startDate || endDate) {
    query.activityDate = {};
    if (startDate) query.activityDate.$gte = new Date(startDate);
    if (endDate) query.activityDate.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const activities = await Activity.find(query)
    .populate('user', 'name email')
    .populate('challenge', 'name type')
    .sort({ activityDate: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Activity.countDocuments(query);

  res.json({
    success: true,
    count: activities.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: activities
  });
});

// @desc    Get single activity
// @route   GET /api/activities/:id
// @access  Private
exports.getActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id)
    .populate('user', 'name email')
    .populate('challenge', 'name type');

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: 'Activity not found'
    });
  }

  // Check if user owns activity or is admin
  if (activity.user._id.toString() !== req.user.id.toString() && 
      !['admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this activity'
    });
  }

  res.json({
    success: true,
    data: activity
  });
});

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private
exports.updateActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: 'Activity not found'
    });
  }

  // Check ownership
  if (activity.user.toString() !== req.user.id.toString() && 
      !['admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this activity'
    });
  }

  const { type, title, description, value, unit, activityDate, metadata } = req.body;

  if (type) activity.type = type;
  if (title) activity.title = title;
  if (description) activity.description = description;
  if (value !== undefined) activity.value = value;
  if (unit) activity.unit = unit;
  if (activityDate) activity.activityDate = activityDate;
  if (metadata) activity.metadata = metadata;

  // Recalculate points if value or type changed
  if (value !== undefined || type) {
    activity.points = Activity.calculatePoints(activity.type, activity.value, activity.unit);
  }

  await activity.save();

  res.json({
    success: true,
    data: activity
  });
});

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private
exports.deleteActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: 'Activity not found'
    });
  }

  // Check ownership
  if (activity.user.toString() !== req.user.id.toString() && 
      !['admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this activity'
    });
  }

  // Deduct points from user
  const user = await User.findById(activity.user);
  user.wellnessProfile.totalPoints = Math.max(0, user.wellnessProfile.totalPoints - activity.points);
  await user.save();

  await activity.deleteOne();

  res.json({
    success: true,
    message: 'Activity deleted successfully'
  });
});

// @desc    Get unverified activities (for admin)
// @route   GET /api/activities/unverified
// @access  Private/Admin
exports.getUnverifiedActivities = asyncHandler(async (req, res) => {
  const activities = await Activity.find({
    verified: false,
    photo: { $exists: true, $ne: null }
  })
    .populate('user', 'name email employeeId department')
    .populate('challenge', 'name type')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: activities.length,
    data: activities
  });
});

// @desc    Verify activity (admin only)
// @route   POST /api/activities/:id/verify
// @access  Private/Admin
exports.verifyActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: 'Activity not found'
    });
  }

  // Check if already verified
  if (activity.verified) {
    return res.status(400).json({
      success: false,
      message: 'Activity is already verified'
    });
  }

  // Verify activity
  activity.verified = true;
  activity.verifiedBy = req.user.id;
  activity.verifiedAt = new Date();
  
  // Also verify photo if exists
  if (activity.photo) {
    activity.photo.verified = true;
  }

  await activity.save();

  res.json({
    success: true,
    message: 'Activity verified successfully',
    data: activity
  });
});

// @desc    Reject activity (admin only) - deducts points
// @route   POST /api/activities/:id/reject
// @access  Private/Admin
exports.rejectActivity = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const activity = await Activity.findById(req.params.id)
    .populate('user', 'name email');

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: 'Activity not found'
    });
  }

  // Check if already verified
  if (activity.verified) {
    return res.status(400).json({
      success: false,
      message: 'Cannot reject already verified activity'
    });
  }

  // Deduct points from user
  const user = await User.findById(activity.user._id);
  const pointsToDeduct = activity.points;
  
  // Deduct points
  user.wellnessProfile.totalPoints = Math.max(0, user.wellnessProfile.totalPoints - pointsToDeduct);
  
  // Recalculate level
  user.wellnessProfile.level = Math.floor(user.wellnessProfile.totalPoints / 500) + 1;
  
  // Deduct from monthly points if exists
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlyEntry = user.wellnessProfile.monthlyPoints.find(m => m.month === monthKey);
  if (monthlyEntry) {
    monthlyEntry.points = Math.max(0, monthlyEntry.points - pointsToDeduct);
  }
  
  await user.save();

  // Mark activity as rejected (we can delete it or mark it)
  // Option 1: Delete the activity
  await activity.deleteOne();

  // Option 2: Mark as rejected (if you want to keep record)
  // activity.verified = false;
  // activity.rejected = true;
  // activity.rejectedBy = req.user.id;
  // activity.rejectedAt = new Date();
  // activity.rejectionReason = reason;
  // await activity.save();

  res.json({
    success: true,
    message: `Activity rejected. ${pointsToDeduct} points deducted from user.`,
    data: {
      pointsDeducted: pointsToDeduct,
      userTotalPoints: user.wellnessProfile.totalPoints
    }
  });
});

// Helper function to check badge achievements
async function checkBadgeAchievements(userId, activityType, points) {
  const user = await User.findById(userId).populate('wellnessProfile.badges');
  const badges = await Badge.find({ isActive: true });

  for (const badge of badges) {
    // Check if user already has this badge
    if (user.wellnessProfile.badges.some(b => b._id.toString() === badge._id.toString())) {
      continue;
    }

    let earned = false;

    switch (badge.criteria.type) {
      case 'points':
        if (user.wellnessProfile.totalPoints >= badge.criteria.value) {
          earned = true;
        }
        break;
      case 'streak':
        if (user.wellnessProfile.currentStreak >= badge.criteria.value) {
          earned = true;
        }
        break;
      case 'activities':
        const Activity = require('../models/Activity');
        const activityCount = await Activity.countDocuments({ user: userId });
        if (activityCount >= badge.criteria.value) {
          earned = true;
        }
        break;
    }

    if (earned) {
      user.wellnessProfile.badges.push(badge._id);
      if (badge.pointsReward > 0) {
        user.addPoints(badge.pointsReward);
      }
      await user.save();
    }
  }
}

