import { useState, useEffect, useCallback } from 'react';
import type {
  UserSummary,
  RecentSubmission,
  UnlockableFeature,
  ProgressData,
  UseUserSummaryReturn,
} from '../types';

// Mock user summary data - Updated with new skill areas
const MOCK_USER_SUMMARY = {
  user: {
    id: 'user-123',
    username: 'johndoe',
    full_name: 'John Doe',
    email: 'john@example.com',
    avatar_url: 'https://via.placeholder.com/150',
    rank: 'Gold',
    total_points: 2850,
    level: 8,
    join_date: '2023-06-15T10:00:00Z',
    last_active: '2024-01-15T14:30:00Z',
  },
  stats: {
    total_tasks_completed: 42,
    total_tasks_submitted: 45,
    average_score: 87,
    completion_rate: 93,
    current_streak: 7,
    longest_streak: 15,
    total_xp_earned: 2850,
    rank_progress: 75,
  },
  skill_progress: [
    {
      skillArea: 'ai-ml',
      name: 'AI / Machine Learning',
      icon: '🤖',
      color: 'violet-500',
      total_points: 850,
      tasks_completed: 12,
      average_score: 89,
      level: 6,
      progress_percentage: 85,
      last_activity: '2024-01-15T10:30:00Z',
    },
    {
      skillArea: 'cloud-devops',
      name: 'Cloud Computing & DevOps',
      icon: '☁️',
      color: 'blue-500',
      total_points: 720,
      tasks_completed: 10,
      average_score: 85,
      level: 5,
      progress_percentage: 72,
      last_activity: '2024-01-14T16:45:00Z',
    },
    {
      skillArea: 'fullstack-dev',
      name: 'Full-Stack Software Development',
      icon: '💻',
      color: 'purple-500',
      total_points: 680,
      tasks_completed: 8,
      average_score: 88,
      level: 4,
      progress_percentage: 68,
      last_activity: '2024-01-13T14:20:00Z',
    },
    {
      skillArea: 'data-analytics',
      name: 'Data Science & Analytics',
      icon: '📊',
      color: 'emerald-500',
      total_points: 600,
      tasks_completed: 12,
      average_score: 86,
      level: 4,
      progress_percentage: 60,
      last_activity: '2024-01-12T11:15:00Z',
    },
  ],
  recent_activity: [
    {
      id: 'activity-1',
      type: 'task_completed',
      title: 'Build Machine Learning Model',
      skill_area: 'ai-ml',
      points_earned: 150,
      score: 92,
      timestamp: '2024-01-15T10:30:00Z',
    },
    {
      id: 'activity-2',
      type: 'task_completed',
      title: 'Deploy Application to Cloud',
      skill_area: 'cloud-devops',
      points_earned: 200,
      score: 88,
      timestamp: '2024-01-14T16:45:00Z',
    },
    {
      id: 'activity-3',
      type: 'task_completed',
      title: 'Create Data Analysis Dashboard',
      skill_area: 'data-analytics',
      points_earned: 120,
      score: 85,
      timestamp: '2024-01-13T14:20:00Z',
    },
    {
      id: 'activity-4',
      type: 'task_completed',
      title: 'Full-Stack E-commerce Platform',
      skill_area: 'fullstack-dev',
      points_earned: 300,
      score: 90,
      timestamp: '2024-01-12T11:15:00Z',
    },
    {
      id: 'activity-5',
      type: 'badge_earned',
      title: 'AI Master Badge',
      skill_area: 'ai-ml',
      points_earned: 50,
      timestamp: '2024-01-11T09:30:00Z',
    },
  ],
  achievements: [
    {
      id: 'achievement-1',
      name: 'First Steps',
      description: 'Complete your first task',
      icon: '🌟',
      unlocked_at: '2023-06-20T10:00:00Z',
      rarity: 'common',
    },
    {
      id: 'achievement-2',
      name: 'Consistent Performer',
      description: 'Maintain 80%+ average score for 10 tasks',
      icon: '🎯',
      unlocked_at: '2023-08-15T14:30:00Z',
      rarity: 'rare',
    },
    {
      id: 'achievement-3',
      name: 'Skill Master',
      description: 'Reach level 5 in any skill area',
      icon: '👑',
      unlocked_at: '2023-10-22T16:45:00Z',
      rarity: 'epic',
    },
  ],
};

const MOCK_RECENT_SUBMISSIONS: RecentSubmission[] = [
  {
    id: 'sub-1',
    taskTitle: 'Design a Modern Landing Page',
    taskType: 'arena',
    skillArea: 'cloud-devops',
    status: 'approved',
    score: 92,
    points: 150,
    submittedAt: '2024-01-15T10:30:00Z',
    reviewedAt: '2024-01-15T14:20:00Z',
  },
  {
    id: 'sub-2',
    taskTitle: 'Build a REST API with Node.js',
    taskType: 'arena',
    skillArea: 'cloud-devops',
    status: 'pending',
    submittedAt: '2024-01-14T16:45:00Z',
  },
  {
    id: 'sub-3',
    taskTitle: 'Create a React Component Library',
    taskType: 'challenge',
    skillArea: 'fullstack-dev',
    status: 'approved',
    score: 88,
    points: 200,
    submittedAt: '2024-01-13T09:15:00Z',
    reviewedAt: '2024-01-13T18:30:00Z',
  },
  {
    id: 'sub-4',
    taskTitle: 'Write Technical Documentation',
    taskType: 'course',
    skillArea: 'writing',
    status: 'rejected',
    score: 65,
    points: 0,
    submittedAt: '2024-01-12T11:20:00Z',
    reviewedAt: '2024-01-12T15:45:00Z',
  },
  {
    id: 'sub-5',
    taskTitle: 'Implement Machine Learning Model',
    taskType: 'arena',
    skillArea: 'ai-ml',
    status: 'approved',
    score: 95,
    points: 250,
    submittedAt: '2024-01-11T13:10:00Z',
    reviewedAt: '2024-01-11T20:15:00Z',
  },
];

