const { Listing, User, Booking, Review } = require('../models');
const { asyncHandler, APIError } = require('../middleware/error.middleware');
const { getPaginationInfo, getAvailabilityFilter, calculateAverageRating } = require('../utils/helpers');
const { uploadImage, deleteImage, uploadFromBuffer } = require('../utils/cloudinary');
const { clearCache } = require('../middleware/cache.middleware');

/**
 * Create a new listing
 * POST /api/listings
 */
exports.createListing = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    propertyType,
    roomType,
    guests,
    bedrooms,
    beds,
    bathrooms,
    location,
    pricing,
    amenities,
    bookingRules,
    tags
  } = req.body;

  // Check if user is host
  const user = await User.findById(req.user.userId);
  if (user.role !== 'host') {
    throw new APIError('Only hosts can create listings', 403);
  }

  // Create new listing
  const listing = new Listing({
    host: req.user.userId,
    title,
    description,
    propertyType,
    roomType,
    guests,
    bedrooms,
    beds,
    bathrooms,
    location,
    pricing,
    amenities,
    bookingRules,
    tags,
    status: 'draft'
  });

  await listing.save();

  await clearCache('/api/listings*');

  res.status(201).json({
    success: true,
    message: 'Listing created successfully',
    data: {
      listing
    }
  });
});

/**
 * Get all listings with filters and search
 * GET /api/listings
 */
exports.getListings = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    search,
    city,
    propertyType,
    minPrice,
    maxPrice,
    guests,
    checkInDate,
    checkOutDate,
    amenities,
    rating,
    sortBy = 'newest'
  } = req.query;

  // Build query
  const query = { status: 'published', isActive: true };
  const andConditions = [];

  // Search by title or description
  if (search) {
    andConditions.push({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    });
  }

  // Filter by city
  if (city) {
    query['location.city'] = { $regex: city, $options: 'i' };
  }

  // Filter by property type
  if (propertyType) {
    query.propertyType = propertyType;
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    query['pricing.basePrice'] = {};
    if (minPrice) query['pricing.basePrice'].$gte = parseFloat(minPrice);
    if (maxPrice) query['pricing.basePrice'].$lte = parseFloat(maxPrice);
  }

  // Filter by number of guests
  if (guests) {
    query.guests = { $gte: parseInt(guests) };
  }

  // Filter by availability — exclude listings with conflicting bookings and manual blocks
  if (checkInDate && checkOutDate) {
    const conflictingListings = await Booking.distinct('listing', {
      status: { $in: ['pending', 'confirmed'] },
      checkInDate: { $lt: new Date(checkOutDate) },
      checkOutDate: { $gt: new Date(checkInDate) }
    });
    query._id = { $nin: conflictingListings };
    andConditions.push(getAvailabilityFilter(checkInDate, checkOutDate));
  }

  // Filter by amenities
  if (amenities) {
    const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
    amenitiesArray.forEach(amenity => {
      const [key, value] = amenity.split('.');
      if (key && value) {
        query[`amenities.${key}.${value}`] = true;
      }
    });
  }

  // Filter by minimum rating
  if (rating) {
    query.averageRating = { $gte: parseFloat(rating) };
  }

  // Combine $and conditions if any
  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  // Get total count
  const total = await Listing.countDocuments(query);

  // Get pagination info
  const pagination = getPaginationInfo(page, limit, total);

  // Sort options
  let sortOption = { createdAt: -1 }; // newest by default
  if (sortBy === 'price_low') sortOption = { 'pricing.basePrice': 1 };
  if (sortBy === 'price_high') sortOption = { 'pricing.basePrice': -1 };
  if (sortBy === 'rating') sortOption = { averageRating: -1 };
  if (sortBy === 'popular') sortOption = { totalBookings: -1 };

  // Get listings
  const listings = await Listing.find(query)
    .populate('host', 'firstName lastName profileImage hostInfo')
    .skip(pagination.skip)
    .limit(pagination.limit)
    .sort(sortOption);

  res.status(200).json({
    success: true,
    data: {
      listings,
      pagination,
      filters: {
        search,
        city,
        propertyType,
        priceRange: { min: minPrice, max: maxPrice },
        guests,
        dates: { checkIn: checkInDate, checkOut: checkOutDate },
        rating
      }
    }
  });
});

/**
 * Get single listing details
 * GET /api/listings/:id
 */
exports.getListingDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate('host', 'firstName lastName profileImage hostInfo stats');

  if (!listing) {
    throw new APIError('Listing not found', 404);
  }

  // Fetch reviews separately (the Listing model has no embedded reviews ref)
  const reviews = await Review.find({ listing: id, isPublic: true })
    .populate('author', 'firstName lastName profileImage')
    .limit(10)
    .sort({ createdAt: -1 });

  const reviewCount = await Review.countDocuments({ listing: id, isPublic: true });

  res.status(200).json({
    success: true,
    data: {
      listing,
      reviews,
      reviewCount
    }
  });
});

