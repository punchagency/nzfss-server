import mongoose, { Connection } from "mongoose";
import config from "config";
import { logger } from "./logger";

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 seconds

async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function connectToMongo(retryCount = 0): Promise<typeof mongoose> {
  try {
    if (!process.env.MONGODB_STRING) {
      throw new Error('MONGODB_STRING environment variable is not set');
    }

    const connection = await mongoose.connect(process.env.MONGODB_STRING, {
      serverSelectionTimeoutMS: 30000, // Increased timeout to 30s
      socketTimeoutMS: 60000, // Increased socket timeout to 60s
      connectTimeoutMS: 30000, // Connection timeout
      maxPoolSize: 10, // Limit connection pool
      minPoolSize: 1, // Minimum connections
      maxIdleTimeMS: 30000, // Close idle connections after 30s
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      retryReads: true,
      w: 'majority' // Write concern
    });

    // Set up connection event handlers
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        logger.error('Error during MongoDB disconnection:', err);
        process.exit(1);
      }
    });

    return connection;
  } catch (error) {
    logger.error(`MongoDB connection attempt ${retryCount + 1} failed:`, error);

    if (retryCount < MAX_RETRIES) {
      logger.info(`Retrying connection in ${RETRY_INTERVAL/1000} seconds... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await wait(RETRY_INTERVAL);
      return connectToMongo(retryCount + 1);
    }

    logger.error('Max retries reached. Could not connect to MongoDB');
    throw error; // Let the caller handle the final error
  }
}