import React from 'react';
import { motion } from 'framer-motion';

interface RankProgressProps {
  currentPoints: number;
  currentRank: string;
  nextRank: string;
  pointsToNextRank: number;
  progressPercentage: number;
  variant?: 'circular' | 'linear';
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

const RankProgress: React.FC<RankProgressProps> = ({
  currentPoints,
  currentRank,
  nextRank,
  pointsToNextRank,
  progressPercentage,
  variant = 'circular',
  size = 'md',
  showDetails = true,
  className = '',
}) => {
  const getRankInfo = (rank: string) => {
    const rankData = {
      Bronze: {
        icon: '🥉',
        color: '#CD7F32',
        bgColor: 'bg-amber-100',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-800',
        threshold: 0,
      },
      Silver: {
        icon: '🥈',
        color: '#C0C0C0',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-800',
        threshold: 1000,
      },
      Gold: {
        icon: '🥇',
        color: '#FFD700',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        threshold: 5000,
      },
      Platinum: {
        icon: '💎',
        color: '#E5E4E2',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        threshold: 10000,
      },
      Diamond: {
        icon: '💎',
        color: '#B9F2FF',
        bgColor: 'bg-cyan-100',
        borderColor: 'border-cyan-200',
        textColor: 'text-cyan-800',
        threshold: 25000,
      },
    };
    return rankData[rank as keyof typeof rankData] || rankData.Bronze;
  };

  const currentRankInfo = getRankInfo(currentRank);
  const nextRankInfo = getRankInfo(nextRank);

  const sizeClasses = {
    sm: {
      circular: 'w-16 h-16',
      linear: 'h-2',
      text: 'text-xs',
      icon: 'text-lg',
    },
    md: {
      circular: 'w-24 h-24',
      linear: 'h-3',
      text: 'text-sm',
      icon: 'text-2xl',
    },
    lg: {
      circular: 'w-32 h-32',
      linear: 'h-4',
      text: 'text-base',
      icon: 'text-3xl',
    },
  };

  const CircularProgress = () => (
    <div className={`relative ${sizeClasses[size].circular} ${className}`}>
      {/* Background Circle */}
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-200"
        />
        {/* Progress Circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          className="text-blue-500"
          initial={{ strokeDasharray: '0 283' }}
          animate={{ strokeDasharray: `${(progressPercentage / 100) * 283} 283` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`${sizeClasses[size].icon} mb-1`}>
          {currentRankInfo.icon}
        </div>
        <div className={`${sizeClasses[size].text} font-semibold text-gray-900`}>
          {Math.round(progressPercentage)}%
        </div>
      </div>

      {/* Rank Badge */}
      <div className="absolute -top-2 -right-2">
        <div className={`px-2 py-1 rounded-full border ${currentRankInfo.bgColor} ${currentRankInfo.borderColor} ${currentRankInfo.textColor} text-xs font-medium`}>
          {currentRank}
        </div>
      </div>
    </div>
  );

  const LinearProgress = () => (
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      <div className={`relative ${sizeClasses[size].linear} bg-gray-200 rounded-full overflow-hidden`}>
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        
        {/* Progress Indicator */}
        <motion.div
          className="absolute top-0 right-0 w-1 h-full bg-white rounded-full shadow-sm"
          initial={{ left: 0 }}
          animate={{ left: `${progressPercentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Progress Text */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-2">
          <span className={`${sizeClasses[size].icon}`}>{currentRankInfo.icon}</span>
          <span className={`${sizeClasses[size].text} font-medium text-gray-900`}>
            {currentRank}
          </span>
        </div>
        <div className={`${sizeClasses[size].text} text-gray-600`}>
          {Math.round(progressPercentage)}%
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Progress Component */}
      {variant === 'circular' ? <CircularProgress /> : <LinearProgress />}

      {/* Details */}
      {showDetails && (
        <div className="space-y-3">
          {/* Current Stats */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Current Points</span>
              <span className="text-lg font-bold text-gray-900">{currentPoints.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-600">To Next Rank</span>
              <span className="text-sm font-medium text-blue-600">
                {pointsToNextRank.toLocaleString()} pts
              </span>
            </div>
          </div>

          {/* Rank Comparison */}
          <div className="grid grid-cols-2 gap-3">
            {/* Current Rank */}
            <div className={`${currentRankInfo.bgColor} ${currentRankInfo.borderColor} border rounded-lg p-3`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">{currentRankInfo.icon}</span>
                <span className={`${currentRankInfo.textColor} font-semibold`}>
                  {currentRank}
                </span>
              </div>
              <div className="text-xs text-gray-600">
                {currentRankInfo.threshold.toLocaleString()} pts
              </div>
            </div>

            {/* Next Rank */}
            <div className={`${nextRankInfo.bgColor} ${nextRankInfo.borderColor} border rounded-lg p-3`}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">{nextRankInfo.icon}</span>
                <span className={`${nextRankInfo.textColor} font-semibold`}>
                  {nextRank}
                </span>
              </div>
              <div className="text-xs text-gray-600">
                {nextRankInfo.threshold.toLocaleString()} pts
              </div>
            </div>
          </div>

          {/* Progress Message */}
          <div className="text-center">
            {progressPercentage >= 100 ? (
              <div className="text-green-600 font-medium">
                🎉 You've reached the maximum rank!
              </div>
            ) : (
              <div className="text-gray-600">
                <span className="font-medium">{pointsToNextRank.toLocaleString()} points</span> needed for {nextRank}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RankProgress;
