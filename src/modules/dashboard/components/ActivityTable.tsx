import React from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Target,
  Star,
  Zap,
} from 'lucide-react';
import type { ActivityTableProps } from '../types';

export default function ActivityTable({
  submissions,
  maxRows = 5,
}: ActivityTableProps) {
  const displaySubmissions = submissions.slice(0, maxRows);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'arena':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'course':
        return <Star className="h-4 w-4 text-purple-500" />;
      case 'challenge':
        return <Zap className="h-4 w-4 text-orange-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getSkillColor = (skill: string) => {
    const colors = {
      design: 'text-pink-600 bg-pink-50 border-pink-200',
      frontend: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      backend: 'text-blue-600 bg-blue-50 border-blue-200',
      ai: 'text-violet-600 bg-violet-50 border-violet-200',
      writing: 'text-amber-600 bg-amber-50 border-amber-200',
      database: 'text-purple-600 bg-purple-50 border-purple-200',
      algorithm: 'text-orange-600 bg-orange-50 border-orange-200',
      system: 'text-red-600 bg-red-50 border-red-200',
    };
    return (
      colors[skill as keyof typeof colors] ||
      'text-gray-600 bg-gray-50 border-gray-200'
    );
  };

  if (submissions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>No recent activity</p>
          <p className="text-sm">
            Complete your first task to see activity here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <p className="text-sm text-gray-600">
          Your latest submissions and their status
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" data-testid="activity-table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skill
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displaySubmissions.map((submission) => (
              <tr
                key={submission.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {getStatusIcon(submission.status)}
                    <div className="ml-3">
                      <div
                        className="text-sm font-medium text-gray-900 line-clamp-1"
                        data-testid={`task-title-${submission.id}`}
                      >
                        {submission.taskTitle}
                      </div>
                      {submission.points && (
                        <div className="text-xs text-gray-500">
                          {submission.points} points
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {getTaskTypeIcon(submission.taskType)}
                    <span className="ml-2 text-sm text-gray-900 capitalize">
                      {submission.taskType}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSkillColor(submission.skillArea)}`}
                  >
                    {submission.skillArea}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}
                    data-testid={`status-${submission.id}`}
                  >
                    {submission.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  {submission.score !== undefined ? (
                    <div
                      className="text-sm text-gray-900"
                      data-testid={`score-${submission.id}`}
                    >
                      {submission.score}%
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">-</div>
                  )}
                </td>

                <td className="px-6 py-4">
                  <div
                    className="text-sm text-gray-500"
                    data-testid={`date-${submission.id}`}
                  >
                    {formatDate(submission.submittedAt)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {submissions.length > maxRows && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-600 text-center">
            Showing {maxRows} of {submissions.length} recent submissions
          </div>
        </div>
      )}
    </div>
  );
}
