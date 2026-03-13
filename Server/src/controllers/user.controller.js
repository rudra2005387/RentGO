const { User, Listing, Booking } = require('../models');
const { asyncHandler, APIError } = require('../middleware/error.middleware');
const { getPaginationInfo } = require('../utils/helpers');

/**
 * Get user profile by ID
 * GET /api/users/:id
 */
exports.getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select('-password -failedLoginAttempts -lockUntil')
    .populate('wishlist', 'title location.city pricing.basePrice images');

  if (!user) {
    throw new APIError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      user: user.getProfile()
    }
  });
});

/**
 * Update user profile
 * PUT /api/users/:id
 */
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phone, bio, address, preferences } = req.body;

  // Check authorization - user can only update their own profile
  if (req.user.userId !== id) {
    throw new APIError('Not authorized to update this profile', 403);
  }

  // Fields that can be updated
  const updateData = {};
  if (firstName) updateData.firstName = firstName.trim();
  if (lastName) updateData.lastName = lastName.trim();
  if (phone) updateData.phone = phone;
  if (bio) updateData.bio = bio;
  if (address) updateData.address = address;
  if (preferences) updateData.preferences = preferences;

  const user = await User.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password -failedLoginAttempts -lockUntil');

  if (!user) {
    throw new APIError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.getProfile()
    }
  });
});

/**
 * Upload profile image
 * POST /api/users/:id/profile-image
 */
exports.uploadProfileImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check authorization
  if (req.user.userId !== id) {
    throw new APIError('Not authorized', 403);
  }

  let imageUrl = req.body.imageUrl;

  // If file was uploaded via multer, upload to Cloudinary
  if (req.file) {
    const { uploadFromBuffer } = require('../utils/cloudinary');
    const result = await uploadFromBuffer(req.file.buffer, 'rentgo/avatars');
    imageUrl = result.url;
  }

  if (!imageUrl) {
    throw new APIError('Image URL or file is required', 400);
  }

  const user = await User.findByIdAndUpdate(
    id,
    { profileImage: imageUrl },
    { new: true }
  ).select('-password');

  if (!user) {
    throw new APIError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Profile image updated',
    data: {
      user: user.getProfile()
    }
  });
});

/**
 * Get user's listings
 * GET /api/users/:id/listings
 */
exports.getUserListings = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10, status } = req.query;

  // Check if user exists
  const user = await User.findById(id);
  if (!user) {
    throw new APIError('User not found', 404);
  }

  // Build query
  const query = { host: id };
  if (status) query.status = status;

  // Get total count
  const total = await Listing.countDocuments(query);

  // Get pagination info
  const pagination = getPaginationInfo(page, limit, total);

  // Get listings
  const listings = await Listing.find(query)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      listings,
      pagination
    }
  });
});

/**
 * Get user's bookings
 * GET /api/users/:id/bookings
 */
exports.getUserBookings = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10, status } = req.query;

  // Check authorization
  if (req.user.userId !== id && req.user.role !== 'admin') {
    throw new APIError('Not authorized to view these bookings', 403);
  }

  // Build query - can be guest or host
  const query = {
    $or: [{ guest: id }, { host: id }]
  };
  if (status) query.status = status;

  // Get total count
  const total = await Booking.countDocuments(query);

  // Get pagination info
  const pagination = getPaginationInfo(page, limit, total);

  // Get bookings
  const bookings = await Booking.find(query)
    .populate('listing', 'title location.city images')
    .populate('guest', 'firstName lastName profileImage')
    .populate('host', 'firstName lastName profileImage')
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
 * Add listing to wishlist
 * POST /api/users/:id/wishlist
 */
exports.addToWishlist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { listingId } = req.body;

  // Check authorization
  if (req.user.userId !== id) {
    throw new APIError('Not authorized', 403);
  }

  if (!listingId) {
    throw new APIError('Listing ID is required', 400);
  }

  // Check if listing exists
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new APIError('Listing not found', 404);
  }

  // Add to wishlist if not already there
  const user = await User.findByIdAndUpdate(
    id,
    { $addToSet: { wishlist: listingId } },
    { new: true }
  ).populate('wishlist', 'title location.city pricing.basePrice images');

  res.status(200).json({
    success: true,
    message: 'Added to wishlist',
    data: {
      user: user.getProfile()
    }
  });
});

/**
 * Remove listing from wishlist
 * DELETE /api/users/:id/wishlist/:listingId
 */
exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const { id, listingId } = req.params;

  // Check authorization
  if (req.user.userId !== id) {
    throw new APIError('Not authorized', 403);
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $pull: { wishlist: listingId } },
    { new: true }
  ).populate('wishlist', 'title location.city pricing.basePrice images');

  res.status(200).json({
    success: true,
    message: 'Removed from wishlist',
    data: {
      user: user.getProfile()
    }
  });
});

/**
 * Get user's wishlist
 * GET /api/users/:id/wishlist
 */
exports.getWishlist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const user = await User.findById(id);
  if (!user) {
    throw new APIError('User not found', 404);
  }

  // Get wishlist with pagination
  const total = user.wishlist.length;
  const pagination = getPaginationInfo(page, limit, total);

  const wishListings = await User.findById(id)
    .populate({
      path: 'wishlist',
      options: {
        skip: pagination.skip,
        limit: pagination.limit
      }
    })
    .select('wishlist');

  res.status(200).json({
    success: true,
    data: {
      wishlist: wishListings.wishlist || [],
      pagination
    }
  });
});

