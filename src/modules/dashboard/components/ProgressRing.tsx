import React from 'react';
import type { ProgressRingProps } from '../types';

export default function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = '#3B82F6',
  label,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return '#10B981'; // green-500
    if (percent >= 60) return '#3B82F6'; // blue-500
    if (percent >= 40) return '#F59E0B'; // amber-500
    return '#EF4444'; // red-500
  };

  const progressColor = getProgressColor(percentage);

  return (
    <div
      className="relative inline-block"
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        aria-label={label || `${percentage}% to next rank`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))',
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="text-2xl font-bold text-gray-900"
          data-testid="progress-percentage"
        >
          {percentage}%
        </div>
        <div className="text-xs text-gray-600 text-center">Complete</div>
      </div>

      {/* Animated glow effect */}
      <div
        className="absolute inset-0 rounded-full opacity-20 animate-pulse"
        style={{
          background: `conic-gradient(from 0deg, ${progressColor}, transparent ${percentage * 3.6}deg, transparent 360deg)`,
        }}
      />
    </div>
  );
}
