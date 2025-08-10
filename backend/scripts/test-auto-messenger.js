/**
 * Auto-Messenger Test Script
 *
 * Tests the CaBOT Messenger system with various contexts and tones
 * to validate message generation quality and consistency.
 */

const {
  AutoMessengerService,
  MockMessengerLLMService,
  VALID_TONES,
} = require('../utils/auto-messenger-service');

// Test cases covering different contexts and tones
const testCases = [
  // Authentication contexts
  {
    context: 'User successfully logged in',
    tone: 'friendly',
    expectedPatterns: ['welcome', 'hey', 'back'],
    expectEmojis: true,
  },
  {
    context: 'User successfully logged in',
    tone: 'serious',
    expectedPatterns: ['login', 'successful', 'access'],
    expectEmojis: false,
  },
  {
    context: 'User successfully logged in',
    tone: 'hype',
    expectedPatterns: ['back', "let's"],
    expectEmojis: true,
    expectCaps: true,
  },

  // Submission contexts
  {
    context: 'User proof passed moderation review',
    tone: 'friendly',
    expectedPatterns: ['great', 'approved', 'work'],
    expectEmojis: true,
  },
  {
    context: 'User proof failed moderation review',
    tone: 'serious',
    expectedPatterns: ['rejected', 'review', 'requirements'],
    expectEmojis: false,
  },
  {
    context: 'User proof failed moderation review',
    tone: 'hype',
    expectedPatterns: ['rejected', "don't give up", 'try again'],
    expectEmojis: true,
  },

  // Achievement contexts
  {
    context: 'User earned their first coding badge',
    tone: 'friendly',
    expectedPatterns: ['congrats', 'first', 'badge'],
    expectEmojis: true,
  },
  {
    context: 'User reached 7-day submission streak',
    tone: 'hype',
    expectedPatterns: ['streak', 'fire', 'days'],
    expectEmojis: true,
    expectCaps: true,
  },

  // System contexts
  {
    context: 'Platform maintenance scheduled in 1 hour',
    tone: 'serious',
    expectedPatterns: ['maintenance', 'hour', 'scheduled'],
    expectEmojis: false,
  },
  {
    context: 'New AI helper feature now available',
    tone: 'hype',
    expectedPatterns: ['new', 'ai', 'feature'],
    expectEmojis: true,
    expectCaps: true,
  },

  // Points and rewards
  {
    context: 'User earned 50 points for completing task',
    tone: 'friendly',
    expectedPatterns: ['earned', 'points', 'task'],
    expectEmojis: true,
  },
  {
    context: 'User received bonus points for quality submission',
    tone: 'hype',
    expectedPatterns: ['bonus', 'points', 'quality'],
    expectEmojis: true,
    expectCaps: true,
  },

  // Social contexts
  {
    context: 'User gained a new follower',
    tone: 'friendly',
    expectedPatterns: ['new', 'follower', 'following'],
    expectEmojis: true,
  },
  {
    context: 'User was mentioned in a comment',
    tone: 'hype',
    expectedPatterns: ['mentioned', 'comment'],
    expectEmojis: true,
  },
];

// Edge cases and error scenarios
const edgeCases = [
  {
    description: 'Very short context',
    context: 'Login',
    tone: 'friendly',
    shouldPass: true,
  },
  {
    description: 'Very long context',
    context:
      'User submitted a very detailed and comprehensive proof for the advanced web development task that includes multiple components, extensive documentation, thorough testing, and demonstrates deep understanding of the subject matter with innovative solutions and best practices',
    tone: 'serious',
    shouldPass: true,
  },
  {
    description: 'Empty context',
    context: '',
    tone: 'friendly',
    shouldPass: false,
  },
  {
    description: 'Invalid tone',
    context: 'User logged in',
    tone: 'invalid_tone',
    shouldPass: false,
  },
  {
    description: 'Context with special characters',
    context: 'User earned 100% on task #1 @today!',
    tone: 'hype',
    shouldPass: true,
  },
];

/**
 * Initialize the test service
 */
