import cluster from 'cluster';
import os from 'os';
import logger from './utils/logger';
import { env } from './config/env';

// Calculate number of workers (all cores except one for OS)
const numCPUs = os.cpus().length;
const numWorkers = Math.max(1, numCPUs - 1);

if (cluster.isPrimary) {
  logger.info(`Master process ${process.pid} is running`);
  logger.info(
    `Forking ${numWorkers} workers (${numCPUs} total CPUs, reserving 1 for OS)`
  );
  logger.info(`Environment: ${env.NODE_ENV}, Port: ${env.PORT}`);

  // Fork workers
  for (let i = 0; i < numWorkers; i++) {
    logger.info(`Forking worker ${i + 1}/${numWorkers}`);
    cluster.fork();
  }

  // Handle worker exit
  cluster.on('exit', (worker, code, signal) => {
    logger.warn(
      `Worker ${worker.process.pid} died with code ${code} and signal ${signal}`
    );
    logger.info('Starting a new worker to replace the dead one...');
    cluster.fork();
  });

  // Handle worker online
  cluster.on('online', (worker) => {
    logger.info(`Worker ${worker.process.pid} is online`);
  });

  // Handle worker disconnect
  cluster.on('disconnect', (worker) => {
    logger.warn(`Worker ${worker.process.pid} disconnected`);
  });

  // Graceful shutdown on SIGTERM
  process.on('SIGTERM', () => {
    logger.info(
      'Master process received SIGTERM, shutting down all workers gracefully'
    );

    // Disconnect all workers
    for (const id in cluster.workers) {
      const worker = cluster.workers[id];
      if (worker) {
        logger.info(`Disconnecting worker ${worker.process.pid}`);
        worker.disconnect();
      }
    }

    // Wait for all workers to disconnect, then exit
    cluster.on('disconnect', (worker) => {
      logger.info(`Worker ${worker.process.pid} disconnected`);

      // Check if all workers are disconnected
      const activeWorkers = Object.keys(cluster.workers).length;
      if (activeWorkers === 0) {
        logger.info('All workers disconnected, master process exiting');
        process.exit(0);
      }
    });
  });

  // Handle SIGINT for development
  process.on('SIGINT', () => {
    logger.info('Master process received SIGINT, shutting down all workers');

    for (const id in cluster.workers) {
      const worker = cluster.workers[id];
      if (worker) {
        worker.kill('SIGINT');
      }
    }

    process.exit(0);
  });
} else {
  // Worker process
  logger.info(`Worker ${process.pid} starting`);

  // Import and start the HTTP server
  import('./index.js')
    .then(() => {
      logger.info(`Worker ${process.pid} HTTP server started successfully`);
    })
    .catch((error) => {
      logger.error(error, `Worker ${process.pid} failed to start`);
      process.exit(1);
    });
}