const MOCK_UNLOCKABLES: UnlockableFeature[] = [
  {
    id: 'unlock-1',
    name: 'Advanced Analytics Dashboard',
    description:
      'Get detailed insights into your performance with advanced charts and metrics',
    icon: '📊',
    rankRequired: 'Silver',
    pointsRequired: 1000,
    isUnlocked: false,
    category: 'feature',
  },
  {
    id: 'unlock-2',
    name: 'Priority Task Queue',
    description:
      'Jump to the front of the line with priority access to new tasks',
    icon: '⚡',
    rankRequired: 'Silver',
    pointsRequired: 1000,
    isUnlocked: false,
    category: 'perk',
  },
  {
    id: 'unlock-3',
    name: 'Expert Badge',
    description: 'Show off your expertise with a special badge on your profile',
    icon: '🏆',
    rankRequired: 'Silver',
    pointsRequired: 1000,
    isUnlocked: false,
    category: 'badge',
  },
  {
    id: 'unlock-4',
    name: 'Mentorship Program',
    description:
      'Connect with experienced developers for guidance and feedback',
    icon: '👥',
    rankRequired: 'Gold',
    pointsRequired: 2500,
    isUnlocked: false,
    category: 'feature',
  },
  {
    id: 'unlock-5',
    name: 'Custom Profile Themes',
    description: 'Personalize your profile with custom colors and themes',
    icon: '🎨',
    rankRequired: 'Gold',
    pointsRequired: 2500,
    isUnlocked: false,
    category: 'perk',
  },
];

// Rank definitions
const RANK_DEFINITIONS = {
  bronze: {
    name: 'Bronze',
    icon: '🥉',
    color: '#CD7F32',
    minPoints: 0,
    maxPoints: 1000,
  },
  silver: {
    name: 'Silver',
    icon: '🥈',
    color: '#C0C0C0',
    minPoints: 1000,
    maxPoints: 2500,
  },
  gold: {
    name: 'Gold',
    icon: '🥇',
    color: '#FFD700',
    minPoints: 2500,
    maxPoints: 5000,
  },
  platinum: {
    name: 'Platinum',
    icon: '💎',
    color: '#E5E4E2',
    minPoints: 5000,
    maxPoints: 10000,
  },
  diamond: {
    name: 'Diamond',
    icon: '💎',
    color: '#B9F2FF',
    minPoints: 10000,
    maxPoints: Infinity,
  },
};

export function useUserSummary(userId?: string): UseUserSummaryReturn {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<
    RecentSubmission[]
  >([]);
  const [unlockables, setUnlockables] = useState<UnlockableFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate progress data
  const calculateProgress = useCallback(
    (userData: UserSummary): ProgressData => {
      const currentRank =
        RANK_DEFINITIONS[
          userData.currentRank.level as keyof typeof RANK_DEFINITIONS
        ];
      const nextRank =
        userData.currentRank.level === 'diamond'
          ? currentRank
          : RANK_DEFINITIONS[
              getNextRank(
                userData.currentRank.level
              ) as keyof typeof RANK_DEFINITIONS
            ];

      const currentPoints = userData.currentPoints;
      const nextThreshold = nextRank.minPoints;
      const delta = nextThreshold - currentPoints;

      const progressInCurrentRank = currentPoints - currentRank.minPoints;
      const pointsNeededForNextRank =
        nextRank.minPoints - currentRank.minPoints;
      const percentage = Math.min(
        100,
        Math.max(0, (progressInCurrentRank / pointsNeededForNextRank) * 100)
      );

      return {
        current: currentPoints,
        next: nextThreshold,
        percentage: Math.round(percentage),
        delta: Math.max(0, delta),
        rankName: currentRank.name,
        nextRankName: nextRank.name,
      };
    },
    []
  );

  // Get next rank level
  const getNextRank = (currentLevel: string): string => {
    const levels = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const currentIndex = levels.indexOf(currentLevel);
    return currentIndex < levels.length - 1
      ? levels[currentIndex + 1]
      : currentLevel;
  };

  // Fetch user summary data
  const fetchUserSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay

      // In a real implementation, this would be an API call:
      // const response = await fetch(`/api/user/summary${userId ? `?userId=${userId}` : ''}`);
      // const data = await response.json();

      // For now, use mock data
      const userData = MOCK_USER_SUMMARY;
      const submissionsData = MOCK_RECENT_SUBMISSIONS;
      const unlockablesData = MOCK_UNLOCKABLES;

      setUser(userData);
      setRecentSubmissions(submissionsData);
      setUnlockables(unlockablesData);
      setProgress(calculateProgress(userData));
    } catch (err) {
      console.error('Error fetching user summary:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch user data'
      );
    } finally {
      setLoading(false);
    }
  }, [userId, calculateProgress]);

  // Refetch data
  const refetch = useCallback(() => {
    fetchUserSummary();
  }, [fetchUserSummary]);

  // Initial load
  useEffect(() => {
    fetchUserSummary();
  }, [fetchUserSummary]);

  return {
    user,
    progress,
    recentSubmissions,
    unlockables,
    loading,
    error,
    refetch,
  };
}
