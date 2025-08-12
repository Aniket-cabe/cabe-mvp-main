import express from 'express';
import cors from 'cors';
import compression from 'compression';
import 'express-async-errors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { promClient } from 'prom-client';
import statusMonitor from 'express-status-monitor';
import { router as ssoRoutes } from './routes/sso.routes';

// Import middleware
import {
  rateLimitMiddleware,
  slowDownMiddleware,
  requestLogger,
  errorHandler,
  securityHeaders,
  corsOptions,
  requestSizeLimit,
  helmetConfig,
  xssProtection,
  hppProtection,
  mongoSanitizeProtection,
  sqlInjectionProtection,
} from './middleware/security';
import {
  generateCSRFTokenMiddleware,
  validateCSRFTokenMiddleware,
  refreshCSRFTokenMiddleware,
  cleanupCSRFTokenMiddleware,
} from './middleware/csrf';

// Import routes
import arenaRouter from './routes/arena';
import adminApiRouter from './routes/admin-api-router';
import metricsRealtimeRouter from './routes/metrics.realtime';
import integrationsRouter from './routes/integrations.routes';
import uploadsRouter from './routes/uploads';
import tasksRouter from './routes/tasks';
import pointsRouter from './routes/points';
import cabotRouter from './routes/cabot';
import taskForgeRouter from './routes/task-forge';
import pointDecayRouter from './routes/point-decay';
import authRouter from './routes/auth.routes';
import achievementsRouter from './routes/achievements';
import referralsRouter from './routes/referrals';
import adminRouter from './routes/admin';
import performanceRouter from './routes/performance';

// Import utilities
import logger from './utils/logger';
import { env, isDevelopment } from './config/env';

// Import monitoring
import { setupMetrics } from './utils/monitoring';

const app = express();

// ============================================================================
// PROMETHEUS METRICS SETUP
// ============================================================================
const metrics = setupMetrics();
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// ============================================================================
// STATUS MONITOR SETUP
// ============================================================================
app.use(
  statusMonitor({
    title: 'CaBE Arena Status',
    theme: 'default.css',
    path: '/status',
    spans: [
      {
        interval: 1,
        retention: 60,
      },
      {
        interval: 5,
        retention: 60,
      },
      {
        interval: 15,
        retention: 60,
      },
    ],
    chartVisibility: {
      cpu: true,
      mem: true,
      load: true,
      responseTime: true,
      rps: true,
      statusCodes: true,
    },
    healthChecks: [
      {
        protocol: 'http',
        host: 'localhost',
        path: '/health',
        port: env.PORT,
      },
    ],
    ignoreStartsWith: '/admin',
  })
);

// ============================================================================
// SWAGGER API DOCUMENTATION
// ============================================================================
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CaBE Arena API',
      version: '1.0.0',
      description: 'API documentation for CaBE Arena platform',
      contact: {
        name: 'CaBE Arena Support',
        email: 'support@cabe-arena.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
      {
        url: 'https://api.cabe-arena.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Error message' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            rank: {
              type: 'string',
              enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
            },
            points: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            skillArea: {
              type: 'string',
              enum: [
                'ai-ml',
                'cloud-devops',
                'data-analytics',
                'fullstack-dev',
              ],
            },
            difficulty: {
              type: 'string',
              enum: ['easy', 'medium', 'hard', 'expert'],
            },
            points: { type: 'number' },
            isActive: { type: 'boolean' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/types/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'CaBE Arena API Documentation',
    customfavIcon: '/favicon.ico',
  })
);

// ============================================================================
// SECURITY MIDDLEWARE (ORDER MATTERS!)
// ============================================================================

// 1. Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// 1.1 Enforce HTTPS in production behind proxies
app.use((req, res, next) => {
  const xfp = req.headers['x-forwarded-proto'];
  if (isDevelopment || req.secure || xfp === 'https') return next();
  const host = req.headers.host;
  const url = `https://${host}${req.originalUrl}`;
  return res.redirect(301, url);
});

// 2. Helmet security headers
app.use(helmetConfig);

// 3. CORS configuration
app.use(cors(corsOptions));

// 4. Compression
app.use(compression());

// 5. Body parsing with size limits
app.use(express.json(requestSizeLimit));
app.use(express.urlencoded({ ...requestSizeLimit, extended: true }));

