import React, { useState } from 'react';
import { Trophy, Star, Crown, Gem } from 'lucide-react';
import type { Badge, SkillArea } from '../types';

interface BadgeStripProps {
  badges: Badge[];
  skill: SkillArea;
}

export default function BadgeStrip({ badges, skill }: BadgeStripProps) {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rare':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'epic':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return <Star className="h-3 w-3" />;
      case 'rare':
        return <Star className="h-3 w-3" />;
      case 'epic':
        return <Crown className="h-3 w-3" />;
      case 'legendary':
        return <Gem className="h-3 w-3" />;
      default:
        return <Star className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (badges.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <div className="text-gray-400 text-4xl mb-3">🏆</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No badges yet
        </h3>
        <p className="text-gray-600 mb-4">
          Complete tasks in {skill.name} to unlock badges and achievements.
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <Trophy className="h-4 w-4" />
          <span>Keep practicing to earn your first badge!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Badges & Achievements
          </h2>
          <p className="text-sm text-gray-600">
            {badges.length} badge{badges.length !== 1 ? 's' : ''} unlocked in{' '}
            {skill.name}
          </p>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Trophy className="h-4 w-4" />
          <span>{badges.length}</span>
        </div>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        data-testid="badge-grid"
      >
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${getRarityColor(badge.rarity)}`}
            onMouseEnter={() => setHoveredBadge(badge.id)}
            onMouseLeave={() => setHoveredBadge(null)}
            data-testid={`badge-${badge.id}`}
          >
            {/* Rarity Indicator */}
            <div className="absolute top-2 right-2">
              {getRarityIcon(badge.rarity)}
            </div>

            {/* Badge Content */}
            <div className="flex items-start gap-3">
              <div className="text-2xl">{badge.icon}</div>
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-sm mb-1 line-clamp-1"
                  data-testid={`badge-name-${badge.id}`}
                >
                  {badge.name}
                </h3>
                <p
                  className="text-xs opacity-80 line-clamp-2 mb-2"
                  data-testid={`badge-description-${badge.id}`}
                >
                  {badge.description}
                </p>
                <div
                  className="text-xs opacity-70"
                  data-testid={`badge-date-${badge.id}`}
                >
                  Unlocked {formatDate(badge.unlockedAt)}
                </div>
              </div>
            </div>

            {/* Tooltip */}
            {hoveredBadge === badge.id && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10 whitespace-nowrap">
                <div className="font-semibold mb-1">{badge.name}</div>
                <div className="opacity-90">{badge.description}</div>
                <div className="opacity-70 mt-1">
                  Requirements: {badge.requirements.tasksCompleted} tasks,{' '}
                  {badge.requirements.averageScore}% avg score
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Badge Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600">
                {badges.filter((b) => b.rarity === 'common').length} Common
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-blue-400" />
              <span className="text-gray-600">
                {badges.filter((b) => b.rarity === 'rare').length} Rare
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Crown className="h-3 w-3 text-purple-400" />
              <span className="text-gray-600">
                {badges.filter((b) => b.rarity === 'epic').length} Epic
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Gem className="h-3 w-3 text-yellow-400" />
              <span className="text-gray-600">
                {badges.filter((b) => b.rarity === 'legendary').length}{' '}
                Legendary
              </span>
            </div>
          </div>
          <div className="text-gray-500">Total: {badges.length} badges</div>
        </div>
      </div>
    </div>
  );
}
