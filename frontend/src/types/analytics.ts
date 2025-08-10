export interface UserAnalyticsData {
  heatmapData: Array<{
    date: string;
    count: number;
  }>;
  skillRadarData: Array<{
    skill: string;
    points: number;
    fullMark: number;
  }>;
  activityBarData: Array<{
    category: string;
    tasks: number;
    learning: number;
    gigs: number;
  }>;
  exportData: Array<{
    date: string;
    taskType: string;
    points: number;
    skill: string;
    status: string;
  }>;
  summary: {
    totalPoints: number;
    tasksCompleted: number;
    streak: number;
    topSkill: string;
  };
}

export interface AdminAnalyticsData {
  kpiData: {
    dailyAudits: {
      value: number;
      change: number;
      trend: 'up' | 'down' | 'stable';
    };
    avgReviewTime: {
      value: number; // in minutes
      change: number;
      trend: 'up' | 'down' | 'stable';
    };
    criticalDeviationRate: {
      value: number; // percentage
      change: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
  topReviewers: Array<{
    id: string;
    name: string;
    reviewedCount: number;
    avgLatency: number; // in hours
    efficiency: number; // percentage
  }>;
  categoryDistribution: Array<{
    category: string;
    value: number;
    color: string;
  }>;
  platformStats: {
    totalUsers: number;
    activeReviewers: number;
    pendingReviews: number;
    completionRate: number;
  };
}

export interface AnalyticsMetrics {
  user: UserAnalyticsData;
  admin: AdminAnalyticsData;
  lastUpdated: string;
}

export interface UseAnalyticsReturn {
  data: AnalyticsMetrics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  exportUserData: (format: 'csv' | 'json') => void;
}
