const { validationResult, body, param, query, check } = require('express-validator');

/**
 * Handle validation errors
 */
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validation rules for authentication
 */
exports.validateRegister = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

exports.validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for listings
 */
exports.validateCreateListing = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 10, max: 100 })
    .withMessage('Title must be between 10-100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 50, max: 5000 })
    .withMessage('Description must be between 50-5000 characters'),
  body('propertyType')
    .notEmpty()
    .withMessage('Property type is required')
    .isIn(['entire_place', 'private_room', 'shared_room', 'hotel', 'hostel', 'villa', 'apartment', 'house', 'condo', 'townhouse'])
    .withMessage('Invalid property type'),
  body('roomType')
    .notEmpty()
    .withMessage('Room type is required')
    .isIn(['entire_place', 'private_room', 'shared_room'])
    .withMessage('Invalid room type'),
  body('guests')
    .isInt({ min: 1, max: 16 })
    .withMessage('Guests must be between 1-16'),
  body('bedrooms')
    .isInt({ min: 0 })
    .withMessage('Bedrooms must be a positive number'),
  body('beds')
    .isInt({ min: 1 })
    .withMessage('Beds must be at least 1'),
  body('bathrooms')
    .isFloat({ min: 0.5 })
    .withMessage('Bathrooms must be at least 0.5'),
  body('pricing.basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude')
];

/**
 * Validation rules for bookings
 */
exports.validateCreateBooking = [
  body('listingId')
    .isMongoId()
    .withMessage('Invalid listing ID'),
  body('checkInDate')
    .isISO8601()
    .withMessage('Invalid check-in date')
    .custom(value => {
      if (new Date(value) < new Date()) {
        throw new Error('Check-in date must be in the future');
      }
      return true;
    }),
  body('checkOutDate')
    .isISO8601()
    .withMessage('Invalid check-out date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.checkInDate)) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),
  body('numberOfGuests')
    .isInt({ min: 1 })
    .withMessage('Number of guests must be at least 1'),
  body('specialRequests')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Special requests must be less than 1000 characters')
];

/**
 * Validation rules for reviews
 */
exports.validateCreateReview = [
  body('bookingId')
    .isMongoId()
    .withMessage('Invalid booking ID'),
  body('overallRating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1-5'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Review comment is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Comment must be between 10-5000 characters'),
  body('ratings.cleanliness')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Cleanliness rating must be 1-5'),
  body('ratings.communication')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication rating must be 1-5'),
  body('ratings.checkin')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Check-in rating must be 1-5'),
  body('ratings.accuracy')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Accuracy rating must be 1-5'),
  body('ratings.location')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Location rating must be 1-5'),
  body('ratings.value')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Value rating must be 1-5')
];

/**
 * Validate MongoDB ID parameter
 */
exports.validateMongoId = param('id').isMongoId().withMessage('Invalid ID format');
