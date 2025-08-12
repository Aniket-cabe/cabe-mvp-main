/**
 * Audit Review Chat Helper
 *
 * Generates human-style chat summaries for admin review actions.
 * Helps with internal logging and building user trust in review fairness.
 */

// Types
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

export interface ReviewPromptInput {
  auditMetadata: {
    runId: string;
    reviewer: string;
    skillArea: string;
    taskTitle: string;
    taskDifficulty: string;
    auditStartedAt: string;
    auditCompletedAt: string;
  };
  submissions: {
    submissionId: string;
    userId: string;
    userScore: number;
    aiScore: number;
    deviationType: 'none' | 'minor' | 'major' | 'critical';
    suggestedAction: 'allow' | 'flag_for_review' | 'escalate' | 'override';
    notes?: string;
  }[];
}

// Utility functions
const calculateDeviation = (userScore: number, aiScore: number): number => {
  return Math.abs(userScore - aiScore);
};

const getDeviationDescription = (deviation: number): string => {
  if (deviation <= 3) return 'minimal';
  if (deviation <= 8) return 'minor';
  if (deviation <= 15) return 'moderate';
  if (deviation <= 25) return 'significant';
  return 'major';
};

const getActionVerb = (action: ReviewActionType): string => {
  switch (action) {
    case 'allow':
      return 'allowed';
    case 'flag_for_review':
      return 'flagged for review';
    case 'escalate':
      return 'escalated';
    case 'override':
      return 'overridden';
    default:
      return 'processed';
  }
};

const getActionReason = (
  action: ReviewActionType,
  deviationType: string,
  deviation: number
): string => {
  switch (action) {
    case 'allow':
      if (deviationType === 'none') {
        return 'Scores align well, no issues detected';
      }
      return 'Deviation within acceptable range for this task';

    case 'flag_for_review':
      if (deviationType === 'minor') {
        return 'Minor discrepancy warrants closer examination';
      }
      return 'Score difference requires manual verification';

    case 'escalate':
      if (deviationType === 'critical') {
        return 'Critical deviation detected - immediate attention required';
      }
      return 'Significant score mismatch needs senior review';

    case 'override':
      if (deviationType === 'critical') {
        return 'Reviewer judgment differs from AI assessment';
      }
      return 'Manual override applied based on reviewer expertise';

    default:
      return 'Action taken based on review criteria';
  }
};

const getSkillAreaContext = (skillArea: string): string => {
  const contexts: Record<string, string> = {
    frontend: 'frontend development',
    backend: 'backend development',
    ai: 'AI/ML implementation',
    design: 'UI/UX design',
    mobile: 'mobile development',
    devops: 'DevOps practices',
    database: 'database design',
    security: 'security implementation',
  };
  return contexts[skillArea] || skillArea;
};

const getDifficultyContext = (difficulty: string): string => {
  const contexts: Record<string, string> = {
    easy: 'beginner-level',
    medium: 'intermediate-level',
    hard: 'advanced-level',
    expert: 'expert-level',
  };
  return contexts[difficulty] || difficulty;
};

const formatTimestamp = (timestamp?: string): string => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return ` at ${date.toLocaleString()}`;
};

const truncateMessage = (message: string, maxLength: number): string => {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength - 3) + '...';
};