function initializeTestService() {
  const mockLLM = new MockMessengerLLMService();
  return new AutoMessengerService(mockLLM, {
    maxMessageLength: 40,
    minMessageLength: 8,
    cacheEnabled: true,
    validateLength: true,
    logMessages: false, // Reduce noise during testing
  });
}

/**
 * Validate message content based on tone
 */
function validateMessageContent(message, tone, testCase) {
  const errors = [];
  const messageLower = message.toLowerCase();

  // Check length
  const wordCount = message.split(/\s+/).length;
  if (wordCount < 8 || wordCount > 40) {
    errors.push(`Word count ${wordCount} outside valid range (8-40)`);
  }

  // Check expected patterns
  if (testCase.expectedPatterns) {
    const missingPatterns = testCase.expectedPatterns.filter(
      (pattern) => !messageLower.includes(pattern.toLowerCase())
    );
    if (missingPatterns.length > 0) {
      errors.push(`Missing expected patterns: ${missingPatterns.join(', ')}`);
    }
  }

  // Tone-specific validations
  switch (tone) {
    case 'friendly':
      if (
        testCase.expectEmojis &&
        !message.match(
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u
        )
      ) {
        errors.push('Friendly tone should include emojis');
      }
      if (message.includes('!!!') || message.match(/[A-Z]{3,}/)) {
        errors.push(
          'Friendly tone should not have excessive caps or exclamation'
        );
      }
      break;

    case 'serious':
      if (
        message.match(
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u
        )
      ) {
        errors.push('Serious tone should not include emojis');
      }
      if (message.includes('Hey') || message.includes('Woohoo')) {
        errors.push('Serious tone should not use casual language');
      }
      break;

    case 'hype':
      if (
        testCase.expectEmojis &&
        !message.match(
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u
        )
      ) {
        errors.push('Hype tone should include emojis');
      }
      if (testCase.expectCaps && !message.match(/[A-Z]{3,}/)) {
        errors.push('Hype tone should include caps for emphasis');
      }
      if (!message.includes('!')) {
        errors.push('Hype tone should include exclamation points');
      }
      break;
  }

  return errors;
}

/**
 * Run main test cases
 */
async function runMainTests(messenger) {
  console.log('🧪 Running main test cases...\n');

  let passedTests = 0;
  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(
      `--- Test ${i + 1}: ${testCase.context} (${testCase.tone}) ---`
    );

    try {
      const result = await messenger.generateMessage(
        testCase.context,
        testCase.tone,
        { requestId: `test-${i + 1}` }
      );

      console.log(`Generated: "${result.message}"`);
      console.log(`Word count: ${result.wordCount}`);
      console.log(`Processing time: ${result.processingTime}ms`);
      console.log(`Category: ${result.category}`);

      // Validate message content
      const validationErrors = validateMessageContent(
        result.message,
        testCase.tone,
        testCase
      );

      if (validationErrors.length === 0) {
        console.log('✅ PASSED');
        passedTests++;
        results.push({ testCase, result, passed: true, errors: [] });
      } else {
        console.log('❌ FAILED');
        validationErrors.forEach((error) => console.log(`  - ${error}`));
        results.push({
          testCase,
          result,
          passed: false,
          errors: validationErrors,
        });
      }
    } catch (error) {
      console.log('❌ ERROR');
      console.log(`  - ${error.message}`);
      results.push({
        testCase,
        result: null,
        passed: false,
        errors: [error.message],
      });
    }

    console.log('');
  }

  console.log(
    `📊 Main Tests Summary: ${passedTests}/${testCases.length} passed\n`
  );
  return results;
}

/**
 * Run edge case tests
 */
