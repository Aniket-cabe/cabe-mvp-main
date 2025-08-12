import express from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase-admin';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import logger from '../utils/logger';

const router = express.Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const userActionSchema = z.object({
  action: z.enum(['suspend', 'unsuspend', 'ban', 'unban', 'warn']),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason too long'),
  duration_hours: z.number().optional(),
  points_adjustment: z.number().optional(),
});

const submissionReviewSchema = z.object({
  status: z.enum(['approved', 'rejected', 'flagged']),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason too long'),
  points_adjustment: z.number().optional(),
  fraud_score: z.number().min(0).max(100).optional(),
});

const pointAdjustmentSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  points_change: z.number(),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason too long'),
  category: z.enum(['manual', 'correction', 'bonus', 'penalty']).optional(),
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get user statistics for admin dashboard
 */
async function getUserStats(userId: string) {
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select(`
      id, email, primary_skill, secondary_skills, total_points, rank,
      created_at, last_activity, cabot_credits, is_suspended, is_banned
    `)
    .eq('id', userId)
    .single();

  if (userError || !user) {
    throw new Error('User not found');
  }

  // Get submission statistics
  const { data: submissions } = await supabaseAdmin
    .from('submissions')
    .select('status, points_awarded, submitted_at')
    .eq('user_id', userId);

  // Calculate statistics
  const totalSubmissions = submissions?.length || 0;
  const approvedSubmissions = submissions?.filter(s => s.status === 'approved').length || 0;
  const totalPointsEarned = submissions?.reduce((sum, s) => sum + (s.points_awarded || 0), 0) || 0;

  return {
    user,
    statistics: {
      totalSubmissions,
      approvedSubmissions,
      approvalRate: totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions) * 100 : 0,
      totalPointsEarned,
    },
  };
}

/**
 * Perform user action (suspend, ban, warn, etc.)
 */
async function performUserAction(
  targetUserId: string,
  action: string,
  reason: string,
  adminUserId: string,
  durationHours?: number,
  pointsAdjustment?: number
) {
  const now = new Date();
  let updateData: any = {};

  switch (action) {
    case 'suspend':
      const suspendUntil = durationHours 
        ? new Date(now.getTime() + (durationHours * 60 * 60 * 1000))
        : null;
      updateData = {
        is_suspended: true,
        suspended_until: suspendUntil,
        suspension_reason: reason,
      };
      break;

    case 'unsuspend':
      updateData = {
        is_suspended: false,
        suspended_until: null,
        suspension_reason: null,
      };
      break;

    case 'ban':
      updateData = {
        is_banned: true,
        banned_at: now.toISOString(),
        ban_reason: reason,
      };
      break;

    case 'unban':
      updateData = {
        is_banned: false,
        banned_at: null,
        ban_reason: null,
      };
      break;
  }

  // Update user if there are changes
  if (Object.keys(updateData).length > 0) {
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', targetUserId);

    if (updateError) {
      throw new Error('Failed to update user');
    }
  }

  // Adjust points if specified
  if (pointsAdjustment && pointsAdjustment !== 0) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('total_points')
      .eq('id', targetUserId)
      .single();

    if (user) {
      const newTotal = Math.max(0, (user.total_points || 0) + pointsAdjustment);

      await supabaseAdmin
        .from('users')
        .update({ total_points: newTotal })
        .eq('id', targetUserId);

      // Log point adjustment
      await supabaseAdmin
        .from('points_history')
        .insert({
          user_id: targetUserId,
          points_change: pointsAdjustment,
          reason: `Admin adjustment: ${reason}`,
          metadata: {
            admin_id: adminUserId,
            action,
            original_points: user.total_points || 0,
            new_points: newTotal,
          },
        });
    }
  }

  // Log admin action
  await supabaseAdmin
    .from('admin_audit_log')
    .insert({
      admin_id: adminUserId,
      action,
      target_user_id: targetUserId,
      details: {
        reason,
        duration_hours: durationHours,
        points_adjustment: pointsAdjustment,
      },
      timestamp: now.toISOString(),
    });
}

// ============================================================================
// ADMIN ROUTES
// ============================================================================

