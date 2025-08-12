/**
 * Audit Dashboard API Simulator
 *
 * Local mock API module that simulates API endpoints needed by the Arena Audit Dashboard frontend.
 * This allows testing all dashboard functionality without a backend.
 */

// Type Definitions
export interface AuditRunSummary {
  id: string;
  reviewer: string;
  taskTitle: string;
  skillArea: string;
  taskDifficulty: string;
  status: 'completed' | 'pending';
  startedAt: string;
  completedAt?: string;
}

export interface FullAuditRun extends AuditRunSummary {
  results: SubmissionAuditResult[];
}

export interface SubmissionAuditResult {
  submissionId: string;
  userId: string;
  userScore: number;
  aiScore: number;
  deviationType: 'none' | 'minor' | 'major' | 'critical';
  suggestedAction: 'allow' | 'flag_for_review' | 'escalate' | 'override';
  actionTaken?: string;
  notes?: string;
  timestamp: string;
}

// In-memory data storage
const mockAuditRuns: FullAuditRun[] = [
  {
    id: 'run-001',
    reviewer: 'admin-1',
    taskTitle: 'Build a responsive navigation bar',
    skillArea: 'fullstack-dev',
    taskDifficulty: 'medium',
    status: 'completed',
    startedAt: '2024-01-15T10:00:00Z',
    completedAt: '2024-01-15T11:30:00Z',
    results: [
      {
        submissionId: 'sub-001',
        userId: 'user-123',
        userScore: 85,
        aiScore: 78,
        deviationType: 'minor',
        suggestedAction: 'flag_for_review',
        actionTaken: 'allow',
        notes: 'Code quality exceeds AI assessment',
        timestamp: '2024-01-15T10:15:00Z',
      },
      {
        submissionId: 'sub-002',
        userId: 'user-456',
        userScore: 92,
        aiScore: 45,
        deviationType: 'critical',
        suggestedAction: 'escalate',
        actionTaken: 'override',
        notes: 'Critical deviation requires manual review',
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        submissionId: 'sub-003',
        userId: 'user-789',
        userScore: 88,
        aiScore: 87,
        deviationType: 'none',
        suggestedAction: 'allow',
        actionTaken: 'allow',
        notes: 'Perfect alignment',
        timestamp: '2024-01-15T10:45:00Z',
      },
      {
        submissionId: 'sub-004',
        userId: 'user-101',
        userScore: 75,
        aiScore: 82,
        deviationType: 'minor',
        suggestedAction: 'flag_for_review',
        actionTaken: 'flag_for_review',
        notes: 'Score discrepancy flagged for verification',
        timestamp: '2024-01-15T11:00:00Z',
      },
      {
        submissionId: 'sub-005',
        userId: 'user-202',
        userScore: 95,
        aiScore: 35,
        deviationType: 'critical',
        suggestedAction: 'escalate',
        actionTaken: 'escalate',
        notes: 'Critical deviation escalated to senior review',
        timestamp: '2024-01-15T11:15:00Z',
      },
    ],
  },
  {
    id: 'run-002',
    reviewer: 'admin-2',
    taskTitle: 'Implement user authentication system',
    skillArea: 'cloud-devops',
    taskDifficulty: 'hard',
    status: 'completed',
    startedAt: '2024-01-16T09:00:00Z',
    completedAt: '2024-01-16T12:00:00Z',
    results: [
      {
        submissionId: 'sub-006',
        userId: 'user-303',
        userScore: 78,
        aiScore: 82,
        deviationType: 'minor',
        suggestedAction: 'flag_for_review',
        actionTaken: 'allow',
        notes: 'Minor variance acceptable',
        timestamp: '2024-01-16T09:20:00Z',
      },
      {
        submissionId: 'sub-007',
        userId: 'user-404',
        userScore: 96,
        aiScore: 70,
        deviationType: 'major',
        suggestedAction: 'override',
        actionTaken: 'override',
        notes: 'Reviewer override applied',
        timestamp: '2024-01-16T09:45:00Z',
      },
      {
        submissionId: 'sub-008',
        userId: 'user-505',
        userScore: 82,
        aiScore: 85,
        deviationType: 'none',
        suggestedAction: 'allow',
        actionTaken: 'allow',
        notes: 'Good alignment',
        timestamp: '2024-01-16T10:10:00Z',
      },
      {
        submissionId: 'sub-009',
        userId: 'user-606',
        userScore: 88,
        aiScore: 45,
        deviationType: 'critical',
        suggestedAction: 'escalate',
        actionTaken: 'escalate',
        notes: 'Major discrepancy detected',
        timestamp: '2024-01-16T10:35:00Z',
      },
      {
        submissionId: 'sub-010',
        userId: 'user-707',
        userScore: 91,
        aiScore: 88,
        deviationType: 'minor',
        suggestedAction: 'flag_for_review',
        actionTaken: 'flag_for_review',
        notes: 'Minor variance acceptable',
        timestamp: '2024-01-16T11:00:00Z',
      },
      {
        submissionId: 'sub-011',
        userId: 'user-808',
        userScore: 73,
        aiScore: 75,
        deviationType: 'none',
        suggestedAction: 'allow',
        actionTaken: 'allow',
        notes: 'Scores align well',
        timestamp: '2024-01-16T11:25:00Z',
      },
    ],
  },
  {
    id: 'run-003',
    reviewer: 'admin-3',
    taskTitle: 'Design a landing page',
    skillArea: 'cloud-devops',
    taskDifficulty: 'easy',
    status: 'completed',
    startedAt: '2024-01-17T14:00:00Z',
    completedAt: '2024-01-17T15:15:00Z',
    results: [
      {
        submissionId: 'sub-012',
        userId: 'user-909',
        userScore: 90,
        aiScore: 92,
        deviationType: 'none',
        suggestedAction: 'allow',
        actionTaken: 'allow',
        notes: 'Excellent design work',
        timestamp: '2024-01-17T14:15:00Z',
      },
      {
        submissionId: 'sub-013',
        userId: 'user-010',
        userScore: 85,
        aiScore: 78,
        deviationType: 'minor',
        suggestedAction: 'flag_for_review',
        actionTaken: 'allow',
        notes: 'Design quality exceeds AI assessment',
        timestamp: '2024-01-17T14:30:00Z',
      },
      {
        submissionId: 'sub-014',
        userId: 'user-111',
        userScore: 92,
        aiScore: 88,
        deviationType: 'minor',
        suggestedAction: 'flag_for_review',
        actionTaken: 'flag_for_review',
        notes: 'Minor variance acceptable',
        timestamp: '2024-01-17T14:45:00Z',
      },
      {
        submissionId: 'sub-015',
        userId: 'user-212',
        userScore: 88,
        aiScore: 85,
        deviationType: 'none',
        suggestedAction: 'allow',
        actionTaken: 'allow',
        notes: 'Good alignment',
        timestamp: '2024-01-17T15:00:00Z',
      },
    ],
  },
  {
    id: 'run-004',
    reviewer: 'admin-1',
    taskTitle: 'Build a REST API',
    skillArea: 'cloud-devops',
    taskDifficulty: 'expert',
    status: 'pending',
    startedAt: '2024-01-18T08:00:00Z',
    results: [
      {
        submissionId: 'sub-016',
        userId: 'user-313',
        userScore: 95,
        aiScore: 88,
        deviationType: 'minor',
        suggestedAction: 'flag_for_review',
        actionTaken: 'allow',
        notes: 'Expert-level implementation',
        timestamp: '2024-01-18T08:20:00Z',
      },
      {
        submissionId: 'sub-017',
        userId: 'user-414',
        userScore: 88,
        aiScore: 92,
        deviationType: 'minor',
        suggestedAction: 'flag_for_review',
        actionTaken: 'flag_for_review',
        notes: 'High-quality API design',
        timestamp: '2024-01-18T08:45:00Z',
      },
      {
        submissionId: 'sub-018',
        userId: 'user-515',
        userScore: 82,
        aiScore: 75,
        deviationType: 'minor',
        suggestedAction: 'flag_for_review',
        actionTaken: 'allow',
        notes: 'Good implementation',
        timestamp: '2024-01-18T09:10:00Z',
      },
    ],
  },
];

