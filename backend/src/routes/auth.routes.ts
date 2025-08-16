import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../lib/supabase-admin';
import { env } from '../config/env';
import logger from '../utils/logger';
import { authenticateToken, requireEmailVerification } from '../middleware/auth';
import { authLimiter } from '../middleware/rate-limit';

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  primary_skill: z.enum(['Full-Stack Software Development', 'Cloud Computing & DevOps', 'Data Science & Analytics', 'AI / Machine Learning']),
  secondary_skills: z.array(z.enum(['Full-Stack Software Development', 'Cloud Computing & DevOps', 'Data Science & Analytics', 'AI / Machine Learning'])).max(3),
  referral_code: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const googleAuthSchema = z.object({
  id_token: z.string().min(1, 'Google ID token is required'),
  referral_code: z.string().optional(),
});

const passwordResetSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  avatar_url: z.string().url('Invalid avatar URL').optional(),
  primary_skill: z.enum(['Full-Stack Software Development', 'Cloud Computing & DevOps', 'Data Science & Analytics', 'AI / Machine Learning']).optional(),
  secondary_skills: z.array(z.enum(['Full-Stack Software Development', 'Cloud Computing & DevOps', 'Data Science & Analytics', 'AI / Machine Learning'])).max(3).optional(),
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a unique referral code
 */
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Verify Google ID token (placeholder - implement with Google Auth library)
 */
async function verifyGoogleToken(idToken: string): Promise<any> {
  // TODO: Implement actual Google token verification
  // For now, return a mock user object
  logger.info('🔍 Verifying Google ID token (placeholder implementation)');
  
  // In production, use Google Auth library:
  // const ticket = await client.verifyIdToken({
  //   idToken,
  //   audience: env.GOOGLE_CLIENT_ID,
  // });
  // const payload = ticket.getPayload();
  
  return {
    email: 'mock-google-user@example.com',
    name: 'Mock Google User',
    picture: 'https://example.com/avatar.jpg',
    sub: 'mock-google-id',
  };
}

/**
 * Create JWT token
 */
function createJWTToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );
}

/**
 * Process referral bonus
 */
async function processReferralBonus(referrerId: string, newUserId: string): Promise<void> {
  try {
    // Award 200 points to referrer
    const { data: referrer, error: referrerError } = await supabaseAdmin
      .from('users')
      .select('total_points')
      .eq('id', referrerId)
      .single();

    if (referrerError || !referrer) {
      logger.error('❌ Failed to fetch referrer for bonus:', referrerError);
      return;
    }

    const newPoints = (referrer.total_points || 0) + 200;
    
    await supabaseAdmin
      .from('users')
      .update({ total_points: newPoints })
      .eq('id', referrerId);

    // Log referral bonus
    await supabaseAdmin
      .from('points_history')
      .insert({
        user_id: referrerId,
        points_change: 200,
        reason: 'referral_bonus',
        metadata: { referred_user_id: newUserId }
      });

    logger.info('✅ Referral bonus processed:', { referrerId, newUserId, bonus: 200 });
  } catch (error) {
    logger.error('❌ Error processing referral bonus:', error);
  }
}

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// POST /api/auth/register
router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', validatedData.email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
        timestamp: new Date().toISOString(),
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 12);
    
    // Generate referral code
    const referralCode = generateReferralCode();
    
    // Check referral code if provided
    let referredBy = null;
    if (validatedData.referral_code) {
      const { data: referrer } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('referral_code', validatedData.referral_code)
        .single();
      
      if (referrer) {
        referredBy = referrer.id;
      }
    }

    // Create user
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        email: validatedData.email,
        password_hash: passwordHash,
        name: validatedData.name,
        username: validatedData.username,
        primary_skill: validatedData.primary_skill,
        secondary_skills: validatedData.secondary_skills,
        referral_code: referralCode,
        referred_by: referredBy,
        cabot_credits: 25, // Starting credits
      })
      .select()
      .single();

    if (createError || !newUser) {
      logger.error('❌ Failed to create user:', createError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create user account',
        timestamp: new Date().toISOString(),
      });
    }

    // Process referral bonus if applicable
    if (referredBy) {
      await processReferralBonus(referredBy, newUser.id);
    }

    // Create JWT token
    const token = createJWTToken(newUser.id, newUser.email);

    logger.info('✅ User registered successfully:', { userId: newUser.id, email: newUser.email });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username,
        primary_skill: newUser.primary_skill,
        secondary_skills: newUser.secondary_skills,
        rank: newUser.rank,
        total_points: newUser.total_points,
        cabot_credits: newUser.cabot_credits,
        referral_code: newUser.referral_code,
        is_verified: newUser.is_verified,
      },
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

    logger.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Find user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', validatedData.email)
      .single();

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        timestamp: new Date().toISOString(),
      });
    }

    // Check if user is suspended
    if (user.is_suspended) {
      return res.status(403).json({
        success: false,
        error: 'Account is suspended',
        timestamp: new Date().toISOString(),
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        timestamp: new Date().toISOString(),
      });
    }

    // Update last activity
    await supabaseAdmin
      .from('users')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', user.id);

    // Create JWT token
    const token = createJWTToken(user.id, user.email);

    logger.info('✅ User logged in successfully:', { userId: user.id, email: user.email });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        primary_skill: user.primary_skill,
        secondary_skills: user.secondary_skills,
        rank: user.rank,
        total_points: user.total_points,
        cabot_credits: user.cabot_credits,
        referral_code: user.referral_code,
        is_verified: user.is_verified,
        avatar_url: user.avatar_url,
      },
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

    logger.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/auth/google
