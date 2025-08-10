import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Brain, Zap } from 'lucide-react';

interface CaBOTLowBalanceToastProps {
  balance: number;
  threshold?: number;
  autoHideDuration?: number;
  className?: string;
}

export default function CaBOTLowBalanceToast({
  balance,
  threshold = 1,
  autoHideDuration = 8000,
  className = '',
}: CaBOTLowBalanceToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastShownBalance, setLastShownBalance] = useState<number | null>(null);

  // Show toast when balance drops to or below threshold
  useEffect(() => {
    const shouldShow = balance <= threshold && balance >= 0;
    const balanceJustDropped =
      lastShownBalance !== null && balance < lastShownBalance && shouldShow;

    if (shouldShow && (lastShownBalance === null || balanceJustDropped)) {
      setIsVisible(true);
      setIsAnimating(true);

      // Auto-hide after duration
      const hideTimer = setTimeout(() => {
        handleClose();
      }, autoHideDuration);

      setLastShownBalance(balance);

      return () => clearTimeout(hideTimer);
    }

    if (balance > threshold) {
      setLastShownBalance(balance);
    }
  }, [balance, threshold, autoHideDuration, lastShownBalance]);

  const handleClose = () => {
    setIsAnimating(false);
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  const getToastContent = () => {
    if (balance === 0) {
      return {
        icon: <AlertTriangle className="text-red-500" size={20} />,
        title: 'No CaBOT Credits Left!',
        message:
          "You've used all your CaBOT juice for this week. Credits reset weekly.",
        bgColor: 'bg-red-50 dark:bg-red-950',
        borderColor: 'border-red-200 dark:border-red-800',
        textColor: 'text-red-800 dark:text-red-200',
      };
    } else {
      return {
        icon: <Brain className="text-amber-500" size={20} />,
        title: '⚠️ Almost Out of CaBOT Juice!',
        message: `Only ${balance} credit${balance === 1 ? '' : 's'} remaining. Use wisely!`,
        bgColor: 'bg-amber-50 dark:bg-amber-950',
        borderColor: 'border-amber-200 dark:border-amber-800',
        textColor: 'text-amber-800 dark:text-amber-200',
      };
    }
  };

  if (!isVisible) return null;

  const content = getToastContent();

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out transform ${
        isAnimating
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
      } ${className}`}
    >
      <div
        className={`
        max-w-sm rounded-lg shadow-lg border-2 p-4
        ${content.bgColor} ${content.borderColor}
        backdrop-blur-sm
      `}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">{content.icon}</div>
            <div className="flex-1">
              <h3 className={`text-sm font-semibold ${content.textColor}`}>
                {content.title}
              </h3>
              <p className={`text-sm mt-1 ${content.textColor} opacity-90`}>
                {content.message}
              </p>

              {/* Credit status bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`${content.textColor} opacity-75`}>
                    Credits
                  </span>
                  <span className={`${content.textColor} font-medium`}>
                    {balance}/5
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      balance === 0 ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${(balance / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-3 flex items-center gap-2">
                {balance > 0 && (
                  <button
                    onClick={handleClose}
                    className={`
                      text-xs px-3 py-1 rounded-md border transition-colors
                      ${content.textColor} ${content.borderColor}
                      hover:bg-white hover:bg-opacity-20
                    `}
                  >
                    Got it
                  </button>
                )}

                <button
                  onClick={() => {
                    // Navigate to usage history or help
                    console.log('Navigate to credit usage guide');
                  }}
                  className={`
                    text-xs px-3 py-1 rounded-md transition-colors
                    ${content.textColor} opacity-75 hover:opacity-100
                    underline decoration-dotted underline-offset-2
                  `}
                >
                  Learn more
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className={`
              flex-shrink-0 ml-2 p-1 rounded-md transition-colors
              ${content.textColor} opacity-50 hover:opacity-100
              hover:bg-white hover:bg-opacity-20
            `}
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress indicator for auto-hide */}
        <div className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${balance === 0 ? 'bg-red-300' : 'bg-amber-300'} rounded-full`}
            style={{
              animation: `shrink ${autoHideDuration}ms linear`,
            }}
          />
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

// Optional: Context provider for global toast management
export function useCaBOTToastManager() {
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      balance: number;
      timestamp: number;
    }>
  >([]);

  const showToast = (balance: number) => {
    const id = `toast-${Date.now()}`;
    const toast = { id, balance, timestamp: Date.now() };

    setToasts((prev) => [...prev, toast]);

    // Auto-remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 10000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast,
  };
}
