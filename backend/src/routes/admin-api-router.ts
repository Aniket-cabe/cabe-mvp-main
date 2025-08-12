/**
 * Admin API Router for CaBE Arena
 *
 * Centralized router for all audit-related admin operations:
 * - Audit result viewing
 * - Override logging
 * - Audit exporting
 * - Metadata fetching
 */

import express, { Request, Response, NextFunction } from 'express';
import {
  logOverrideAction,
  type OverrideActionInput,
} from '../utils/audit-override-logger';
import {
  exportAuditRun,
  listAvailableRuns,
  getExportStats,
} from '../../scripts/audit-run-exporter';
import {
  generateReviewMessage,
  type ReviewActionInput,
} from '../utils/AuditReviewChatHelper';
import {
  generateAuditInsights,
  type AuditInsightsResult,
} from '../utils/audit-insight-engine';

const router = express.Router();

// Types for API requests and responses
interface AuditRunResponse {
  id: string;
  reviewer: string;
  startedAt: string;
  completedAt: string;
  taskTitle: string;
  taskDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  skillArea: string;
  status: 'completed' | 'failed' | 'running';
  totalSubmissions: number;
  averageDeviation: number;
  criticalFlags: number;
  results: AuditResult[];
}

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
  taskDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  timestamp: string;
  reviewer?: string;
  notes?: string;
}

interface AuditSummaryResponse {
  id: string;
  reviewer: string;
  startedAt: string;
  completedAt: string;
  taskTitle: string;
  taskDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  skillArea: string;
  status: 'completed' | 'failed' | 'running';
  totalSubmissions: number;
  averageDeviation: number;
  criticalFlags: number;
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
}

interface OverrideRequest {
  submissionId: string;
  reviewer: string;
  actionTaken: 'allow' | 'flag_for_review' | 'escalate' | 'override';
  notes?: string;
  userScore?: number;
  aiScore?: number;
  taskTitle?: string;
  skillArea?: string;
  deviationType?: 'none' | 'minor' | 'major' | 'critical';
}

interface ExportRequest {
  format: 'csv' | 'json';
  outputDir?: string;
  flattenResults?: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Middleware for response time tracking
const responseTimeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
  });
  next();
};

// Middleware for authentication (dummy implementation)
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement real authentication
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Missing authorization header',
      timestamp: new Date().toISOString(),
    });
  }

  // For now, just check if header exists
  // In production, validate JWT token or session
  console.log('Auth check passed for:', req.path);
  next();
};

// Middleware for input validation
const validateRunId = (req: Request, res: Response, next: NextFunction) => {
  const { runId } = req.params;

  if (!runId || typeof runId !== 'string' || runId.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid run ID',
      message: 'Run ID is required and must be a non-empty string',
      timestamp: new Date().toISOString(),
    });
  }

  // Sanitize run ID (basic validation)
  if (!/^[a-zA-Z0-9-_]+$/.test(runId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid run ID format',
      message: 'Run ID contains invalid characters',
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// Helper function to generate dummy audit run data
async function fetchAuditRunData(runId: string): Promise<AuditRunResponse> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const baseTime = new Date('2024-01-15T10:00:00Z');

  const results: AuditResult[] = [
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
      taskTitle: 'Build Machine Learning Model',
      skillArea: 'ai-ml',
      taskDifficulty: 'medium',
      timestamp: new Date(baseTime.getTime() + 15 * 60000).toISOString(),
      reviewer: 'admin-1',
      notes: 'Code quality exceeds AI assessment',
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
      taskTitle: 'Deploy Application to Cloud',
      skillArea: 'cloud-devops',
      taskDifficulty: 'medium',
      timestamp: new Date(baseTime.getTime() + 30 * 60000).toISOString(),
      reviewer: 'admin-1',
      notes: 'Critical deviation requires manual review',
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
      taskTitle: 'Create Data Analysis Dashboard',
      skillArea: 'data-analytics',
      taskDifficulty: 'medium',
      timestamp: new Date(baseTime.getTime() + 45 * 60000).toISOString(),
      reviewer: 'admin-1',
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
      taskTitle: 'Full-Stack E-commerce Platform',
      skillArea: 'fullstack-dev',
      taskDifficulty: 'medium',
      timestamp: new Date(baseTime.getTime() + 60 * 60000).toISOString(),
      reviewer: 'admin-1',
      notes: 'Score discrepancy flagged for verification',
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
      taskTitle: 'Implement Neural Network',
      skillArea: 'ai-ml',
      taskDifficulty: 'medium',
      timestamp: new Date(baseTime.getTime() + 75 * 60000).toISOString(),
      reviewer: 'admin-1',
      notes: 'Critical deviation escalated to senior review',
    },
  ];

  const totalDeviation = results.reduce(
    (sum, result) => sum + result.deviation,
    0
  );
  const criticalFlags = results.filter(
    (result) => result.deviationType === 'critical'
  ).length;

  return {
    id: runId,
    reviewer: 'admin-1',
    startedAt: baseTime.toISOString(),
    completedAt: new Date(baseTime.getTime() + 150 * 60000).toISOString(),
    taskTitle: 'Build Machine Learning Model',
    taskDifficulty: 'medium',
    skillArea: 'ai-ml',
    status: 'completed',
    totalSubmissions: results.length,
    averageDeviation: totalDeviation / results.length,
    criticalFlags,
    results,
  };
}

