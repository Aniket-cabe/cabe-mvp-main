import React from 'react';
import { Crown, Medal, Award } from 'lucide-react';
import type { TopReviewersTableProps } from '../../types';

export default function TopReviewersTable({
  data,
  className = '',
}: TopReviewersTableProps) {
  const getRankIcon = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'platinum':
        return <Crown className="h-4 w-4 text-purple-600" />;
      case 'gold':
        return <Medal className="h-4 w-4 text-yellow-600" />;
      case 'silver':
        return <Award className="h-4 w-4 text-gray-600" />;
      default:
        return <Award className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'platinum':
        return 'text-purple-600 bg-purple-50';
      case 'gold':
        return 'text-yellow-600 bg-yellow-50';
      case 'silver':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-400 bg-gray-50';
    }
  };

  const formatLatency = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getLatencyColor = (minutes: number) => {
    if (minutes <= 5) return 'text-green-600';
    if (minutes <= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Reviewers</h3>
        <p className="text-sm text-gray-600">
          Performance metrics for our most active reviewers
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Rank
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Reviewer
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">
                Rank Level
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-900">
                Reviewed
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-900">
                Avg Latency
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-900">
                Performance
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((reviewer, index) => (
              <tr
                key={reviewer.name}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      #{index + 1}
                    </span>
                    {index < 3 && (
                      <div className="ml-2 w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {index + 1}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {reviewer.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">
                        {reviewer.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getRankColor(reviewer.rank)}`}
                  >
                    {getRankIcon(reviewer.rank)}
                    {reviewer.rank}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {reviewer.reviewed.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">reviews</div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div
                    className={`text-sm font-medium ${getLatencyColor(reviewer.avgLatency)}`}
                  >
                    {formatLatency(reviewer.avgLatency)}
                  </div>
                  <div className="text-xs text-gray-500">per review</div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((reviewer.reviewed / Math.max(...data.map((r) => r.reviewed))) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="ml-2 text-xs text-gray-500">
                      {Math.round(
                        (reviewer.reviewed /
                          Math.max(...data.map((r) => r.reviewed))) *
                          100
                      )}
                      %
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {data.reduce((sum, r) => sum + r.reviewed, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Reviews</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(
              (data.reduce((sum, r) => sum + r.avgLatency, 0) / data.length) *
                10
            ) / 10}
            m
          </div>
          <div className="text-sm text-gray-600">Avg Latency</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {data.length}
          </div>
          <div className="text-sm text-gray-600">Active Reviewers</div>
        </div>
      </div>
    </div>
  );
}
