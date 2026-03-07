// Stripe configuration - gracefully handles missing keys
const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

if (!stripe) {
  console.log('ℹ️  STRIPE_SECRET_KEY not set — payment processing will use manual tracking');
}

module.exports = stripe;
