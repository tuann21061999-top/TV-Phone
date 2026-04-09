const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/google', authController.googleLogin);

router.post('/send-register-otp', authController.sendRegisterOTP);
router.post('/register', authController.register);
router.post('/login', authController.login);

router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyResetOTP);
router.post('/reset-password', authController.resetPassword);

module.exports = router;