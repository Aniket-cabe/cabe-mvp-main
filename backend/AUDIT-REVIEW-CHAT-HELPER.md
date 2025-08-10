# Audit Review Chat Helper

## Overview

The **Audit Review Chat Helper** is a comprehensive utility for generating human-style chat messages and summaries for audit review actions in the CaBE Arena system. It provides transparency, action logging, and feedback clarity by simulating what an admin would write when reviewing a submission.

## Features

### 🎯 **Core Functionality**

- **Professional message generation** for all review actions
- **Multiple message styles** (formal, casual, technical)
- **Contextual reasoning** based on deviation types and actions
- **Customizable output** with various options
- **Batch processing** for multiple actions
- **Audit trail generation** for tracking review history

### 📊 **Message Types**

- **Individual action messages** for single review actions
- **Batch summaries** for multiple actions
- **Audit trail messages** for tracking action history
- **Statistics messages** for review analytics
- **Specialized messages** for specific action types

### 🎨 **Styling Options**

- **Formal**: Professional, detailed explanations
- **Casual**: Conversational, concise messages
- **Technical**: Structured, log-style format

## API Reference

### Types

```typescript
export type ReviewActionType =
  | 'allow'
  | 'flag_for_review'
  | 'escalate'
  | 'override';

export interface ReviewActionInput {
  submissionId: string;
  actionTaken: ReviewActionType;
  deviationType: 'none' | 'minor' | 'major' | 'critical';
  reviewer: string;
  notes?: string;
  taskTitle: string;
  skillArea: string;
  userScore: number;
  aiScore: number;
  taskDifficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  timestamp?: string;
  previousActions?: ReviewActionType[];
}

export interface ReviewMessageOptions {
  includeTimestamp?: boolean;
  includeDeviationDetails?: boolean;
  includeSkillArea?: boolean;
  includeDifficulty?: boolean;
  style?: 'formal' | 'casual' | 'technical';
  maxLength?: number;
}
```

### Core Functions

#### `generateReviewMessage(input, options?)`

Generates a human-style message for a single review action.

```typescript
const message = generateReviewMessage(
  {
    submissionId: 'sub-123',
    actionTaken: 'override',
    deviationType: 'major',
    reviewer: 'admin-1',
    taskTitle: 'Build a portfolio website',
    skillArea: 'frontend',
    userScore: 85,
    aiScore: 60,
    taskDifficulty: 'medium',
    notes: 'Code quality exceeds AI assessment',
  },
  {
    style: 'formal',
    includeTimestamp: true,
    includeDeviationDetails: true,
  }
);
```

**Output:**

```
Reviewer admin-1 has overridden submission sub-123 for task "Build a portfolio website" (frontend development) - intermediate-level task. Manual override applied based on reviewer expertise. [AI: 60, User: 85, Deviation: 25] at 1/15/2024, 12:00:00 PM | Notes: Code quality exceeds AI assessment
```

#### `generateOverrideMessage(input, options?)`

Specialized message generator for override actions.

```typescript
const overrideMessage = generateOverrideMessage({
  submissionId: 'sub-456',
  actionTaken: 'override',
  deviationType: 'major',
  reviewer: 'admin-2',
  taskTitle: 'Create a blog system',
  skillArea: 'backend',
  userScore: 88,
  aiScore: 65,
  taskDifficulty: 'hard',
});
```

#### `generateEscalationMessage(input, options?)`

Specialized message generator for escalation actions.

```typescript
const escalationMessage = generateEscalationMessage({
  submissionId: 'sub-789',
  actionTaken: 'escalate',
  deviationType: 'critical',
  reviewer: 'admin-3',
  taskTitle: 'Implement authentication system',
  skillArea: 'security',
  userScore: 95,
  aiScore: 30,
  taskDifficulty: 'expert',
});
```

#### `generateFlagMessage(input, options?)`

Specialized message generator for flag actions.

```typescript
const flagMessage = generateFlagMessage({
  submissionId: 'sub-101',
  actionTaken: 'flag_for_review',
  deviationType: 'minor',
  reviewer: 'admin-4',
  taskTitle: 'Design a landing page',
  skillArea: 'design',
  userScore: 92,
  aiScore: 82,
  taskDifficulty: 'easy',
});
```