/**
 * Update listing
 * PUT /api/listings/:id
 */
exports.updateListing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Get listing and check authorization
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new APIError('Listing not found', 404);
  }

  if (listing.host.toString() !== req.user.userId) {
    throw new APIError('Not authorized to update this listing', 403);
  }

  // Update fields
  Object.keys(updates).forEach(key => {
    if (key !== 'host' && key !== '_id') {
      listing[key] = updates[key];
    }
  });

  listing.lastModifiedBy = req.user.userId;
  await listing.save();

  await clearCache('/api/listings*');

  res.status(200).json({
    success: true,
    message: 'Listing updated successfully',
    data: {
      listing
    }
  });
});

/**
 * Upload listing images
 * POST /api/listings/:id/images
 */
exports.uploadListingImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { imageUrls, isCover } = req.body;

  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    throw new APIError('Image URLs are required', 400);
  }

  // Get listing and check authorization
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new APIError('Listing not found', 404);
  }

  if (listing.host.toString() !== req.user.userId) {
    throw new APIError('Not authorized', 403);
  }

  // Add images to listing
  imageUrls.forEach((url, index) => {
    listing.images.push({
      url,
      publicId: `listing-${id}-${Date.now()}-${index}`,
      isCover: isCover && index === 0 // Make first image cover if isCover is true
    });
  });

  await listing.save();

  res.status(200).json({
    success: true,
    message: 'Images uploaded successfully',
    data: {
      listing
    }
  });
});

/**
 * Delete listing image
 * DELETE /api/listings/:id/images/:imageIndex
 */
exports.deleteListingImage = asyncHandler(async (req, res) => {
  const { id, imageIndex } = req.params;

  const listing = await Listing.findById(id);
  if (!listing) {
    throw new APIError('Listing not found', 404);
  }

  if (listing.host.toString() !== req.user.userId) {
    throw new APIError('Not authorized', 403);
  }

  if (imageIndex < 0 || imageIndex >= listing.images.length) {
    throw new APIError('Invalid image index', 400);
  }

  // Remove image
  listing.images.splice(imageIndex, 1);
  await listing.save();

  res.status(200).json({
    success: true,
    message: 'Image deleted successfully',
    data: {
      listing
    }
  });
});

/**
 * Publish listing
 * POST /api/listings/:id/publish
 */
exports.publishListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);
  if (!listing) {
    throw new APIError('Listing not found', 404);
  }

  if (listing.host.toString() !== req.user.userId) {
    throw new APIError('Not authorized', 403);
  }

  // Validate required fields
  if (!listing.title || !listing.description || listing.images.length === 0) {
    throw new APIError('Complete all required fields before publishing', 400);
  }

  listing.status = 'published';
  await listing.save();

  await clearCache('/api/listings*');

  res.status(200).json({
    success: true,
    message: 'Listing published successfully',
    data: {
      listing
    }
  });
});

/**
 * Archive listing
 * POST /api/listings/:id/archive
 */
exports.archiveListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);
  if (!listing) {
    throw new APIError('Listing not found', 404);
  }

  if (listing.host.toString() !== req.user.userId) {
    throw new APIError('Not authorized', 403);
  }

  listing.status = 'archived';
  listing.isActive = false;
  await listing.save();

  res.status(200).json({
    success: true,
    message: 'Listing archived',
    data: {
      listing
    }
  });
});

/**
 * Delete listing
 * DELETE /api/listings/:id
 */
exports.deleteListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);
  if (!listing) {
    throw new APIError('Listing not found', 404);
  }

  if (listing.host.toString() !== req.user.userId) {
    throw new APIError('Not authorized', 403);
  }

  // Delete images from cloudinary
  if (listing.images.length > 0) {
    // In production, you'd delete from cloudinary here
  }

  await Listing.findByIdAndDelete(id);

  await clearCache('/api/listings*');

  res.status(200).json({
    success: true,
    message: 'Listing deleted successfully'
  });
});

/**
 * Get available dates for listing
 * GET /api/listings/:id/availability
 */
exports.getAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;

  const listing = await Listing.findById(id);
  if (!listing) {
    throw new APIError('Listing not found', 404);
  }

  // Get bookings for this listing in date range
  const query = {
    listing: id,
    status: { $in: ['confirmed', 'completed'] }
  };

  if (startDate && endDate) {
    query.checkInDate = { $lte: new Date(endDate) };
    query.checkOutDate = { $gte: new Date(startDate) };
  }

  const bookings = await Booking.find(query).select('checkInDate checkOutDate');

  // Get unavailable dates from listing
  const unavailableDates = listing.availability
    .filter(a => !a.available)
    .map(a => ({ checkInDate: a.startDate, checkOutDate: a.endDate }));

  const bookedDates = bookings.map(b => ({
    checkInDate: b.checkInDate,
    checkOutDate: b.checkOutDate
  }));

  res.status(200).json({
    success: true,
    data: {
      listing: {
        id: listing._id,
        title: listing.title,
        minimumStay: listing.minimumStay,
        maximumStay: listing.maximumStay
      },
      bookedDates,
      unavailableDates,
      available: {
        startDate,
        endDate
      }
    }
  });
});

