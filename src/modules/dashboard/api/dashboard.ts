import type {
  UserSummary,
  RecentSubmission,
  UnlockableFeature,
} from '../types';

/**
 * API functions for the dashboard module
 * Handles communication with the backend for user dashboard data
 */

/**
 * Fetch user summary data from the backend
 *
 * @param userId - Optional user ID (uses current user if not provided)
 * @returns Promise with user summary data
 */
export async function fetchUserSummary(userId?: string): Promise<{
  user: UserSummary;
  recentSubmissions: RecentSubmission[];
  unlockables: UnlockableFeature[];
}> {
  try {
    const url = userId ? `/api/user/${userId}/summary` : '/api/user/summary';
    const response = await fetch(url, {
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user summary:', error);
    throw new Error('Failed to load user dashboard data');
  }
}

/**
 * Update user profile information
 *
 * @param updates - Profile updates to apply
 * @returns Promise with updated user data
 */
export async function updateUserProfile(updates: {
  name?: string;
  avatar?: string;
  preferences?: Record<string, any>;
}): Promise<UserSummary> {
  try {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update profile');
  }
}

/**
 * Get user's rank progression history
 *
 * @param userId - Optional user ID
 * @returns Promise with rank history data
 */
export async function getRankHistory(userId?: string): Promise<{
  ranks: Array<{
    rank: string;
    achievedAt: string;
    points: number;
  }>;
  totalRanks: number;
}> {
  try {
    const url = userId
      ? `/api/user/${userId}/rank-history`
      : '/api/user/rank-history';
    const response = await fetch(url, {
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
    console.error('Error fetching rank history:', error);
    throw new Error('Failed to load rank history');
  }
}

/**
 * Get user's activity statistics
 *
 * @param userId - Optional user ID
 * @param period - Time period for stats (week, month, year)
 * @returns Promise with activity statistics
 */
export async function getActivityStats(
  userId?: string,
  period: 'week' | 'month' | 'year' = 'month'
): Promise<{
  totalSubmissions: number;
  approvedSubmissions: number;
  totalPoints: number;
  averageScore: number;
  streakDays: number;
  period: string;
}> {
  try {
    const url = userId
      ? `/api/user/${userId}/activity-stats?period=${period}`
      : `/api/user/activity-stats?period=${period}`;

    const response = await fetch(url, {
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
    console.error('Error fetching activity stats:', error);
    throw new Error('Failed to load activity statistics');
  }
}

/**
 * Get upcoming unlockable features for the user
 *
 * @param userId - Optional user ID
 * @returns Promise with unlockable features
 */
export async function getUpcomingUnlocks(
  userId?: string
): Promise<UnlockableFeature[]> {
  try {
    const url = userId ? `/api/user/${userId}/unlocks` : '/api/user/unlocks';
    const response = await fetch(url, {
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
    console.error('Error fetching upcoming unlocks:', error);
    throw new Error('Failed to load unlockable features');
  }
}

/**
 * Mark a feature as viewed by the user
 *
 * @param featureId - ID of the feature to mark as viewed
 * @returns Promise indicating success
 */
export async function markFeatureViewed(featureId: string): Promise<void> {
  try {
    const response = await fetch('/api/user/features/viewed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ featureId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error marking feature as viewed:', error);
    // Don't throw error for this as it shouldn't break the user experience
  }
}
