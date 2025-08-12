import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useSkillData } from '../hooks/useSkillData';
import SkillHeader from '../components/SkillHeader';
import SkillStats from '../components/SkillStats';
import SkillTaskList from '../components/SkillTaskList';
import BadgeStrip from '../components/BadgeStrip';
import ActivityHeatmap from '../components/ActivityHeatmap';

export default function SkillDashboard() {
  const { skillSlug } = useParams<{ skillSlug: string }>();

  if (!skillSlug) {
    return <Navigate to="/skills/fullstack-dev" replace />;
  }

  const { data, loading, error } = useSkillData(skillSlug);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading skill dashboard...</p>
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
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Skill Not Found
          </h2>
          <p className="text-gray-600">
            The requested skill area could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SkillHeader skill={data.skill} />
        <SkillStats
          stats={data.stats}
          xpProgress={data.xpProgress}
          skill={data.skill}
        />

        {/* Activity Heatmap */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Activity Heatmap
              </h2>
              <p className="text-sm text-gray-600">
                Your daily activity in {data.skill.name} over the last 90 days
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-200 rounded"></div>
                <span>Less</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className={`w-3 h-3 bg-${data.skill.color} bg-opacity-300 rounded`}
                ></div>
                <span>More</span>
              </div>
            </div>
          </div>
          <ActivityHeatmap data={data.heatmapData} skill={data.skill} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1">
            <SkillTaskList tasks={data.tasks} skill={data.skill} />
          </div>
          <div className="lg:col-span-1">
            <BadgeStrip badges={data.badges} skill={data.skill} />
          </div>
        </div>
      </div>
    </div>
  );
}
