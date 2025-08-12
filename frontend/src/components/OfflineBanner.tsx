import { useState, useEffect } from 'react';
import { WifiIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface OfflineBannerProps {
  className?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  className = '',
}) => {
  // const [isOffline, setIsOffline] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check initial online status
    // setIsOffline(!navigator.onLine);
    setIsVisible(!navigator.onLine && !isDismissed);

    // Listen for online/offline events
    const handleOnline = () => {
      // setIsOffline(false);
      setIsVisible(false);
    };

    const handleOffline = () => {
      // setIsOffline(true);
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

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 z-50 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <WifiIcon className="h-5 w-5 text-yellow-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-yellow-800">
            You're currently offline
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            Some features may not work properly. We'll automatically retry when
            you're back online.
          </p>
        </div>
        <div className="flex-shrink-0 flex space-x-2">
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-3 py-1.5 border border-yellow-300 text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Retry
          </button>
          <button
            onClick={handleDismiss}
            className="inline-flex items-center p-1.5 border border-yellow-300 text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflineBanner;
