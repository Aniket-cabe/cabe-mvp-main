export interface UserSummary {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  currentRank: UserRank;
  currentPoints: number;
  nextThreshold: number;
  totalPoints: number;
  streakDays: number;
  joinDate: string;
  lastActive: string;
}

export interface UserRank {
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  name: string;
  icon: string;
  color: string;
  minPoints: number;
  maxPoints: number;
  features: string[];
}

export interface RecentSubmission {
  id: string;
  taskTitle: string;
  taskType: 'arena' | 'course' | 'challenge';
  skillArea: string;
  status: 'pending' | 'approved' | 'rejected';
  score?: number;
  points?: number;
  submittedAt: string;
  reviewedAt?: string;
}

export interface UnlockableFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  rankRequired: string;
  pointsRequired: number;
  isUnlocked: boolean;
  category: 'feature' | 'badge' | 'perk';
}

export interface ProgressData {
  current: number;
  next: number;
  percentage: number;
  delta: number;
  rankName: string;
  nextRankName: string;
}

export interface UseUserSummaryReturn {
  user: UserSummary | null;
  progress: ProgressData | null;
  recentSubmissions: RecentSubmission[];
  unlockables: UnlockableFeature[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export interface UnlockCarouselProps {
  unlockables: UnlockableFeature[];
  autoSlide?: boolean;
  slideInterval?: number;
}

export interface ActivityTableProps {
  submissions: RecentSubmission[];
  maxRows?: number;
}

export interface UserDashboardProps {
  userId?: string;
}
