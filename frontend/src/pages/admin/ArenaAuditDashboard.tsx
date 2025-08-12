import { useState } from 'react';
import SubmissionInspector from '../../components/admin/SubmissionInspector';

// Types
interface AuditRun {
  id: string;
  date: string;
  taskTitle: string;
  skillArea: string;
  status: 'pending' | 'completed';
  reviewer: string;
  submissionsCount: number;
  averageDeviation: number;
  criticalFlags: number;
}

interface Submission {
  id: string;
  userId: string;
  userScore: number;
  aiScore: number;
  deviationType: 'none' | 'minor' | 'major' | 'critical';
  suggestedAction: 'allow' | 'flag_for_review' | 'escalate' | 'override';
  taskTitle: string;
  skillArea: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  timestamp: string;
  reasoning: string;
  userProof: string;
  userCode: string;
  taskDescription: string;
}

// Dummy data
const dummyAuditRuns: AuditRun[] = [
  {
    id: 'run-001',
    date: '2024-01-15',
    taskTitle: 'Build a responsive navigation bar',
    skillArea: 'frontend',
    status: 'completed',
    reviewer: 'admin-1',
    submissionsCount: 45,
    averageDeviation: 3.2,
    criticalFlags: 2,
  },
  {
    id: 'run-002',
    date: '2024-01-14',
    taskTitle: 'Implement user authentication',
    skillArea: 'backend',
    status: 'completed',
    reviewer: 'admin-2',
    submissionsCount: 32,
    averageDeviation: 7.8,
    criticalFlags: 5,
  },
  {
    id: 'run-003',
    date: '2024-01-13',
    taskTitle: 'Create a machine learning model',
    skillArea: 'ai',
    status: 'pending',
    reviewer: 'admin-1',
    submissionsCount: 18,
    averageDeviation: 12.3,
    criticalFlags: 8,
  },
  {
    id: 'run-004',
    date: '2024-01-12',
    taskTitle: 'Design a mobile app interface',
    skillArea: 'design',
    status: 'completed',
    reviewer: 'admin-3',
    submissionsCount: 28,
    averageDeviation: 4.1,
    criticalFlags: 1,
  },
];

const dummySubmissions: Submission[] = [
  {
    id: 'sub-001',
    userId: 'user-123',
    userScore: 85,
    aiScore: 78,
    deviationType: 'minor',
    suggestedAction: 'flag_for_review',
    taskTitle: 'Build a responsive navigation bar',
    skillArea: 'frontend',
    difficulty: 'medium',
    timestamp: '2024-01-15T14:30:00Z',
    reasoning:
      'The user submitted a functional navigation bar with good responsive design, but the AI detected some accessibility issues and inconsistent styling patterns.',
    userProof:
      'I created a responsive navigation bar using HTML, CSS, and JavaScript. The navigation includes a hamburger menu for mobile devices and smooth transitions.',
    userCode: '<nav class="nav">...</nav>',
    taskDescription:
      'Create a responsive navigation bar that works on both desktop and mobile devices.',
  },
  {
    id: 'sub-002',
    userId: 'user-456',
    userScore: 92,
    aiScore: 45,
    deviationType: 'critical',
    suggestedAction: 'escalate',
    taskTitle: 'Build a responsive navigation bar',
    skillArea: 'frontend',
    difficulty: 'medium',
    timestamp: '2024-01-15T15:45:00Z',
    reasoning:
      'Critical deviation detected. User score is significantly higher than AI assessment, indicating potential scoring error or submission quality issues.',
    userProof: 'I built a complete navigation system with advanced features.',
    userCode: '<div>Basic navigation</div>',
    taskDescription:
      'Create a responsive navigation bar that works on both desktop and mobile devices.',
  },
  {
    id: 'sub-003',
    userId: 'user-789',
    userScore: 88,
    aiScore: 87,
    deviationType: 'none',
    suggestedAction: 'allow',
    taskTitle: 'Build a responsive navigation bar',
    skillArea: 'frontend',
    difficulty: 'medium',
    timestamp: '2024-01-15T16:20:00Z',
    reasoning:
      'Scores are within acceptable variance range. Both user and AI assessments align well.',
    userProof:
      'I implemented a responsive navigation bar following best practices.',
    userCode: '<nav>Responsive navigation</nav>',
    taskDescription:
      'Create a responsive navigation bar that works on both desktop and mobile devices.',
  },
  {
    id: 'sub-004',
    userId: 'user-101',
    userScore: 75,
    aiScore: 82,
    deviationType: 'minor',
    suggestedAction: 'flag_for_review',
    taskTitle: 'Build a responsive navigation bar',
    skillArea: 'frontend',
    difficulty: 'medium',
    timestamp: '2024-01-15T17:10:00Z',
    reasoning:
      'Minor deviation in scoring. AI score is slightly higher, suggesting user may have been too critical of their own work.',
    userProof: 'I created a navigation bar that works on mobile and desktop.',
    userCode: '<header>Navigation</header>',
    taskDescription:
      'Create a responsive navigation bar that works on both desktop and mobile devices.',
  },
];

