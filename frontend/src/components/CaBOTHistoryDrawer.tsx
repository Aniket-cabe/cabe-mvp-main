import { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Download,
  Brain,
  RefreshCw,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { CaBOTCreditHistory } from '../hooks/useCaBOTCredits';

interface CaBOTHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  getHistory: (range?: 'week' | 'month') => Promise<CaBOTCreditHistory[]>;
  className?: string;
}

type TimeRange = 'week' | 'month';

export default function CaBOTHistoryDrawer({
  isOpen,
  onClose,
  getHistory,
  className = '',
}: CaBOTHistoryDrawerProps) {
  const [history, setHistory] = useState<CaBOTCreditHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('week');
  const [filteredHistory, setFilteredHistory] = useState<CaBOTCreditHistory[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Load history when drawer opens or range changes
  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, selectedRange]);

  // Filter history based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredHistory(history);
    } else {
      const filtered = history.filter(
        (entry) =>
          entry.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (entry.description &&
            entry.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredHistory(filtered);
    }
  }, [history, searchTerm]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getHistory(selectedRange);
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case 'task_explanation':
        return <Brain className="text-blue-500" size={16} />;
      case 'auto_messenger':
        return <span className="text-purple-500 text-sm">💬</span>;
      case 'smart_scoring':
        return <span className="text-green-500 text-sm">🎯</span>;
      case 'weekly_reset':
        return <RefreshCw className="text-emerald-500" size={16} />;
      default:
        return <Brain className="text-gray-500" size={16} />;
    }
  };

  const getActionTypeLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      task_explanation: 'Task Explanation',
      auto_messenger: 'Auto Messenger',
      smart_scoring: 'Smart Scoring',
      weekly_reset: 'Weekly Reset',
      general: 'General Usage',
    };
    return labels[actionType] || actionType.replace('_', ' ');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Timestamp',
      'Action Type',
      'Credits Used',
      'Remaining',
      'Description',
    ];
    const csvContent = [
      headers.join(','),
      ...filteredHistory.map((entry) =>
        [
          new Date(entry.timestamp).toISOString(),
          entry.actionType,
          entry.creditsUsed,
          entry.remaining,
          `"${entry.description || ''}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cabot-credit-history-${selectedRange}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getTotalCreditsUsed = () => {
    return filteredHistory
      .filter((entry) => entry.actionType !== 'weekly_reset')
      .reduce((total, entry) => total + entry.creditsUsed, 0);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`
        fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-900 
        shadow-xl z-50 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        ${className}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Brain className="text-blue-500" size={24} />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  CaBOT Credit History
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track your AI assistant usage
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Controls */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Time Range Filter */}
              <div className="flex items-center gap-2">
                <Calendar className="text-gray-500" size={16} />
                <select
                  value={selectedRange}
                  onChange={(e) =>
                    setSelectedRange(e.target.value as TimeRange)
                  }
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                </select>
              </div>

              {/* Search and Actions */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search actions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <button
                  onClick={loadHistory}
                  disabled={loading}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw
                    size={16}
                    className={loading ? 'animate-spin' : ''}
                  />
                </button>

                <button
                  onClick={exportToCSV}
                  disabled={filteredHistory.length === 0}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Export to CSV"
                >
                  <Download size={14} />
                  Export
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Entries
                </div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">
                  {filteredHistory.length}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Credits Used
                </div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">
                  {getTotalCreditsUsed()}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Time Range
                </div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedRange === 'week' ? '7' : '30'} days
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="animate-spin text-blue-500" size={32} />
                  <span className="text-gray-600 dark:text-gray-400">
                    Loading history...
                  </span>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <AlertCircle className="text-red-500" size={32} />
                  <span className="text-gray-600 dark:text-gray-400">
                    {error}
                  </span>
                  <button
                    onClick={loadHistory}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <Brain className="text-gray-400" size={32} />
                  <span className="text-gray-600 dark:text-gray-400">
                    {searchTerm
                      ? 'No matching entries found'
                      : 'No credit history found'}
                  </span>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto">
                <div className="p-6">
                  <div className="space-y-4">
                    {filteredHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getActionTypeIcon(entry.actionType)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                {getActionTypeLabel(entry.actionType)}
                              </h4>
                              {entry.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {entry.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-500">
                                <Clock size={12} />
                                <span>{formatTimestamp(entry.timestamp)}</span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end text-right ml-4">
                              <div
                                className={`text-sm font-medium ${
                                  entry.creditsUsed > 0
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-green-600 dark:text-green-400'
                                }`}
                              >
                                {entry.creditsUsed > 0
                                  ? `-${entry.creditsUsed}`
                                  : '+' +
                                    (entry.remaining -
                                      (entry.remaining - entry.creditsUsed))}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-500">
                                {entry.remaining} remaining
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
