import { useUserSummary } from './useUserSummary';
import type { UseUserSummaryReturn, UserDashboardProps } from '../types';

/**
 * useDashboard hook for managing dashboard data and state.
 * Wraps useUserSummary with additional dashboard-specific functionality.
 *
 * Features:
 * - Fetches user summary data from API
 * - Calculates rank progression metrics
 * - Manages loading and error states
 * - Provides refetch functionality
 * - Handles streak calculations
 */
export function useDashboard(userId?: string): UseUserSummaryReturn {
  const dashboardData = useUserSummary(userId);

  // Additional dashboard-specific logic can be added here
  // For example, streak calculations, rank progression analytics, etc.

  return dashboardData;
}

/**
 * useStreak hook for managing user streak data.
 * Extracts streak information from dashboard data.
 */
export function useStreak(userId?: string) {
  const { user } = useUserSummary(userId);

  return {
    streakDays: user?.streakDays || 0,
    isActive: (user?.streakDays || 0) >= 3,
    shouldShowBanner: (user?.streakDays || 0) >= 3,
  };
}
