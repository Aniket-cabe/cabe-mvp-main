import React from 'react';
import { useFeed } from '../hooks/useFeed';
import TaskCard from './TaskCard';
import type { FeedTask } from '../types';

interface TaskFeedProps {
  maxTasks?: number;
  showFilters?: boolean;
  onTaskAccept?: (taskId: string) => void;
  onTaskDiscard?: (taskId: string) => void;
  className?: string;
}

/**
 * TaskFeed component that displays a feed of AI-recommended tasks.
 *
 * Features:
 * - Displays tasks from useFeed hook
 * - Supports swipe-to-dismiss on mobile
 * - Shows loading states and error handling
 * - Configurable task limits and filter visibility
 * - Customizable callbacks for task actions
 */
export default function TaskFeed({
  maxTasks,
  showFilters = true,
  onTaskAccept,
  onTaskDiscard,
  className = '',
}: TaskFeedProps) {
  const { tasks, loading, error, hasNextPage, discardTask, loadMore, refresh } =
    useFeed();

  const displayedTasks = maxTasks ? tasks.slice(0, maxTasks) : tasks;

  const handleTaskAccept = (taskId: string) => {
    if (onTaskAccept) {
      onTaskAccept(taskId);
    } else {
      console.log('Accepting task:', taskId);
      // Default behavior: navigate to task page
      // window.location.href = `/tasks/${taskId}`;
    }
  };

  const handleTaskDiscard = (taskId: string) => {
    if (onTaskDiscard) {
      onTaskDiscard(taskId);
    } else {
      discardTask(taskId);
    }
  };

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-600 mb-4">
          <svg
            className="w-12 h-12 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p className="text-lg font-semibold">Failed to load tasks</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (loading && tasks.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading AI recommendations...</p>
      </div>
    );
  }

  if (displayedTasks.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No quests left
        </h3>
        <p className="text-gray-600 mb-4">Come back tomorrow 💫</p>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {displayedTasks.map((task: FeedTask) => (
        <TaskCard
          key={task.id}
          task={task}
          onDiscard={handleTaskDiscard}
          onAccept={handleTaskAccept}
        />
      ))}

      {loading && tasks.length > 0 && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading more tasks...</p>
        </div>
      )}

      {hasNextPage && !loading && !maxTasks && (
        <div className="text-center py-4">
          <button
            onClick={loadMore}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Load More Tasks
          </button>
        </div>
      )}
    </div>
  );
}