// Helper function to calculate audit summary
function calculateAuditSummary(
  auditRun: AuditRunResponse
): AuditSummaryResponse {
  const deviationBreakdown = auditRun.results.reduce(
    (acc, result) => {
      acc[result.deviationType]++;
      return acc;
    },
    { none: 0, minor: 0, major: 0, critical: 0 }
  );

  const actionBreakdown = auditRun.results.reduce(
    (acc, result) => {
      const action = result.actionTaken || result.suggestedAction;
      acc[action]++;
      return acc;
    },
    { allow: 0, flag_for_review: 0, escalate: 0, override: 0 }
  );

  return {
    id: auditRun.id,
    reviewer: auditRun.reviewer,
    startedAt: auditRun.startedAt,
    completedAt: auditRun.completedAt,
    taskTitle: auditRun.taskTitle,
    taskDifficulty: auditRun.taskDifficulty,
    skillArea: auditRun.skillArea,
    status: auditRun.status,
    totalSubmissions: auditRun.totalSubmissions,
    averageDeviation: auditRun.averageDeviation,
    criticalFlags: auditRun.criticalFlags,
    deviationBreakdown,
    actionBreakdown,
  };
}

// Apply middleware to all routes
router.use(responseTimeMiddleware);
router.use(authMiddleware);

