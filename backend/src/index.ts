import { app, env, initializeDatabase } from './app';
import logger from './utils/logger';

const PORT = process.env.PORT || env.PORT;

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Start the server
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`✅ Server running on port ${PORT}`);
      logger.info(`Worker ${process.pid} is running on port ${PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
      logger.info(`Server bound to 0.0.0.0:${PORT}`);
      logger.info(`Process.env.PORT: ${process.env.PORT || 'not set'}`);
    });

    // Graceful shutdown for the server
    process.on('SIGTERM', () => {
      logger.info(`Worker ${process.pid} received SIGTERM, shutting down gracefully`);
      server.close(() => {
        logger.info(`Worker ${process.pid} terminated`);
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info(`Worker ${process.pid} received SIGINT, shutting down gracefully`);
      server.close(() => {
        logger.info(`Worker ${process.pid} terminated`);
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info(
    `Worker ${process.pid} received SIGTERM, shutting down gracefully`
  );
  server.close(() => {
    logger.info(`Worker ${process.pid} terminated`);
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info(
    `Worker ${process.pid} received SIGINT, shutting down gracefully`
  );
  server.close(() => {
    logger.info(`Worker ${process.pid} terminated`);
    process.exit(0);
  });
});

export default server;
