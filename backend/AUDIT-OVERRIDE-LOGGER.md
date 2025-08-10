# Audit Override Logger Utility

A comprehensive backend utility for logging manual override actions taken by human reviewers in the CaBE Arena SubmissionInspector.

## Overview

The `audit-override-logger.ts` utility provides a robust system for tracking and logging all manual actions taken by reviewers when they override AI recommendations in the audit dashboard. This ensures full transparency and accountability in the review process.

## Features

### Core Functionality

- **Action Logging**: Log all manual override actions with full context
- **Metadata Tracking**: Capture submission details, scores, and reasoning
- **Audit Trail**: Maintain complete history of reviewer decisions
- **Statistics**: Generate insights on review patterns and trends

### Supported Actions

- `allow` - Reviewer allows the submission as-is
- `flag_for_review` - Submission flagged for additional review
- `escalate` - Submission escalated to higher authority
- `override` - Reviewer overrides AI recommendation

## API Reference

### Main Functions

#### `logOverrideAction(input: OverrideActionInput): Promise<AuditLogEntry>`

Logs an override action taken by a human reviewer.

**Parameters:**

```typescript
interface OverrideActionInput {
  submissionId: string; // Required: Unique submission identifier
  reviewer: string; // Required: Reviewer ID/name
  actionTaken: OverrideAction; // Required: Action type
  notes?: string; // Optional: Reviewer notes
  originalDeviationType?: string; // Optional: Original AI deviation type
  originalSuggestedAction?: string; // Optional: Original AI suggested action
  userScore?: number; // Optional: User's submitted score
  aiScore?: number; // Optional: AI's audit score
  taskTitle?: string; // Optional: Task title
  skillArea?: string; // Optional: Skill area
}
```

**Returns:**

```typescript
interface AuditLogEntry {
  auditLogId: string; // Unique log identifier
  submissionId: string; // Submission ID
  reviewer: string; // Reviewer ID
  actionTaken: OverrideAction; // Action taken
  timestamp: string; // ISO timestamp
  notes?: string; // Reviewer notes
  // ... additional fields from input
  metadata: {
    systemVersion: string; // System version
    logSource: string; // Log source identifier
    environment: string; // Environment (dev/prod)
  };
}
```

#### `getAuditLogsForSubmission(submissionId: string): Promise<AuditLogEntry[]>`

Retrieves all audit logs for a specific submission.

#### `getAuditLogsForReviewer(reviewer: string, limit?: number): Promise<AuditLogEntry[]>`

Retrieves audit logs for a specific reviewer with optional limit.

#### `getAuditStatistics(startDate: Date, endDate: Date): Promise<object>`

Gets audit statistics for a specific time period.

## Usage Examples

### Basic Usage

```typescript
import { logOverrideAction } from '../src/utils/audit-override-logger';

// Log a simple override action
const result = await logOverrideAction({
  submissionId: 'sub-001',
  reviewer: 'admin-1',
  actionTaken: 'override',
  notes: 'User score was too high for the quality of code submitted',
});

console.log('Action logged:', result.auditLogId);
```

### Complete Usage with Context

```typescript
// Log with full submission context
const result = await logOverrideAction({
  submissionId: 'sub-002',
  reviewer: 'admin-2',
  actionTaken: 'flag_for_review',
  notes: 'Minor deviation detected, but code quality is acceptable',
  originalDeviationType: 'minor',
  originalSuggestedAction: 'flag_for_review',
  userScore: 85,
  aiScore: 78,
  taskTitle: 'Build a responsive navigation bar',
  skillArea: 'frontend',
});
```

### Frontend Integration

```typescript
import { AuditOverrideLogger } from '../scripts/integrate-audit-override-logger';

// Set up the current reviewer
AuditOverrideLogger.setCurrentReviewer('admin-1');

// Log an action from the SubmissionInspector
const auditLog = await AuditOverrideLogger.logAction(
  'sub-001',
  'override',
  'Manual review required due to significant score discrepancy',
  {
    deviationType: 'critical',
    suggestedAction: 'escalate',
    userScore: 92,
    aiScore: 45,
  }
);
```

## Integration with SubmissionInspector

The audit override logger is designed to integrate seamlessly with the SubmissionInspector component:

### 1. Action Button Handlers

```typescript
// In SubmissionInspector component
const handleActionClick = async (action: OverrideAction) => {
  try {
    const result = await submissionInspectorIntegration.handleActionClick(
      submission.id,
      action,
      actionNote,
      submission
    );

    if (result.success) {
      // Show success message
      // Close modal
      // Refresh data
    }
  } catch (error) {
    // Handle error
  }
};
```

### 2. Audit History Display

