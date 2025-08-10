export interface FeedTask {
  id: string;
  title: string;
  description: string;
  type: 'arena' | 'course' | 'challenge';
  skill_area: string;
  points: number;
  xp_value: number;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in minutes
  relevance_score: number; // AI-calculated relevance (0-100)
  relevance_reason: string; // AI explanation for why this task is recommended
  created_at: string;
  is_active: boolean;
  tags?: string[];
  requirements?: {
    min_rank?: string;
    skills?: string[];
  };
}

export interface FeedResponse {
  success: boolean;
  data: {
    tasks: FeedTask[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasNextPage: boolean;
    };
    metadata: {
      user_rank: string;
      skills: string[];
      total_recommendations: number;
      generated_at: string;
    };
  };
  message?: string;
  timestamp: string;
}

export interface FeedFilters {
  skills?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  type?: 'arena' | 'course' | 'challenge';
  min_points?: number;
  max_duration?: number;
}

export interface UseFeedReturn {
  tasks: FeedTask[];
  loading: boolean;
  error: string | null;
  hasNextPage: boolean;
  loadMore: () => void;
  discardTask: (taskId: string) => void;
  refresh: () => void;
  filters: FeedFilters;
  updateFilters: (filters: Partial<FeedFilters>) => void;
}

export interface TaskCardProps {
  task: FeedTask;
  onDiscard: (taskId: string) => void;
  onAccept: (taskId: string) => void;
  isDiscarding?: boolean;
}

export interface WhyThisChipProps {
  reason: string;
  relevanceScore: number;
  skillArea: string;
}
