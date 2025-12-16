const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

// Google Fit OAuth routes
router.get('/google-fit/connect', protect, authController.connectGoogleFit);
router.get('/google-fit/callback', protect, authController.googleFitCallback);
router.get('/google-fit/status', protect, authController.getGoogleFitStatus);
router.post('/google-fit/disconnect', protect, authController.disconnectGoogleFit);

module.exports = router;

