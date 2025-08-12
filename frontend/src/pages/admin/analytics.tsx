import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalytics, useUserPermissions } from '../../hooks/useAnalytics';
import KPICards from '../../components/analytics/KPICards';
import CategoryPieChart from '../../components/analytics/CategoryPieChart';
import {
  Shield,
  Users,
  Clock,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

export default function AdminAnalytics() {
  const { data, loading, error, refetch } = useAnalytics();
  const { canViewAdminAnalytics } = useUserPermissions();
  const navigate = useNavigate();

  // RBAC Protection - Redirect non-platinum users
  useEffect(() => {
    if (!canViewAdminAnalytics) {
      navigate('/dashboard', { replace: true });
    }
  }, [canViewAdminAnalytics, navigate]);

  // Show loading while checking permissions
  if (!canViewAdminAnalytics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"
                ></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">
              Error loading admin analytics: {error}
            </p>
            <button
              onClick={refetch}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600 dark:text-gray-400">
            No admin analytics data available
          </p>
        </div>
      </div>
    );
  }

  const { admin } = data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="text-blue-600 dark:text-blue-400" size={24} />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Analytics
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Platform-wide metrics and reviewer performance insights
            </p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <button
              onClick={refetch}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={16} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mb-8">
          <KPICards data={admin.kpiData} />
        </div>

        {/* Platform Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {admin.platformStats.totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Shield
                  className="text-green-600 dark:text-green-400"
                  size={20}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active Reviewers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {admin.platformStats.activeReviewers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Clock
                  className="text-orange-600 dark:text-orange-400"
                  size={20}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pending Reviews
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {admin.platformStats.pendingReviews}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp
                  className="text-purple-600 dark:text-purple-400"
                  size={20}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {admin.platformStats.completionRate}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Reviewers Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Reviewers
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Reviewer
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Reviewed
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Avg Latency
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Efficiency
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {admin.topReviewers.map((reviewer, index) => (
                    <tr
                      key={reviewer.id}
                      className={`border-b border-gray-100 dark:border-gray-700 ${
                        index < 3 ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
                      }`}
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          {index < 3 && (
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0
                                  ? 'bg-yellow-400 text-yellow-900'
                                  : index === 1
                                    ? 'bg-gray-300 text-gray-700'
                                    : 'bg-orange-400 text-orange-900'
                              }`}
                            >
                              {index + 1}
                            </div>
                          )}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {reviewer.name}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-2 text-gray-900 dark:text-white">
                        {reviewer.reviewedCount.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-2 text-gray-900 dark:text-white">
                        {reviewer.avgLatency.toFixed(1)}h
                      </td>
                      <td className="text-right py-3 px-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reviewer.efficiency >= 90
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : reviewer.efficiency >= 80
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}
                        >
                          {reviewer.efficiency}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Distribution Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Task Category Distribution
            </h3>
            <CategoryPieChart data={admin.categoryDistribution} />
          </div>
        </div>

        {/* Critical Issues Alert */}
        {admin.kpiData.criticalDeviationRate.value > 5 && (
          <div className="mt-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle
                  className="text-red-600 dark:text-red-400"
                  size={20}
                />
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-200">
                    High Critical Deviation Rate
                  </h4>
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    The critical deviation rate is{' '}
                    {admin.kpiData.criticalDeviationRate.value}%, which is above
                    the recommended threshold of 5%. Consider reviewing recent
                    audit processes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date(data.lastUpdated).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
