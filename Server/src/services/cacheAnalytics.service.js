const { getRedisClient } = require('../config/redis');

const parseInfoSection = (info) => {
  const result = {};
  if (!info) return result;

  info.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, value] = trimmed.split(':');
    if (!key || value === undefined) return;
    result[key] = value;
  });

  return result;
};

const parseKeyspace = (info) => {
  const result = {};
  if (!info) return result;

  info.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [db, data] = trimmed.split(':');
    if (!db || !data) return;

    const parts = {};
    data.split(',').forEach((entry) => {
      const [key, value] = entry.split('=');
      if (key && value !== undefined) {
        parts[key] = Number(value);
      }
    });

    result[db] = parts;
  });

  return result;
};

const sampleKeyPrefixes = async (client, options = {}) => {
  const maxKeys = options.maxKeys || 1000;
  const batchSize = options.batchSize || 200;
  const prefixCounts = {};
  let cursor = '0';
  let processed = 0;

  do {
    const [nextCursor, keys] = await client.scan(cursor, 'COUNT', batchSize);
    cursor = nextCursor;

    for (const key of keys) {
      const prefix = key.includes(':') ? key.split(':')[0] : key;
      prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
      processed += 1;
      if (processed >= maxKeys) break;
    }
  } while (cursor !== '0' && processed < maxKeys);

  const topPrefixes = Object.entries(prefixCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([prefix, count]) => ({ prefix, count }));

  return { sampledKeys: processed, topPrefixes };
};

const getCacheStats = async () => {
  const client = getRedisClient();
  if (!client) {
    return { available: false };
  }

  const [statsInfo, memoryInfo, keyspaceInfo] = await Promise.all([
    client.info('stats'),
    client.info('memory'),
    client.info('keyspace')
  ]);

  const stats = parseInfoSection(statsInfo);
  const memory = parseInfoSection(memoryInfo);
  const keyspace = parseKeyspace(keyspaceInfo);

  const hits = Number(stats.keyspace_hits || 0);
  const misses = Number(stats.keyspace_misses || 0);
  const total = hits + misses;
  const hitRate = total > 0 ? Math.round((hits / total) * 10000) / 100 : 0;

  const prefixSample = await sampleKeyPrefixes(client);

  return {
    available: true,
    hitRate,
    hits,
    misses,
    evictedKeys: Number(stats.evicted_keys || 0),
    expiredKeys: Number(stats.expired_keys || 0),
    connectedClients: Number(stats.connected_clients || 0),
    memory: {
      used: Number(memory.used_memory || 0),
      usedHuman: memory.used_memory_human || null,
      max: Number(memory.maxmemory || 0),
      maxHuman: memory.maxmemory_human || null,
      fragmentationRatio: Number(memory.mem_fragmentation_ratio || 0)
    },
    keyspace,
    sampledKeys: prefixSample.sampledKeys,
    topPrefixes: prefixSample.topPrefixes
  };
};

module.exports = {
  getCacheStats
};
