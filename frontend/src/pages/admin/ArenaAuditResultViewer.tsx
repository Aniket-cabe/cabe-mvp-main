import React, { useState } from 'react';

// Types
interface AuditResult {
  id: string;
  submissionId: string;
  userId: string;
  userScore: number;
  aiScore: number;
  deviation: number;
  deviationType: 'none' | 'minor' | 'major' | 'critical';
  suggestedAction: 'allow' | 'flag_for_review' | 'escalate' | 'override';
  actionTaken?: 'allow' | 'flag_for_review' | 'escalate' | 'override';
  taskTitle: string;
  skillArea: string;
  timestamp: string;
}

interface AuditRun {
  id: string;
  reviewer: string;
  startedAt: string;
  completedAt: string;
  taskTitle: string;
  taskDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  skillArea: string;
  status: 'completed' | 'failed' | 'running';
  results: AuditResult[];
}

interface AuditSummary {
  totalSubmissions: number;
  averageUserScore: number;
  averageAiScore: number;
  averageDeviation: number;
  deviationBreakdown: {
    none: number;
    minor: number;
    major: number;
    critical: number;
  };
  actionBreakdown: {
    allow: number;
    flag_for_review: number;
    escalate: number;
    override: number;
  };
  healthScore: number;
  overallStatus: 'excellent' | 'good' | 'fair' | 'poor';
  keyInsights: string[];
}

// Dummy data
const dummyAuditRun: AuditRun = {
  id: 'audit-run-2024-001',
  reviewer: 'admin-1',
  startedAt: '2024-01-15T10:00:00Z',
  completedAt: '2024-01-15T14:30:00Z',
  taskTitle: 'Build a responsive navigation bar',
  taskDifficulty: 'medium',
  skillArea: 'frontend',
  status: 'completed',
  results: [
    {
      id: 'result-1',
      submissionId: 'sub-001',
      userId: 'user-123',
      userScore: 85,
      aiScore: 78,
      deviation: 7,
      deviationType: 'minor',
      suggestedAction: 'flag_for_review',
      actionTaken: 'allow',
      taskTitle: 'Build a responsive navigation bar',
      skillArea: 'frontend',
      timestamp: '2024-01-15T11:15:00Z',
    },
    {
      id: 'result-2',
      submissionId: 'sub-002',
      userId: 'user-456',
      userScore: 92,
      aiScore: 45,
      deviation: 47,
      deviationType: 'critical',
      suggestedAction: 'escalate',
      actionTaken: 'override',
      taskTitle: 'Build a responsive navigation bar',
      skillArea: 'frontend',
      timestamp: '2024-01-15T11:30:00Z',
    },
    {
      id: 'result-3',
      submissionId: 'sub-003',
      userId: 'user-789',
      userScore: 88,
      aiScore: 87,
      deviation: 1,
      deviationType: 'none',
      suggestedAction: 'allow',
      actionTaken: 'allow',
      taskTitle: 'Build a responsive navigation bar',
      skillArea: 'frontend',
      timestamp: '2024-01-15T11:45:00Z',
    },
    {
      id: 'result-4',
      submissionId: 'sub-004',
      userId: 'user-101',
      userScore: 75,
      aiScore: 82,
      deviation: 7,
      deviationType: 'minor',
      suggestedAction: 'flag_for_review',
      actionTaken: 'flag_for_review',
      taskTitle: 'Build a responsive navigation bar',
      skillArea: 'frontend',
      timestamp: '2024-01-15T12:00:00Z',
    },
    {
      id: 'result-5',
      submissionId: 'sub-005',
      userId: 'user-202',
      userScore: 95,
      aiScore: 35,
      deviation: 60,
      deviationType: 'critical',
      suggestedAction: 'escalate',
      actionTaken: 'escalate',
      taskTitle: 'Build a responsive navigation bar',
      skillArea: 'frontend',
      timestamp: '2024-01-15T12:15:00Z',
    },
    {
      id: 'result-6',
      submissionId: 'sub-006',
      userId: 'user-303',
      userScore: 82,
      aiScore: 79,
      deviation: 3,
      deviationType: 'none',
      suggestedAction: 'allow',
      actionTaken: 'allow',
      taskTitle: 'Build a responsive navigation bar',
      skillArea: 'frontend',
      timestamp: '2024-01-15T12:30:00Z',
    },
    {
      id: 'result-7',
      submissionId: 'sub-007',
      userId: 'user-404',
      userScore: 78,
      aiScore: 85,
      deviation: 7,
      deviationType: 'minor',
      suggestedAction: 'flag_for_review',
      actionTaken: 'flag_for_review',
      taskTitle: 'Build a responsive navigation bar',
      skillArea: 'frontend',
      timestamp: '2024-01-15T12:45:00Z',
    },
    {
      id: 'result-8',
      submissionId: 'sub-008',
      userId: 'user-505',
      userScore: 90,
      aiScore: 88,
      deviation: 2,
      deviationType: 'none',
      suggestedAction: 'allow',
      actionTaken: 'allow',
      taskTitle: 'Build a responsive navigation bar',
      skillArea: 'frontend',
      timestamp: '2024-01-15T13:00:00Z',
    },
  ],
};

