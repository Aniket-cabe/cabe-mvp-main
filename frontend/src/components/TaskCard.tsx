import React from 'react';
import { motion } from 'framer-motion';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string;
    skill_category: string;
    task_type: 'practice' | 'mini_project';
    base_points: number;
    max_points: number;
    estimated_duration: number;
    difficulty_level: 'easy' | 'medium' | 'hard' | 'expert';
    expires_at?: string;
    completion_count: number;
    max_completions: number;
  };
  onSelect?: (taskId: string) => void;
  isSelected?: boolean;
  showExpiry?: boolean;
  className?: string;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onSelect,
  isSelected = false,
  showExpiry = true,
  className = '',
}) => {
  const getSkillIcon = (category: string) => {
    const icons = {
      'Full-Stack Software Development': '💻',
      'Cloud Computing & DevOps': '☁️',
      'Data Science & Analytics': '📊',
      'AI / Machine Learning': '🤖',
    };
    return icons[category as keyof typeof icons] || '📋';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      hard: 'bg-orange-100 text-orange-800 border-orange-200',
      expert: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[difficulty as keyof typeof colors] || colors.easy;
  };

  const getTaskTypeColor = (type: string) => {
    return type === 'practice' 
      ? 'bg-blue-100 text-blue-800 border-blue-200' 
      : 'bg-purple-100 text-purple-800 border-purple-200';
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getExpiryStatus = () => {
    if (!task.expires_at) return null;
    
    const now = new Date();
    const expiry = new Date(task.expires_at);
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'expired', text: 'Expired', color: 'text-red-600' };
    if (diffDays <= 1) return { status: 'urgent', text: 'Expires today', color: 'text-red-500' };
    if (diffDays <= 3) return { status: 'warning', text: `Expires in ${diffDays} days`, color: 'text-orange-500' };
    return { status: 'normal', text: `Expires in ${diffDays} days`, color: 'text-gray-500' };
  };

  const getCompletionStatus = () => {
    const percentage = (task.completion_count / task.max_completions) * 100;
    if (percentage >= 90) return { status: 'full', text: 'Almost full', color: 'text-red-500' };
    if (percentage >= 75) return { status: 'high', text: 'High demand', color: 'text-orange-500' };
    if (percentage >= 50) return { status: 'medium', text: 'Popular', color: 'text-yellow-500' };
    return { status: 'low', text: 'Available', color: 'text-green-500' };
  };

  const expiryStatus = getExpiryStatus();
  const completionStatus = getCompletionStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-200
        ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}
        ${className}
      `}
      onClick={() => onSelect?.(task.id)}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getSkillIcon(task.skill_category)}</span>
            <span className="text-sm font-medium text-gray-600">{task.skill_category}</span>
          </div>
          
          {/* Points Display */}
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {task.base_points}-{task.max_points}
            </div>
            <div className="text-xs text-gray-500">points</div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {task.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {task.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTaskTypeColor(task.task_type)}`}>
            {task.task_type === 'practice' ? 'Practice' : 'Mini Project'}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(task.difficulty_level)}`}>
            {task.difficulty_level.charAt(0).toUpperCase() + task.difficulty_level.slice(1)}
          </span>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatDuration(task.estimated_duration)}</span>
            </span>
            
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{task.completion_count}/{task.max_completions}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-xs">
          {expiryStatus && showExpiry && (
            <span className={expiryStatus.color}>
              {expiryStatus.text}
            </span>
          )}
          <span className={completionStatus.color}>
            {completionStatus.text}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(task.completion_count / task.max_completions) * 100}%` }}
          />
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Expired Overlay */}
      {expiryStatus?.status === 'expired' && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 rounded-xl flex items-center justify-center">
          <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700">
            Expired
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TaskCard;
