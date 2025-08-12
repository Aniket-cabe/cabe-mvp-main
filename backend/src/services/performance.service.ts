import { supabaseAdmin } from '../lib/supabase-admin';
import logger from '../utils/logger';

// ============================================================================
// PERFORMANCE CONFIGURATION
// ============================================================================

const PERFORMANCE_CONFIG = {
  CACHE_TTL: {
    LEADERBOARD: 5 * 60 * 1000, // 5 minutes
    USER_STATS: 10 * 60 * 1000, // 10 minutes
    TASK_LIST: 15 * 60 * 1000, // 15 minutes
    ACHIEVEMENTS: 30 * 60 * 1000, // 30 minutes
    ANALYTICS: 60 * 60 * 1000, // 1 hour
  },
  BATCH_SIZE: {
    USER_UPDATES: 100,
    SUBMISSION_PROCESSING: 50,
    POINT_CALCULATIONS: 200,
  },
  QUERY_TIMEOUT: 30000, // 30 seconds
  MAX_CONCURRENT_QUERIES: 10,
  MEMORY_THRESHOLD: 0.8, // 80% memory usage
};

// In-memory cache (in production, use Redis)
const cache = new Map<string, { data: any; expires: number }>();

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * Set cache entry with TTL
 */
export function setCache(key: string, data: any, ttl: number = PERFORMANCE_CONFIG.CACHE_TTL.USER_STATS): void {
  const expires = Date.now() + ttl;
  cache.set(key, { data, expires });
}

/**
 * Get cache entry
 */
export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Delete cache entry
 */
export function deleteCache(key: string): void {
  cache.delete(key);
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  keys: string[];
  memoryUsage: NodeJS.MemoryUsage;
} {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
    memoryUsage: process.memoryUsage(),
  };
}

// ============================================================================
// DATABASE OPTIMIZATION
// ============================================================================

/**
 * Optimize database queries with connection pooling
 */
export async function optimizeDatabaseQueries(): Promise<{
  success: boolean;
  optimizations: string[];
  errors: string[];
}> {
  const optimizations: string[] = [];
  const errors: string[] = [];

  try {
    // Check and create missing indexes
    const indexOptimizations = await createMissingIndexes();
    optimizations.push(...indexOptimizations);

    // Analyze table statistics
    const analysisResults = await analyzeTableStatistics();
    optimizations.push(...analysisResults);

    // Vacuum tables for better performance
    await vacuumTables();
    optimizations.push('Tables vacuumed for optimal performance');

    logger.info('✅ Database optimization completed', { optimizations: optimizations.length });

    return {
      success: true,
      optimizations,
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Database optimization failed: ${errorMessage}`);
    logger.error('❌ Database optimization failed:', { error: errorMessage });
    return {
      success: false,
      optimizations,
      errors,
    };
  }
}

/**
 * Create missing indexes for better query performance
 */
async function createMissingIndexes(): Promise<string[]> {
  const optimizations: string[] = [];

  try {
    // Check for missing indexes on frequently queried columns
    const missingIndexes = [
      // Users table
      'CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email))',
      'CREATE INDEX IF NOT EXISTS idx_users_primary_skill ON users(primary_skill)',
      'CREATE INDEX IF NOT EXISTS idx_users_total_points ON users(total_points DESC)',
      'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(last_activity DESC)',
      
      // Submissions table
      'CREATE INDEX IF NOT EXISTS idx_submissions_user_status ON submissions(user_id, status)',
      'CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_submissions_fraud_score ON submissions(fraud_score DESC)',
      'CREATE INDEX IF NOT EXISTS idx_submissions_points_awarded ON submissions(points_awarded DESC)',
      
      // Tasks table
      'CREATE INDEX IF NOT EXISTS idx_tasks_skill_category ON tasks(skill_category)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON tasks(task_type)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_expires_at ON tasks(expires_at)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_completion_count ON tasks(completion_count DESC)',
      
      // Points history table
      'CREATE INDEX IF NOT EXISTS idx_points_history_user_created ON points_history(user_id, created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_points_history_reason ON points_history(reason)',
      
      // Achievements table
      'CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category)',
      'CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(type)',
      
      // User achievements table
      'CREATE INDEX IF NOT EXISTS idx_user_achievements_user_completed ON user_achievements(user_id, is_completed)',
      'CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at DESC)',
    ];

    for (const indexQuery of missingIndexes) {
      try {
        await supabaseAdmin.rpc('exec_sql', { sql: indexQuery });
        optimizations.push(`Index created: ${indexQuery.split(' ')[2]}`);
      } catch (error) {
        // Index might already exist, continue
        logger.debug('Index creation skipped (might already exist):', { query: indexQuery });
      }
    }

    return optimizations;
  } catch (error) {
    logger.error('❌ Index creation failed:', { error: error instanceof Error ? error.message : 'Unknown error' });
    return optimizations;
  }
}

/**
 * Analyze table statistics for query optimization
 */
async function analyzeTableStatistics(): Promise<string[]> {
  const optimizations: string[] = [];

  try {
    const tables = [
      'users', 'submissions', 'tasks', 'points_history', 
      'achievements', 'user_achievements', 'referrals', 'cabot_usage'
    ];

    for (const table of tables) {
      try {
        await supabaseAdmin.rpc('exec_sql', { sql: `ANALYZE ${table}` });
        optimizations.push(`Table statistics updated: ${table}`);
      } catch (error) {
        logger.debug('Table analysis skipped:', { table, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return optimizations;
  } catch (error) {
    logger.error('❌ Table analysis failed:', { error: error instanceof Error ? error.message : 'Unknown error' });
    return optimizations;
  }
}

/**
 * Vacuum tables for better performance
 */
async function vacuumTables(): Promise<void> {
  try {
    await supabaseAdmin.rpc('exec_sql', { sql: 'VACUUM ANALYZE' });
  } catch (error) {
    logger.error('❌ Table vacuum failed:', { error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

// ============================================================================
// QUERY OPTIMIZATION
// ============================================================================

/**
 * Optimize leaderboard query with caching
 */
export async function getOptimizedLeaderboard(
  skillCategory?: string,
  limit: number = 50
): Promise<{ users: any[]; cached: boolean }> {
  const cacheKey = `leaderboard:${skillCategory || 'all'}:${limit}`;
  
  // Check cache first
  const cached = getCache<any[]>(cacheKey);
  if (cached) {
    return { users: cached, cached: true };
  }

  try {
    let query = supabaseAdmin
      .from('users')
      .select('id, email, primary_skill, total_points, rank, created_at')
      .order('total_points', { ascending: false })
      .limit(limit);

    if (skillCategory) {
      query = query.eq('primary_skill', skillCategory);
    }

    const { data: users, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch leaderboard: ${error.message}`);
    }

    // Cache the result
    setCache(cacheKey, users, PERFORMANCE_CONFIG.CACHE_TTL.LEADERBOARD);

    return { users: users || [], cached: false };
  } catch (error) {
    logger.error('❌ Leaderboard query failed:', { error: error instanceof Error ? error.message : 'Unknown error' });
    return { users: [], cached: false };
  }
}

