const express = require('express');
const listingController = require('../controllers/listing.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');
const { validateCreateListing, handleValidationErrors } = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * Public Routes
 */

// Get all listings with filters
router.get('/', listingController.getListings);

// Get trending listings
router.get('/trending', listingController.getTrendingListings);

// Get featured listings
router.get('/featured', listingController.getFeaturedListings);

// Get single listing details
router.get('/:id', listingController.getListingDetails);

// Get availability for listing
router.get('/:id/availability', listingController.getAvailability);

/**
 * Protected Routes - Requires authentication and host role
 */

// Create new listing
router.post(
  '/',
  verifyToken,
  authorize('host'),
  validateCreateListing,
  handleValidationErrors,
  listingController.createListing
);

// Update listing
router.put(
  '/:id',
  verifyToken,
  authorize('host'),
  listingController.updateListing
);

// Upload images to listing
router.post(
  '/:id/images',
  verifyToken,
  authorize('host'),
  listingController.uploadListingImages
);

// Delete image from listing
router.delete(
  '/:id/images/:imageIndex',
  verifyToken,
  authorize('host'),
  listingController.deleteListingImage
);

// Publish listing
router.post(
  '/:id/publish',
  verifyToken,
  authorize('host'),
  listingController.publishListing
);

// Archive listing
router.post(
  '/:id/archive',
  verifyToken,
  authorize('host'),
  listingController.archiveListing
);

// Delete listing
router.delete(
  '/:id',
  verifyToken,
  authorize('host'),
  listingController.deleteListing
);

// Set availability for listing
router.post(
  '/:id/availability',
  verifyToken,
  authorize('host'),
  listingController.setAvailability
);

module.exports = router;