// Helper function to summarize audit results
export function summarizeAuditResults(results: AuditResult[]): AuditSummary {
  const totalSubmissions = results.length;

  // Calculate averages
  const totalUserScore = results.reduce(
    (sum, result) => sum + result.userScore,
    0
  );
  const totalAiScore = results.reduce((sum, result) => sum + result.aiScore, 0);
  const totalDeviation = results.reduce(
    (sum, result) => sum + result.deviation,
    0
  );

  const averageUserScore =
    totalSubmissions > 0 ? totalUserScore / totalSubmissions : 0;
  const averageAiScore =
    totalSubmissions > 0 ? totalAiScore / totalSubmissions : 0;
  const averageDeviation =
    totalSubmissions > 0 ? totalDeviation / totalSubmissions : 0;

  // Count deviation types
  const deviationBreakdown = {
    none: results.filter((r) => r.deviationType === 'none').length,
    minor: results.filter((r) => r.deviationType === 'minor').length,
    major: results.filter((r) => r.deviationType === 'major').length,
    critical: results.filter((r) => r.deviationType === 'critical').length,
  };

  // Count actions taken
  const actionBreakdown = {
    allow: results.filter((r) => r.actionTaken === 'allow').length,
    flag_for_review: results.filter((r) => r.actionTaken === 'flag_for_review')
      .length,
    escalate: results.filter((r) => r.actionTaken === 'escalate').length,
    override: results.filter((r) => r.actionTaken === 'override').length,
  };

  // Calculate health score (0-100)
  const criticalWeight = deviationBreakdown.critical * 25;
  const majorWeight = deviationBreakdown.major * 15;
  const minorWeight = deviationBreakdown.minor * 5;
  const totalWeight = criticalWeight + majorWeight + minorWeight;
  const healthScore = Math.max(0, 100 - totalWeight);

  // Determine overall status
  let overallStatus: 'excellent' | 'good' | 'fair' | 'poor';
  if (healthScore >= 90) overallStatus = 'excellent';
  else if (healthScore >= 75) overallStatus = 'good';
  else if (healthScore >= 50) overallStatus = 'fair';
  else overallStatus = 'poor';

  // Generate key insights
  const keyInsights: string[] = [];

  if (deviationBreakdown.critical > 0) {
    keyInsights.push(
      `${deviationBreakdown.critical} critical deviations detected - requires immediate attention`
    );
  }

  if (deviationBreakdown.major > 0) {
    keyInsights.push(
      `${deviationBreakdown.major} major deviations found - review recommended`
    );
  }

  if (averageDeviation > 10) {
    keyInsights.push(
      `High average deviation (${averageDeviation.toFixed(1)}) suggests scoring inconsistencies`
    );
  }

  if (deviationBreakdown.none > totalSubmissions * 0.7) {
    keyInsights.push(
      'Good alignment between user and AI scores for majority of submissions'
    );
  }

  if (actionBreakdown.override > 0) {
    keyInsights.push(
      `${actionBreakdown.override} manual overrides applied by reviewers`
    );
  }

  return {
    totalSubmissions,
    averageUserScore,
    averageAiScore,
    averageDeviation,
    deviationBreakdown,
    actionBreakdown,
    healthScore,
    overallStatus,
    keyInsights,
  };
}