```typescript
// Load and display audit history
const loadAuditHistory = async () => {
  const result =
    await submissionInspectorIntegration.loadAuditHistory(submissionId);
  if (result.success) {
    setAuditHistory(result.auditLogs);
  }
};
```

## API Endpoints

The integration script provides ready-to-use Express.js endpoints:

### POST `/api/audit/override`

Log an override action.

**Request Body:**

```json
{
  "submissionId": "sub-001",
  "reviewer": "admin-1",
  "actionTaken": "override",
  "notes": "Manual review required",
  "submissionData": {
    "deviationType": "critical",
    "suggestedAction": "escalate",
    "userScore": 92,
    "aiScore": 45
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Override action logged successfully",
  "auditLogId": "uuid-123",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### GET `/api/audit/submission/:submissionId`

Get audit history for a submission.

### GET `/api/audit/reviewer/:reviewerId`

Get audit logs for a specific reviewer.

### GET `/api/audit/statistics`

Get audit statistics for a time period.

## Database Schema (Future Implementation)

When implementing with a real database, consider this schema:

```sql
CREATE TABLE audit_override_logs (
  audit_log_id UUID PRIMARY KEY,
  submission_id VARCHAR(255) NOT NULL,
  reviewer VARCHAR(255) NOT NULL,
  action_taken VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  notes TEXT,
  original_deviation_type VARCHAR(50),
  original_suggested_action VARCHAR(50),
  user_score INTEGER,
  ai_score INTEGER,
  task_title VARCHAR(500),
  skill_area VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_submission_id ON audit_override_logs(submission_id);
CREATE INDEX idx_audit_logs_reviewer ON audit_override_logs(reviewer);
CREATE INDEX idx_audit_logs_timestamp ON audit_override_logs(timestamp);
CREATE INDEX idx_audit_logs_action_taken ON audit_override_logs(action_taken);
```

## Error Handling

The utility includes comprehensive error handling:

```typescript
try {
  const result = await logOverrideAction(input);
  // Handle success
} catch (error) {
  if (error instanceof Error) {
    console.error('Logging failed:', error.message);
    // Handle specific error
  } else {
    console.error('Unknown error occurred');
    // Handle unknown error
  }
}
```

## Validation

Input validation is built-in:

```typescript
import { validateOverrideActionInput } from '../src/utils/audit-override-logger';

const isValid = validateOverrideActionInput(input);
if (!isValid) {
  // Handle invalid input
}
```

## Testing

Run the test suite to verify functionality:

```bash
# Run all tests
npm run test:audit-logger

# Run specific test
npm run test:audit-logger -- --grep "Basic Usage"
```

## Configuration

The logger can be configured via environment variables:

```typescript
const CONFIG = {
  SYSTEM_VERSION: process.env.SYSTEM_VERSION || '1.0.0',
  LOG_SOURCE: process.env.LOG_SOURCE || 'audit-override-logger',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
};
```

## Security Considerations

1. **Input Validation**: All inputs are validated before processing
2. **Error Handling**: Sensitive information is not exposed in error messages
3. **Audit Trail**: All actions are logged for accountability
4. **Access Control**: Ensure only authorized reviewers can log actions

## Performance

- **Async Operations**: All database operations are asynchronous
- **Batch Processing**: Multiple actions can be processed efficiently
- **Indexing**: Database indexes optimize query performance
- **Caching**: Consider caching frequently accessed audit logs

## Monitoring and Analytics

The logger provides hooks for monitoring:

```typescript
// Monitor action frequency
const stats = await getAuditStatistics(startDate, endDate);
console.log('Total actions:', stats.totalActions);
console.log('Action breakdown:', stats.actionBreakdown);

// Monitor reviewer activity
const reviewerLogs = await getAuditLogsForReviewer('admin-1', 100);
console.log('Reviewer activity:', reviewerLogs.length);
```

## Future Enhancements

1. **Real-time Notifications**: Alert supervisors of critical overrides
2. **Machine Learning**: Analyze patterns to improve AI recommendations
3. **Advanced Analytics**: Dashboard for review quality metrics
4. **Integration APIs**: Connect with external audit systems
5. **Export Functionality**: Export audit logs for compliance reporting

## Troubleshooting

### Common Issues

1. **Missing Required Fields**: Ensure all required fields are provided
2. **Invalid Action Type**: Use only supported action types
3. **Database Connection**: Check database connectivity in production
4. **Permission Errors**: Verify reviewer permissions

### Debug Mode

Enable debug logging:

```typescript
process.env.DEBUG = 'audit-override-logger:*';
```

## Support

For issues or questions:

1. Check the test suite for usage examples
2. Review the integration examples
3. Check error logs for specific error messages
4. Verify input validation requirements
