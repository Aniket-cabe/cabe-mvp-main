const pino = require('pino');

const transport = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: true,
    ignore: 'pid,hostname',
    translateTime: 'yyyy-mm-dd HH:MM:ss',
  },
});

const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    base: {
      env: process.env.NODE_ENV || 'development',
    },
  },
  transport
);

module.exports = logger;
