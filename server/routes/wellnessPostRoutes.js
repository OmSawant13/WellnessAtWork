const express = require('express');
const router = express.Router();
const wellnessPostController = require('../controllers/wellnessPostController');
const { protect } = require('../middleware/auth');

router.post('/', protect, wellnessPostController.createPost);
router.get('/', protect, wellnessPostController.getPosts);
router.post('/:id/like', protect, wellnessPostController.likePost);
router.post('/:id/comment', protect, wellnessPostController.commentPost);
router.delete('/:id', protect, wellnessPostController.deletePost);

module.exports = router;

