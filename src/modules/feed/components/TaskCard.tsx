import React, { useState, useRef } from 'react';
import { Clock, Target, Zap, Star, ArrowRight, X } from 'lucide-react';
import type { TaskCardProps } from '../types';
import WhyThisChip from './WhyThisChip';

export default function TaskCard({
  task,
  onDiscard,
  onAccept,
  isDiscarding = false,
}: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [showDiscardHint, setShowDiscardHint] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'arena':
        return <Target className="h-4 w-4" />;
      case 'course':
        return <Star className="h-4 w-4" />;
      case 'challenge':
        return <Zap className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'arena':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'course':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'challenge':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startXRef.current;

    if (deltaX < 0) {
      // Only allow left swipe
      setDragOffset(Math.max(deltaX, -100));
      setShowDiscardHint(deltaX < -50);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (dragOffset < -80) {
      // Trigger discard
      onDiscard(task.id);
    }

    setDragOffset(0);
    setShowDiscardHint(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startXRef.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startXRef.current;

    if (deltaX < 0) {
      // Only allow left swipe
      setDragOffset(Math.max(deltaX, -100));
      setShowDiscardHint(deltaX < -50);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    if (dragOffset < -80) {
      // Trigger discard
      onDiscard(task.id);
    }

    setDragOffset(0);
    setShowDiscardHint(false);
  };

  const handleAccept = () => {
    onAccept(task.id);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div
      ref={cardRef}
      className={`
        relative bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4
        transition-all duration-300 ease-out cursor-pointer
        ${isDiscarding ? 'transform translate-x-full opacity-0' : ''}
        ${isDragging ? 'select-none' : ''}
        hover:shadow-md hover:border-gray-300
      `}
      style={{
        transform: `translateX(${dragOffset}px)`,
        touchAction: 'pan-y',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      data-testid={`task-card-${task.id}`}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}. ${task.points} points, ${formatDuration(task.duration)} duration`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleAccept();
        }
      }}
    >
      {/* Discard Hint */}
      {showDiscardHint && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500 animate-pulse">
          <X className="h-8 w-8" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(task.type)}`}
            >
              {getTypeIcon(task.type)}
              <span className="capitalize">{task.type}</span>
            </span>
            <span
              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(task.difficulty)}`}
            >
              {task.difficulty}
            </span>
          </div>
          <h3
            className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2"
            data-testid="task-title"
          >
            {task.title}
          </h3>
          <p
            className="text-sm text-gray-600 line-clamp-2"
            data-testid="task-description"
          >
            {task.description}
          </p>
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="mb-4">
        <WhyThisChip
          reason={task.relevance_reason}
          relevanceScore={task.relevance_score}
          skillArea={task.skill_area}
        />
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-900 mb-1">
            <Target className="h-4 w-4 text-blue-500" />
            <span data-testid="task-points">{task.points}</span>
          </div>
          <div className="text-xs text-gray-500">Points</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-900 mb-1">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span data-testid="task-xp">{task.xp_value}</span>
          </div>
          <div className="text-xs text-gray-500">XP</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-900 mb-1">
            <Clock className="h-4 w-4 text-green-500" />
            <span data-testid="task-duration">
              {formatDuration(task.duration)}
            </span>
          </div>
          <div className="text-xs text-gray-500">Duration</div>
        </div>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
              +{task.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleAccept}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   transition-colors duration-200 flex items-center justify-center gap-2"
        data-testid="accept-task-button"
        aria-label={`Accept task: ${task.title}`}
      >
        <span>Start Task</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
