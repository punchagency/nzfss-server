"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("./logger");
const redisOptions = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
};
const redisClient = new ioredis_1.default(redisOptions);
exports.redisClient = redisClient;
redisClient.on('error', (error) => {
    logger_1.logger.error('An error occurred while connecting to Redis:', error);
    process.exit(1);
});
//# sourceMappingURL=redis.js.map