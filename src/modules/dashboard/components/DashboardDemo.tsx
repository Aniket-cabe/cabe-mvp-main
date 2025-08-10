import React, { useState } from 'react';
import { useDashboard, useStreak } from '../hooks/useDashboard';
import RankRing from './RankRing';
import RecentActivity from './RecentActivity';
import UnlockCarousel from './UnlockCarousel';
import type { UserDashboardProps } from '../types';

/**
 * Demo component to showcase the dashboard functionality
 * Demonstrates different configurations and use cases
 */
export default function DashboardDemo(props: UserDashboardProps) {
  const {
    user,
    progress,
    recentSubmissions,
    unlockables,
    loading,
    error,
    refetch,
  } = useDashboard(props.userId);
  const { streakDays, isActive, shouldShowBanner } = useStreak(props.userId);
  const [showStreakBanner, setShowStreakBanner] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user || !progress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">👤</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600">Unable to load user dashboard data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Dashboard Demo
          </h1>
          <p className="text-gray-600 mb-8">
            This demo showcases the user dashboard with rank progression, recent
            activity, and unlockable features.
          </p>

          {/* Demo Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Configuration
              </h3>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showStreakBanner}
                    onChange={(e) => setShowStreakBanner(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Show Streak Banner
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Rank progression with SVG ring
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Recent activity table
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Auto-sliding unlock carousel
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Streak banner for active users
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
              <p>
                User: {user.name} ({user.currentRank.name})
              </p>
              <p>
                Points: {user.currentPoints} / {user.nextThreshold}
              </p>
              <p>
                Streak: {streakDays} days {isActive ? '(Active)' : '(Inactive)'}
              </p>
              <p>Show Streak Banner: {showStreakBanner ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        {/* Streak Banner */}
        {showStreakBanner && shouldShowBanner && (
          <div
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg mb-8"
            data-testid="streak-banner"
          >
            <div className="flex items-center justify-center">
              <span className="text-2xl mr-2">🔥</span>
              <span className="font-semibold">
                You're on a {streakDays}-day streak!
              </span>
            </div>
          </div>
        )}

        {/* Dashboard Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rank Progression */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Rank Progression
              </h2>
              <RankRing progress={progress} size={160} strokeWidth={12} />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivity
              submissions={recentSubmissions}
              maxRows={5}
              showHeader={true}
            />
          </div>
        </div>

        {/* Unlock Carousel */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Upcoming Unlocks
            </h2>
            <UnlockCarousel
              unlockables={unlockables}
              autoSlide={true}
              slideInterval={6000}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