/**
 * Optimize user statistics query with caching
 */
export async function getOptimizedUserStats(userId: string): Promise<{ stats: any; cached: boolean }> {
  const cacheKey = `user_stats:${userId}`;
  
  // Check cache first
  const cached = getCache<any>(cacheKey);
  if (cached) {
    return { stats: cached, cached: true };
  }

  try {
    // Get user data with optimized queries
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        id, email, primary_skill, secondary_skills, total_points, rank,
        created_at, last_activity, cabot_credits, is_suspended, is_banned
      `)
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('User not found');
    }

    // Get submission statistics with optimized query
    const { data: submissions, error: submissionsError } = await supabaseAdmin
      .from('submissions')
      .select('status, points_awarded, submitted_at')
      .eq('user_id', userId);

    if (submissionsError) {
      throw new Error(`Failed to fetch submissions: ${submissionsError.message}`);
    }

    // Calculate statistics
    const totalSubmissions = submissions?.length || 0;
    const approvedSubmissions = submissions?.filter(s => s.status === 'approved').length || 0;
    const totalPointsEarned = submissions?.reduce((sum, s) => sum + (s.points_awarded || 0), 0) || 0;

    const stats = {
      user,
      statistics: {
        totalSubmissions,
        approvedSubmissions,
        approvalRate: totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions) * 100 : 0,
        totalPointsEarned,
      },
    };

    // Cache the result
    setCache(cacheKey, stats, PERFORMANCE_CONFIG.CACHE_TTL.USER_STATS);

    return { stats, cached: false };
  } catch (error) {
    logger.error('❌ User stats query failed:', { 
      userId, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return { stats: null, cached: false };
  }
}

/**
 * Optimize task list query with caching
 */
export async function getOptimizedTaskList(
  skillCategory?: string,
  taskType?: string,
  limit: number = 50
): Promise<{ tasks: any[]; cached: boolean }> {
  const cacheKey = `tasks:${skillCategory || 'all'}:${taskType || 'all'}:${limit}`;
  
  // Check cache first
  const cached = getCache<any[]>(cacheKey);
  if (cached) {
    return { tasks: cached, cached: true };
  }

  try {
    let query = supabaseAdmin
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (skillCategory) {
      query = query.eq('skill_category', skillCategory);
    }

    if (taskType) {
      query = query.eq('task_type', taskType);
    }

    const { data: tasks, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }

    // Cache the result
    setCache(cacheKey, tasks, PERFORMANCE_CONFIG.CACHE_TTL.TASK_LIST);

    return { tasks: tasks || [], cached: false };
  } catch (error) {
    logger.error('❌ Task list query failed:', { error: error instanceof Error ? error.message : 'Unknown error' });
    return { tasks: [], cached: false };
  }
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

/**
 * Process batch user updates for better performance
 */
export async function processBatchUserUpdates(updates: Array<{ userId: string; updates: any }>): Promise<{
  success: boolean;
  processed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let processed = 0;

  try {
    // Process in batches
    const batchSize = PERFORMANCE_CONFIG.BATCH_SIZE.USER_UPDATES;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async ({ userId, updates }) => {
        try {
          const { error } = await supabaseAdmin
            .from('users')
            .update(updates)
            .eq('id', userId);

          if (error) {
            throw new Error(`Failed to update user ${userId}: ${error.message}`);
          }

          // Clear user cache
          deleteCache(`user_stats:${userId}`);
          
          return { success: true, userId };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`User ${userId}: ${errorMessage}`);
          return { success: false, userId, error: errorMessage };
        }
      });

      const results = await Promise.all(batchPromises);
      processed += results.filter(r => r.success).length;
    }

    logger.info('✅ Batch user updates completed', { processed, errors: errors.length });

    return {
      success: errors.length === 0,
      processed,
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('❌ Batch user updates failed:', { error: errorMessage });
    return {
      success: false,
      processed,
      errors: [errorMessage],
    };
  }
}

/**
 * Process batch submissions for better performance
 */
export async function processBatchSubmissions(submissions: Array<{ submissionId: string; updates: any }>): Promise<{
  success: boolean;
  processed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let processed = 0;

  try {
    // Process in batches
    const batchSize = PERFORMANCE_CONFIG.BATCH_SIZE.SUBMISSION_PROCESSING;
    for (let i = 0; i < submissions.length; i += batchSize) {
      const batch = submissions.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async ({ submissionId, updates }) => {
        try {
          const { error } = await supabaseAdmin
            .from('submissions')
            .update(updates)
            .eq('id', submissionId);

          if (error) {
            throw new Error(`Failed to update submission ${submissionId}: ${error.message}`);
          }

          return { success: true, submissionId };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Submission ${submissionId}: ${errorMessage}`);
          return { success: false, submissionId, error: errorMessage };
        }
      });

      const results = await Promise.all(batchPromises);
      processed += results.filter(r => r.success).length;
    }

    logger.info('✅ Batch submission processing completed', { processed, errors: errors.length });

    return {
      success: errors.length === 0,
      processed,
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('❌ Batch submission processing failed:', { error: errorMessage });
    return {
      success: false,
      processed,
      errors: [errorMessage],
    };
  }
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Get system performance metrics
 */
