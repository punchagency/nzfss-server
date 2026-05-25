"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToMongo = connectToMongo;
const dns_1 = __importDefault(require("dns"));
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("./logger");
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;
function getMongoConnectionUris() {
    const primaryUri = (process.env.MONGODB_STRING || process.env.MONGODB_URI || "").trim();
    if (!primaryUri) {
        throw new Error('MONGODB_STRING (or MONGODB_URI) environment variable is not set');
    }
    const fallbackUri = (process.env.MONGODB_STRING_FALLBACK || process.env.MONGODB_URI_FALLBACK || "").trim();
    if (!fallbackUri || fallbackUri === primaryUri) {
        return [primaryUri];
    }
    return [primaryUri, fallbackUri];
}
function isSrvQueryError(error) {
    if (!(error instanceof Error)) {
        return false;
    }
    return error.name === "MongoServerSelectionError" &&
        typeof error.message === "string" &&
        error.message.includes("querySrv");
}
function configureMongoDnsResolvers() {
    const dnsServers = (process.env.MONGODB_DNS_SERVERS || "")
        .split(",")
        .map(server => server.trim())
        .filter(Boolean);
    if (!dnsServers.length) {
        return;
    }
    dns_1.default.setServers(dnsServers);
    logger_1.logger.info(`Using custom DNS servers for MongoDB lookup: ${dnsServers.join(", ")}`);
}
function getConnectionOptions() {
    return {
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
    };
}
function registerConnectionEventHandlers() {
    mongoose_1.default.connection.on('connected', () => {
        logger_1.logger.info('MongoDB connected successfully');
    });
    mongoose_1.default.connection.on('error', (err) => {
        logger_1.logger.error('MongoDB connection error:', err);
    });
    mongoose_1.default.connection.on('disconnected', () => {
        logger_1.logger.warn('MongoDB disconnected');
    });
}
async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function connectToMongo(retryCount = 0, connectionIndex = 0, connectionUris = getMongoConnectionUris()) {
    try {
        const currentUri = connectionUris[connectionIndex];
        if (!currentUri) {
            throw new Error(`MongoDB connection URI at index ${connectionIndex} is missing`);
        }
        const labels = connectionUris.map((_, index) => index === 0 ? "primary" : "fallback");
        const uriLabel = labels[connectionIndex] ?? `connection-${connectionIndex}`;
        logger_1.logger.info(`Connecting to MongoDB (${uriLabel})`);
        configureMongoDnsResolvers();
        const connection = await mongoose_1.default.connect(currentUri, getConnectionOptions());
        registerConnectionEventHandlers();
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
        const isSrvFailure = isSrvQueryError(error);
        const hasFallback = connectionIndex + 1 < connectionUris.length;
        logger_1.logger.error(`MongoDB connection attempt ${retryCount + 1} (${connectionIndex}) failed:`, error);
        if (isSrvFailure && hasFallback) {
            logger_1.logger.warn("SRV DNS lookup failed. Retrying with non-SRV fallback URI (MONGODB_STRING_FALLBACK or MONGODB_URI_FALLBACK).");
            return connectToMongo(retryCount, connectionIndex + 1, connectionUris);
        }
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