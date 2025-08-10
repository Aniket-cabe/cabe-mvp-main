import { SupabaseClient } from '@supabase/supabase-js';
import { connectionPool, withConnection, getPoolStats } from './pool';
import logger from '../src/utils/logger';

// Re-export pool utilities
export { connectionPool, withConnection, getPoolStats };

// Database operation wrapper with retry logic
export async function executeWithRetry<T>(
  operation: (client: SupabaseClient) => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 100
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withConnection(operation);
    } catch (error) {
      lastError = error as Error;

      // Check if it's a retryable error
      if (isRetryableError(error)) {
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          logger.warn(
            `🔄 Database operation failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`
          );
          await sleep(delay);
          continue;
        }
      }

      // Non-retryable error or max retries reached
      throw error;
    }
  }

  throw new Error(
    `Database operation failed after ${maxRetries} attempts: ${lastError?.message}`
  );
}

// Check if an error is retryable
function isRetryableError(error: any): boolean {
  const retryableErrors = [
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNREFUSED',
    'timeout',
    'network error',
    'connection error',
  ];

  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code?.toLowerCase() || '';

  return retryableErrors.some(
    (retryableError) =>
      errorMessage.includes(retryableError) ||
      errorCode.includes(retryableError)
  );
}

// Utility function for sleep
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// SQL string execution wrapper
export async function executeSQL<T = any>(
  sql: string,
  params: any[] = [],
  maxRetries: number = 3,
  baseDelay: number = 100
): Promise<T> {
  return executeWithRetry(
    async (client) => {
      const { data, error } = await client.rpc('execute_sql', { sql, params });
      if (error) throw error;
      return data;
    },
    maxRetries,
    baseDelay
  );
}

// Optimized query operations
export const db = {
  // User operations
  async getUserById(userId: string) {
    return executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    });
  },

  async getUserByEmail(email: string) {
    return executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      return data;
    });
  },

  async createUser(email: string, points: number = 0) {
    return executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('users')
        .insert({ email, points })
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  },

  async updateUserPoints(userId: string, points: number) {
    return executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('users')
        .update({ points })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  },

  // Task operations
  async getTasks(skillArea?: string, limit: number = 50) {
    return executeWithRetry(async (client) => {
      let query = client
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (skillArea) {
        query = query.eq('skill_area', skillArea);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    });
  },

  async getTaskById(taskId: string) {
    return executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      return data;
    });
  },

  async createTask(title: string, description: string, skillArea: string) {
    return executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('tasks')
        .insert({ title, description, skill_area: skillArea })
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  },

  // Submission operations
  async getSubmissionsByUser(userId: string, limit: number = 20) {
    return executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('submissions')
        .select(
          `
          *,
          tasks (
            id,
            title,
            skill_area
          )
        `
        )
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    });
  },

  async getSubmissionsByStatus(status: string, limit: number = 50) {
    return executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('submissions')
        .select(
          `
          *,
          users (
            id,
            email
          ),
          tasks (
            id,
            title,
            skill_area
          )
        `
        )
        .eq('status', status)
        .order('submitted_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    });
  },

  async createSubmission(userId: string, taskId: string) {
    return executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('submissions')
        .insert({
          user_id: userId,
          task_id: taskId,
          status: 'pending',
          score: null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  },

  async updateSubmission(submissionId: string, status: string, score?: number) {
    return executeWithRetry(async (client) => {
      const updateData: any = { status };
      if (score !== undefined) {
        updateData.score = score;
      }

      const { data, error } = await client
        .from('submissions')
        .update(updateData)
        .eq('id', submissionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  },

  // Analytics operations
  async getUserAnalytics(userId: string) {
    return executeWithRetry(async (client) => {
      // Get user's submission statistics
      const { data: submissions, error: submissionsError } = await client
        .from('submissions')
        .select('status, score, submitted_at, tasks(skill_area)')
        .eq('user_id', userId);

      if (submissionsError) throw submissionsError;

      // Get user's points
      const { data: user, error: userError } = await client
        .from('users')
        .select('points')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      return {
        submissions,
        totalPoints: user.points,
        submissionCount: submissions.length,
      };
    });
  },

  async getAdminAnalytics() {
    return executeWithRetry(async (client) => {
      // Get submission statistics
      const { data: submissions, error: submissionsError } = await client
        .from('submissions')
        .select('status, submitted_at, tasks(skill_area)');

      if (submissionsError) throw submissionsError;

      // Get user statistics
      const { data: users, error: usersError } = await client
        .from('users')
        .select('points, created_at');

      if (usersError) throw usersError;

      return {
        submissions,
        users,
        totalUsers: users.length,
        totalSubmissions: submissions.length,
      };
    });
  },

  // Batch operations for better performance
  async batchUpdateSubmissions(
    updates: Array<{ id: string; status: string; score?: number }>
  ) {
    return executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('submissions')
        .upsert(
          updates.map((update) => ({
            id: update.id,
            status: update.status,
            ...(update.score !== undefined && { score: update.score }),
          }))
        )
        .select();

      if (error) throw error;
      return data;
    });
  },

  // Health check
  async healthCheck() {
    return executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('users')
        .select('count')
        .limit(1);

      if (error) throw error;
      return { status: 'healthy', timestamp: new Date().toISOString() };
    });
  },
};

// Export the optimized database operations
export default db;