// GET /api/admin/dashboard - Get admin dashboard overview
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    logger.info('📊 Admin dashboard requested', { adminId: req.user!.id });

    // Get overall platform statistics
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' });

    const { count: totalSubmissions } = await supabaseAdmin
      .from('submissions')
      .select('id', { count: 'exact' });

    const { count: pendingSubmissions } = await supabaseAdmin
      .from('submissions')
      .select('id', { count: 'exact' })
      .eq('status', 'pending');

    const { count: suspendedUsers } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' })
      .eq('is_suspended', true);

    // Get recent activity
    const { data: recentSubmissions } = await supabaseAdmin
      .from('submissions')
      .select(`
        id, status, points_awarded, submitted_at,
        users!inner(email, primary_skill)
      `)
      .order('submitted_at', { ascending: false })
      .limit(10);

    const { data: fraudAlerts } = await supabaseAdmin
      .from('submissions')
      .select(`
        id, fraud_score, flagged_for_review, submitted_at,
        users!inner(email, primary_skill)
      `)
      .gte('fraud_score', 70)
      .order('fraud_score', { ascending: false })
      .limit(10);

    logger.info('✅ Admin dashboard data fetched successfully', { adminId: req.user!.id });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: totalUsers || 0,
          totalSubmissions: totalSubmissions || 0,
          pendingSubmissions: pendingSubmissions || 0,
          suspendedUsers: suspendedUsers || 0,
        },
        recentActivity: {
          submissions: recentSubmissions || [],
          fraudAlerts: fraudAlerts || [],
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Admin dashboard error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/admin/users - Get user list with filtering
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      status, 
      skill_category,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    logger.info('👥 Admin user list requested', {
      adminId: req.user!.id,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search,
      status,
      skill_category,
    });

    let query = supabaseAdmin
      .from('users')
      .select(`
        id, email, primary_skill, secondary_skills, total_points, rank,
        created_at, last_activity, is_suspended, is_banned, suspended_until
      `);

    // Apply filters
    if (search) {
      query = query.or(`email.ilike.%${search}%,primary_skill.ilike.%${search}%`);
    }

    if (status === 'suspended') {
      query = query.eq('is_suspended', true);
    } else if (status === 'banned') {
      query = query.eq('is_banned', true);
    } else if (status === 'active') {
      query = query.eq('is_suspended', false).eq('is_banned', false);
    }

    if (skill_category) {
      query = query.eq('primary_skill', skill_category);
    }

    // Apply sorting and pagination
    query = query.order(sort_by as string, { ascending: sort_order === 'asc' });
    query = query.range(offset, offset + parseInt(limit as string) - 1);

    const { data: users, error: usersError, count } = await query;

    if (usersError) {
      logger.error('❌ Failed to fetch users:', { error: usersError.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch users',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Admin user list fetched successfully', {
      adminId: req.user!.id,
      userCount: users?.length || 0,
      totalCount: count || 0,
    });

    res.json({
      success: true,
      data: {
        users: users || [],
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: count || 0,
          totalPages: Math.ceil((count || 0) / parseInt(limit as string)),
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Admin user list error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/admin/users/:userId - Get detailed user information
router.get('/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    logger.info('👤 Admin user details requested', {
      adminId: req.user!.id,
      targetUserId: userId,
    });

    const userStats = await getUserStats(userId);

    logger.info('✅ Admin user details fetched successfully', {
      adminId: req.user!.id,
      targetUserId: userId,
    });

    res.json({
      success: true,
      data: userStats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Admin user details error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/admin/users/:userId/action - Perform user action
router.post('/users/:userId/action', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const validatedData = userActionSchema.parse(req.body);
    const { action, reason, duration_hours, points_adjustment } = validatedData;

    logger.info('⚡ Admin user action requested', {
      adminId: req.user!.id,
      targetUserId: userId,
      action,
      reason,
      duration_hours,
      points_adjustment,
    });

    await performUserAction(userId, action, reason, req.user!.id, duration_hours, points_adjustment);

    logger.info('✅ Admin user action completed successfully', {
      adminId: req.user!.id,
      targetUserId: userId,
      action,
    });

    res.json({
      success: true,
      message: `User ${action} successful`,
      data: {
        action,
        reason,
        duration_hours,
        points_adjustment,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Admin user action validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid action data',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Admin user action error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/admin/submissions - Get submission list with filtering
router.get('/submissions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      skill_category,
      flagged_only = false,
      sort_by = 'submitted_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    logger.info('📝 Admin submission list requested', {
      adminId: req.user!.id,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      status,
      skill_category,
      flagged_only: flagged_only === 'true',
    });

    let query = supabaseAdmin
      .from('submissions')
      .select(`
        id, status, points_awarded, submitted_at, reviewed_at, fraud_score, flagged_for_review,
        users!inner(email, primary_skill),
        tasks!inner(title, skill_category)
      `);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (skill_category) {
      query = query.eq('tasks.skill_category', skill_category);
    }

    if (flagged_only === 'true') {
      query = query.eq('flagged_for_review', true);
    }

    // Apply sorting and pagination
    query = query.order(sort_by as string, { ascending: sort_order === 'asc' });
    query = query.range(offset, offset + parseInt(limit as string) - 1);

    const { data: submissions, error: submissionsError, count } = await query;

    if (submissionsError) {
      logger.error('❌ Failed to fetch submissions:', { error: submissionsError.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch submissions',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Admin submission list fetched successfully', {
      adminId: req.user!.id,
      submissionCount: submissions?.length || 0,
      totalCount: count || 0,
    });

    res.json({
      success: true,
      data: {
        submissions: submissions || [],
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: count || 0,
          totalPages: Math.ceil((count || 0) / parseInt(limit as string)),
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Admin submission list error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/admin/submissions/:submissionId/review - Review submission
router.post('/submissions/:submissionId/review', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const validatedData = submissionReviewSchema.parse(req.body);
    const { status, reason, points_adjustment, fraud_score } = validatedData;

    logger.info('🔍 Admin submission review requested', {
      adminId: req.user!.id,
      submissionId,
      status,
      reason,
      points_adjustment,
      fraud_score,
    });

    // Get submission
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('submissions')
      .select('user_id, task_id, points_awarded, status')
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found',
        timestamp: new Date().toISOString(),
      });
    }

    const now = new Date();
    let updateData: any = {
      status,
      reviewed_at: now.toISOString(),
      reviewer_id: req.user!.id,
      review_reason: reason,
    };

    // Adjust points if specified
    if (points_adjustment !== undefined && points_adjustment !== 0) {
      const newPoints = Math.max(0, (submission.points_awarded || 0) + points_adjustment);
      updateData.points_awarded = newPoints;

      // Update user's total points
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('total_points')
        .eq('id', submission.user_id)
        .single();

      if (user) {
        const newUserTotal = Math.max(0, (user.total_points || 0) + points_adjustment);

        await supabaseAdmin
          .from('users')
          .update({ total_points: newUserTotal })
          .eq('id', submission.user_id);

        // Log point adjustment
        await supabaseAdmin
          .from('points_history')
          .insert({
            user_id: submission.user_id,
            submission_id: submissionId,
            points_change: points_adjustment,
            reason: `Admin review adjustment: ${reason}`,
            metadata: {
              admin_id: req.user!.id,
              original_submission_points: submission.points_awarded || 0,
              new_submission_points: newPoints,
              original_user_points: user.total_points || 0,
              new_user_points: newUserTotal,
            },
          });
      }
    }

    // Add fraud score if provided
    if (fraud_score !== undefined) {
      updateData.fraud_score = fraud_score;
    }

    // Update submission
    const { error: updateError } = await supabaseAdmin
      .from('submissions')
      .update(updateData)
      .eq('id', submissionId);

    if (updateError) {
      throw new Error('Failed to update submission');
    }

    // Log admin action
    await supabaseAdmin
      .from('admin_audit_log')
      .insert({
        admin_id: req.user!.id,
        action: 'submission_review',
        target_submission_id: submissionId,
        details: {
          status,
          reason,
          points_adjustment: points_adjustment,
          fraud_score: fraud_score,
          original_status: submission.status,
        },
        timestamp: now.toISOString(),
      });

    logger.info('✅ Admin submission review completed successfully', {
      adminId: req.user!.id,
      submissionId,
      status,
    });

    res.json({
      success: true,
      message: 'Submission reviewed successfully',
      data: {
        status,
        reason,
        points_adjustment,
        fraud_score,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Admin submission review validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid review data',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Admin submission review error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/admin/points/adjust - Adjust user points
router.post('/points/adjust', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validatedData = pointAdjustmentSchema.parse(req.body);
    const { user_id, points_change, reason, category = 'manual' } = validatedData;

    logger.info('💰 Admin point adjustment requested', {
      adminId: req.user!.id,
      targetUserId: user_id,
      pointsChange: points_change,
      reason,
      category,
    });

    // Get current user points
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('total_points')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString(),
      });
    }

    const newTotal = Math.max(0, (user.total_points || 0) + points_change);

    // Update user points
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ total_points: newTotal })
      .eq('id', user_id);

    if (updateError) {
      throw new Error('Failed to update user points');
    }

    // Log point adjustment
    await supabaseAdmin
      .from('points_history')
      .insert({
        user_id,
        points_change,
        reason,
        metadata: {
          admin_id: req.user!.id,
          category,
          original_points: user.total_points || 0,
          new_points: newTotal,
        },
      });

    // Log admin action
    await supabaseAdmin
      .from('admin_audit_log')
      .insert({
        admin_id: req.user!.id,
        action: 'point_adjustment',
        target_user_id: user_id,
        details: {
          points_change,
          reason,
          category,
          original_points: user.total_points || 0,
          new_points: newTotal,
        },
        timestamp: new Date().toISOString(),
      });

    logger.info('✅ Admin point adjustment completed successfully', {
      adminId: req.user!.id,
      targetUserId: user_id,
      pointsChange: points_change,
      newTotal,
    });

    res.json({
      success: true,
      message: 'Points adjusted successfully',
      data: {
        points_change,
        original_points: user.total_points || 0,
        new_points: newTotal,
        reason,
        category,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Admin point adjustment validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid adjustment data',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Admin point adjustment error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/admin/analytics - Get platform analytics
router.get('/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { start_date, end_date, skill_category, user_id, limit = 30 } = req.query;

    logger.info('📈 Admin analytics requested', {
      adminId: req.user!.id,
      start_date,
      end_date,
      skill_category,
      user_id,
      limit,
    });

    // Get user registration analytics
    const { data: userRegistrations } = await supabaseAdmin
      .from('users')
      .select('created_at, primary_skill')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit as string));

    // Get submission analytics
    const { data: submissions } = await supabaseAdmin
      .from('submissions')
      .select('status, points_awarded, submitted_at, fraud_score')
      .order('submitted_at', { ascending: false })
      .limit(parseInt(limit as string));

    // Calculate analytics
    const totalUsers = userRegistrations?.length || 0;
    const totalSubmissions = submissions?.length || 0;
    const approvedSubmissions = submissions?.filter(s => s.status === 'approved').length || 0;
    const totalPoints = submissions?.reduce((sum, s) => sum + (s.points_awarded || 0), 0) || 0;
    const averageFraudScore = submissions?.length > 0 
      ? submissions.reduce((sum, s) => sum + (s.fraud_score || 0), 0) / submissions.length 
      : 0;

    // Group by skill category
    const skillStats = userRegistrations?.reduce((acc, user) => {
      const skill = user.primary_skill;
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    logger.info('✅ Admin analytics fetched successfully', {
      adminId: req.user!.id,
      totalUsers,
      totalSubmissions,
      approvedSubmissions,
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalSubmissions,
          approvedSubmissions,
          approvalRate: totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions) * 100 : 0,
          totalPoints,
          averageFraudScore: Math.round(averageFraudScore * 100) / 100,
        },
        skillDistribution: skillStats,
        recentActivity: {
          userRegistrations: userRegistrations || [],
          submissions: submissions || [],
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Admin analytics error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/admin/audit-log - Get admin audit log
router.get('/audit-log', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, admin_id, action } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    logger.info('📋 Admin audit log requested', {
      adminId: req.user!.id,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      filterAdminId: admin_id,
      filterAction: action,
    });

    let query = supabaseAdmin
      .from('admin_audit_log')
      .select(`
        id, action, details, timestamp,
        admins!inner(email),
        users!inner(email)
      `)
      .order('timestamp', { ascending: false });

    // Apply filters
    if (admin_id) {
      query = query.eq('admin_id', admin_id);
    }

    if (action) {
      query = query.eq('action', action);
    }

    // Apply pagination
    query = query.range(offset, offset + parseInt(limit as string) - 1);

    const { data: auditLog, error: auditError, count } = await query;

    if (auditError) {
      logger.error('❌ Failed to fetch audit log:', { error: auditError.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch audit log',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Admin audit log fetched successfully', {
      adminId: req.user!.id,
      logCount: auditLog?.length || 0,
      totalCount: count || 0,
    });

    res.json({
      success: true,
      data: {
        auditLog: auditLog || [],
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: count || 0,
          totalPages: Math.ceil((count || 0) / parseInt(limit as string)),
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Admin audit log error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
