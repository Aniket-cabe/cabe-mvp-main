import React from 'react';
import BadgeItem from './BadgeItem';
import type { BadgeGridProps } from '../types';

export default function BadgeGrid({
  badges,
  onBadgeClick,
  filter = 'all',
}: BadgeGridProps) {
  const filteredBadges = React.useMemo(() => {
    if (filter === 'all') return badges;
    if (filter === 'earned') return badges.filter((badge) => badge.earned);
    if (filter === 'locked') return badges.filter((badge) => !badge.earned);
    return badges.filter((badge) => badge.category === filter);
  }, [badges, filter]);

  const earnedCount = badges.filter((badge) => badge.earned).length;
  const totalCount = badges.length;

  if (filteredBadges.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🏆</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {filter === 'earned'
            ? 'No badges earned yet'
            : filter === 'locked'
              ? 'No locked badges'
              : filter !== 'all'
                ? `No ${filter} badges`
                : 'No badges found'}
        </h3>
        <p className="text-gray-600">
          {filter === 'earned'
            ? 'Start completing tasks to earn your first badge!'
            : filter === 'locked'
              ? 'All badges are earned!'
              : filter !== 'all'
                ? `No ${filter} category badges available.`
                : 'No badges available.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {filter === 'all'
                ? 'All Badges'
                : filter === 'earned'
                  ? 'Earned Badges'
                  : filter === 'locked'
                    ? 'Locked Badges'
                    : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Badges`}
            </h2>
            <p className="text-sm text-gray-600">
              {filteredBadges.length} badge
              {filteredBadges.length !== 1 ? 's' : ''}
              {filter === 'all' && ` • ${earnedCount}/${totalCount} earned`}
            </p>
          </div>

          {filter === 'all' && (
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(earnedCount / totalCount) * 100}%` }}
                  role="progressbar"
                  aria-valuenow={earnedCount}
                  aria-valuemin={0}
                  aria-valuemax={totalCount}
                  aria-label={`${earnedCount} out of ${totalCount} badges earned`}
                />
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {Math.round((earnedCount / totalCount) * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Masonry Grid */}
      <div
        className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-0"
        data-testid="badge-grid"
      >
        {filteredBadges.map((badge) => (
          <BadgeItem key={badge.id} badge={badge} onBadgeClick={onBadgeClick} />
        ))}
      </div>

      {/* Empty State for Filtered Results */}
      {filteredBadges.length === 0 && filter !== 'all' && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {filter} badges found
          </h3>
          <p className="text-gray-600">
            Try a different filter or check back later for new badges.
          </p>
        </div>
      )}
    </div>
  );
}
