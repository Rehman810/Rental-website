import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1, // Don't block requests if Redis is down
  enableReadyCheck: false, // Skip ready check to avoid hang
  lazyConnect: true, // Only connect when used
  retryStrategy: (times) => {
    if (times > 3) {
      console.warn('[Redis] Connection failed persistently. Caching will be disabled.');
      return null; // Stop retrying after 3 attempts
    }
    return Math.min(times * 100, 2000);
  },
});

redis.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
        // Log once and suppress further noise if necessary
        // console.warn('[Redis] Not available at ' + redisUrl);
    } else {
        console.error('Redis Client Error', err);
    }
});

export const setCache = async (key, data, ttlSeconds) => {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (err) {
    console.error('Cache set error:', err);
  }
};

export const getCache = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Cache get error:', err);
    return null;
  }
};

export const deleteCachePattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  } catch (err) {
    console.error('Cache delete error:', err);
  }
};