/**
 * Set availability for listing
 * POST /api/listings/:id/availability
 */
exports.setAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate, available } = req.body;

  if (!startDate || !endDate) {
    throw new APIError('Start and end dates are required', 400);
  }

  const listing = await Listing.findById(id);
  if (!listing) {
    throw new APIError('Listing not found', 404);
  }

  if (listing.host.toString() !== req.user.userId) {
    throw new APIError('Not authorized', 403);
  }

  // Add or update availability
  listing.availability.push({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    available: available !== false
  });

  await listing.save();

  res.status(200).json({
    success: true,
    message: 'Availability updated',
    data: {
      listing
    }
  });
});

/**
 * Get trending listings
 * GET /api/listings/trending
 */
exports.getTrendingListings = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const listings = await Listing.find({
    status: 'published',
    isActive: true
  })
    .populate('host', 'firstName lastName profileImage')
    .sort({ totalBookings: -1, averageRating: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      listings
    }
  });
});

/**
 * Get featured listings
 * GET /api/listings/featured
 */
exports.getFeaturedListings = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const listings = await Listing.find({
    status: 'published',
    isActive: true,
    averageRating: { $gte: 4.5 }
  })
    .populate('host', 'firstName lastName profileImage')
    .sort({ averageRating: -1, totalBookings: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      listings
    }
  });
});

/**
 * Get similar listings
 * GET /api/listings/:id/similar
 */
exports.getSimilarListings = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 6 } = req.query;

  const listing = await Listing.findById(id);
  if (!listing) {
    throw new APIError('Listing not found', 404);
  }

  const priceRange = listing.pricing.basePrice * 0.3;

  const similar = await Listing.find({
    _id: { $ne: id },
    status: 'published',
    isActive: true,
    $or: [
      { propertyType: listing.propertyType },
      { 'location.city': listing.location.city },
      {
        'pricing.basePrice': {
          $gte: listing.pricing.basePrice - priceRange,
          $lte: listing.pricing.basePrice + priceRange
        }
      }
    ]
  })
    .populate('host', 'firstName lastName profileImage')
    .sort({ averageRating: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: { listings: similar }
  });
});

/**
 * Get nearby listings (geolocation-based)
 * GET /api/listings/nearby?lat=...&lng=...&radius=50
 */
exports.getNearbyListings = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 50, limit = 20, page = 1 } = req.query;

  if (!lat || !lng) {
    throw new APIError('Latitude and longitude are required', 400);
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const radiusInMeters = parseFloat(radius) * 1000;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const results = await Listing.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [longitude, latitude] },
        distanceField: 'distance',
        maxDistance: radiusInMeters,
        spherical: true,
        query: { status: 'published', isActive: true }
      }
    },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limitNum },
          {
            $lookup: {
              from: 'users',
              localField: 'host',
              foreignField: '_id',
              as: 'host',
              pipeline: [{ $project: { firstName: 1, lastName: 1, profileImage: 1 } }]
            }
          },
          { $unwind: { path: '$host', preserveNullAndEmptyArrays: true } }
        ],
        total: [{ $count: 'count' }]
      }
    }
  ]);

  const listings = results[0].data;
  const total = results[0].total[0]?.count || 0;

  res.status(200).json({
    success: true,
    data: {
      listings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    }
  });
});

/**
 * Upload listing images via file upload (multer + Cloudinary)
 * POST /api/listings/:id/upload
 */
exports.uploadListingFiles = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.files || req.files.length === 0) {
    throw new APIError('No files uploaded', 400);
  }

  const listing = await Listing.findById(id);
  if (!listing) {
    throw new APIError('Listing not found', 404);
  }

  if (listing.host.toString() !== req.user.userId) {
    throw new APIError('Not authorized', 403);
  }

  const uploadPromises = req.files.map(file =>
    uploadFromBuffer(file.buffer, `rentgo/listings/${id}`)
  );

  const results = await Promise.all(uploadPromises);

  results.forEach((result, index) => {
    listing.images.push({
      url: result.url,
      publicId: result.publicId,
      isCover: listing.images.length === 0 && index === 0
    });
  });

  await listing.save();
  await clearCache('/api/listings*');

  res.status(200).json({
    success: true,
    message: `${results.length} image(s) uploaded successfully`,
    data: { listing }
  });
});
