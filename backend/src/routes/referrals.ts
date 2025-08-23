import express, { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import { referralService } from '../services/referral.service';
import logger from '../utils/logger';

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const generateInviteCodeSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

const processReferralSchema = z.object({
  referrerId: z.string().uuid('Invalid referrer ID'),
  referredUserId: z.string().uuid('Invalid referred user ID'),
  inviteCode: z.string().min(1, 'Invite code is required'),
});

const utmShareSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('Invalid URL'),
  utmParams: z.record(z.string()),
});

const validateInviteCodeSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required'),
});

// ============================================================================
// REFERRAL ROUTES
// ============================================================================

// POST /api/referrals/generate-code - Generate invite code for user
router.post('/generate-code', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validatedData = generateInviteCodeSchema.parse(req.body);
    const { userId } = validatedData;

    // Verify user can access this data
    if (req.user!.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        timestamp: new Date().toISOString(),
      });
    }

    const inviteCode = await referralService.generateInviteCode(userId);
    const referralLink = referralService.generateReferralLink(inviteCode);

    res.json({
      success: true,
      inviteCode,
      referralLink,
      message: 'Invite code generated successfully',
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

    logger.error('❌ Failed to generate invite code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate invite code',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/referrals/process - Process referral when new user signs up
router.post('/process', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validatedData = processReferralSchema.parse(req.body);
    const { referrerId, referredUserId, inviteCode } = validatedData;

    const result = await referralService.processReferral(referrerId, referredUserId, inviteCode);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to process referral',
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      bonusAwarded: result.bonusAwarded,
      referralId: result.referralId,
      message: 'Referral processed successfully',
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

    logger.error('❌ Failed to process referral:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process referral',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/referrals/complete - Award completion bonus
router.post('/complete', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { referredUserId } = req.body;

    if (!referredUserId) {
      return res.status(400).json({
        success: false,
        error: 'Referred user ID is required',
        timestamp: new Date().toISOString(),
      });
    }

    const result = await referralService.awardCompletionBonus(referredUserId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'No pending referral found for this user',
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      bonusAwarded: result.bonusAwarded,
      message: 'Completion bonus awarded successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ Failed to award completion bonus:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to award completion bonus',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/referrals/utm-share - Record UTM-tracked share
router.post('/utm-share', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validatedData = utmShareSchema.parse(req.body);
    const { userId, platform, url, utmParams } = validatedData;

    // Verify user can access this data
    if (req.user!.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        timestamp: new Date().toISOString(),
      });
    }

    const result = await referralService.recordUTMShare(userId, platform, url, utmParams);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Daily UTM share limit reached',
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      bonusAwarded: result.bonusAwarded,
      shareId: result.shareId,
      message: 'UTM share recorded successfully',
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

    logger.error('❌ Failed to record UTM share:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record UTM share',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/referrals/stats/:userId - Get user's referral statistics
router.get('/stats/:userId', authenticateToken, async (req: Request, res: Response) => {
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

    const stats = await referralService.getUserReferralStats(userId);

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ Failed to get referral stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get referral stats',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/referrals/list/:userId - Get user's referral list
router.get('/list/:userId', authenticateToken, async (req: Request, res: Response) => {
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

    const referrals = await referralService.getUserReferrals(userId);

    res.json({
      success: true,
      referrals,
      count: referrals.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ Failed to get referral list:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get referral list',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/referrals/utm-shares/:userId - Get user's UTM shares
router.get('/utm-shares/:userId', authenticateToken, async (req: Request, res: Response) => {
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

    const shares = await referralService.getUserUTMShares(userId);

    res.json({
      success: true,
      shares,
      count: shares.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ Failed to get UTM shares:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get UTM shares',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/referrals/validate-code - Validate invite code
router.post('/validate-code', async (req: Request, res: Response) => {
  try {
    const validatedData = validateInviteCodeSchema.parse(req.body);
    const { inviteCode } = validatedData;

    const result = await referralService.validateInviteCode(inviteCode);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid invite code',
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      valid: true,
      referrerId: result.referrerId,
      referrerName: result.referrerName,
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

    logger.error('❌ Failed to validate invite code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate invite code',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/referrals/global-stats - Get global referral statistics
router.get('/global-stats', async (req: Request, res: Response) => {
  try {
    const stats = await referralService.getGlobalReferralStats();

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ Failed to get global referral stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get global referral stats',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/referrals/track-click/:shareId - Track UTM share click
router.post('/track-click/:shareId', async (req: Request, res: Response) => {
  try {
    const { shareId } = req.params;

    await referralService.trackUTMShareClick(shareId);

    res.json({
      success: true,
      message: 'Click tracked successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ Failed to track UTM share click:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track click',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/referrals/track-conversion/:shareId - Track UTM share conversion
router.post('/track-conversion/:shareId', async (req: Request, res: Response) => {
  try {
    const { shareId } = req.params;

    await referralService.trackUTMShareConversion(shareId);

    res.json({
      success: true,
      message: 'Conversion tracked successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ Failed to track UTM share conversion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track conversion',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/referrals/platforms - Get supported sharing platforms
router.get('/platforms', async (req: Request, res: Response) => {
  try {
    const platforms = [
      {
        id: 'twitter',
        name: 'Twitter',
        icon: '🐦',
        description: 'Share on Twitter/X',
        color: '#1DA1F2',
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: '💼',
        description: 'Share on LinkedIn',
        color: '#0077B5',
      },
      {
        id: 'facebook',
        name: 'Facebook',
        icon: '📘',
        description: 'Share on Facebook',
        color: '#1877F2',
      },
      {
        id: 'whatsapp',
        name: 'WhatsApp',
        icon: '💬',
        description: 'Share on WhatsApp',
        color: '#25D366',
      },
      {
        id: 'telegram',
        name: 'Telegram',
        icon: '📱',
        description: 'Share on Telegram',
        color: '#0088CC',
      },
      {
        id: 'email',
        name: 'Email',
        icon: '📧',
        description: 'Share via Email',
        color: '#EA4335',
      },
      {
        id: 'copy',
        name: 'Copy Link',
        icon: '📋',
        description: 'Copy referral link',
        color: '#6C757D',
      },
    ];

    res.json({
      success: true,
      platforms,
      count: platforms.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ Failed to get platforms:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get platforms',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/referrals/config - Get referral configuration
router.get('/config', async (req: Request, res: Response) => {
  try {
    const config = {
      inviteCodeLength: 8,
      bonusPointsReferrer: 200,
      bonusPointsReferred: 100,
      bonusPointsCompletion: 100,
      maxReferralBonusPerMonth: 1000,
      utmShareBonus: 10,
      maxUtmSharesPerDay: 5,
      supportedPlatforms: [
        'twitter', 'linkedin', 'facebook', 'whatsapp', 'telegram', 'email', 'copy'
      ],
    };

    res.json({
      success: true,
      config,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ Failed to get referral config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get referral config',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
