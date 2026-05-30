const { getRedisClient } = require('../config/redis');

const DEFAULT_TTL_SECONDS = Number(process.env.REDIS_DEFAULT_TTL || 24 * 60 * 60);
const CLEANUP_INTERVAL_MS = Number(process.env.REDIS_CLEANUP_INTERVAL_MS || 60 * 60 * 1000);
const MAX_KEYS_PER_RUN = Number(process.env.REDIS_CLEANUP_MAX_KEYS || 1000);
const SCAN_BATCH_SIZE = Number(process.env.REDIS_CLEANUP_BATCH || 200);

const ALLOWED_PREFIXES = [
  'cache:',
  'session:',
  'session-token:',
  'blacklist:',
  'listing:',
  'listings:',
  'bookings:',
  'availability:',
  'reviews:',
  'user:',
  'notification:',
  'rate-limit:'
];

const hasAllowedPrefix = (key) => {
  return ALLOWED_PREFIXES.some((prefix) => key.startsWith(prefix));
};

const enforceTtlForKeys = async (client) => {
  let cursor = '0';
  let processed = 0;
  let updated = 0;

  do {
    const [nextCursor, keys] = await client.scan(cursor, 'COUNT', SCAN_BATCH_SIZE);
    cursor = nextCursor;

    for (const key of keys) {
      if (!hasAllowedPrefix(key)) continue;

      const ttl = await client.ttl(key);
      processed += 1;

      if (ttl === -1) {
        await client.expire(key, DEFAULT_TTL_SECONDS);
        updated += 1;
      }

      if (processed >= MAX_KEYS_PER_RUN) break;
    }
  } while (cursor !== '0' && processed < MAX_KEYS_PER_RUN);

  return { processed, updated };
};

const startKeyExpirationJob = () => {
  if (process.env.REDIS_EXPIRATION_JOB_DISABLED === 'true') {
    return null;
  }

  const client = getRedisClient();
  if (!client) return null;

  const run = async () => {
    try {
      const result = await enforceTtlForKeys(client);
      if (result.updated > 0) {
        console.log(`🧹 Redis TTL enforced on ${result.updated}/${result.processed} keys`);
      }
    } catch (error) {
      console.warn(`⚠️  Redis TTL cleanup failed: ${error.message}`);
    }
  };

  run();
  const timer = setInterval(() => {
    run();
  }, CLEANUP_INTERVAL_MS);

  return () => clearInterval(timer);
};

module.exports = {
  startKeyExpirationJob
};
