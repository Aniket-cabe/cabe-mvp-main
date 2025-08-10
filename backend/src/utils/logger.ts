import pino from 'pino';
import { envWithHelpers, env } from '../config/env';

// Configure transport based on environment
const transport = envWithHelpers.isDevelopment
  ? pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'yyyy-mm-dd HH:MM:ss',
      },
    })
  : undefined;

// Create logger instance
const logger = pino(
  {
    level: env.LOG_LEVEL,
    base: {
      env: env.NODE_ENV,
    },
  },
  transport
);

export default logger;
