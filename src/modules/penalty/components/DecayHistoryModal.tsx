import React from 'react';
import {
  X,
  TrendingDown,
  Calendar,
  AlertTriangle,
  Ban,
  Clock,
} from 'lucide-react';
import type { DecayHistoryModalProps, DecayEntry } from '../types';

export default function DecayHistoryModal({
  isOpen,
  onClose,
  decayHistory,
}: DecayHistoryModalProps) {
  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'inactivity':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'penalty':
        return <Ban className="h-4 w-4 text-red-500" />;
      case 'expiration':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <TrendingDown className="h-4 w-4 text-gray-500" />;
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'inactivity':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'penalty':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expiration':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPointsLost = decayHistory.reduce(
    (sum, entry) => sum + entry.pointsLost,
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Point Decay History
              </h2>
              <p className="text-sm text-gray-600">
                Track your lost points and penalties
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close decay history"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {totalPointsLost}
                </div>
                <div className="text-xs text-gray-600">Total Points Lost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {decayHistory.length}
                </div>
                <div className="text-xs text-gray-600">Decay Events</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Last updated</div>
              <div className="text-sm font-medium text-gray-900">
                {decayHistory.length > 0
                  ? formatDate(decayHistory[0].date)
                  : 'Never'}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto max-h-96">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points Lost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {decayHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <TrendingDown className="h-8 w-8 text-gray-300" />
                      <p>No decay history found</p>
                      <p className="text-sm">
                        Great job keeping your points safe!
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                decayHistory.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {formatDate(entry.date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getReasonIcon(entry.reason)}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getReasonColor(entry.reason)}`}
                        >
                          {entry.reason.charAt(0).toUpperCase() +
                            entry.reason.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-red-600">
                        -{entry.pointsLost} pts
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {entry.description || 'No description provided'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {decayHistory.length} decay event
              {decayHistory.length !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
