import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pino from 'pino';
import { createClient } from 'redis';
import jwt from 'jsonwebtoken';

dotenv.config();

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: { target: 'pino-pretty', options: { colorize: true } },
});

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
});

const app = express();
const PORT = process.env.PORT || 4001;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'tasks',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'CaBE Arena Tasks Service',
    version: '1.0.0',
    status: 'running',
  });
});

// API routes placeholder
app.use('/api/tasks', (req, res, next) => {
  const auth = req.headers['authorization'];
  const token = auth?.toString().split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    (req as any).user = decoded;
    return res.json({ message: 'Tasks API - OK', user: decoded });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
);

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await redisClient.quit();
  process.exit(0);
});

async function startServer() {
  try {
    await redisClient.connect();
    app.listen(PORT, () => {
      logger.info(`🚀 Tasks Service started on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
