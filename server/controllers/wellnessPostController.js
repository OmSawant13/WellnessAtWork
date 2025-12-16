const WellnessPost = require('../models/WellnessPost');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create wellness post/story
// @route   POST /api/wellness-posts
// @access  Private
exports.createPost = asyncHandler(async (req, res) => {
  const { type, content, isStory, tags, mentions } = req.body;

  const post = await WellnessPost.create({
    user: req.user.id,
    type: type || 'post',
    content,
    isStory: isStory || false,
    tags: tags || [],
    mentions: mentions || []
  });

  // Award points for posting
  const user = await User.findById(req.user.id);
  user.addPoints(5); // 5 points for posting
  await user.save();

  await post.populate('user', 'name email');

  res.status(201).json({
    success: true,
    data: post
  });
});

// @desc    Get all posts (feed)
// @route   GET /api/wellness-posts
// @access  Private
exports.getPosts = asyncHandler(async (req, res) => {
  const { type, story } = req.query;
  const query = {};

  if (type) query.type = type;
  if (story === 'true') {
    query.isStory = true;
    query.storyExpiresAt = { $gt: new Date() }; // Only non-expired stories
  } else {
    query.isStory = false;
  }

  const posts = await WellnessPost.find(query)
    .populate('user', 'name email')
    .populate('likes.user', 'name')
    .populate('comments.user', 'name')
    .populate('mentions', 'name')
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    success: true,
    data: posts
  });
});

// @desc    Like/Unlike post
// @route   POST /api/wellness-posts/:id/like
// @access  Private
exports.likePost = asyncHandler(async (req, res) => {
  const post = await WellnessPost.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  const likeIndex = post.likes.findIndex(
    like => like.user.toString() === req.user.id.toString()
  );

  if (likeIndex > -1) {
    // Unlike
    post.likes.splice(likeIndex, 1);
  } else {
    // Like
    post.likes.push({ user: req.user.id });
  }

  await post.save();
  await post.populate('likes.user', 'name');

  res.json({
    success: true,
    data: post
  });
});

// @desc    Comment on post
// @route   POST /api/wellness-posts/:id/comment
// @access  Private
exports.commentPost = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({
      success: false,
      message: 'Please provide comment text'
    });
  }

  const post = await WellnessPost.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  post.comments.push({
    user: req.user.id,
    text
  });

  await post.save();
  await post.populate('comments.user', 'name');

  res.json({
    success: true,
    data: post
  });
});

// @desc    Delete post
// @route   DELETE /api/wellness-posts/:id
// @access  Private
exports.deletePost = asyncHandler(async (req, res) => {
  const post = await WellnessPost.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  if (post.user.toString() !== req.user.id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only delete your own posts'
    });
  }

  await post.deleteOne();

  res.json({
    success: true,
    message: 'Post deleted'
  });
});

