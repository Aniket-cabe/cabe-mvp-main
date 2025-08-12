import { useState, useEffect } from 'react';
import type {
  SkillData,
  SkillArea,
  SkillTask,
  Badge,
  HeatmapData,
} from '../types';

// Skill area definitions - Updated to new skill names
const SKILL_AREAS: Record<string, SkillArea> = {
  'ai-ml': {
    slug: 'ai-ml',
    name: 'AI / Machine Learning',
    icon: '🤖',
    tagline: 'Teaching machines to think',
    color: 'violet-500',
    description: 'Machine learning, artificial intelligence, and neural networks',
  },
  'cloud-devops': {
    slug: 'cloud-devops',
    name: 'Cloud Computing & DevOps',
    icon: '☁️',
    tagline: 'Building scalable infrastructure',
    color: 'blue-500',
    description: 'Cloud platforms, DevOps practices, and infrastructure automation',
  },
  'data-analytics': {
    slug: 'data-analytics',
    name: 'Data Science & Analytics',
    icon: '📊',
    tagline: 'Turning data into insights',
    color: 'emerald-500',
    description: 'Data analysis, statistics, and business intelligence',
  },
  'fullstack-dev': {
    slug: 'fullstack-dev',
    name: 'Full-Stack Software Development',
    icon: '💻',
    tagline: 'Building complete digital solutions',
    color: 'purple-500',
    description: 'Frontend, backend, and full-stack development',
  },
};

// Mock task data for fallback - Updated with new skill areas
const MOCK_TASKS: SkillTask[] = [
  {
    id: 'task-1',
    title: 'Build a Machine Learning Model',
    description: 'Create a predictive model using Python and scikit-learn',
    skill_area: 'ai-ml',
    points_awarded: 300,
    score: 88,
    status: 'scored',
    submitted_at: '2024-01-15T10:30:00Z',
    scored_at: '2024-01-15T14:20:00Z',
    feedback:
      'Excellent model performance and code quality. Consider feature engineering improvements.',
    breakdown: 'Model Accuracy: 90, Code Quality: 85, Documentation: 88',
  },
  {
    id: 'task-2',
    title: 'Deploy Application to Cloud',
    description: 'Set up CI/CD pipeline and deploy to AWS/Azure/GCP',
    skill_area: 'cloud-devops',
    points_awarded: 250,
    score: 92,
    status: 'scored',
    submitted_at: '2024-01-12T09:15:00Z',
    scored_at: '2024-01-12T16:45:00Z',
    feedback:
      'Great infrastructure setup and automation. Well documented deployment process.',
    breakdown: 'Infrastructure: 95, Automation: 90, Security: 92',
  },
  {
    id: 'task-3',
    title: 'Data Analysis Dashboard',
    description: 'Create interactive dashboards with data visualization',
    skill_area: 'data-analytics',
    points_awarded: 200,
    score: 85,
    status: 'scored',
    submitted_at: '2024-01-10T11:00:00Z',
    scored_at: '2024-01-11T10:30:00Z',
    feedback: 'Good data insights and visualization. Consider adding more interactive features.',
    breakdown: 'Analysis: 85, Visualization: 85, Insights: 85',
  },
  {
    id: 'task-4',
    title: 'Full-Stack E-commerce Platform',
    description: 'Build complete online store with React frontend and Node.js backend',
    skill_area: 'fullstack-dev',
    points_awarded: 400,
    score: 90,
    status: 'scored',
    submitted_at: '2024-01-08T14:20:00Z',
    scored_at: '2024-01-09T09:15:00Z',
    feedback:
      'Excellent full-stack implementation. Great user experience and code architecture.',
    breakdown: 'Frontend: 90, Backend: 90, Integration: 90',
  },
  {
    id: 'task-5',
    title: 'Neural Network Implementation',
    description: 'Build and train a deep learning model for image classification',
    skill_area: 'ai-ml',
    points_awarded: 350,
    score: 95,
    status: 'scored',
    submitted_at: '2024-01-05T13:45:00Z',
    scored_at: '2024-01-06T11:20:00Z',
    feedback: 'Exceptional model performance and implementation. Well optimized training process.',
    breakdown: 'Model Architecture: 95, Training: 95, Performance: 95',
  },
];

