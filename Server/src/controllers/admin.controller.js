const mongoose = require('mongoose');
const { User, Listing, Booking, Review, Payment } = require('../models');
const { asyncHandler, APIError } = require('../middleware/error.middleware');
const { getPaginationInfo } = require('../utils/helpers');

/**
 * Dashboard overview
 * GET /api/admin/dashboard
 */
exports.getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalListings,
    totalBookings,
    totalReviews,
    activeUsers,
    publishedListings,
    revenueData,
    recentBookings
  ] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments(),
    Booking.countDocuments(),
    Review.countDocuments(),
    User.countDocuments({ isActive: true }),
    Listing.countDocuments({ status: 'published' }),
    Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$pricing.total' }, count: { $sum: 1 } } }
    ]),
    Booking.find()
      .populate('listing', 'title')
      .populate('guest', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10)
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalUsers,
        activeUsers,
        totalListings,
        publishedListings,
        totalBookings,
        totalReviews,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        paidBookings: revenueData[0]?.count || 0
      },
      recentBookings
    }
  });
});

/**
 * List all users
 * GET /api/admin/users
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, status, search } = req.query;

  const query = {};
  if (role) query.role = role;
  if (status === 'active') query.isActive = true;
  if (status === 'inactive') query.isActive = false;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await User.countDocuments(query);
  const pagination = getPaginationInfo(page, limit, total);

  const users = await User.find(query)
    .select('-password -failedLoginAttempts -lockUntil')
    .skip(pagination.skip)
    .limit(pagination.limit)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { users, pagination }
  });
});

/**
 * Activate / deactivate / change role
 * PUT /api/admin/users/:id/status
 */
exports.updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive, role } = req.body;

  const updateData = {};
  if (typeof isActive === 'boolean') updateData.isActive = isActive;
  if (role && ['guest', 'host', 'admin'].includes(role)) updateData.role = role;

  const user = await User.findByIdAndUpdate(id, updateData, { new: true })
    .select('-password -failedLoginAttempts -lockUntil');

  if (!user) throw new APIError('User not found', 404);

  res.status(200).json({
    success: true,
    message: 'User status updated',
    data: { user }
  });
});

/**
 * List all listings (any status)
 * GET /api/admin/listings
 */
exports.getAllListings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;

  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { 'location.city': { $regex: search, $options: 'i' } }
    ];
  }

  const total = await Listing.countDocuments(query);
  const pagination = getPaginationInfo(page, limit, total);

  const listings = await Listing.find(query)
    .populate('host', 'firstName lastName email')
    .skip(pagination.skip)
    .limit(pagination.limit)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { listings, pagination }
  });
});

/**
 * Update listing status (publish / block / archive)
 * PUT /api/admin/listings/:id/status
 */
exports.updateListingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['draft', 'published', 'archived', 'blocked'].includes(status)) {
    throw new APIError('Invalid status', 400);
  }

  const listing = await Listing.findByIdAndUpdate(
    id,
    { status, isActive: status !== 'blocked' && status !== 'archived' },
    { new: true }
  ).populate('host', 'firstName lastName email');

  if (!listing) throw new APIError('Listing not found', 404);

  res.status(200).json({
    success: true,
    message: `Listing ${status}`,
    data: { listing }
  });
});

/**
 * List all bookings
 * GET /api/admin/bookings
 */
exports.getAllBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const query = {};
  if (status) query.status = status;

  const total = await Booking.countDocuments(query);
  const pagination = getPaginationInfo(page, limit, total);

  const bookings = await Booking.find(query)
    .populate('listing', 'title location.city')
    .populate('guest', 'firstName lastName email')
    .populate('host', 'firstName lastName email')
    .skip(pagination.skip)
    .limit(pagination.limit)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { bookings, pagination }
  });
});

/**
 * List all reviews (optionally only flagged)
 * GET /api/admin/reviews
 */
exports.getAllReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, flagged } = req.query;

  const query = {};
  if (flagged === 'true') query.isFlagged = true;

  const total = await Review.countDocuments(query);
  const pagination = getPaginationInfo(page, limit, total);

  const reviews = await Review.find(query)
    .populate('author', 'firstName lastName email')
    .populate('listing', 'title')
    .populate('targetUser', 'firstName lastName')
    .skip(pagination.skip)
    .limit(pagination.limit)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { reviews, pagination }
  });
});

/**
 * Flag / unflag a review
 * POST /api/admin/reviews/:id/flag
 */
exports.flagReview = asyncHandler(async (req, res) => {
  const { isFlagged, flagReason } = req.body;

  const review = await Review.findById(req.params.id);
  if (!review) throw new APIError('Review not found', 404);

  review.isFlagged = isFlagged !== false;
  if (flagReason) review.flagReason = flagReason;
  await review.save();

  res.status(200).json({
    success: true,
    message: review.isFlagged ? 'Review flagged' : 'Review unflagged',
    data: { review }
  });
});

/**
 * Revenue analytics
 * GET /api/admin/revenue
 */
exports.getRevenueStats = asyncHandler(async (req, res) => {
  const { period = 'monthly' } = req.query;

  let dateFormat;
  if (period === 'daily') dateFormat = '%Y-%m-%d';
  else if (period === 'weekly') dateFormat = '%Y-W%V';
  else dateFormat = '%Y-%m';

  const revenueByPeriod = await Booking.aggregate([
    { $match: { paymentStatus: 'paid' } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
        revenue: { $sum: '$pricing.total' },
        bookings: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } },
    { $limit: 12 }
  ]);

  const revenueByStatus = await Booking.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        revenue: { $sum: '$pricing.total' }
      }
    }
  ]);

  const topListings = await Booking.aggregate([
    { $match: { paymentStatus: 'paid' } },
    {
      $group: {
        _id: '$listing',
        revenue: { $sum: '$pricing.total' },
        bookings: { $sum: 1 }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'listings',
        localField: '_id',
        foreignField: '_id',
        as: 'listing'
      }
    },
    { $unwind: '$listing' },
    {
      $project: {
        title: '$listing.title',
        city: '$listing.location.city',
        revenue: 1,
        bookings: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      revenueByPeriod,
      revenueByStatus,
      topListings
    }
  });
});
