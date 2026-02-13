const { Booking, Listing, User, Payment } = require('../models');
const { asyncHandler, APIError } = require('../middleware/error.middleware');
const { calculateBookingPrice, calculateNights, isDateRangeAvailable, generateBookingReference, getPaginationInfo } = require('../utils/helpers');
const { sendBookingConfirmation, sendReviewRequest, sendCancellationEmail } = require('../utils/email');

/**
 * Create a new booking
 * POST /api/bookings
 */
exports.createBooking = asyncHandler(async (req, res) => {
  const { listingId, checkInDate, checkOutDate, numberOfGuests, specialRequests } = req.body;

  // Validate inputs
  if (!listingId || !checkInDate || !checkOutDate) {
    throw new APIError('Listing ID and dates are required', 400);
  }

  // Get listing
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new APIError('Listing not found', 404);
  }

  if (listing.status !== 'published') {
    throw new APIError('This listing is not available', 400);
  }

  // Check guest capacity
  if (numberOfGuests > listing.guests) {
    throw new APIError(`This listing can accommodate maximum ${listing.guests} guests`, 400);
  }

  // Check date validation
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (checkIn >= checkOut) {
    throw new APIError('Check-out date must be after check-in date', 400);
  }

  if (checkIn < new Date()) {
    throw new APIError('Check-in date must be in the future', 400);
  }

  // Check minimum stay
  const nights = calculateNights(checkInDate, checkOutDate);
  if (nights < listing.minimumStay) {
    throw new APIError(`Minimum stay is ${listing.minimumStay} nights`, 400);
  }

  if (listing.maximumStay && nights > listing.maximumStay) {
    throw new APIError(`Maximum stay is ${listing.maximumStay} nights`, 400);
  }

  // Check if dates are available
  const existingBookings = await Booking.find({
    listing: listingId,
    status: { $in: ['confirmed', 'completed'] }
  });

  if (!isDateRangeAvailable(checkInDate, checkOutDate, existingBookings)) {
    throw new APIError('Selected dates are not available', 400);
  }

  // Calculate pricing
  const discount = nights >= 7 ? listing.pricing.weeklyDiscount : nights >= 30 ? listing.pricing.monthlyDiscount : 0;
  const pricing = calculateBookingPrice(
    listing.pricing.basePrice,
    nights,
    listing.pricing.cleaningFee,
    listing.pricing.serviceFee,
    discount
  );

  // Create booking reference
  const bookingReference = generateBookingReference();

  // Create booking
  const booking = new Booking({
    listing: listingId,
    guest: req.user.userId,
    host: listing.host,
    checkInDate,
    checkOutDate,
    numberOfNights: nights,
    numberOfGuests,
    pricing,
    specialRequests,
    status: listing.bookingRules.instantBooking ? 'confirmed' : 'pending',
    paymentStatus: 'pending',
    requiresApproval: listing.bookingRules.requiresApproval
  });

  await booking.save();

  // Populate details for response
  await booking.populate('listing', 'title location.address images');
  await booking.populate('guest', 'firstName lastName email phone');
  await booking.populate('host', 'firstName lastName email');

  // Send confirmation email to guest
  await sendBookingConfirmation(booking.guest.email, booking.guest.firstName, {
    propertyTitle: listing.title,
    checkInDate: checkInDate,
    checkOutDate: checkOutDate,
    totalAmount: pricing.total,
    bookingReference: bookingReference
  });

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: {
      booking,
      bookingReference
    }
  });
});

/**
 * Get all bookings for authenticated user
 * GET /api/bookings
 */
exports.getBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, status } = req.query;

  // Build query based on role
  let query;
  if (role === 'host') {
    query = { host: req.user.userId };
  } else if (role === 'guest') {
    query = { guest: req.user.userId };
  } else {
    // Get bookings where user is either host or guest
    query = {
      $or: [
        { host: req.user.userId },
        { guest: req.user.userId }
      ]
    };
  }

  // Filter by status if provided
  if (status) {
    query.status = status;
  }

  // Get total count
  const total = await Booking.countDocuments(query);

  // Get pagination info
  const pagination = getPaginationInfo(page, limit, total);

  // Get bookings
  const bookings = await Booking.find(query)
    .populate('listing', 'title location.city location.address images pricing.basePrice')
    .populate('guest', 'firstName lastName profileImage email')
    .populate('host', 'firstName lastName profileImage email')
    .skip(pagination.skip)
    .limit(pagination.limit)
    .sort({ checkInDate: -1 });

  res.status(200).json({
    success: true,
    data: {
      bookings,
      pagination
    }
  });
});

