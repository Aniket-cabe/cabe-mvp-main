import React, { useState } from 'react';
import useAIFeatures from '../hooks/useAIFeatures';

export default function AIFeaturesPanel() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const { loading, error, suggestions, getSuggestions } =
    useAIFeatures('/api/ai');

  const onSuggest = async () => {
    await getSuggestions(code, language);
  };

  return (
    <div className="p-4 rounded-lg border bg-white space-y-3">
      <h3 className="text-lg font-semibold">AI Power-Ups ⚡</h3>
      <div className="space-y-2">
        <label className="block text-sm">Language</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border rounded p-2"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-sm">Your Code</label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={6}
          className="w-full border rounded p-2"
          placeholder="Paste your code here..."
        />
      </div>
      <button
        onClick={onSuggest}
        disabled={loading}
        className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
        style={{ minWidth: 44, minHeight: 44 }}
      >
        {loading ? 'Cooking up suggestions…' : 'Get Suggestions'}
      </button>
      {error && (
        <div className="text-red-600 text-sm" role="alert">
          {error}
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="mt-3">
          <h4 className="font-medium">Suggestions</h4>
          <ul className="list-disc list-inside text-sm">
            {suggestions.map((s, i) => (
              <li key={i}>
                Line {s.line}: {s.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

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
    if (!code.trim()) {
      alert('Please enter some code to check for plagiarism.');
      return;
    }
    await detectPlagiarism(code, language);
  };

  const handleGenerateLearningPaths = async () => {
    await generateLearningPaths(userId);
  };

  const handleGetSuggestions = async () => {
    if (!code.trim()) {
      alert('Please enter some code to get suggestions.');
      return;
    }
    await getCodeSuggestions(code, language);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">AI Assistant</h2>
        <p className="text-sm text-gray-600 mt-1">
          Your intelligent coding companion powered by AI
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('plagiarism')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'plagiarism'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShieldCheckIcon className="h-5 w-5" />
            <span>Plagiarism Check</span>
          </button>
          <button
            onClick={() => setActiveTab('learning')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'learning'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <AcademicCapIcon className="h-5 w-5" />
            <span>Learning Paths</span>
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'suggestions'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <LightBulbIcon className="h-5 w-5" />
            <span>Code Suggestions</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Plagiarism Tab */}
        {activeTab === 'plagiarism' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Plagiarism Detection
                </h3>
                <p className="text-sm text-gray-600">
                  Check your code for similarity with existing submissions
                </p>
              </div>
              <button
                onClick={handlePlagiarismCheck}
                disabled={plagiarism.loading}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50"
              >
                {plagiarism.loading ? 'Checking...' : 'Check Code'}
              </button>
            </div>

            {plagiarism.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  <span className="text-red-700">{plagiarism.error}</span>
                </div>
              </div>
            )}

            {plagiarism.report && (
              <div className="space-y-4">
                {(() => {
                  const message = getPlagiarismMessage(plagiarism.report);
                  return (
                    <div
                      className={`bg-${message.type === 'error' ? 'red' : message.type === 'warning' ? 'yellow' : message.type === 'info' ? 'blue' : 'green'}-50 border border-${message.type === 'error' ? 'red' : message.type === 'warning' ? 'yellow' : message.type === 'info' ? 'blue' : 'green'}-200 rounded-lg p-4`}
                    >
                      <div className="flex items-center space-x-2">
                        {message.type === 'error' ? (
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                        ) : message.type === 'warning' ? (
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                        ) : message.type === 'info' ? (
                          <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                        ) : (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        )}
                        <div>
                          <h4 className={`font-medium ${message.color}`}>
                            {message.title}
                          </h4>
                          <p className="text-sm text-gray-700 mt-1">
                            {message.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Similarity Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Overall Similarity:
                      </span>
                      <span className="text-sm font-medium">
                        {(plagiarism.report.similarity * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Confidence:</span>
                      <span className="text-sm font-medium">
                        {(plagiarism.report.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Learning Paths Tab */}
        {activeTab === 'learning' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Personalized Learning Paths
                </h3>
                <p className="text-sm text-gray-600">
                  Get AI-powered recommendations based on your progress
                </p>
              </div>
              <button
                onClick={handleGenerateLearningPaths}
                disabled={learningPaths.loading}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
              >
                {learningPaths.loading ? 'Generating...' : 'Generate Paths'}
              </button>
            </div>

            {learningPaths.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  <span className="text-red-700">{learningPaths.error}</span>
                </div>
              </div>
            )}

            {learningPaths.paths.length > 0 && (
              <div className="space-y-4">
                {learningPaths.paths.map((path, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="font-medium text-gray-900">{path.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {path.description}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">{path.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Code Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Code Suggestions
                </h3>
                <p className="text-sm text-gray-600">
                  Get AI-powered suggestions to improve your code
                </p>
              </div>
              <button
                onClick={handleGetSuggestions}
                disabled={suggestions.loading}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
              >
                {suggestions.loading ? 'Analyzing...' : 'Get Suggestions'}
              </button>
            </div>

            {suggestions.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  <span className="text-red-700">{suggestions.error}</span>
                </div>
              </div>
            )}

            {suggestions.suggestions.length > 0 && (
              <div className="space-y-4">
                {suggestions.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700">
                          {suggestion.line}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {suggestion.message}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {suggestion.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIFeaturesPanel;
