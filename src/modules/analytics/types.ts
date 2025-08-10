// Analytics Module Types

export interface AnalyticsData {
  userData: UserAnalyticsData;
  adminData: AdminAnalyticsData;
}

// User Analytics Types
export interface UserAnalyticsData {
  submissionHeatmap: SubmissionHeatmapData[];
  skillRadar: SkillRadarData[];
  taskTypeBar: TaskTypeBarData[];
  exportData: ExportData[];
}

export interface SubmissionHeatmapData {
  date: string;
  count: number;
}

export interface SkillRadarData {
  skill: string;
  points: number;
  maxPoints: number;
}

export interface TaskTypeBarData {
  taskType: string;
  totalPoints: number;
  count: number;
}

export interface ExportData {
  date: string;
  taskType: string;
  points: number;
  skill: string;
}

// Admin Analytics Types
export interface AdminAnalyticsData {
  kpiCards: KPICardData[];
  topReviewers: TopReviewerData[];
  taskDistribution: TaskDistributionData[];
  auditData: AuditData[];
}

export interface KPICardData {
  title: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
}

export interface TopReviewerData {
  name: string;
  reviewed: number;
  avgLatency: number; // in minutes
  rank: string;
}

export interface TaskDistributionData {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AuditData {
  id: string;
  reviewer: string;
  taskType: string;
  status: 'approved' | 'rejected' | 'pending';
  reviewTime: number; // in minutes
  timestamp: string;
  deviation: number;
}

// Hook Return Types
export interface UseAnalyticsReturn {
  userData: UserAnalyticsData | null;
  adminData: AdminAnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Component Props
export interface SubmissionCalendarProps {
  data: SubmissionHeatmapData[];
  className?: string;
}

export interface SkillRadarChartProps {
  data: SkillRadarData[];
  className?: string;
}

export interface TaskTypeBarChartProps {
  data: TaskTypeBarData[];
  className?: string;
}

export interface KPICardsProps {
  data: KPICardData[];
  className?: string;
}

export interface TopReviewersTableProps {
  data: TopReviewerData[];
  className?: string;
}

export interface TaskDistributionPieChartProps {
  data: TaskDistributionData[];
  className?: string;
}

export interface ExportButtonProps {
  data: ExportData[] | AuditData[];
  filename: string;
  format: 'csv' | 'json';
  className?: string;
}
