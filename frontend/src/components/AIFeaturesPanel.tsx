import React, { useState } from 'react';
import { useAIFeatures } from '../hooks/useAIFeatures';
import {
  ShieldCheckIcon,
  AcademicCapIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface AIFeaturesPanelProps {
  code?: string;
  language?: string;
  userId?: string;
}

export const AIFeaturesPanel: React.FC<AIFeaturesPanelProps> = ({
  code = '',
  language = 'javascript',
  userId = 'current-user',
}) => {
  const [activeTab, setActiveTab] = useState<
    'plagiarism' | 'learning' | 'suggestions'
  >('plagiarism');

  const {
    plagiarism,
    learningPaths,
    suggestions,
    detectPlagiarism,
    generateLearningPaths,
    getCodeSuggestions,
    getPlagiarismMessage,
  } = useAIFeatures();

  const handlePlagiarismCheck = async () => {
    if (!code.trim()) return;
    await detectPlagiarism(code, language);
  };

  const handleGenerateLearningPaths = async () => {
    if (!code.trim()) return;
    await generateLearningPaths(code, language);
  };

  const handleGetSuggestions = async () => {
    if (!code.trim()) return;
    await getCodeSuggestions(code, language);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          AI Code Assistant
        </h2>
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('plagiarism')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'plagiarism'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShieldCheckIcon className="w-4 h-4 inline mr-1" />
            Plagiarism
          </button>
          <button
            onClick={() => setActiveTab('learning')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'learning'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <AcademicCapIcon className="w-4 h-4 inline mr-1" />
            Learning
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'suggestions'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LightBulbIcon className="w-4 h-4 inline mr-1" />
            Suggestions
          </button>
        </div>
      </div>

      {activeTab === 'plagiarism' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <ShieldCheckIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-medium text-blue-900">
                  Plagiarism Detection
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Check your code for potential plagiarism and get detailed
                  analysis.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handlePlagiarismCheck}
            disabled={plagiarism.loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {plagiarism.loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </span>
            ) : (
              'Check for Plagiarism'
            )}
          </button>

          {plagiarism.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="w-4 h-4 text-red-600 mt-0.5 mr-2" />
                <span className="text-sm text-red-700">{plagiarism.error}</span>
              </div>
            </div>
          )}

          {plagiarism.result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-green-900">
                    Analysis Complete
                  </h4>
                  <p className="text-sm text-green-700 mt-1">
                    {getPlagiarismMessage(plagiarism.result)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'learning' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start">
              <AcademicCapIcon className="w-5 h-5 text-purple-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-medium text-purple-900">
                  Learning Paths
                </h3>
                <p className="text-sm text-purple-700 mt-1">
                  Get personalized learning recommendations based on your code.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateLearningPaths}
            disabled={learningPaths.loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {learningPaths.loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </span>
            ) : (
              'Generate Learning Path'
            )}
          </button>

          {learningPaths.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="w-4 h-4 text-red-600 mt-0.5 mr-2" />
                <span className="text-sm text-red-700">{learningPaths.error}</span>
              </div>
            </div>
          )}

          {learningPaths.paths && learningPaths.paths.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Recommended Paths</h4>
              {learningPaths.paths.map((path, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-3"
                >
                  <h5 className="font-medium text-gray-900">{path.title}</h5>
                  <p className="text-sm text-gray-600 mt-1">{path.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {path.tags?.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <LightBulbIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-medium text-yellow-900">
                  Code Suggestions
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Get AI-powered suggestions to improve your code quality.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleGetSuggestions}
            disabled={suggestions.loading}
            className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {suggestions.loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </span>
            ) : (
              'Get Suggestions'
            )}
          </button>

          {suggestions.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="w-4 h-4 text-red-600 mt-0.5 mr-2" />
                <span className="text-sm text-red-700">{suggestions.error}</span>
              </div>
            </div>
          )}

          {suggestions.suggestions && suggestions.suggestions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Suggestions</h4>
              {suggestions.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-start">
                    <LightBulbIcon className="w-4 h-4 text-yellow-600 mt-0.5 mr-2" />
                    <div>
                      <p className="text-sm text-gray-900">{suggestion.message}</p>
                      {suggestion.line && (
                        <p className="text-xs text-gray-500 mt-1">
                          Line {suggestion.line}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIFeaturesPanel;
