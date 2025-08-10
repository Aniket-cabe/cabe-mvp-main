import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import type { WhyThisChipProps } from '../types';

export default function WhyThisChip({
  reason,
  relevanceScore,
  skillArea,
}: WhyThisChipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getSkillColor = (skill: string) => {
    const colors = {
      design: 'text-pink-600',
      web: 'text-emerald-600',
      ai: 'text-violet-600',
      writing: 'text-amber-600',
      frontend: 'text-emerald-600',
      backend: 'text-blue-600',
      database: 'text-purple-600',
      algorithm: 'text-orange-600',
      system: 'text-red-600',
    };
    return colors[skill as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="relative inline-block">
      <button
        className={`
          inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border
          transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
          ${getRelevanceColor(relevanceScore)}
          ${showTooltip ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
        `}
        onClick={() => setShowTooltip(!showTooltip)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={`Why this task? Relevance score: ${relevanceScore}%`}
        data-testid="why-this-chip"
      >
        <HelpCircle className="h-3 w-3" />
        <span>Why this?</span>
        <span className="text-xs opacity-75">({relevanceScore}%)</span>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 
                     bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10 max-w-xs
                     animate-in fade-in-0 zoom-in-95 duration-200"
          role="tooltip"
          data-testid="why-this-tooltip"
        >
          <div className="font-semibold mb-1 flex items-center gap-2">
            <span>AI Recommendation</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${getSkillColor(skillArea)} bg-white bg-opacity-20`}
            >
              {skillArea}
            </span>
          </div>
          <p className="leading-relaxed">{reason}</p>
          <div className="mt-2 pt-2 border-t border-gray-700 text-xs opacity-75">
            Relevance score: {relevanceScore}%
          </div>

          {/* Arrow */}
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
                         border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
          ></div>
        </div>
      )}
    </div>
  );
}