// Main function to generate review messages
export function generateReviewMessage(
  input: ReviewActionInput,
  options: ReviewMessageOptions = {}
): string {
  const {
    includeTimestamp = true,
    includeDeviationDetails = true,
    includeSkillArea = true,
    includeDifficulty = true,
    style = 'formal',
    maxLength = 500,
  } = options;

  const deviation = calculateDeviation(input.userScore, input.aiScore);
  const deviationDesc = getDeviationDescription(deviation);
  const actionVerb = getActionVerb(input.actionTaken);
  const actionReason = getActionReason(
    input.actionTaken,
    input.deviationType,
    deviation
  );
  const timestamp = includeTimestamp ? formatTimestamp(input.timestamp) : '';
  const skillContext = includeSkillArea
    ? ` (${getSkillAreaContext(input.skillArea)})`
    : '';
  const difficultyContext =
    includeDifficulty && input.taskDifficulty
      ? ` - ${getDifficultyContext(input.taskDifficulty)} task`
      : '';

  let message = '';

  // Generate base message based on style
  switch (style) {
    case 'formal':
      message = generateFormalMessage(
        input,
        actionVerb,
        actionReason,
        deviation,
        deviationDesc,
        skillContext,
        difficultyContext
      );
      break;
    case 'casual':
      message = generateCasualMessage(
        input,
        actionVerb,
        actionReason,
        deviation,
        deviationDesc,
        skillContext,
        difficultyContext
      );
      break;
    case 'technical':
      message = generateTechnicalMessage(
        input,
        actionVerb,
        actionReason,
        deviation,
        deviationDesc,
        skillContext,
        difficultyContext
      );
      break;
  }

  // Add deviation details if requested
  if (includeDeviationDetails) {
    message += ` [AI: ${input.aiScore}, User: ${input.userScore}, Deviation: ${deviation}]`;
  }

  // Add timestamp
  message += timestamp;

  // Add custom notes if provided
  if (input.notes) {
    message += ` | Notes: ${input.notes}`;
  }

  // Truncate if needed
  return truncateMessage(message, maxLength);
}

// Style-specific message generators
function generateFormalMessage(
  input: ReviewActionInput,
  actionVerb: string,
  actionReason: string,
  deviation: number,
  deviationDesc: string,
  skillContext: string,
  difficultyContext: string
): string {
  return `Reviewer ${input.reviewer} has ${actionVerb} submission ${input.submissionId} for task "${input.taskTitle}"${skillContext}${difficultyContext}. ${actionReason}.`;
}

function generateCasualMessage(
  input: ReviewActionInput,
  actionVerb: string,
  actionReason: string,
  deviation: number,
  deviationDesc: string,
  skillContext: string,
  difficultyContext: string
): string {
  return `${input.reviewer} ${actionVerb} ${input.submissionId} - "${input.taskTitle}"${skillContext}${difficultyContext}. ${actionReason.toLowerCase()}.`;
}

function generateTechnicalMessage(
  input: ReviewActionInput,
  actionVerb: string,
  actionReason: string,
  deviation: number,
  deviationDesc: string,
  skillContext: string,
  difficultyContext: string
): string {
  return `[AUDIT] ${input.reviewer} | ${input.actionTaken.toUpperCase()} | ${input.submissionId} | "${input.taskTitle}"${skillContext}${difficultyContext} | ${actionReason}`;
}

// Specialized message generators for specific scenarios
export function generateOverrideMessage(
  input: ReviewActionInput,
  options?: ReviewMessageOptions
): string {
  const deviation = calculateDeviation(input.userScore, input.aiScore);
  const reviewerJudgment = input.userScore > input.aiScore ? 'higher' : 'lower';

  const overrideReason = `Reviewer assessment (${input.userScore}) differs from AI score (${input.aiScore}) - ${reviewerJudgment} quality detected`;

  return generateReviewMessage(
    {
      ...input,
      notes: overrideReason,
    },
    options
  );
}

export function generateEscalationMessage(
  input: ReviewActionInput,
  options?: ReviewMessageOptions
): string {
  const escalationReason = `Critical deviation (${calculateDeviation(input.userScore, input.aiScore)}) requires senior review`;

  return generateReviewMessage(
    {
      ...input,
      notes: escalationReason,
    },
    options
  );
}

export function generateFlagMessage(
  input: ReviewActionInput,
  options?: ReviewMessageOptions
): string {
  const flagReason = `Score discrepancy flagged for manual verification`;

  return generateReviewMessage(
    {
      ...input,
      notes: flagReason,
    },
    options
  );
}

export function generateAllowMessage(
  input: ReviewActionInput,
  options?: ReviewMessageOptions
): string {
  const allowReason = `Scores align within acceptable parameters`;

  return generateReviewMessage(
    {
      ...input,
      notes: allowReason,
    },
    options
  );
}

