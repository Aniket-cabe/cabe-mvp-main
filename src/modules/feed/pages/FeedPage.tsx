import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Filter, Sparkles, Zap, Target, Star } from 'lucide-react';
import { useFeed } from '../hooks/useFeed';
import TaskCard from '../components/TaskCard';
import type { FeedTask } from '../types';

export default function FeedPage() {
  const {
    tasks,
    loading,
    error,
    hasNextPage,
    discardTask,
    refresh,
    filters,
    updateFilters,
  } = useFeed();

  const [discardingTask, setDiscardingTask] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const lastElementRef = useRef<HTMLDivElement>(null);

  const skillOptions = [
    { value: 'ai-ml', label: 'AI / Machine Learning', icon: '🤖' },
    { value: 'cloud-devops', label: 'Cloud Computing & DevOps', icon: '☁️' },
    { value: 'data-analytics', label: 'Data Science & Analytics', icon: '📊' },
    { value: 'fullstack-dev', label: 'Full-Stack Software Development', icon: '💻' },
  ];

  const difficultyOptions = [
    { value: 'easy', label: 'Easy', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'hard', label: 'Hard', color: 'text-red-600' },
  ];

  const typeOptions = [
    { value: 'arena', label: 'Arena', icon: <Target className="h-4 w-4" /> },
    { value: 'course', label: 'Course', icon: <Star className="h-4 w-4" /> },
    {
      value: 'challenge',
      label: 'Challenge',
      icon: <Zap className="h-4 w-4" />,
    },
  ];

  // Handle task discard with animation
  const handleDiscard = (taskId: string) => {
    setDiscardingTask(taskId);

    // Wait for animation to complete before removing from state
    setTimeout(() => {
      discardTask(taskId);
      setDiscardingTask(null);
    }, 300);
  };

  // Handle task acceptance
  const handleAccept = (taskId: string) => {
    console.log('Accepting task:', taskId);
    // In a real implementation, this would navigate to the task page
    // window.location.href = `/tasks/${taskId}`;
  };

  // Apply filters
  const applyFilters = () => {
    updateFilters({
      skills: selectedSkills.length > 0 ? selectedSkills : undefined,
      difficulty: selectedDifficulty || undefined,
      type: selectedType || undefined,
    });
    setShowFilters(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedSkills([]);
    setSelectedDifficulty('');
    setSelectedType('');
    updateFilters({});
    setShowFilters(false);
  };

  // Toggle skill selection
  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !loading) {
          // Load more tasks
          console.log('Loading more tasks...');
        }
      },
      { threshold: 0.1 }
    );

    if (lastElementRef.current) {
      observer.observe(lastElementRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, loading]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  AI Task Feed
                </h1>
                <p className="text-gray-600">
                  Personalized recommendations powered by AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showFilters
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
                aria-label="Toggle filters"
              >
                <Filter className="h-4 w-4 inline mr-1" />
                Filters
              </button>
              <button
                onClick={refresh}
                disabled={loading}
                className="px-3 py-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                aria-label="Refresh feed"
              >
                <RefreshCw
                  className={`h-4 w-4 inline mr-1 ${loading ? 'animate-spin' : ''}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Skills Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Skills
                  </h3>
                  <div className="space-y-2">
                    {skillOptions.map((skill) => (
                      <label key={skill.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSkills.includes(skill.value)}
                          onChange={() => toggleSkill(skill.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {skill.icon} {skill.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Difficulty
                  </h3>
                  <div className="space-y-2">
                    {difficultyOptions.map((difficulty) => (
                      <label
                        key={difficulty.value}
                        className="flex items-center"
                      >
                        <input
                          type="radio"
                          name="difficulty"
                          value={difficulty.value}
                          checked={selectedDifficulty === difficulty.value}
                          onChange={(e) =>
                            setSelectedDifficulty(e.target.value)
                          }
                          className="border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`ml-2 text-sm ${difficulty.color}`}>
                          {difficulty.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Type Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Type
                  </h3>
                  <div className="space-y-2">
                    {typeOptions.map((type) => (
                      <label key={type.value} className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value={type.value}
                          checked={selectedType === type.value}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                          {type.icon} {type.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Loading State */}
          {loading && tasks.length === 0 && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                Loading personalized recommendations...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Error Loading Feed
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={refresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && tasks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💫</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No quests left
              </h2>
              <p className="text-gray-600 mb-4">
                Come back tomorrow for fresh recommendations!
              </p>
              <button
                onClick={refresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Feed
              </button>
            </div>
          )}

          {/* Task Cards */}
          {tasks.length > 0 && (
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div key={task.id}>
                  <TaskCard
                    task={task}
                    onDiscard={handleDiscard}
                    onAccept={handleAccept}
                    isDiscarding={discardingTask === task.id}
                  />
                  {/* Intersection observer target for infinite scroll */}
                  {index === tasks.length - 1 && hasNextPage && (
                    <div ref={lastElementRef} className="h-4" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Loading More Indicator */}
          {loading && tasks.length > 0 && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">
                Loading more recommendations...
              </p>
            </div>
          )}

          {/* End of Feed */}
          {!loading && !hasNextPage && tasks.length > 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">🎉</div>
              <p className="text-gray-600">
                You've reached the end of your recommendations!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
