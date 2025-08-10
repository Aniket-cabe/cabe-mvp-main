import React from 'react';
import { Play, Zap, AlertTriangle } from 'lucide-react';
import { useModeration, ModerationModal } from '../index';
import type { ModerationType } from '../types';

export default function ModerationDemo() {
  const { isOpen, type, openModal, closeModal, triggerRandomModeration } =
    useModeration();

  const handleAppeal = () => {
    console.log('Appeal submitted!');
    // Here you would handle the appeal submission
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Moderation System Demo
        </h1>
        <p className="text-gray-600">
          Test the fake moderation UI message system
        </p>
      </div>

      {/* Test Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Test Controls
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Review Pending */}
          <button
            data-testid="review-pending-btn"
            onClick={() => openModal('review_pending')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition-colors"
          >
            <Play className="h-4 w-4" />
            Review Pending
          </button>

          {/* Suspicious */}
          <button
            data-testid="suspicious-btn"
            onClick={() => openModal('suspicious')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg transition-colors"
          >
            <AlertTriangle className="h-4 w-4" />
            Suspicious
          </button>

          {/* Rejected */}
          <button
            data-testid="rejected-btn"
            onClick={() => openModal('rejected')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
          >
            <AlertTriangle className="h-4 w-4" />
            Rejected
          </button>

          {/* Random */}
          <button
            data-testid="random-btn"
            onClick={triggerRandomModeration}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition-colors"
          >
            <Zap className="h-4 w-4" />
            Random
          </button>
        </div>
      </div>

      {/* Status Display */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Current Status
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Modal Open:</span>
            <span
              className={`font-medium ${isOpen ? 'text-green-600' : 'text-red-600'}`}
            >
              {isOpen ? 'Yes' : 'No'}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Current Type:</span>
            <span className="font-medium text-gray-900">{type || 'None'}</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          How it works:
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li>
            • <strong>Review Pending:</strong> Auto-closes after 8 seconds,
            shows processing indicator
          </li>
          <li>
            • <strong>Suspicious:</strong> Auto-closes after 12 seconds, fade-in
            animation
          </li>
          <li>
            • <strong>Rejected:</strong> Manual close, shows appeal button,
            shake animation
          </li>
          <li>
            • <strong>Random:</strong> Triggers random moderation type
          </li>
          <li>
            • <strong>WebSocket:</strong> In development mode, simulates random
            events every 30 seconds
          </li>
        </ul>
      </div>

      {/* Moderation Modal */}
      {isOpen && type && (
        <ModerationModal
          isOpen={isOpen}
          type={type}
          onClose={closeModal}
          onAppeal={handleAppeal}
        />
      )}
    </div>
  );
}
