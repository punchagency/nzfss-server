"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToMongo = connectToMongo;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("./logger");
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;
async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function connectToMongo(retryCount = 0) {
    try {
        if (!process.env.MONGODB_STRING) {
            throw new Error('MONGODB_STRING environment variable is not set');
        }
        const connection = await mongoose_1.default.connect(process.env.MONGODB_STRING, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 60000,
            connectTimeoutMS: 30000,
            maxPoolSize: 10,
            minPoolSize: 1,
            maxIdleTimeMS: 30000,
            family: 4,
            retryWrites: true,
            retryReads: true,
            w: 'majority'
        });
        mongoose_1.default.connection.on('connected', () => {
            logger_1.logger.info('MongoDB connected successfully');
        });
        mongoose_1.default.connection.on('error', (err) => {
            logger_1.logger.error('MongoDB connection error:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.logger.warn('MongoDB disconnected');
        });
        process.on('SIGINT', async () => {
            try {
                await mongoose_1.default.connection.close();
                logger_1.logger.info('MongoDB connection closed through app termination');
                process.exit(0);
            }
            catch (err) {
                logger_1.logger.error('Error during MongoDB disconnection:', err);
                process.exit(1);
            }
        });
        return connection;
    }
    catch (error) {
        logger_1.logger.error(`MongoDB connection attempt ${retryCount + 1} failed:`, error);
        if (retryCount < MAX_RETRIES) {
            logger_1.logger.info(`Retrying connection in ${RETRY_INTERVAL / 1000} seconds... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
            await wait(RETRY_INTERVAL);
            return connectToMongo(retryCount + 1);
        }
        logger_1.logger.error('Max retries reached. Could not connect to MongoDB');
        throw error;
    }
}
//# sourceMappingURL=mongo.js.map