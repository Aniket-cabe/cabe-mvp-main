/**
 * CaBE Arena Point Decay API Routes
 * 
 * Handles point decay management, history, and statistics.
 */

import express from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase-admin';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import logger from '../utils/logger';
import {
  processUserDecay,
  processAllUsersDecay,
  getUserDecayHistory,
  getDecayStatistics,
  runScheduledDecay,
  shouldRunQuarterlyDecay,
  DECAY_CONFIG,
} from '../services/point-decay.service';

const router = express.Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const userDecaySchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
});

const bulkDecaySchema = z.object({
  force: z.boolean().optional(),
  dry_run: z.boolean().optional(),
});

const scheduledDecaySchema = z.object({
  force: z.boolean().optional(),
});

// ============================================================================
// DECAY PROCESSING ROUTES
// ============================================================================

// POST /api/point-decay/process/user - Process decay for specific user
router.post('/process/user', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validatedData = userDecaySchema.parse(req.body);
    const { user_id } = validatedData;

    logger.info('🔄 Processing point decay for user', { userId: user_id });

    const result = await processUserDecay(user_id);

    if (!result.success) {
      logger.error('❌ User decay processing failed:', { error: result.error });
      return res.status(400).json({
        success: false,
        error: 'Failed to process user decay',
        details: result.error,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ User decay processed successfully', {
      userId: user_id,
      results: result.results?.length || 0,
    });

    res.json({
      success: true,
      message: 'User decay processed successfully',
      data: {
        results: result.results || [],
        totalDecay: result.results?.reduce((sum, r) => sum + r.decayAmount, 0) || 0,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ User decay validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ User decay processing error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/point-decay/process/bulk - Process decay for all users
router.post('/process/bulk', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validatedData = bulkDecaySchema.parse(req.body);
    const { force = false, dry_run = false } = validatedData;

    logger.info('🔄 Bulk point decay processing requested', { force, dryRun: dry_run });

    if (dry_run) {
      // Get users eligible for decay without actually processing
      const { data: eligibleUsers, error: usersError } = await supabaseAdmin
        .from('users')
        .select('id, total_points, primary_skill, secondary_skills, last_activity')
        .gte('total_points', DECAY_CONFIG.MIN_POINTS_FOR_DECAY)
        .eq('is_suspended', false);

      if (usersError) {
        throw new Error('Failed to fetch eligible users');
      }

      logger.info('✅ Dry run completed', {
        eligibleUsers: eligibleUsers?.length || 0,
      });

      return res.json({
        success: true,
        message: 'Dry run completed',
        data: {
          eligibleUsers: eligibleUsers?.length || 0,
          users: eligibleUsers || [],
          dryRun: true,
        },
        timestamp: new Date().toISOString(),
      });
    }

    const result = await processAllUsersDecay();

    if (!result.success) {
      logger.error('❌ Bulk decay processing failed:', { errors: result.errors });
      return res.status(500).json({
        success: false,
        error: 'Failed to process bulk decay',
        details: result.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Bulk decay processing completed', {
      processed: result.processed,
      totalDecay: result.totalDecay,
      errors: result.errors.length,
    });

    res.json({
      success: true,
      message: 'Bulk decay processing completed',
      data: {
        processed: result.processed,
        totalDecay: result.totalDecay,
        errors: result.errors,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Bulk decay validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Bulk decay processing error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/point-decay/scheduled - Run scheduled quarterly decay
router.post('/scheduled', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validatedData = scheduledDecaySchema.parse(req.body);
    const { force = false } = validatedData;

    logger.info('🔄 Scheduled decay requested', { force });

    const result = await runScheduledDecay();

    if (!result.success) {
      logger.error('❌ Scheduled decay failed:', { error: result.error });
      return res.status(500).json({
        success: false,
        error: 'Failed to run scheduled decay',
        details: result.error,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Scheduled decay completed', {
      ran: result.ran,
      results: result.results,
    });

    res.json({
      success: true,
      message: result.ran ? 'Scheduled decay completed' : 'Scheduled decay not due yet',
      data: {
        ran: result.ran,
        results: result.results,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Scheduled decay validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Scheduled decay error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================================
// DECAY HISTORY ROUTES
// ============================================================================

// GET /api/point-decay/history/user/:userId - Get decay history for user
router.get('/history/user/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    logger.info('📊 Fetching decay history for user', {
      userId,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    const result = await getUserDecayHistory(
      userId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    if (!result.success) {
      logger.error('❌ Failed to fetch decay history:', { error: result.error });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch decay history',
        details: result.error,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Decay history fetched successfully', {
      userId,
      count: result.history?.length || 0,
      total: result.total,
    });

    res.json({
      success: true,
      data: {
        history: result.history || [],
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total: result.total || 0,
          hasMore: (parseInt(offset as string) + parseInt(limit as string)) < (result.total || 0),
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Decay history error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/point-decay/history/global - Get global decay history
router.get('/history/global', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0, skill_category } = req.query;

    logger.info('📊 Fetching global decay history', {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      skill_category,
    });

    // Build query
    let query = supabaseAdmin
      .from('point_decay_history')
      .select(`
        *,
        users!inner (id, email, name, primary_skill)
      `)
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (skill_category) {
      query = query.eq('skill_category', skill_category);
    }

    const { data: history, error: historyError } = await query;

    if (historyError) {
      throw new Error('Failed to fetch decay history');
    }

    // Get total count
    let countQuery = supabaseAdmin
      .from('point_decay_history')
      .select('id', { count: 'exact' });

    if (skill_category) {
      countQuery = countQuery.eq('skill_category', skill_category);
    }

    const { count: totalCount } = await countQuery;

    logger.info('✅ Global decay history fetched successfully', {
      count: history?.length || 0,
      totalCount,
    });

    res.json({
      success: true,
      data: {
        history: history || [],
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total: totalCount || 0,
          hasMore: (parseInt(offset as string) + parseInt(limit as string)) < (totalCount || 0),
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Global decay history error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================================
// STATISTICS ROUTES
// ============================================================================

// GET /api/point-decay/stats - Get decay statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    logger.info('📊 Fetching decay statistics');

    const result = await getDecayStatistics();

    if (!result.success) {
      logger.error('❌ Failed to fetch decay statistics:', { error: result.error });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch decay statistics',
        details: result.error,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Decay statistics fetched successfully');

    res.json({
      success: true,
      data: result.stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Decay statistics error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/point-decay/schedule - Check scheduled decay status
router.get('/schedule', authenticateToken, requireAdmin, async (req, res) => {
  try {
    logger.info('⏰ Checking scheduled decay status');

    const scheduleCheck = await shouldRunQuarterlyDecay();

    logger.info('✅ Schedule check completed', {
      shouldRun: scheduleCheck.shouldRun,
      lastRun: scheduleCheck.lastRun,
      nextRun: scheduleCheck.nextRun,
    });

    res.json({
      success: true,
      data: {
        shouldRun: scheduleCheck.shouldRun,
        lastRun: scheduleCheck.lastRun,
        nextRun: scheduleCheck.nextRun,
        config: {
          quarterlyPercentage: DECAY_CONFIG.QUARTERLY_PERCENTAGE,
          decayIntervalDays: DECAY_CONFIG.DECAY_INTERVAL_DAYS,
          minPointsForDecay: DECAY_CONFIG.MIN_POINTS_FOR_DECAY,
          activityThresholdDays: DECAY_CONFIG.ACTIVITY_THRESHOLD_DAYS,
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Schedule check error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================================
// CONFIGURATION ROUTES
// ============================================================================

// GET /api/point-decay/config - Get decay configuration
router.get('/config', authenticateToken, requireAdmin, async (req, res) => {
  try {
    logger.info('⚙️ Fetching decay configuration');

    res.json({
      success: true,
      data: {
        config: DECAY_CONFIG,
        description: {
          quarterlyPercentage: 'Percentage of points to decay per quarter',
          decayIntervalDays: 'Number of days between decay runs',
          minPointsForDecay: 'Minimum points required before decay applies',
          activityThresholdDays: 'Days of inactivity before decay triggers',
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Decay config error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
