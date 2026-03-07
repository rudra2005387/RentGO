const { Review, Booking, Listing, User } = require('../models');
const { asyncHandler, APIError } = require('../middleware/error.middleware');
const { getPaginationInfo, calculateAverageRating } = require('../utils/helpers');
const { clearCache } = require('../middleware/cache.middleware');

/**
 * Create a review for a completed booking
 * POST /api/reviews
 */
exports.createReview = asyncHandler(async (req, res) => {
  const { bookingId, overallRating, comment, ratings, title, highlights } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new APIError('Booking not found', 404);

  if (booking.status !== 'completed') {
    throw new APIError('Can only review completed bookings', 400);
  }

  const isGuest = booking.guest.toString() === req.user.userId;
  const isHost = booking.host.toString() === req.user.userId;

  if (!isGuest && !isHost) {
    throw new APIError('Not authorized to review this booking', 403);
  }

  const reviewType = isGuest ? 'guest_to_host' : 'host_to_guest';
  const targetUser = isGuest ? booking.host : booking.guest;

  // Prevent duplicate reviews
  const existing = await Review.findOne({
    booking: bookingId,
    author: req.user.userId,
    reviewType
  });
  if (existing) {
    throw new APIError('You have already reviewed this booking', 400);
  }

  const review = new Review({
    listing: booking.listing,
    booking: bookingId,
    author: req.user.userId,
    targetUser,
    reviewType,
    overallRating,
    comment,
    ratings: ratings || {},
    title,
    highlights: highlights || [],
    isVerified: true
  });

  await review.save();

  // Update listing stats if guest reviewed the host / listing
  if (reviewType === 'guest_to_host') {
    const listingId = booking.listing;
    const allReviews = await Review.find({ listing: listingId, reviewType: 'guest_to_host' });
    const avgRating = calculateAverageRating(allReviews);

    await Listing.findByIdAndUpdate(listingId, {
      averageRating: avgRating,
      totalReviews: allReviews.length
    });

    // Update host user stats
    const hostReviews = await Review.find({ targetUser, reviewType: 'guest_to_host' });
    const hostAvg = calculateAverageRating(hostReviews);
    await User.findByIdAndUpdate(targetUser, {
      'stats.averageRating': hostAvg,
      'stats.totalReviews': hostReviews.length,
      'stats.totalRatings': hostReviews.length
    });
  }

  // Link review to booking
  if (isGuest) {
    booking.guestReview = review._id;
  } else {
    booking.hostReview = review._id;
  }
  await booking.save();

  await review.populate('author', 'firstName lastName profileImage');
  await clearCache('/api/listings*');
  await clearCache('/api/reviews*');

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    data: { review }
  });
});

/**
 * Get all reviews for a listing
 * GET /api/reviews/listing/:listingId
 */
