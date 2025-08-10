import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';
import KPICards from '../components/AnalyticsCharts/KPICards';
import TopReviewersTable from '../components/AnalyticsCharts/TopReviewersTable';
import TaskDistributionPieChart from '../components/AnalyticsCharts/TaskDistributionPieChart';
import ExportButton from '../components/ExportButton';
import { RefreshCw, AlertCircle, Shield, Lock } from 'lucide-react';

// Mock user data - in production this would come from auth context
const MOCK_USER = {
  id: 'user-123',
  name: 'Admin User',
  rank: 'platinum', // Change to 'gold' to test RBAC redirect
  email: 'admin@example.com',
};

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const { adminData, isLoading, error, refetch } = useAnalytics();
  const [user, setUser] = useState(MOCK_USER);

  // RBAC Check - redirect if not platinum
  useEffect(() => {
    if (user.rank !== 'platinum') {
      navigate('/analytics', { replace: true });
    }
  }, [user.rank, navigate]);

  // Show loading while checking permissions
  if (user.rank !== 'platinum') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin analytics...</p>
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
              Error Loading Admin Analytics
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

  if (!adminData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600">No admin analytics data available.</p>
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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Admin Analytics
                </h1>
                <p className="mt-2 text-gray-600">
                  Platform-wide metrics and reviewer performance insights
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full">
                <Lock className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  Platinum Access
                </span>
              </div>
              <button
                onClick={refetch}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <ExportButton
                data={adminData.auditData}
                filename="admin-audit-data"
                format="json"
              />
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mb-8">
          <KPICards data={adminData.kpiCards} />
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Reviewers Table */}
          <div className="lg:col-span-2">
            <TopReviewersTable data={adminData.topReviewers} />
          </div>

          {/* Task Distribution Pie Chart */}
          <div className="lg:col-span-2">
            <TaskDistributionPieChart data={adminData.taskDistribution} />
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Export Audit Data
              </h3>
              <p className="text-sm text-gray-600">
                Download complete audit dataset for external analysis
              </p>
            </div>
            <div className="flex gap-3">
              <ExportButton
                data={adminData.auditData}
                filename="admin-audit-data"
                format="csv"
              />
              <ExportButton
                data={adminData.auditData}
                filename="admin-audit-data"
                format="json"
              />
            </div>
          </div>
        </div>

        {/* Platform Insights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Total Reviews
            </h3>
            <div className="text-3xl font-bold text-blue-600">
              {adminData.topReviewers
                .reduce((sum, r) => sum + r.reviewed, 0)
                .toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">This period</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Avg Review Time
            </h3>
            <div className="text-3xl font-bold text-green-600">
              {Math.round(
                (adminData.topReviewers.reduce(
                  (sum, r) => sum + r.avgLatency,
                  0
                ) /
                  adminData.topReviewers.length) *
                  10
              ) / 10}
              m
            </div>
            <p className="text-sm text-gray-600">Per review</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Active Reviewers
            </h3>
            <div className="text-3xl font-bold text-purple-600">
              {adminData.topReviewers.length}
            </div>
            <p className="text-sm text-gray-600">Platinum & Gold</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Task Categories
            </h3>
            <div className="text-3xl font-bold text-orange-600">
              {adminData.taskDistribution.length}
            </div>
            <p className="text-sm text-gray-600">Active types</p>
          </div>
        </div>
      </div>
    </div>
  );
}
