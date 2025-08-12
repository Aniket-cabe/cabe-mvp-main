import React, { useState } from 'react';
import { useSkillData } from '../hooks/useSkillData';
import SkillHeader from './SkillHeader';
import SkillStats from './SkillStats';
import SkillTaskList from './SkillTaskList';
import BadgeStrip from './BadgeStrip';
import ActivityHeatmap from './ActivityHeatmap';
import SkillXPBar from './SkillXPBar';

const SKILL_AREAS = [
  { slug: 'ai-ml', name: 'AI / Machine Learning', icon: '🤖', color: 'violet-500' },
  { slug: 'cloud-devops', name: 'Cloud Computing & DevOps', icon: '☁️', color: 'blue-500' },
  {
    slug: 'data-analytics',
    name: 'Data Science & Analytics',
    icon: '📊',
    color: 'emerald-500',
  },
  { slug: 'fullstack-dev', name: 'Full-Stack Software Development', icon: '💻', color: 'purple-500' },
];

export default function SkillsDemo() {
  const [selectedSkill, setSelectedSkill] = useState('ai-ml');
  const { data, loading, error, refetch } = useSkillData(selectedSkill);

  const handleSkillChange = (skillSlug: string) => {
    setSelectedSkill(skillSlug);
  };

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
            onClick={refetch}
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
      {/* Skill Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Skills Dashboard Demo
            </h1>
            <div className="flex space-x-2">
              {SKILL_AREAS.map((skill) => (
                <button
                  key={skill.slug}
                  onClick={() => handleSkillChange(skill.slug)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedSkill === skill.slug
                      ? `bg-${skill.color} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  data-testid={`skill-nav-${skill.slug}`}
                >
                  <span className="mr-2">{skill.icon}</span>
                  {skill.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SkillHeader skill={data.skill} />

        {/* XP Bar Demo */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            XP Progress Bar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkillXPBar
              xpProgress={data.xpProgress}
              skill={data.skill}
              size="sm"
            />
            <SkillXPBar
              xpProgress={data.xpProgress}
              skill={data.skill}
              size="md"
            />
            <SkillXPBar
              xpProgress={data.xpProgress}
              skill={data.skill}
              size="lg"
            />
          </div>
        </div>

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

        {/* Demo Controls */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Demo Controls
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Data
            </button>
            <button
              onClick={() => {
                // Simulate error state
                console.log('Simulating error state...');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Simulate Error
            </button>
            <div className="text-sm text-gray-600">
              Current Skill:{' '}
              <span className="font-medium">{data.skill.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
