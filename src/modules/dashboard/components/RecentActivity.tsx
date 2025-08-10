import React from 'react';
import ActivityTable from './ActivityTable';
import type { RecentSubmission } from '../types';

interface RecentActivityProps {
  submissions: RecentSubmission[];
  maxRows?: number;
  showHeader?: boolean;
  className?: string;
}

/**
 * RecentActivity component for displaying user's recent submissions and activity.
 * Shows a table of recent task submissions with status indicators.
 *
 * Features:
 * - Displays recent task submissions with status chips
 * - Configurable number of rows to show
 * - Status indicators: approved, pending, rejected
 * - Responsive design with clean table layout
 * - Task type and skill area information
 */
export default function RecentActivity({
  submissions,
  maxRows = 5,
  showHeader = true,
  className = '',
}: RecentActivityProps) {
  const displaySubmissions = submissions.slice(0, maxRows);

  if (submissions.length === 0) {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
      >
        {showHeader && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
        )}
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📝</div>
          <p>No recent activity</p>
          <p className="text-sm">
            Complete your first task to see activity here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
    >
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h3>
          <span className="text-sm text-gray-500">
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <ActivityTable submissions={displaySubmissions} maxRows={maxRows} />

      {submissions.length > maxRows && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All Activity →
          </button>
        </div>
      )}
    </div>
  );
}
