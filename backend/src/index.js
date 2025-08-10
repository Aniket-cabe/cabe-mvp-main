const { app, PORT } = require('./app');
const logger = require('./utils/logger');

const server = app.listen(PORT, () => {
  logger.info(`Worker ${process.pid} is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown for individual workers
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

module.exports = server;