// 1. GET /audit/:runId - Fetch full audit run results
router.get(
  '/audit/:runId',
  validateRunId,
  async (req: Request, res: Response) => {
    try {
      const { runId } = req.params;

      console.log(`📥 Fetching audit run: ${runId}`);

      const auditRun = await fetchAuditRunData(runId);

      const response: ApiResponse<AuditRunResponse> = {
        success: true,
        data: auditRun,
        message: `Successfully fetched audit run ${runId}`,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('❌ Error fetching audit run:', error);

      const errorResponse: ApiResponse = {
        success: false,
        error: 'Failed to fetch audit run',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(errorResponse);
    }
  }
);

// 2. POST /audit/override - Log manual override action
router.post('/audit/override', async (req: Request, res: Response) => {
  try {
    const overrideData: OverrideRequest = req.body;

    // Validate required fields
    if (
      !overrideData.submissionId ||
      !overrideData.reviewer ||
      !overrideData.actionTaken
    ) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'submissionId, reviewer, and actionTaken are required',
        timestamp: new Date().toISOString(),
      });
    }

    // Validate actionTaken
    const validActions = ['allow', 'flag_for_review', 'escalate', 'override'];
    if (!validActions.includes(overrideData.actionTaken)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action',
        message: `actionTaken must be one of: ${validActions.join(', ')}`,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(
      `📝 Logging override action: ${overrideData.actionTaken} for ${overrideData.submissionId}`
    );

    // Prepare input for audit override logger
    const overrideInput: OverrideActionInput = {
      submissionId: overrideData.submissionId,
      reviewer: overrideData.reviewer,
      actionTaken: overrideData.actionTaken,
      notes: overrideData.notes,
      userScore: overrideData.userScore,
      aiScore: overrideData.aiScore,
      taskTitle: overrideData.taskTitle,
      skillArea: overrideData.skillArea,
      originalDeviationType: overrideData.deviationType,
    };

    // Log the override action
    const logEntry = await logOverrideAction(overrideInput);

    // Generate review message
    const reviewInput: ReviewActionInput = {
      submissionId: overrideData.submissionId,
      actionTaken: overrideData.actionTaken,
      deviationType: overrideData.deviationType || 'minor',
      reviewer: overrideData.reviewer,
      notes: overrideData.notes,
      taskTitle: overrideData.taskTitle || 'Unknown Task',
      skillArea: overrideData.skillArea || 'unknown',
      userScore: overrideData.userScore || 0,
      aiScore: overrideData.aiScore || 0,
      timestamp: new Date().toISOString(),
    };

    const reviewMessage = generateReviewMessage(reviewInput);

    const response: ApiResponse<{
      logEntry: any;
      reviewMessage: string;
    }> = {
      success: true,
      data: {
        logEntry,
        reviewMessage,
      },
      message: `Successfully logged override action: ${overrideData.actionTaken}`,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error logging override action:', error);

    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to log override action',
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(errorResponse);
  }
});

// 3. GET /audit/export/:runId - Export audit run
router.get(
  '/audit/export/:runId',
  validateRunId,
  async (req: Request, res: Response) => {
    try {
      const { runId } = req.params;
      const { format = 'csv', outputDir, flattenResults } = req.query;

      // Validate format
      if (format !== 'csv' && format !== 'json') {
        return res.status(400).json({
          success: false,
          error: 'Invalid export format',
          message: 'Format must be either "csv" or "json"',
          timestamp: new Date().toISOString(),
        });
      }

      console.log(`📊 Exporting audit run: ${runId} (${format})`);

      // Prepare export options
      const exportOptions: any = {};
      if (outputDir) exportOptions.outputDir = outputDir as string;
      if (flattenResults === 'true') exportOptions.flattenResults = true;

      // Export the audit run
      const filepath = await exportAuditRun(
        runId,
        format as 'csv' | 'json',
        exportOptions
      );

      // Get export statistics
      const stats = await getExportStats(exportOptions.outputDir || 'exports');

      const response: ApiResponse<{
        filepath: string;
        filename: string;
        format: string;
        stats: any;
      }> = {
        success: true,
        data: {
          filepath,
          filename: filepath.split('/').pop() || filepath,
          format: format as string,
          stats,
        },
        message: `Successfully exported audit run ${runId} as ${format.toUpperCase()}`,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('❌ Error exporting audit run:', error);

      const errorResponse: ApiResponse = {
        success: false,
        error: 'Failed to export audit run',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(errorResponse);
    }
  }
);

// 4. GET /audit/summary/:runId - Get audit run summary
router.get(
  '/audit/summary/:runId',
  validateRunId,
  async (req: Request, res: Response) => {
    try {
      const { runId } = req.params;

      console.log(`📋 Fetching audit summary: ${runId}`);

      const auditRun = await fetchAuditRunData(runId);
      const summary = calculateAuditSummary(auditRun);

      const response: ApiResponse<AuditSummaryResponse> = {
        success: true,
        data: summary,
        message: `Successfully fetched audit summary for ${runId}`,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('❌ Error fetching audit summary:', error);

      const errorResponse: ApiResponse = {
        success: false,
        error: 'Failed to fetch audit summary',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(errorResponse);
    }
  }
);

// 5. GET /audit/available - List available audit runs
router.get('/audit/available', async (req: Request, res: Response) => {
  try {
    console.log('📋 Fetching available audit runs');

    const availableRuns = await listAvailableRuns();

    const response: ApiResponse<{
      runs: string[];
      count: number;
    }> = {
      success: true,
      data: {
        runs: availableRuns,
        count: availableRuns.length,
      },
      message: `Found ${availableRuns.length} available audit runs`,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error fetching available audit runs:', error);

    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to fetch available audit runs',
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(errorResponse);
  }
});

// 6. GET /audit/stats - Get export statistics
router.get('/audit/stats', async (req: Request, res: Response) => {
  try {
    const { outputDir } = req.query;

    console.log('📊 Fetching export statistics');

    const stats = await getExportStats((outputDir as string) || 'exports');

    const response: ApiResponse<any> = {
      success: true,
      data: stats,
      message: 'Successfully fetched export statistics',
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error fetching export statistics:', error);

    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to fetch export statistics',
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(errorResponse);
  }
});

// 7. GET /audit/:runId/insights - Generate comprehensive audit insights
router.get(
  '/audit/:runId/insights',
  validateRunId,
  async (req: Request, res: Response) => {
    try {
      const { runId } = req.params;

      console.log('🧠 Generating insights for audit run:', runId);

      // Fetch audit run data
      const auditRun = await fetchAuditRunData(runId);

      // Generate comprehensive insights
      const insights = generateAuditInsights(auditRun);

      const response: ApiResponse<AuditInsightsResult> = {
        success: true,
        data: insights,
        message: `Successfully generated insights for audit run ${runId}`,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('❌ Error generating insights:', error);

      const errorResponse: ApiResponse = {
        success: false,
        error: 'Failed to generate insights',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(errorResponse);
    }
  }
);

// 8. GET /audit/health - Health check endpoint
router.get('/audit/health', (req: Request, res: Response) => {
  const response: ApiResponse<{
    status: string;
    timestamp: string;
    uptime: number;
    version: string;
  }> = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
    },
    message: 'Admin API is healthy',
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(response);
});

// Error handling middleware for unmatched routes
router.use('*', (req: Request, res: Response) => {
  const errorResponse: ApiResponse = {
    success: false,
    error: 'Route not found',
    message: `No route found for ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(errorResponse);
});

// Global error handling middleware
router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Unhandled error:', error);

  const errorResponse: ApiResponse = {
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  };

  res.status(500).json(errorResponse);
});

export default router;
