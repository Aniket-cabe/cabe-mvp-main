import React, { useState, useEffect } from 'react';
import {
  Brain,
  Clock,
  History,
  AlertTriangle,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { useCaBOTCredits } from '../hooks/useCaBOTCredits';
import CaBOTHistoryDrawer from './CaBOTHistoryDrawer';
import CaBOTLowBalanceToast from './CaBOTLowBalanceToast';
import CaBOTResetBanner from './CaBOTResetBanner';

interface CaBOTCreditMeterProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showHistory?: boolean;
  showResetBanner?: boolean;
}

export default function CaBOTCreditMeter({
  className = '',
  size = 'md',
  showHistory = true,
  showResetBanner = true,
}: CaBOTCreditMeterProps) {
  const {
    balance,
    maxCredits,
    loading,
    error,
    nextReset,
    consume,
    getHistory,
    refreshBalance,
  } = useCaBOTCredits();

  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isConsuming, setIsConsuming] = useState(false);

  // Calculate progress percentage
  const percentage = maxCredits > 0 ? (balance / maxCredits) * 100 : 0;

  // Determine colors based on balance
  const isLow = balance <= 1;
  const isCritical = balance === 0;

  const getColorClasses = () => {
    if (isCritical) return 'text-red-500 border-red-500';
    if (isLow) return 'text-amber-500 border-amber-500';
    return 'text-emerald-500 border-emerald-500';
  };

  const getRingColor = () => {
    if (isCritical) return '#ef4444'; // red-500
    if (isLow) return '#f59e0b'; // amber-500
    return '#10b981'; // emerald-500
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      size: 40,
      strokeWidth: 3,
      textSize: 'text-xs',
      iconSize: 12,
      containerSize: 'w-12 h-12',
    },
    md: {
      size: 64,
      strokeWidth: 4,
      textSize: 'text-sm',
      iconSize: 16,
      containerSize: 'w-16 h-16',
    },
    lg: {
      size: 80,
      strokeWidth: 5,
      textSize: 'text-base',
      iconSize: 20,
      containerSize: 'w-20 h-20',
    },
  };

  const config = sizeConfig[size];
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Simulate credit consumption (for demo/testing)
  const handleConsume = async () => {
    if (isConsuming || balance <= 0) return;

    setIsConsuming(true);
    try {
      await consume(1);
    } catch (err) {
      console.error('Failed to consume credit:', err);
    } finally {
      setIsConsuming(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center ${config.containerSize} ${className}`}
      >
        <RefreshCw
          className={`animate-spin text-gray-400`}
          size={config.iconSize}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center ${config.containerSize} ${className}`}
      >
        <AlertTriangle className="text-red-500" size={config.iconSize} />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Reset Banner */}
      {showResetBanner && balance < maxCredits && (
        <CaBOTResetBanner nextReset={nextReset} className="mb-4" />
      )}

      <div className="flex items-center gap-4">
        {/* Credit Ring Meter */}
        <div
          className="relative cursor-pointer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={handleConsume}
        >
          <svg
            width={config.size}
            height={config.size}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={config.size / 2}
              cy={config.size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={config.strokeWidth}
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />

            {/* Progress circle */}
            <circle
              cx={config.size / 2}
              cy={config.size / 2}
              r={radius}
              stroke={getRingColor()}
              strokeWidth={config.strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-in-out"
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Brain
              className={`${getColorClasses()} mb-1`}
              size={config.iconSize}
            />
            <span
              className={`font-bold ${config.textSize} ${getColorClasses()}`}
            >
              {balance}
            </span>
          </div>

          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg whitespace-nowrap z-10">
              <div className="text-center">
                <div className="font-semibold">CaBOT Credits</div>
                <div>
                  {balance}/{maxCredits} remaining
                </div>
                <div className="text-gray-300 dark:text-gray-600 mt-1">
                  1 credit = 1 CaBOT use. Resets weekly.
                </div>
                {balance > 0 && (
                  <div className="text-gray-300 dark:text-gray-600 mt-1">
                    Click to use credit
                  </div>
                )}
              </div>
              {/* Tooltip arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
            </div>
          )}
        </div>

        {/* Credit Info & Actions */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-semibold ${config.textSize}`}>
              {balance}/{maxCredits} Credits
            </span>
            {isLow && <Zap className="text-amber-500" size={12} />}
          </div>

          <div className="flex items-center gap-2">
            {showHistory && (
              <button
                onClick={() => setShowHistoryDrawer(true)}
                className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                <History size={12} />
                History
              </button>
            )}

            <button
              onClick={refreshBalance}
              disabled={loading}
              className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
        {isCritical && (
          <div className="flex items-center gap-1 text-red-500">
            <AlertTriangle size={12} />
            No credits remaining
          </div>
        )}

        {isLow && !isCritical && (
          <div className="flex items-center gap-1 text-amber-500">
            <AlertTriangle size={12} />
            Low credits
          </div>
        )}

        {!isLow && (
          <div className="flex items-center gap-1 text-emerald-500">
            <Zap size={12} />
            Credits available
          </div>
        )}

        {nextReset && (
          <div className="flex items-center gap-1">
            <Clock size={12} />
            Resets {new Date(nextReset).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* History Drawer */}
      {showHistory && (
        <CaBOTHistoryDrawer
          isOpen={showHistoryDrawer}
          onClose={() => setShowHistoryDrawer(false)}
          getHistory={getHistory}
        />
      )}

      {/* Low Balance Toast */}
      <CaBOTLowBalanceToast balance={balance} />

      {/* Demo consumption feedback */}
      {isConsuming && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
          <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-lg">
            <div className="flex items-center gap-2 text-sm">
              <Brain className="text-blue-500 animate-pulse" size={16} />
              <span>Using CaBOT credit...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
