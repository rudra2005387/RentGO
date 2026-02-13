const express = require('express');
const authController = require('../controllers/auth.controller');
const { verifyToken, isAuthenticated } = require('../middleware/auth.middleware');
const { validateRegister, validateLogin, validateCreateBooking, handleValidationErrors } = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * Public Routes
 */

// Register new user
router.post('/register', validateRegister, handleValidationErrors, authController.register);

// Login user
router.post('/login', validateLogin, handleValidationErrors, authController.login);

// Forgot password - Send reset email
router.post('/forgot-password', authController.forgotPassword);

// Verify email token
router.post('/verify-email', authController.verifyEmail);

// Refresh token
router.post('/refresh-token', authController.refreshToken);

/**
 * Protected Routes - Requires authentication
 */

// Logout user
router.post('/logout', verifyToken, authController.logout);

// Get current authenticated user
router.get('/me', verifyToken, authController.getCurrentUser);

// Change password
router.post('/change-password', verifyToken, authController.changePassword);

module.exports = router;
