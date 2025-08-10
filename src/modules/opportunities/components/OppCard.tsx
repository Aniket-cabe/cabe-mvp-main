import React from 'react';
import type { OppCardProps } from '../types';
import { TrustBadge } from './TrustBadge';

export function OppCard({
  opportunity,
  userRank,
  userEmail,
  onApply,
}: OppCardProps) {
  const {
    title,
    description,
    company,
    source,
    type,
    category,
    points,
    locked,
    requiredRank,
    location,
    duration,
    budget,
    requirements,
    postedDate,
  } = opportunity;

  // Get source badge info
  const getSourceBadge = () => {
    if (source === 'fiverr') {
      return {
        text: 'Fiverr',
        color: 'bg-green-100 text-green-800',
        icon: '🎨',
      };
    }
    if (source === 'internshala') {
      return {
        text: 'Internshala',
        color: 'bg-blue-100 text-blue-800',
        icon: '🎓',
      };
    }
    if (source === 'upwork') {
      return {
        text: 'Upwork',
        color: 'bg-purple-100 text-purple-800',
        icon: '💼',
      };
    }
    if (source === 'linkedin') {
      return {
        text: 'LinkedIn',
        color: 'bg-blue-100 text-blue-800',
        icon: '🔗',
      };
    }
    return { text: 'Internal', color: 'bg-gray-100 text-gray-800', icon: '🏢' };
  };

  const sourceBadge = getSourceBadge();
  const isSynced = source === 'fiverr' || source === 'internshala';

  // Get category icon
  const getCategoryIcon = () => {
    switch (category) {
      case 'design':
        return '🎨';
      case 'web':
        return '💻';
      case 'ai':
        return '🤖';
      case 'writing':
        return '✍️';
      default:
        return '📋';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md ${
        locked ? 'opacity-75' : 'hover:border-blue-300'
      }`}
    >
      {/* Lock overlay */}
      {locked && (
        <div className="absolute inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">🔒</div>
            <div className="text-lg font-semibold text-gray-700 mb-1">
              Unlock at {requiredRank}
            </div>
            <div className="text-sm text-gray-500">✨</div>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getCategoryIcon()}</span>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {title}
              </h3>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-700">
                {company}
              </span>
              <TrustBadge userEmail={userEmail} companyDomain={company} />
            </div>
          </div>

          {/* Points badge */}
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <span>⭐</span>
            <span>{points} pts</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{description}</p>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-gray-500">Location:</span>
            <div className="font-medium">{location}</div>
          </div>
          <div>
            <span className="text-gray-500">Duration:</span>
            <div className="font-medium">{duration}</div>
          </div>
          {budget && (
            <div>
              <span className="text-gray-500">Budget:</span>
              <div className="font-medium text-green-600">{budget}</div>
            </div>
          )}
          <div>
            <span className="text-gray-500">Posted:</span>
            <div className="font-medium">{formatDate(postedDate)}</div>
          </div>
        </div>

        {/* Requirements */}
        {requirements.length > 0 && (
          <div className="mb-4">
            <span className="text-sm text-gray-500">Requirements:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {requirements.slice(0, 3).map((req, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                >
                  {req}
                </span>
              ))}
              {requirements.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs">
                  +{requirements.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {/* Source badge */}
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${sourceBadge.color}`}
            >
              <span>{sourceBadge.icon}</span>
              <span>{sourceBadge.text}</span>
            </div>

            {/* Synced badge */}
            {isSynced && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                <span>✔️</span>
                <span>Synced</span>
              </div>
            )}
          </div>

          {/* Apply button */}
          <button
            onClick={() => onApply(opportunity)}
            disabled={locked}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              locked
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }`}
            data-testid={`apply-btn-${opportunity.id}`}
          >
            {locked ? 'Locked' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}
