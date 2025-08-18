import { app, env } from './app';
import logger from './utils/logger';

const server = app.listen(env.PORT, '0.0.0.0', () => {
  logger.info(`Worker ${process.pid} is running on port ${env.PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
  logger.info(`Server bound to 0.0.0.0:${env.PORT}`);
});

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