exports.getListingReviews = asyncHandler(async (req, res) => {
  const { listingId } = req.params;
  const { page = 1, limit = 10, sortBy = 'newest' } = req.query;

  const listing = await Listing.findById(listingId);
  if (!listing) throw new APIError('Listing not found', 404);

  const query = { listing: listingId, isPublic: true, reviewType: 'guest_to_host' };
  const total = await Review.countDocuments(query);
  const pagination = getPaginationInfo(page, limit, total);

  let sort = { createdAt: -1 };
  if (sortBy === 'rating_high') sort = { overallRating: -1 };
  if (sortBy === 'rating_low') sort = { overallRating: 1 };
  if (sortBy === 'helpful') sort = { helpfulCount: -1 };

  const reviews = await Review.find(query)
    .populate('author', 'firstName lastName profileImage')
    .skip(pagination.skip)
    .limit(pagination.limit)
    .sort(sort);

  // Rating distribution (5-star, 4-star, etc.)
  const ratingBreakdown = await Review.aggregate([
    { $match: { listing: listing._id, isPublic: true, reviewType: 'guest_to_host' } },
    { $group: { _id: '$overallRating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);

  // Category averages
  const categoryAverages = await Review.aggregate([
    { $match: { listing: listing._id, isPublic: true, reviewType: 'guest_to_host' } },
    {
      $group: {
        _id: null,
        cleanliness: { $avg: '$ratings.cleanliness' },
        communication: { $avg: '$ratings.communication' },
        checkin: { $avg: '$ratings.checkin' },
        accuracy: { $avg: '$ratings.accuracy' },
        location: { $avg: '$ratings.location' },
        value: { $avg: '$ratings.value' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      reviews,
      pagination,
      averageRating: listing.averageRating,
      totalReviews: total,
      ratingBreakdown,
      categoryAverages: categoryAverages[0] || {}
    }
  });
});

/**
 * Get single review
 * GET /api/reviews/:id
 */
exports.getReviewById = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate('author', 'firstName lastName profileImage')
    .populate('listing', 'title location images')
    .populate('targetUser', 'firstName lastName profileImage');

  if (!review) throw new APIError('Review not found', 404);

  res.status(200).json({
    success: true,
    data: { review }
  });
});

/**
 * Update own review (within 48 h of creation)
 * PUT /api/reviews/:id
 */
exports.updateReview = asyncHandler(async (req, res) => {
  const { overallRating, comment, ratings, title } = req.body;

  const review = await Review.findById(req.params.id);
  if (!review) throw new APIError('Review not found', 404);

  if (review.author.toString() !== req.user.userId) {
    throw new APIError('Not authorized to update this review', 403);
  }

  const hoursSinceCreation = (Date.now() - review.createdAt) / (1000 * 60 * 60);
  if (hoursSinceCreation > 48) {
    throw new APIError('Reviews can only be edited within 48 hours of creation', 400);
  }

  if (overallRating) review.overallRating = overallRating;
  if (comment) review.comment = comment;
  if (ratings) {
    const current = review.ratings ? review.ratings.toObject() : {};
    review.ratings = { ...current, ...ratings };
  }
  if (title !== undefined) review.title = title;

  await review.save();

  // Recalculate listing average
  if (review.reviewType === 'guest_to_host') {
    const allReviews = await Review.find({ listing: review.listing, reviewType: 'guest_to_host' });
    const avgRating = calculateAverageRating(allReviews);
    await Listing.findByIdAndUpdate(review.listing, {
      averageRating: avgRating,
      totalReviews: allReviews.length
    });
  }

  await review.populate('author', 'firstName lastName profileImage');
  await clearCache('/api/listings*');
  await clearCache('/api/reviews*');

  res.status(200).json({
    success: true,
    message: 'Review updated',
    data: { review }
  });
});

/**
 * Delete own review (or admin)
 * DELETE /api/reviews/:id
 */
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new APIError('Review not found', 404);

  if (review.author.toString() !== req.user.userId && req.user.role !== 'admin') {
    throw new APIError('Not authorized', 403);
  }

  const listingId = review.listing;
  const reviewType = review.reviewType;

  await Review.findByIdAndDelete(req.params.id);

  if (reviewType === 'guest_to_host') {
    const allReviews = await Review.find({ listing: listingId, reviewType: 'guest_to_host' });
    const avgRating = calculateAverageRating(allReviews);
    await Listing.findByIdAndUpdate(listingId, {
      averageRating: avgRating,
      totalReviews: allReviews.length
    });
  }

  await clearCache('/api/listings*');
  await clearCache('/api/reviews*');

  res.status(200).json({
    success: true,
    message: 'Review deleted'
  });
});

/**
 * Host responds to a review
 * POST /api/reviews/:id/respond
 */
exports.respondToReview = asyncHandler(async (req, res) => {
  const { comment } = req.body;
  if (!comment) throw new APIError('Response comment is required', 400);

  const review = await Review.findById(req.params.id);
  if (!review) throw new APIError('Review not found', 404);

  if (review.targetUser.toString() !== req.user.userId) {
    throw new APIError('Only the reviewed user can respond', 403);
  }

  review.hostResponse = {
    comment,
    respondedAt: new Date(),
    respondedBy: req.user.userId
  };

  await review.save();
  await review.populate('author', 'firstName lastName profileImage');

  res.status(200).json({
    success: true,
    message: 'Response added',
    data: { review }
  });
});

/**
 * Mark a review as helpful / unhelpful
 * POST /api/reviews/:id/helpful
 */
exports.markHelpful = asyncHandler(async (req, res) => {
  const { helpful } = req.body; // true | false

  const review = await Review.findById(req.params.id);
  if (!review) throw new APIError('Review not found', 404);

  if (helpful) {
    review.helpfulCount += 1;
  } else {
    review.unhelpfulCount += 1;
  }

  await review.save();

  res.status(200).json({
    success: true,
    data: {
      helpfulCount: review.helpfulCount,
      unhelpfulCount: review.unhelpfulCount
    }
  });
});