/**
 * Get user statistics
 * GET /api/users/:id/stats
 */
exports.getUserStats = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw new APIError('User not found', 404);
  }

  // Get stats based on role
  let stats = {
    userId: user._id,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    totalRatings: user.stats.totalRatings || 0,
    averageRating: user.stats.averageRating || 0,
    totalReviews: user.stats.totalReviews || 0
  };

  if (user.role === 'host') {
    // Host stats
    const hostListings = await Listing.countDocuments({ host: id });
    const hostBookings = await Booking.countDocuments({ host: id });
    const completedBookings = await Booking.countDocuments({ host: id, status: 'completed' });
    const upcomingGuestsAgg = await Booking.aggregate([
      {
        $match: {
          host: user._id,
          status: { $in: ['pending', 'confirmed'] },
          checkInDate: { $gte: new Date() }
        }
      },
      {
        $group: {
          _id: null,
          totalGuests: { $sum: '$numberOfGuests' }
        }
      }
    ]);

    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const totalEarnings = await Booking.aggregate([
      { $match: { host: user._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    const monthlyEarnings = await Booking.aggregate([
      {
        $match: {
          host: user._id,
          status: 'completed',
          checkOutDate: { $gte: currentMonthStart }
        }
      },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenueSeriesRaw = await Booking.aggregate([
      {
        $match: {
          host: user._id,
          status: 'completed',
          checkOutDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            y: { $year: '$checkOutDate' },
            m: { $month: '$checkOutDate' }
          },
          total: { $sum: '$pricing.total' }
        }
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } }
    ]);

    const monthlyRevenueSeries = monthlyRevenueSeriesRaw.map((x) => ({
      month: `${x._id.y}-${String(x._id.m).padStart(2, '0')}`,
      revenue: Math.round(x.total)
    }));

    // Occupancy approximation: booked nights / total available nights over last 30 days.
    const occupancyWindowDays = 30;
    const bookingNightsAgg = await Booking.aggregate([
      {
        $match: {
          host: user._id,
          status: { $in: ['confirmed', 'completed'] },
          checkOutDate: { $gte: new Date(Date.now() - occupancyWindowDays * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: null,
          nights: { $sum: '$numberOfNights' }
        }
      }
    ]);

    const totalNightsCapacity = Math.max(hostListings * occupancyWindowDays, 1);
    const occupancyRate = Math.min(
      100,
      Math.round(((bookingNightsAgg[0]?.nights || 0) / totalNightsCapacity) * 100)
    );

    stats = {
      ...stats,
      totalListings: hostListings,
      totalBookings: hostBookings,
      completedBookings,
      totalEarnings: totalEarnings[0]?.total || 0,
      monthlyEarnings: monthlyEarnings[0]?.total || 0,
      upcomingGuests: upcomingGuestsAgg[0]?.totalGuests || 0,
      occupancyRate,
      monthlyRevenueSeries,
      superhost: user.hostInfo?.superhost || false,
      responseRate: user.hostInfo?.responseRate || 0
    };
  } else {
    // Guest stats
    const guestBookings = await Booking.countDocuments({
      guest: id,
      status: 'completed'
    });
    const wishlistCount = user.wishlist.length;

    stats = {
      ...stats,
      totalBookings: guestBookings,
      wishlistCount,
      identityVerified: user.isIdentityVerified || false
    };
  }

  res.status(200).json({
    success: true,
    data: {
      stats
    }
  });
});

/**
 * Switch user role (guest to host or vice versa)
 * POST /api/users/:id/switch-role
 */
exports.switchRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newRole } = req.body;

  // Check authorization
  if (req.user.userId !== id) {
    throw new APIError('Not authorized', 403);
  }

  if (!['guest', 'host'].includes(newRole)) {
    throw new APIError('Invalid role', 400);
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role: newRole },
    { new: true }
  ).select('-password');

  if (!user) {
    throw new APIError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    message: `Role switched to ${newRole}`,
    data: {
      user: user.getProfile()
    }
  });
});

/**
 * Get user reviews (as host and guest)
 * GET /api/users/:id/reviews
 */
exports.getUserReviews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10, type } = req.query;

  const user = await User.findById(id);
  if (!user) {
    throw new APIError('User not found', 404);
  }

  const Review = require('../models/Review');

  // Build query
  const query = { targetUser: id };
  if (type) query.reviewType = type; // 'guest_to_host' or 'host_to_guest'

  const total = await Review.countDocuments(query);
  const pagination = getPaginationInfo(page, limit, total);

  const reviews = await Review.find(query)
    .populate('author', 'firstName lastName profileImage')
    .populate('listing', 'title location')
    .skip(pagination.skip)
    .limit(pagination.limit)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      reviews,
      pagination,
      user: {
        avatar: user.profileImage,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role
      }
    }
  });
});

/**
 * Deactivate account
 * POST /api/users/:id/deactivate
 */
exports.deactivateAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check authorization
  if (req.user.userId !== id) {
    throw new APIError('Not authorized', 403);
  }

  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  ).select('-password');

  if (!user) {
    throw new APIError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Account deactivated successfully'
  });
});
