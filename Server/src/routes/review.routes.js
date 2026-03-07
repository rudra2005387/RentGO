const express = require('express');
const reviewController = require('../controllers/review.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateCreateReview, handleValidationErrors } = require('../middleware/validation.middleware');
const { cache } = require('../middleware/cache.middleware');

const router = express.Router();

/* ── Public ── */
router.get('/listing/:listingId', cache(180), reviewController.getListingReviews);
router.get('/:id', reviewController.getReviewById);

/* ── Protected ── */
router.post(
  '/',
  verifyToken,
  validateCreateReview,
  handleValidationErrors,
  reviewController.createReview
);
router.put('/:id', verifyToken, reviewController.updateReview);
router.delete('/:id', verifyToken, reviewController.deleteReview);
router.post('/:id/respond', verifyToken, reviewController.respondToReview);
router.post('/:id/helpful', verifyToken, reviewController.markHelpful);

module.exports = router;
