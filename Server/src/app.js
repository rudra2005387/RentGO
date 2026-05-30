// EXPRESS APP CONFIG
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/error.middleware');
const { initRedis, getRedisClient } = require('./config/redis');
const redisService = require('./services/redis.service');
const { startKeyExpirationJob } = require('./services/keyExpiration.service');

const app = express();

// Connect to Database
connectDB();

// Initialize Redis
initRedis();
redisService.init();
startKeyExpirationJob();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);

// Stripe webhook needs raw body — must be registered BEFORE express.json()
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  require('./controllers/payment.controller').handleWebhook
);

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ==================== RATE LIMITING ====================

const redisClient = getRedisClient();

const limiterOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 500,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
};

if (redisClient) {
  limiterOptions.store = new RedisStore({
    sendCommand: (...args) => redisClient.call(...args)
  });

  console.log('✅ Redis rate limiter enabled');
} else {
  console.log('ℹ️ Redis unavailable - using memory rate limiter');
}

const limiter = rateLimit(limiterOptions);

app.use('/api/', limiter);

// ==================== ROUTES ====================

// Basic route for testing
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎉 RentGo API Server is running!'
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/listings', require('./routes/listing.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;