#### `generateAllowMessage(input, options?)`

Specialized message generator for allow actions.

```typescript
const allowMessage = generateAllowMessage({
  submissionId: 'sub-202',
  actionTaken: 'allow',
  deviationType: 'none',
  reviewer: 'admin-5',
  taskTitle: 'Build a responsive navigation bar',
  skillArea: 'frontend',
  userScore: 88,
  aiScore: 87,
  taskDifficulty: 'medium',
});
```

### Batch Processing Functions

#### `generateBatchReviewSummary(actions, options?)`

Generates a summary message for multiple review actions.

```typescript
const batchSummary = generateBatchReviewSummary(actions, {
  includeTimestamp: true,
  style: 'formal',
});
```

**Output:**

```
Reviewer admin-1 completed batch review of 4 submissions for "Build a responsive navigation bar": 1 allow, 1 flag for review, 1 override, 1 escalate at 1/15/2024, 10:45:00 AM
```

#### `generateAuditTrailMessage(actions, options?)`

Generates an audit trail message showing action history.

```typescript
const auditTrail = generateAuditTrailMessage(actions, {
  includeTimestamp: true,
  style: 'technical',
});
```

**Output:**

```
Audit trail for sub-005: flag_for_review → override (2 actions total) at 1/15/2024, 11:15:00 AM
```

#### `generateReviewStatsMessage(actions, options?)`

Generates statistical summary of review actions.

```typescript
const reviewStats = generateReviewStatsMessage(actions, {
  includeTimestamp: true,
  style: 'formal',
});
```

**Output:**

```
Review Summary: 4 actions, avg deviation: 15.8 | Actions: 1 allow, 1 flag for review, 1 override, 1 escalate at 1/15/2024, 10:00:00 AM
```

## Usage Examples

### Basic Usage

```typescript
import { generateReviewMessage } from '../src/utils/AuditReviewChatHelper';

// Simple message generation
const message = generateReviewMessage({
  submissionId: 'sub-123',
  actionTaken: 'override',
  deviationType: 'major',
  reviewer: 'admin-1',
  taskTitle: 'Build a portfolio website',
  skillArea: 'frontend',
  userScore: 85,
  aiScore: 60,
});

console.log(message);
```

### Advanced Usage with Options

```typescript
import { generateReviewMessage } from '../src/utils/AuditReviewChatHelper';

// Customized message with options
const message = generateReviewMessage(
  {
    submissionId: 'sub-456',
    actionTaken: 'flag_for_review',
    deviationType: 'minor',
    reviewer: 'admin-2',
    taskTitle: 'Create a blog system',
    skillArea: 'backend',
    userScore: 92,
    aiScore: 82,
    taskDifficulty: 'hard',
    notes: 'Score feels inflated for this difficulty',
  },
  {
    style: 'casual',
    includeTimestamp: true,
    includeDeviationDetails: true,
    includeSkillArea: true,
    includeDifficulty: true,
    maxLength: 300,
  }
);

console.log(message);
```

### Integration with Audit Override Logger

```typescript
import { generateReviewMessage } from '../src/utils/AuditReviewChatHelper';
import { logOverrideAction } from '../src/utils/audit-override-logger';

async function handleReviewAction(input: ReviewActionInput) {
  // 1. Log the action
  await logOverrideAction({
    submissionId: input.submissionId,
    reviewer: input.reviewer,
    actionTaken: input.actionTaken,
    notes: input.notes,
    originalDeviationType: input.deviationType,
    userScore: input.userScore,
    aiScore: input.aiScore,
    taskTitle: input.taskTitle,
    skillArea: input.skillArea,
  });

  // 2. Generate chat message
  const chatMessage = generateReviewMessage(input, {
    style: 'formal',
    includeTimestamp: true,
    includeDeviationDetails: true,
  });

  // 3. Send to chat system
  await sendToChatSystem(chatMessage);

  return chatMessage;
}
```