router.post('/google', authLimiter, async (req: Request, res: Response) => {
  try {
    const validatedData = googleAuthSchema.parse(req.body);

    // Verify Google token
    const googleUser = await verifyGoogleToken(validatedData.id_token);
    
    // Check if user exists
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', googleUser.email)
      .single();

    let user = existingUser;
    let isNewUser = false;

    if (userError || !existingUser) {
      // Create new user
      const referralCode = generateReferralCode();
      
      // Check referral code if provided
      let referredBy = null;
      if (validatedData.referral_code) {
        const { data: referrer } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('referral_code', validatedData.referral_code)
          .single();
        
        if (referrer) {
          referredBy = referrer.id;
        }
      }

      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          email: googleUser.email,
          name: googleUser.name,
          avatar_url: googleUser.picture,
          primary_skill: 'web_development', // Default, can be updated later
          secondary_skills: [],
          referral_code: referralCode,
          referred_by: referredBy,
          cabot_credits: 25,
          is_verified: true, // Google users are pre-verified
          email_verified_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError || !newUser) {
        logger.error('❌ Failed to create Google user:', createError);
        return res.status(500).json({
          success: false,
          error: 'Failed to create user account',
          timestamp: new Date().toISOString(),
        });
      }

      user = newUser;
      isNewUser = true;

      // Process referral bonus if applicable
      if (referredBy) {
        await processReferralBonus(referredBy, newUser.id);
      }
    } else {
      // Update existing user's last activity
      await supabaseAdmin
        .from('users')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', user.id);
    }

    // Create JWT token
    const token = createJWTToken(user.id, user.email);

    logger.info('✅ Google auth successful:', { 
      userId: user.id, 
      email: user.email, 
      isNewUser 
    });

    res.json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        primary_skill: user.primary_skill,
        secondary_skills: user.secondary_skills,
        rank: user.rank,
        total_points: user.total_points,
        cabot_credits: user.cabot_credits,
        referral_code: user.referral_code,
        is_verified: user.is_verified,
        avatar_url: user.avatar_url,
      },
      isNewUser,
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

    logger.error('❌ Google auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    // In a Redis-based session system, you would invalidate the session here
    // For now, we'll just return success (client should delete the token)
    
    logger.info('✅ User logged out:', { userId: (req.user as any)?.id });

    res.json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/auth/refresh
router.post('/refresh', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Create new token
    const newToken = createJWTToken((req.user as any)!.id, (req.user as any)!.email);

          logger.info('✅ Token refreshed:', { userId: (req.user as any)!.id });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, async (req: Request, res: Response) => {
  try {
    const validatedData = passwordResetSchema.parse(req.body);

    // Check if user exists
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', validatedData.email)
      .single();

    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent',
        timestamp: new Date().toISOString(),
      });
    }

    // Generate reset token (in production, use a proper token generation library)
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // TODO: Send email with reset link
    // For now, just log the token
    logger.info('🔑 Password reset token generated:', { 
      userId: user.id, 
      email: user.email,
      resetToken 
    });

    res.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent',
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

    logger.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, async (req: Request, res: Response) => {
  try {
    const validatedData = passwordResetConfirmSchema.parse(req.body);

    // Verify reset token
    let payload: any;
    try {
      payload = jwt.verify(validatedData.token, env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
        timestamp: new Date().toISOString(),
      });
    }

    if (payload.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        error: 'Invalid token type',
        timestamp: new Date().toISOString(),
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // Update user password
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', payload.userId);

    if (updateError) {
      logger.error('❌ Failed to update password:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update password',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Password reset successful:', { userId: payload.userId });

    res.json({
      success: true,
      message: 'Password reset successfully',
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

    logger.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', authLimiter, async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required',
        timestamp: new Date().toISOString(),
      });
    }

    // Verify email token
    let payload: any;
    try {
      payload = jwt.verify(token, env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token',
        timestamp: new Date().toISOString(),
      });
    }

    if (payload.type !== 'email_verification') {
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
      .eq('id', payload.userId);

    if (updateError) {
      logger.error('❌ Failed to verify email:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to verify email',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Email verified successfully:', { userId: payload.userId });

    res.json({
      success: true,
      message: 'Email verified successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user!.id)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        primary_skill: user.primary_skill,
        secondary_skills: user.secondary_skills,
        rank: user.rank,
        total_points: user.total_points,
        cabot_credits: user.cabot_credits,
        referral_code: user.referral_code,
        is_verified: user.is_verified,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        last_activity: user.last_activity,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('❌ Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, requireEmailVerification, async (req: Request, res: Response) => {
  try {
    const validatedData = profileUpdateSchema.parse(req.body);

    // Check username uniqueness if provided
    if (validatedData.username) {
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', validatedData.username)
        .neq('id', req.user!.id)
        .single();

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Username already taken',
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        ...validatedData,
        profile_completed_at: new Date().toISOString(),
      })
      .eq('id', req.user!.id)
      .select()
      .single();

    if (updateError || !updatedUser) {
      logger.error('❌ Failed to update profile:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update profile',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Profile updated successfully:', { userId: req.user!.id });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        username: updatedUser.username,
        primary_skill: updatedUser.primary_skill,
        secondary_skills: updatedUser.secondary_skills,
        rank: updatedUser.rank,
        total_points: updatedUser.total_points,
        cabot_credits: updatedUser.cabot_credits,
        referral_code: updatedUser.referral_code,
        is_verified: updatedUser.is_verified,
        avatar_url: updatedUser.avatar_url,
        profile_completed_at: updatedUser.profile_completed_at,
      },
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

    logger.error('❌ Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
