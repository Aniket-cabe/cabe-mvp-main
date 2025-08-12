import { createClient, RedisClientType } from 'redis';
import { env } from '../config/env';
import logger from '../utils/logger';

// Session interface
export interface UserSession {
  userId: string;
  email: string;
  token: string;
  createdAt: Date;
  lastActivity: Date;
  userAgent?: string;
  ipAddress?: string;
  isActive: boolean;
}

// Session configuration
const SESSION_CONFIG = {
  TTL: 7 * 24 * 60 * 60, // 7 days in seconds
  REFRESH_THRESHOLD: 30 * 60, // 30 minutes in seconds
  MAX_SESSIONS_PER_USER: 5,
  CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour in milliseconds
} as const;

class SessionService {
  private redis: RedisClientType;
  private isConnected = false;

  constructor() {
    this.redis = createClient({
      url: env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('❌ Redis connection failed after 10 retries');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      logger.info('✅ Redis client connected');
      this.isConnected = true;
    });

    this.redis.on('ready', () => {
      logger.info('✅ Redis client ready');
    });

    this.redis.on('error', (error) => {
      logger.error('❌ Redis client error:', error);
      this.isConnected = false;
    });

    this.redis.on('end', () => {
      logger.warn('⚠️ Redis client disconnected');
      this.isConnected = false;
    });

    this.redis.on('reconnecting', () => {
      logger.info('🔄 Redis client reconnecting...');
    });
  }

