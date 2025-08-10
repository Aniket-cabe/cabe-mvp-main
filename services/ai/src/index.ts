import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pino from 'pino';

dotenv.config();

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: { target: 'pino-pretty', options: { colorize: true } },
});

const app = express();
const PORT = process.env.PORT || 4002;

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
    service: 'ai',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'CaBE Arena AI Service',
    version: '1.0.0',
    status: 'running',
  });
});

// AI API routes
app.get('/api/ai/', (req, res) => {
  res.json({ message: 'AI Service - Coming soon!' });
});

app.post('/api/ai/plagiarism', (req, res) => {
  res.json({ message: 'Plagiarism detection endpoint' });
});

app.post('/api/ai/suggest', (req, res) => {
  const { code = '', language = 'javascript' } = req.body || {};
  const suggestions = [
    { line: 1, message: 'Use const instead of var for immutability' },
    { line: 3, message: 'Add JSDoc for function documentation' },
  ];
  res.json({ suggestions, language });
});

app.get('/api/ai/learning-paths', (req, res) => {
  res.json({ message: 'Learning paths endpoint' });
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

async function startServer() {
  try {
    app.listen(PORT, () => {
      logger.info(`🚀 AI Service started on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
