import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import type { SkillTask, SkillArea } from '../types';

interface SkillTaskListProps {
  tasks: SkillTask[];
  skill: SkillArea;
}

export default function SkillTaskList({ tasks, skill }: SkillTaskListProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scored':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'flagged':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  const toggleFeedback = (taskId: string) => {
    setShowFeedback((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
        <p className="text-gray-600">
          Start completing tasks in {skill.name} to see your history here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Task History</h2>
        <p className="text-sm text-gray-600">
          Your completed and pending tasks in {skill.name}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" data-testid="task-table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <React.Fragment key={task.id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleTaskExpansion(task.id)}
                        className="mr-2 text-gray-400 hover:text-gray-600"
                        aria-label={
                          expandedTask === task.id
                            ? 'Collapse task details'
                            : 'Expand task details'
                        }
                      >
                        {expandedTask === task.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      <div>
                        <div
                          className="text-sm font-medium text-gray-900"
                          data-testid={`task-title-${task.id}`}
                        >
                          {task.title}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {task.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}
                    >
                      {task.status.charAt(0).toUpperCase() +
                        task.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {task.status === 'scored' ? (
                      <span
                        className={`text-sm font-semibold ${getScoreColor(task.score)}`}
                        data-testid={`task-score-${task.id}`}
                      >
                        {task.score}%
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-sm font-medium text-gray-900"
                      data-testid={`task-points-${task.id}`}
                    >
                      {task.points_awarded}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-sm text-gray-500"
                      data-testid={`task-date-${task.id}`}
                    >
                      {formatDate(task.submitted_at)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {task.feedback && (
                        <button
                          onClick={() => toggleFeedback(task.id)}
                          className="text-gray-400 hover:text-gray-600"
                          aria-label={
                            showFeedback[task.id]
                              ? 'Hide feedback'
                              : 'Show feedback'
                          }
                        >
                          {showFeedback[task.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Expanded Task Details */}
                {expandedTask === task.id && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Task Description
                          </h4>
                          <p className="text-sm text-gray-600">
                            {task.description}
                          </p>
                        </div>

                        {task.breakdown && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Score Breakdown
                            </h4>
                            <p className="text-sm text-gray-600">
                              {task.breakdown}
                            </p>
                          </div>
                        )}

                        {task.feedback && showFeedback[task.id] && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Feedback
                            </h4>
                            <p className="text-sm text-gray-600">
                              {task.feedback}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-900">
                              Submitted:
                            </span>
                            <span className="text-gray-600 ml-2">
                              {formatDate(task.submitted_at)}
                            </span>
                          </div>
                          {task.scored_at && (
                            <div>
                              <span className="font-medium text-gray-900">
                                Scored:
                              </span>
                              <span className="text-gray-600 ml-2">
                                {formatDate(task.scored_at)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