/**
 * Get single booking details
 * GET /api/bookings/:id
 */
exports.getBookingDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await Booking.findById(id)
    .populate('listing')
    .populate('guest', 'firstName lastName email phone profileImage')
    .populate('host', 'firstName lastName email phone profileImage hostInfo');

  if (!booking) {
    throw new APIError('Booking not found', 404);
  }

  // Check authorization
  if (
    booking.guest.toString() !== req.user.userId &&
    booking.host.toString() !== req.user.userId &&
    req.user.role !== 'admin'
  ) {
    throw new APIError('Not authorized to view this booking', 403);
  }

  res.status(200).json({
    success: true,
    data: {
      booking
    }
  });
});

/**
 * Update booking status (for host to confirm/reject)
 * PUT /api/bookings/:id/status
 */
exports.updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  const booking = await Booking.findById(id);
  if (!booking) {
    throw new APIError('Booking not found', 404);
  }

  // Check authorization (only host can approve/reject)
  if (booking.host.toString() !== req.user.userId) {
    throw new APIError('Not authorized', 403);
  }

  // Validate status transitions
  const validStatuses = ['confirmed', 'cancelled', 'disputed'];
  if (!validStatuses.includes(status)) {
    throw new APIError('Invalid status', 400);
  }

  // Can only change pending bookings
  if (booking.status !== 'pending' && status !== 'cancelled') {
    throw new APIError('Can only change pending bookings', 400);
  }

  // Update status
  booking.status = status;

  if (status === 'confirmed') {
    booking.approvedAt = new Date();
  } else if (status === 'cancelled') {
    booking.status = 'cancelled';
    booking.cancellationReason = rejectionReason || 'Host rejected';
    // Could process refund here
  }

  await booking.save();

  // Send email notification
  await booking.populate('guest', 'email firstName');
  const emailMessage = status === 'confirmed' ? 'Your booking has been approved!' : 'Your booking has been rejected.';
  
  res.status(200).json({
    success: true,
    message: `Booking ${status}`,
    data: {
      booking
    }
  });
});

/**
 * Cancel booking (by guest)
 * POST /api/bookings/:id/cancel
 */
exports.cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const booking = await Booking.findById(id);
  if (!booking) {
    throw new APIError('Booking not found', 404);
  }

  // Check authorization (guest can cancel their own booking)
  if (booking.guest.toString() !== req.user.userId) {
    throw new APIError('Not authorized', 403);
  }

  // Can't cancel already completed bookings
  if (['completed', 'cancelled'].includes(booking.status)) {
    throw new APIError('Cannot cancel this booking', 400);
  }

  // Check cancellation policy and calculate refund
  const cancellationPolicy = (await Listing.findById(booking.listing)).bookingRules.cancellationPolicy;
  let refundPercentage = 0;

  const checkInDate = new Date(booking.checkInDate);
  const daysUntilCheckIn = Math.ceil((checkInDate - new Date()) / (1000 * 60 * 60 * 24));

  if (cancellationPolicy === 'flexible') {
    refundPercentage = daysUntilCheckIn >= 1 ? 100 : 0;
  } else if (cancellationPolicy === 'moderate') {
    if (daysUntilCheckIn >= 7) refundPercentage = 100;
    else if (daysUntilCheckIn >= 3) refundPercentage = 50;
    else refundPercentage = 0;
  } else if (cancellationPolicy === 'strict') {
    if (daysUntilCheckIn >= 30) refundPercentage = 100;
    else if (daysUntilCheckIn >= 14) refundPercentage = 50;
    else refundPercentage = 0;
  } else if (cancellationPolicy === 'super_strict') {
    refundPercentage = 0;
  }

  const refundAmount = (booking.pricing.total * refundPercentage) / 100;

  // Update booking
  booking.status = 'cancelled';
  booking.cancellationDate = new Date();
  booking.cancellationReason = reason;
  booking.refundAmount = refundAmount;
  booking.paymentStatus = 'refunded';

  await booking.save();

  // Send cancellation email
  await booking.populate('guest', 'email firstName');
  await booking.populate('listing', 'title');
  await sendCancellationEmail(booking.guest.email, booking.guest.firstName, {
    propertyTitle: booking.listing.title,
    bookingReference: booking._id,
    refundAmount: refundAmount
  });

  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully',
    data: {
      booking,
      refund: {
        amount: refundAmount,
        percentage: refundPercentage,
        policy: cancellationPolicy
      }
    }
  });
});

