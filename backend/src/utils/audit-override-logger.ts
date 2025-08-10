import { randomUUID } from 'crypto';

// Types
export type OverrideAction =
  | 'allow'
  | 'flag_for_review'
  | 'escalate'
  | 'override';

export interface OverrideActionInput {
  submissionId: string;
  reviewer: string;
  actionTaken: OverrideAction;
  notes?: string;
  originalDeviationType?: 'none' | 'minor' | 'major' | 'critical';
  originalSuggestedAction?: string;
  userScore?: number;
  aiScore?: number;
  taskTitle?: string;
  skillArea?: string;
}

export interface AuditLogEntry {
  auditLogId: string;
  submissionId: string;
  reviewer: string;
  actionTaken: OverrideAction;
  timestamp: string;
  notes?: string;
  originalDeviationType?: 'none' | 'minor' | 'major' | 'critical';
  originalSuggestedAction?: string;
  userScore?: number;
  aiScore?: number;
  taskTitle?: string;
  skillArea?: string;
  metadata: {
    systemVersion: string;
    logSource: string;
    environment: string;
  };
}

// Configuration
const CONFIG = {
  SYSTEM_VERSION: '1.0.0',
  LOG_SOURCE: 'audit-override-logger',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
};

/**
 * Logs an override action taken by a human reviewer
 *
 * @param input - The override action input containing submission details and action taken
 * @returns Promise<AuditLogEntry> - The created audit log entry
 */
export async function logOverrideAction(
  input: OverrideActionInput
): Promise<AuditLogEntry> {
  try {
    // Validate required fields
    if (!input.submissionId || !input.reviewer || !input.actionTaken) {
      throw new Error(
        'Missing required fields: submissionId, reviewer, and actionTaken are required'
      );
    }

    // Generate audit log entry
    const auditLogEntry: AuditLogEntry = {
      auditLogId: randomUUID(),
      submissionId: input.submissionId,
      reviewer: input.reviewer,
      actionTaken: input.actionTaken,
      timestamp: new Date().toISOString(),
      notes: input.notes,
      originalDeviationType: input.originalDeviationType,
      originalSuggestedAction: input.originalSuggestedAction,
      userScore: input.userScore,
      aiScore: input.aiScore,
      taskTitle: input.taskTitle,
      skillArea: input.skillArea,
      metadata: {
        systemVersion: CONFIG.SYSTEM_VERSION,
        logSource: CONFIG.LOG_SOURCE,
        environment: CONFIG.ENVIRONMENT,
      },
    };

    // Simulate database insertion
    await simulateDatabaseInsert(auditLogEntry);

    // Log to console (for development/debugging)
    console.log('🔍 AUDIT OVERRIDE LOGGED:', {
      ...auditLogEntry,
      _formatted: {
        action: `${auditLogEntry.actionTaken.toUpperCase()} by ${auditLogEntry.reviewer}`,
        submission: auditLogEntry.submissionId,
        time: new Date(auditLogEntry.timestamp).toLocaleString(),
        notes: auditLogEntry.notes || 'No notes provided',
      },
    });

    return auditLogEntry;
  } catch (error) {
    console.error('❌ Failed to log override action:', error);
    throw new Error(
      `Failed to log override action: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Simulates database insertion with a small delay
 * In production, this would be replaced with actual database operations
 */
async function simulateDatabaseInsert(
  auditLogEntry: AuditLogEntry
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate database operations
      console.log(
        '💾 Simulating database insertion for audit log:',
        auditLogEntry.auditLogId
      );
      resolve();
    }, 50); // Small delay to simulate DB operation
  });
}

/**
 * Retrieves audit logs for a specific submission
 *
 * @param submissionId - The submission ID to retrieve logs for
 * @returns Promise<AuditLogEntry[]> - Array of audit log entries
 */
export async function getAuditLogsForSubmission(
  submissionId: string
): Promise<AuditLogEntry[]> {
  try {
    // Simulate database query
    console.log(`📋 Retrieving audit logs for submission: ${submissionId}`);

    // In production, this would query the actual database
    // For now, return empty array (simulating no existing logs)
    return [];
  } catch (error) {
    console.error('❌ Failed to retrieve audit logs:', error);
    throw new Error(
      `Failed to retrieve audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Retrieves audit logs for a specific reviewer
 *
 * @param reviewer - The reviewer ID to retrieve logs for
 * @param limit - Maximum number of logs to return (default: 50)
 * @returns Promise<AuditLogEntry[]> - Array of audit log entries
 */
export async function getAuditLogsForReviewer(
  reviewer: string,
  limit: number = 50
): Promise<AuditLogEntry[]> {
  try {
    console.log(
      `👤 Retrieving audit logs for reviewer: ${reviewer} (limit: ${limit})`
    );

    // In production, this would query the actual database
    // For now, return empty array (simulating no existing logs)
    return [];
  } catch (error) {
    console.error('❌ Failed to retrieve reviewer audit logs:', error);
    throw new Error(
      `Failed to retrieve reviewer audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Gets audit statistics for a specific time period
 *
 * @param startDate - Start date for the period
 * @param endDate - End date for the period
 * @returns Promise<object> - Audit statistics
 */
export async function getAuditStatistics(
  startDate: Date,
  endDate: Date
): Promise<{
  totalActions: number;
  actionBreakdown: Record<OverrideAction, number>;
  topReviewers: Array<{ reviewer: string; actionCount: number }>;
  averageActionsPerDay: number;
}> {
  try {
    console.log(
      `📊 Retrieving audit statistics from ${startDate.toISOString()} to ${endDate.toISOString()}`
    );

    // In production, this would aggregate data from the database
    // For now, return mock statistics
    return {
      totalActions: 0,
      actionBreakdown: {
        allow: 0,
        flag_for_review: 0,
        escalate: 0,
        override: 0,
      },
      topReviewers: [],
      averageActionsPerDay: 0,
    };
  } catch (error) {
    console.error('❌ Failed to retrieve audit statistics:', error);
    throw new Error(
      `Failed to retrieve audit statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validates an override action input
 *
 * @param input - The input to validate
 * @returns boolean - True if valid, false otherwise
 */
export function validateOverrideActionInput(
  input: any
): input is OverrideActionInput {
  return (
    typeof input === 'object' &&
    input !== null &&
    typeof input.submissionId === 'string' &&
    input.submissionId.length > 0 &&
    typeof input.reviewer === 'string' &&
    input.reviewer.length > 0 &&
    typeof input.actionTaken === 'string' &&
    ['allow', 'flag_for_review', 'escalate', 'override'].includes(
      input.actionTaken
    )
  );
}

/**
 * Formats an audit log entry for display
 *
 * @param entry - The audit log entry to format
 * @returns string - Formatted string representation
 */
export function formatAuditLogEntry(entry: AuditLogEntry): string {
  const timestamp = new Date(entry.timestamp).toLocaleString();
  const action = entry.actionTaken.replace('_', ' ').toUpperCase();

  return `[${timestamp}] ${action} by ${entry.reviewer} on submission ${entry.submissionId}${entry.notes ? ` - ${entry.notes}` : ''}`;
}

// Export default function for convenience
export default logOverrideAction;