async function runEdgeCaseTests(messenger) {
  console.log('🔍 Running edge case tests...\n');

  let passedTests = 0;
  const results = [];

  for (let i = 0; i < edgeCases.length; i++) {
    const edgeCase = edgeCases[i];
    console.log(`--- Edge Case ${i + 1}: ${edgeCase.description} ---`);

    try {
      const result = await messenger.generateMessage(
        edgeCase.context,
        edgeCase.tone,
        { requestId: `edge-${i + 1}` }
      );

      if (edgeCase.shouldPass) {
        console.log(`Generated: "${result.message}"`);
        console.log('✅ PASSED (expected success)');
        passedTests++;
        results.push({ edgeCase, result, passed: true, errors: [] });
      } else {
        console.log('❌ FAILED (should have thrown error)');
        results.push({
          edgeCase,
          result,
          passed: false,
          errors: ['Expected error but succeeded'],
        });
      }
    } catch (error) {
      if (!edgeCase.shouldPass) {
        console.log(`Error: ${error.message}`);
        console.log('✅ PASSED (expected failure)');
        passedTests++;
        results.push({ edgeCase, result: null, passed: true, errors: [] });
      } else {
        console.log(`Unexpected error: ${error.message}`);
        console.log('❌ FAILED (unexpected error)');
        results.push({
          edgeCase,
          result: null,
          passed: false,
          errors: [error.message],
        });
      }
    }

    console.log('');
  }

  console.log(
    `📊 Edge Case Summary: ${passedTests}/${edgeCases.length} passed\n`
  );
  return results;
}

/**
 * Test caching functionality
 */
async function testCaching(messenger) {
  console.log('💾 Testing caching functionality...\n');

  const context = 'User logged in successfully';
  const tone = 'friendly';

  // First call (should generate)
  console.log('First call (should generate):');
  const start1 = Date.now();
  const result1 = await messenger.generateMessage(context, tone, {
    requestId: 'cache-test-1',
  });
  const time1 = Date.now() - start1;
  console.log(`Message: "${result1.message}"`);
  console.log(`Cached: ${result1.cached}`);
  console.log(`Time: ${time1}ms\n`);

  // Second call (should use cache)
  console.log('Second call (should use cache):');
  const start2 = Date.now();
  const result2 = await messenger.generateMessage(context, tone, {
    requestId: 'cache-test-2',
  });
  const time2 = Date.now() - start2;
  console.log(`Message: "${result2.message}"`);
  console.log(`Cached: ${result2.cached}`);
  console.log(`Time: ${time2}ms\n`);

  // Validate caching
  const cachingWorks =
    result1.message === result2.message && result2.cached && time2 < time1;
  console.log(`✅ Caching test: ${cachingWorks ? 'PASSED' : 'FAILED'}\n`);

  return cachingWorks;
}

/**
 * Test batch generation
 */
async function testBatchGeneration(messenger) {
  console.log('📦 Testing batch generation...\n');

  const batchRequests = [
    { context: 'User earned a badge', tone: 'friendly' },
    { context: 'System maintenance starting', tone: 'serious' },
    { context: 'New feature launched', tone: 'hype' },
  ];

  try {
    const batchResult = await messenger.generateBatch(batchRequests);

    console.log(
      `Batch results: ${batchResult.stats.successful}/${batchResult.stats.total} successful`
    );

    batchResult.results.forEach((result, index) => {
      if (result) {
        console.log(`${index + 1}. "${result.message}" (${result.tone})`);
      }
    });

    if (batchResult.errors.length > 0) {
      console.log('Errors:');
      batchResult.errors.forEach((error) => {
        console.log(`  - ${error.error}`);
      });
    }

    const batchSuccess = batchResult.stats.successful === batchRequests.length;
    console.log(`\n✅ Batch test: ${batchSuccess ? 'PASSED' : 'FAILED'}\n`);

    return batchSuccess;
  } catch (error) {
    console.log(`❌ Batch test FAILED: ${error.message}\n`);
    return false;
  }
}

/**
 * Test statistics tracking
 */
