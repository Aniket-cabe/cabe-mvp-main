import { useState, useEffect } from 'react';
import type {
  SkillData,
  SkillArea,
  SkillTask,
  Badge,
  HeatmapData,
} from '../types';

// Skill area definitions
const SKILL_AREAS: Record<string, SkillArea> = {
  design: {
    slug: 'design',
    name: 'Design',
    icon: '🎨',
    tagline: 'Where creativity meets functionality',
    color: 'pink-500',
    description: 'UI/UX design, graphic design, and visual communication',
  },
  web: {
    slug: 'web',
    name: 'Web Development',
    icon: '💻',
    tagline: 'Building the digital world, one line at a time',
    color: 'emerald-500',
    description: 'Frontend, backend, and full-stack web development',
  },
  ai: {
    slug: 'ai',
    name: 'Artificial Intelligence',
    icon: '🤖',
    tagline: 'Teaching machines to think',
    color: 'violet-500',
    description: 'Machine learning, data science, and AI applications',
  },
  writing: {
    slug: 'writing',
    name: 'Content Writing',
    icon: '✍️',
    tagline: 'Words that move and inspire',
    color: 'amber-500',
    description: 'Copywriting, technical writing, and content creation',
  },
};

// Mock task data for fallback
const MOCK_TASKS: SkillTask[] = [
  {
    id: 'task-1',
    title: 'Design a Modern Landing Page',
    description: 'Create a responsive landing page design for a SaaS product',
    skill_area: 'design',
    points_awarded: 150,
    score: 85,
    status: 'scored',
    submitted_at: '2024-01-15T10:30:00Z',
    scored_at: '2024-01-15T14:20:00Z',
    feedback:
      'Excellent use of whitespace and typography. Consider improving mobile responsiveness.',
    breakdown: 'Design: 90, Usability: 85, Creativity: 80',
  },
  {
    id: 'task-2',
    title: 'Build a React Component Library',
    description: 'Create reusable React components with TypeScript',
    skill_area: 'web',
    points_awarded: 200,
    score: 92,
    status: 'scored',
    submitted_at: '2024-01-12T09:15:00Z',
    scored_at: '2024-01-12T16:45:00Z',
    feedback:
      'Great component architecture and TypeScript usage. Well documented.',
    breakdown: 'Code Quality: 95, Documentation: 90, Reusability: 92',
  },
  {
    id: 'task-3',
    title: 'Implement a Recommendation System',
    description: 'Build a collaborative filtering recommendation algorithm',
    skill_area: 'ai',
    points_awarded: 300,
    score: 88,
    status: 'scored',
    submitted_at: '2024-01-10T11:00:00Z',
    scored_at: '2024-01-11T10:30:00Z',
    feedback: 'Solid algorithm implementation. Good performance optimization.',
    breakdown: 'Algorithm: 90, Performance: 85, Documentation: 88',
  },
  {
    id: 'task-4',
    title: 'Write Product Marketing Copy',
    description: 'Create compelling copy for a new mobile app launch',
    skill_area: 'writing',
    points_awarded: 120,
    score: 78,
    status: 'scored',
    submitted_at: '2024-01-08T14:20:00Z',
    scored_at: '2024-01-09T09:15:00Z',
    feedback:
      'Good messaging but could be more persuasive. Consider A/B testing.',
    breakdown: 'Clarity: 80, Persuasiveness: 75, Brand Voice: 78',
  },
  {
    id: 'task-5',
    title: 'Design System Architecture',
    description: 'Plan and document a comprehensive design system',
    skill_area: 'design',
    points_awarded: 250,
    score: 95,
    status: 'scored',
    submitted_at: '2024-01-05T13:45:00Z',
    scored_at: '2024-01-06T11:20:00Z',
    feedback: 'Exceptional system design. Well thought out and comprehensive.',
    breakdown: 'Architecture: 95, Documentation: 95, Scalability: 95',
  },
];

// Mock badge data
const MOCK_BADGES: Badge[] = [
  {
    id: 'badge-1',
    name: 'First Steps',
    description: 'Complete your first task in this skill area',
    icon: '🌟',
    skillArea: 'design',
    unlockedAt: '2024-01-15T10:30:00Z',
    rarity: 'common',
    requirements: { tasksCompleted: 1, averageScore: 0, totalXP: 0 },
  },
  {
    id: 'badge-2',
    name: 'Consistent Performer',
    description: 'Maintain an average score above 80%',
    icon: '🎯',
    skillArea: 'design',
    unlockedAt: '2024-01-15T14:20:00Z',
    rarity: 'rare',
    requirements: { tasksCompleted: 2, averageScore: 80, totalXP: 400 },
  },
  {
    id: 'badge-3',
    name: 'Design Master',
    description: 'Complete 10 design tasks with excellence',
    icon: '👑',
    skillArea: 'design',
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
