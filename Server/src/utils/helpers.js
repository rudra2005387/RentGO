const jwt = require('jsonwebtoken');

/**
 * Generate JWT Token
 */
exports.generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Calculate booking price
 */
exports.calculateBookingPrice = (basePricePerNight, numberOfNights, cleaningFee, serviceFee, discount = 0) => {
  const subtotal = basePricePerNight * numberOfNights;
  const discountAmount = (subtotal * discount) / 100;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount = (subtotalAfterDiscount * 0.1); // 10% tax
  const total = subtotalAfterDiscount + cleaningFee + serviceFee + taxAmount;

  return {
    nightly_rate: basePricePerNight,
    subtotal,
    cleaningFee,
    serviceFee,
    discount: discountAmount,
    taxes: taxAmount,
    total: Math.round(total * 100) / 100
  };
};

/**
 * Calculate number of nights
 */
exports.calculateNights = (checkInDate, checkOutDate) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const diffTime = Math.abs(checkOut - checkIn);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Check if date range is available
 */
exports.isDateRangeAvailable = (checkInDate, checkOutDate, bookings) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  for (let booking of bookings) {
    const bookingCheckIn = new Date(booking.checkInDate);
    const bookingCheckOut = new Date(booking.checkOutDate);

    // Check if there's any overlap
    if (checkIn < bookingCheckOut && checkOut > bookingCheckIn) {
      return false;
    }
  }

  return true;
};

/**
 * Apply discount on price
 */
exports.applyDiscount = (price, discountPercentage) => {
  return price - (price * discountPercentage) / 100;
};

/**
 * Generate Booking Reference Number
 */
exports.generateBookingReference = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'BK-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Format currency
 */
exports.formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Get filter query for available listings
 */
exports.getAvailabilityFilter = (checkInDate, checkOutDate) => {
  return {
    $or: [
      {
        'availability': {
          $not: {
            $elemMatch: {
              startDate: { $lte: checkOutDate },
              endDate: { $gte: checkInDate },
              available: false
            }
          }
        }
      },
      { 'availability': { $size: 0 } }
    ]
  };
};

/**
 * Calculate average rating
 */
exports.calculateAverageRating = (reviews) => {
  if (reviews.length === 0) return 0;
  
  const sum = reviews.reduce((acc, review) => acc + review.overallRating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
};

/**
 * Generate pagination info
 */
exports.getPaginationInfo = (page = 1, limit = 10, total) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;
  const totalPages = Math.ceil(total / limitNum);

  return {
    page: pageNum,
    limit: limitNum,
    skip,
    total,
    totalPages,
    hasNextPage: pageNum < totalPages,
    hasPrevPage: pageNum > 1
  };
};
