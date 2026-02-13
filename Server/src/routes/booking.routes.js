const express = require('express');
const bookingController = require('../controllers/booking.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateCreateBooking, handleValidationErrors } = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * All booking routes require authentication
 */

// Create new booking
router.post(
  '/',
  verifyToken,
  validateCreateBooking,
  handleValidationErrors,
  bookingController.createBooking
);

// Get all bookings (for authenticated user)
router.get('/', verifyToken, bookingController.getBookings);

// Get booking statistics
router.get('/stats', verifyToken, bookingController.getBookingStats);

// Get single booking details
router.get('/:id', verifyToken, bookingController.getBookingDetails);

// Update booking status (host approval)
router.put(
  '/:id/status',
  verifyToken,
  bookingController.updateBookingStatus
);

// Update payment status
router.put(
  '/:id/payment',
  verifyToken,
  bookingController.updatePaymentStatus
);

// Cancel booking (guest)
router.post(
  '/:id/cancel',
  verifyToken,
  bookingController.cancelBooking
);

// Mark booking as completed (host)
router.post(
  '/:id/complete',
  verifyToken,
  bookingController.completeBooking
);

// Booking messages
router.post('/:id/messages', verifyToken, bookingController.sendMessage);
router.get('/:id/messages', verifyToken, bookingController.getMessages);

module.exports = router;
