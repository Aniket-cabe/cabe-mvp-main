import express from 'express';
import { z } from 'zod';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import performanceService from '../services/performance.service';
import logger from '../utils/logger';

const router = express.Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const optimizationSchema = z.object({
  type: z.enum(['cache', 'database', 'all']),
  force: z.boolean().optional(),
});

const cacheOperationSchema = z.object({
  operation: z.enum(['clear', 'stats', 'get', 'delete']),
  key: z.string().optional(),
});

// ============================================================================
// PERFORMANCE MONITORING ROUTES
// ============================================================================

// GET /api/performance/metrics - Get system performance metrics
router.get('/metrics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    logger.info('📊 Performance metrics requested', { adminId: req.user!.id });

    const metrics = performanceService.getPerformanceMetrics();
    const isUnderLoad = performanceService.isSystemUnderLoad();

    logger.info('✅ Performance metrics fetched successfully', { adminId: req.user!.id });

    res.json({
      success: true,
      data: {
        ...metrics,
        isUnderLoad,
        recommendations: isUnderLoad ? [
          'System is under high load',
          'Consider scaling up resources',
          'Cache cleanup recommended',
        ] : [
          'System performance is optimal',
          'All metrics within normal range',
        ],
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Performance metrics error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/performance/cache/stats - Get cache statistics
router.get('/cache/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    logger.info('📊 Cache statistics requested', { adminId: req.user!.id });

    const cacheStats = performanceService.getCacheStats();

    logger.info('✅ Cache statistics fetched successfully', { adminId: req.user!.id });

    res.json({
      success: true,
      data: cacheStats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Cache statistics error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/performance/cache/operation - Perform cache operations
router.post('/cache/operation', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validatedData = cacheOperationSchema.parse(req.body);
    const { operation, key } = validatedData;

    logger.info('🔄 Cache operation requested', {
      adminId: req.user!.id,
      operation,
      key,
    });

    let result: any = {};

    switch (operation) {
      case 'clear':
        performanceService.clearCache();
        result = { message: 'Cache cleared successfully' };
        break;

      case 'stats':
        result = performanceService.getCacheStats();
        break;

      case 'get':
        if (!key) {
          return res.status(400).json({
            success: false,
            error: 'Cache key is required for get operation',
            timestamp: new Date().toISOString(),
          });
        }
        const cachedData = performanceService.getCache(key);
        result = { key, data: cachedData, exists: cachedData !== null };
        break;

      case 'delete':
        if (!key) {
          return res.status(400).json({
            success: false,
            error: 'Cache key is required for delete operation',
            timestamp: new Date().toISOString(),
          });
        }
        performanceService.deleteCache(key);
        result = { message: `Cache key '${key}' deleted successfully` };
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid cache operation',
          timestamp: new Date().toISOString(),
        });
    }

    logger.info('✅ Cache operation completed successfully', {
      adminId: req.user!.id,
      operation,
      key,
    });

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Cache operation validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid cache operation data',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Cache operation error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/performance/optimize - Run performance optimizations
router.post('/optimize', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validatedData = optimizationSchema.parse(req.body);
    const { type, force = false } = validatedData;

    logger.info('🔄 Performance optimization requested', {
      adminId: req.user!.id,
      type,
      force,
    });

    let result: any = {};

    switch (type) {
      case 'cache':
        // Clear cache
        performanceService.clearCache();
        result = {
          message: 'Cache optimization completed',
          operations: ['Cache cleared'],
        };
        break;

      case 'database':
        // Run database optimizations
        const dbResult = await performanceService.optimizeDatabaseQueries();
        result = {
          message: 'Database optimization completed',
          ...dbResult,
        };
        break;

      case 'all':
        // Run all optimizations
        const allResult = await performanceService.runScheduledOptimizations();
        result = {
          message: 'Complete optimization completed',
          ...allResult,
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid optimization type',
          timestamp: new Date().toISOString(),
        });
    }

    logger.info('✅ Performance optimization completed successfully', {
      adminId: req.user!.id,
      type,
      result: result.message,
    });

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Performance optimization validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid optimization data',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Performance optimization error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/performance/health - Get detailed system health
router.get('/health', authenticateToken, requireAdmin, async (req, res) => {
  try {
    logger.info('🏥 System health check requested', { adminId: req.user!.id });

    const metrics = performanceService.getPerformanceMetrics();
    const isUnderLoad = performanceService.isSystemUnderLoad();

    // Calculate health score (0-100)
    const memoryUsage = metrics.memory.heapUsed / metrics.memory.heapTotal;
    const healthScore = Math.max(0, 100 - (memoryUsage * 100));

    // Determine health status
    let healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    if (healthScore >= 90) healthStatus = 'excellent';
    else if (healthScore >= 75) healthStatus = 'good';
    else if (healthScore >= 50) healthStatus = 'fair';
    else if (healthScore >= 25) healthStatus = 'poor';
    else healthStatus = 'critical';

    // Generate recommendations
    const recommendations: string[] = [];
    if (memoryUsage > 0.8) {
      recommendations.push('High memory usage detected - consider scaling up');
    }
    if (metrics.cache.size > 1000) {
      recommendations.push('Large cache size - consider cleanup');
    }
    if (isUnderLoad) {
      recommendations.push('System under load - monitor closely');
    }
    if (recommendations.length === 0) {
      recommendations.push('System health is optimal');
    }

    logger.info('✅ System health check completed', {
      adminId: req.user!.id,
      healthScore,
      healthStatus,
    });

    res.json({
      success: true,
      data: {
        healthScore: Math.round(healthScore),
        healthStatus,
        metrics,
        isUnderLoad,
        recommendations,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ System health check error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/performance/leaderboard/optimized - Get optimized leaderboard
router.get('/leaderboard/optimized', authenticateToken, async (req, res) => {
  try {
    const { skill_category, limit = 50 } = req.query;

    logger.info('🏆 Optimized leaderboard requested', {
      userId: req.user!.id,
      skillCategory: skill_category as string,
      limit: parseInt(limit as string),
    });

    const result = await performanceService.getOptimizedLeaderboard(
      skill_category as string,
      parseInt(limit as string)
    );

    logger.info('✅ Optimized leaderboard fetched successfully', {
      userId: req.user!.id,
      userCount: result.users.length,
      cached: result.cached,
    });

    res.json({
      success: true,
      data: {
        users: result.users,
        cached: result.cached,
        skillCategory: skill_category as string,
        limit: parseInt(limit as string),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Optimized leaderboard error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/performance/user-stats/optimized - Get optimized user stats
router.get('/user-stats/optimized/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    logger.info('👤 Optimized user stats requested', {
      adminId: req.user!.id,
      targetUserId: userId,
    });

    const result = await performanceService.getOptimizedUserStats(userId);

    if (!result.stats) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Optimized user stats fetched successfully', {
      adminId: req.user!.id,
      targetUserId: userId,
      cached: result.cached,
    });

    res.json({
      success: true,
      data: {
        ...result.stats,
        cached: result.cached,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Optimized user stats error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/performance/tasks/optimized - Get optimized task list
router.get('/tasks/optimized', authenticateToken, async (req, res) => {
  try {
    const { skill_category, task_type, limit = 50 } = req.query;

    logger.info('📋 Optimized task list requested', {
      userId: req.user!.id,
      skillCategory: skill_category as string,
      taskType: task_type as string,
      limit: parseInt(limit as string),
    });

    const result = await performanceService.getOptimizedTaskList(
      skill_category as string,
      task_type as string,
      parseInt(limit as string)
    );

    logger.info('✅ Optimized task list fetched successfully', {
      userId: req.user!.id,
      taskCount: result.tasks.length,
      cached: result.cached,
    });

    res.json({
      success: true,
      data: {
        tasks: result.tasks,
        cached: result.cached,
        skillCategory: skill_category as string,
        taskType: task_type as string,
        limit: parseInt(limit as string),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Optimized task list error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/performance/batch/users - Process batch user updates
router.post('/batch/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Updates array is required and must not be empty',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('🔄 Batch user updates requested', {
      adminId: req.user!.id,
      updateCount: updates.length,
    });

    const result = await performanceService.processBatchUserUpdates(updates);

    logger.info('✅ Batch user updates completed', {
      adminId: req.user!.id,
      processed: result.processed,
      errors: result.errors.length,
    });

    res.json({
      success: result.success,
      data: result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Batch user updates error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/performance/batch/submissions - Process batch submissions
router.post('/batch/submissions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { submissions } = req.body;

    if (!Array.isArray(submissions) || submissions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Submissions array is required and must not be empty',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('🔄 Batch submission processing requested', {
      adminId: req.user!.id,
      submissionCount: submissions.length,
    });

    const result = await performanceService.processBatchSubmissions(submissions);

    logger.info('✅ Batch submission processing completed', {
      adminId: req.user!.id,
      processed: result.processed,
      errors: result.errors.length,
    });

    res.json({
      success: result.success,
      data: result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Batch submission processing error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
