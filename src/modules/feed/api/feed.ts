import type { FeedResponse, FeedFilters } from '../types';

interface FeedApiOptions {
  rank?: string;
  skills?: string[];
  page?: number;
  limit?: number;
  filters?: FeedFilters;
}

/**
 * API functions for the feed module
 * Handles communication with the backend AI recommendation system
 */

/**
 * Fetch AI-recommended tasks from the backend
 *
 * @param options - API options including rank, skills, pagination, and filters
 * @returns Promise with feed response data
 */
export async function fetchFeedTasks(
  options: FeedApiOptions = {}
): Promise<FeedResponse> {
  const {
    rank = 'bronze',
    skills = [],
    page = 1,
    limit = 10,
    filters = {},
  } = options;

  // Build query parameters
  const params = new URLSearchParams({
    rank,
    page: page.toString(),
    limit: limit.toString(),
    ...(skills.length > 0 && { skills: skills.join(',') }),
    ...(filters.difficulty && { difficulty: filters.difficulty }),
    ...(filters.type && { type: filters.type }),
    ...(filters.min_points && { min_points: filters.min_points.toString() }),
    ...(filters.max_duration && {
      max_duration: filters.max_duration.toString(),
    }),
  });

  try {
    const response = await fetch(`/api/feed?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
        // 'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: FeedResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching feed tasks:', error);
    throw new Error('Failed to fetch AI recommendations');
  }
}

/**
 * Submit user feedback on task recommendations
 * This helps improve the AI recommendation algorithm
 *
 * @param taskId - ID of the task
 * @param action - User action (accept, discard, skip)
 * @param feedback - Optional user feedback
 */
export async function submitTaskFeedback(
  taskId: string,
  action: 'accept' | 'discard' | 'skip',
  feedback?: string
): Promise<void> {
  try {
    const response = await fetch('/api/feed/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        taskId,
        action,
        feedback,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error submitting task feedback:', error);
    // Don't throw error for feedback submission failures
    // as it shouldn't break the user experience
  }
}

/**
 * Get user's feed preferences and settings
 *
 * @returns Promise with user preferences
 */
export async function getFeedPreferences(): Promise<{
  preferredSkills: string[];
  preferredDifficulty: string;
  preferredTaskTypes: string[];
  dailyGoal: number;
}> {
  try {
    const response = await fetch('/api/feed/preferences', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching feed preferences:', error);
    // Return default preferences on error
    return {
      preferredSkills: [],
      preferredDifficulty: 'medium',
      preferredTaskTypes: ['arena', 'course', 'challenge'],
      dailyGoal: 3,
    };
  }
}

/**
 * Update user's feed preferences
 *
 * @param preferences - New preferences to save
 */
export async function updateFeedPreferences(preferences: {
  preferredSkills?: string[];
  preferredDifficulty?: string;
  preferredTaskTypes?: string[];
  dailyGoal?: number;
}): Promise<void> {
  try {
    const response = await fetch('/api/feed/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating feed preferences:', error);
    throw new Error('Failed to update preferences');
  }
}

/**
 * Get AI explanation for why a specific task was recommended
 *
 * @param taskId - ID of the task
 * @returns Promise with AI explanation
 */
export async function getTaskExplanation(taskId: string): Promise<{
  reason: string;
  relevanceScore: number;
  skillMatch: string[];
  learningPath: string[];
}> {
  try {
    const response = await fetch(`/api/feed/explain/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching task explanation:', error);
    // Return a default explanation on error
    return {
      reason: 'This task matches your skill profile and learning goals.',
      relevanceScore: 75,
      skillMatch: [],
      learningPath: [],
    };
  }
}
