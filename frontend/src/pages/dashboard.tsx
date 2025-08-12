// import React from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to CaBE Arena
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Your central hub for learning, tasks, and analytics
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/analytics"
              className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Your Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                View your personal performance metrics and progress
              </p>
            </Link>

            <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Admin Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Platform-wide metrics and reviewer insights
              </p>
              <div className="text-sm text-amber-600 dark:text-amber-400">
                Requires Platinum rank or admin access
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
