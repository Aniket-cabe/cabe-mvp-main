import React from 'react';
import { Zap, TrendingUp } from 'lucide-react';
import type { XPProgress, SkillArea } from '../types';

interface SkillXPBarProps {
  xpProgress: XPProgress;
  skill: SkillArea;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export default function SkillXPBar({
  xpProgress,
  skill,
  size = 'md',
  showDetails = true,
}: SkillXPBarProps) {
  const sizeClasses = {
    sm: {
      container: 'p-3',
      title: 'text-sm',
      value: 'text-lg',
      progress: 'h-1.5',
      icon: 'h-4 w-4',
    },
    md: {
      container: 'p-4',
      title: 'text-base',
      value: 'text-xl',
      progress: 'h-2',
      icon: 'h-5 w-5',
    },
    lg: {
      container: 'p-6',
      title: 'text-lg',
      value: 'text-2xl',
      progress: 'h-3',
      icon: 'h-6 w-6',
    },
  };

  const currentSize = sizeClasses[size];

  const getTierColor = (tier: string) => {
    const tierNumber = parseInt(tier.replace(/\D/g, ''));
    if (tierNumber >= 8) return 'text-purple-600';
    if (tierNumber >= 6) return 'text-blue-600';
    if (tierNumber >= 4) return 'text-green-600';
    if (tierNumber >= 2) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getTierName = (tier: string) => {
    const tierNumber = parseInt(tier.replace(/\D/g, ''));
    if (tierNumber >= 8) return 'Master';
    if (tierNumber >= 6) return 'Expert';
    if (tierNumber >= 4) return 'Advanced';
    if (tierNumber >= 2) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${currentSize.container}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg bg-${skill.color} bg-opacity-10 flex items-center justify-center`}
          >
            <Zap className={`${currentSize.icon} text-${skill.color}`} />
          </div>
          <div>
            <h3 className={`font-semibold text-gray-900 ${currentSize.title}`}>
              XP Progress
            </h3>
            <p className="text-xs text-gray-500">
              {getTierName(xpProgress.tier)} Level
            </p>
          </div>
        </div>

        {showDetails && (
          <div className="text-right">
            <div
              className={`font-bold text-gray-900 ${currentSize.value}`}
              data-testid="current-xp"
            >
              {xpProgress.current}
            </div>
            <div className="text-xs text-gray-500">XP</div>
          </div>
        )}
      </div>

      {/* XP Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{xpProgress.current} XP</span>
          <span>{xpProgress.total} XP</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`bg-${skill.color} ${currentSize.progress} rounded-full transition-all duration-500 ease-out relative`}
            style={{ width: `${xpProgress.progressPercentage}%` }}
            data-testid="xp-progress-bar"
            role="progressbar"
            aria-valuenow={xpProgress.progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`XP Progress: ${xpProgress.progressPercentage}% to ${xpProgress.nextTier}`}
          >
            {/* Progress glow effect */}
            <div
              className={`absolute inset-0 bg-${skill.color} bg-opacity-30 animate-pulse`}
            ></div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-600">
            {xpProgress.progressPercentage}% to {xpProgress.nextTier}
          </span>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="text-xs text-green-600 font-medium">
              +{xpProgress.total - xpProgress.current} XP needed
            </span>
          </div>
        </div>
      </div>

      {/* Tier Information */}
      {showDetails && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${getTierColor(xpProgress.tier)}`}>
              {xpProgress.tier}
            </span>
            <span className="text-gray-500">
              {getTierName(xpProgress.tier)}
            </span>
          </div>
          <div className="text-gray-500">Next: {xpProgress.nextTier}</div>
        </div>
      )}
    </div>
  );
}
