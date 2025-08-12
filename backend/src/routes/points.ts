import express from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase-admin';
import { calculateTaskPoints } from '../lib/points';
import { authenticateToken, requireEmailVerification, requireAdmin } from '../middleware/auth';
import logger from '../utils/logger';

const router = express.Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const pointsQuerySchema = z.object({
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(100)).optional(),
  offset: z.string().transform(val => parseInt(val)).pipe(z.number().min(0)).optional(),
  period: z.enum(['all', 'week', 'month', 'year']).optional(),
});

const leaderboardQuerySchema = z.object({
  skill: z.string().optional(),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(100)).optional(),
  offset: z.string().transform(val => parseInt(val)).pipe(z.number().min(0)).optional(),
});

// ============================================================================
// RANK SYSTEM CONSTANTS
// ============================================================================

const RANK_THRESHOLDS = {
  Bronze: 0,
  Silver: 1000,
  Gold: 5000,
  Platinum: 10000,
  Diamond: 25000,
};

const RANK_BENEFITS = {
  Bronze: {
    name: 'Bronze',
    points: 0,
    benefits: ['Profile badge', '5% course discount', '+5 credits/month'],
    color: '#CD7F32',
  },
  Silver: {
    name: 'Silver',
    points: 1000,
    benefits: ['Profile highlight', 'Priority listing (1 gig)', '+10 credits/month'],
    color: '#C0C0C0',
  },
  Gold: {
    name: 'Gold',
    points: 5000,
    benefits: ['Featured searches', 'Priority (3 gigs)', '+20 credits/month'],
    color: '#FFD700',
  },
  Platinum: {
    name: 'Platinum',
    points: 10000,
    benefits: ['Homepage spotlight', 'Featured status', '+50 credits/month'],
    color: '#E5E4E2',
  },
  Diamond: {
    name: 'Diamond',
    points: 25000,
    benefits: ['VIP support', 'Exclusive opportunities', '+100 credits/month'],
    color: '#B9F2FF',
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate user's rank based on total points
 */
function calculateRank(points: number): string {
  if (points >= RANK_THRESHOLDS.Diamond) return 'Diamond';
  if (points >= RANK_THRESHOLDS.Platinum) return 'Platinum';
  if (points >= RANK_THRESHOLDS.Gold) return 'Gold';
  if (points >= RANK_THRESHOLDS.Silver) return 'Silver';
  return 'Bronze';
}

/**
 * Get progress towards next rank
 */
function getRankProgress(points: number): {
  currentRank: string;
  nextRank: string | null;
  progress: number;
  pointsToNext: number;
} {
  const currentRank = calculateRank(points);
  const rankNames = Object.keys(RANK_THRESHOLDS);
  const currentIndex = rankNames.indexOf(currentRank);
  
  if (currentIndex === rankNames.length - 1) {
    // User is at max rank
    return {
      currentRank,
      nextRank: null,
      progress: 100,
      pointsToNext: 0,
    };
  }

  const nextRank = rankNames[currentIndex + 1];
  const currentThreshold = RANK_THRESHOLDS[currentRank as keyof typeof RANK_THRESHOLDS];
  const nextThreshold = RANK_THRESHOLDS[nextRank as keyof typeof RANK_THRESHOLDS];
  
  const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  const pointsToNext = nextThreshold - points;

  return {
    currentRank,
    nextRank,
    progress: Math.min(100, Math.max(0, progress)),
    pointsToNext,
  };
}

/**
 * Update user's rank and trigger any rank-up benefits
 */
async function updateUserRank(userId: string, newPoints: number): Promise<{
  oldRank: string;
  newRank: string;
  rankUp: boolean;
}> {
  // Get current user data
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('rank, rank_level, total_points')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    throw new Error('User not found');
  }

  const oldRank = user.rank_level || 'Bronze';
  const newRank = calculateRank(newPoints);
  const rankUp = newRank !== oldRank;

  // Update user rank if changed
  if (rankUp) {
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        rank: newRank,
        rank_level: newRank,
        total_points: newPoints,
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error('Failed to update user rank');
    }

    logger.info('🎉 User ranked up', {
      userId,
      oldRank,
      newRank,
      points: newPoints,
    });
  } else {
    // Just update points
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ total_points: newPoints })
      .eq('id', userId);

    if (updateError) {
      throw new Error('Failed to update user points');
    }
  }

  return { oldRank, newRank, rankUp };
}

