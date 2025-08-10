import React, { useState, useEffect, useRef } from 'react';
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useWebSocket, EventType } from '../hooks/useWebSocket';

export interface Notification {
  id: string;
  type: EventType;
  title: string;
  message: string;
  timestamp: number;
  data?: any;
  autoDismiss?: boolean;
  dismissAfter?: number;
}

interface NotificationToastProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onDismissAll?: () => void;
  maxNotifications?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const getNotificationIcon = (type: EventType) => {
  switch (type) {
    case 'submissionReviewed':
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    case 'badgeUnlocked':
      return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
    case 'taskAssigned':
      return <InformationCircleIcon className="w-5 h-5 text-purple-500" />;
    case 'pointsUpdated':
      return <CheckCircleIcon className="w-5 h-5 text-yellow-500" />;
    case 'rankChanged':
      return <CheckCircleIcon className="w-5 h-5 text-indigo-500" />;
    case 'chatMessage':
      return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
    default:
      return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
  }
};

const getNotificationStyles = (type: EventType) => {
  switch (type) {
    case 'submissionReviewed':
      return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
    case 'badgeUnlocked':
      return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
    case 'taskAssigned':
      return 'border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800';
    case 'pointsUpdated':
      return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
    case 'rankChanged':
      return 'border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800';
    case 'chatMessage':
      return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800';
    default:
      return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800';
  }
};

const getPositionStyles = (position: string) => {
  switch (position) {
    case 'top-right':
      return 'top-4 right-4';
    case 'top-left':
      return 'top-4 left-4';
    case 'bottom-right':
      return 'bottom-4 right-4';
    case 'bottom-left':
      return 'bottom-4 left-4';
    default:
      return 'top-4 right-4';
  }
};

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss,
  onDismissAll,
  maxNotifications = 5,
  position = 'top-right',
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<
    Notification[]
  >([]);
  const dismissTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Filter and limit notifications
  useEffect(() => {
    const limited = notifications.slice(0, maxNotifications);
    setVisibleNotifications(limited);
  }, [notifications, maxNotifications]);

  // Auto-dismiss logic
  useEffect(() => {
    visibleNotifications.forEach((notification) => {
      if (
        notification.autoDismiss !== false &&
        notification.dismissAfter !== 0
      ) {
        const timeout = setTimeout(() => {
          onDismiss(notification.id);
        }, notification.dismissAfter || 5000);

        dismissTimeouts.current.set(notification.id, timeout);
      }
    });

    return () => {
      // Clear all timeouts on cleanup
      dismissTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      dismissTimeouts.current.clear();
    };
  }, [visibleNotifications, onDismiss]);

  const handleDismiss = (id: string) => {
    // Clear timeout if exists
    const timeout = dismissTimeouts.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      dismissTimeouts.current.delete(id);
    }
    onDismiss(id);
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div
      className={`fixed ${getPositionStyles(position)} z-50 space-y-2 max-w-sm w-full`}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {/* Dismiss All Button */}
      {onDismissAll && visibleNotifications.length > 1 && (
        <button
          onClick={onDismissAll}
          className="ml-auto block text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          aria-label="Dismiss all notifications"
        >
          Dismiss all
        </button>
      )}

      {/* Notification Stack */}
      <div className="space-y-2">
        {visibleNotifications.map((notification, index) => (
          <div
            key={notification.id}
            className={`
              relative p-4 rounded-lg border shadow-lg backdrop-blur-sm
              transform transition-all duration-300 ease-out
              hover:scale-[1.02] hover:shadow-xl
              ${getNotificationStyles(notification.type)}
              animate-in slide-in-from-right-full
            `}
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both',
            }}
            role="alert"
            aria-live="assertive"
          >
            {/* Progress bar for auto-dismiss */}
            {notification.autoDismiss !== false &&
              notification.dismissAfter !== 0 && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-linear"
                    style={{
                      width: '100%',
                      animation: `shrink ${notification.dismissAfter || 5000}ms linear forwards`,
                    }}
                  />
                </div>
              )}

            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {notification.title}
                </h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {notification.message}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(notification.timestamp)}
                </p>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => handleDismiss(notification.id)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label={`Dismiss ${notification.title} notification`}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Action buttons for specific notification types */}
            {notification.type === 'submissionReviewed' &&
              notification.data?.status === 'rejected' && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      // Handle appeal action
                      console.log('Appeal submission:', notification.data);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Appeal this decision
                  </button>
                </div>
              )}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        @keyframes slide-in-from-right-full {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-in {
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
};

// Hook for managing notifications with WebSocket integration
export const useNotificationToast = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (
    notification: Omit<Notification, 'id' | 'timestamp'>
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      autoDismiss: notification.autoDismiss ?? true,
      dismissAfter: notification.dismissAfter ?? 5000,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const dismissAll = () => {
    setNotifications([]);
  };

  // WebSocket event handlers
  const handleSubmissionReviewed = (data: any) => {
    addNotification({
      type: 'submissionReviewed',
      title: 'Submission Reviewed',
      message:
        data.status === 'approved'
          ? `🎉 Your submission for "${data.taskName}" was approved! +${data.points} points`
          : data.status === 'rejected'
            ? `❌ Your submission for "${data.taskName}" was rejected. ${data.reason || 'Please try again.'}`
            : `⏳ Your submission for "${data.taskName}" is under review...`,
      data,
      autoDismiss: data.status !== 'rejected', // Keep rejected notifications longer
      dismissAfter: data.status === 'rejected' ? 10000 : 5000,
    });
  };

  const handleBadgeUnlocked = (data: any) => {
    addNotification({
      type: 'badgeUnlocked',
      title: 'Badge Unlocked! 🏆',
      message: `You've earned the "${data.badgeName}" badge! Keep up the great work!`,
      data,
      autoDismiss: true,
      dismissAfter: 8000,
    });
  };

  const handleTaskAssigned = (data: any) => {
    addNotification({
      type: 'taskAssigned',
      title: 'New Task Assigned',
      message: `You've been assigned "${data.taskName}" - ${data.description || 'Check it out!'}`,
      data,
      autoDismiss: true,
      dismissAfter: 6000,
    });
  };

  const handlePointsUpdated = (data: any) => {
    addNotification({
      type: 'pointsUpdated',
      title: 'Points Updated',
      message: `Your points have been updated! New total: ${data.newPoints} points`,
      data,
      autoDismiss: true,
      dismissAfter: 4000,
    });
  };

  const handleRankChanged = (data: any) => {
    addNotification({
      type: 'rankChanged',
      title: 'Rank Promotion! 🚀',
      message: `Congratulations! You've been promoted to ${data.newRank}!`,
      data,
      autoDismiss: false, // Keep rank changes visible longer
      dismissAfter: 0,
    });
  };

  // Set up WebSocket handlers
  useWebSocket({
    handlers: {
      submissionReviewed: handleSubmissionReviewed,
      badgeUnlocked: handleBadgeUnlocked,
      taskAssigned: handleTaskAssigned,
      pointsUpdated: handlePointsUpdated,
      rankChanged: handleRankChanged,
    },
  });

  return {
    notifications,
    addNotification,
    dismissNotification,
    dismissAll,
  };
};

export default NotificationToast;
