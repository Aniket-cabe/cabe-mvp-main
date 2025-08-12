import React from 'react';
import { Lock, Play, ExternalLink } from 'lucide-react';
import type { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onClick: () => void;
  onStartCourse: () => void;
  userRank?: string;
}

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-orange-100 text-orange-800',
  expert: 'bg-red-100 text-red-800',
};

const CATEGORY_COLORS = {
  'fullstack-dev': 'bg-purple-100 text-purple-800',
  'cloud-devops': 'bg-blue-100 text-blue-800',
  'data-analytics': 'bg-green-100 text-green-800',
  'ai-ml': 'bg-orange-100 text-orange-800',
};

const RANK_ORDER = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

export default function CourseCard({
  course,
  onClick,
  onStartCourse,
  userRank = 'Bronze',
}: CourseCardProps) {
  const isLocked =
    RANK_ORDER.indexOf(course.requiredRank) > RANK_ORDER.indexOf(userRank);
  const canStartCourse = !isLocked;

  const handleStartCourse = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canStartCourse) {
      onStartCourse();
    }
  };

  return (
    <div className="relative group" data-testid="course-card">
      <div
        className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer ${
          isLocked ? 'blur-sm opacity-60' : 'hover:border-gray-300'
        }`}
        onClick={onClick}
      >
        {/* Course Image */}
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-4xl opacity-20">
                {course.category === 'fullstack-dev' && '💻'}
                {course.category === 'cloud-devops' && '☁️'}
                {course.category === 'data-analytics' && '📊'}
                {course.category === 'ai-ml' && '🤖'}
              </div>
            </div>
          )}

          {/* Platform Icon */}
          {course.source &&
            ['fiverr', 'internshala'].includes(course.source) && (
              <div
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm"
                title="Synced from Fiverr ✔️"
              >
                <ExternalLink className="h-4 w-4 text-gray-600" />
              </div>
            )}

          {/* Progress Bar */}
          {course.progress !== undefined && course.progress > 0 && (
            <div
              className="absolute bottom-0 left-0 right-0 bg-gray-200 h-1"
              data-testid="progress-bar"
            >
              <div
                className="bg-blue-600 h-1 transition-all duration-300"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Course Content */}
        <div className="p-4">
          {/* Category and Difficulty */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[course.category]}`}
            >
              {course.category.charAt(0).toUpperCase() +
                course.category.slice(1)}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[course.difficulty]}`}
            >
              {course.difficulty.charAt(0).toUpperCase() +
                course.difficulty.slice(1)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {course.description}
          </p>

          {/* Course Meta */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <span>{course.duration}</span>
            {course.instructor && <span>by {course.instructor}</span>}
          </div>

          {/* Rating and Enrollment */}
          {(course.rating || course.enrolledCount) && (
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
              {course.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span>{course.rating.toFixed(1)}</span>
                </div>
              )}
              {course.enrolledCount && (
                <span>{course.enrolledCount} enrolled</span>
              )}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleStartCourse}
            disabled={!canStartCourse}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              canStartCourse
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canStartCourse ? (
              <>
                <Play className="h-4 w-4" />
                Start Course
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Unlock at {course.requiredRank} ✨
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
          <div className="bg-white rounded-lg p-4 text-center shadow-lg">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">
              Unlock at {course.requiredRank} ✨
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Complete more tasks to advance
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
