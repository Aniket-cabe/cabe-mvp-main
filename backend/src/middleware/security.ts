import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import { z } from 'zod';
import helmet from 'helmet';
import hpp from 'hpp';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import logger from '../utils/logger';
import { security } from '../config/env';
import jwt from 'jsonwebtoken';

// Enhanced rate limiter configuration
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => {
    // Use IP address as key, or user ID if authenticated
    return (
      (req.headers['x-forwarded-for'] as string) ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'unknown'
    );
  },
  points: security.rateLimitMaxRequests,
  duration: security.rateLimitWindowMs / 1000, // Convert to seconds
  blockDuration: 60 * 15, // Block for 15 minutes
});

// Express rate limiter middleware with enhanced protection
export const rateLimitMiddleware = rateLimit({
  windowMs: security.rateLimitWindowMs,
  max: security.rateLimitMaxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(security.rateLimitWindowMs / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil(security.rateLimitWindowMs / 1000),
      timestamp: new Date().toISOString(),
    });
  },
});

// Slow down middleware for brute force protection
export const slowDownMiddleware = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // Allow 100 requests per 15 minutes
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
});

// Flexible rate limiter middleware
export const flexibleRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await rateLimiter.consume(req.ip || 'unknown');
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      retryAfter: secs,
      timestamp: new Date().toISOString(),
    });
  }
};

// Enhanced input validation middleware with sanitization
export const validateInput = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize input before validation
      const sanitizedBody = sanitizeInput(req.body);
      const sanitizedQuery = sanitizeInput(req.query);
      const sanitizedParams = sanitizeInput(req.params);

      const validatedData = schema.parse({
        body: sanitizedBody,
        query: sanitizedQuery,
        params: sanitizedParams,
      });

      // Attach validated data to request
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Input validation failed', {
          path: req.path,
          errors: error.errors,
          ip: req.ip,
        });

        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
          timestamp: new Date().toISOString(),
        });
      }

      next(error);
    }
  };
};

// Input sanitization function
function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
}

// Enhanced request logging middleware
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  req.startTime = start;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel]('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentLength: res.get('Content-Length'),
      referer: req.get('Referer'),
    });
  });

  next();
};

// Enhanced error handling middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    query: req.query,
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(500).json({
    success: false,
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
};

// Enhanced security headers middleware
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.openai.com https://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      'upgrade-insecure-requests',
    ].join('; ')
  );

  next();
};

// Enhanced CORS configuration
export const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Get CORS origin from environment or use default allowed origins
    const corsOrigin = process.env.CORS_ORIGIN;
    
    if (corsOrigin && corsOrigin !== '*') {
      // Use specific CORS origin from environment
      if (origin === corsOrigin) {
        callback(null, true);
      } else {
        logger.warn('CORS blocked request', { origin, allowed: corsOrigin });
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // Fallback to default allowed origins
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:4173',
        'https://cabe-arena.com',
        'https://www.cabe-arena.com',
        'https://staging.cabe-arena.com',
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn('CORS blocked request', { origin, ip: origin });
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
};

// Request size limits
export const requestSizeLimit = {
  limit: '10mb',
  extended: true,
  parameterLimit: 1000,
  arrayLimit: 100,
};

// File upload limits with enhanced security
export const fileUploadLimits = {
  fileSize: 5 * 1024 * 1024, // 5MB
  files: 1,
  fields: 10,
  fieldNameSize: 50,
  fieldSize: 1024 * 1024, // 1MB
};

// Enhanced authentication middleware with JWT verification
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const decoded = jwt.verify(token, security.jwtSecret) as any;
    const userId = decoded.userId || decoded.sub || decoded.id;
    if (!userId) {
      throw new Error('Invalid token payload');
    }
    req.user = {
      id: String(userId),
      email: String(decoded.email || ''),
      rank: String(decoded.rank || 'bronze'),
      permissions: Array.isArray(decoded.permissions)
        ? decoded.permissions
        : [],
    };
    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token',
      timestamp: new Date().toISOString(),
    });
  }
};

// Enhanced role-based access control middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
    }

    if (!allowedRoles.includes(req.user.rank)) {
      logger.warn('Insufficient permissions', {
        user: req.user.id,
        requiredRoles: allowedRoles,
        userRole: req.user.rank,
        path: req.path,
      });

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

// Permission-based access control
export const requirePermission = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      req.user!.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      logger.warn('Insufficient permissions', {
        user: req.user.id,
        requiredPermissions,
        userPermissions: req.user.permissions,
        path: req.path,
      });

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

// SQL injection protection middleware
export const sqlInjectionProtection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\b\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i,
  ];

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return sqlPatterns.some((pattern) => pattern.test(value));
    }
    if (Array.isArray(value)) {
      return value.some(checkValue);
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  if (checkValue(req.body) || checkValue(req.query) || checkValue(req.params)) {
    logger.warn('SQL injection attempt detected', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
    });

    return res.status(400).json({
      success: false,
      error: 'Invalid input detected',
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// XSS protection middleware
export const xssProtection = xss();

// Parameter pollution protection
export const hppProtection = hpp();

// NoSQL injection protection
export const mongoSanitizeProtection = mongoSanitize();

// Helmet configuration for comprehensive security
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://cdn.jsdelivr.net',
      ],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https://api.openai.com', 'https://*.supabase.co'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
});