// Helper function to simulate API latency
const simulateLatency = () =>
  new Promise((resolve) => setTimeout(resolve, 300));

/**
 * Get all audit runs (summary data)
 */
export async function getAuditRuns(): Promise<AuditRunSummary[]> {
  await simulateLatency();

  // Return summary data only
  return mockAuditRuns.map((run) => ({
    id: run.id,
    reviewer: run.reviewer,
    taskTitle: run.taskTitle,
    skillArea: run.skillArea,
    taskDifficulty: run.taskDifficulty,
    status: run.status,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
  }));
}

/**
 * Get full audit run data by ID
 */
export async function getAuditRunById(
  id: string
): Promise<FullAuditRun | null> {
  await simulateLatency();

  const auditRun = mockAuditRuns.find((run) => run.id === id);
  return auditRun || null;
}

/**
 * Get all unique reviewer names
 */
export async function getAllReviewers(): Promise<string[]> {
  await simulateLatency();

  const reviewers = new Set(mockAuditRuns.map((run) => run.reviewer));
  return Array.from(reviewers);
}

/**
 * Get audit runs filtered by reviewer
 */
export async function getAuditRunsByReviewer(
  reviewer: string
): Promise<AuditRunSummary[]> {
  await simulateLatency();

  return mockAuditRuns
    .filter((run) => run.reviewer === reviewer)
    .map((run) => ({
      id: run.id,
      reviewer: run.reviewer,
      taskTitle: run.taskTitle,
      skillArea: run.skillArea,
      taskDifficulty: run.taskDifficulty,
      status: run.status,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
    }));
}

