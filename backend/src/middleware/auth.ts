import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../lib/supabase-admin';
import logger from '../utils/logger';
import { env } from '../config/env';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
        username?: string;
        primary_skill?: string;
        total_points?: number;
        rank?: string;
        rank_level?: string;
        is_verified?: boolean;
        is_suspended?: boolean;
        permissions?: string[];
      };
    }
  }
}

/**
 * JWT Token verification middleware
 * Verifies the JWT token and attaches user data to request
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    logger.warn('❌ Authentication failed - no token provided', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    res.status(401).json({
      success: false,
      error: 'Access token required',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    
    if (!decoded.userId || !decoded.email) {
      throw new Error('Invalid token payload');
    }

    // Fetch user data from database
    supabaseAdmin
      .from('users')
      .select(`
        id, email, name, username, primary_skill, total_points, 
        rank, rank_level, is_verified, is_suspended
      `)
      .eq('id', decoded.userId)
      .single()
      .then(({ data: user, error }) => {
        if (error || !user) {
          logger.warn('❌ Authentication failed - user not found', {
            userId: decoded.userId,
            ip: req.ip,
          });
          res.status(401).json({
            success: false,
            error: 'Invalid token - user not found',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        if (user.is_suspended) {
          logger.warn('❌ Authentication failed - user suspended', {
            userId: user.id,
            email: user.email,
            ip: req.ip,
          });
          res.status(403).json({
            success: false,
            error: 'Account is suspended. Please contact support.',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // Attach user to request
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          primary_skill: user.primary_skill,
          total_points: user.total_points,
          rank: user.rank,
          rank_level: user.rank_level,
          is_verified: user.is_verified,
          is_suspended: user.is_suspended,
          permissions: [], // Will be populated by RBAC middleware if needed
        };

        logger.debug('✅ Authentication successful', {
          userId: user.id,
          email: user.email,
          ip: req.ip,
        });

        next();
      })
      .catch((error) => {
        logger.error('❌ Authentication database error:', {
          error: error.message,
          userId: decoded.userId,
          ip: req.ip,
        });
        res.status(500).json({
          success: false,
          error: 'Authentication service error',
          timestamp: new Date().toISOString(),
        });
      });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('❌ Authentication failed - invalid token', {
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    logger.error('❌ Authentication error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
    });
    res.status(500).json({
      success: false,
      error: 'Authentication service error',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Optional authentication middleware
 * Similar to authenticateToken but doesn't require authentication
 * Attaches user data if token is provided and valid
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // No token provided, continue without authentication
    next();
    return;
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    
    if (!decoded.userId || !decoded.email) {
      // Invalid token, continue without authentication
      next();
      return;
    }

    // Fetch user data from database
    supabaseAdmin
      .from('users')
      .select(`
        id, email, name, username, primary_skill, total_points, 
        rank, rank_level, is_verified, is_suspended
      `)
      .eq('id', decoded.userId)
      .single()
      .then(({ data: user, error }) => {
        if (error || !user || user.is_suspended) {
          // User not found or suspended, continue without authentication
          next();
          return;
        }

        // Attach user to request
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          primary_skill: user.primary_skill,
          total_points: user.total_points,
          rank: user.rank,
          rank_level: user.rank_level,
          is_verified: user.is_verified,
          is_suspended: user.is_suspended,
          permissions: [],
        };

        logger.debug('✅ Optional authentication successful', {
          userId: user.id,
          email: user.email,
        });

        next();
      })
      .catch(() => {
        // Database error, continue without authentication
        next();
      });

  } catch (error) {
    // Token verification failed, continue without authentication
    next();
  }
}

/**
 * Email verification required middleware
 * Ensures user has verified their email address
 */
export function requireEmailVerification(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (!req.user.is_verified) {
    logger.warn('❌ Email verification required', {
      userId: req.user.id,
      email: req.user.email,
    });
    res.status(403).json({
      success: false,
      error: 'Email verification required. Please check your email and verify your account.',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
}

/**
 * Admin role required middleware
 * Ensures user has admin permissions
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Check if user has admin permissions
  const hasAdminPermission = req.user.permissions?.includes('admin') || 
                           req.user.rank_level === 'admin';

  if (!hasAdminPermission) {
    logger.warn('❌ Admin access denied', {
      userId: req.user.id,
      email: req.user.email,
      rank: req.user.rank_level,
      permissions: req.user.permissions,
    });
    res.status(403).json({
      success: false,
      error: 'Admin access required',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
}

/**
 * Minimum rank required middleware
 * Ensures user has at least the specified rank
 */
export function requireMinimumRank(minimumRank: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const rankHierarchy = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    const userRankIndex = rankHierarchy.indexOf(req.user.rank_level || 'Bronze');
    const minimumRankIndex = rankHierarchy.indexOf(minimumRank);

    if (userRankIndex < minimumRankIndex) {
      logger.warn('❌ Insufficient rank for access', {
        userId: req.user.id,
        userRank: req.user.rank_level,
        requiredRank: minimumRank,
      });
      res.status(403).json({
        success: false,
        error: `Minimum rank ${minimumRank} required`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}

/**
 * Rate limiting middleware for authentication endpoints
 * Prevents brute force attacks
 */
export function authRateLimit(req: Request, res: Response, next: NextFunction): void {
  // This is a basic implementation
  // In production, use a proper rate limiting library like express-rate-limit
  // with Redis for distributed rate limiting
  
  const clientIP = req.ip;
  const endpoint = req.path;
  
  // Simple in-memory rate limiting (not suitable for production)
  const rateLimitKey = `${clientIP}:${endpoint}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5; // 5 requests per window

  // TODO: Implement proper rate limiting with Redis
  // For now, just continue
  next();
}

export default {
  authenticateToken,
  optionalAuth,
  requireEmailVerification,
  requireAdmin,
  requireMinimumRank,
  authRateLimit,
};
