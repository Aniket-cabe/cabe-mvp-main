import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { executeWithRetry } from '../../db';
import { env } from '../config/env';
import { emailService } from '../utils/email.service';
import logger from '../utils/logger';

// Zod schemas for validation
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const resetRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResult {
  user: Omit<User, 'password_hash'>;
  token: string;
}

export interface OAuthProfile {
  provider: 'google' | 'github';
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
}

// Token storage for password reset and email verification
const resetTokens = new Map<
  string,
  { userId: string; email: string; expiresAt: number }
>();
const verificationTokens = new Map<
  string,
  { userId: string; email: string; expiresAt: number }
>();

class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly TOKEN_EXPIRY = '7d';
  private readonly RESET_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
  private readonly VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Register a new user
   */
  async registerUser(
    data: z.infer<typeof registerSchema>
  ): Promise<AuthResult> {
    const { name, email, password } = data;

    // Check if user already exists
    const existingUser = await executeWithRetry(async (client) => {
      const { data: user } = await client
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();
      return user;
    });

    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Create user
    const userId = uuidv4();
    const user = await executeWithRetry(async (client) => {
      const { data: newUser, error } = await client
        .from('users')
        .insert({
          id: userId,
          name,
          email: email.toLowerCase(),
          password_hash: passwordHash,
          email_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return newUser;
    });

    // Send verification email
    await this.sendVerificationEmail(userId, email);

    // Generate JWT token
    const token = this.generateToken(userId);

    logger.info(`✅ User registered successfully: ${email}`);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token,
    };
  }

  /**
   * Login user
   */
  async loginUser(data: z.infer<typeof loginSchema>): Promise<AuthResult> {
    const { email, password } = data;

    // Find user
    const user = await executeWithRetry(async (client) => {
      const { data: foundUser, error } = await client
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error || !foundUser) {
        throw new Error('Invalid email or password');
      }
      return foundUser;
    });

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user.id);

    logger.info(`✅ User logged in successfully: ${email}`);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token,
    };
  }

  /**
   * Send password reset email
   */
  async sendResetEmail(email: string): Promise<void> {
    // Find user
    const user = await executeWithRetry(async (client) => {
      const { data: foundUser } = await client
        .from('users')
        .select('id, name')
        .eq('email', email.toLowerCase())
        .single();
      return foundUser;
    });

    if (!user) {
      // Don't reveal if user exists or not
      logger.info(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    const expiresAt = Date.now() + this.RESET_TOKEN_EXPIRY;

    // Store token
    resetTokens.set(resetToken, {
      userId: user.id,
      email: email.toLowerCase(),
      expiresAt,
    });

    // Send email
    await emailService.sendPasswordResetEmail(email, user.name, resetToken);

    logger.info(`✅ Password reset email sent to: ${email}`);
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetData = resetTokens.get(token);

    if (!resetData || resetData.expiresAt < Date.now()) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Update user password
    await executeWithRetry(async (client) => {
      const { error } = await client
        .from('users')
        .update({
          password_hash: passwordHash,
          updated_at: new Date().toISOString(),
        })
        .eq('id', resetData.userId);

      if (error) throw error;
    });

    // Remove used token
    resetTokens.delete(token);

    logger.info(`✅ Password reset successfully for user: ${resetData.userId}`);
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(userId: string, email: string): Promise<void> {
    const verificationToken = uuidv4();
    const expiresAt = Date.now() + this.VERIFICATION_TOKEN_EXPIRY;

    // Store token
    verificationTokens.set(verificationToken, {
      userId,
      email: email.toLowerCase(),
      expiresAt,
    });

    // Send email
    await emailService.sendVerificationEmail(email, verificationToken);

    logger.info(`✅ Verification email sent to: ${email}`);
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ name: string; email: string }> {
    const verificationData = verificationTokens.get(token);

    if (!verificationData || verificationData.expiresAt < Date.now()) {
      throw new Error('Invalid or expired verification token');
    }

    // Update user verification status
    const user = await executeWithRetry(async (client) => {
      const { data: updatedUser, error } = await client
        .from('users')
        .update({
          email_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', verificationData.userId)
        .select('name, email')
        .single();

      if (error) throw error;
      return updatedUser;
    });

    // Remove used token
    verificationTokens.delete(token);

    logger.info(
      `✅ Email verified successfully for user: ${verificationData.userId}`
    );

    return {
      name: user.name,
      email: user.email,
    };
  }

  /**
   * OAuth login/registration
   */
  async oauthLogin(profile: OAuthProfile): Promise<AuthResult> {
    const { provider, providerId, email, name, avatar } = profile;

    // Check if user exists by OAuth provider
    let user = await executeWithRetry(async (client) => {
      const { data: foundUser } = await client
        .from('users')
        .select('*')
        .eq('oauth_provider', provider)
        .eq('oauth_provider_id', providerId)
        .single();
      return foundUser;
    });

    if (!user) {
      // Check if user exists by email
      user = await executeWithRetry(async (client) => {
        const { data: foundUser } = await client
          .from('users')
          .select('*')
          .eq('email', email.toLowerCase())
          .single();
        return foundUser;
      });

      if (user) {
        // Link existing account to OAuth provider
        await executeWithRetry(async (client) => {
          const { error } = await client
            .from('users')
            .update({
              oauth_provider: provider,
              oauth_provider_id: providerId,
              avatar_url: avatar,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (error) throw error;
        });
      } else {
        // Create new user
        const userId = uuidv4();
        user = await executeWithRetry(async (client) => {
          const { data: newUser, error } = await client
            .from('users')
            .insert({
              id: userId,
              name,
              email: email.toLowerCase(),
              oauth_provider: provider,
              oauth_provider_id: providerId,
              avatar_url: avatar,
              email_verified: true, // OAuth emails are pre-verified
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) throw error;
          return newUser;
        });
      }
    }

    // Generate JWT token
    const token = this.generateToken(user.id);

    logger.info(`✅ OAuth login successful: ${email} via ${provider}`);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token,
    };
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): { userId: string; email: string } {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        userId: string;
        email: string;
      };
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(
    userId: string
  ): Promise<Omit<User, 'password_hash'> | null> {
    const user = await executeWithRetry(async (client) => {
      const { data: foundUser } = await client
        .from('users')
        .select('id, name, email, email_verified, created_at, updated_at')
        .eq('id', userId)
        .single();
      return foundUser;
    });

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: { name?: string; avatar_url?: string }
  ): Promise<void> {
    await executeWithRetry(async (client) => {
      const { error } = await client
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
    });

    logger.info(`✅ Profile updated for user: ${userId}`);
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Get current password hash
    const user = await executeWithRetry(async (client) => {
      const { data: foundUser } = await client
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single();
      return foundUser;
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Update password
    await executeWithRetry(async (client) => {
      const { error } = await client
        .from('users')
        .update({
          password_hash: passwordHash,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
    });

    logger.info(`✅ Password changed for user: ${userId}`);
  }

  /**
   * Delete account
   */
  async deleteAccount(userId: string, password: string): Promise<void> {
    // Verify password
    const user = await executeWithRetry(async (client) => {
      const { data: foundUser } = await client
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single();
      return foundUser;
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Password is incorrect');
    }

    // Delete user
    await executeWithRetry(async (client) => {
      const { error } = await client.from('users').delete().eq('id', userId);

      if (error) throw error;
    });

    logger.info(`✅ Account deleted for user: ${userId}`);
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET, {
      expiresIn: this.TOKEN_EXPIRY,
    });
  }

  /**
   * Clean up expired tokens
   */
  cleanupExpiredTokens(): void {
    const now = Date.now();

    // Clean reset tokens
    for (const [token, data] of resetTokens.entries()) {
      if (data.expiresAt < now) {
        resetTokens.delete(token);
      }
    }

    // Clean verification tokens
    for (const [token, data] of verificationTokens.entries()) {
      if (data.expiresAt < now) {
        verificationTokens.delete(token);
      }
    }
  }
}

// Create singleton instance
export const authService = new AuthService();

// Clean up expired tokens every hour
setInterval(
  () => {
    authService.cleanupExpiredTokens();
  },
  60 * 60 * 1000
);

export default authService;