  /**
   * Connect to Redis
   */
  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      await this.redis.connect();
      logger.info('✅ Session service connected to Redis');
    } catch (error) {
      logger.error('❌ Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.redis.quit();
      logger.info('✅ Session service disconnected from Redis');
    } catch (error) {
      logger.error('❌ Error disconnecting from Redis:', error);
    }
  }

  /**
   * Create a new user session
   */
  async createSession(
    userId: string,
    email: string,
    token: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<UserSession> {
    try {
      await this.ensureConnection();

      const session: UserSession = {
        userId,
        email,
        token,
        createdAt: new Date(),
        lastActivity: new Date(),
        userAgent,
        ipAddress,
        isActive: true,
      };

      const sessionKey = `session:${token}`;
      const userSessionsKey = `user_sessions:${userId}`;

      // Store session data
      await this.redis.setEx(
        sessionKey,
        SESSION_CONFIG.TTL,
        JSON.stringify(session)
      );

      // Add session to user's session list
      await this.redis.sAdd(userSessionsKey, token);
      await this.redis.expire(userSessionsKey, SESSION_CONFIG.TTL);

      // Enforce max sessions per user
      await this.enforceMaxSessions(userId);

      logger.info('✅ Session created:', { userId, sessionId: token.substring(0, 8) + '...' });

      return session;
    } catch (error) {
      logger.error('❌ Failed to create session:', error);
      throw error;
    }
  }

  /**
   * Get session by token
   */
  async getSession(token: string): Promise<UserSession | null> {
    try {
      await this.ensureConnection();

      const sessionKey = `session:${token}`;
      const sessionData = await this.redis.get(sessionKey);

      if (!sessionData) {
        return null;
      }

      const session: UserSession = JSON.parse(sessionData);

      // Check if session is still active
      if (!session.isActive) {
        return null;
      }

      // Update last activity if needed
      const now = new Date();
      const timeSinceLastActivity = (now.getTime() - session.lastActivity.getTime()) / 1000;

      if (timeSinceLastActivity > SESSION_CONFIG.REFRESH_THRESHOLD) {
        session.lastActivity = now;
        await this.redis.setEx(
          sessionKey,
          SESSION_CONFIG.TTL,
          JSON.stringify(session)
        );
      }

      return session;
    } catch (error) {
      logger.error('❌ Failed to get session:', error);
      return null;
    }
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(token: string): Promise<boolean> {
    try {
      await this.ensureConnection();

      const sessionKey = `session:${token}`;
      const sessionData = await this.redis.get(sessionKey);

      if (!sessionData) {
        return false;
      }

      const session: UserSession = JSON.parse(sessionData);
      session.lastActivity = new Date();

      await this.redis.setEx(
        sessionKey,
        SESSION_CONFIG.TTL,
        JSON.stringify(session)
      );

      return true;
    } catch (error) {
      logger.error('❌ Failed to update session activity:', error);
      return false;
    }
  }

  /**
   * Invalidate a specific session
   */
  async invalidateSession(token: string): Promise<boolean> {
    try {
      await this.ensureConnection();

      const sessionKey = `session:${token}`;
      const sessionData = await this.redis.get(sessionKey);

      if (!sessionData) {
        return false;
      }

      const session: UserSession = JSON.parse(sessionData);
      session.isActive = false;

      // Remove session from Redis
      await this.redis.del(sessionKey);

      // Remove from user's session list
      const userSessionsKey = `user_sessions:${session.userId}`;
      await this.redis.sRem(userSessionsKey, token);

      logger.info('✅ Session invalidated:', { userId: session.userId, sessionId: token.substring(0, 8) + '...' });

      return true;
    } catch (error) {
      logger.error('❌ Failed to invalidate session:', error);
      return false;
    }
  }

  /**
   * Invalidate all sessions for a user
   */
  async invalidateAllUserSessions(userId: string): Promise<number> {
    try {
      await this.ensureConnection();

      const userSessionsKey = `user_sessions:${userId}`;
      const userTokens = await this.redis.sMembers(userSessionsKey);

      if (userTokens.length === 0) {
        return 0;
      }

      // Invalidate each session
      const invalidatedSessions = await Promise.all(
        userTokens.map(token => this.invalidateSession(token))
      );

      const count = invalidatedSessions.filter(Boolean).length;

      logger.info('✅ All user sessions invalidated:', { userId, count });

      return count;
    } catch (error) {
      logger.error('❌ Failed to invalidate all user sessions:', error);
      return 0;
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<UserSession[]> {
    try {
      await this.ensureConnection();

      const userSessionsKey = `user_sessions:${userId}`;
      const userTokens = await this.redis.sMembers(userSessionsKey);

      if (userTokens.length === 0) {
        return [];
      }

      const sessions: UserSession[] = [];

      for (const token of userTokens) {
        const session = await this.getSession(token);
        if (session && session.isActive) {
          sessions.push(session);
        }
      }

      return sessions;
    } catch (error) {
      logger.error('❌ Failed to get user sessions:', error);
      return [];
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      await this.ensureConnection();

      // This is a simplified cleanup - in production, you might want to use
      // Redis SCAN command for better performance with large datasets
      const pattern = 'session:*';
      const keys = await this.redis.keys(pattern);

      let cleanedCount = 0;

      for (const key of keys) {
        const sessionData = await this.redis.get(key);
        if (sessionData) {
          const session: UserSession = JSON.parse(sessionData);
          const now = new Date();
          const timeSinceLastActivity = (now.getTime() - session.lastActivity.getTime()) / 1000;

          if (timeSinceLastActivity > SESSION_CONFIG.TTL) {
            await this.redis.del(key);
            cleanedCount++;
          }
        }
      }

      if (cleanedCount > 0) {
        logger.info('🧹 Cleaned up expired sessions:', { count: cleanedCount });
      }

      return cleanedCount;
    } catch (error) {
      logger.error('❌ Failed to cleanup expired sessions:', error);
      return 0;
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    totalUsers: number;
  }> {
    try {
      await this.ensureConnection();

      const sessionKeys = await this.redis.keys('session:*');
      const userSessionKeys = await this.redis.keys('user_sessions:*');

      let activeSessions = 0;

      // Count active sessions
      for (const key of sessionKeys) {
        const sessionData = await this.redis.get(key);
        if (sessionData) {
          const session: UserSession = JSON.parse(sessionData);
          if (session.isActive) {
            activeSessions++;
          }
        }
      }

      return {
        totalSessions: sessionKeys.length,
        activeSessions,
        totalUsers: userSessionKeys.length,
      };
    } catch (error) {
      logger.error('❌ Failed to get session stats:', error);
      return {
        totalSessions: 0,
        activeSessions: 0,
        totalUsers: 0,
      };
    }
  }

  /**
   * Enforce maximum sessions per user
   */
  private async enforceMaxSessions(userId: string): Promise<void> {
    try {
      const userSessionsKey = `user_sessions:${userId}`;
      const userTokens = await this.redis.sMembers(userSessionsKey);

      if (userTokens.length > SESSION_CONFIG.MAX_SESSIONS_PER_USER) {
        // Remove oldest sessions
        const sessionsToRemove = userTokens.slice(0, userTokens.length - SESSION_CONFIG.MAX_SESSIONS_PER_USER);
        
        for (const token of sessionsToRemove) {
          await this.invalidateSession(token);
        }

        logger.info('🔄 Enforced max sessions limit:', { 
          userId, 
          removed: sessionsToRemove.length 
        });
      }
    } catch (error) {
      logger.error('❌ Failed to enforce max sessions:', error);
    }
  }

  /**
   * Ensure Redis connection is active
   */
  private async ensureConnection(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  /**
   * Start periodic cleanup
   */
  startPeriodicCleanup(): void {
    setInterval(async () => {
      try {
        await this.cleanupExpiredSessions();
      } catch (error) {
        logger.error('❌ Periodic cleanup failed:', error);
      }
    }, SESSION_CONFIG.CLEANUP_INTERVAL);

    logger.info('🔄 Started periodic session cleanup');
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.ensureConnection();
      await this.redis.ping();
      return true;
    } catch (error) {
      logger.error('❌ Session service health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const sessionService = new SessionService();

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🛑 Shutting down session service...');
  await sessionService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🛑 Shutting down session service...');
  await sessionService.disconnect();
  process.exit(0);
});