async function testStatistics(messenger) {
  console.log('📈 Testing statistics tracking...\n');

  const initialStats = messenger.getStats();
  console.log('Initial stats:', initialStats);

  // Generate a few messages
  await messenger.generateMessage('Test message 1', 'friendly');
  await messenger.generateMessage('Test message 2', 'serious');
  await messenger.generateMessage('Test message 3', 'hype');

  const finalStats = messenger.getStats();
  console.log('Final stats:', finalStats);

  const statsWorking = finalStats.totalGenerated > initialStats.totalGenerated;
  console.log(`\n✅ Statistics test: ${statsWorking ? 'PASSED' : 'FAILED'}\n`);

  return statsWorking;
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🤖 Testing CaBOT Auto-Messenger System\n');
  console.log('='.repeat(50) + '\n');

  // Initialize service
  const messenger = initializeTestService();

  // Run all test suites
  const mainResults = await runMainTests(messenger);
  const edgeResults = await runEdgeCaseTests(messenger);
  const cachingResult = await testCaching(messenger);
  const batchResult = await testBatchGeneration(messenger);
  const statsResult = await testStatistics(messenger);

  // Calculate overall results
  const mainPassed = mainResults.filter((r) => r.passed).length;
  const edgePassed = edgeResults.filter((r) => r.passed).length;
  const totalTests = testCases.length + edgeCases.length + 3; // +3 for cache, batch, stats
  const totalPassed =
    mainPassed +
    edgePassed +
    (cachingResult ? 1 : 0) +
    (batchResult ? 1 : 0) +
    (statsResult ? 1 : 0);

  // Final summary
  console.log('🏁 FINAL TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`📊 Overall: ${totalPassed}/${totalTests} tests passed`);
  console.log(`📝 Main tests: ${mainPassed}/${testCases.length}`);
  console.log(`🔍 Edge cases: ${edgePassed}/${edgeCases.length}`);
  console.log(`💾 Caching: ${cachingResult ? 'PASS' : 'FAIL'}`);
  console.log(`📦 Batch: ${batchResult ? 'PASS' : 'FAIL'}`);
  console.log(`📈 Statistics: ${statsResult ? 'PASS' : 'FAIL'}`);
  console.log(
    `✨ Success rate: ${Math.round((totalPassed / totalTests) * 100)}%`
  );

  if (totalPassed === totalTests) {
    console.log(
      '\n🎉 All tests passed! CaBOT Auto-Messenger is working perfectly!'
    );
  } else {
    console.log('\n⚠️ Some tests failed. Review the results above.');
  }

  // Show final service stats
  const finalStats = messenger.getStats();
  console.log('\n📊 Final Service Statistics:');
  console.log(`- Total messages generated: ${finalStats.totalGenerated}`);
  console.log(`- Cache hits: ${finalStats.cacheHits}`);
  console.log(`- Cache hit rate: ${finalStats.cacheHitRate}%`);
  console.log(`- Average word count: ${finalStats.averageLength}`);
  console.log(`- Tone distribution:`, finalStats.toneDistribution);

  return {
    totalTests,
    totalPassed,
    successRate: Math.round((totalPassed / totalTests) * 100),
    mainResults,
    edgeResults,
    cachingResult,
    batchResult,
    statsResult,
    finalStats,
  };
}

/**
 * Performance benchmark
 */
async function runPerformanceBenchmark(messenger) {
  console.log('\n⚡ Running performance benchmark...\n');

  const iterations = 10;
  const contexts = [
    'User logged in',
    'Proof approved',
    'Badge earned',
    'Maintenance scheduled',
    'Points awarded',
  ];

  const times = [];

  for (let i = 0; i < iterations; i++) {
    const context = contexts[i % contexts.length];
    const tone = VALID_TONES[i % VALID_TONES.length];

    const start = Date.now();
    await messenger.generateMessage(context, tone, { bypassCache: true });
    const time = Date.now() - start;

    times.push(time);
  }

  const avgTime = Math.round(
    times.reduce((sum, time) => sum + time, 0) / times.length
  );
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  console.log(`📊 Performance Results (${iterations} iterations):`);
  console.log(`- Average: ${avgTime}ms`);
  console.log(`- Minimum: ${minTime}ms`);
  console.log(`- Maximum: ${maxTime}ms`);
  console.log(`- Within target (<2s): ${maxTime < 2000 ? 'YES' : 'NO'}`);

  return avgTime < 1000; // Pass if average under 1 second
}

// Run tests if script executed directly
if (require.main === module) {
  runAllTests()
    .then(async (results) => {
      // Run performance benchmark
      const messenger = initializeTestService();
      const perfResult = await runPerformanceBenchmark(messenger);
      console.log(`\n⚡ Performance test: ${perfResult ? 'PASS' : 'FAIL'}`);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  runPerformanceBenchmark,
  testCases,
  edgeCases,
};