// Batch message generation for multiple actions
export function generateBatchReviewSummary(
  actions: ReviewActionInput[],
  options?: ReviewMessageOptions
): string {
  if (actions.length === 0) return 'No review actions to summarize.';

  const actionCounts = actions.reduce(
    (acc, action) => {
      acc[action.actionTaken] = (acc[action.actionTaken] || 0) + 1;
      return acc;
    },
    {} as Record<ReviewActionType, number>
  );

  const totalActions = actions.length;
  const reviewer = actions[0].reviewer;
  const taskTitle = actions[0].taskTitle;

  let summary = `Reviewer ${reviewer} completed batch review of ${totalActions} submissions for "${taskTitle}": `;

  const actionDescriptions = Object.entries(actionCounts).map(
    ([action, count]) => {
      return `${count} ${action.replace('_', ' ')}`;
    }
  );

  summary += actionDescriptions.join(', ');

  if (options?.includeTimestamp) {
    summary += formatTimestamp(actions[0].timestamp);
  }

  return summary;
}

// Generate detailed audit trail message
export function generateAuditTrailMessage(
  actions: ReviewActionInput[],
  options?: ReviewMessageOptions
): string {
  if (actions.length === 0) return 'No audit trail available.';

  const latestAction = actions[actions.length - 1];
  const actionHistory = actions.map((action) => action.actionTaken).join(' → ');

  let trailMessage = `Audit trail for ${latestAction.submissionId}: ${actionHistory}`;

  if (actions.length > 1) {
    trailMessage += ` (${actions.length} actions total)`;
  }

  if (options?.includeTimestamp) {
    trailMessage += formatTimestamp(latestAction.timestamp);
  }

  return trailMessage;
}

// Generate summary statistics message
export function generateReviewStatsMessage(
  actions: ReviewActionInput[],
  options?: ReviewMessageOptions
): string {
  if (actions.length === 0) return 'No review statistics available.';

  const stats = actions.reduce(
    (acc, action) => {
      acc.totalActions++;
      acc.actionCounts[action.actionTaken] =
        (acc.actionCounts[action.actionTaken] || 0) + 1;
      acc.deviationTypes[action.deviationType] =
        (acc.deviationTypes[action.deviationType] || 0) + 1;
      acc.totalDeviation += calculateDeviation(
        action.userScore,
        action.aiScore
      );
      return acc;
    },
    {
      totalActions: 0,
      actionCounts: {} as Record<ReviewActionType, number>,
      deviationTypes: {} as Record<string, number>,
      totalDeviation: 0,
    }
  );

  const avgDeviation =
    stats.totalActions > 0
      ? (stats.totalDeviation / stats.totalActions).toFixed(1)
      : '0';

  let statsMessage = `Review Summary: ${stats.totalActions} actions, avg deviation: ${avgDeviation}`;

  const actionBreakdown = Object.entries(stats.actionCounts)
    .map(([action, count]) => `${count} ${action.replace('_', ' ')}`)
    .join(', ');

  statsMessage += ` | Actions: ${actionBreakdown}`;

  if (options?.includeTimestamp) {
    statsMessage += formatTimestamp(actions[0].timestamp);
  }

  return statsMessage;
}

/**
 * Generate a structured prompt for LLM-powered chat assistant
 * Converts audit run and submission data into a formatted prompt for AI analysis
 */
