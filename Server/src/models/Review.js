const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // References
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reviewType: {
      type: String,
      enum: ['guest_to_host', 'host_to_guest'],
      required: true
    },

    // Rating Categories
    ratings: {
      cleanliness: {
        type: Number,
        min: 1,
        max: 5
      },
      communication: {
        type: Number,
        min: 1,
        max: 5
      },
      checkin: {
        type: Number,
        min: 1,
        max: 5
      },
      accuracy: {
        type: Number,
        min: 1,
        max: 5
      },
      location: {
        type: Number,
        min: 1,
        max: 5
      },
      value: {
        type: Number,
        min: 1,
        max: 5
      }
    },

    // Overall Rating
    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    // Review Content
    title: {
      type: String,
      maxlength: 200
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      minlength: 10,
      maxlength: 5000
    },

    // Highlights
    highlights: [
      {
        type: String,
        maxlength: 100
      }
    ],

    // Response from Target User
    hostResponse: {
      comment: String,
      respondedAt: Date,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },

    // Verification
    isVerified: {
      type: Boolean,
      default: false
    },

    // Privacy & Status
    isPublic: {
      type: Boolean,
      default: true
    },
    isFlagged: {
      type: Boolean,
      default: false
    },
    flagReason: String,

    // Helpful Count
    helpfulCount: {
      type: Number,
      default: 0
    },
    unhelpfulCount: {
      type: Number,
      default: 0
    },
    
    // Images from stay
    images: [{
      url: String,
      publicId: String
    }]
  },
  {
    timestamps: true
  }
);

// Index for frequently searched fields
reviewSchema.index({ listing: 1 });
reviewSchema.index({ author: 1 });
reviewSchema.index({ targetUser: 1 });
reviewSchema.index({ booking: 1 });

module.exports = mongoose.model('Review', reviewSchema);
