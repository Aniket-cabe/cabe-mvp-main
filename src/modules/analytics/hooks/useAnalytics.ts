import { useState, useEffect, useCallback } from 'react';
import type {
  AnalyticsData,
  UserAnalyticsData,
  AdminAnalyticsData,
  UseAnalyticsReturn,
} from '../types';

// Mock data for development
const MOCK_ANALYTICS_DATA: AnalyticsData = {
  userData: {
    submissionHeatmap: [
      { date: '2024-01-01', count: 3 },
      { date: '2024-01-02', count: 5 },
      { date: '2024-01-03', count: 2 },
      { date: '2024-01-04', count: 7 },
      { date: '2024-01-05', count: 4 },
      { date: '2024-01-06', count: 6 },
      { date: '2024-01-07', count: 1 },
      { date: '2024-01-08', count: 8 },
      { date: '2024-01-09', count: 3 },
      { date: '2024-01-10', count: 5 },
      { date: '2024-01-11', count: 9 },
      { date: '2024-01-12', count: 2 },
      { date: '2024-01-13', count: 4 },
      { date: '2024-01-14', count: 6 },
      { date: '2024-01-15', count: 7 },
      { date: '2024-01-16', count: 3 },
      { date: '2024-01-17', count: 5 },
      { date: '2024-01-18', count: 8 },
      { date: '2024-01-19', count: 4 },
      { date: '2024-01-20', count: 6 },
      { date: '2024-01-21', count: 2 },
      { date: '2024-01-22', count: 7 },
      { date: '2024-01-23', count: 5 },
      { date: '2024-01-24', count: 9 },
      { date: '2024-01-25', count: 3 },
      { date: '2024-01-26', count: 6 },
      { date: '2024-01-27', count: 4 },
      { date: '2024-01-28', count: 8 },
      { date: '2024-01-29', count: 5 },
      { date: '2024-01-30', count: 7 },
    ],
    skillRadar: [
      { skill: 'Cloud Computing & DevOps', points: 850, maxPoints: 1000 },
      { skill: 'Web', points: 720, maxPoints: 1000 },
      { skill: 'Writing', points: 680, maxPoints: 1000 },
      { skill: 'AI', points: 920, maxPoints: 1000 },
    ],
    taskTypeBar: [
      { taskType: 'Arena', totalPoints: 1250, count: 25 },
      { taskType: 'Learning', totalPoints: 890, count: 18 },
      { taskType: 'Gigs', totalPoints: 650, count: 12 },
    ],
    exportData: [
      { date: '2024-01-01', taskType: 'Arena', points: 50, skill: 'Cloud Computing & DevOps' },
      { date: '2024-01-02', taskType: 'Learning', points: 30, skill: 'Web' },
      { date: '2024-01-03', taskType: 'Gigs', points: 75, skill: 'Writing' },
      { date: '2024-01-04', taskType: 'Arena', points: 45, skill: 'AI' },
      { date: '2024-01-05', taskType: 'Learning', points: 35, skill: 'Cloud Computing & DevOps' },
      { date: '2024-01-06', taskType: 'Gigs', points: 60, skill: 'Web' },
      { date: '2024-01-07', taskType: 'Arena', points: 40, skill: 'Writing' },
      { date: '2024-01-08', taskType: 'Learning', points: 25, skill: 'AI' },
      { date: '2024-01-09', taskType: 'Gigs', points: 80, skill: 'Cloud Computing & DevOps' },
      { date: '2024-01-10', taskType: 'Arena', points: 55, skill: 'Web' },
    ],
  },
  adminData: {
    kpiCards: [
      {
        title: 'Daily Audits',
        value: 156,
        unit: 'reviews',
        change: 12,
        changeType: 'increase',
      },
      {
        title: 'Avg Review Time',
        value: 8.5,
        unit: 'minutes',
        change: -2.3,
        changeType: 'decrease',
      },
      {
        title: 'Critical Deviation Rate',
        value: 3.2,
        unit: '%',
        change: 0.8,
        changeType: 'increase',
      },
    ],
    topReviewers: [
      { name: 'Sarah Chen', reviewed: 45, avgLatency: 6.2, rank: 'platinum' },
      { name: 'Mike Johnson', reviewed: 38, avgLatency: 7.8, rank: 'gold' },
      { name: 'Alex Rivera', reviewed: 32, avgLatency: 8.5, rank: 'gold' },
      { name: 'Emma Wilson', reviewed: 28, avgLatency: 9.1, rank: 'silver' },
      { name: 'David Kim', reviewed: 25, avgLatency: 7.3, rank: 'silver' },
    ],
    taskDistribution: [
      { category: 'Arena Tasks', count: 156, percentage: 45, color: '#3B82F6' },
      {
        category: 'Learning Modules',
        count: 98,
        percentage: 28,
        color: '#10B981',
      },
      {
        category: 'Gig Opportunities',
        count: 67,
        percentage: 19,
        color: '#F59E0B',
      },
      {
        category: 'Special Projects',
        count: 28,
        percentage: 8,
        color: '#EF4444',
      },
    ],
    auditData: [
      {
        id: 'audit-001',
        reviewer: 'Sarah Chen',
        taskType: 'Arena',
        status: 'approved',
        reviewTime: 6.2,
        timestamp: '2024-01-30T10:30:00Z',
        deviation: 0.2,
      },
      {
        id: 'audit-002',
        reviewer: 'Mike Johnson',
        taskType: 'Learning',
        status: 'rejected',
        reviewTime: 8.5,
        timestamp: '2024-01-30T11:15:00Z',
        deviation: 2.1,
      },
      {
        id: 'audit-003',
        reviewer: 'Alex Rivera',
        taskType: 'Gigs',
        status: 'approved',
        reviewTime: 7.3,
        timestamp: '2024-01-30T12:00:00Z',
        deviation: 0.8,
      },
      {
        id: 'audit-004',
        reviewer: 'Emma Wilson',
        taskType: 'Arena',
        status: 'pending',
        reviewTime: 9.1,
        timestamp: '2024-01-30T12:45:00Z',
        deviation: 1.5,
      },
      {
        id: 'audit-005',
        reviewer: 'David Kim',
        taskType: 'Learning',
        status: 'approved',
        reviewTime: 6.8,
        timestamp: '2024-01-30T13:30:00Z',
        deviation: 0.3,
      },
    ],
  },
};

export function useAnalytics(userId?: string): UseAnalyticsReturn {
  const [userData, setUserData] = useState<UserAnalyticsData | null>(null);
  const [adminData, setAdminData] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In production, this would be a real API call
      // const response = await fetch('/api/metrics');
      // const data = await response.json();

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // For demo purposes, we'll use mock data
      const data = MOCK_ANALYTICS_DATA;

      setUserData(data.userData);
      setAdminData(data.adminData);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  // Initial load
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    userData,
    adminData,
    isLoading,
    error,
    refetch,
  };
}
