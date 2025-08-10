import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, Zap, Calendar, X } from 'lucide-react';

interface CaBOTResetBannerProps {
  nextReset: string | null;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  showCloseButton?: boolean;
  onClose?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CaBOTResetBanner({
  nextReset,
  className = '',
  variant = 'default',
  showCloseButton = false,
  onClose,
}: CaBOTResetBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(
    null
  );
  const [isVisible, setIsVisible] = useState(true);
  const [isUrgent, setIsUrgent] = useState(false);

  // Calculate time remaining until reset
  useEffect(() => {
    if (!nextReset) {
      setTimeRemaining(null);
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const resetTime = new Date(nextReset).getTime();
      const diff = resetTime - now;

      if (diff <= 0) {
        setTimeRemaining(null);
        return;
      }

      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      const hours = Math.floor(
        (diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
      );
      const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((diff % (60 * 1000)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });

      // Mark as urgent if less than 24 hours remaining
      setIsUrgent(days === 0 && hours < 24);
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextReset]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  // Don't render if no reset time or banner is hidden
  if (!timeRemaining || !isVisible) return null;

  const formatTimeUnit = (value: number, unit: string) => {
    const displayValue = value.toString().padStart(2, '0');
    return { value: displayValue, unit: value === 1 ? unit : `${unit}s` };
  };

  const getVariantStyles = () => {
    const baseStyles = isUrgent
      ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-red-200 dark:border-red-800'
      : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800';

    switch (variant) {
      case 'compact':
        return `${baseStyles} rounded-lg border p-3`;
      case 'minimal':
        return `${baseStyles} rounded-md border p-2`;
      default:
        return `${baseStyles} rounded-xl border p-4`;
    }
  };

  const getTextStyles = () => {
    return isUrgent
      ? 'text-red-800 dark:text-red-200'
      : 'text-blue-800 dark:text-blue-200';
  };

  const getIconColor = () => {
    return isUrgent ? 'text-red-500' : 'text-blue-500';
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`${getVariantStyles()} ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw
              className={`${getIconColor()} ${isUrgent ? 'animate-pulse' : ''}`}
              size={16}
            />
            <span className={`text-sm font-medium ${getTextStyles()}`}>
              Credits reset in {timeRemaining.days}d {timeRemaining.hours}h{' '}
              {timeRemaining.minutes}m
            </span>
          </div>
          {showCloseButton && (
            <button
              onClick={handleClose}
              className={`${getTextStyles()} opacity-70 hover:opacity-100`}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <div className={`${getVariantStyles()} ${className}`}>
        <div className="flex items-center gap-2 text-xs">
          <Clock className={getIconColor()} size={12} />
          <span className={`${getTextStyles()} opacity-80`}>
            Resets in {timeRemaining.days}d {timeRemaining.hours}h
          </span>
        </div>
      </div>
    );
  }

  // Default variant - full banner
  return (
    <div className={`${getVariantStyles()} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg ${isUrgent ? 'bg-red-100 dark:bg-red-900' : 'bg-blue-100 dark:bg-blue-900'}`}
            >
              <RefreshCw
                className={`${getIconColor()} ${isUrgent ? 'animate-pulse' : ''}`}
                size={20}
              />
            </div>
            <div>
              <h3 className={`font-semibold ${getTextStyles()}`}>
                {isUrgent ? '🔥 Credits Reset Soon!' : '⏰ Weekly Credit Reset'}
              </h3>
              <p className={`text-sm ${getTextStyles()} opacity-80`}>
                {isUrgent
                  ? 'Your CaBOT credits will refresh very soon!'
                  : 'Your CaBOT credits will refresh automatically'}
              </p>
            </div>
          </div>

          {/* Countdown Display */}
          <div className="flex items-center gap-3">
            {timeRemaining.days > 0 && (
              <div className="text-center">
                <div className={`text-2xl font-bold ${getTextStyles()}`}>
                  {formatTimeUnit(timeRemaining.days, 'day').value}
                </div>
                <div className={`text-xs ${getTextStyles()} opacity-70`}>
                  {formatTimeUnit(timeRemaining.days, 'day').unit}
                </div>
              </div>
            )}

            {(timeRemaining.days > 0 || timeRemaining.hours > 0) && (
              <>
                {timeRemaining.days > 0 && (
                  <div className={`text-xl ${getTextStyles()} opacity-50`}>
                    :
                  </div>
                )}
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getTextStyles()}`}>
                    {formatTimeUnit(timeRemaining.hours, 'hour').value}
                  </div>
                  <div className={`text-xs ${getTextStyles()} opacity-70`}>
                    {formatTimeUnit(timeRemaining.hours, 'hour').unit}
                  </div>
                </div>
              </>
            )}

            <div className={`text-xl ${getTextStyles()} opacity-50`}>:</div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getTextStyles()}`}>
                {formatTimeUnit(timeRemaining.minutes, 'min').value}
              </div>
              <div className={`text-xs ${getTextStyles()} opacity-70`}>
                {formatTimeUnit(timeRemaining.minutes, 'min').unit}
              </div>
            </div>

            {isUrgent && (
              <>
                <div className={`text-xl ${getTextStyles()} opacity-50`}>:</div>
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${getTextStyles()} animate-pulse`}
                  >
                    {formatTimeUnit(timeRemaining.seconds, 'sec').value}
                  </div>
                  <div className={`text-xs ${getTextStyles()} opacity-70`}>
                    {formatTimeUnit(timeRemaining.seconds, 'sec').unit}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <Zap
              className={`${getIconColor()} ${isUrgent ? 'animate-bounce' : ''}`}
              size={16}
            />
            <span className={`text-sm ${getTextStyles()} opacity-80`}>
              {isUrgent ? 'Almost there!' : '5 credits coming'}
            </span>
          </div>

          {showCloseButton && (
            <button
              onClick={handleClose}
              className={`p-1 rounded-md ${getTextStyles()} opacity-70 hover:opacity-100 hover:bg-white hover:bg-opacity-20 transition-all`}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar for urgent state */}
      {isUrgent && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={`${getTextStyles()} opacity-70`}>
              Reset Progress
            </span>
            <span className={`${getTextStyles()} font-medium`}>
              {timeRemaining.hours < 1
                ? 'Within the hour!'
                : `${timeRemaining.hours}h remaining`}
            </span>
          </div>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-red-400 to-orange-400 h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.max(5, 100 - ((timeRemaining.hours * 60 + timeRemaining.minutes) / (24 * 60)) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Weekly schedule hint */}
      {!isUrgent && timeRemaining.days > 1 && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <Calendar className={`${getIconColor()}`} size={12} />
          <span className={`${getTextStyles()} opacity-70`}>
            Credits reset every Monday at 00:00 UTC
          </span>
        </div>
      )}
    </div>
  );
}
