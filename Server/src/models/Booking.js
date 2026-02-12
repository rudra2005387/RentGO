const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    // References
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Booking Dates
    checkInDate: {
      type: Date,
      required: true
    },
    checkOutDate: {
      type: Date,
      required: true
    },
    numberOfNights: {
      type: Number,
      required: true,
      min: 1
    },

    // Guests
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1
    },

    // Pricing Breakdown
    pricing: {
      nightly_rate: {
        type: Number,
        required: true
      },
      subtotal: {
        type: Number,
        required: true
      },
      cleaningFee: {
        type: Number,
        default: 0
      },
      serviceFee: {
        type: Number,
        default: 0
      },
      discount: {
        type: Number,
        default: 0
      },
      taxes: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        default: 'USD'
      }
    },

    // Booking Status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'disputed'],
      default: 'pending'
    },

    // Payment Status
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partial', 'refunded', 'failed'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'other'],
      default: 'credit_card'
    },
    paymentId: String, // Reference to payment processor ID (Stripe, PayPal, etc.)

    // Special Requests
    specialRequests: {
      type: String,
      maxlength: 1000
    },

    // Communication
    messages: [{
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      message: String,
      createdAt: Date
    }],

    // Review Status
    hostReview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    },
    guestReview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    },

    // Cancellation Info
    cancellationReason: String,
    cancellationDate: Date,
    refundAmount: Number,

    // Host Approval
    requiresApproval: Boolean,
    approvedAt: Date,
    rejectionReason: String,

    // Additional Info
    guestInfo: {
      name: String,
      email: String,
      phone: String
    },
    specialNotes: String
  },
  {
    timestamps: true
  }
);

// Index for frequently searched fields
bookingSchema.index({ listing: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ guest: 1, status: 1 });
bookingSchema.index({ host: 1, status: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
