import express from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../../lib/supabase-admin';
import { authenticateToken, requireEmailVerification } from '../../middleware/auth';
import logger from '../../utils/logger';

const router = express.Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(100, 'Username too long').optional(),
  avatar_url: z.string().url('Invalid avatar URL').optional(),
  primary_skill: z.enum(['Full-Stack Software Development', 'Cloud Computing & DevOps', 'Data Science & Analytics', 'AI / Machine Learning']).optional(),
  secondary_skills: z.array(z.enum(['Full-Stack Software Development', 'Cloud Computing & DevOps', 'Data Science & Analytics', 'AI / Machine Learning'])).max(3, 'Maximum 3 secondary skills').optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
});

const skillUpdateSchema = z.object({
  primary_skill: z.enum(['Full-Stack Software Development', 'Cloud Computing & DevOps', 'Data Science & Analytics', 'AI / Machine Learning']),
  secondary_skills: z.array(z.enum(['Full-Stack Software Development', 'Cloud Computing & DevOps', 'Data Science & Analytics', 'AI / Machine Learning'])).max(3, 'Maximum 3 secondary skills'),
});

// ============================================================================
// USER MANAGEMENT ROUTES
// ============================================================================

// GET /api/v1/user/profile - Get user profile
router.get('/profile', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    logger.info('👤 User profile requested', { userId: req.user!.id });

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select(`
        id, email, name, username, avatar_url, primary_skill, secondary_skills,
        total_points, rank, rank_level, cabot_credits, is_verified,
        created_at, last_activity, email_verified_at, profile_completed_at
      `)
      .eq('id', req.user!.id)
      .single();

    if (error || !user) {
      logger.error('❌ User not found', { userId: req.user!.id, error: error?.message });
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ User profile fetched successfully', { userId: req.user!.id });

    res.json({
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ User profile error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// PUT /api/v1/user/profile - Update user profile
router.put('/profile', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    const validatedData = profileUpdateSchema.parse(req.body);

    logger.info('🔄 User profile update requested', {
      userId: req.user!.id,
      updates: Object.keys(validatedData),
    });

    // Check if username is already taken (if being updated)
    if (validatedData.username) {
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', validatedData.username)
        .neq('id', req.user!.id)
        .single();

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Username already taken',
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Update user profile
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({
        ...validatedData,
        profile_completed_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
      })
      .eq('id', req.user!.id)
      .select()
      .single();

    if (error) {
      logger.error('❌ Profile update failed:', { error: error.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to update profile',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ User profile updated successfully', { userId: req.user!.id });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Profile update validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid profile data',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Profile update error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// PUT /api/v1/user/skills - Update user skills
router.put('/skills', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    const validatedData = skillUpdateSchema.parse(req.body);

    logger.info('🔄 User skills update requested', {
      userId: req.user!.id,
      primarySkill: validatedData.primary_skill,
      secondarySkills: validatedData.secondary_skills,
    });

    // Update user skills
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({
        primary_skill: validatedData.primary_skill,
        secondary_skills: validatedData.secondary_skills,
        last_activity: new Date().toISOString(),
      })
      .eq('id', req.user!.id)
      .select()
      .single();

    if (error) {
      logger.error('❌ Skills update failed:', { error: error.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to update skills',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ User skills updated successfully', { userId: req.user!.id });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Skills updated successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Skills update validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid skills data',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Skills update error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/v1/user/stats - Get user statistics
router.get('/stats', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    logger.info('📊 User stats requested', { userId: req.user!.id });

    // Get user data
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, total_points, rank, rank_level, created_at, last_activity')
      .eq('id', req.user!.id)
      .single();

    if (userError || !user) {
      logger.error('❌ User not found for stats', { userId: req.user!.id });
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Get submission statistics
    const { data: submissions, error: submissionsError } = await supabaseAdmin
      .from('submissions')
      .select('status, points_awarded, submitted_at')
      .eq('user_id', req.user!.id);

    if (submissionsError) {
      logger.error('❌ Failed to fetch submissions for stats:', { error: submissionsError.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch submission statistics',
        timestamp: new Date().toISOString(),
      });
    }

    // Get achievement statistics
    const { data: achievements, error: achievementsError } = await supabaseAdmin
      .from('user_achievements')
      .select('achievement_id, is_completed, earned_at')
      .eq('user_id', req.user!.id);

    if (achievementsError) {
      logger.error('❌ Failed to fetch achievements for stats:', { error: achievementsError.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch achievement statistics',
        timestamp: new Date().toISOString(),
      });
    }

    // Calculate statistics
    const totalSubmissions = submissions?.length || 0;
    const approvedSubmissions = submissions?.filter(s => s.status === 'approved').length || 0;
    const totalPointsEarned = submissions?.reduce((sum, s) => sum + (s.points_awarded || 0), 0) || 0;
    const completedAchievements = achievements?.filter(a => a.is_completed).length || 0;

    // Calculate rank progress
    const rankThresholds = {
      Bronze: 0,
      Silver: 1000,
      Gold: 5000,
      Platinum: 10000,
      Diamond: 25000,
    };

    const currentRank = user.rank_level || 'Bronze';
    const currentPoints = user.total_points || 0;
    const nextRank = Object.entries(rankThresholds).find(([rank, threshold]) => threshold > currentPoints)?.[0] || 'Diamond';
    const nextRankThreshold = rankThresholds[nextRank as keyof typeof rankThresholds] || 25000;
    const rankProgress = nextRankThreshold > 0 ? (currentPoints / nextRankThreshold) * 100 : 100;

    const stats = {
      user: {
        id: user.id,
        totalPoints: user.total_points || 0,
        rank: user.rank_level || 'Bronze',
        nextRank,
        rankProgress: Math.min(100, Math.max(0, rankProgress)),
        pointsToNextRank: Math.max(0, nextRankThreshold - currentPoints),
        memberSince: user.created_at,
        lastActivity: user.last_activity,
      },
      submissions: {
        total: totalSubmissions,
        approved: approvedSubmissions,
        pending: submissions?.filter(s => s.status === 'pending').length || 0,
        rejected: submissions?.filter(s => s.status === 'rejected').length || 0,
        approvalRate: totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions) * 100 : 0,
        totalPointsEarned,
      },
      achievements: {
        total: achievements?.length || 0,
        completed: completedAchievements,
        completionRate: achievements?.length > 0 ? (completedAchievements / achievements.length) * 100 : 0,
      },
      activity: {
        submissionsThisWeek: submissions?.filter(s => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(s.submitted_at) > weekAgo;
        }).length || 0,
        submissionsThisMonth: submissions?.filter(s => {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return new Date(s.submitted_at) > monthAgo;
        }).length || 0,
      },
    };

    logger.info('✅ User stats fetched successfully', { userId: req.user!.id });

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ User stats error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/v1/user/activity - Get user activity feed
router.get('/activity', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    logger.info('📝 User activity requested', {
      userId: req.user!.id,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    // Get recent submissions
    const { data: submissions, error: submissionsError } = await supabaseAdmin
      .from('submissions')
      .select(`
        id, status, points_awarded, submitted_at, reviewed_at,
        tasks!inner(title, skill_category)
      `)
      .eq('user_id', req.user!.id)
      .order('submitted_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (submissionsError) {
      logger.error('❌ Failed to fetch user activity:', { error: submissionsError.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch activity',
        timestamp: new Date().toISOString(),
      });
    }

    // Get recent achievements
    const { data: achievements, error: achievementsError } = await supabaseAdmin
      .from('user_achievements')
      .select(`
        id, earned_at, is_completed,
        achievements!inner(title, description, icon)
      `)
      .eq('user_id', req.user!.id)
      .eq('is_completed', true)
      .order('earned_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (achievementsError) {
      logger.error('❌ Failed to fetch user achievements:', { error: achievementsError.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch achievements',
        timestamp: new Date().toISOString(),
      });
    }

    // Combine and sort activities
    const activities = [
      ...(submissions?.map(s => ({
        type: 'submission',
        id: s.id,
        title: s.tasks.title,
        description: `Submitted ${s.tasks.skill_category} task`,
        status: s.status,
        points: s.points_awarded,
        timestamp: s.submitted_at,
        skillCategory: s.tasks.skill_category,
      })) || []),
      ...(achievements?.map(a => ({
        type: 'achievement',
        id: a.id,
        title: a.achievements.title,
        description: a.achievements.description,
        icon: a.achievements.icon,
        timestamp: a.earned_at,
      })) || []),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    logger.info('✅ User activity fetched successfully', {
      userId: req.user!.id,
      activityCount: activities.length,
    });

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: activities.length === parseInt(limit as string),
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ User activity error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/v1/user/skills - Get available skills
router.get('/skills', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    logger.info('🎯 Available skills requested', { userId: req.user!.id });

    const skills = [
      {
        id: 'Full-Stack Software Development',
        name: 'Full-Stack Software Development',
        description: 'Frontend, backend, and full-stack development',
        icon: '💻',
        categories: ['Frontend', 'Backend', 'Full-Stack'],
        difficulty: 'Beginner to Advanced',
      },
      {
        id: 'Cloud Computing & DevOps',
        name: 'Cloud Computing & DevOps',
        description: 'Cloud infrastructure, DevOps, and system administration',
        icon: '☁️',
        categories: ['Cloud Infrastructure', 'DevOps', 'System Administration'],
        difficulty: 'Intermediate to Advanced',
      },
      {
        id: 'Data Science & Analytics',
        name: 'Data Science & Analytics',
        description: 'Data analysis, visualization, and business intelligence',
        icon: '📊',
        categories: ['Data Analysis', 'Visualization', 'Business Intelligence'],
        difficulty: 'Intermediate to Advanced',
      },
      {
        id: 'AI / Machine Learning',
        name: 'AI / Machine Learning',
        description: 'Machine learning, AI development, and neural networks',
        icon: '🤖',
        categories: ['Machine Learning', 'AI Development', 'Neural Networks'],
        difficulty: 'Intermediate to Advanced',
      },
    ];

    logger.info('✅ Available skills fetched successfully', { userId: req.user!.id });

    res.json({
      success: true,
      data: skills,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Skills error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
