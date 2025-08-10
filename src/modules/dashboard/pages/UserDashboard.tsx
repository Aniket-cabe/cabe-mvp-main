import React from 'react';
import {
  Trophy,
  Zap,
  Calendar,
  TrendingUp,
  ArrowRight,
  Fire,
} from 'lucide-react';
import { useUserSummary } from '../hooks/useUserSummary';
import ProgressRing from '../components/ProgressRing';
import UnlockCarousel from '../components/UnlockCarousel';
import ActivityTable from '../components/ActivityTable';
import type { UserDashboardProps } from '../types';

export default function UserDashboard({ userId }: UserDashboardProps) {
  const {
    user,
    progress,
    recentSubmissions,
    unlockables,
    loading,
    error,
    refetch,
  } = useUserSummary(userId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
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
      </div>
    );
  }

  if (!user || !progress) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👤</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              User Not Found
            </h2>
            <p className="text-gray-600">Unable to load user dashboard data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=80&background=3B82F6&color=fff`
                  }
                  alt={user.name}
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
                  <span className="text-lg">{user.currentRank.icon}</span>
                </div>
              </div>

              {/* User Info */}
              <div>
                <h1
                  className="text-2xl font-bold text-gray-900 mb-1"
                  data-testid="user-name"
                >
                  {user.name}
                </h1>
                <p className="text-gray-600 mb-2">{user.email}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(user.joinDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>Last active {formatLastActive(user.lastActive)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rank Badge */}
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{user.currentRank.icon}</span>
                <div>
                  <div
                    className="text-lg font-semibold text-gray-900"
                    data-testid="current-rank"
                  >
                    {user.currentRank.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {user.currentPoints} / {user.nextThreshold} points
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Streak Banner */}
        {user.streakDays >= 3 && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Fire className="h-6 w-6 animate-pulse" />
                <div>
                  <div className="font-semibold">
                    🔥 {user.streakDays} Day Streak!
                  </div>
                  <div className="text-sm opacity-90">
                    Keep up the great work!
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{user.streakDays}</div>
                <div className="text-sm opacity-90">days</div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Progress Ring */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Progress to Next Rank
                </h2>
                <p className="text-sm text-gray-600">
                  {progress.delta > 0
                    ? `Only ${progress.delta} pts to ${progress.nextRankName}. Smash a quick task?`
                    : `You've reached ${progress.rankName}!`}
                </p>
              </div>

              <div className="flex justify-center mb-4">
                <ProgressRing
                  percentage={progress.percentage}
                  size={160}
                  strokeWidth={12}
                  label={`${progress.percentage}% to next rank`}
                />
              </div>

              <div className="text-center">
                <div
                  className="text-2xl font-bold text-gray-900 mb-1"
                  data-testid="current-points"
                >
                  {progress.current}
                </div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total Points Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div
                  className="text-3xl font-bold text-gray-900 mb-1"
                  data-testid="total-points"
                >
                  {user.totalPoints}
                </div>
                <div className="text-sm text-gray-600">Total Points Earned</div>
              </div>

              {/* Streak Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div
                  className="text-3xl font-bold text-gray-900 mb-1"
                  data-testid="streak-days"
                >
                  {user.streakDays}
                </div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div>
            <ActivityTable submissions={recentSubmissions} maxRows={5} />
          </div>

          {/* Upcoming Unlocks */}
          <div>
            <UnlockCarousel
              unlockables={unlockables}
              autoSlide={true}
              slideInterval={6000}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Find Tasks</div>
                  <div className="text-sm text-gray-600">
                    Browse available challenges
                  </div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </button>

            <button className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">View Progress</div>
                  <div className="text-sm text-gray-600">
                    Check your achievements
                  </div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </button>

            <button className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Take Course</div>
                  <div className="text-sm text-gray-600">Learn new skills</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
