require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const app = require('./src/app');
const { initNotificationSubscriber } = require('./src/services/notificationPubSub.service');

// ✅ REDIS IMPORTS
const { initRedis } = require('./src/config/redis');
const redisService = require('./src/services/redis.service');

// ==================== ENV VALIDATION ====================

const requiredEnv = [
  'MONGO_URI',
  'JWT_SECRET',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL'
];

const missingEnv = requiredEnv.filter(
  (key) => !process.env[key]
);

if (missingEnv.length > 0) {
  console.error(
    `❌ Missing environment variables: ${missingEnv.join(', ')}`
  );
  process.exit(1);
}

// ==================== CONFIG ====================

const PORT = process.env.PORT || 5000;

console.log('✅ Environment variables loaded');
console.log(`📧 Resend From Email: ${process.env.RESEND_FROM_EMAIL}`);

// ==================== REDIS INIT ====================

try {
  initRedis();
  redisService.init();
  console.log('✅ Redis initialization completed');
} catch (error) {
  console.error('❌ Redis initialization failed:', error.message);
}

// ==================== HTTP SERVER ====================

const server = http.createServer(app);

// ==================== SOCKET.IO ====================

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Make io accessible throughout app
app.set('io', io);

// ==================== SOCKET AUTH ====================

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    socket.userId = decoded.userId;

    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
});

// ==================== SOCKET CONNECTION ====================

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.userId}`);

  socket.join(`user_${socket.userId}`);

  const conversationId =
    socket.handshake.query?.conversationId;

  if (conversationId) {
    socket.join(`chat_${conversationId}`);
  }

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.userId}`);

    socket.leave(`user_${socket.userId}`);

    if (conversationId) {
      socket.leave(`chat_${conversationId}`);
    }
  });
});

// ==================== REDIS PUB/SUB ====================

try {
  initNotificationSubscriber(io);
  console.log('✅ Redis notification subscriber initialized');
} catch (error) {
  console.error(
    '❌ Failed to initialize notification subscriber:',
    error.message
  );
}

// ==================== START SERVER ====================

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `Environment: ${process.env.NODE_ENV || 'development'}`
  );
});