import { getCache, setCache } from '../services/redisService.js';

const cacheMiddleware = (ttlSeconds) => async (req, res, next) => {
  if (req.method !== 'GET') return next();

  try {
    // Generate deterministic key based on path and sorted query params
    const queryKeys = Object.keys(req.query)
      .sort()
      .map(k => `${k}=${req.query[k]}`)
      .join(':');
    
    // Replace slashes with colon for better key structure
    const basePath = req.path.replace(/\//g, ':').replace(/^:/, '');
    const cacheKey = `req:${basePath}:${queryKeys || 'default'}`;

    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cachedData);
    }

    res.setHeader('X-Cache', 'MISS');

    // Intercept response to capture and cache data before sending
    const originalJson = res.json;
    res.json = function (data) {
      setCache(cacheKey, data, ttlSeconds);
      originalJson.call(this, data);
    };

    req.cacheKey = cacheKey;
    next();
  } catch (error) {
    console.error("Cache middleware error:", error);
    next();
  }
};

export default cacheMiddleware;