export function generateReviewAssistantPrompt(
  input: ReviewPromptInput
): string {
  const { auditMetadata, submissions } = input;

  // Format timestamps
  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  // Calculate totals
  const totals = submissions.reduce(
    (acc, sub) => {
      acc.deviationTypes[sub.deviationType] =
        (acc.deviationTypes[sub.deviationType] || 0) + 1;
      acc.actions[sub.suggestedAction] =
        (acc.actions[sub.suggestedAction] || 0) + 1;
      return acc;
    },
    {
      deviationTypes: {} as Record<string, number>,
      actions: {} as Record<string, number>,
    }
  );

  // Build the prompt
  let prompt = `📋 Audit Metadata
Run ID: ${auditMetadata.runId}
Reviewer: ${auditMetadata.reviewer}
Skill Area: ${auditMetadata.skillArea}
Task: ${auditMetadata.taskTitle}
Difficulty: ${auditMetadata.taskDifficulty}
Started At: ${formatTime(auditMetadata.auditStartedAt)}
Completed At: ${formatTime(auditMetadata.auditCompletedAt)}

📊 Submission Summary
| Sub ID  | User | User Score | AI Score | Deviation | Action           | Notes       |
|---------|------|------------|----------|-----------|------------------|-------------|`;

  // Add submission rows
  submissions.forEach((sub) => {
    const deviation = Math.abs(sub.userScore - sub.aiScore);
    const notes = sub.notes || '--';

    // Pad fields for alignment
    const subId = sub.submissionId.padEnd(8);
    const userId = sub.userId.padEnd(5);
    const userScore = sub.userScore.toString().padStart(10);
    const aiScore = sub.aiScore.toString().padStart(9);
    const deviationStr = deviation.toString().padStart(9);
    const action = sub.suggestedAction.replace('_', ' ').padEnd(16);
    const notesStr = notes.padEnd(11);

    prompt += `\n| ${subId} | ${userId} | ${userScore} | ${aiScore} | ${deviationStr} | ${action} | ${notesStr} |`;
  });

  // Add totals
  prompt += `\n\n✅ Totals`;

  // Deviation type totals
  const deviationEntries = Object.entries(totals.deviationTypes);
  if (deviationEntries.length > 0) {
    const deviationList = deviationEntries
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ');
    prompt += `\n- Deviations: ${deviationList}`;
  }

  // Action totals
  const actionEntries = Object.entries(totals.actions);
  if (actionEntries.length > 0) {
    const actionList = actionEntries
      .map(([action, count]) => `${action.replace('_', ' ')} (${count})`)
      .join(', ');
    prompt += `\n- Actions: ${actionList}`;
  }

  // Add instruction
  prompt += `\n\n🧠 Instruction:
Analyze these audit results and give a concise performance summary + list of 3 recommendations for future audits.`;

  return prompt;
}

// Example usage and testing
export const exampleMessages = {
  override: generateOverrideMessage({
    submissionId: 'sub-123',
    actionTaken: 'override',
    deviationType: 'major',
    reviewer: 'admin-1',
    taskTitle: 'Build a portfolio website',
    skillArea: 'fullstack-dev',
    userScore: 85,
    aiScore: 60,
    taskDifficulty: 'medium',
    notes: 'Code quality exceeds AI assessment',
  }),

  flag: generateFlagMessage({
    submissionId: 'sub-456',
    actionTaken: 'flag_for_review',
    deviationType: 'minor',
    reviewer: 'admin-2',
    taskTitle: 'Create a blog system',
    skillArea: 'cloud-devops',
    userScore: 92,
    aiScore: 82,
    taskDifficulty: 'hard',
  }),

  allow: generateAllowMessage({
    submissionId: 'sub-789',
    actionTaken: 'allow',
    deviationType: 'none',
    reviewer: 'admin-3',
    taskTitle: 'Design a landing page',
    skillArea: 'cloud-devops',
    userScore: 88,
    aiScore: 90,
    taskDifficulty: 'easy',
  }),

  escalate: generateEscalationMessage({
    submissionId: 'sub-101',
    actionTaken: 'escalate',
    deviationType: 'critical',
    reviewer: 'admin-4',
    taskTitle: 'Implement authentication system',
    skillArea: 'security',
    userScore: 95,
    aiScore: 30,
    taskDifficulty: 'expert',
  }),
};

// Export all types and functions
export default {
  generateReviewMessage,
  generateOverrideMessage,
  generateEscalationMessage,
  generateFlagMessage,
  generateAllowMessage,
  generateBatchReviewSummary,
  generateAuditTrailMessage,
  generateReviewStatsMessage,
  generateReviewAssistantPrompt,
  exampleMessages,
};