// Mock badge data - Updated with new skill areas
const MOCK_BADGES: Badge[] = [
  {
    id: 'badge-1',
    name: 'First Steps',
    description: 'Complete your first task in this skill area',
    icon: '🌟',
    skillArea: 'ai-ml',
    unlockedAt: '2024-01-15T10:30:00Z',
    rarity: 'common',
    requirements: { tasksCompleted: 1, averageScore: 0, totalXP: 0 },
  },
  {
    id: 'badge-2',
    name: 'Consistent Performer',
    description: 'Maintain an average score above 80%',
    icon: '🎯',
    skillArea: 'cloud-devops',
    unlockedAt: '2024-01-15T14:20:00Z',
    rarity: 'rare',
    requirements: { tasksCompleted: 2, averageScore: 80, totalXP: 400 },
  },
  {
    id: 'badge-3',
    name: 'Skill Master',
    description: 'Complete 10 tasks with excellence',
    icon: '👑',
    skillArea: 'fullstack-dev',
    unlockedAt: '2024-01-05T13:45:00Z',
    rarity: 'epic',
    requirements: { tasksCompleted: 10, averageScore: 85, totalXP: 1500 },
  },
];

// Generate mock heatmap data for the last 90 days
const generateHeatmapData = (skillSlug: string): HeatmapData[] => {
  const data: HeatmapData[] = [];
  const today = new Date();

  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate random activity (more realistic pattern)
    let count = 0;
    if (Math.random() > 0.7) {
      // 30% chance of activity
      count = Math.floor(Math.random() * 3) + 1; // 1-3 submissions
    }

    data.push({
      date: date.toISOString().split('T')[0],
      count,
    });
  }

  return data;
};

interface UseSkillDataReturn {
  data: SkillData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSkillData(skillSlug: string): UseSkillDataReturn {
  const [data, setData] = useState<SkillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkillData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate skill slug
      if (!SKILL_AREAS[skillSlug]) {
        throw new Error(`Invalid skill area: ${skillSlug}`);
      }

      // Try to fetch from API first
      if (typeof window !== 'undefined') {
        try {
          const response = await fetch(
            `/api/arena/user-progress?skill=${skillSlug}`
          );
          if (response.ok) {
            const apiData = await response.json();
            // Transform API data to match our interface
            // This would need to be implemented based on actual API response
            console.log('API data received:', apiData);
          }
        } catch (apiError) {
          console.log('API not available, using mock data');
        }
      }

      // Filter tasks for this skill area
      const skillTasks = MOCK_TASKS.filter(
        (task) => task.skill_area === skillSlug
      );
      const skillBadges = MOCK_BADGES.filter(
        (badge) => badge.skillArea === skillSlug
      );

      // Calculate stats
      const totalTasks = skillTasks.length;
      const scoredTasks = skillTasks.filter((task) => task.status === 'scored');
      const totalXP = skillTasks.reduce(
        (sum, task) => sum + task.points_awarded,
        0
      );
      const averagePoints =
        totalTasks > 0 ? Math.round(totalXP / totalTasks) : 0;
      const averageScore =
        scoredTasks.length > 0
          ? Math.round(
              scoredTasks.reduce((sum, task) => sum + task.score, 0) /
                scoredTasks.length
            )
          : 0;
      const bestScore =
        scoredTasks.length > 0
          ? Math.max(...scoredTasks.map((task) => task.score))
          : 0;
      const completionRate =
        totalTasks > 0
          ? Math.round((scoredTasks.length / totalTasks) * 100)
          : 0;

      // Calculate XP progress (simplified tier system)
      const xpTiers = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];
      const currentTierIndex = xpTiers.findIndex((tier) => totalXP < tier) - 1;
      const currentTier = currentTierIndex >= 0 ? xpTiers[currentTierIndex] : 0;
      const nextTier = xpTiers[currentTierIndex + 1] || currentTier;
      const progressPercentage =
        nextTier > currentTier
          ? Math.round(
              ((totalXP - currentTier) / (nextTier - currentTier)) * 100
            )
          : 100;

      const skillData: SkillData = {
        skill: SKILL_AREAS[skillSlug],
        stats: {
          totalTasks,
          averagePoints,
          totalXP,
          completionRate,
          averageScore,
          bestScore,
          lastActivity:
            skillTasks.length > 0
              ? skillTasks[0].submitted_at
              : new Date().toISOString(),
          streakDays: Math.floor(Math.random() * 7) + 1, // Mock streak
        },
        tasks: skillTasks,
        badges: skillBadges,
        xpProgress: {
          current: totalXP,
          total: nextTier,
          tier: `Tier ${currentTierIndex + 1}`,
          nextTier: `Tier ${currentTierIndex + 2}`,
          progressPercentage,
        },
        heatmapData: generateHeatmapData(skillSlug),
      };

      setData(skillData);
    } catch (err) {
      console.error('Error fetching skill data:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch skill data'
      );
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchSkillData();
  };

  useEffect(() => {
    if (skillSlug) {
      fetchSkillData();
    }
  }, [skillSlug]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
