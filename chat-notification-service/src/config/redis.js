import { createClient } from 'redis';

let redisClient = null;

export const connectRedis = async () => {
    try {
        const url = process.env.REDIS_URL || 'redis://localhost:6379';
        redisClient = createClient({ url });

        redisClient.on('error', (err) => console.error('Redis Client Error', err));

        await redisClient.connect();
        console.log('Connected to Redis');
        return redisClient;
    } catch (error) {
        console.error('Redis connection error:', error);
        throw error;
    }
};

export const getRedisClient = () => redisClient;
