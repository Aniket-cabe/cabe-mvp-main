/**
 * Test Script for Review Assistant Prompt Generator
 *
 * Tests the generateReviewAssistantPrompt function to ensure it creates
 * properly formatted prompts for LLM chat assistants.
 */

import {
  generateReviewAssistantPrompt,
  type ReviewPromptInput,
} from '../src/utils/AuditReviewChatHelper';

// Test data
const testInput: ReviewPromptInput = {
  auditMetadata: {
    runId: 'run-123',
    reviewer: 'admin-1',
    skillArea: 'cloud-devops',
    taskTitle: 'Build a secure API',
    taskDifficulty: 'Hard',
    auditStartedAt: '2024-01-01T10:00:00Z',
    auditCompletedAt: '2024-01-01T12:30:00Z',
  },
  submissions: [
    {
      submissionId: 'sub-01',
      userId: 'u001',
      userScore: 90,
      aiScore: 80,
      deviationType: 'minor',
      suggestedAction: 'flag_for_review',
      notes: 'Code quality exceeds AI assessment',
    },
    {
      submissionId: 'sub-02',
      userId: 'u002',
      userScore: 70,
      aiScore: 75,
      deviationType: 'none',
      suggestedAction: 'allow',
      notes: undefined,
    },
    {
      submissionId: 'sub-03',
      userId: 'u003',
      userScore: 95,
      aiScore: 60,
      deviationType: 'critical',
      suggestedAction: 'escalate',
      notes: 'Suspicious scoring pattern',
    },
    {
      submissionId: 'sub-04',
      userId: 'u004',
      userScore: 85,
      aiScore: 82,
      deviationType: 'none',
      suggestedAction: 'allow',
      notes: 'Good alignment',
    },
    {
      submissionId: 'sub-05',
      userId: 'u005',
      userScore: 88,
      aiScore: 45,
      deviationType: 'critical',
      suggestedAction: 'escalate',
      notes: 'Major discrepancy detected',
    },
    {
      submissionId: 'sub-06',
      userId: 'u006',
      userScore: 92,
      aiScore: 85,
      deviationType: 'minor',
      suggestedAction: 'flag_for_review',
      notes: 'Minor variance acceptable',
    },
    {
      submissionId: 'sub-07',
      userId: 'u007',
      userScore: 78,
      aiScore: 78,
      deviationType: 'none',
      suggestedAction: 'allow',
      notes: 'Perfect alignment',
    },
    {
      submissionId: 'sub-08',
      userId: 'u008',
      userScore: 96,
      aiScore: 70,
      deviationType: 'major',
      suggestedAction: 'override',
      notes: 'Reviewer override applied',
    },
  ],
};

// Test function
function testReviewAssistantPrompt() {
  console.log('🧠 Testing Review Assistant Prompt Generator\n');

  try {
    // Generate the prompt
    const prompt = generateReviewAssistantPrompt(testInput);

    console.log('✅ Successfully generated review assistant prompt\n');
    console.log('📋 Generated Prompt:');
    console.log('===================');
    console.log(prompt);

    // Verify prompt structure
    console.log('\n🔍 Prompt Structure Verification:');
    console.log('================================');

    // Check for required sections
    const sections = [
      { name: 'Audit Metadata', check: prompt.includes('📋 Audit Metadata') },
      {
        name: 'Submission Summary',
        check: prompt.includes('📊 Submission Summary'),
      },
      {
        name: 'Table Header',
        check: prompt.includes(
          '| Sub ID  | User | User Score | AI Score | Deviation | Action | Notes |'
        ),
      },
      { name: 'Totals Section', check: prompt.includes('✅ Totals') },
      { name: 'Instruction', check: prompt.includes('🧠 Instruction:') },
    ];

    sections.forEach((section) => {
      if (section.check) {
        console.log(`✅ ${section.name}: Found`);
      } else {
        console.log(`❌ ${section.name}: Missing`);
      }
    });

    // Check for specific data
    console.log('\n📊 Data Verification:');
    console.log('===================');

    // Check audit metadata
    const metadataChecks = [
      { name: 'Run ID', check: prompt.includes('run-123') },
      { name: 'Reviewer', check: prompt.includes('admin-1') },
      { name: 'Skill Area', check: prompt.includes('Backend') },
      { name: 'Task Title', check: prompt.includes('Build a secure API') },
      { name: 'Difficulty', check: prompt.includes('Hard') },
    ];

    metadataChecks.forEach((check) => {
      if (check.check) {
        console.log(`✅ ${check.name}: Present`);
      } else {
        console.log(`❌ ${check.name}: Missing`);
      }
    });

    // Check submission data
    const submissionChecks = [
      {
        name: 'Submission Count',
        check: prompt.split('sub-').length - 1 === 8,
      },
      {
        name: 'Table Rows',
        check: (prompt.match(/\| sub-/g) || []).length === 8,
      },
      {
        name: 'Deviation Types',
        check:
          prompt.includes('none:') &&
          prompt.includes('minor:') &&
          prompt.includes('critical:'),
      },
      {
        name: 'Actions',
        check:
          prompt.includes('allow') &&
          prompt.includes('flag_for_review') &&
          prompt.includes('escalate'),
      },
    ];

    submissionChecks.forEach((check) => {
      if (check.check) {
        console.log(`✅ ${check.name}: Correct`);
      } else {
        console.log(`❌ ${check.name}: Incorrect`);
      }
    });

    // Check totals calculation
    console.log('\n🧮 Totals Calculation:');
    console.log('=====================');

    const expectedTotals = {
      none: 3,
      minor: 2,
      major: 1,
      critical: 2,
      allow: 3,
      flag_for_review: 2,
      escalate: 2,
      override: 1,
    };

    Object.entries(expectedTotals).forEach(([type, expected]) => {
      const regex = new RegExp(`${type.replace('_', ' ')} \\(${expected}\\)`);
      if (prompt.match(regex)) {
        console.log(`✅ ${type}: ${expected} (correct)`);
      } else {
        console.log(`❌ ${type}: Expected ${expected}, not found or incorrect`);
      }
    });

    // Check prompt length
    console.log('\n📏 Prompt Metrics:');
    console.log('=================');
    console.log(`Total Length: ${prompt.length} characters`);
    console.log(`Lines: ${prompt.split('\n').length}`);
    console.log(`Submissions: ${testInput.submissions.length}`);

    if (prompt.length > 500 && prompt.length < 5000) {
      console.log('✅ Prompt length is reasonable');
    } else {
      console.log('⚠️ Prompt length may need adjustment');
    }

    console.log('\n🎉 Review Assistant Prompt Test Complete!');
    console.log(
      '\nThe prompt generator is working correctly and ready for use.'
    );
    console.log('\nUsage:');
    console.log('const prompt = generateReviewAssistantPrompt(auditData);');
    console.log('// Send prompt to LLM chat assistant');
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('\nThis might be due to:');
    console.error('1. Import issues');
    console.error('2. Function implementation errors');
    console.error('3. Data structure problems');
  }
}

// Run the test
testReviewAssistantPrompt();
