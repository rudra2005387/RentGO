const express = require('express');
const userController = require('../controllers/user.controller');
const { verifyToken, isAuthenticated } = require('../middleware/auth.middleware');
const { sessionCacheMiddleware } = require('../middleware/cache.middleware');
const { uploadSingleImage } = require('../middleware/upload.middleware');

const router = express.Router();

/**
 * Public Routes
 */

// Get user profile (public info only)
router.get('/:id', userController.getUserProfile);

// Get user stats (public)
router.get('/:id/stats', userController.getUserStats);

// Get user reviews (public)
router.get('/:id/reviews', userController.getUserReviews);

// Get user listings (public)
router.get('/:id/listings', userController.getUserListings);

/**
 * Protected Routes - Requires authentication
 */

// Update user profile
router.put('/:id', verifyToken, sessionCacheMiddleware, userController.updateUserProfile);

// Upload profile image (supports both file upload and URL)
router.post('/:id/profile-image', verifyToken, sessionCacheMiddleware, uploadSingleImage, userController.uploadProfileImage);

// Get user's bookings
router.get('/:id/bookings', verifyToken, sessionCacheMiddleware, userController.getUserBookings);

// Wishlist operations
router.get('/:id/wishlist', verifyToken, sessionCacheMiddleware, userController.getWishlist);
router.post('/:id/wishlist', verifyToken, sessionCacheMiddleware, userController.addToWishlist);
router.delete('/:id/wishlist/:listingId', verifyToken, sessionCacheMiddleware, userController.removeFromWishlist);

// Switch role (guest <-> host)
router.post('/:id/switch-role', verifyToken, sessionCacheMiddleware, userController.switchRole);

// Deactivate account
router.post('/:id/deactivate', verifyToken, sessionCacheMiddleware, userController.deactivateAccount);

module.exports = router;
