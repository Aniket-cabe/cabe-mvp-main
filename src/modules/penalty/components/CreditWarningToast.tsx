import React, { useEffect } from 'react';
import { X, AlertTriangle, Zap, ArrowRight } from 'lucide-react';
import type { CreditWarningToastProps } from '../types';

export default function CreditWarningToast({
  isVisible,
  onClose,
  creditsLeft,
}: CreditWarningToastProps) {
  // Auto-hide after 8 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getWarningLevel = () => {
    if (creditsLeft === 0) {
      return {
        color: 'bg-red-50 border-red-200 text-red-800',
        icon: 'text-red-600',
        message: "You're completely outta juice!",
        urgency: 'critical',
      };
    } else if (creditsLeft === 1) {
      return {
        color: 'bg-orange-50 border-orange-200 text-orange-800',
        icon: 'text-orange-600',
        message: "You're almost outta juice!",
        urgency: 'high',
      };
    } else {
      return {
        color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        icon: 'text-yellow-600',
        message: "You're running low on juice!",
        urgency: 'medium',
      };
    }
  };

  const warningLevel = getWarningLevel();

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full ${warningLevel.color} border border-l-4 rounded-lg shadow-lg p-4 animate-in slide-in-from-right duration-300`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 ${warningLevel.icon} bg-white rounded-lg flex items-center justify-center flex-shrink-0`}
        >
          <AlertTriangle className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-sm">{warningLevel.message}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 -m-1"
              aria-label="Close warning"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm mb-3 leading-relaxed">
            {creditsLeft === 0
              ? 'Earn credits to ask CaBOT for help with your tasks.'
              : `Only ${creditsLeft} credit${creditsLeft !== 1 ? 's' : ''} remaining. Earn more to keep using CaBOT.`}
          </p>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <Zap className="h-3 w-3" />
              <span>
                {creditsLeft} credit{creditsLeft !== 1 ? 's' : ''} left
              </span>
            </div>

            {creditsLeft === 0 && (
              <div className="flex items-center gap-1 text-xs">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>No credits available</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-3">
            <button className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-50 rounded-md text-xs font-medium transition-colors border border-gray-200">
              <span>Earn Credits</span>
              <ArrowRight className="h-3 w-3" />
            </button>

            <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-xs font-medium transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar for auto-hide */}
      <div className="mt-3">
        <div className="w-full bg-white bg-opacity-50 rounded-full h-1">
          <div
            className={`h-1 rounded-full transition-all duration-8000 ease-linear ${
              warningLevel.urgency === 'critical'
                ? 'bg-red-500'
                : warningLevel.urgency === 'high'
                  ? 'bg-orange-500'
                  : 'bg-yellow-500'
            }`}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
