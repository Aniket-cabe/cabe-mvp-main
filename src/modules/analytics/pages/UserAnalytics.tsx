import React from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import SubmissionCalendar from '../components/AnalyticsCharts/SubmissionCalendar';
import SkillRadarChart from '../components/AnalyticsCharts/SkillRadarChart';
import TaskTypeBarChart from '../components/AnalyticsCharts/TaskTypeBarChart';
import ExportButton from '../components/ExportButton';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function UserAnalytics() {
  const { userData, isLoading, error, refetch } = useAnalytics();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Error Loading Analytics
            </h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={refetch}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600">No analytics data available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Your Analytics
              </h1>
              <p className="mt-2 text-gray-600">
                Track your progress, skill development, and submission activity
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={refetch}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <ExportButton
                data={userData.exportData}
                filename="user-analytics"
                format="csv"
              />
            </div>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submission Heatmap */}
          <div className="lg:col-span-2">
            <SubmissionCalendar data={userData.submissionHeatmap} />
          </div>

          {/* Skill Radar Chart */}
          <div>
            <SkillRadarChart data={userData.skillRadar} />
          </div>

          {/* Task Type Bar Chart */}
          <div>
            <TaskTypeBarChart data={userData.taskTypeBar} />
          </div>
        </div>

        {/* Export Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Export Your Data
              </h3>
              <p className="text-sm text-gray-600">
                Download your analytics data for further analysis
              </p>
            </div>
            <div className="flex gap-3">
              <ExportButton
                data={userData.exportData}
                filename="user-analytics"
                format="csv"
              />
              <ExportButton
                data={userData.exportData}
                filename="user-analytics"
                format="json"
              />
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Activity Streak
            </h3>
            <div className="text-3xl font-bold text-blue-600">
              {
                userData.submissionHeatmap.filter((item) => item.count > 0)
                  .length
              }
            </div>
            <p className="text-sm text-gray-600">Active days this month</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Total Points
            </h3>
            <div className="text-3xl font-bold text-green-600">
              {userData.taskTypeBar
                .reduce((sum, item) => sum + item.totalPoints, 0)
                .toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Earned across all tasks</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Best Skill
            </h3>
            <div className="text-3xl font-bold text-purple-600">
              {
                userData.skillRadar.reduce((max, skill) =>
                  skill.points > max.points ? skill : max
                ).skill
              }
            </div>
            <p className="text-sm text-gray-600">Highest points earned</p>
          </div>
        </div>
      </div>
    </div>
  );
}
