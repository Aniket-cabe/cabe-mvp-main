import express from 'express';
import bcryptjs, { hash, compare } from 'bcryptjs';
import jsonwebtoken, { verify, sign } from 'jsonwebtoken';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase-admin';
import logger from '../utils/logger';
import { env } from '../config/env';
import { rateLimitMiddleware } from '../middleware/security';

const router = express.Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters'),
  primary_skill: z.string().min(1, 'Primary skill is required'),
  secondary_skills: z.array(z.string()).optional(),
  referral_code: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const newPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate JWT token
 */
function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Generate referral code
 */
function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Send verification email (placeholder for now)
 */
async function sendVerificationEmail(email: string, token: string): Promise<void> {
  // TODO: Implement actual email sending
  logger.info('📧 Verification email would be sent', { email, token });
}

/**
 * Send password reset email (placeholder for now)
 */
async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  // TODO: Implement actual email sending
  logger.info('📧 Password reset email would be sent', { email, token });
}

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// POST /api/auth/register - User registration
router.post('/register', rateLimitMiddleware, async (req, res) => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);
    const { email, password, name, username, primary_skill, secondary_skills, referral_code } = validatedData;

    logger.info('📝 User registration attempt', { email, username });

    // Check if user already exists
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('id, email, username')
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (existingUser) {
      logger.warn('❌ User already exists', { email, username });
      return res.status(409).json({
        success: false,
        error: 'User with this email or username already exists',
        timestamp: new Date().toISOString(),
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await hash(password, saltRounds);

    // Generate referral code
    const userReferralCode = generateReferralCode();

    // Check referral code if provided
    let referredBy = null;
    if (referral_code) {
      const { data: referrer } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('referral_code', referral_code)
        .single();
      
      if (referrer) {
        referredBy = referrer.id;
      }
    }

    // Create user
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name,
        username,
        primary_skill,
        secondary_skills: secondary_skills || [],
        referral_code: userReferralCode,
        referred_by: referredBy,
      })
      .select('id, email, name, username, primary_skill, total_points, rank, rank_level')
      .single();

    if (createError) {
      logger.error('❌ Failed to create user:', { error: createError.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to create user account',
        timestamp: new Date().toISOString(),
      });
    }

    // Generate verification token
    const verificationToken = sign(
      { userId: newUser.id, email: newUser.email, type: 'email_verification' },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    // Generate JWT token for immediate login
    const token = generateToken(newUser.id, newUser.email);

    logger.info('✅ User registered successfully', { userId: newUser.id, email });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          username: newUser.username,
          primary_skill: newUser.primary_skill,
          total_points: newUser.total_points,
          rank: newUser.rank,
          rank_level: newUser.rank_level,
        },
        token,
        referral_code: userReferralCode,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Registration validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Registration error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/auth/login - User login
router.post('/login', rateLimitMiddleware, async (req, res) => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    logger.info('🔐 User login attempt', { email });

    // Find user by email
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, password_hash, name, username, primary_skill, total_points, rank, rank_level, is_verified, is_suspended')
      .eq('email', email)
      .single();

    if (userError || !user) {
      logger.warn('❌ Login failed - user not found', { email });
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        timestamp: new Date().toISOString(),
      });
    }

    // Check if user is suspended
    if (user.is_suspended) {
      logger.warn('❌ Login failed - user suspended', { email });
      return res.status(403).json({
        success: false,
        error: 'Account is suspended. Please contact support.',
        timestamp: new Date().toISOString(),
      });
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password_hash);
    if (!isPasswordValid) {
      logger.warn('❌ Login failed - invalid password', { email });
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        timestamp: new Date().toISOString(),
      });
    }

    // Update last activity
    await supabaseAdmin
      .from('users')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', user.id);

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    logger.info('✅ User logged in successfully', { userId: user.id, email });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          primary_skill: user.primary_skill,
          total_points: user.total_points,
          rank: user.rank,
          rank_level: user.rank_level,
          is_verified: user.is_verified,
        },
        token,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Login validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Login error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // We could implement a blacklist for additional security
    logger.info('🚪 User logout', { userId: req.user?.id });

    res.json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Logout error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/auth/refresh - Refresh JWT token
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
        timestamp: new Date().toISOString(),
      });
    }

    // Verify current token
    const decoded = verify(token, env.JWT_SECRET) as any;
    
    // Check if user still exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, is_suspended')
      .eq('id', decoded.userId)
      .single();

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        timestamp: new Date().toISOString(),
      });
    }

    if (user.is_suspended) {
      return res.status(403).json({
        success: false,
        error: 'Account is suspended',
        timestamp: new Date().toISOString(),
      });
    }

    // Generate new token
    const newToken = generateToken(user.id, user.email);

    logger.info('🔄 Token refreshed', { userId: user.id });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { token: newToken },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof jsonwebtoken.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Token refresh error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', rateLimitMiddleware, async (req, res) => {
  try {
    // Validate request body
    const validatedData = resetPasswordSchema.parse(req.body);
    const { email } = validatedData;

    logger.info('🔑 Password reset request', { email });

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (userError || !user) {
      // Don't reveal if user exists or not
      logger.info('📧 Password reset email sent (user may not exist)', { email });
      return res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
        timestamp: new Date().toISOString(),
      });
    }

    // Generate reset token
    const resetToken = sign(
      { userId: user.id, email: user.email, type: 'password_reset' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send reset email
    await sendPasswordResetEmail(email, resetToken);

    logger.info('✅ Password reset email sent', { email });

    res.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Password reset validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Password reset error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    // Validate request body
    const validatedData = newPasswordSchema.parse(req.body);
    const { token, password } = validatedData;

    logger.info('🔑 Password reset attempt');

    // Verify reset token
    const decoded = verify(token, env.JWT_SECRET) as any;
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        error: 'Invalid token type',
        timestamp: new Date().toISOString(),
      });
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await hash(password, saltRounds);

    // Update user password
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', decoded.userId);

    if (updateError) {
      logger.error('❌ Failed to update password:', { error: updateError.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to reset password',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Password reset successful', { userId: decoded.userId });

    res.json({
      success: true,
      message: 'Password reset successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof jsonwebtoken.JsonWebTokenError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token',
        timestamp: new Date().toISOString(),
      });
    }

    if (error instanceof z.ZodError) {
      logger.warn('❌ Password reset validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Password reset error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/auth/verify-email - Verify email with token
router.post('/verify-email', async (req, res) => {
  try {
    // Validate request body
    const validatedData = verifyEmailSchema.parse(req.body);
    const { token } = validatedData;

    logger.info('📧 Email verification attempt');

    // Verify email token
    const decoded = verify(token, env.JWT_SECRET) as any;
    
    if (decoded.type !== 'email_verification') {
      return res.status(400).json({
        success: false,
        error: 'Invalid token type',
        timestamp: new Date().toISOString(),
      });
    }

    // Update user verification status
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        is_verified: true,
        email_verified_at: new Date().toISOString()
      })
      .eq('id', decoded.userId);

    if (updateError) {
      logger.error('❌ Failed to verify email:', { error: updateError.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to verify email',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Email verified successfully', { userId: decoded.userId });

    res.json({
      success: true,
      message: 'Email verified successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof jsonwebtoken.JsonWebTokenError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token',
        timestamp: new Date().toISOString(),
      });
    }

    if (error instanceof z.ZodError) {
      logger.warn('❌ Email verification validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Email verification error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/auth/me - Get current user profile
router.get('/me', async (req, res) => {
  try {
    // This endpoint requires authentication middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
    }

    const userId = req.user.id;

    // Get user profile
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        id, email, name, username, avatar_url, primary_skill, secondary_skills,
        total_points, rank, rank_level, cabot_credits, is_verified,
        created_at, last_activity, profile_completed_at
      `)
      .eq('id', userId)
      .single();

    if (userError || !user) {
      logger.error('❌ Failed to fetch user profile:', { error: userError?.message });
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ User profile fetched', { userId });

    res.json({
      success: true,
      data: { user },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Get profile error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
