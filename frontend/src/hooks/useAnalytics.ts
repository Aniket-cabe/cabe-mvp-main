import { useState, useEffect, useCallback, useRef } from 'react';
import { AnalyticsMetrics, UseAnalyticsReturn } from '../types/analytics';

// Mock data for development
const MOCK_ANALYTICS_DATA: AnalyticsMetrics = {
  user: {
    heatmapData: generateHeatmapData(),
    skillRadarData: [
      { skill: 'Full-Stack Software Development', points: 85, fullMark: 100 },
      { skill: 'Cloud Computing & DevOps', points: 72, fullMark: 100 },
      { skill: 'AI / Machine Learning', points: 45, fullMark: 100 },
      { skill: 'Data Science & Analytics', points: 58, fullMark: 100 },
      { skill: 'Mobile Dev', points: 38, fullMark: 100 },
      { skill: 'DevOps', points: 62, fullMark: 100 },
    ],
    activityBarData: [
      { category: 'Jan', tasks: 45, learning: 28, gigs: 12 },
      { category: 'Feb', tasks: 52, learning: 35, gigs: 18 },
      { category: 'Mar', tasks: 48, learning: 42, gigs: 15 },
      { category: 'Apr', tasks: 61, learning: 38, gigs: 22 },
      { category: 'May', tasks: 55, learning: 45, gigs: 19 },
      { category: 'Jun', tasks: 67, learning: 52, gigs: 28 },
    ],
    exportData: generateExportData(),
    summary: {
      totalPoints: 2847,
      tasksCompleted: 156,
      streak: 12,
      topSkill: 'Full-Stack Software Development',
    },
  },
  admin: {
    kpiData: {
      dailyAudits: {
        value: 234,
        change: 12.5,
        trend: 'up',
      },
      avgReviewTime: {
        value: 18.7,
        change: -5.2,
        trend: 'down',
      },
      criticalDeviationRate: {
        value: 3.2,
        change: 0.8,
        trend: 'up',
      },
    },
    topReviewers: [
      {
        id: 'r1',
        name: 'Sarah Chen',
        reviewedCount: 187,
        avgLatency: 2.4,
        efficiency: 94.2,
      },
      {
        id: 'r2',
        name: 'Mike Rodriguez',
        reviewedCount: 156,
        avgLatency: 3.1,
        efficiency: 91.8,
      },
      {
        id: 'r3',
        name: 'Emily Johnson',
        reviewedCount: 142,
        avgLatency: 2.8,
        efficiency: 89.5,
      },
      {
        id: 'r4',
        name: 'David Kim',
        reviewedCount: 128,
        avgLatency: 4.2,
        efficiency: 87.3,
      },
      {
        id: 'r5',
        name: 'Lisa Zhang',
        reviewedCount: 115,
        avgLatency: 3.6,
        efficiency: 85.9,
      },
    ],
    categoryDistribution: [
      { category: 'Full-Stack Software Development', value: 35, color: '#3b82f6' },
      { category: 'Cloud Computing & DevOps', value: 25, color: '#10b981' },
      { category: 'Data Science & Analytics', value: 20, color: '#f59e0b' },
      { category: 'Mobile Dev', value: 12, color: '#ef4444' },
      { category: 'DevOps', value: 8, color: '#8b5cf6' },
    ],
    platformStats: {
      totalUsers: 1247,
      activeReviewers: 23,
      pendingReviews: 89,
      completionRate: 94.7,
    },
  },
  lastUpdated: new Date().toISOString(),
};

function generateHeatmapData() {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 365); // Go back 1 year

  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Generate realistic submission patterns (higher on weekdays, lower on weekends)
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseCount = isWeekend ? 0.3 : 1;
    const randomFactor = Math.random() * 2;
    const count = Math.floor(baseCount * randomFactor * 4);

    data.push({
      date: date.toISOString().split('T')[0],
      count,
    });
  }

  return data;
}

function generateExportData() {
  const data = [];
  const taskTypes = ['Arena Task', 'Learning Module', 'Gig Project'];
  const skills = [
    'Full-Stack Software Development',
    'Cloud Computing & DevOps',
    'AI / Machine Learning',
    'Data Science & Analytics',
    'Mobile Dev',
    'DevOps',
  ];
  const statuses = ['completed', 'approved', 'pending'];

  for (let i = 0; i < 100; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));

    data.push({
      date: date.toISOString().split('T')[0],
      taskType: taskTypes[Math.floor(Math.random() * taskTypes.length)],
      points: Math.floor(Math.random() * 50) + 10,
      skill: skills[Math.floor(Math.random() * skills.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }

  return data.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Custom hook for analytics data management
 */
export function useAnalytics(): UseAnalyticsReturn {
  const [data, setData] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  /**
   * Fetch analytics data from API
   */
  const fetchAnalytics = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      // In production, replace with actual API call
      // const response = await fetch('/api/metrics');
      // const analyticsData = await response.json();

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (mountedRef.current) {
        setData(MOCK_ANALYTICS_DATA);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch analytics data'
        );
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Refetch analytics data
   */
  const refetch = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  /**
   * Export user data to CSV or JSON
   */
  const exportUserData = useCallback(
    (format: 'csv' | 'json') => {
      if (!data?.user.exportData) {
        console.warn('No export data available');
        return;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `cabe-analytics-${timestamp}.${format}`;

      if (format === 'json') {
        const exportData = {
          exportedAt: new Date().toISOString(),
          summary: data.user.summary,
          data: data.user.exportData,
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json',
        });
        downloadFile(blob, filename);
      } else {
        // CSV format
        const headers = ['Date', 'Task Type', 'Points', 'Skill', 'Status'];
        const csvContent = [
          headers.join(','),
          ...data.user.exportData.map((row) =>
            [
              row.date,
              `"${row.taskType}"`,
              row.points,
              `"${row.skill}"`,
              row.status,
            ].join(',')
          ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        downloadFile(blob, filename);
      }
    },
    [data]
  );

  /**
   * Helper function to download files
   */
  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  /**
   * Load analytics on mount
   */
  useEffect(() => {
    fetchAnalytics();

    // Set up periodic refresh (every 5 minutes)
    const refreshInterval = setInterval(
      () => {
        if (mountedRef.current) {
          fetchAnalytics();
        }
      },
      5 * 60 * 1000
    );

    return () => {
      clearInterval(refreshInterval);
    };
  }, [fetchAnalytics]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    exportUserData,
  };
}

/**
 * Hook for checking user permissions
 */
export function useUserPermissions() {
  // Mock user data - in production, get from auth context
  const user = {
    id: 'user123',
    name: 'John Doe',
    rank: 'platinum', // bronze, silver, gold, platinum
    isAdmin: true,
  };

  const canViewAdminAnalytics = user.rank === 'platinum' || user.isAdmin;

  return {
    user,
    canViewAdminAnalytics,
  };
}
