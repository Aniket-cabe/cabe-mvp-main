import React, { useEffect, useState } from 'react';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-3 left-3 right-3 z-50 rounded-lg bg-yellow-50 border border-yellow-200 shadow p-3 sm:p-4 flex items-start gap-3"
      style={{ touchAction: 'manipulation' }}
      data-testid="offline-banner"
    >
      <div className="text-yellow-600 text-xl" aria-hidden>
        ⚠️
      </div>
      <div className="flex-1 text-sm sm:text-base text-yellow-800">
        <strong className="block">
          You’re offline — some features may not work.
        </strong>
        <span className="block">
          We’ll auto-retry when you’re back. Hustle never sleeps 😤
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="ml-2 shrink-0 h-11 w-11 sm:h-10 sm:w-10 rounded-md bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
        aria-label="Dismiss offline banner"
        style={{ minWidth: 44, minHeight: 44 }}
      >
        ✕
      </button>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { WifiIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface OfflineBannerProps {
  className?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  className = '',
}) => {
  const [isOffline, setIsOffline] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOffline(!navigator.onLine);
    setIsVisible(!navigator.onLine && !isDismissed);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOffline(false);
      setIsVisible(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setIsVisible(true);
      setIsDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 shadow-sm ${className}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <WifiIcon className="h-5 w-5 text-amber-600" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800">
                <span className="sr-only">Status: </span>
                You're offline — some features may not work
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Don't worry! You can still view cached content and work on
                challenges.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-3 py-1.5 border border-amber-300 text-xs font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
              aria-label="Retry connection"
            >
              Retry
            </button>

            <button
              onClick={handleDismiss}
              className="inline-flex items-center p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
              aria-label="Dismiss offline banner"
            >
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineBanner;
