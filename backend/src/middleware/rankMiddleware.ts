import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase-admin';
import logger from '../utils/logger';

// Extend Express Request interface to include user rank
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        rankLevel: string;
        points: number;
        email?: string;
      };
    }
  }
}

// CaBE v5 Rank Tiers
export const RANK_TIERS = {
  BRONZE: { min: 0, max: 999, name: 'Bronze' },
  SILVER: { min: 1000, max: 4999, name: 'Silver' },
  GOLD: { min: 5000, max: 9999, name: 'Gold' },
  PLATINUM: { min: 10000, max: Infinity, name: 'Platinum' },
} as const;

export type RankLevel = (typeof RANK_TIERS)[keyof typeof RANK_TIERS]['name'];

/**
 * Calculate rank level based on points using CaBE v5 tier system
 * @param points - User's total points
 * @returns Rank level (Bronze, Silver, Gold, Platinum)
 */
export function calculateRankLevel(points: number): RankLevel {
  if (points >= RANK_TIERS.PLATINUM.min) return RANK_TIERS.PLATINUM.name;
  if (points >= RANK_TIERS.GOLD.min) return RANK_TIERS.GOLD.name;
  if (points >= RANK_TIERS.SILVER.min) return RANK_TIERS.SILVER.name;
  return RANK_TIERS.BRONZE.name;
}

/**
 * Get rank tier information for a given rank level
 * @param rankLevel - The rank level to get tier info for
 * @returns Rank tier information or null if not found
 */
export function getRankTierInfo(rankLevel: RankLevel) {
  const tier = Object.values(RANK_TIERS).find(
    (tier) => tier.name === rankLevel
  );
  return tier || null;
}

/**
 * Get next rank information for a user
 * @param currentPoints - User's current points
 * @returns Information about the next rank tier
 */
export function getNextRankInfo(currentPoints: number) {
  const currentRank = calculateRankLevel(currentPoints);
  const currentTier = getRankTierInfo(currentRank);

  if (!currentTier) return null;

  // Find the next tier
  const tiers = Object.values(RANK_TIERS);
  const currentIndex = tiers.findIndex((tier) => tier.name === currentRank);
  const nextTier = tiers[currentIndex + 1];

  if (!nextTier) return null; // Already at highest rank

  const pointsToNext = nextTier.min - currentPoints;

  return {
    currentRank,
    nextRank: nextTier.name,
    pointsToNext,
    currentPoints,
    nextRankMinPoints: nextTier.min,
  };
}

/**
 * Middleware to attach user rank level to request
 * Fetches user points from database and calculates rank level
 */
export const attachUserRank = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // TODO: In production, extract user_id from JWT token/session
    // For now, we'll get it from headers or query params
    const user_id =
      (req.headers['x-user-id'] as string) || (req.query.user_id as string);

    if (!user_id) {
      logger.warn('❌ No user_id provided for rank middleware');
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('🔍 Fetching user rank for middleware', { user_id });

    // Fetch user data from database
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, points')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      logger.error('❌ User not found for rank middleware:', {
        user_id,
        error: userError?.message,
      });
      return res.status(401).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Calculate rank level based on points
    const points = userData.points || 0;
    const rankLevel = calculateRankLevel(points);

    // Get next rank information
    const nextRankInfo = getNextRankInfo(points);

    // Attach user data to request
    req.user = {
      id: userData.id,
      email: userData.email,
      points,
      rankLevel,
    };

    logger.info('✅ User rank attached to request:', {
      user_id: userData.id,
      email: userData.email,
      points,
      rankLevel,
      nextRank: nextRankInfo?.nextRank || 'Max Rank',
      pointsToNext: nextRankInfo?.pointsToNext || 0,
    });

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('❌ Rank middleware error:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to process user rank',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Middleware to require minimum rank level
 * @param requiredRank - Minimum rank level required
 * @returns Middleware function
 */
export const requireRank = (requiredRank: RankLevel) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      logger.warn('❌ User not authenticated for rank requirement');
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
    }

    const userRank = req.user.rankLevel;
    const rankHierarchy = ['Bronze', 'Silver', 'Gold', 'Platinum'];

    const userRankIndex = rankHierarchy.indexOf(userRank);
    const requiredRankIndex = rankHierarchy.indexOf(requiredRank);

    if (userRankIndex < requiredRankIndex) {
      logger.warn('❌ Insufficient rank level for route:', {
        user_id: req.user.id,
        userRank,
        requiredRank,
        userPoints: req.user.points,
      });

      return res.status(403).json({
        success: false,
        error: `Insufficient rank level. Required: ${requiredRank}, Current: ${userRank}`,
        currentRank: userRank,
        requiredRank,
        userPoints: req.user.points,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Rank requirement satisfied:', {
      user_id: req.user.id,
      userRank,
      requiredRank,
    });

    next();
  };
};

/**
 * Middleware to log rank information for debugging
 */
export const logRankInfo = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user) {
    logger.info('📊 Request rank info:', {
      user_id: req.user.id,
      email: req.user.email,
      rankLevel: req.user.rankLevel,
      points: req.user.points,
      path: req.path,
      method: req.method,
    });
  }
  next();
};

export default {
  attachUserRank,
  requireRank,
  logRankInfo,
  calculateRankLevel,
  getRankTierInfo,
  getNextRankInfo,
  RANK_TIERS,
};