// 6. Security middleware
app.use(xssProtection);
app.use(hppProtection);
app.use(mongoSanitizeProtection);
app.use(sqlInjectionProtection);
app.use(securityHeaders);

// 7. Rate limiting
app.use(rateLimitMiddleware);
app.use(slowDownMiddleware);

// 8. CSRF protection
app.use(generateCSRFTokenMiddleware);
app.use(validateCSRFTokenMiddleware);
app.use(refreshCSRFTokenMiddleware);
app.use(cleanupCSRFTokenMiddleware);

// 9. Request logging
app.use(requestLogger);

// ============================================================================
// HEALTH CHECK ENDPOINTS
// ============================================================================

// Basic health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    worker: process.pid,
    environment: env.NODE_ENV,
    version: '1.0.0',
  });
});

// Detailed health check
app.get('/health/detailed', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await checkDatabaseHealth();

    // Check AI service
    const aiStatus = await checkAIServiceHealth();

    // Check external services
    const externalStatus = await checkExternalServices();

    const overallStatus =
      dbStatus && aiStatus && externalStatus ? 'healthy' : 'degraded';

    res.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      worker: process.pid,
      environment: env.NODE_ENV,
      services: {
        database: dbStatus ? 'healthy' : 'unhealthy',
        ai: aiStatus ? 'healthy' : 'unhealthy',
        external: externalStatus ? 'healthy' : 'unhealthy',
      },
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
    });
  } catch (error) {
    logger.error('Health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// ============================================================================
// API ROUTES
// ============================================================================

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    message: 'CaBE Arena API is running',
    version: '1.0.0',
    environment: env.NODE_ENV,
    worker: process.pid,
    port: env.PORT,
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api/arena', arenaRouter);
app.use('/api/admin-api', adminApiRouter);
app.use('/api/admin', adminRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/metrics', metricsRealtimeRouter);
app.use('/api/integrations', integrationsRouter);
app.use('/api/auth', ssoRoutes);
app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/points', pointsRouter);
app.use('/api/cabot', cabotRouter);
app.use('/api/task-forge', taskForgeRouter);
app.use('/api/point-decay', pointDecayRouter);
app.use('/api/achievements', achievementsRouter);
app.use('/api/referrals', referralsRouter);
app.use('/api/performance', performanceRouter);

// Mount versioned API routes
import v1Router from './routes/v1';
app.use('/api/v1', v1Router);

logger.info('🎯 Arena API mounted at /api/arena');
logger.info('🛡️ Admin API mounted at /api/admin-api');
logger.info('👨‍💼 Admin Panel mounted at /api/admin');
logger.info('⬆️ Uploads API mounted at /api/uploads');
logger.info('📈 Metrics API mounted at /api/metrics');
logger.info('🔗 Integrations API mounted at /api/integrations');
logger.info('🔐 SSO Auth routes mounted at /api/auth');
logger.info('📋 Tasks API mounted at /api/tasks');
logger.info('🏆 Points API mounted at /api/points');
logger.info('🤖 CaBOT API mounted at /api/cabot');
logger.info('🎯 Task Forge API mounted at /api/task-forge');
logger.info('📉 Point Decay API mounted at /api/point-decay');
logger.info('🏆 Achievements API mounted at /api/achievements');
logger.info('👥 Referrals API mounted at /api/referrals');
logger.info('⚡ Performance API mounted at /api/performance');

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use('*', (req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.url,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // TODO: Implement actual database health check
    // For now, return true as placeholder
    return true;
  } catch (error) {
    logger.error('Database health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

async function checkAIServiceHealth(): Promise<boolean> {
  try {
    // TODO: Implement actual AI service health check
    // For now, return true as placeholder
    return true;
  } catch (error) {
    logger.error('AI service health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

async function checkExternalServices(): Promise<boolean> {
  try {
    // TODO: Implement actual external service health checks
    // For now, return true as placeholder
    return true;
  } catch (error) {
    logger.error('External services health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================

if (isDevelopment) {
  // Development-only endpoints
  app.get('/api/dev/test-supabase', async (req, res) => {
    try {
      // TODO: Implement Supabase connection test
      res.json({
        message: 'Supabase connection test endpoint',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Supabase test failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        error: 'Supabase test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  logger.info('🔧 Development mode enabled');
  logger.info(`🚀 Server will run on port: ${env.PORT}`);
  logger.info(`📝 Log level: ${env.LOG_LEVEL}`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
}

export default app;
