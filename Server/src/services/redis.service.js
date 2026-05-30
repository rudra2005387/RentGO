const { getRedisClient } = require('../config/redis');

/**
 * Redis Service - Core caching and session management
 * Handles: Session storage, token blacklist, general cache operations
 */

class RedisService {
  constructor() {
    this.redis = null;
  }

  /**
   * Initialize Redis connection
   */
  init() {
    this.redis = getRedisClient();
    if (this.redis) {
      console.log('✅ Redis Service initialized');
    } else {
      console.log('ℹ️  Redis not available - operating in fallback mode');
    }
  }

  /**
   * Check if Redis is available
   */
  isAvailable() {
    return this.redis !== null;
  }

  /**
   * Store user session in Redis
   * @param {string} userId - User ID
   * @param {object} sessionData - Session data (user info, role, etc)
   * @param {number} ttl - Time to live in seconds (default: 7 days)
   */
  async setSession(userId, sessionData, ttl = 7 * 24 * 60 * 60) {
    if (!this.isAvailable()) return;

    try {
      const key = `session:${userId}`;
      const data = JSON.stringify(sessionData);
      await this.redis.setex(key, ttl, data);
      console.log(`📦 Session cached for user ${userId} (TTL: ${ttl}s)`);
    } catch (error) {
      console.warn(`⚠️  Failed to set session: ${error.message}`);
      // Don't throw - allow graceful fallback
    }
  }

  /**
   * Get user session from Redis
   * @param {string} userId - User ID
   * @returns {object|null} Session data or null if not found
   */
  async getSession(userId) {
    if (!this.isAvailable()) return null;

    try {
      const key = `session:${userId}`;
      const data = await this.redis.get(key);
      if (data) {
        console.log(`✅ Session hit for user ${userId}`);
        return JSON.parse(data);
      }
      console.log(`❌ Session miss for user ${userId}`);
      return null;
    } catch (error) {
      console.warn(`⚠️  Failed to get session: ${error.message}`);
      return null;
    }
  }

  /**
   * Delete user session from Redis
   * @param {string} userId - User ID
   */
  async deleteSession(userId) {
    if (!this.isAvailable()) return;

    try {
      const key = `session:${userId}`;
      await this.redis.del(key);
      console.log(`🗑️  Session deleted for user ${userId}`);
    } catch (error) {
      console.warn(`⚠️  Failed to delete session: ${error.message}`);
    }
  }

  /**
   * Add token to blacklist (after logout)
   * @param {string} token - JWT token to blacklist
   * @param {number} expiresIn - Time until token expires in seconds
   */
  async blacklistToken(token, expiresIn = 7 * 24 * 60 * 60) {
    if (!this.isAvailable()) return;

    try {
      const key = `blacklist:${token}`;
      // Store with exact expiration time to save memory
      await this.redis.setex(key, expiresIn, '1');
      console.log(`🚫 Token blacklisted (TTL: ${expiresIn}s)`);
    } catch (error) {
      console.warn(`⚠️  Failed to blacklist token: ${error.message}`);
    }
  }

  /**
   * Check if token is blacklisted
   * @param {string} token - JWT token to check
   * @returns {boolean} true if blacklisted, false otherwise
   */
  async isTokenBlacklisted(token) {
    if (!this.isAvailable()) return false;

    try {
      const key = `blacklist:${token}`;
      const exists = await this.redis.exists(key);
      if (exists) {
        console.log(`⛔ Blacklisted token detected`);
      }
      return exists === 1;
    } catch (error) {
      console.warn(`⚠️  Failed to check token blacklist: ${error.message}`);
      return false;
    }
  }

  /**
   * Generic cache SET operation
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   */
  async set(key, value, ttl = 3600) {
    if (!this.isAvailable()) return;

    try {
      const data = typeof value === 'string' ? value : JSON.stringify(value);
      await this.redis.setex(key, ttl, data);
    } catch (error) {
      console.warn(`⚠️  Failed to set cache key ${key}: ${error.message}`);
    }
  }

  /**
   * Generic cache GET operation
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null
   */
  async get(key) {
    if (!this.isAvailable()) return null;

    try {
      const data = await this.redis.get(key);
      if (data) {
        try {
          return JSON.parse(data);
        } catch {
          return data; // Return as string if not JSON
        }
      }
      return null;
    } catch (error) {
      console.warn(`⚠️  Failed to get cache key ${key}: ${error.message}`);
      return null;
    }
  }

  /**
   * Delete cache key
   * @param {string} key - Cache key
   */
  async del(key) {
    if (!this.isAvailable()) return;

    try {
      await this.redis.del(key);
    } catch (error) {
      console.warn(`⚠️  Failed to delete cache key ${key}: ${error.message}`);
    }
  }

  /**
   * Delete multiple cache keys by pattern
   * @param {string} pattern - Key pattern (e.g., "session:*")
   */
  async deletePattern(pattern) {
    if (!this.isAvailable()) return;

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        console.log(`🗑️  Deleted ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      console.warn(`⚠️  Failed to delete pattern ${pattern}: ${error.message}`);
    }
  }

  /**
   * Increment a counter
   * @param {string} key - Counter key
   * @param {number} increment - Amount to increment by
   * @returns {number} New counter value
   */
  async incr(key, increment = 1) {
    if (!this.isAvailable()) return 0;

    try {
      const result = await this.redis.incrby(key, increment);
      return result;
    } catch (error) {
      console.warn(`⚠️  Failed to increment key ${key}: ${error.message}`);
      return 0;
    }
  }

  /**
   * Set counter with expiration
   * @param {string} key - Counter key
   * @param {number} value - Initial value
   * @param {number} ttl - Time to live in seconds
   */
  async setCounter(key, value = 1, ttl = 3600) {
    if (!this.isAvailable()) return;

    try {
      await this.redis.setex(key, ttl, value.toString());
    } catch (error) {
      console.warn(`⚠️  Failed to set counter ${key}: ${error.message}`);
    }
  }

  /**
   * Publish event to Redis channel (for real-time updates)
   * @param {string} channel - Channel name
   * @param {object} message - Message to publish
   */
  async publish(channel, message) {
    if (!this.isAvailable()) return;

    try {
      const data = typeof message === 'string' ? message : JSON.stringify(message);
      await this.redis.publish(channel, data);
    } catch (error) {
      console.warn(`⚠️  Failed to publish to channel ${channel}: ${error.message}`);
    }
  }

  /**
   * Get Redis client for custom operations
   * @returns {RedisClient|null} Redis client
   */
  getClient() {
    return this.redis;
  }

  /**
   * Get Redis statistics
   * @returns {object} Stats like memory usage, connected clients
   */
  async getStats() {
    if (!this.isAvailable()) return null;

    try {
      const info = await this.redis.info('stats');
      return info;
    } catch (error) {
      console.warn(`⚠️  Failed to get Redis stats: ${error.message}`);
      return null;
    }
  }
}

// Export singleton instance
module.exports = new RedisService();
