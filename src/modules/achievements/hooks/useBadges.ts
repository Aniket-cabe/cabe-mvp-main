import { useState, useEffect, useMemo } from 'react';
import type { Badge, UseBadgesReturn } from '../types';

// Mock badge data for development
const MOCK_BADGES: Badge[] = [
  // Arena Badges
  {
    id: 'arena-first-win',
    title: 'First Victory',
    emoji: '🏆',
    description: 'Win your first Arena challenge',
    earned: true,
    dateEarned: '2024-01-15T10:30:00Z',
    category: 'arena',
    rarity: 'common',
    requirements: 'Win 1 Arena challenge',
  },
  {
    id: 'arena-streak-5',
    title: 'Hot Streak',
    emoji: '🔥',
    description: 'Win 5 Arena challenges in a row',
    earned: false,
    progress: { current: 3, total: 5, unit: 'wins' },
    category: 'arena',
    rarity: 'rare',
    requirements: 'Win 5 Arena challenges in a row',
  },
  {
    id: 'arena-master',
    title: 'Arena Master',
    emoji: '👑',
    description: 'Win 50 Arena challenges',
    earned: false,
    progress: { current: 12, total: 50, unit: 'wins' },
    category: 'arena',
    rarity: 'epic',
    requirements: 'Win 50 Arena challenges',
  },
  {
    id: 'arena-legend',
    title: 'Arena Legend',
    emoji: '⚡',
    description: 'Win 100 Arena challenges',
    earned: false,
    progress: { current: 12, total: 100, unit: 'wins' },
    category: 'arena',
    rarity: 'legendary',
    requirements: 'Win 100 Arena challenges',
  },

  // Learning Badges
  {
    id: 'learning-first-course',
    title: 'Student',
    emoji: '📚',
    description: 'Complete your first course',
    earned: true,
    dateEarned: '2024-01-10T14:20:00Z',
    category: 'learning',
    rarity: 'common',
    requirements: 'Complete 1 course',
  },
  {
    id: 'learning-5-courses',
    title: 'Scholar',
    emoji: '🎓',
    description: 'Complete 5 courses',
    earned: false,
    progress: { current: 3, total: 5, unit: 'courses' },
    category: 'learning',
    rarity: 'rare',
    requirements: 'Complete 5 courses',
  },
  {
    id: 'learning-20-courses',
    title: 'Academic',
    emoji: '🏛️',
    description: 'Complete 20 courses',
    earned: false,
    progress: { current: 3, total: 20, unit: 'courses' },
    category: 'learning',
    rarity: 'epic',
    requirements: 'Complete 20 courses',
  },
  {
    id: 'learning-master',
    title: 'Learning Master',
    emoji: '🧠',
    description: 'Complete 50 courses',
    earned: false,
    progress: { current: 3, total: 50, unit: 'courses' },
    category: 'learning',
    rarity: 'legendary',
    requirements: 'Complete 50 courses',
  },

  // Social Badges
  {
    id: 'social-first-friend',
    title: 'Social Butterfly',
    emoji: '🦋',
    description: 'Add your first friend',
    earned: true,
    dateEarned: '2024-01-12T09:15:00Z',
    category: 'social',
    rarity: 'common',
    requirements: 'Add 1 friend',
  },
  {
    id: 'social-10-friends',
    title: 'Networker',
    emoji: '🤝',
    description: 'Add 10 friends',
    earned: false,
    progress: { current: 7, total: 10, unit: 'friends' },
    category: 'social',
    rarity: 'rare',
    requirements: 'Add 10 friends',
  },
  {
    id: 'social-50-friends',
    title: 'Influencer',
    emoji: '🌟',
    description: 'Add 50 friends',
    earned: false,
    progress: { current: 7, total: 50, unit: 'friends' },
    category: 'social',
    rarity: 'epic',
    requirements: 'Add 50 friends',
  },

  // Streak Badges
  {
    id: 'streak-3-days',
    title: 'Consistent',
    emoji: '📅',
    description: 'Maintain a 3-day streak',
    earned: true,
    dateEarned: '2024-01-14T16:45:00Z',
    category: 'streak',
    rarity: 'common',
    requirements: 'Maintain a 3-day streak',
  },
  {
    id: 'streak-7-days',
    title: 'Week Warrior',
    emoji: '💪',
    description: 'Maintain a 7-day streak',
    earned: false,
    progress: { current: 5, total: 7, unit: 'days' },
    category: 'streak',
    rarity: 'rare',
    requirements: 'Maintain a 7-day streak',
  },
  {
    id: 'streak-30-days',
    title: 'Month Master',
    emoji: '📆',
    description: 'Maintain a 30-day streak',
    earned: false,
    progress: { current: 5, total: 30, unit: 'days' },
    category: 'streak',
    rarity: 'epic',
    requirements: 'Maintain a 30-day streak',
  },
  {
    id: 'streak-100-days',
    title: 'Century Club',
    emoji: '🏆',
    description: 'Maintain a 100-day streak',
    earned: false,
    progress: { current: 5, total: 100, unit: 'days' },
    category: 'streak',
    rarity: 'legendary',
    requirements: 'Maintain a 100-day streak',
  },

  // Special Badges
  {
    id: 'special-beta-tester',
    title: 'Beta Tester',
    emoji: '🧪',
    description: 'Join during beta phase',
    earned: true,
    dateEarned: '2024-01-01T00:00:00Z',
    category: 'special',
    rarity: 'rare',
    requirements: 'Join during beta phase',
  },
  {
    id: 'special-early-adopter',
    title: 'Early Adopter',
    emoji: '🚀',
    description: 'Join in the first month',
    earned: true,
    dateEarned: '2024-01-05T12:00:00Z',
    category: 'special',
    rarity: 'epic',
    requirements: 'Join in the first month',
  },
  {
    id: 'special-founder',
    title: 'Founder',
    emoji: '👑',
    description: 'One of the first 100 users',
    earned: false,
    category: 'special',
    rarity: 'legendary',
    requirements: 'Be one of the first 100 users',
  },
  {
    id: 'special-perfect-score',
    title: 'Perfect Score',
    emoji: '💯',
    description: 'Get a perfect score on any task',
    earned: false,
    category: 'special',
    rarity: 'epic',
    requirements: 'Get a perfect score on any task',
  },
  {
    id: 'special-all-categories',
    title: 'Jack of All Trades',
    emoji: '🎭',
    description: 'Earn badges in all categories',
    earned: false,
    progress: { current: 2, total: 5, unit: 'categories' },
    category: 'special',
    rarity: 'legendary',
    requirements: 'Earn badges in all categories',
  },
  {
    id: 'special-100-badges',
    title: 'Badge Collector',
    emoji: '📛',
    description: 'Earn 100 badges',
    earned: false,
    progress: { current: 3, total: 100, unit: 'badges' },
    category: 'special',
    rarity: 'legendary',
    requirements: 'Earn 100 badges',
  },
  {
    id: 'special-daily-login',
    title: 'Daily Devotee',
    emoji: '🌅',
    description: 'Log in for 7 consecutive days',
    earned: false,
    progress: { current: 4, total: 7, unit: 'days' },
    category: 'special',
    rarity: 'common',
    requirements: 'Log in for 7 consecutive days',
  },
  {
    id: 'special-weekend-warrior',
    title: 'Weekend Warrior',
    emoji: '🏃',
    description: 'Complete tasks on 5 consecutive weekends',
    earned: false,
    progress: { current: 2, total: 5, unit: 'weekends' },
    category: 'special',
    rarity: 'rare',
    requirements: 'Complete tasks on 5 consecutive weekends',
  },
];

export function useBadges(): UseBadgesReturn {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch from API first
      if (typeof window !== 'undefined') {
        try {
          const response = await fetch('/api/badges');
          if (response.ok) {
            const apiData = await response.json();
            setBadges(apiData.badges || MOCK_BADGES);
            return;
          }
        } catch (apiError) {
          console.log('API not available, using mock data');
        }
      }

      // Fallback to mock data
      setBadges(MOCK_BADGES);
    } catch (err) {
      console.error('Error fetching badges:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch badges');
      setBadges(MOCK_BADGES); // Still show mock data on error
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchBadges();
  };

  const filterBadges = useMemo(() => {
    return (filter: 'all' | 'earned' | 'locked' | Badge['category']) => {
      if (filter === 'all') return badges;
      if (filter === 'earned') return badges.filter((badge) => badge.earned);
      if (filter === 'locked') return badges.filter((badge) => !badge.earned);
      return badges.filter((badge) => badge.category === filter);
    };
  }, [badges]);

  useEffect(() => {
    fetchBadges();
  }, []);

  return {
    badges,
    loading,
    error,
    refetch,
    filterBadges,
  };
}