// ============================================================================
// POINTS ROUTES
// ============================================================================

// GET /api/points/breakdown - Get user's points breakdown
router.get('/breakdown', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    const validatedQuery = pointsQuerySchema.parse(req.query);
    const { limit = 20, offset = 0, period = 'all' } = validatedQuery;

    logger.info('📊 Fetching points breakdown', {
      userId: req.user!.id,
      period,
      limit,
      offset,
    });

    // Build date filter
    let dateFilter = '';
    if (period !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      
      dateFilter = `created_at.gte.${startDate.toISOString()}`;
    }

    // Get points history
    let query = supabaseAdmin
      .from('points_history')
      .select(`
        id, points_change, reason, previous_total, new_total, created_at,
        submissions!inner (
          id, tasks!inner (title, skill_category)
        )
      `)
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (dateFilter) {
      query = query.filter(dateFilter);
    }

    const { data: history, error: historyError } = await query;

    if (historyError) {
      logger.error('❌ Failed to fetch points history:', { error: historyError.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch points history',
        timestamp: new Date().toISOString(),
      });
    }

    // Get total count
    let countQuery = supabaseAdmin
      .from('points_history')
      .select('id', { count: 'exact' })
      .eq('user_id', req.user!.id);

    if (dateFilter) {
      countQuery = countQuery.filter(dateFilter);
    }

    const { count: totalCount } = await countQuery;

    // Get current user data
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('total_points, rank, rank_level')
      .eq('id', req.user!.id)
      .single();

    // Calculate rank progress
    const rankProgress = getRankProgress(user?.total_points || 0);

    // Calculate statistics
    const totalEarned = history?.reduce((sum, entry) => sum + Math.max(0, entry.points_change), 0) || 0;
    const totalSpent = history?.reduce((sum, entry) => sum + Math.abs(Math.min(0, entry.points_change)), 0) || 0;

    logger.info('✅ Points breakdown fetched successfully', {
      userId: req.user!.id,
      historyCount: history?.length || 0,
      totalCount,
    });

    res.json({
      success: true,
      data: {
        currentPoints: user?.total_points || 0,
        currentRank: user?.rank_level || 'Bronze',
        rankProgress,
        totalEarned,
        totalSpent,
        history: history || [],
        pagination: {
          limit,
          offset,
          total: totalCount || 0,
          hasMore: (offset + limit) < (totalCount || 0),
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Points query validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Points breakdown error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/points/calculate - Calculate points for a submission (for testing)
router.get('/calculate', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    const { submission_id } = req.query;

    if (!submission_id) {
      return res.status(400).json({
        success: false,
        error: 'Submission ID is required',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('🧮 Calculating points for submission', {
      submissionId: submission_id,
      userId: req.user!.id,
    });

    // Get submission with task data
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('submissions')
      .select(`
        id, proof_type, proof_strength, score, status,
        tasks!inner (
          id, title, description, skill_category,
          duration_factor, skill_factor, complexity_factor,
          visibility_factor, prestige_factor, autonomy_factor
        )
      `)
      .eq('id', submission_id)
      .eq('user_id', req.user!.id)
      .single();

    if (submissionError || !submission) {
      logger.warn('❌ Submission not found or access denied', { submissionId: submission_id });
      return res.status(404).json({
        success: false,
        error: 'Submission not found or access denied',
        timestamp: new Date().toISOString(),
      });
    }

    // Calculate points using Service Points Formula v5
    const pointsResult = calculateTaskPoints(
      submission.score || 0,
      {
        id: submission.tasks.id,
        title: submission.tasks.title,
        description: submission.tasks.description,
        skill_area: submission.tasks.skill_category,
        duration: submission.tasks.duration_factor,
        skill: submission.tasks.skill_factor,
        complexity: submission.tasks.complexity_factor,
        visibility: submission.tasks.visibility_factor,
        prestige: submission.tasks.prestige_factor,
        autonomy: submission.tasks.autonomy_factor,
        created_at: new Date().toISOString(),
        is_active: true,
      },
      submission.proof_strength || 0,
      true // Include breakdown
    );

    logger.info('✅ Points calculated successfully', {
      submissionId: submission_id,
      pointsAwarded: pointsResult.pointsAwarded,
    });

    res.json({
      success: true,
      data: {
        submission: {
          id: submission.id,
          proof_type: submission.proof_type,
          proof_strength: submission.proof_strength,
          score: submission.score,
          status: submission.status,
        },
        task: {
          id: submission.tasks.id,
          title: submission.tasks.title,
          skill_category: submission.tasks.skill_category,
        },
        pointsCalculation: pointsResult,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Points calculation error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================================
// RANKING ROUTES
// ============================================================================

// GET /api/ranks/progress - Get user's rank progress
router.get('/progress', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    logger.info('📈 Fetching rank progress', { userId: req.user!.id });

    // Get user data
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('total_points, rank, rank_level')
      .eq('id', req.user!.id)
      .single();

    if (userError || !user) {
      logger.error('❌ User not found for rank progress', { userId: req.user!.id });
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Calculate rank progress
    const rankProgress = getRankProgress(user.total_points || 0);
    const currentRankInfo = RANK_BENEFITS[rankProgress.currentRank as keyof typeof RANK_BENEFITS];
    const nextRankInfo = rankProgress.nextRank 
      ? RANK_BENEFITS[rankProgress.nextRank as keyof typeof RANK_BENEFITS]
      : null;

    logger.info('✅ Rank progress fetched successfully', {
      userId: req.user!.id,
      currentRank: rankProgress.currentRank,
      progress: rankProgress.progress,
    });

    res.json({
      success: true,
      data: {
        currentRank: {
          name: currentRankInfo.name,
          points: currentRankInfo.points,
          benefits: currentRankInfo.benefits,
          color: currentRankInfo.color,
        },
        nextRank: nextRankInfo ? {
          name: nextRankInfo.name,
          points: nextRankInfo.points,
          benefits: nextRankInfo.benefits,
          color: nextRankInfo.color,
        } : null,
        progress: rankProgress.progress,
        pointsToNext: rankProgress.pointsToNext,
        currentPoints: user.total_points || 0,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Rank progress error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/ranks/info - Get rank system information
router.get('/info', async (req, res) => {
  try {
    logger.info('📋 Fetching rank system information');

    res.json({
      success: true,
      data: {
        ranks: Object.values(RANK_BENEFITS),
        thresholds: RANK_THRESHOLDS,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Rank info error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================================
// LEADERBOARD ROUTES
// ============================================================================

// GET /api/leaderboard - Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const validatedQuery = leaderboardQuerySchema.parse(req.query);
    const { skill, limit = 50, offset = 0 } = validatedQuery;

    logger.info('🏆 Fetching leaderboard', {
      skill,
      limit,
      offset,
    });

    // Build query
    let query = supabaseAdmin
      .from('leaderboard')
      .select(`
        points, rank_position, last_updated,
        users!inner (
          id, name, username, primary_skill, rank, rank_level, avatar_url
        )
      `)
      .order('points', { ascending: false })
      .range(offset, offset + limit - 1);

    if (skill) {
      query = query.eq('skill_category', skill);
    }

    const { data: leaderboard, error: leaderboardError } = await query;

    if (leaderboardError) {
      logger.error('❌ Failed to fetch leaderboard:', { error: leaderboardError.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch leaderboard',
        timestamp: new Date().toISOString(),
      });
    }

    // Get total count
    let countQuery = supabaseAdmin
      .from('leaderboard')
      .select('id', { count: 'exact' });

    if (skill) {
      countQuery = countQuery.eq('skill_category', skill);
    }

    const { count: totalCount } = await countQuery;

    // Format leaderboard data
    const formattedLeaderboard = leaderboard?.map((entry, index) => ({
      position: offset + index + 1,
      user: {
        id: entry.users.id,
        name: entry.users.name,
        username: entry.users.username,
        primary_skill: entry.users.primary_skill,
        rank: entry.users.rank_level,
        avatar_url: entry.users.avatar_url,
      },
      points: entry.points,
      last_updated: entry.last_updated,
    })) || [];

    logger.info('✅ Leaderboard fetched successfully', {
      count: formattedLeaderboard.length,
      totalCount,
    });

    res.json({
      success: true,
      data: {
        leaderboard: formattedLeaderboard,
        pagination: {
          limit,
          offset,
          total: totalCount || 0,
          hasMore: (offset + limit) < (totalCount || 0),
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Leaderboard query validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Leaderboard error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/leaderboard/my-position - Get user's leaderboard position
router.get('/leaderboard/my-position', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    const { skill } = req.query;

    logger.info('🏆 Fetching user leaderboard position', {
      userId: req.user!.id,
      skill,
    });

    // Get user's leaderboard entry
    let query = supabaseAdmin
      .from('leaderboard')
      .select('points, rank_position, skill_category')
      .eq('user_id', req.user!.id);

    if (skill) {
      query = query.eq('skill_category', skill);
    }

    const { data: userEntry, error: userError } = await query.single();

    if (userError || !userEntry) {
      logger.warn('❌ User not found in leaderboard', { userId: req.user!.id });
      return res.status(404).json({
        success: false,
        error: 'User not found in leaderboard',
        timestamp: new Date().toISOString(),
      });
    }

    // Get total participants
    let countQuery = supabaseAdmin
      .from('leaderboard')
      .select('id', { count: 'exact' });

    if (skill) {
      countQuery = countQuery.eq('skill_category', skill);
    }

    const { count: totalParticipants } = await countQuery;

    logger.info('✅ User leaderboard position fetched successfully', {
      userId: req.user!.id,
      position: userEntry.rank_position,
      totalParticipants,
    });

    res.json({
      success: true,
      data: {
        position: userEntry.rank_position,
        points: userEntry.points,
        skill_category: userEntry.skill_category,
        total_participants: totalParticipants || 0,
        percentile: totalParticipants ? Math.round(((totalParticipants - userEntry.rank_position) / totalParticipants) * 100) : 0,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ User leaderboard position error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================================
// ADMIN ROUTES
// ============================================================================

// POST /api/points/adjust - Manually adjust user points (admin only)
router.post('/adjust', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { user_id, points_change, reason } = req.body;

    if (!user_id || points_change === undefined || !reason) {
      return res.status(400).json({
        success: false,
        error: 'User ID, points change, and reason are required',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('🔧 Admin adjusting user points', {
      adminId: req.user!.id,
      userId: user_id,
      pointsChange: points_change,
      reason,
    });

    // Get current user data
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('total_points, rank_level')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      logger.warn('❌ User not found for points adjustment', { userId: user_id });
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString(),
      });
    }

    const previousTotal = user.total_points || 0;
    const newTotal = Math.max(0, previousTotal + points_change);

    // Update user points and rank
    const rankUpdate = await updateUserRank(user_id, newTotal);

    // Log points change
    const { error: historyError } = await supabaseAdmin
      .from('points_history')
      .insert({
        user_id,
        points_change,
        reason: `Admin adjustment: ${reason}`,
        previous_total: previousTotal,
        new_total: newTotal,
        admin_id: req.user!.id,
      });

    if (historyError) {
      logger.error('❌ Failed to log points history:', { error: historyError.message });
      // Don't fail the request, just log the error
    }

    // Update leaderboard
    await supabaseAdmin
      .from('leaderboard')
      .upsert({
        user_id,
        points: newTotal,
        last_updated: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    logger.info('✅ Points adjusted successfully', {
      userId: user_id,
      pointsChange,
      previousTotal,
      newTotal,
      rankUp: rankUpdate.rankUp,
    });

    res.json({
      success: true,
      message: 'Points adjusted successfully',
      data: {
        user_id,
        points_change,
        previous_total: previousTotal,
        new_total: newTotal,
        rank_update: rankUpdate,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Points adjustment error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