// Main Dashboard Component
const ArenaAuditDashboard: React.FC = () => {
  const [selectedRun, setSelectedRun] = useState<AuditRun | null>(
    dummyAuditRuns[0]
  );
  const [filterSkillArea, setFilterSkillArea] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterReviewer, setFilterReviewer] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Filter audit runs
  const filteredRuns = dummyAuditRuns.filter((run) => {
    if (filterSkillArea !== 'all' && run.skillArea !== filterSkillArea)
      return false;
    if (filterStatus !== 'all' && run.status !== filterStatus) return false;
    if (filterReviewer !== 'all' && run.reviewer !== filterReviewer)
      return false;
    return true;
  });

  // Sort audit runs
  const sortedRuns = [...filteredRuns].sort((a, b) => {
    const aValue = a[sortField as keyof AuditRun];
    const bValue = b[sortField as keyof AuditRun];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  // Filter submissions for selected run
  const filteredSubmissions = dummySubmissions.filter(
    (sub) => sub.taskTitle === selectedRun?.taskTitle
  );

  const handleRunClick = (run: AuditRun) => {
    setSelectedRun(run);
  };

  const handleSubmissionClick = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsInspectorOpen(true);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getDeviationTypeColor = (type: string) => {
    switch (type) {
      case 'none':
        return 'bg-green-100 text-green-800';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800';
      case 'major':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'allow':
        return 'bg-green-100 text-green-800';
      case 'flag_for_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'escalate':
        return 'bg-red-100 text-red-800';
      case 'override':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Arena Audit Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Admin interface for managing audit runs and submissions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                New Audit Run
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Audit Run List */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Audit Runs
                </h2>

                {/* Filters */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skill Area
                    </label>
                    <select
                      value={filterSkillArea}
                      onChange={(e) => setFilterSkillArea(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Areas</option>
                      <option value="frontend">Frontend</option>
                      <option value="backend">Backend</option>
                      <option value="ai">AI</option>
                      <option value="fullstack-dev">Full-Stack Software Development</option>
                      <option value="cloud-devops">Cloud Computing & DevOps</option>
                      <option value="data-analytics">Data Science & Analytics</option>
                      <option value="ai-ml">AI / Machine Learning</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reviewer
                    </label>
                    <select
                      value={filterReviewer}
                      onChange={(e) => setFilterReviewer(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Reviewers</option>
                      <option value="admin-1">Admin 1</option>
                      <option value="admin-2">Admin 2</option>
                      <option value="admin-3">Admin 3</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Audit Run List */}
              <div className="max-h-96 overflow-y-auto">
                {sortedRuns.map((run) => (
                  <div
                    key={run.id}
                    onClick={() => handleRunClick(run)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedRun?.id === run.id
                        ? 'bg-blue-50 border-blue-200'
                        : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {run.taskTitle}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          run.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {run.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>ID: {run.id}</div>
                      <div>Date: {run.date}</div>
                      <div>Skill: {run.skillArea}</div>
                      <div>Submissions: {run.submissionsCount}</div>
                      <div>Avg Deviation: {run.averageDeviation}</div>
                      <div>Critical Flags: {run.criticalFlags}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Panel */}
          <div className="flex-1">
            {selectedRun ? (
              <div className="space-y-6">
                {/* Audit Run Details */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedRun.taskTitle}
                      </h2>
                      <p className="text-sm text-gray-600">
                        Run ID: {selectedRun.id}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        selectedRun.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {selectedRun.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedRun.submissionsCount}
                      </div>
                      <div className="text-sm text-gray-600">
                        Submissions Audited
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedRun.averageDeviation}
                      </div>
                      <div className="text-sm text-gray-600">
                        Average Deviation
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {selectedRun.criticalFlags}
                      </div>
                      <div className="text-sm text-gray-600">
                        Critical Flags
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedRun.reviewer}
                      </div>
                      <div className="text-sm text-gray-600">Reviewer</div>
                    </div>
                  </div>
                </div>

                {/* Submission Table */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Submissions
                    </h3>
                    <p className="text-sm text-gray-600">
                      Click on any row to inspect submission details
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('userId')}
                          >
                            User ID
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('userScore')}
                          >
                            User Score
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('aiScore')}
                          >
                            AI Score
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('deviationType')}
                          >
                            Deviation Type
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('suggestedAction')}
                          >
                            Suggested Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSubmissions.map((submission) => (
                          <tr
                            key={submission.id}
                            onClick={() => handleSubmissionClick(submission)}
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {submission.userId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {submission.userScore}/100
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {submission.aiScore}/100
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getDeviationTypeColor(submission.deviationType)}`}
                              >
                                {submission.deviationType.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(submission.suggestedAction)}`}
                              >
                                {submission.suggestedAction
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
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Audit Run Selected
                </h3>
                <p className="text-gray-600">
                  Select an audit run from the sidebar to view details and
                  submissions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submission Inspector Modal */}
      <SubmissionInspector
        submission={selectedSubmission}
        isOpen={isInspectorOpen}
        onClose={() => {
          setIsInspectorOpen(false);
          setSelectedSubmission(null);
        }}
      />
    </div>
  );
};

export default ArenaAuditDashboard;