// Utility functions
const getDeviationTypeColor = (type: string) => {
  switch (type) {
    case 'none':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'minor':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'major':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'allow':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'flag_for_review':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'escalate':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'override':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'excellent':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'good':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'fair':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'poor':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const formatDuration = (startTime: string, endTime: string) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const duration = end.getTime() - start.getTime();
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

// Donut Chart Component (using Tailwind CSS only)
const DonutChart: React.FC<{
  data: { label: string; value: number; color: string }[];
  total: number;
  size?: number;
}> = ({ data, total, size = 120 }) => {
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;
  const segments = data.map((item) => {
    const percentage = total > 0 ? item.value / total : 0;
    const strokeDasharray = circumference * percentage;
    const strokeDashoffset = circumference - currentOffset;
    currentOffset += strokeDasharray;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
      percentage,
    };
  });

  return (
    <div className="relative inline-block">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-gray-200"
        />
        {segments.map((segment, index) => (
          <circle
            key={index}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={segment.strokeDasharray}
            strokeDashoffset={segment.strokeDashoffset}
            className={segment.color}
            strokeLinecap="round"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-bold">{total}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const ArenaAuditResultViewer: React.FC<{ auditRun?: AuditRun }> = ({
  auditRun = dummyAuditRun,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'details' | 'insights'
  >('overview');

  const summary = summarizeAuditResults(auditRun.results);

  const deviationChartData = [
    {
      label: 'None',
      value: summary.deviationBreakdown.none,
      color: 'text-green-500',
    },
    {
      label: 'Minor',
      value: summary.deviationBreakdown.minor,
      color: 'text-yellow-500',
    },
    {
      label: 'Major',
      value: summary.deviationBreakdown.major,
      color: 'text-orange-500',
    },
    {
      label: 'Critical',
      value: summary.deviationBreakdown.critical,
      color: 'text-red-500',
    },
  ];

  const actionChartData = [
    {
      label: 'Allow',
      value: summary.actionBreakdown.allow,
      color: 'text-green-500',
    },
    {
      label: 'Flag',
      value: summary.actionBreakdown.flag_for_review,
      color: 'text-yellow-500',
    },
    {
      label: 'Escalate',
      value: summary.actionBreakdown.escalate,
      color: 'text-red-500',
    },
    {
      label: 'Override',
      value: summary.actionBreakdown.override,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Audit Run Results
              </h1>
              <p className="text-sm text-gray-600">
                Detailed analysis of completed audit run
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                Export Report
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
                Share Results
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Audit Run Metadata */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {auditRun.taskTitle}
              </h3>
              <p className="text-sm text-gray-600">Run ID: {auditRun.id}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Reviewer:
                </span>
                <span className="text-sm text-gray-900">
                  {auditRun.reviewer}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Duration:
                </span>
                <span className="text-sm text-gray-900">
                  {formatDuration(auditRun.startedAt, auditRun.completedAt)}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Skill Area:
                </span>
                <span className="text-sm text-gray-900 capitalize">
                  {auditRun.skillArea}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Difficulty:
                </span>
                <span className="text-sm text-gray-900 capitalize">
                  {auditRun.taskDifficulty}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Started:
                </span>
                <span className="text-sm text-gray-900">
                  {formatDateTime(auditRun.startedAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Completed:
                </span>
                <span className="text-sm text-gray-900">
                  {formatDateTime(auditRun.completedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'details', label: 'Details', icon: '📋' },
                { id: 'insights', label: 'Insights', icon: '💡' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {summary.totalSubmissions}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Submissions
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {summary.averageUserScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Avg User Score</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {summary.averageAiScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Avg AI Score</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {summary.averageDeviation.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Deviation</div>
                  </div>
                </div>

                {/* Health Score */}
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      System Health Score
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(summary.overallStatus)}`}
                    >
                      {summary.overallStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Health Score</span>
                        <span>{summary.healthScore.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            summary.healthScore >= 90
                              ? 'bg-green-500'
                              : summary.healthScore >= 75
                                ? 'bg-blue-500'
                                : summary.healthScore >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                          }`}
                          style={{ width: `${summary.healthScore}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {summary.healthScore.toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Deviation Breakdown */}
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Deviation Breakdown
                    </h3>
                    <div className="flex items-center justify-center mb-4">
                      <DonutChart
                        data={deviationChartData}
                        total={summary.totalSubmissions}
                      />
                    </div>
                    <div className="space-y-2">
                      {deviationChartData.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${item.color.replace('text-', 'bg-')}`}
                            />
                            <span className="text-sm text-gray-700">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Distribution */}
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Action Distribution
                    </h3>
                    <div className="flex items-center justify-center mb-4">
                      <DonutChart
                        data={actionChartData}
                        total={summary.totalSubmissions}
                      />
                    </div>
                    <div className="space-y-2">
                      {actionChartData.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${item.color.replace('text-', 'bg-')}`}
                            />
                            <span className="text-sm text-gray-700">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Results Table */}
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Submission Results
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            AI Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Deviation
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {auditRun.results.map((result) => (
                          <tr key={result.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {result.userId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {result.userScore}/100
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {result.aiScore}/100
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {result.deviation}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium border ${getDeviationTypeColor(result.deviationType)}`}
                              >
                                {result.deviationType.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium border ${getActionColor(result.actionTaken || result.suggestedAction)}`}
                              >
                                {(result.actionTaken || result.suggestedAction)
                                  .replace('_', ' ')
                                  .toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="space-y-6">
                {/* Key Insights */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Key Insights
                  </h3>
                  <div className="space-y-3">
                    {summary.keyInsights.map((insight, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                      >
                        <div className="text-blue-500 mt-0.5">💡</div>
                        <p className="text-sm text-blue-900">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recommendations
                  </h3>
                  <div className="space-y-3">
                    {summary.deviationBreakdown.critical > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                        <div className="text-red-500 mt-0.5">⚠️</div>
                        <p className="text-sm text-red-900">
                          Review critical deviations immediately. Consider
                          adjusting scoring criteria or providing additional
                          training.
                        </p>
                      </div>
                    )}
                    {summary.averageDeviation > 10 && (
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                        <div className="text-yellow-500 mt-0.5">📊</div>
                        <p className="text-sm text-yellow-900">
                          High average deviation suggests potential scoring
                          inconsistencies. Review and refine evaluation
                          criteria.
                        </p>
                      </div>
                    )}
                    {summary.actionBreakdown.override > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                        <div className="text-purple-500 mt-0.5">🔄</div>
                        <p className="text-sm text-purple-900">
                          Manual overrides detected. Review override patterns to
                          improve AI scoring accuracy.
                        </p>
                      </div>
                    )}
                    {summary.healthScore >= 90 && (
                      <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="text-green-500 mt-0.5">✅</div>
                        <p className="text-sm text-green-900">
                          Excellent system health! The audit process is working
                          well with minimal deviations.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArenaAuditResultViewer;
