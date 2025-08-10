import React from 'react';
import { AlertTriangle, Clock, ArrowRight, Droplets } from 'lucide-react';
import type { DecayBannerProps } from '../types';

export default function DecayBanner({
  lastSubmission,
  onViewHistory,
}: DecayBannerProps) {
  const calculateDaysSinceLastSubmission = () => {
    const now = new Date();
    const lastSub = new Date(lastSubmission);
    const diffTime = Math.abs(now.getTime() - lastSub.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysSinceLastSubmission = calculateDaysSinceLastSubmission();
  const shouldShowWarning = daysSinceLastSubmission > 7;

  if (!shouldShowWarning) {
    return null;
  }

  const getWarningLevel = () => {
    if (daysSinceLastSubmission > 14) {
      return {
        color: 'bg-red-50 border-red-200 text-red-800',
        icon: 'text-red-600',
        urgency: 'high',
      };
    } else if (daysSinceLastSubmission > 10) {
      return {
        color: 'bg-orange-50 border-orange-200 text-orange-800',
        icon: 'text-orange-600',
        urgency: 'medium',
      };
    } else {
      return {
        color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        icon: 'text-yellow-600',
        urgency: 'low',
      };
    }
  };

  const warningLevel = getWarningLevel();

  const getUrgencyMessage = () => {
    switch (warningLevel.urgency) {
      case 'high':
        return '🚨 Critical: Points are rapidly decaying!';
      case 'medium':
        return '⚠️ Warning: Points are dripping away!';
      default:
        return '💧 Notice: Points are starting to decay';
    }
  };

  return (
    <div
      className={`border-l-4 ${warningLevel.color} p-4 mb-6 rounded-r-lg shadow-sm`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 ${warningLevel.icon} bg-white rounded-lg flex items-center justify-center shadow-sm`}
          >
            <Droplets className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4" />
              <h3 className="font-semibold text-sm">{getUrgencyMessage()}</h3>
            </div>

            <p className="text-sm mb-3 leading-relaxed">
              Points drip away after day 7 — do a quick task to plug the leak.
            </p>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {daysSinceLastSubmission} day
                  {daysSinceLastSubmission !== 1 ? 's' : ''} since last
                  submission
                </span>
              </div>

              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                <span>
                  {daysSinceLastSubmission - 7} day
                  {daysSinceLastSubmission - 7 !== 1 ? 's' : ''} of decay
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onViewHistory}
            className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-50 rounded-md text-xs font-medium transition-colors border border-gray-200"
          >
            <span>View Decay History</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Progress bar showing decay severity */}
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span>Decay Progress</span>
          <span>
            {Math.min(100, ((daysSinceLastSubmission - 7) / 7) * 100).toFixed(
              0
            )}
            %
          </span>
        </div>
        <div
          className="w-full bg-white bg-opacity-50 rounded-full h-1.5"
          data-testid="decay-progress"
        >
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${
              warningLevel.urgency === 'high'
                ? 'bg-red-500'
                : warningLevel.urgency === 'medium'
                  ? 'bg-orange-500'
                  : 'bg-yellow-500'
            }`}
            style={{
              width: `${Math.min(100, ((daysSinceLastSubmission - 7) / 7) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Quick action suggestions */}
      <div className="mt-3 pt-3 border-t border-current border-opacity-20">
        <p className="text-xs mb-2 font-medium">Quick Actions:</p>
        <div className="flex flex-wrap gap-2">
          <button className="px-2 py-1 bg-white bg-opacity-70 hover:bg-opacity-90 rounded text-xs transition-colors">
            Find Easy Tasks
          </button>
          <button className="px-2 py-1 bg-white bg-opacity-70 hover:bg-opacity-90 rounded text-xs transition-colors">
            Take a Course
          </button>
          <button className="px-2 py-1 bg-white bg-opacity-70 hover:bg-opacity-90 rounded text-xs transition-colors">
            Join Challenge
          </button>
        </div>
      </div>
    </div>
  );
}
