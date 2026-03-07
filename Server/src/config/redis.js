let redisClient = null;

const initRedis = () => {
  if (!process.env.REDIS_URL) {
    console.log('ℹ️  REDIS_URL not set — caching disabled');
    return;
  }

  try {
    const Redis = require('ioredis');
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      }
    });

    redisClient.on('connect', () => console.log('✅ Redis connected'));
    redisClient.on('error', (err) => {
      console.warn('⚠️  Redis error:', err.message);
    });
  } catch (err) {
    console.warn('⚠️  Redis not available:', err.message);
    redisClient = null;
  }
};

module.exports = {
  initRedis,
  getRedisClient: () => redisClient
};
