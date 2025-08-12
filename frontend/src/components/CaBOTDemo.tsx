import { useState } from 'react';
import {
  Brain,
  Play,
  RotateCcw,
  Settings,
  Eye,
  MessageSquare,
  Target,
  Users,
} from 'lucide-react';
import CaBOTCreditMeter from './CaBOTCreditMeter';
import { useCaBOTCredits } from '../hooks/useCaBOTCredits';

interface CaBOTDemoProps {
  className?: string;
}

type DemoAction = 'task_explanation' | 'auto_messenger' | 'smart_scoring';

export default function CaBOTDemo({ className = '' }: CaBOTDemoProps) {
  const { balance, consume, reset, loading } = useCaBOTCredits();
  const [selectedAction, setSelectedAction] =
    useState<DemoAction>('task_explanation');
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastAction, setLastAction] = useState<DemoAction | null>(null);

  const demoActions = [
    {
      id: 'task_explanation' as DemoAction,
      name: 'Task Explanation',
      description: 'AI-powered task breakdown and explanation',
      icon: <Brain className="text-blue-500" size={20} />,
      color: 'blue',
      example: 'Breaking down "Build a React Component" into clear steps',
    },
    {
      id: 'auto_messenger' as DemoAction,
      name: 'Auto Messenger',
      description: 'Generate contextual platform messages',
      icon: <MessageSquare className="text-purple-500" size={20} />,
      color: 'purple',
      example: 'Creating achievement notification: "Great work! Badge earned!"',
    },
    {
      id: 'smart_scoring' as DemoAction,
      name: 'Smart Scoring',
      description: 'Intelligent proof evaluation',
      icon: <Target className="text-green-500" size={20} />,
      color: 'green',
      example: 'Analyzing code submission for quality and completion',
    },
  ];

  const simulateAction = async (actionType: DemoAction) => {
    if (balance <= 0 || isSimulating) return;

    setIsSimulating(true);
    setSelectedAction(actionType);

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Consume credit
      await consume(1, actionType);
      setLastAction(actionType);

      // Show success feedback
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to simulate action:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const resetDemo = async () => {
    if (loading) return;

    try {
      await reset();
      setLastAction(null);
    } catch (error) {
      console.error('Failed to reset demo:', error);
    }
  };

  // const getActionColor = (actionId: DemoAction) => {
  //   const action = demoActions.find((a) => a.id === actionId);
  //   return action?.color || 'gray';
  // };

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Brain className="text-blue-600 dark:text-blue-400" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                CaBOT Credit System Demo
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Experience the AI-powered features and credit management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetDemo}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <RotateCcw size={16} />
              Reset Demo
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Credit Meter Section */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Credit Status
              </h3>

              <CaBOTCreditMeter
                size="lg"
                showHistory={true}
                showResetBanner={true}
                className="mb-6"
              />

              {/* Usage Instructions */}
              <div className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div className="font-medium mb-2">How to use:</div>
                  <ul className="space-y-1 text-xs">
                    <li>• Click actions below to consume credits</li>
                    <li>• Each action costs 1 credit</li>
                    <li>• Credits reset weekly</li>
                    <li>• History tracks all usage</li>
                  </ul>
                </div>

                {balance === 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="text-sm text-red-800 dark:text-red-200">
                      <div className="font-medium">No Credits Left!</div>
                      <div className="text-xs mt-1">
                        Use the "Reset Demo" button to restore credits for
                        testing.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              CaBOT AI Features
            </h3>

            <div className="grid grid-cols-1 gap-4 mb-6">
              {demoActions.map((action) => (
                <div
                  key={action.id}
                  className={`
                    relative p-6 rounded-xl border-2 transition-all cursor-pointer
                    ${
                      selectedAction === action.id
                        ? `border-${action.color}-500 bg-${action.color}-50 dark:bg-${action.color}-950`
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                    ${balance === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={() =>
                    !isSimulating && balance > 0 && setSelectedAction(action.id)
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          selectedAction === action.id
                            ? `bg-${action.color}-100 dark:bg-${action.color}-900`
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                      >
                        {action.icon}
                      </div>

                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {action.name}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                          {action.description}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-500 italic">
                          Example: {action.example}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        simulateAction(action.id);
                      }}
                      disabled={balance === 0 || isSimulating}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                        ${
                          balance === 0 || isSimulating
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : `bg-${action.color}-500 text-white hover:bg-${action.color}-600`
                        }
                      `}
                    >
                      {isSimulating && selectedAction === action.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Play size={16} />
                          Use (1 credit)
                        </>
                      )}
                    </button>
                  </div>

                  {/* Last Action Indicator */}
                  {lastAction === action.id && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Last Used
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Simulation Results */}
            {isSimulating && (
              <div className="p-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <div>
                    <div className="font-medium text-blue-800 dark:text-blue-200">
                      Running{' '}
                      {demoActions.find((a) => a.id === selectedAction)?.name}
                      ...
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      Consuming 1 credit from your balance
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Feature Showcase */}
            {!isSimulating && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="text-blue-500" size={16} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Real-time Monitoring
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Watch credits update instantly as you use AI features
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="text-purple-500" size={16} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Usage History
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Detailed tracking of all AI feature usage and timing
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="text-green-500" size={16} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Admin Analytics
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Platform-wide usage insights and user behavior patterns
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Integration Examples */}
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Integration Scenarios
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                🎯 Task Submission Flow
              </h5>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>1. User views task → clicks "Explain with AI"</div>
                <div>2. System checks credits → consumes 1 credit</div>
                <div>3. AI generates explanation → user proceeds</div>
                <div>4. Usage logged in history for tracking</div>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                📝 Proof Evaluation
              </h5>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>1. User submits proof → smart scoring enabled</div>
                <div>2. Credit consumed → AI analyzes submission</div>
                <div>3. Instant feedback provided → reduces wait time</div>
                <div>4. Admin sees usage analytics for optimization</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="text-sm">
              <span className="font-medium text-gray-900 dark:text-white">
                💡 Pro Tip:
              </span>
              <span className="text-gray-600 dark:text-gray-400 ml-2">
                Credits automatically reset every Monday, encouraging regular
                engagement while preventing overuse.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
