import React, { useState } from 'react';
import TaskFeed from './TaskFeed';

/**
 * Demo component to showcase the TaskFeed functionality
 * Demonstrates different configurations and use cases
 */
export default function FeedDemo() {
  const [maxTasks, setMaxTasks] = useState<number>(5);
  const [showFilters, setShowFilters] = useState(true);

  const handleTaskAccept = (taskId: string) => {
    console.log('Demo: Accepting task:', taskId);
    alert(
      `Task ${taskId} accepted! In a real app, this would navigate to the task.`
    );
  };

  const handleTaskDiscard = (taskId: string) => {
    console.log('Demo: Discarding task:', taskId);
    alert(`Task ${taskId} discarded!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Task Feed Demo
          </h1>
          <p className="text-gray-600 mb-8">
            This demo showcases the AI-powered task recommendation system with
            different configurations.
          </p>

          {/* Demo Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Configuration
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tasks to Show
                </label>
                <select
                  value={maxTasks}
                  onChange={(e) => setMaxTasks(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={3}>3 tasks</option>
                  <option value={5}>5 tasks</option>
                  <option value={10}>10 tasks</option>
                  <option value={0}>All tasks (infinite)</option>
                </select>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showFilters}
                    onChange={(e) => setShowFilters(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Show Filters
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  AI-powered recommendations
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Swipe-to-dismiss on mobile
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Infinite scroll loading
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Explainable AI with "Why This?" tooltips
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Responsive design for all devices
                </li>
              </ul>
            </div>
          </div>

          {/* Current Configuration Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              Current Configuration
            </h4>
            <div className="text-sm text-blue-700">
              <p>Max Tasks: {maxTasks === 0 ? 'All (infinite)' : maxTasks}</p>
              <p>Show Filters: {showFilters ? 'Yes' : 'No'}</p>
              <p>Custom Callbacks: Active (check console for logs)</p>
            </div>
          </div>
        </div>

        {/* Task Feed Component */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            AI Task Feed
          </h2>
          <TaskFeed
            maxTasks={maxTasks === 0 ? undefined : maxTasks}
            showFilters={showFilters}
            onTaskAccept={handleTaskAccept}
            onTaskDiscard={handleTaskDiscard}
          />
        </div>
      </div>
    </div>
  );
}
