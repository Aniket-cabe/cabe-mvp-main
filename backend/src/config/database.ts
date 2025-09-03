import mongoose from 'mongoose';
import { env } from './env';
import logger from '../utils/logger';

// MongoDB connection options for different environments
const getMongoOptions = () => {
  const isProduction = env.NODE_ENV === 'production';
  const isRender = process.env.RENDER || process.env.RENDER_EXTERNAL_URL;
  const isReplit = process.env.REPL_ID || process.env.REPL_SLUG;
  
  const baseOptions = {
    // Connection pool settings (MongoDB v5+ compatible)
    maxPoolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    minPoolSize: 1,
    
    // Connection timeout settings
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    
    // Write concern for production
    writeConcern: isProduction ? { w: 'majority' } : { w: 1 },
    
    // Read preference
    readPreference: 'primary',
    
    // Retry settings
    retryWrites: true,
    retryReads: true,
    
    // SSL/TLS settings
    ssl: isProduction || isRender || isReplit,
    sslValidate: false, // Set to true in production with proper certificates
    
    // Buffer settings
    bufferCommands: true,
    bufferMaxEntries: 0,
    
    // Auto index creation (disable in production for performance)
    autoIndex: !isProduction,
    
    // Logging
    loggerLevel: isProduction ? 'error' : 'info',
    
    // Render-specific optimizations
    ...(isRender && {
      // Optimize for Render's free tier limitations
      maxPoolSize: 5, // Reduce pool size for Render free tier
      serverSelectionTimeoutMS: 10000, // Increase timeout for Render
      socketTimeoutMS: 60000, // Increase socket timeout
    }),
  };

  return baseOptions;
};

// MongoDB connection string validation
const validateMongoUrl = (url: string): boolean => {
  const mongoUrlPattern = /^mongodb(\+srv)?:\/\/.+$/;
  return mongoUrlPattern.test(url);
};

// Connect to MongoDB
export const connectToDatabase = async (): Promise<void> => {
  try {
    const mongoUrl = process.env.DATABASE_URL;
    
    if (!mongoUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    if (!validateMongoUrl(mongoUrl)) {
      throw new Error('Invalid MongoDB connection string. Must start with mongodb:// or mongodb+srv://');
    }
    
    const options = getMongoOptions();
    
    logger.info('Connecting to MongoDB...', {
      url: mongoUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), // Hide credentials in logs
      options: {
        maxPoolSize: options.maxPoolSize,
        ssl: options.ssl,
        environment: env.NODE_ENV
      }
    });
    
    await mongoose.connect(mongoUrl, options);
    
    logger.info('✅ MongoDB connected successfully');
    
    // Log connection info
    const db = mongoose.connection.db;
    if (db) {
      const adminDb = db.admin();
      const serverStatus = await adminDb.serverStatus();
      logger.info('MongoDB server info:', {
        version: serverStatus.version,
        connections: serverStatus.connections,
        uptime: serverStatus.uptime
      });
    }
    
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

// Disconnect from MongoDB
export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('✅ MongoDB disconnected successfully');
  } catch (error) {
    logger.error('❌ MongoDB disconnection failed:', error);
    throw error;
  }
};

// Graceful shutdown handler
export const setupDatabaseGracefulShutdown = (): void => {
  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}, closing MongoDB connection...`);
    
    try {
      await disconnectFromDatabase();
      logger.info('MongoDB connection closed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  };
  
  // Handle different shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    logger.error('Uncaught Exception:', error);
    await gracefulShutdown('uncaughtException');
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    await gracefulShutdown('unhandledRejection');
  });
};

// Connection event handlers
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  logger.error('Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB');
});

mongoose.connection.on('reconnected', () => {
  logger.info('Mongoose reconnected to MongoDB');
});

// Export mongoose instance for use in models
export { mongoose };
export default mongoose;
