import React, { useState } from 'react';
import { Zap, AlertTriangle, TrendingDown, Clock } from 'lucide-react';
import {
  DecayBanner,
  DecayHistoryModal,
  CreditWarningToast,
  CabotCreditRing,
  usePenaltyData,
  useCabot,
} from '../index';

export default function PenaltyDemo() {
  const { penaltyData, loading } = usePenaltyData();
  const { credits, consumeCredit, timeUntilReset } = useCabot();
  const [showDecayHistory, setShowDecayHistory] = useState(false);
  const [showCreditToast, setShowCreditToast] = useState(false);

  const handleConsumeCredit = async () => {
    const success = await consumeCredit();
    if (success && credits && credits.current <= 1) {
      setShowCreditToast(true);
    }
  };

  const getMockLastSubmission = () => {
    // Mock different scenarios for testing
    const scenarios = [
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago (warning)
      new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago (high warning)
      new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(), // 16 days ago (critical)
    ];
    return scenarios[Math.floor(Math.random() * scenarios.length)];
  };

  if (loading || !penaltyData || !credits) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading penalty system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Penalty & Point Decay System
        </h1>
        <p className="text-gray-600">
          Test the penalty and credit management system
        </p>
      </div>

      {/* Decay Banner */}
      <div data-testid="decay-banner">
        <DecayBanner
          lastSubmission={getMockLastSubmission()}
          onViewHistory={() => setShowDecayHistory(true)}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* CaBOT Credit Ring */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              CaBOT Credits
            </h2>
            <p className="text-sm text-gray-600">
              Weekly credit allocation for AI assistance
            </p>
          </div>

          <div className="flex justify-center mb-6" data-testid="credit-ring">
            <CabotCreditRing credits={credits} size={160} strokeWidth={12} />
          </div>

          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-gray-900">
              {credits.current} / {credits.max}
            </div>
            <div className="text-sm text-gray-600">Credits remaining</div>
            <div className="text-xs text-gray-500">
              Reset in {timeUntilReset}
            </div>
          </div>

          {/* Test Controls */}
          <div className="mt-6 space-y-2">
            <button
              data-testid="consume-credit-btn"
              onClick={handleConsumeCredit}
              disabled={credits.current <= 0}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Consume Credit (Test)
            </button>

            <button
              data-testid="show-toast-btn"
              onClick={() => setShowCreditToast(true)}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Show Credit Warning Toast
            </button>
          </div>
        </div>

        {/* Penalty Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Penalty Statistics
            </h2>
            <p className="text-sm text-gray-600">
              Your point decay and penalty history
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <div>
                  <div className="font-medium text-gray-900">
                    Total Points Lost
                  </div>
                  <div className="text-sm text-gray-600">All time decay</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {penaltyData.totalPointsLost}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-medium text-gray-900">
                    Days Since Last Submission
                  </div>
                  <div className="text-sm text-gray-600">Activity tracking</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {penaltyData.daysSinceLastSubmission}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">Decay Events</div>
                  <div className="text-sm text-gray-600">Total occurrences</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {penaltyData.pointsLost.length}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-2">
            <button
              onClick={() => setShowDecayHistory(true)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              View Decay History
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          How it works:
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li>
            • <strong>Decay Banner:</strong> Shows when last submission &gt; 7
            days, with urgency levels
          </li>
          <li>
            • <strong>CaBOT Credit Ring:</strong> Visual progress ring with
            countdown to weekly reset
          </li>
          <li>
            • <strong>Credit Warning Toast:</strong> Appears when credits &le;
            1, auto-hides after 8s
          </li>
          <li>
            • <strong>Decay History Modal:</strong> Detailed table of all point
            losses and penalties
          </li>
          <li>
            • <strong>Test Controls:</strong> Simulate credit consumption and
            warnings
          </li>
        </ul>
      </div>

      {/* Modals */}
      <DecayHistoryModal
        isOpen={showDecayHistory}
        onClose={() => setShowDecayHistory(false)}
        decayHistory={penaltyData.pointsLost}
      />

      <CreditWarningToast
        isVisible={showCreditToast}
        onClose={() => setShowCreditToast(false)}
        creditsLeft={credits.current}
      />
    </div>
  );
}
