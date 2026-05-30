const { getRedisClient } = require('../config/redis');
const redisService = require('../services/redis.service');

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

/**
 * PHASE 1: Check Redis for cached session before processing
 * Reduces database queries for every authenticated request
 */
const sessionCacheMiddleware = async (req, res, next) => {
  try {
    // Only check if user is authenticated
    if (req.user && req.user.userId) {
      const cachedSession = await redisService.getSession(req.user.userId);
      if (cachedSession) {
        req.cachedSession = cachedSession;
        req.sessionSource = 'redis';
      } else {
        req.sessionSource = 'database';
      }
    }
    next();
  } catch (error) {
    console.warn(`⚠️  Session cache check failed: ${error.message}`);
    next();
  }
};

/**
 * PHASE 1: Check if token is blacklisted (after logout)
 * Prevents using old tokens after logout
 */
const tokenBlacklistMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const isBlacklisted = await redisService.isTokenBlacklisted(token);
    
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked. Please login again.'
      });
    }

    next();
  } catch (error) {
    console.warn(`⚠️  Token blacklist check failed: ${error.message}`);
    next();
  }
};

/**
 * PHASE 1: Cache user session after successful login
 */
const cacheUserSession = async (userId, userData, token, tokenExpiresIn = 7 * 24 * 60 * 60) => {
  try {
    const sessionData = {
      userId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      avatar: userData.avatar,
      role: userData.role,
      isActive: userData.isActive,
      cachedAt: new Date().toISOString()
    };
    await redisService.setSession(userId, sessionData, tokenExpiresIn);

    if (token) {
      await redisService.set(`session-token:${token}`, { userId }, tokenExpiresIn);
    }
  } catch (error) {
    console.warn(`⚠️  Failed to cache session: ${error.message}`);
  }
};

/**
 * PHASE 1: Logout user by invalidating session and token
 */
const logoutUser = async (userId, token, tokenExpiresIn = 7 * 24 * 60 * 60) => {
  try {
    await redisService.deleteSession(userId);
    await redisService.blacklistToken(token, tokenExpiresIn);
    if (token) {
      await redisService.del(`session-token:${token}`);
    }
  } catch (error) {
    console.warn(`⚠️  Logout failed: ${error.message}`);
  }
};

module.exports = { 
  cache, 
  clearCache,
  sessionCacheMiddleware,
  tokenBlacklistMiddleware,
  cacheUserSession,
  logoutUser
};
