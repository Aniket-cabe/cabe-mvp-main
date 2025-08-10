import React from 'react';
import { Zap, Clock, AlertTriangle } from 'lucide-react';
import type { CabotCreditRingProps } from '../types';

export default function CabotCreditRing({
  credits,
  size = 120,
  strokeWidth = 8,
  showCountdown = true,
}: CabotCreditRingProps) {
  const percentage = (credits.current / credits.max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getCreditColor = (percent: number) => {
    if (percent <= 10) return '#EF4444'; // red-500
    if (percent <= 30) return '#F59E0B'; // amber-500
    if (percent <= 60) return '#3B82F6'; // blue-500
    return '#10B981'; // green-500
  };

  const getCreditStatus = () => {
    if (percentage <= 10)
      return { status: 'critical', icon: AlertTriangle, color: 'text-red-600' };
    if (percentage <= 30)
      return { status: 'low', icon: AlertTriangle, color: 'text-amber-600' };
    if (percentage <= 60)
      return { status: 'medium', icon: Zap, color: 'text-blue-600' };
    return { status: 'good', icon: Zap, color: 'text-green-600' };
  };

  const creditStatus = getCreditStatus();
  const IconComponent = creditStatus.icon;

  const formatTimeUntilReset = () => {
    const now = new Date();
    const reset = new Date(credits.resetTime);
    const diff = reset.getTime() - now.getTime();

    if (diff <= 0) return 'Reset now';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const timeUntilReset = formatTimeUntilReset();

  return (
    <div
      className="relative inline-block"
      role="progressbar"
      aria-valuenow={credits.current}
      aria-valuemin={0}
      aria-valuemax={credits.max}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        aria-label={`${percentage.toFixed(0)}% CaBOT credits remaining`}
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
          stroke={getCreditColor(percentage)}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${getCreditColor(percentage)}40)`,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-center justify-center mb-1">
          <IconComponent className={`h-5 w-5 ${creditStatus.color}`} />
        </div>
        <div
          className="text-lg font-bold text-gray-900"
          data-testid="credit-percentage"
        >
          {credits.current}
        </div>
        <div className="text-xs text-gray-600 text-center">
          of {credits.max}
        </div>
        <div className="text-xs text-gray-500 text-center mt-1">
          {percentage.toFixed(0)}% left
        </div>
      </div>

      {/* Countdown timer */}
      {showCountdown && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
            <Clock className="h-3 w-3" />
            <span>Reset in {timeUntilReset}</span>
          </div>
        </div>
      )}

      {/* Animated glow effect for low credits */}
      {percentage <= 30 && (
        <div
          className="absolute inset-0 rounded-full opacity-20 animate-pulse"
          style={{
            background: `conic-gradient(from 0deg, ${getCreditColor(percentage)}, transparent ${percentage * 3.6}deg, transparent 360deg)`,
          }}
        />
      )}

      {/* Warning indicator for critical credits */}
      {percentage <= 10 && (
        <div className="absolute -top-2 -right-2">
          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
}