/**
 * Get audit runs filtered by status
 */
export async function getAuditRunsByStatus(
  status: 'completed' | 'pending'
): Promise<AuditRunSummary[]> {
  await simulateLatency();

  return mockAuditRuns
    .filter((run) => run.status === status)
    .map((run) => ({
      id: run.id,
      reviewer: run.reviewer,
      taskTitle: run.taskTitle,
      skillArea: run.skillArea,
      taskDifficulty: run.taskDifficulty,
      status: run.status,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
    }));
}

/**
 * Get audit runs filtered by skill area
 */
export async function getAuditRunsBySkillArea(
  skillArea: string
): Promise<AuditRunSummary[]> {
  await simulateLatency();

  return mockAuditRuns
    .filter((run) => run.skillArea === skillArea)
    .map((run) => ({
      id: run.id,
      reviewer: run.reviewer,
      taskTitle: run.taskTitle,
      skillArea: run.skillArea,
      taskDifficulty: run.taskDifficulty,
      status: run.status,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
    }));
}

/**
 * Get all unique skill areas
 */
export async function getAllSkillAreas(): Promise<string[]> {
  await simulateLatency();

  const skillAreas = new Set(mockAuditRuns.map((run) => run.skillArea));
  return Array.from(skillAreas);
}

/**
 * Get all unique task difficulties
 */
export async function getAllTaskDifficulties(): Promise<string[]> {
  await simulateLatency();

  const difficulties = new Set(mockAuditRuns.map((run) => run.taskDifficulty));
  return Array.from(difficulties);
}

/**
 * Get submission audit result by ID
 */
export async function getSubmissionAuditResult(
  submissionId: string
): Promise<SubmissionAuditResult | null> {
  await simulateLatency();

  for (const run of mockAuditRuns) {
    const result = run.results.find((r) => r.submissionId === submissionId);
    if (result) {
      return result;
    }
  }

  return null;
}

/**
 * Get audit statistics
 */
export async function getAuditStatistics(): Promise<{
  totalRuns: number;
  completedRuns: number;
  pendingRuns: number;
  totalSubmissions: number;
  averageSubmissionsPerRun: number;
  reviewers: string[];
  skillAreas: string[];
}> {
  await simulateLatency();

  const totalRuns = mockAuditRuns.length;
  const completedRuns = mockAuditRuns.filter(
    (run) => run.status === 'completed'
  ).length;
  const pendingRuns = mockAuditRuns.filter(
    (run) => run.status === 'pending'
  ).length;
  const totalSubmissions = mockAuditRuns.reduce(
    (sum, run) => sum + run.results.length,
    0
  );
  const averageSubmissionsPerRun = totalSubmissions / totalRuns;

  const reviewers = new Set(mockAuditRuns.map((run) => run.reviewer));
  const skillAreas = new Set(mockAuditRuns.map((run) => run.skillArea));

  return {
    totalRuns,
    completedRuns,
    pendingRuns,
    totalSubmissions,
    averageSubmissionsPerRun,
    reviewers: Array.from(reviewers),
    skillAreas: Array.from(skillAreas),
  };
}

/**
 * Search audit runs by task title
 */
export async function searchAuditRuns(
  query: string
): Promise<AuditRunSummary[]> {
  await simulateLatency();

  const lowercaseQuery = query.toLowerCase();

  return mockAuditRuns
    .filter(
      (run) =>
        run.taskTitle.toLowerCase().includes(lowercaseQuery) ||
        run.skillArea.toLowerCase().includes(lowercaseQuery) ||
        run.reviewer.toLowerCase().includes(lowercaseQuery)
    )
    .map((run) => ({
      id: run.id,
      reviewer: run.reviewer,
      taskTitle: run.taskTitle,
      skillArea: run.skillArea,
      taskDifficulty: run.taskDifficulty,
      status: run.status,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
    }));
}

// Export all functions and types
export default {
  getAuditRuns,
  getAuditRunById,
  getAllReviewers,
  getAuditRunsByReviewer,
  getAuditRunsByStatus,
  getAuditRunsBySkillArea,
  getAllSkillAreas,
  getAllTaskDifficulties,
  getSubmissionAuditResult,
  getAuditStatistics,
  searchAuditRuns,
};
