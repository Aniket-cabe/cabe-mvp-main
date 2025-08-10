import React from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import SubmissionHeatmap from '../../components/analytics/SubmissionHeatmap';
import SkillRadarChart from '../../components/analytics/SkillRadarChart';
import ActivityBarChart from '../../components/analytics/ActivityBarChart';
import {
  Download,
  RefreshCw,
  TrendingUp,
  Target,
  Zap,
  Calendar,
} from 'lucide-react';

export default function UserAnalytics() {
  const { data, loading, error, refetch, exportUserData } = useAnalytics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              Error loading analytics: {error}
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
            No analytics data available
          </p>
        </div>
      </div>
    );
  }

  const { user } = data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Your Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your progress and performance across all activities
            </p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <button
              onClick={() => exportUserData('csv')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={refetch}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp
                  className="text-blue-600 dark:text-blue-400"
                  size={20}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Points
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.summary.totalPoints.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Target
                  className="text-green-600 dark:text-green-400"
                  size={20}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tasks Completed
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.summary.tasksCompleted}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Zap
                  className="text-purple-600 dark:text-purple-400"
                  size={20}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current Streak
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.summary.streak} days
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Calendar
                  className="text-orange-600 dark:text-orange-400"
                  size={20}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Top Skill
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {user.summary.topSkill}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Heatmap */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Activity Heatmap
            </h3>
            <SubmissionHeatmap data={user.heatmapData} />
          </div>

          {/* Skill Radar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Skills Overview
            </h3>
            <SkillRadarChart data={user.skillRadarData} />
          </div>
        </div>

        {/* Activity Bar Chart - Full Width */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Activity Breakdown
            </h3>
            <ActivityBarChart data={user.activityBarData} />
          </div>
        </div>

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
