import React, { useState, useEffect } from 'react';
import {
  Brain,
  Users,
  TrendingUp,
  Clock,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  AlertCircle,
  Calendar,
  Filter,
  Search,
} from 'lucide-react';

interface CaBOTUsageStats {
  totalUsers: number;
  activeUsers: number;
  totalCreditsUsed: number;
  totalCreditsAllocated: number;
  averageUsagePerUser: number;
  mostPopularAction: string;
  peakUsageHour: number;
  usageByAction: Array<{
    actionType: string;
    count: number;
    percentage: number;
  }>;
  usageByHour: Array<{
    hour: number;
    count: number;
  }>;
  usageByDay: Array<{
    date: string;
    count: number;
    uniqueUsers: number;
  }>;
  userEngagement: {
    heavyUsers: number; // >4 credits/week
    moderateUsers: number; // 2-4 credits/week
    lightUsers: number; // 1 credit/week
    inactiveUsers: number; // 0 credits/week
  };
  creditEfficiency: {
    utilizationRate: number; // % of allocated credits used
    wasteRate: number; // % of credits unused
  };
}

interface TopUser {
  id: string;
  name: string;
  email: string;
  creditsUsed: number;
  lastActivity: string;
  favoriteAction: string;
}

// Mock data for demonstration
const MOCK_STATS: CaBOTUsageStats = {
  totalUsers: 1247,
  activeUsers: 892,
  totalCreditsUsed: 3456,
  totalCreditsAllocated: 6235,
  averageUsagePerUser: 3.9,
  mostPopularAction: 'task_explanation',
  peakUsageHour: 14,
  usageByAction: [
    { actionType: 'task_explanation', count: 1834, percentage: 53.1 },
    { actionType: 'smart_scoring', count: 987, percentage: 28.6 },
    { actionType: 'auto_messenger', count: 635, percentage: 18.4 },
  ],
  usageByHour: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: Math.floor(Math.random() * 200) + 50,
  })),
  usageByDay: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    count: Math.floor(Math.random() * 500) + 200,
    uniqueUsers: Math.floor(Math.random() * 150) + 50,
  })),
  userEngagement: {
    heavyUsers: 156,
    moderateUsers: 423,
    lightUsers: 313,
    inactiveUsers: 355,
  },
  creditEfficiency: {
    utilizationRate: 55.4,
    wasteRate: 44.6,
  },
};

const MOCK_TOP_USERS: TopUser[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    creditsUsed: 5,
    lastActivity: '2024-01-30T10:30:00Z',
    favoriteAction: 'task_explanation',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    creditsUsed: 5,
    lastActivity: '2024-01-30T09:15:00Z',
    favoriteAction: 'smart_scoring',
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    creditsUsed: 4,
    lastActivity: '2024-01-30T08:45:00Z',
    favoriteAction: 'auto_messenger',
  },
];

export default function CaBOTAnalytics() {
  const [stats, setStats] = useState<CaBOTUsageStats>(MOCK_STATS);
  const [topUsers, setTopUsers] = useState<TopUser[]>(MOCK_TOP_USERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');

  // Load analytics data
  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      // In production, replace with actual API calls
      // const [statsResponse, usersResponse] = await Promise.all([
      //   fetch(`/api/admin/cabot-stats?range=${selectedDateRange}`),
      //   fetch(`/api/admin/cabot-top-users?range=${selectedDateRange}`)
      // ]);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStats(MOCK_STATS);
      setTopUsers(MOCK_TOP_USERS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [selectedDateRange]);

  const exportData = (format: 'csv' | 'json') => {
    const data = {
      stats,
      topUsers,
      exportedAt: new Date().toISOString(),
      dateRange: selectedDateRange,
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cabot-analytics-${selectedDateRange}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV export for stats
      const csvContent = [
        'Metric,Value',
        `Total Users,${stats.totalUsers}`,
        `Active Users,${stats.activeUsers}`,
        `Total Credits Used,${stats.totalCreditsUsed}`,
        `Average Usage Per User,${stats.averageUsagePerUser}`,
        `Utilization Rate,${stats.creditEfficiency.utilizationRate}%`,
        '',
        'Action Type,Count,Percentage',
        ...stats.usageByAction.map(
          (action) =>
            `${action.actionType},${action.count},${action.percentage}%`
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cabot-analytics-${selectedDateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="animate-spin text-blue-500" size={32} />
              <span className="text-gray-600 dark:text-gray-400">
                Loading analytics...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Brain className="text-blue-600 dark:text-blue-400" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  CaBOT Usage Analytics
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Monitor AI assistant usage across the platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>

              <button
                onClick={loadAnalytics}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <RefreshCw
                  size={20}
                  className={loading ? 'animate-spin' : ''}
                />
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => exportData('csv')}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Download size={16} />
                  CSV
                </button>
                <button
                  onClick={() => exportData('json')}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Download size={16} />
                  JSON
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-500" size={20} />
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalUsers.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {stats.activeUsers} active
                </p>
              </div>
              <Users className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Credits Used
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalCreditsUsed.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  of {stats.totalCreditsAllocated.toLocaleString()} allocated
                </p>
              </div>
              <Brain className="text-purple-500" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Avg Usage
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.averageUsagePerUser}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  credits per user
                </p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Utilization
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.creditEfficiency.utilizationRate}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  efficiency rate
                </p>
              </div>
              <BarChart3 className="text-orange-500" size={32} />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Usage by Action Type */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Usage by Action Type
            </h3>
            <div className="space-y-4">
              {stats.usageByAction.map((action) => (
                <div
                  key={action.actionType}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {action.actionType.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {action.count.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {action.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Engagement Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              User Engagement
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.userEngagement.heavyUsers}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  Heavy Users
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  4+ credits/week
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.userEngagement.moderateUsers}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Moderate Users
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  2-4 credits/week
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.userEngagement.lightUsers}
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  Light Users
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400">
                  1 credit/week
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {stats.userEngagement.inactiveUsers}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Inactive
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  0 credits/week
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top CaBOT Users
            </h3>
            <div className="flex items-center gap-2">
              <Search className="text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Credits Used
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Favorite Action
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody>
                {topUsers
                  .filter(
                    (user) =>
                      user.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      user.email
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Brain className="text-blue-500" size={16} />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.creditsUsed}/5
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {user.favoriteAction.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Clock className="text-gray-400" size={14} />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(user.lastActivity).toLocaleString()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
