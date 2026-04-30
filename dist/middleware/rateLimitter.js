"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const redis_1 = require("../utils/redis");
const logger_1 = require("../utils/logger");
const rateLimiter = (secondsLimit, limitAmount, type, emailInput) => {
    return async (parent, args, context, info) => {
        const email = emailInput;
        const ip = context.req.ip;
        const userAgent = context.req.headers['user-agent'];
        const userLocation = (context.req.headers['x-forwarded-for'] || context.req.socket.remoteAddress);
        if (!email) {
            throw new apollo_server_1.ApolloError('Email is required.');
        }
        const emailCounterKey = `EmailCounter:${email}`;
        const emailHashKey = `EmailHash_${type}:${email}`;
        const emailBlockedKey = `EmailBlocked:${email}`;
        try {
            const blockedStatus = await redis_1.redisClient.get(emailBlockedKey);
            if (blockedStatus) {
                throw new apollo_server_1.ApolloError('Too many attempts. Please try again later in 15 minute.');
            }
            const [incrResult, expireResult] = await Promise.all([
                redis_1.redisClient.incr(emailCounterKey),
                redis_1.redisClient.expire(emailCounterKey, secondsLimit),
            ]);
            logger_1.logger.info('incrResult', incrResult);
            logger_1.logger.info('expireResult', expireResult);
            if (incrResult > limitAmount) {
                const cachedAttempts = await redis_1.redisClient.hgetall(emailHashKey);
                const attempts = Object.values(cachedAttempts).map((attempt) => {
                    const parsedAttempt = JSON.parse(attempt);
                    parsedAttempt.email = email;
                    return parsedAttempt;
                });
                logger_1.logger.warn('Suspicious activity detected', attempts);
                await redis_1.redisClient.setex(emailBlockedKey, 900, 'blocked');
                throw new apollo_server_1.ApolloError('Too many attempts. Please try again later.');
            }
            else {
                await redis_1.redisClient.hset(emailHashKey, incrResult.toString(), JSON.stringify({
                    ip,
                    userAgent,
                    userLocation,
                    email,
                }));
                await redis_1.redisClient.expire(emailHashKey, 900);
                return true;
            }
        }
        catch (error) {
            logger_1.logger.error(`${error}`);
            throw new apollo_server_1.ApolloError(`${error}`);
        }
    };
};
exports.default = rateLimiter;
//# sourceMappingURL=rateLimitter.js.map