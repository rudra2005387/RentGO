const { getRedisClient } = require('../config/redis');

/**
 * Cache GET responses in Redis (or skip gracefully if Redis is unavailable).
 * @param {number} duration  Cache TTL in seconds (default 300 = 5 min)
 */
const cache = (duration = 300) => async (req, res, next) => {
  if (req.method !== 'GET') return next();

  const client = getRedisClient();
  if (!client) return next();

  const key = `cache:${req.originalUrl}`;

  try {
    const cached = await client.get(key);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
  } catch (_) {
    // Redis read error — continue without cache
  }

  // Intercept res.json to store the response before sending
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      client.setex(key, duration, JSON.stringify(body)).catch(() => {});
    }
    return originalJson(body);
  };

  next();
};

/**
 * Delete cache entries matching a glob pattern.
 * @param {string} pattern  e.g. "/api/listings*"
 */
const clearCache = async (pattern) => {
  const client = getRedisClient();
  if (!client) return;

  try {
    const keys = await client.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (_) {
    // Ignore cache-clear errors
  }
};

module.exports = { cache, clearCache };
