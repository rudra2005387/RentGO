const express = require('express');
const listingController = require('../controllers/listing.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');
const { validateCreateListing, handleValidationErrors } = require('../middleware/validation.middleware');
const { uploadMultipleImages } = require('../middleware/upload.middleware');
const { cache } = require('../middleware/cache.middleware');

const router = express.Router();

/**
 * Public Routes
 */

// Get all listings with filters
router.get('/', cache(120), listingController.getListings);

// Get trending listings
router.get('/trending', cache(300), listingController.getTrendingListings);

// Get featured listings
router.get('/featured', cache(300), listingController.getFeaturedListings);

// Get nearby listings (geolocation) — must be before /:id
router.get('/nearby', cache(120), listingController.getNearbyListings);

// Get single listing details
router.get('/:id', cache(180), listingController.getListingDetails);

// Get similar listings
router.get('/:id/similar', cache(180), listingController.getSimilarListings);

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

// Upload images to listing (URL-based)
router.post(
  '/:id/images',
  verifyToken,
  authorize('host'),
  listingController.uploadListingImages
);

// Upload images to listing (file-based via multer + Cloudinary)
router.post(
  '/:id/upload',
  verifyToken,
  authorize('host'),
  uploadMultipleImages,
  listingController.uploadListingFiles
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
