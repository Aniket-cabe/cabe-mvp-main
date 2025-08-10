import React from 'react';
import type { SkillArea } from '../types';

interface SkillHeaderProps {
  skill: SkillArea;
}

export default function SkillHeader({ skill }: SkillHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-4">
        {/* Skill Icon */}
        <div
          className={`w-16 h-16 rounded-full bg-${skill.color} bg-opacity-10 flex items-center justify-center text-3xl`}
        >
          {skill.icon}
        </div>

        {/* Skill Info */}
        <div className="flex-1">
          <h1
            className="text-3xl font-bold text-gray-900 mb-2"
            data-testid="skill-name"
          >
            {skill.name}
          </h1>
          <p
            className="text-lg text-gray-600 italic"
            data-testid="skill-tagline"
          >
            "{skill.tagline}"
          </p>
          <p
            className="text-sm text-gray-500 mt-2"
            data-testid="skill-description"
          >
            {skill.description}
          </p>
        </div>

        {/* Decorative Element */}
        <div
          className={`hidden lg:block w-24 h-24 rounded-full bg-${skill.color} bg-opacity-5`}
        >
          <div
            className={`w-full h-full rounded-full bg-${skill.color} bg-opacity-10 flex items-center justify-center text-2xl opacity-30`}
          >
            {skill.icon}
          </div>
        </div>
      </div>
    </div>
  );
}
