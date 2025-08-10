import React from 'react';
import UserDashboard from './UserDashboard';
import type { UserDashboardProps } from '../types';

/**
 * Dashboard page component that serves as the main user dashboard route.
 * This is the entry point for the user's rank progression and activity overview.
 *
 * Route: /dashboard
 * Features:
 * - User avatar and rank display
 * - Progress ring showing advancement to next rank
 * - Recent activity table with submission status
 * - Unlockable features carousel
 * - Streak banner for active users
 */
export default function Dashboard(props: UserDashboardProps) {
  return <UserDashboard {...props} />;
}
