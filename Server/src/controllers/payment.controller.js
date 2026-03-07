const stripe = require('../config/stripe');
const { Payment, Booking } = require('../models');
const { asyncHandler, APIError } = require('../middleware/error.middleware');
const { getPaginationInfo } = require('../utils/helpers');

/**
 * Create payment / Stripe checkout session for a booking
 * POST /api/payments/checkout
 */
exports.createCheckoutSession = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) throw new APIError('Booking ID is required', 400);

  const booking = await Booking.findById(bookingId)
    .populate('listing', 'title images')
    .populate('guest', 'email firstName lastName');

  if (!booking) throw new APIError('Booking not found', 404);

  if (booking.guest._id.toString() !== req.user.userId) {
    throw new APIError('Not authorized', 403);
  }

  if (booking.paymentStatus === 'paid') {
    throw new APIError('This booking is already paid', 400);
  }

  // ── Stripe not configured → manual payment tracking ──
  if (!stripe) {
    const payment = new Payment({
      booking: bookingId,
      user: req.user.userId,
      amount: booking.pricing.total,
      currency: booking.pricing.currency || 'USD',
      paymentMethod: req.body.paymentMethod || 'credit_card',
      paymentStatus: 'completed',
      transactionId: `manual_${Date.now()}_${bookingId}`,
      description: `Payment for booking ${bookingId}`
    });

    await payment.save();

    booking.paymentStatus = 'paid';
    booking.paymentMethod = req.body.paymentMethod || 'credit_card';
    booking.paymentId = payment.transactionId;
    if (booking.status === 'pending') booking.status = 'confirmed';
    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      data: { payment, booking }
    });
  }

  // ── Stripe checkout session ──
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: booking.guest.email,
    line_items: [
      {
        price_data: {
          currency: (booking.pricing.currency || 'usd').toLowerCase(),
          product_data: {
            name: booking.listing.title,
            images: booking.listing.images?.slice(0, 1).map(img => img.url) || []
          },
          unit_amount: Math.round(booking.pricing.total * 100) // cents
        },
        quantity: 1
      }
    ],
    metadata: {
      bookingId: bookingId,
      userId: req.user.userId
    },
    success_url: `${process.env.CLIENT_URL}/bookings/${bookingId}?payment=success`,
    cancel_url: `${process.env.CLIENT_URL}/bookings/${bookingId}?payment=cancelled`
  });

  const payment = new Payment({
    booking: bookingId,
    user: req.user.userId,
    amount: booking.pricing.total,
    currency: booking.pricing.currency || 'USD',
    paymentMethod: 'credit_card',
    paymentStatus: 'processing',
    stripePaymentIntentId: session.payment_intent,
    description: `Payment for booking ${bookingId}`
  });

  await payment.save();

  res.status(200).json({
    success: true,
    data: {
      sessionId: session.id,
      sessionUrl: session.url,
      payment
    }
  });
});

/**
 * Stripe webhook — registered in app.js with raw body parser
 * POST /api/payments/webhook
 */
exports.handleWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(200).json({ received: true });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { bookingId, userId } = session.metadata;

      await Payment.findOneAndUpdate(
        { booking: bookingId, user: userId },
        {
          paymentStatus: 'completed',
          transactionId: session.payment_intent,
          receiptUrl: session.receipt_url || null
        }
      );

      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.paymentStatus = 'paid';
        booking.paymentId = session.payment_intent;
        if (booking.status === 'pending') booking.status = 'confirmed';
        await booking.save();
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: pi.id },
        {
          paymentStatus: 'failed',
          failureReason: pi.last_payment_error?.message || 'Payment failed'
        }
      );
      break;
    }
  }

  res.status(200).json({ received: true });
};

/**
 * Payment history for authenticated user
 * GET /api/payments
 */
exports.getPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { user: req.user.userId };
  if (status) query.paymentStatus = status;

  const total = await Payment.countDocuments(query);
  const pagination = getPaginationInfo(page, limit, total);

  const payments = await Payment.find(query)
    .populate('booking', 'listing checkInDate checkOutDate pricing status')
    .skip(pagination.skip)
    .limit(pagination.limit)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { payments, pagination }
  });
});

/**
 * Single payment details
 * GET /api/payments/:id
 */
exports.getPaymentDetails = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('booking')
    .populate('user', 'firstName lastName email');

  if (!payment) throw new APIError('Payment not found', 404);

  if (payment.user._id.toString() !== req.user.userId && req.user.role !== 'admin') {
    throw new APIError('Not authorized', 403);
  }

  res.status(200).json({
    success: true,
    data: { payment }
  });
});

/**
 * Request a refund
 * POST /api/payments/:id/refund
 */
exports.requestRefund = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new APIError('Payment not found', 404);

  if (payment.user.toString() !== req.user.userId && req.user.role !== 'admin') {
    throw new APIError('Not authorized', 403);
  }

  if (payment.paymentStatus !== 'completed') {
    throw new APIError('Can only refund completed payments', 400);
  }

  if (stripe && payment.stripePaymentIntentId) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        reason: 'requested_by_customer'
      });

      payment.paymentStatus = 'refunded';
      payment.refundAmount = payment.amount;
      payment.refundReason = reason || 'Customer requested refund';
      payment.refundDate = new Date();
      payment.refundTransactionId = refund.id;
    } catch (err) {
      throw new APIError(`Refund failed: ${err.message}`, 500);
    }
  } else {
    // Manual refund tracking
    payment.paymentStatus = 'refunded';
    payment.refundAmount = payment.amount;
    payment.refundReason = reason || 'Customer requested refund';
    payment.refundDate = new Date();
    payment.refundTransactionId = `refund_${Date.now()}`;
  }

  await payment.save();

  await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: 'refunded' });

  res.status(200).json({
    success: true,
    message: 'Refund processed successfully',
    data: { payment }
  });
});
