const express = require('express');
const userController = require('../controllers/user.controller');
const { verifyToken, isAuthenticated } = require('../middleware/auth.middleware');

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
router.put('/:id', verifyToken, userController.updateUserProfile);

// Upload profile image
router.post('/:id/profile-image', verifyToken, userController.uploadProfileImage);

// Get user's bookings
router.get('/:id/bookings', verifyToken, userController.getUserBookings);

// Wishlist operations
router.get('/:id/wishlist', verifyToken, userController.getWishlist);
router.post('/:id/wishlist', verifyToken, userController.addToWishlist);
router.delete('/:id/wishlist/:listingId', verifyToken, userController.removeFromWishlist);

// Switch role (guest <-> host)
router.post('/:id/switch-role', verifyToken, userController.switchRole);

// Deactivate account
router.post('/:id/deactivate', verifyToken, userController.deactivateAccount);

module.exports = router;