/**
 * Update booking payment status
 * PUT /api/bookings/:id/payment
 */
exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentStatus, paymentMethod, transactionId } = req.body;

  const booking = await Booking.findById(id);
  if (!booking) {
    throw new APIError('Booking not found', 404);
  }

  // Check authorization
  if (booking.guest.toString() !== req.user.userId && req.user.role !== 'admin') {
    throw new APIError('Not authorized', 403);
  }

  // Update payment info
  booking.paymentStatus = paymentStatus;
  if (paymentMethod) booking.paymentMethod = paymentMethod;
  if (transactionId) booking.paymentId = transactionId;

  // If payment is completed, confirm booking
  if (paymentStatus === 'paid') {
    if (booking.status === 'pending') {
      booking.status = 'confirmed';
    }
  }

  await booking.save();

  res.status(200).json({
    success: true,
    message: 'Payment status updated',
    data: {
      booking
    }
  });
});

/**
 * Send booking message (communication between guest and host)
 * POST /api/bookings/:id/messages
 */
exports.sendMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message) {
    throw new APIError('Message is required', 400);
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    throw new APIError('Booking not found', 404);
  }

  // Check authorization
  if (
    booking.guest.toString() !== req.user.userId &&
    booking.host.toString() !== req.user.userId
  ) {
    throw new APIError('Not authorized', 403);
  }

  // Add message
  booking.messages.push({
    sender: req.user.userId,
    message,
    createdAt: new Date()
  });

  await booking.save();

  res.status(201).json({
    success: true,
    message: 'Message sent',
    data: {
      booking
    }
  });
});

/**
 * Get booking messages
 * GET /api/bookings/:id/messages
 */
exports.getMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await Booking.findById(id).populate('messages.sender', 'firstName lastName profileImage');
  if (!booking) {
    throw new APIError('Booking not found', 404);
  }

  // Check authorization
  if (
    booking.guest.toString() !== req.user.userId &&
    booking.host.toString() !== req.user.userId
  ) {
    throw new APIError('Not authorized', 403);
  }

  res.status(200).json({
    success: true,
    data: {
      messages: booking.messages
    }
  });
});

/**
 * Mark booking as completed
 * POST /api/bookings/:id/complete
 */
exports.completeBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await Booking.findById(id);
  if (!booking) {
    throw new APIError('Booking not found', 404);
  }

  // Check authorization (host can mark as completed)
  if (booking.host.toString() !== req.user.userId && req.user.role !== 'admin') {
    throw new APIError('Not authorized', 403);
  }

  // Check if checkout date has passed
  if (new Date() < booking.checkOutDate) {
    throw new APIError('Cannot complete booking before checkout date', 400);
  }

  booking.status = 'completed';
  await booking.save();

  // Send review request email
  await booking.populate('guest', 'email firstName');
  await booking.populate('listing', 'title');
  await sendReviewRequest(booking.guest.email, booking.guest.firstName, {
    propertyTitle: booking.listing.title,
    bookingId: booking._id
  });

  res.status(200).json({
    success: true,
    message: 'Booking marked as completed',
    data: {
      booking
    }
  });
});

/**
 * Get booking statistics
 * GET /api/bookings/stats
 */
exports.getBookingStats = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  // Host stats
  const hostStats = await Booking.aggregate([
    { $match: { host: userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.total' }
      }
    }
  ]);

  // Guest stats
  const guestStats = await Booking.aggregate([
    { $match: { guest: userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      host: hostStats,
      guest: guestStats
    }
  });
});