### Integration with SubmissionInspector

```typescript
import {
  generateOverrideMessage,
  generateEscalationMessage,
} from '../src/utils/AuditReviewChatHelper';

class SubmissionInspector {
  async handleAction(
    action: ReviewActionType,
    submission: any,
    notes?: string
  ) {
    const input: ReviewActionInput = {
      submissionId: submission.id,
      actionTaken: action,
      deviationType: submission.deviationType,
      reviewer: this.currentReviewer,
      notes,
      taskTitle: submission.taskTitle,
      skillArea: submission.skillArea,
      userScore: submission.userScore,
      aiScore: submission.aiScore,
      taskDifficulty: submission.difficulty,
      timestamp: new Date().toISOString(),
    };

    let message = '';
    switch (action) {
      case 'override':
        message = generateOverrideMessage(input);
        break;
      case 'escalate':
        message = generateEscalationMessage(input);
        break;
      default:
        message = generateReviewMessage(input);
    }

    // Log and send message
    await this.logAction(input);
    await this.sendChatMessage(message);
  }
}
```

### Integration with ArenaAuditDashboard

```typescript
import {
  generateBatchReviewSummary,
  generateAuditTrailMessage,
} from '../src/utils/AuditReviewChatHelper';

class ArenaAuditDashboard {
  async generateAuditSummary(actions: ReviewActionInput[]) {
    const summary = generateBatchReviewSummary(actions, {
      includeTimestamp: true,
      style: 'formal',
    });

    const auditTrail = generateAuditTrailMessage(actions, {
      includeTimestamp: true,
      style: 'technical',
    });

    return {
      summary,
      auditTrail,
      actionCount: actions.length,
    };
  }
}
```

## Message Styles

### Formal Style

```
Reviewer admin-1 has overridden submission sub-123 for task "Build a portfolio website" (frontend development) - intermediate-level task. Manual override applied based on reviewer expertise. [AI: 60, User: 85, Deviation: 25] at 1/15/2024, 12:00:00 PM | Notes: Code quality exceeds AI assessment
```

### Casual Style

```
admin-1 overridden sub-123 - "Build a portfolio website" (frontend development) - intermediate-level task. manual override applied based on reviewer expertise. [AI: 60, User: 85, Deviation: 25] at 1/15/2024, 12:00:00 PM | Notes: Code quality exceeds AI assessment
```

### Technical Style

```
[AUDIT] admin-1 | OVERRIDE | sub-123 | "Build a portfolio website" (frontend development) - intermediate-level task | Manual override applied based on reviewer expertise
```

## Configuration Options

### ReviewMessageOptions

| Option                    | Type                                | Default    | Description                          |
| ------------------------- | ----------------------------------- | ---------- | ------------------------------------ |
| `includeTimestamp`        | boolean                             | `true`     | Include timestamp in message         |
| `includeDeviationDetails` | boolean                             | `true`     | Include AI/User scores and deviation |
| `includeSkillArea`        | boolean                             | `true`     | Include skill area context           |
| `includeDifficulty`       | boolean                             | `true`     | Include task difficulty context      |
| `style`                   | 'formal' \| 'casual' \| 'technical' | `'formal'` | Message style                        |
| `maxLength`               | number                              | `500`      | Maximum message length               |

### Deviation Descriptions

The helper automatically categorizes deviations:

- **≤ 3**: minimal
- **≤ 8**: minor
- **≤ 15**: moderate
- **≤ 25**: significant
- **> 25**: major

### Skill Area Contexts

Automatic context mapping for skill areas:

- `frontend` → "frontend development"
- `backend` → "backend development"
- `ai` → "AI/ML implementation"
- `design` → "UI/UX design"
- `mobile` → "mobile development"
- `devops` → "DevOps practices"
- `database` → "database design"
- `security` → "security implementation"

### Difficulty Contexts

Automatic context mapping for difficulties:

- `easy` → "beginner-level"
- `medium` → "intermediate-level"
- `hard` → "advanced-level"
- `expert` → "expert-level"

## Error Handling

The helper includes robust error handling:

```typescript
// Handles missing optional fields gracefully
const message = generateReviewMessage({
  submissionId: 'sub-123',
  actionTaken: 'allow',
  deviationType: 'none',
  reviewer: 'admin-1',
  taskTitle: 'Simple task',
  skillArea: 'frontend',
  userScore: 85,
  aiScore: 87,
  // Missing optional fields are handled gracefully
});

// Handles empty arrays for batch operations
const summary = generateBatchReviewSummary([]);
// Returns: "No review actions to summarize."

// Handles message truncation
const shortMessage = generateReviewMessage(input, { maxLength: 50 });
// Automatically truncates with "..."
```

## Performance Considerations

- **Lightweight**: No external dependencies
- **Fast**: Pure TypeScript/JavaScript functions
- **Memory efficient**: No stateful operations
- **Scalable**: Handles large batches efficiently

## Testing

Run the test suite:

```bash
cd backend
npx ts-node scripts/test-audit-review-chat-helper.ts
```

The test suite covers:

- All message generation functions
- Different styles and options
- Edge cases and error handling
- Integration examples
- Batch processing
- Performance scenarios

## Integration Patterns

### 1. With Audit Override Logger

```typescript
// Enhanced logger with chat integration
class EnhancedAuditLogger {
  async logActionWithChat(input: ReviewActionInput) {
    // Log action
    await logOverrideAction(input);

    // Generate chat message
    const message = generateReviewMessage(input);

    // Send to chat system
    await sendToChat(message);
  }
}
```

### 2. With Frontend Components

```typescript
// React component integration
const SubmissionInspector = ({ submission, onAction }) => {
  const handleAction = async (action: ReviewActionType) => {
    const message = generateReviewMessage({
      submissionId: submission.id,
      actionTaken: action,
      // ... other fields
    });

    // Send to backend
    await onAction(action, message);
  };
};
```

### 3. With Notification Systems

```typescript
// Notification integration
async function sendReviewNotification(input: ReviewActionInput) {
  const message = generateReviewMessage(input, {
    style: 'casual',
    includeTimestamp: true,
  });

  if (input.actionTaken === 'escalate' || input.deviationType === 'critical') {
    await sendCriticalNotification(message);
  } else {
    await sendStandardNotification(message);
  }
}
```

## Best Practices

### 1. Message Consistency

- Use consistent style across your application
- Standardize timestamp formats
- Maintain consistent terminology

### 2. Performance

- Reuse message options objects
- Batch process when possible
- Cache frequently used configurations

### 3. Integration

- Integrate with existing logging systems
- Use appropriate message styles for different contexts
- Include relevant metadata in messages

### 4. Error Handling

- Always handle missing optional fields
- Validate input data before processing
- Provide fallback messages for edge cases

## Future Enhancements

### Planned Features

- **Multi-language support** for international teams
- **Template customization** for organization-specific messaging
- **Advanced analytics** for message effectiveness
- **Integration with external chat platforms** (Slack, Teams, etc.)
- **Message scheduling** for delayed notifications
- **Rich media support** for enhanced messages

### Extension Points

- **Custom message templates** for specific use cases
- **Plugin system** for additional message types
- **Webhook integration** for real-time notifications
- **Analytics dashboard** for message metrics

## Troubleshooting

### Common Issues

1. **Message too long**
   - Use `maxLength` option to truncate
   - Remove optional fields with options

2. **Missing context**
   - Ensure all required fields are provided
   - Check skill area and difficulty mappings

3. **Style not applied**
   - Verify style option is correctly passed
   - Check for typos in style names

4. **Timestamp issues**
   - Ensure timestamp is in ISO format
   - Check timezone handling

### Debug Mode

Enable debug logging:

```typescript
const message = generateReviewMessage(input, {
  style: 'formal',
  includeTimestamp: true,
});

console.log('Input:', input);
console.log('Generated message:', message);
```

## Support

For issues and questions:

- Check the test suite for usage examples
- Review integration examples
- Consult the API reference
- Test with minimal inputs first

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Maintainer**: CaBE Arena Development Team
