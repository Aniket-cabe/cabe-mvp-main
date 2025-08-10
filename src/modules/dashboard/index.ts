// Pages
export { default as UserDashboard } from './pages/UserDashboard';
export { default as Dashboard } from './pages/Dashboard';

// Components
export { default as ProgressRing } from './components/ProgressRing';
export { default as RankRing } from './components/RankRing';
export { default as ActivityTable } from './components/ActivityTable';
export { default as RecentActivity } from './components/RecentActivity';
export { default as UnlockCarousel } from './components/UnlockCarousel';
export { default as DashboardDemo } from './components/DashboardDemo';

// Hooks
export { useUserSummary } from './hooks/useUserSummary';
export { useDashboard, useStreak } from './hooks/useDashboard';

// API
export * from './api/dashboard';

// Types
export type {
  UserSummary,
  UserRank,
  RecentSubmission,
  UnlockableFeature,
  ProgressData,
  UseUserSummaryReturn,
  ProgressRingProps,
  UnlockCarouselProps,
  ActivityTableProps,
  UserDashboardProps,
} from './types';
