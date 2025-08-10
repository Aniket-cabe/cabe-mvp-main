import React, { useState, useEffect } from 'react';
import type { BadgeItemProps } from '../types';

export default function BadgeItem({ badge, onBadgeClick }: BadgeItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Trigger animation when badge is earned
  useEffect(() => {
    if (badge.earned && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [badge.earned, hasAnimated]);

  const handleClick = () => {
    if (onBadgeClick) {
      onBadgeClick(badge);
    }
  };

  const getProgressText = () => {
    if (!badge.progress) return null;

    const { current, total, unit } = badge.progress;
    const remaining = total - current;

    if (remaining === 0) return null;
    if (remaining === 1)
      return `Only 1 more ${unit.slice(0, -1)}. Let's go. 💥`;
    return `Only ${remaining} more ${unit}. Let's go. 💥`;
  };

  const getRarityColor = () => {
    switch (badge.rarity) {
      case 'legendary':
        return 'border-yellow-400 bg-yellow-50';
      case 'epic':
        return 'border-purple-400 bg-purple-50';
      case 'rare':
        return 'border-blue-400 bg-blue-50';
      case 'common':
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityGlow = () => {
    switch (badge.rarity) {
      case 'legendary':
        return 'shadow-yellow-200';
      case 'epic':
        return 'shadow-purple-200';
      case 'rare':
        return 'shadow-blue-200';
      case 'common':
      default:
        return 'shadow-gray-200';
    }
  };

  const progressPercentage = badge.progress
    ? Math.min(100, (badge.progress.current / badge.progress.total) * 100)
    : 0;

  return (
    <div className="relative break-inside-avoid mb-4">
      <div
        className={`
          relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
          ${
            badge.earned
              ? `${getRarityColor()} hover:shadow-lg ${getRarityGlow()} hover:scale-105`
              : 'border-gray-300 bg-gray-50 opacity-70 grayscale'
          }
          ${badge.earned && hasAnimated ? 'animate-[pop_400ms_ease-out]' : ''}
        `}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        role="button"
        tabIndex={0}
        aria-label={`Badge: ${badge.title} — ${badge.earned ? 'earned' : 'locked'}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {/* Badge Content */}
        <div className="text-center">
          <div className="text-4xl mb-2" role="img" aria-label={badge.title}>
            {badge.emoji}
          </div>
          <h3 className="font-semibold text-gray-900 mb-1 text-sm">
            {badge.title}
          </h3>
          <p className="text-xs text-gray-600 mb-2">{badge.description}</p>

          {/* Progress Bar */}
          {badge.progress && progressPercentage < 100 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>
                  {badge.progress.current}/{badge.progress.total}
                </span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                  role="progressbar"
                  aria-valuenow={progressPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progress: ${progressPercentage}%`}
                />
              </div>
            </div>
          )}

          {/* Earned Date */}
          {badge.earned && badge.dateEarned && (
            <div className="mt-2 text-xs text-gray-500">
              Earned {new Date(badge.dateEarned).toLocaleDateString()}
            </div>
          )}

          {/* Locked Indicator */}
          {!badge.earned && (
            <div className="mt-2 text-xs text-gray-500">
              {badge.requirements}
            </div>
          )}
        </div>

        {/* Rarity Indicator */}
        <div className="absolute top-2 right-2">
          <div
            className={`
            w-2 h-2 rounded-full
            ${
              badge.rarity === 'legendary'
                ? 'bg-yellow-400'
                : badge.rarity === 'epic'
                  ? 'bg-purple-400'
                  : badge.rarity === 'rare'
                    ? 'bg-blue-400'
                    : 'bg-gray-400'
            }
          `}
          />
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10 whitespace-nowrap">
          <div className="font-semibold mb-1">{badge.title}</div>
          <div className="opacity-90">{badge.description}</div>
          {getProgressText() && (
            <div className="opacity-90 mt-1">{getProgressText()}</div>
          )}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}

// Add keyframe animation for pop effect
const style = document.createElement('style');
style.textContent = `
  @keyframes pop {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1.05);
    }
  }
`;
document.head.appendChild(style);
