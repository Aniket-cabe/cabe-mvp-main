import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { FilterControls, FilterOptions } from '../../components/FilterControls';
import {
  RefreshIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  submissionRate: Array<{
    timestamp: string;
    count: number;
    averageScore: string;
  }>;
  activeUsers: Array<{
    timestamp: string;
    count: number;
    uniqueUsers: number;
  }>;
  summary: {
    totalSubmissions: number;
    totalUsers: number;
    averageScore: string;
    topSkill: string | null;
  };
}

export const RealTimeAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  const fetchAnalytics = useCallback(async (currentFilters: FilterOptions) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        from: currentFilters.from.toISOString(),
        to: currentFilters.to.toISOString(),
        ...(currentFilters.skill && { skill: currentFilters.skill }),
        ...(currentFilters.type && { type: currentFilters.type }),
      });

      const response = await fetch(`/api/metrics/realtime?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const analyticsData: AnalyticsData = await response.json();
      setData(analyticsData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(filters);
  }, [fetchAnalytics, filters]);

  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(() => {
      fetchAnalytics(filters);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchAnalytics, filters, isPolling]);

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    fetchAnalytics(newFilters);
  };

  const togglePolling = () => setIsPolling(!isPolling);
  const handleRetry = () => fetchAnalytics(filters);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatTimestamp(label)}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm font-medium"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Oops, something went wrong! 😅
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't load your analytics data. Don't worry, this happens
              sometimes!
            </p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Real-Time Analytics 📊
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Live insights into CaBE Arena activity and performance
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={togglePolling}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isPolling
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
              aria-label={
                isPolling ? 'Stop auto-refresh' : 'Start auto-refresh'
              }
            >
              <div
                className={`w-2 h-2 rounded-full ${isPolling ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
              />
              <span>{isPolling ? 'Live' : 'Paused'}</span>
            </button>

            <button
              onClick={() => fetchAnalytics(filters)}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              aria-label="Refresh data"
            >
              <RefreshIcon
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {lastUpdated && (
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <InformationCircleIcon className="w-4 h-4" />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        )}

        <FilterControls
          onFiltersChange={handleFiltersChange}
          isLoading={loading}
        />

        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600 dark:text-gray-400" role="status">
                Loading analytics data...
              </span>
            </div>
          </div>
        )}

        {!loading && data && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Submissions
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {data.summary.totalSubmissions}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Users
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {data.summary.totalUsers}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Average Score
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {data.summary.averageScore}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Top Skill
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {data.summary.topSkill || 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Submission Rate Over Time 📈
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={data.submissionRate}
                    role="img"
                    aria-label="Submission rate over time"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatTimestamp}
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Active Users Over Time 👥
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={data.activeUsers}
                    role="img"
                    aria-label="Active users over time"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatTimestamp}
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {data.submissionRate.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <InformationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No data for selected range 😅
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try expanding your date range or adjusting your filters to see
                  more data!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeAnalytics;
