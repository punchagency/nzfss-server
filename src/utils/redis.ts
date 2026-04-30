import Redis from 'ioredis';
import { logger } from './logger';

// Connection details for Redis (from redisOptions)
const redisOptions = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
};
// const redisOptions = process.env.REDIS_CONNECTION_URL!




// Create a new Redis client using the options
const redisClient = new Redis(redisOptions);

redisClient.on('error', (error) => {
    // Log errors
    logger.error('An error occurred while connecting to Redis:', error);
    process.exit(1); // Optionally terminate if Redis connection fails
});

export { redisClient };