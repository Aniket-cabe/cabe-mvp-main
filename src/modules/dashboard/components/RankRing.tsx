import React from 'react';
import ProgressRing from './ProgressRing';
import type { ProgressData } from '../types';

interface RankRingProps {
  progress: ProgressData;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

/**
 * RankRing component for displaying user's rank progression.
 * Shows a circular progress ring with rank-specific styling and animations.
 *
 * Features:
 * - SVG circular progress ring with smooth animations
 * - Dynamic color based on progress percentage
 * - Rank-specific styling and glow effects
 * - Accessibility support with ARIA labels
 * - Micro-animations on load with transition-stroke-dasharray
 */
export default function RankRing({
  progress,
  size = 120,
  strokeWidth = 8,
  showLabel = true,
  className = '',
}: RankRingProps) {
  const getRankColor = (rankName: string) => {
    switch (rankName.toLowerCase()) {
      case 'bronze':
        return '#CD7F32'; // Bronze color
      case 'silver':
        return '#C0C0C0'; // Silver color
      case 'gold':
        return '#FFD700'; // Gold color
      case 'platinum':
        return '#E5E4E2'; // Platinum color
      case 'diamond':
        return '#B9F2FF'; // Diamond color
      default:
        return '#3B82F6'; // Default blue
    }
  };

  const rankColor = getRankColor(progress.rankName);
  const label = showLabel
    ? `${progress.percentage}% to ${progress.nextRankName}`
    : undefined;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <ProgressRing
        percentage={progress.percentage}
        size={size}
        strokeWidth={strokeWidth}
        color={rankColor}
        label={label}
      />

      {showLabel && (
        <div className="mt-4 text-center">
          <div className="text-sm font-medium text-gray-900">
            {progress.rankName} → {progress.nextRankName}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Only {progress.delta} pts to {progress.nextRankName}
          </div>
        </div>
      )}
    </div>
  );
}
