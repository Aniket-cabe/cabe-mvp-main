import React, { useState } from 'react';
import { Trophy, Filter, RefreshCw } from 'lucide-react';
import { useBadges } from '../hooks/useBadges';
import BadgeGrid from '../components/BadgeGrid';
import type { Badge } from '../types';

export default function Achievements() {
  const { badges, loading, error, refetch } = useBadges();
  const [filter, setFilter] = useState<
    'all' | 'earned' | 'locked' | Badge['category']
  >('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    // You could open a modal or navigate to a detailed view here
    console.log('Badge clicked:', badge);
  };

  const earnedCount = badges.filter((badge) => badge.earned).length;
  const totalCount = badges.length;

  const filterOptions = [
    { value: 'all', label: 'All Badges', icon: '🏆' },
    { value: 'earned', label: 'Earned', icon: '✅' },
    { value: 'locked', label: 'Locked', icon: '🔒' },
    { value: 'arena', label: 'Arena', icon: '⚔️' },
    { value: 'learning', label: 'Learning', icon: '📚' },
    { value: 'social', label: 'Social', icon: '🤝' },
    { value: 'streak', label: 'Streak', icon: '🔥' },
    { value: 'special', label: 'Special', icon: '⭐' },
  ] as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Achievements
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Achievements & Badges
                </h1>
                <p className="text-gray-600">
                  Track your progress and unlock new achievements
                </p>
              </div>
            </div>
            <button
              onClick={refetch}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Refresh badges"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {earnedCount}
              </div>
              <div className="text-sm text-blue-600">Badges Earned</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {totalCount - earnedCount}
              </div>
              <div className="text-sm text-gray-600">Badges Remaining</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((earnedCount / totalCount) * 100)}%
              </div>
              <div className="text-sm text-green-600">Completion Rate</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {badges.filter((b) => b.rarity === 'legendary').length}
              </div>
              <div className="text-sm text-purple-600">Legendary Badges</div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">
              Filter Badges
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                  ${
                    filter === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
                data-testid={`filter-${option.value}`}
              >
                <span>{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Badge Grid */}
        <BadgeGrid
          badges={badges}
          onBadgeClick={handleBadgeClick}
          filter={filter}
        />

        {/* Selected Badge Modal (if needed) */}
        {selectedBadge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <div className="text-center">
                <div className="text-6xl mb-4">{selectedBadge.emoji}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedBadge.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedBadge.description}
                </p>

                {selectedBadge.earned && selectedBadge.dateEarned && (
                  <p className="text-sm text-gray-500 mb-4">
                    Earned on{' '}
                    {new Date(selectedBadge.dateEarned).toLocaleDateString()}
                  </p>
                )}

                {!selectedBadge.earned && (
                  <p className="text-sm text-gray-500 mb-4">
                    {selectedBadge.requirements}
                  </p>
                )}

                <button
                  onClick={() => setSelectedBadge(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
