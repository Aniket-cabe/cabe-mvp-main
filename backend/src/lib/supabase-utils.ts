import { withConnection, executeWithRetry } from '../../db';
import logger from '../utils/logger';

// Types for our database tables
export interface User {
  id: string;
  email: string;
  points: number;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  skill_area: string | null;
  created_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  task_id: string;
  status: string;
  score: number | null;
  submitted_at: string;
}

// Result type for database operations
export interface DbResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Create a new user with default points
 * @param email - User's email address
 * @returns Promise<DbResult<User>> - Success result with user data or error
 */
export async function createUser(email: string): Promise<DbResult<User>> {
  try {
    const data = await executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('users')
        .insert({ email })
        .select()
        .single();

      if (error) throw error;
      return data;
    });

    logger.info(`✅ User created successfully: ${email}`);
    return {
      success: true,
      data: data as User,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error occurred';
    logger.error('Error creating user:', err);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Create a new task
 * @param title - Task title
 * @param description - Task description
 * @param skill_area - Skill area for the task
 * @returns Promise<DbResult<Task>> - Success result with task data or error
 */
export async function createTask(
  title: string,
  description: string,
  skill_area: string
): Promise<DbResult<Task>> {
  try {
    const data = await executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('tasks')
        .insert({ title, description, skill_area })
        .select()
        .single();

      if (error) throw error;
      return data;
    });

    logger.info(`✅ Task created successfully: ${title}`);
    return {
      success: true,
      data: data as Task,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error occurred';
    logger.error('Error creating task:', err);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Create a new submission with default status "pending" and score null
 * @param user_id - User ID
 * @param task_id - Task ID
 * @returns Promise<DbResult<Submission>> - Success result with submission data or error
 */
export async function createSubmission(
  user_id: string,
  task_id: string
): Promise<DbResult<Submission>> {
  try {
    const data = await executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('submissions')
        .insert({
          user_id,
          task_id,
          status: 'pending',
          score: null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    });

    logger.info(
      `✅ Submission created successfully: User ${user_id} -> Task ${task_id}`
    );
    return {
      success: true,
      data: data as Submission,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error occurred';
    logger.error('Error creating submission:', err);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get all users
 * @returns Promise<DbResult<User[]>> - Success result with users array or error
 */
export async function getUsers(): Promise<DbResult<User[]>> {
  try {
    const data = await executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    });

    return {
      success: true,
      data: data as User[],
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error occurred';
    logger.error('Error getting users:', err);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get all tasks
 * @returns Promise<DbResult<Task[]>> - Success result with tasks array or error
 */
export async function getTasks(): Promise<DbResult<Task[]>> {
  try {
    const data = await executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    });

    return {
      success: true,
      data: data as Task[],
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error occurred';
    logger.error('Error getting tasks:', err);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Update submission status and score
 * @param submission_id - Submission ID
 * @param status - New status
 * @param score - New score
 * @returns Promise<DbResult<Submission>> - Success result with updated submission or error
 */
export async function updateSubmission(
  submission_id: string,
  status: string,
  score?: number
): Promise<DbResult<Submission>> {
  try {
    const data = await executeWithRetry(async (client) => {
      const updateData: Partial<Submission> = { status };
      if (score !== undefined) {
        updateData.score = score;
      }

      const { data, error } = await client
        .from('submissions')
        .update(updateData)
        .eq('id', submission_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    });

    logger.info(`✅ Submission updated successfully: ${submission_id}`);
    return {
      success: true,
      data: data as Submission,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error occurred';
    logger.error('Error updating submission:', err);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Export all functions as default for convenience
export default {
  createUser,
  createTask,
  createSubmission,
  getUsers,
  getTasks,
  updateSubmission,
};
