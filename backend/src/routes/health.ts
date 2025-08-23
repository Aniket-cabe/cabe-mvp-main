import express, { Router, Request, Response } from 'express';
import pool from '../../db/pool';
import logger from '../utils/logger';

const router = Router();

// Health check endpoint
router.get('/', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'unknown',
      redis: 'unknown'
    },
    version: process.env.npm_package_version || '1.0.0'
  };

  try {
    // Check database connectivity
    try {
      const client = await pool.connect();
      await client.query('SELECT 1 as ok');
      client.release();
      health.services.database = 'up';
      logger.debug('Health check: Database connection successful');
    } catch (dbError) {
      health.services.database = 'down';
      health.status = 'degraded';
      logger.warn('Health check: Database connection failed', { error: dbError });
    }

    // Check Redis connectivity (if configured)
    try {
      const redisUrl = process.env.REDIS_URL;
      if (redisUrl && redisUrl !== 'redis://127.0.0.1:6379') {
        // Only check if Redis is actually configured (not default localhost)
        const { createClient } = await import('redis');
        const redis = createClient({ url: redisUrl });
        await redis.connect();
        await redis.ping();
        await redis.disconnect();
        health.services.redis = 'up';
        logger.debug('Health check: Redis connection successful');
      } else {
        health.services.redis = 'no-redis';
        logger.debug('Health check: Redis not configured');
      }
    } catch (redisError) {
      health.services.redis = 'down';
      health.status = 'degraded';
      logger.warn('Health check: Redis connection failed', { error: redisError });
    }

    // Determine overall status
    if (health.services.database === 'down') {
      health.status = 'error';
    }

    const responseTime = Date.now() - startTime;
    res.set('X-Response-Time', `${responseTime}ms`);
    
    const statusCode = health.status === 'error' ? 503 : 200;
    res.status(statusCode).json(health);

  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      error: 'Health check failed'
    });
  }
});

// Simple ping endpoint
router.get('/ping', (req: Request, res: Response) => {
  res.status(200).json({ 
    pong: true, 
    timestamp: new Date().toISOString() 
  });
});

export default router;
