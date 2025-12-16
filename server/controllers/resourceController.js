const MentalHealthResource = require('../models/MentalHealthResource');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
exports.getResources = asyncHandler(async (req, res) => {
  const { type, category, tags, featured, search, limit = 50, page = 1 } = req.query;
  const query = { isActive: true };

  if (type) query.type = type;
  if (category) query.category = category;
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    query.tags = { $in: tagArray };
  }
  if (featured === 'true') query.isFeatured = true;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const resources = await MentalHealthResource.find(query)
    .populate('createdBy', 'name')
    .sort({ isFeatured: -1, 'rating.average': -1, createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await MentalHealthResource.countDocuments(query);

  res.json({
    success: true,
    count: resources.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: resources
  });
});

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Private
exports.getResource = asyncHandler(async (req, res) => {
  const resource = await MentalHealthResource.findById(req.params.id)
    .populate('createdBy', 'name email');

  if (!resource) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }

  if (!resource.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Resource is not available'
    });
  }

  res.json({
    success: true,
    data: resource
  });
});

// @desc    Create resource
// @route   POST /api/resources
// @access  Private (Admin/HR)
exports.createResource = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    type,
    category,
    tags,
    content,
    thumbnail,
    author,
    duration,
    language,
    isAnonymous,
    isFeatured
  } = req.body;

  const resource = await MentalHealthResource.create({
    title,
    description,
    type,
    category,
    tags: Array.isArray(tags) ? tags : [],
    content,
    thumbnail,
    author,
    duration,
    language,
    isAnonymous,
    isFeatured,
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    data: resource
  });
});

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private (Admin/HR)
exports.updateResource = asyncHandler(async (req, res) => {
  const resource = await MentalHealthResource.findById(req.params.id);

  if (!resource) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }

  const {
    title,
    description,
    type,
    category,
    tags,
    content,
    thumbnail,
    author,
    duration,
    language,
    isAnonymous,
    isFeatured,
    isActive
  } = req.body;

  if (title) resource.title = title;
  if (description) resource.description = description;
  if (type) resource.type = type;
  if (category) resource.category = category;
  if (tags) resource.tags = Array.isArray(tags) ? tags : [];
  if (content) resource.content = content;
  if (thumbnail) resource.thumbnail = thumbnail;
  if (author) resource.author = author;
  if (duration !== undefined) resource.duration = duration;
  if (language) resource.language = language;
  if (isAnonymous !== undefined) resource.isAnonymous = isAnonymous;
  if (isFeatured !== undefined) resource.isFeatured = isFeatured;
  if (isActive !== undefined) resource.isActive = isActive;

  await resource.save();

  res.json({
    success: true,
    data: resource
  });
});

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Admin/HR)
exports.deleteResource = asyncHandler(async (req, res) => {
  const resource = await MentalHealthResource.findById(req.params.id);

  if (!resource) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }

  await resource.deleteOne();

  res.json({
    success: true,
    message: 'Resource deleted successfully'
  });
});

// @desc    Track resource access
// @route   POST /api/resources/:id/access
// @access  Private
exports.trackAccess = asyncHandler(async (req, res) => {
  const resource = await MentalHealthResource.findById(req.params.id);

  if (!resource) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }

  resource.incrementAccess();
  await resource.save();

  res.json({
    success: true,
    message: 'Access tracked',
    data: { accessCount: resource.accessCount }
  });
});

// @desc    Rate resource
// @route   POST /api/resources/:id/rating
// @access  Private
exports.rateResource = asyncHandler(async (req, res) => {
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be between 1 and 5'
    });
  }

  const resource = await MentalHealthResource.findById(req.params.id);

  if (!resource) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }

  resource.updateRating(rating);
  await resource.save();

  res.json({
    success: true,
    message: 'Rating submitted',
    data: {
      averageRating: resource.rating.average,
      ratingCount: resource.rating.count
    }
  });
});

// @desc    Anonymous mental health check-in
// @route   POST /api/resources/check-in
// @access  Public
exports.anonymousCheckIn = asyncHandler(async (req, res) => {
  const { mood, stressLevel, notes } = req.body;

  // This is a simple check-in endpoint
  // In production, you might want to store this in a separate collection
  // For now, we'll just return a response with resources based on the check-in

  let recommendedCategory = 'general';

  if (stressLevel >= 7) {
    recommendedCategory = 'stress-management';
  } else if (mood <= 3) {
    recommendedCategory = 'depression';
  }

  const resources = await MentalHealthResource.find({
    category: recommendedCategory,
    isActive: true
  })
    .limit(5)
    .select('title description type category thumbnail');

  res.json({
    success: true,
    message: 'Check-in recorded. Here are some resources that might help:',
    data: {
      recommendedCategory,
      resources
    }
  });
});


