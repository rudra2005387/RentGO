const express = require('express');
const bookingController = require('../controllers/booking.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { sessionCacheMiddleware } = require('../middleware/cache.middleware');
const { validateCreateBooking, handleValidationErrors } = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * All booking routes require authentication
 */

// Create new booking
router.post(
  '/',
  verifyToken,
  sessionCacheMiddleware,
  validateCreateBooking,
  handleValidationErrors,
  bookingController.createBooking
);

// Get all bookings (for authenticated user)
router.get('/', verifyToken, sessionCacheMiddleware, bookingController.getBookings);

// Get booking statistics
router.get('/stats', verifyToken, sessionCacheMiddleware, bookingController.getBookingStats);

// Get completed bookings pending guest review
router.get('/review-pending', verifyToken, sessionCacheMiddleware, bookingController.getPendingReviews);

// Get single booking details
router.get('/:id', verifyToken, sessionCacheMiddleware, bookingController.getBookingDetails);

// Update booking status (host approval)
router.put(
  '/:id/status',
  verifyToken,
  sessionCacheMiddleware,
  bookingController.updateBookingStatus
);

// Update payment status
router.put(
  '/:id/payment',
  verifyToken,
  sessionCacheMiddleware,
  bookingController.updatePaymentStatus
);

// Cancel booking (guest)
router.post(
  '/:id/cancel',
  verifyToken,
  sessionCacheMiddleware,
  bookingController.cancelBooking
);

// Mark booking as completed (host)
router.post(
  '/:id/complete',
  verifyToken,
  sessionCacheMiddleware,
  bookingController.completeBooking
);

// Booking messages
router.post('/:id/messages', verifyToken, sessionCacheMiddleware, bookingController.sendMessage);
router.get('/:id/messages', verifyToken, sessionCacheMiddleware, bookingController.getMessages);

module.exports = router;
