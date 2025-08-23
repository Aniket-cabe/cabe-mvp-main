import express, { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import { achievementService } from '../services/achievement.service';
import logger from '../utils/logger';

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const checkAchievementsSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

// ============================================================================
// ACHIEVEMENT ROUTES
// ============================================================================

// GET /api/achievements - Get all achievements
router.get('/', async (req: Request, res: Response) => {
  try {
    const achievements = await achievementService.getAllAchievements();

    res.json({
      success: true,
      achievements,
      count: achievements.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ Failed to get achievements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get achievements',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/achievements/user/:userId - Get user's achievements
router.get('/user/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Verify user can access this data
    if (req.user!.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        timestamp: new Date().toISOString(),
      });
    }

    const userAchievements = await achievementService.getUserAchievements(userId);
    const achievementProgress = await achievementService.getAchievementProgress(userId);

    res.json({
      success: true,
      userAchievements,
      achievementProgress,
      completedCount: userAchievements.length,
      totalCount: achievementProgress.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ Failed to get user achievements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user achievements',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/achievements/check - Check and award achievements for user
router.post('/check', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validatedData = checkAchievementsSchema.parse(req.body);
    const { userId } = validatedData;

    // Verify user can access this data
    if (req.user!.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        timestamp: new Date().toISOString(),
      });
    }

    const result = await achievementService.checkUserAchievements(userId);

    res.json({
      success: true,
      newAchievements: result.newAchievements,
      totalPointsAwarded: result.totalPointsAwarded,
      achievementCount: result.newAchievements.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Failed to check achievements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check achievements',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/achievements/progress/:userId - Get achievement progress for user
router.get('/progress/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Verify user can access this data
    if (req.user!.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        timestamp: new Date().toISOString(),
      });
    }

    const progress = await achievementService.getAchievementProgress(userId);

    // Group by category
    const progressByCategory = progress.reduce((acc, item) => {
      const category = item.achievement.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, typeof progress>);

    // Calculate summary stats
    const completedCount = progress.filter(p => p.is_completed).length;
    const totalCount = progress.length;
    const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    res.json({
      success: true,
      progress,
      progressByCategory,
      summary: {
        completedCount,
        totalCount,
        completionRate,
        categories: Object.keys(progressByCategory),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ Failed to get achievement progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get achievement progress',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/achievements/stats - Get achievement statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await achievementService.getAchievementStats();

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ Failed to get achievement stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get achievement stats',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/achievements/initialize - Initialize achievements (admin only)
router.post('/initialize', authenticateToken, async (req: Request, res: Response) => {
  try {
    // TODO: Add admin check middleware
    // For now, allow any authenticated user to initialize

    await achievementService.initializeAchievements();

    res.json({
      success: true,
      message: 'Achievements initialized successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ Failed to initialize achievements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize achievements',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/achievements/categories - Get achievement categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = [
      {
        id: 'task_completion',
        name: 'Task Completion',
        description: 'Achievements for completing tasks',
        icon: '🎯',
      },
      {
        id: 'points_earned',
        name: 'Points Earned',
        description: 'Achievements for earning points',
        icon: '💰',
      },
      {
        id: 'skill_mastery',
        name: 'Skill Mastery',
        description: 'Achievements for mastering different skills',
        icon: '🎨',
      },
      {
        id: 'consistency',
        name: 'Consistency',
        description: 'Achievements for consistent activity',
        icon: '🔥',
      },
      {
        id: 'social',
        name: 'Social',
        description: 'Social and community achievements',
        icon: '👥',
      },
      {
        id: 'rank_progression',
        name: 'Rank Progression',
        description: 'Achievements for ranking up',
        icon: '🏆',
      },
    ];

    res.json({
      success: true,
      categories,
      count: categories.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ Failed to get achievement categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get achievement categories',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/achievements/recent/:userId - Get recently earned achievements
router.get('/recent/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 5 } = req.query;

    // Verify user can access this data
    if (req.user!.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        timestamp: new Date().toISOString(),
      });
    }

    const userAchievements = await achievementService.getUserAchievements(userId);
    
    // Sort by earned date and limit
    const recentAchievements = userAchievements
      .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
      .slice(0, parseInt(limit as string));

    res.json({
      success: true,
      recentAchievements,
      count: recentAchievements.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ Failed to get recent achievements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recent achievements',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
