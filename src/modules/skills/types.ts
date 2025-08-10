export interface SkillArea {
  slug: string;
  name: string;
  icon: string;
  tagline: string;
  color: string;
  description: string;
}

export interface SkillTask {
  id: string;
  title: string;
  description: string;
  skill_area: string;
  points_awarded: number;
  score: number;
  status: 'pending' | 'scored' | 'flagged';
  submitted_at: string;
  scored_at?: string;
  feedback?: string;
  breakdown?: string;
}

export interface SkillStats {
  totalTasks: number;
  averagePoints: number;
  totalXP: number;
  completionRate: number;
  averageScore: number;
  bestScore: number;
  lastActivity: string;
  streakDays: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  skillArea: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: {
    tasksCompleted: number;
    averageScore: number;
    totalXP: number;
  };
}

export interface XPProgress {
  current: number;
  total: number;
  tier: string;
  nextTier: string;
  progressPercentage: number;
}

export interface HeatmapData {
  date: string;
  count: number;
}

export interface SkillData {
  skill: SkillArea;
  stats: SkillStats;
  tasks: SkillTask[];
  badges: Badge[];
  xpProgress: XPProgress;
  heatmapData: HeatmapData[];
}
