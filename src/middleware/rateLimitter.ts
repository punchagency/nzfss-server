import { ApolloError } from 'apollo-server';
import { redisClient } from '../utils/redis';
import { logger } from '../utils/logger';

const rateLimiter = (secondsLimit: number, limitAmount: number, type: string, emailInput: string) => {
  return async (parent: any, args: any, context: any, info: any) => {
    const email = emailInput;
    const ip = context.req.ip;
    const userAgent = context.req.headers['user-agent'] as string;
    const userLocation = (context.req.headers['x-forwarded-for'] || context.req.socket.remoteAddress) as string;

    if (!email) {
      throw new ApolloError('Email is required.');
    }

    const emailCounterKey = `EmailCounter:${email}`;
    const emailHashKey = `EmailHash_${type}:${email}`;
    const emailBlockedKey = `EmailBlocked:${email}`;

    try {
      // First, check if the user is blocked
      const blockedStatus = await redisClient.get(emailBlockedKey);
      if (blockedStatus) {
        // If the user is blocked, throw an error
        throw new ApolloError('Too many attempts. Please try again later in 15 minute.');
      }

      // Increment the counter for the given email and set expiration time
      const [incrResult, expireResult] = await Promise.all([
        redisClient.incr(emailCounterKey),
        redisClient.expire(emailCounterKey, secondsLimit), // Expires after secondsLimit seconds
      ]);

      logger.info('incrResult', incrResult);
      logger.info('expireResult', expireResult);

      // If the counter exceeds the limit, raise an error and block the user
      if (incrResult > limitAmount) {
        // Record the attempt details (IP, User-Agent, Location, and Email)
        const cachedAttempts = await redisClient.hgetall(emailHashKey);
        const attempts = Object.values(cachedAttempts).map((attempt: string) => {
          const parsedAttempt = JSON.parse(attempt);
          // Include the email in the attempt details
          parsedAttempt.email = email;
          return parsedAttempt;
        });

        logger.warn('Suspicious activity detected', attempts);

        // Block further attempts by the user for 15 minutes (900 seconds)
        await redisClient.setex(emailBlockedKey, 900, 'blocked'); // Blocked status for 15 minutes

        throw new ApolloError('Too many attempts. Please try again later.'); 
      } else {
        // Store attempt details in Redis hash with expiration set for 15min (21600 seconds)
        await redisClient.hset(emailHashKey, incrResult.toString(), JSON.stringify({
          ip,
          userAgent,
          userLocation,
          email, 
        }));

        await redisClient.expire(emailHashKey, 900);

        return true; 
      }
    } catch (error) {
      logger.error(`${error}`);
      throw new ApolloError(`${error}`);
    }
  };
};

export default rateLimiter;
