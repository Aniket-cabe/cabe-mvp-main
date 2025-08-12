import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import logger from '../utils/logger';

// CSRF token storage (in production, use Redis)
const csrfTokens = new Map<string, { token: string; expires: number }>();

// CSRF configuration
const CSRF_CONFIG = {
  TOKEN_LENGTH: 32,
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  HEADER_NAME: 'X-CSRF-Token',
  COOKIE_NAME: 'csrf-token',
  SECURE_COOKIES: process.env.NODE_ENV === 'production',
};

/**
 * Generate a new CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_CONFIG.TOKEN_LENGTH).toString('hex');
}

/**
 * Store CSRF token with expiration
 */
export function storeCSRFToken(sessionId: string, token: string): void {
  const expires = Date.now() + CSRF_CONFIG.TOKEN_EXPIRY;
  csrfTokens.set(sessionId, { token, expires });
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  if (!stored) {
    return false;
  }

  // Check if token has expired
  if (Date.now() > stored.expires) {
    csrfTokens.delete(sessionId);
    return false;
  }

  // Compare tokens
  return stored.token === token;
}

/**
 * Clean up expired CSRF tokens
 */
export function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (now > data.expires) {
      csrfTokens.delete(sessionId);
    }
  }
}

// Clean up expired tokens every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

/**
 * CSRF token generation middleware
 */
export const generateCSRFTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Generate session ID if not exists
    const sessionId = req.session?.id || req.ip || 'anonymous';
    
    // Generate new CSRF token
    const token = generateCSRFToken();
    
    // Store token
    storeCSRFToken(sessionId, token);
    
    // Set token in cookie
    res.cookie(CSRF_CONFIG.COOKIE_NAME, token, {
      httpOnly: true,
      secure: CSRF_CONFIG.SECURE_COOKIES,
      sameSite: 'strict',
      maxAge: CSRF_CONFIG.TOKEN_EXPIRY,
    });
    
    // Add token to response headers for AJAX requests
    res.set(CSRF_CONFIG.HEADER_NAME, token);
    
    // Add token to response body for form-based requests
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      res.locals.csrfToken = token;
    }
    
    next();
  } catch (error) {
    logger.error('CSRF token generation failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId: req.session?.id || req.ip,
    });
    next();
  }
};

/**
 * CSRF token validation middleware
 */
export const validateCSRFTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip CSRF validation for GET requests
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  try {
    const sessionId = req.session?.id || req.ip || 'anonymous';
    
    // Get token from header, cookie, or body
    const token = 
      req.headers[CSRF_CONFIG.HEADER_NAME.toLowerCase()] as string ||
      req.cookies?.[CSRF_CONFIG.COOKIE_NAME] ||
      req.body?._csrf;
    
    if (!token) {
      logger.warn('CSRF token missing', {
        method: req.method,
        path: req.path,
        sessionId,
        ip: req.ip,
      });
      return res.status(403).json({
        success: false,
        error: 'CSRF token missing',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Validate token
    if (!validateCSRFToken(sessionId, token)) {
      logger.warn('CSRF token validation failed', {
        method: req.method,
        path: req.path,
        sessionId,
        ip: req.ip,
        providedToken: token.substring(0, 8) + '...',
      });
      return res.status(403).json({
        success: false,
        error: 'CSRF token validation failed',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Token is valid, proceed
    next();
  } catch (error) {
    logger.error('CSRF validation error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method,
      path: req.path,
      sessionId: req.session?.id || req.ip,
    });
    return res.status(500).json({
      success: false,
      error: 'CSRF validation error',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * CSRF token refresh middleware (for long-running sessions)
 */
export const refreshCSRFTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.session?.id || req.ip || 'anonymous';
    const currentToken = req.cookies?.[CSRF_CONFIG.COOKIE_NAME];
    
    // If token exists and is valid, refresh it
    if (currentToken && validateCSRFToken(sessionId, currentToken)) {
      const newToken = generateCSRFToken();
      storeCSRFToken(sessionId, newToken);
      
      // Update cookie
      res.cookie(CSRF_CONFIG.COOKIE_NAME, newToken, {
        httpOnly: true,
        secure: CSRF_CONFIG.SECURE_COOKIES,
        sameSite: 'strict',
        maxAge: CSRF_CONFIG.TOKEN_EXPIRY,
      });
      
      // Update header
      res.set(CSRF_CONFIG.HEADER_NAME, newToken);
    }
    
    next();
  } catch (error) {
    logger.error('CSRF token refresh failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId: req.session?.id || req.ip,
    });
    next();
  }
};

/**
 * CSRF token cleanup middleware
 */
export const cleanupCSRFTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.session?.id || req.ip || 'anonymous';
    
    // Clean up token on logout or session end
    if (req.path === '/api/auth/logout' || req.method === 'DELETE') {
      csrfTokens.delete(sessionId);
      
      // Clear cookie
      res.clearCookie(CSRF_CONFIG.COOKIE_NAME);
    }
    
    next();
  } catch (error) {
    logger.error('CSRF token cleanup failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId: req.session?.id || req.ip,
    });
    next();
  }
};

/**
 * CSRF configuration for different environments
 */
export const csrfConfig = {
  ...CSRF_CONFIG,
  // Environment-specific overrides
  SECURE_COOKIES: process.env.NODE_ENV === 'production',
  SAME_SITE: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  DOMAIN: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : undefined,
};

export default {
  generateCSRFTokenMiddleware,
  validateCSRFTokenMiddleware,
  refreshCSRFTokenMiddleware,
  cleanupCSRFTokenMiddleware,
  generateCSRFToken,
  validateCSRFToken,
  csrfConfig,
};
