const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    // Host Information
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Basic Property Information
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      minlength: 10,
      maxlength: 100
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: 50,
      maxlength: 5000
    },

    // Location
    location: {
      address: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true
      },
      zipCode: String,
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      }
    },

    // Property Type and Details
    propertyType: {
      type: String,
      enum: ['entire_place', 'private_room', 'shared_room', 'hotel', 'hostel', 'villa', 'apartment', 'house', 'condo', 'townhouse'],
      required: true
    },
    roomType: {
      type: String,
      enum: ['entire_place', 'private_room', 'shared_room'],
      required: true
    },

    // Capacity
    guests: {
      type: Number,
      required: true,
      min: 1,
      max: 16
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 0
    },
    beds: {
      type: Number,
      required: true,
      min: 1
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 0.5
    },

    // Pricing
    pricing: {
      basePrice: {
        type: Number,
        required: true,
        min: 0
      },
      currency: {
        type: String,
        default: 'USD'
      },
      cleaningFee: {
        type: Number,
        default: 0,
        min: 0
      },
      serviceFee: {
        type: Number,
        default: 0,
        min: 0
      },
      weeklyDiscount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      monthlyDiscount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    },

    // Amenities
    amenities: {
      basics: {
        wifi: Boolean,
        airConditioning: Boolean,
        heating: Boolean,
        kitchen: Boolean,
        parking: Boolean
      },
      features: {
        pool: Boolean,
        hotTub: Boolean,
        gym: Boolean,
        washer: Boolean,
        dryer: Boolean,
        tv: Boolean,
        workSpace: Boolean,
        petFriendly: Boolean
      },
      safety: {
        smokeDetector: Boolean,
        fireExtinguisher: Boolean,
        firstAidKit: Boolean,
        lockOnBedroomDoor: Boolean
      }
    },

    // Images
    images: [{
      url: String,
      publicId: String,
      isCover: Boolean
    }],

    // Availability & Rules
    availability: [{
      startDate: Date,
      endDate: Date,
      available: Boolean
    }],
    minimumStay: {
      type: Number,
      default: 1
    },
    maximumStay: {
      type: Number
    },
    checkInTime: {
      type: String,
      default: '15:00'
    },
    checkOutTime: {
      type: String,
      default: '11:00'
    },

    // Booking Rules
    bookingRules: {
      instantBooking: {
        type: Boolean,
        default: false
      },
      requiresApproval: {
        type: Boolean,
        default: true
      },
      allowPets: Boolean,
      allowSmoking: Boolean,
      allowPartiesEvents: Boolean,
      cancellationPolicy: {
        type: String,
        enum: ['flexible', 'moderate', 'strict', 'super_strict'],
        default: 'moderate'
      }
    },

    // Status
    status: {
      type: String,
      enum: ['draft', 'published', 'archived', 'blocked'],
      default: 'draft'
    },
    isActive: {
      type: Boolean,
      default: true
    },

    // Rating & Reviews
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    // Statistics
    totalBookings: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },

    // Tags
    tags: [String],

    // Metadata
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Index for location-based searches
listingSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
listingSchema.index({ host: 1 });
listingSchema.index({ status: 1 });

module.exports = mongoose.model('Listing', listingSchema);
