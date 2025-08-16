/**
 * CaBE Arena Point Decay System
 * 
 * Implements 5% quarterly point decay for users with no activity
 * in specific skill categories.
 */

import { supabaseAdmin } from '../lib/supabase-admin';
import logger from '../utils/logger';

// ============================================================================
// CONSTANTS
// ============================================================================

export const DECAY_CONFIG = {
  QUARTERLY_PERCENTAGE: 5, // 5% decay per quarter
  DECAY_INTERVAL_DAYS: 90, // 3 months
  MIN_POINTS_FOR_DECAY: 100, // Minimum points before decay applies
  ACTIVITY_THRESHOLD_DAYS: 90, // No activity for 90 days triggers decay
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface DecayResult {
  userId: string;
  previousPoints: number;
  decayAmount: number;
  newPoints: number;
  skillCategory: string;
  lastActivity: Date;
  decayReason: string;
}

export interface DecayHistory {
  id: string;
  user_id: string;
  skill_category: string;
  previous_points: number;
  decay_amount: number;
  new_points: number;
  decay_reason: string;
  created_at: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate days since last activity
 */
function getDaysSinceLastActivity(lastActivity: string | null): number {
  if (!lastActivity) {
    return 999; // Very high number for users with no activity
  }
  
  const lastActivityDate = new Date(lastActivity);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastActivityDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate decay amount based on current points
 */
function calculateDecayAmount(currentPoints: number): number {
  if (currentPoints < DECAY_CONFIG.MIN_POINTS_FOR_DECAY) {
    return 0; // No decay for users with low points
  }
  
  const decayAmount = Math.floor(currentPoints * (DECAY_CONFIG.QUARTERLY_PERCENTAGE / 100));
  return Math.max(0, decayAmount); // Ensure non-negative
}

/**
 * Check if user has activity in specific skill category
 */
async function hasRecentActivityInSkill(
  userId: string, 
  skillCategory: string, 
  daysThreshold: number = DECAY_CONFIG.ACTIVITY_THRESHOLD_DAYS
): Promise<boolean> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

  // Check for recent submissions in this skill category
  const { data: recentSubmissions, error: submissionsError } = await supabaseAdmin
    .from('submissions')
    .select('id')
    .eq('user_id', userId)
    .gte('submitted_at', cutoffDate.toISOString())
    .eq('tasks.skill_category', skillCategory)
    .limit(1);

  if (submissionsError) {
    logger.error('❌ Error checking recent activity:', { error: submissionsError.message });
    return false;
  }

  return (recentSubmissions?.length || 0) > 0;
}

// ============================================================================
// DECAY PROCESSING
// ============================================================================

/**
 * Process point decay for a single user
 */
export async function processUserDecay(userId: string): Promise<{
  success: boolean;
  results?: DecayResult[];
  error?: string;
}> {
  try {
    // Get user's current points and skills
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        id, total_points, primary_skill, secondary_skills, last_activity
      `)
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return { success: false, error: 'User not found' };
    }

    const results: DecayResult[] = [];
    const userSkills = [user.primary_skill, ...(user.secondary_skills || [])].filter(Boolean);

    // Check each skill category for decay
    for (const skillCategory of userSkills) {
      const hasActivity = await hasRecentActivityInSkill(userId, skillCategory);
      
      if (!hasActivity) {
        const decayAmount = calculateDecayAmount(user.total_points);
        
        if (decayAmount > 0) {
          const newPoints = Math.max(0, user.total_points - decayAmount);
          
          results.push({
            userId,
            previousPoints: user.total_points,
            decayAmount,
            newPoints,
            skillCategory,
            lastActivity: new Date(user.last_activity || ''),
            decayReason: `No activity in ${skillCategory} for ${DECAY_CONFIG.ACTIVITY_THRESHOLD_DAYS} days`,
          });
        }
      }
    }

    // Apply decay if any results
    if (results.length > 0) {
      const totalDecay = results.reduce((sum, result) => sum + result.decayAmount, 0);
      const newTotalPoints = Math.max(0, user.total_points - totalDecay);

      // Update user's total points
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ total_points: newTotalPoints })
        .eq('id', userId);

      if (updateError) {
        throw new Error('Failed to update user points');
      }

      // Log decay history
      for (const result of results) {
        await supabaseAdmin
          .from('point_decay_history')
          .insert({
            user_id: userId,
            skill_category: result.skillCategory,
            previous_points: result.previousPoints,
            decay_amount: result.decayAmount,
            new_points: result.newPoints,
            decay_reason: result.decayReason,
          });
      }

      logger.info('✅ Point decay processed', {
        userId,
        totalDecay,
        previousPoints: user.total_points,
        newPoints: newTotalPoints,
        skillCategories: results.map(r => r.skillCategory),
      });
    }

    return { success: true, results };

  } catch (error) {
    logger.error('❌ User decay processing error:', { 
      userId, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Process point decay for all users
 */
export async function processAllUsersDecay(): Promise<{
  success: boolean;
  processed: number;
  totalDecay: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let processed = 0;
  let totalDecay = 0;

  try {
    // Get all users with points above minimum threshold
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, total_points')
      .gte('total_points', DECAY_CONFIG.MIN_POINTS_FOR_DECAY)
      .eq('is_suspended', false);

    if (usersError) {
      throw new Error('Failed to fetch users');
    }

    // Process decay for each user
    for (const user of users || []) {
      const result = await processUserDecay(user.id);
      
      if (result.success && result.results) {
        processed++;
        const userDecay = result.results.reduce((sum, r) => sum + r.decayAmount, 0);
        totalDecay += userDecay;
      } else {
        errors.push(`User ${user.id}: ${result.error}`);
      }
    }

    logger.info('✅ Bulk decay processing completed', {
      processed,
      totalDecay,
      errorCount: errors.length,
    });

    return { success: true, processed, totalDecay, errors };

  } catch (error) {
    logger.error('❌ Bulk decay processing error:', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return { 
      success: false, 
      processed, 
      totalDecay, 
      errors: [error instanceof Error ? error.message : 'Unknown error'] 
    };
  }
}

// ============================================================================
// DECAY HISTORY
// ============================================================================

/**
 * Get decay history for a user
 */
export async function getUserDecayHistory(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{
  success: boolean;
  history?: DecayHistory[];
  total?: number;
  error?: string;
}> {
  try {
    // Get decay history
    const { data: history, error: historyError } = await supabaseAdmin
      .from('point_decay_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (historyError) {
      throw new Error('Failed to fetch decay history');
    }

    // Get total count
    const { count: total } = await supabaseAdmin
      .from('point_decay_history')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    return { 
      success: true, 
      history: history || [], 
      total: total || 0 
    };

  } catch (error) {
    logger.error('❌ Decay history error:', { 
      userId, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get decay statistics for admin dashboard
 */
export async function getDecayStatistics(): Promise<{
  success: boolean;
  stats?: {
    totalDecayThisQuarter: number;
    usersAffected: number;
    averageDecayPerUser: number;
    topDecayCategories: Array<{ category: string; totalDecay: number }>;
  };
  error?: string;
}> {
  try {
    const quarterStart = new Date();
    quarterStart.setMonth(quarterStart.getMonth() - 3);

    // Get total decay this quarter
    const { data: quarterlyDecay, error: decayError } = await supabaseAdmin
      .from('point_decay_history')
      .select('decay_amount, skill_category')
      .gte('created_at', quarterStart.toISOString());

    if (decayError) {
      throw new Error('Failed to fetch quarterly decay data');
    }

    const totalDecay = quarterlyDecay?.reduce((sum, record) => sum + record.decay_amount, 0) || 0;
    const uniqueUsers = new Set(quarterlyDecay?.map((record: any) => record.user_id) || []).size;
    const averageDecay = uniqueUsers > 0 ? totalDecay / uniqueUsers : 0;

    // Calculate top decay categories
    const categoryDecay: Record<string, number> = {};
    quarterlyDecay?.forEach(record => {
      categoryDecay[record.skill_category] = (categoryDecay[record.skill_category] || 0) + record.decay_amount;
    });

    const topCategories = Object.entries(categoryDecay)
      .map(([category, totalDecay]) => ({ category, totalDecay }))
      .sort((a, b) => b.totalDecay - a.totalDecay)
      .slice(0, 5);

    return {
      success: true,
      stats: {
        totalDecayThisQuarter: totalDecay,
        usersAffected: uniqueUsers,
        averageDecayPerUser: Math.round(averageDecay),
        topDecayCategories: topCategories,
      },
    };

  } catch (error) {
    logger.error('❌ Decay statistics error:', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// SCHEDULED DECAY
// ============================================================================

/**
 * Check if it's time to run quarterly decay
 */
export async function shouldRunQuarterlyDecay(): Promise<{
  shouldRun: boolean;
  lastRun?: Date;
  nextRun?: Date;
}> {
  try {
    // Get last decay run
    const { data: lastRun, error: lastRunError } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', 'last_decay_run')
      .single();

    if (lastRunError && lastRunError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for first run
      throw new Error('Failed to check last decay run');
    }

    const lastRunDate = lastRun ? new Date(lastRun.value) : null;
    const now = new Date();

    if (!lastRunDate) {
      // First run - should run
      return { shouldRun: true };
    }

    const daysSinceLastRun = Math.floor((now.getTime() - lastRunDate.getTime()) / (1000 * 60 * 60 * 24));
    const shouldRun = daysSinceLastRun >= DECAY_CONFIG.DECAY_INTERVAL_DAYS;

    const nextRun = new Date(lastRunDate);
    nextRun.setDate(nextRun.getDate() + DECAY_CONFIG.DECAY_INTERVAL_DAYS);

    return { shouldRun, lastRun: lastRunDate, nextRun };

  } catch (error) {
    logger.error('❌ Decay schedule check error:', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return { shouldRun: false };
  }
}

/**
 * Mark decay run as completed
 */
async function markDecayRunCompleted(): Promise<void> {
  try {
    const now = new Date().toISOString();

    // Upsert the last run timestamp
    await supabaseAdmin
      .from('system_settings')
      .upsert({
        key: 'last_decay_run',
        value: now,
        updated_at: now,
      });

    logger.info('✅ Decay run marked as completed', { timestamp: now });

  } catch (error) {
    logger.error('❌ Failed to mark decay run completed:', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

/**
 * Run scheduled quarterly decay
 */
export async function runScheduledDecay(): Promise<{
  success: boolean;
  ran: boolean;
  results?: {
    processed: number;
    totalDecay: number;
    errors: string[];
  };
  error?: string;
}> {
  try {
    const scheduleCheck = await shouldRunQuarterlyDecay();
    
    if (!scheduleCheck.shouldRun) {
      return { 
        success: true, 
        ran: false,
        results: {
          processed: 0,
          totalDecay: 0,
          errors: [],
        },
      };
    }

    // Run the decay process
    const results = await processAllUsersDecay();
    
    if (results.success) {
      await markDecayRunCompleted();
    }

    return { 
      success: results.success, 
      ran: true, 
      results: results.success ? {
        processed: results.processed,
        totalDecay: results.totalDecay,
        errors: results.errors,
      } : undefined,
      error: results.success ? undefined : results.errors.join(', '),
    };

  } catch (error) {
    logger.error('❌ Scheduled decay error:', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return { 
      success: false, 
      ran: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  DECAY_CONFIG,
  processUserDecay,
  processAllUsersDecay,
  getUserDecayHistory,
  getDecayStatistics,
  runScheduledDecay,
  shouldRunQuarterlyDecay,
};
