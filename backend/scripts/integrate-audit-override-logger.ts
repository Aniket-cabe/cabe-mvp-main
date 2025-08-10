import {
  logOverrideAction,
  getAuditLogsForSubmission,
  type OverrideActionInput,
  type AuditLogEntry,
} from '../src/utils/audit-override-logger';

/**
 * Integration example for the Audit Override Logger
 * Shows how to integrate with API endpoints and the SubmissionInspector
 */

// Simulated API endpoint for handling override actions
export async function handleOverrideAction(req: any, res: any) {
  try {
    const { submissionId, reviewer, actionTaken, notes, submissionData } =
      req.body;

    // Validate input
    if (!submissionId || !reviewer || !actionTaken) {
      return res.status(400).json({
        error:
          'Missing required fields: submissionId, reviewer, and actionTaken are required',
      });
    }

    // Prepare the override action input
    const overrideInput: OverrideActionInput = {
      submissionId,
      reviewer,
      actionTaken,
      notes,
      // Include additional context if available
      originalDeviationType: submissionData?.deviationType,
      originalSuggestedAction: submissionData?.suggestedAction,
      userScore: submissionData?.userScore,
      aiScore: submissionData?.aiScore,
      taskTitle: submissionData?.taskTitle,
      skillArea: submissionData?.skillArea,
    };

    // Log the override action
    const auditLogEntry = await logOverrideAction(overrideInput);

    // Return success response
    res.status(200).json({
      success: true,
      message: `Override action logged successfully`,
      auditLogId: auditLogEntry.auditLogId,
      timestamp: auditLogEntry.timestamp,
    });
  } catch (error) {
    console.error('Error handling override action:', error);
    res.status(500).json({
      error: 'Failed to log override action',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Simulated API endpoint for retrieving audit logs
export async function getSubmissionAuditHistory(req: any, res: any) {
  try {
    const { submissionId } = req.params;

    if (!submissionId) {
      return res.status(400).json({
        error: 'Submission ID is required',
      });
    }

    // Retrieve audit logs for the submission
    const auditLogs = await getAuditLogsForSubmission(submissionId);

    res.status(200).json({
      success: true,
      submissionId,
      auditLogs,
      totalLogs: auditLogs.length,
    });
  } catch (error) {
    console.error('Error retrieving audit history:', error);
    res.status(500).json({
      error: 'Failed to retrieve audit history',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Frontend integration helper (for use in SubmissionInspector)
export class AuditOverrideLogger {
  private static currentReviewer: string = '';

  /**
   * Set the current reviewer for the session
   */
  static setCurrentReviewer(reviewer: string) {
    this.currentReviewer = reviewer;
  }

  /**
   * Log an override action from the frontend
   */
  static async logAction(
    submissionId: string,
    actionTaken: 'allow' | 'flag_for_review' | 'escalate' | 'override',
    notes?: string,
    submissionData?: any
  ): Promise<AuditLogEntry> {
    if (!this.currentReviewer) {
      throw new Error(
        'Current reviewer not set. Call setCurrentReviewer() first.'
      );
    }

    const input: OverrideActionInput = {
      submissionId,
      reviewer: this.currentReviewer,
      actionTaken,
      notes,
      originalDeviationType: submissionData?.deviationType,
      originalSuggestedAction: submissionData?.suggestedAction,
      userScore: submissionData?.userScore,
      aiScore: submissionData?.aiScore,
      taskTitle: submissionData?.taskTitle,
      skillArea: submissionData?.skillArea,
    };

    return await logOverrideAction(input);
  }

  /**
   * Get audit history for a submission
   */
  static async getAuditHistory(submissionId: string): Promise<AuditLogEntry[]> {
    return await getAuditLogsForSubmission(submissionId);
  }
}

// Example usage in SubmissionInspector component
export const submissionInspectorIntegration = {
  /**
   * Handle action button clicks in SubmissionInspector
   */
  async handleActionClick(
    submissionId: string,
    action: 'allow' | 'flag_for_review' | 'escalate' | 'override',
    notes: string,
    submissionData: any
  ) {
    try {
      // Log the action
      const auditLog = await AuditOverrideLogger.logAction(
        submissionId,
        action,
        notes,
        submissionData
      );

      console.log('Action logged successfully:', auditLog.auditLogId);

      // You could also update the UI here
      // e.g., show a success message, close modal, refresh data, etc.

      return {
        success: true,
        auditLogId: auditLog.auditLogId,
        message: `${action.replace('_', ' ')} action logged successfully`,
      };
    } catch (error) {
      console.error('Failed to log action:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Load audit history for display in SubmissionInspector
   */
  async loadAuditHistory(submissionId: string) {
    try {
      const auditLogs = await AuditOverrideLogger.getAuditHistory(submissionId);
      return {
        success: true,
        auditLogs,
        totalLogs: auditLogs.length,
      };
    } catch (error) {
      console.error('Failed to load audit history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        auditLogs: [],
      };
    }
  },
};

// Example Express.js route setup
export const setupAuditRoutes = (app: any) => {
  // POST /api/audit/override - Log an override action
  app.post('/api/audit/override', handleOverrideAction);

  // GET /api/audit/submission/:submissionId - Get audit history for a submission
  app.get('/api/audit/submission/:submissionId', getSubmissionAuditHistory);

  // GET /api/audit/reviewer/:reviewerId - Get audit logs for a specific reviewer
  app.get('/api/audit/reviewer/:reviewerId', async (req: any, res: any) => {
    try {
      const { reviewerId } = req.params;
      const { limit = 50 } = req.query;

      const { getAuditLogsForReviewer } = await import(
        '../src/utils/audit-override-logger'
      );
      const auditLogs = await getAuditLogsForReviewer(
        reviewerId,
        parseInt(limit as string)
      );

      res.status(200).json({
        success: true,
        reviewerId,
        auditLogs,
        totalLogs: auditLogs.length,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve reviewer audit logs',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // GET /api/audit/statistics - Get audit statistics
  app.get('/api/audit/statistics', async (req: any, res: any) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: 'startDate and endDate query parameters are required',
        });
      }

      const { getAuditStatistics } = await import(
        '../src/utils/audit-override-logger'
      );
      const stats = await getAuditStatistics(
        new Date(startDate),
        new Date(endDate)
      );

      res.status(200).json({
        success: true,
        statistics: stats,
        period: { startDate, endDate },
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve audit statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
};

// Example usage demonstration
async function demonstrateIntegration() {
  console.log('🔗 Demonstrating Audit Override Logger Integration\n');

  // Set up the current reviewer
  AuditOverrideLogger.setCurrentReviewer('admin-1');

  // Simulate a submission action
  const submissionData = {
    deviationType: 'critical',
    suggestedAction: 'escalate',
    userScore: 92,
    aiScore: 45,
    taskTitle: 'Build a responsive navigation bar',
    skillArea: 'frontend',
  };

  console.log('📝 Logging override action...');
  const result = await submissionInspectorIntegration.handleActionClick(
    'sub-001',
    'override',
    'User score was significantly higher than AI assessment. Manual review required.',
    submissionData
  );

  console.log('Result:', result);

  console.log('\n📋 Loading audit history...');
  const historyResult =
    await submissionInspectorIntegration.loadAuditHistory('sub-001');
  console.log('History result:', historyResult);

  console.log('\n✅ Integration demonstration completed!');
}

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateIntegration().catch(console.error);
}

export { demonstrateIntegration };
