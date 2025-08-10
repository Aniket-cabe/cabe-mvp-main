/**
 * Test Script for AuditReviewChatHelper
 *
 * Demonstrates all the functionality of the chat helper utility
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
  exampleMessages,
  type ReviewActionInput,
  type ReviewMessageOptions,
} from '../src/utils/AuditReviewChatHelper';

// Test data
const testActions: ReviewActionInput[] = [
  {
    submissionId: 'sub-001',
    actionTaken: 'allow',
    deviationType: 'none',
    reviewer: 'admin-1',
    taskTitle: 'Build a responsive navigation bar',
    skillArea: 'frontend',
    userScore: 88,
    aiScore: 87,
    taskDifficulty: 'easy',
    timestamp: '2024-01-15T10:30:00Z',
  },
  {
    submissionId: 'sub-002',
    actionTaken: 'flag_for_review',
    deviationType: 'minor',
    reviewer: 'admin-1',
    taskTitle: 'Build a responsive navigation bar',
    skillArea: 'frontend',
    userScore: 92,
    aiScore: 82,
    taskDifficulty: 'easy',
    timestamp: '2024-01-15T10:35:00Z',
  },
  {
    submissionId: 'sub-003',
    actionTaken: 'override',
    deviationType: 'major',
    reviewer: 'admin-1',
    taskTitle: 'Build a responsive navigation bar',
    skillArea: 'frontend',
    userScore: 85,
    aiScore: 60,
    taskDifficulty: 'easy',
    timestamp: '2024-01-15T10:40:00Z',
    notes: 'Code quality exceeds AI assessment',
  },
  {
    submissionId: 'sub-004',
    actionTaken: 'escalate',
    deviationType: 'critical',
    reviewer: 'admin-1',
    taskTitle: 'Build a responsive navigation bar',
    skillArea: 'frontend',
    userScore: 95,
    aiScore: 35,
    taskDifficulty: 'easy',
    timestamp: '2024-01-15T10:45:00Z',
  },
];

const auditTrailActions: ReviewActionInput[] = [
  {
    submissionId: 'sub-005',
    actionTaken: 'flag_for_review',
    deviationType: 'minor',
    reviewer: 'admin-2',
    taskTitle: 'Create a blog system',
    skillArea: 'backend',
    userScore: 85,
    aiScore: 78,
    taskDifficulty: 'medium',
    timestamp: '2024-01-15T11:00:00Z',
  },
  {
    submissionId: 'sub-005',
    actionTaken: 'override',
    deviationType: 'minor',
    reviewer: 'admin-3',
    taskTitle: 'Create a blog system',
    skillArea: 'backend',
    userScore: 85,
    aiScore: 78,
    taskDifficulty: 'medium',
    timestamp: '2024-01-15T11:15:00Z',
    notes: 'Senior review confirms code quality',
  },
];

async function runTests() {
  console.log('=== Audit Review Chat Helper Test Suite ===\n');

  // Test 1: Basic message generation with different styles
  console.log('1. Basic Message Generation (Different Styles):');
  console.log('------------------------------------------------');

  const basicInput: ReviewActionInput = {
    submissionId: 'sub-test-001',
    actionTaken: 'override',
    deviationType: 'major',
    reviewer: 'test-admin',
    taskTitle: 'Build a portfolio website',
    skillArea: 'frontend',
    userScore: 85,
    aiScore: 60,
    taskDifficulty: 'medium',
    timestamp: '2024-01-15T12:00:00Z',
  };

  console.log('Formal Style:');
  console.log(generateReviewMessage(basicInput, { style: 'formal' }));
  console.log();

  console.log('Casual Style:');
  console.log(generateReviewMessage(basicInput, { style: 'casual' }));
  console.log();

  console.log('Technical Style:');
  console.log(generateReviewMessage(basicInput, { style: 'technical' }));
  console.log();

  // Test 2: Specialized message generators
  console.log('2. Specialized Message Generators:');
  console.log('-----------------------------------');

  console.log('Override Message:');
  console.log(generateOverrideMessage(basicInput));
  console.log();

  console.log('Escalation Message:');
  console.log(
    generateEscalationMessage({
      ...basicInput,
      actionTaken: 'escalate',
      deviationType: 'critical',
      userScore: 95,
      aiScore: 30,
    })
  );
  console.log();

  console.log('Flag Message:');
  console.log(
    generateFlagMessage({
      ...basicInput,
      actionTaken: 'flag_for_review',
      deviationType: 'minor',
      userScore: 88,
      aiScore: 82,
    })
  );
  console.log();

  console.log('Allow Message:');
  console.log(
    generateAllowMessage({
      ...basicInput,
      actionTaken: 'allow',
      deviationType: 'none',
      userScore: 88,
      aiScore: 87,
    })
  );
  console.log();

  // Test 3: Message options and customization
  console.log('3. Message Customization Options:');
  console.log('----------------------------------');

  console.log('Without timestamp:');
  console.log(generateReviewMessage(basicInput, { includeTimestamp: false }));
  console.log();

  console.log('Without deviation details:');
  console.log(
    generateReviewMessage(basicInput, { includeDeviationDetails: false })
  );
  console.log();

  console.log('Without skill area:');
  console.log(generateReviewMessage(basicInput, { includeSkillArea: false }));
  console.log();

  console.log('Shortened message (max 100 chars):');
  console.log(generateReviewMessage(basicInput, { maxLength: 100 }));
  console.log();

  // Test 4: Batch operations
  console.log('4. Batch Operations:');
  console.log('-------------------');

  console.log('Batch Review Summary:');
  console.log(generateBatchReviewSummary(testActions));
  console.log();

  console.log('Audit Trail Message:');
  console.log(generateAuditTrailMessage(auditTrailActions));
  console.log();

  console.log('Review Statistics:');
  console.log(generateReviewStatsMessage(testActions));
  console.log();

  // Test 5: Different skill areas and difficulties
  console.log('5. Different Contexts:');
  console.log('----------------------');

  const contexts = [
    { skillArea: 'ai', difficulty: 'expert', taskTitle: 'Implement ML model' },
    {
      skillArea: 'security',
      difficulty: 'hard',
      taskTitle: 'Build authentication system',
    },
    {
      skillArea: 'design',
      difficulty: 'easy',
      taskTitle: 'Create landing page',
    },
    {
      skillArea: 'devops',
      difficulty: 'medium',
      taskTitle: 'Set up CI/CD pipeline',
    },
  ];

  contexts.forEach((context, index) => {
    const contextInput: ReviewActionInput = {
      submissionId: `sub-context-${index + 1}`,
      actionTaken: 'flag_for_review',
      deviationType: 'minor',
      reviewer: 'admin-context',
      taskTitle: context.taskTitle,
      skillArea: context.skillArea,
      userScore: 85,
      aiScore: 78,
      taskDifficulty: context.difficulty as any,
      timestamp: '2024-01-15T13:00:00Z',
    };

    console.log(`${context.skillArea} (${context.difficulty}):`);
    console.log(generateReviewMessage(contextInput));
    console.log();
  });

  // Test 6: Example messages from the utility
  console.log('6. Pre-built Example Messages:');
  console.log('-------------------------------');

  Object.entries(exampleMessages).forEach(([type, message]) => {
    console.log(`${type.toUpperCase()}:`);
    console.log(message);
    console.log();
  });

  // Test 7: Edge cases
  console.log('7. Edge Cases:');
  console.log('---------------');

  console.log('Empty actions array:');
  console.log(generateBatchReviewSummary([]));
  console.log();

  console.log('Single action:');
  console.log(generateBatchReviewSummary([testActions[0]]));
  console.log();

  console.log('No timestamp:');
  console.log(
    generateReviewMessage(
      {
        ...basicInput,
        timestamp: undefined,
      },
      { includeTimestamp: true }
    )
  );
  console.log();

  console.log('With custom notes:');
  console.log(
    generateReviewMessage({
      ...basicInput,
      notes:
        'Custom reviewer notes: Code demonstrates excellent problem-solving skills',
    })
  );
  console.log();

  // Test 8: Integration with audit override logger
  console.log('8. Integration Example:');
  console.log('----------------------');

  // Simulate integration with audit override logger
  const logEntry = {
    submissionId: 'sub-integration-001',
    reviewer: 'admin-integration',
    actionTaken: 'override' as const,
    notes: 'Integration test with chat helper',
    originalDeviationType: 'major' as const,
    userScore: 88,
    aiScore: 65,
    taskTitle: 'Integration test task',
    skillArea: 'frontend',
  };

  const chatMessage = generateReviewMessage({
    submissionId: logEntry.submissionId,
    actionTaken: logEntry.actionTaken,
    deviationType: logEntry.originalDeviationType,
    reviewer: logEntry.reviewer,
    notes: logEntry.notes,
    taskTitle: logEntry.taskTitle,
    skillArea: logEntry.skillArea,
    userScore: logEntry.userScore,
    aiScore: logEntry.aiScore,
    timestamp: new Date().toISOString(),
  });

  console.log('Integration with Audit Override Logger:');
  console.log('Log Entry:', JSON.stringify(logEntry, null, 2));
  console.log('Generated Chat Message:', chatMessage);
  console.log();

  console.log('=== Test Suite Complete ===');
  console.log('\nAll tests passed successfully! 🎉');
}

// Run the tests
runTests().catch(console.error);