export function getPerformanceMetrics(): {
  memory: NodeJS.MemoryUsage;
  cache: { size: number; keys: string[] };
  uptime: number;
  cpu: NodeJS.CpuUsage;
} {
  return {
    memory: process.memoryUsage(),
    cache: {
      size: cache.size,
      keys: Array.from(cache.keys()),
    },
    uptime: process.uptime(),
    cpu: process.cpuUsage(),
  };
}

/**
 * Check if system is under high load
 */
export function isSystemUnderLoad(): boolean {
  const memoryUsage = process.memoryUsage();
  const memoryRatio = memoryUsage.heapUsed / memoryUsage.heapTotal;
  
  return memoryRatio > PERFORMANCE_CONFIG.MEMORY_THRESHOLD;
}

/**
 * Clean up resources when under high load
 */
export function cleanupUnderLoad(): void {
  if (isSystemUnderLoad()) {
    logger.warn('⚠️ System under high load, cleaning up resources');
    
    // Clear cache to free memory
    clearCache();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    logger.info('✅ Resource cleanup completed');
  }
}

// ============================================================================
// SCHEDULED OPTIMIZATION
// ============================================================================

/**
 * Run scheduled performance optimizations
 */
export async function runScheduledOptimizations(): Promise<{
  success: boolean;
  optimizations: string[];
  errors: string[];
}> {
  logger.info('🔄 Running scheduled performance optimizations');

  try {
    // Clean up expired cache entries
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now > entry.expires) {
        cache.delete(key);
      }
    }

    // Optimize database queries
    const dbOptimizations = await optimizeDatabaseQueries();

    // Clean up under load
    cleanupUnderLoad();

    logger.info('✅ Scheduled optimizations completed');

    return {
      success: dbOptimizations.success,
      optimizations: [
        'Cache cleanup completed',
        ...dbOptimizations.optimizations,
        'Resource cleanup completed',
      ],
      errors: dbOptimizations.errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('❌ Scheduled optimizations failed:', { error: errorMessage });
    return {
      success: false,
      optimizations: [],
      errors: [errorMessage],
    };
  }
}

// Run scheduled optimizations every hour
setInterval(runScheduledOptimizations, 60 * 60 * 1000);

export default {
  // Cache management
  setCache,
  getCache,
  deleteCache,
  clearCache,
  getCacheStats,
  
  // Database optimization
  optimizeDatabaseQueries,
  
  // Query optimization
  getOptimizedLeaderboard,
  getOptimizedUserStats,
  getOptimizedTaskList,
  
  // Batch processing
  processBatchUserUpdates,
  processBatchSubmissions,
  
  // Performance monitoring
  getPerformanceMetrics,
  isSystemUnderLoad,
  cleanupUnderLoad,
  
  // Scheduled optimization
  runScheduledOptimizations,
  
  // Configuration
  PERFORMANCE_CONFIG,
};
