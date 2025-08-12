/**
 * Integration Example for AuditReviewChatHelper
 *
 * Shows how to integrate the chat helper with existing audit systems
 */

import {
  generateReviewMessage,
  generateOverrideMessage,
  generateEscalationMessage,
  generateFlagMessage,
  generateAllowMessage,
  generateBatchReviewSummary,
  generateAuditTrailMessage,
  generateReviewStatsMessage,
  type ReviewActionInput,
  type ReviewMessageOptions,
} from '../src/utils/AuditReviewChatHelper';

import { logOverrideAction } from '../src/utils/audit-override-logger';

// Simulated audit system integration
interface AuditSystemIntegration {
  // Simulate the existing audit override logger
  logAction: (input: ReviewActionInput) => Promise<void>;

  // Simulate chat system integration
  sendChatMessage: (message: string, channel: string) => Promise<void>;

  // Simulate notification system
  sendNotification: (message: string, recipients: string[]) => Promise<void>;

  // Simulate audit trail storage
  storeAuditTrail: (
    submissionId: string,
    actions: ReviewActionInput[]
  ) => Promise<void>;
}

// Enhanced audit override logger with chat integration
class EnhancedAuditLogger {
  private chatHelper: typeof import('../src/utils/AuditReviewChatHelper');
  private auditLogger: typeof import('../src/utils/audit-override-logger');

  constructor() {
    this.chatHelper = require('../src/utils/AuditReviewChatHelper');
    this.auditLogger = require('../src/utils/audit-override-logger');
  }

