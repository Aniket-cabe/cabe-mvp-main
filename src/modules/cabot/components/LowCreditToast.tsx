import React, { useEffect } from 'react';
import { X, AlertTriangle, Brain } from 'lucide-react';
import type { LowCreditToastProps } from '../types';

export default function LowCreditToast({
  isVisible,
  onDismiss,
  creditsLeft,
}: LowCreditToastProps) {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Brain className="h-4 w-4 text-red-600" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <h3 className="text-sm font-semibold text-red-800">
                Running low on CaBOT juice 🧠
              </h3>
            </div>
            <p className="text-sm text-red-700">
              Only {creditsLeft} credit{creditsLeft !== 1 ? 's' : ''} remaining.
              Refill coming soon!
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors p-1"
            aria-label="Dismiss warning"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="w-full bg-red-200 rounded-full h-1">
            <div
              className="bg-red-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${(creditsLeft / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
