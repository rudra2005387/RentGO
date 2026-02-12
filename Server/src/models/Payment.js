const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    // References
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Payment Details
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'wallet'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partial_refund'],
      default: 'pending'
    },

    // Transaction IDs
    transactionId: String,
    stripePaymentIntentId: String,
    paypalTransactionId: String,

    // Refund Info
    refundAmount: {
      type: Number,
      default: 0
    },
    refundReason: String,
    refundDate: Date,
    refundTransactionId: String,

    // Error Handling
    failureReason: String,
    errorMessage: String,
    retryCount: {
      type: Number,
      default: 0
    },

    // Metadata
    description: String,
    receiptUrl: String
  },
  {
    timestamps: true
  }
);

// Index for frequently searched fields
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
