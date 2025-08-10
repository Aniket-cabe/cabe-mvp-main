import React from 'react';
import { TrendingUp, Target, Award, Clock, Star, Zap } from 'lucide-react';
import type { SkillStats, XPProgress, SkillArea } from '../types';

interface SkillStatsProps {
  stats: SkillStats;
  xpProgress: XPProgress;
  skill: SkillArea;
}

export default function SkillStats({
  stats,
  xpProgress,
  skill,
}: SkillStatsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {/* Total Tasks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-lg bg-${skill.color} bg-opacity-10 flex items-center justify-center`}
          >
            <Target className={`h-6 w-6 text-${skill.color}`} />
          </div>
          <TrendingUp className="h-5 w-5 text-gray-400" />
        </div>
        <h3
          className="text-2xl font-bold text-gray-900 mb-1"
          data-testid="total-tasks"
        >
          {stats.totalTasks}
        </h3>
        <p className="text-gray-600 text-sm">Total Tasks</p>
        <p className="text-xs text-gray-500 mt-1">
          {stats.completionRate}% completion rate
        </p>
      </div>

      {/* Average Points */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-lg bg-${skill.color} bg-opacity-10 flex items-center justify-center`}
          >
            <Award className={`h-6 w-6 text-${skill.color}`} />
          </div>
          <Star className="h-5 w-5 text-gray-400" />
        </div>
        <h3
          className="text-2xl font-bold text-gray-900 mb-1"
          data-testid="average-points"
        >
          {stats.averagePoints}
        </h3>
        <p className="text-gray-600 text-sm">Avg Points</p>
        <p className="text-xs text-gray-500 mt-1">
          Best score: {stats.bestScore}%
        </p>
      </div>

      {/* Total XP */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-lg bg-${skill.color} bg-opacity-10 flex items-center justify-center`}
          >
            <Zap className={`h-6 w-6 text-${skill.color}`} />
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">{xpProgress.tier}</div>
          </div>
        </div>
        <h3
          className="text-2xl font-bold text-gray-900 mb-1"
          data-testid="total-xp"
        >
          {stats.totalXP}
        </h3>
        <p className="text-gray-600 text-sm">Total XP</p>

        {/* XP Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{xpProgress.current} XP</span>
            <span>{xpProgress.total} XP</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`bg-${skill.color} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${xpProgress.progressPercentage}%` }}
              data-testid="xp-progress-bar"
              role="progressbar"
              aria-valuenow={xpProgress.progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`XP Progress: ${xpProgress.progressPercentage}%`}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {xpProgress.progressPercentage}% to {xpProgress.nextTier}
          </p>
        </div>
      </div>

      {/* Average Score */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-lg bg-${skill.color} bg-opacity-10 flex items-center justify-center`}
          >
            <Star className={`h-6 w-6 text-${skill.color}`} />
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Avg Score</div>
          </div>
        </div>
        <h3
          className="text-2xl font-bold text-gray-900 mb-1"
          data-testid="average-score"
        >
          {stats.averageScore}%
        </h3>
        <p className="text-gray-600 text-sm">Performance</p>
        <p className="text-xs text-gray-500 mt-1">
          {stats.totalTasks > 0
            ? `${stats.totalTasks} tasks completed`
            : 'No tasks yet'}
        </p>
      </div>

      {/* Last Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-lg bg-${skill.color} bg-opacity-10 flex items-center justify-center`}
          >
            <Clock className={`h-6 w-6 text-${skill.color}`} />
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Last Active</div>
          </div>
        </div>
        <h3
          className="text-lg font-semibold text-gray-900 mb-1"
          data-testid="last-activity"
        >
          {formatDate(stats.lastActivity)}
        </h3>
        <p className="text-gray-600 text-sm">Recent Activity</p>
        <p className="text-xs text-gray-500 mt-1">
          {stats.streakDays} day{stats.streakDays !== 1 ? 's' : ''} streak
        </p>
      </div>

      {/* Completion Rate */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-lg bg-${skill.color} bg-opacity-10 flex items-center justify-center`}
          >
            <TrendingUp className={`h-6 w-6 text-${skill.color}`} />
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Success Rate</div>
          </div>
        </div>
        <h3
          className="text-2xl font-bold text-gray-900 mb-1"
          data-testid="completion-rate"
        >
          {stats.completionRate}%
        </h3>
        <p className="text-gray-600 text-sm">Completion Rate</p>
        <p className="text-xs text-gray-500 mt-1">
          {stats.totalTasks > 0
            ? `${Math.round((stats.completionRate / 100) * stats.totalTasks)} completed`
            : 'No tasks yet'}
        </p>
      </div>
    </div>
  );
}