  async logActionWithChat(
    input: ReviewActionInput,
    options?: ReviewMessageOptions
  ): Promise<void> {
    // 1. Log the action using the existing audit logger
    await this.auditLogger.logOverrideAction({
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
    const chatMessage = this.chatHelper.generateReviewMessage(input, options);

    // 3. Send to appropriate channels
    await this.sendToChannels(chatMessage, input);

    console.log('✅ Action logged and chat message sent:', chatMessage);
  }

  private async sendToChannels(
    message: string,
    input: ReviewActionInput
  ): Promise<void> {
    // Send to admin chat channel
    await this.sendToAdminChat(message, input);

    // Send to audit log channel
    await this.sendToAuditLog(message, input);

    // Send notifications for critical actions
    if (
      input.actionTaken === 'escalate' ||
      input.deviationType === 'critical'
    ) {
      await this.sendCriticalNotification(message, input);
    }
  }

  private async sendToAdminChat(
    message: string,
    input: ReviewActionInput
  ): Promise<void> {
    const channel = `audit-admin-${input.skillArea}`;
    console.log(`📨 Admin Chat (${channel}): ${message}`);
  }

  private async sendToAuditLog(
    message: string,
    input: ReviewActionInput
  ): Promise<void> {
    const channel = 'audit-log';
    console.log(`📋 Audit Log (${channel}): ${message}`);
  }

  private async sendCriticalNotification(
    message: string,
    input: ReviewActionInput
  ): Promise<void> {
    const recipients = ['senior-admin', 'audit-manager'];
    console.log(
      `🚨 Critical Notification to ${recipients.join(', ')}: ${message}`
    );
  }
}

// Integration with SubmissionInspector component
class SubmissionInspectorIntegration {
  private chatHelper: typeof import('../src/utils/AuditReviewChatHelper');
  private enhancedLogger: EnhancedAuditLogger;

  constructor() {
    this.chatHelper = require('../src/utils/AuditReviewChatHelper');
    this.enhancedLogger = new EnhancedAuditLogger();
  }

  async handleReviewAction(
    submission: any,
    action: 'allow' | 'flag_for_review' | 'escalate' | 'override',
    reviewer: string,
    notes?: string
  ): Promise<void> {
    const input: ReviewActionInput = {
      submissionId: submission.id,
      actionTaken: action,
      deviationType: submission.deviationType,
      reviewer,
      notes,
      taskTitle: submission.taskTitle,
      skillArea: submission.skillArea,
      userScore: submission.userScore,
      aiScore: submission.aiScore,
      taskDifficulty: submission.difficulty,
      timestamp: new Date().toISOString(),
    };

    // Log action with chat integration
    await this.enhancedLogger.logActionWithChat(input, {
      style: 'formal',
      includeTimestamp: true,
      includeDeviationDetails: true,
    });

    // Generate specialized message based on action
    let specializedMessage = '';
    switch (action) {
      case 'override':
        specializedMessage = this.chatHelper.generateOverrideMessage(input);
        break;
      case 'escalate':
        specializedMessage = this.chatHelper.generateEscalationMessage(input);
        break;
      case 'flag_for_review':
        specializedMessage = this.chatHelper.generateFlagMessage(input);
        break;
      case 'allow':
        specializedMessage = this.chatHelper.generateAllowMessage(input);
        break;
    }

    console.log(`🎯 Specialized message for ${action}:`, specializedMessage);
  }
}

// Integration with ArenaAuditDashboard
class ArenaAuditDashboardIntegration {
  private chatHelper: typeof import('../src/utils/AuditReviewChatHelper');

  constructor() {
    this.chatHelper = require('../src/utils/AuditReviewChatHelper');
  }

  async generateAuditSummary(actions: ReviewActionInput[]): Promise<string> {
    return this.chatHelper.generateBatchReviewSummary(actions, {
      includeTimestamp: true,
      style: 'formal',
    });
  }

  async generateAuditTrail(
    submissionId: string,
    actions: ReviewActionInput[]
  ): Promise<string> {
    return this.chatHelper.generateAuditTrailMessage(actions, {
      includeTimestamp: true,
      style: 'technical',
    });
  }

  async generateReviewStats(actions: ReviewActionInput[]): Promise<string> {
    return this.chatHelper.generateReviewStatsMessage(actions, {
      includeTimestamp: true,
      style: 'formal',
    });
  }
}

// Integration with ArenaAuditResultViewer
class ArenaAuditResultViewerIntegration {
  private chatHelper: typeof import('../src/utils/AuditReviewChatHelper');

  constructor() {
    this.chatHelper = require('../src/utils/AuditReviewChatHelper');
  }

  async generateResultSummary(actions: ReviewActionInput[]): Promise<{
    summary: string;
    insights: string[];
    recommendations: string[];
  }> {
    const summary = this.chatHelper.generateBatchReviewSummary(actions);
    const stats = this.chatHelper.generateReviewStatsMessage(actions);

    // Generate insights based on action patterns
    const insights: string[] = [];
    const recommendations: string[] = [];

    const actionCounts = actions.reduce(
      (acc, action) => {
        acc[action.actionTaken] = (acc[action.actionTaken] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    if (actionCounts.override > 0) {
      insights.push(
        `${actionCounts.override} manual overrides suggest AI scoring may need refinement`
      );
      recommendations.push('Review override patterns to improve AI accuracy');
    }

    if (actionCounts.escalate > 0) {
      insights.push(
        `${actionCounts.escalate} escalations indicate potential scoring issues`
      );
      recommendations.push('Investigate escalated cases for systemic problems');
    }

    const avgDeviation =
      actions.reduce(
        (sum, action) => sum + Math.abs(action.userScore - action.aiScore),
        0
      ) / actions.length;

    if (avgDeviation > 10) {
      insights.push(
        `High average deviation (${avgDeviation.toFixed(1)}) suggests scoring inconsistencies`
      );
      recommendations.push('Review and refine evaluation criteria');
    }

    return {
      summary: `${summary} | ${stats}`,
      insights,
      recommendations,
    };
  }
}

// Example usage and demonstration
async function demonstrateIntegration() {
  console.log('=== Audit Review Chat Helper Integration Demo ===\n');

  // Sample submission data
  const sampleSubmission = {
    id: 'sub-integration-demo',
    taskTitle: 'Build a responsive navigation bar',
    skillArea: 'frontend',
    difficulty: 'medium',
    userScore: 85,
    aiScore: 60,
    deviationType: 'major' as const,
  };

  // 1. SubmissionInspector Integration
  console.log('1. SubmissionInspector Integration:');
  console.log('-----------------------------------');

  const inspectorIntegration = new SubmissionInspectorIntegration();

  console.log('Handling override action...');
  await inspectorIntegration.handleReviewAction(
    sampleSubmission,
    'override',
    'admin-demo',
    'Code quality exceeds AI assessment - excellent responsive design'
  );

  console.log('Handling escalation action...');
  await inspectorIntegration.handleReviewAction(
    {
      ...sampleSubmission,
      deviationType: 'critical',
      userScore: 95,
      aiScore: 30,
    },
    'escalate',
    'admin-demo',
    'Critical deviation requires senior review'
  );

  console.log();

  // 2. ArenaAuditDashboard Integration
  console.log('2. ArenaAuditDashboard Integration:');
  console.log('-----------------------------------');

  const dashboardIntegration = new ArenaAuditDashboardIntegration();

  const sampleActions: ReviewActionInput[] = [
    {
      submissionId: 'sub-1',
      actionTaken: 'allow',
      deviationType: 'none',
      reviewer: 'admin-1',
      taskTitle: 'Build a responsive navigation bar',
      skillArea: 'frontend',
      userScore: 88,
      aiScore: 87,
      taskDifficulty: 'medium',
      timestamp: '2024-01-15T10:00:00Z',
    },
    {
      submissionId: 'sub-2',
      actionTaken: 'override',
      deviationType: 'major',
      reviewer: 'admin-1',
      taskTitle: 'Build a responsive navigation bar',
      skillArea: 'frontend',
      userScore: 85,
      aiScore: 60,
      taskDifficulty: 'medium',
      timestamp: '2024-01-15T10:15:00Z',
      notes: 'Code quality exceeds AI assessment',
    },
    {
      submissionId: 'sub-3',
      actionTaken: 'escalate',
      deviationType: 'critical',
      reviewer: 'admin-1',
      taskTitle: 'Build a responsive navigation bar',
      skillArea: 'frontend',
      userScore: 95,
      aiScore: 30,
      taskDifficulty: 'medium',
      timestamp: '2024-01-15T10:30:00Z',
    },
  ];

  const auditSummary =
    await dashboardIntegration.generateAuditSummary(sampleActions);
  console.log('Audit Summary:', auditSummary);

  const auditTrail = await dashboardIntegration.generateAuditTrail(
    'sub-2',
    sampleActions.filter((a) => a.submissionId === 'sub-2')
  );
  console.log('Audit Trail:', auditTrail);

  const reviewStats =
    await dashboardIntegration.generateReviewStats(sampleActions);
  console.log('Review Stats:', reviewStats);

  console.log();

  // 3. ArenaAuditResultViewer Integration
  console.log('3. ArenaAuditResultViewer Integration:');
  console.log('--------------------------------------');

  const resultViewerIntegration = new ArenaAuditResultViewerIntegration();

  const resultSummary =
    await resultViewerIntegration.generateResultSummary(sampleActions);
  console.log('Result Summary:', resultSummary.summary);
  console.log('Insights:', resultSummary.insights);
  console.log('Recommendations:', resultSummary.recommendations);

  console.log();

  // 4. Enhanced Audit Logger Demo
  console.log('4. Enhanced Audit Logger Demo:');
  console.log('------------------------------');

  const enhancedLogger = new EnhancedAuditLogger();

  console.log('Logging action with chat integration...');
  await enhancedLogger.logActionWithChat(
    {
      submissionId: 'sub-enhanced-demo',
      actionTaken: 'flag_for_review',
      deviationType: 'minor',
      reviewer: 'admin-enhanced',
      taskTitle: 'Create a blog system',
      skillArea: 'cloud-devops',
      userScore: 92,
      aiScore: 82,
      taskDifficulty: 'hard',
      timestamp: new Date().toISOString(),
      notes: 'Score feels inflated for this difficulty level',
    },
    {
      style: 'casual',
      includeTimestamp: true,
      includeDeviationDetails: true,
    }
  );

  console.log();
  console.log('=== Integration Demo Complete ===');
  console.log('\nAll integrations working successfully! 🎉');
}

// Run the integration demo
demonstrateIntegration().catch(console.error);
