import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

export const redis = redisUrl ? new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy: (times) => {
    if (times > 3) {
      console.warn('[Redis] Connection failed persistently. Caching will be disabled.');
      return null;
    }
    return Math.min(times * 100, 2000);
  },
}) : null;

if (redis) {
  redis.on('error', (err) => {
    if (err.code !== 'ECONNREFUSED') {
      console.error('Redis Client Error', err);
    }
  });
} else {
  console.log('[Redis] No REDIS_URL provided. Caching is disabled.');
}

export const setCache = async (key, data, ttlSeconds) => {
  if (!redis || redis.status !== 'ready') return;
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (err) {
    console.error('Cache set error:', err);
  }
};

export const getCache = async (key) => {
  if (!redis || redis.status !== 'ready') return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Cache get error:', err);
    return null;
  }
};

export const deleteCachePattern = async (pattern) => {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  } catch (err) {
    console.error('Cache delete error:', err);
  }
};
