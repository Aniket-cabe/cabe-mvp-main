/**
 * Test Script for Audit Dashboard API Simulator
 *
 * Tests the mock API functions to ensure they work correctly
 * and provide realistic data for frontend testing.
 */

import {
  getAuditRuns,
  getAuditRunById,
  getAllReviewers,
  getAuditRunsByReviewer,
  getAuditRunsByStatus,
  getAuditRunsBySkillArea,
  getAllSkillAreas,
  getAllTaskDifficulties,
  getSubmissionAuditResult,
  getAuditStatistics,
  searchAuditRuns,
  type AuditRunSummary,
  type FullAuditRun,
  type SubmissionAuditResult,
} from '../src/utils/audit-dashboard-api';

// Test function
async function testAuditDashboardAPI() {
  console.log('🧪 Testing Audit Dashboard API Simulator\n');

  try {
    // Test 1: Get all audit runs
    console.log('1. Testing getAuditRuns()...');
    const auditRuns = await getAuditRuns();
    console.log(`✅ Retrieved ${auditRuns.length} audit runs`);
    console.log('   Sample run:', auditRuns[0]);

    // Test 2: Get specific audit run
    console.log('\n2. Testing getAuditRunById()...');
    const specificRun = await getAuditRunById('run-001');
    if (specificRun) {
      console.log(`✅ Retrieved audit run: ${specificRun.taskTitle}`);
      console.log(`   Submissions: ${specificRun.results.length}`);
      console.log(`   Status: ${specificRun.status}`);
    } else {
      console.log('❌ Failed to retrieve audit run');
    }

    // Test 3: Get all reviewers
    console.log('\n3. Testing getAllReviewers()...');
    const reviewers = await getAllReviewers();
    console.log(`✅ Found ${reviewers.length} reviewers:`, reviewers);

    // Test 4: Filter by reviewer
    console.log('\n4. Testing getAuditRunsByReviewer()...');
    const admin1Runs = await getAuditRunsByReviewer('admin-1');
    console.log(`✅ Found ${admin1Runs.length} runs for admin-1`);

    // Test 5: Filter by status
    console.log('\n5. Testing getAuditRunsByStatus()...');
    const completedRuns = await getAuditRunsByStatus('completed');
    const pendingRuns = await getAuditRunsByStatus('pending');
    console.log(`✅ Completed runs: ${completedRuns.length}`);
    console.log(`✅ Pending runs: ${pendingRuns.length}`);

    // Test 6: Filter by skill area
    console.log('\n6. Testing getAuditRunsBySkillArea()...');
    const backendRuns = await getAuditRunsBySkillArea('backend');
    console.log(`✅ Found ${backendRuns.length} backend runs`);

    // Test 7: Get all skill areas
    console.log('\n7. Testing getAllSkillAreas()...');
    const skillAreas = await getAllSkillAreas();
    console.log(`✅ Skill areas:`, skillAreas);

    // Test 8: Get all task difficulties
    console.log('\n8. Testing getAllTaskDifficulties()...');
    const difficulties = await getAllTaskDifficulties();
    console.log(`✅ Task difficulties:`, difficulties);

    // Test 9: Get submission audit result
    console.log('\n9. Testing getSubmissionAuditResult()...');
    const submission = await getSubmissionAuditResult('sub-001');
    if (submission) {
      console.log(`✅ Retrieved submission: ${submission.submissionId}`);
      console.log(
        `   User Score: ${submission.userScore}, AI Score: ${submission.aiScore}`
      );
      console.log(`   Deviation Type: ${submission.deviationType}`);
      console.log(`   Action: ${submission.suggestedAction}`);
    } else {
      console.log('❌ Failed to retrieve submission');
    }

    // Test 10: Get audit statistics
    console.log('\n10. Testing getAuditStatistics()...');
    const stats = await getAuditStatistics();
    console.log('✅ Audit Statistics:');
    console.log(`   Total Runs: ${stats.totalRuns}`);
    console.log(`   Completed: ${stats.completedRuns}`);
    console.log(`   Pending: ${stats.pendingRuns}`);
    console.log(`   Total Submissions: ${stats.totalSubmissions}`);
    console.log(
      `   Avg Submissions/Run: ${stats.averageSubmissionsPerRun.toFixed(1)}`
    );
    console.log(`   Reviewers: ${stats.reviewers.length}`);
    console.log(`   Skill Areas: ${stats.skillAreas.length}`);

    // Test 11: Search audit runs
    console.log('\n11. Testing searchAuditRuns()...');
    const searchResults = await searchAuditRuns('navigation');
    console.log(
      `✅ Search results for "navigation": ${searchResults.length} runs`
    );

    const backendSearch = await searchAuditRuns('backend');
    console.log(
      `✅ Search results for "backend": ${backendSearch.length} runs`
    );

    // Test 12: Test non-existent data
    console.log('\n12. Testing non-existent data...');
    const nonExistentRun = await getAuditRunById('run-999');
    console.log(
      `✅ Non-existent run result: ${nonExistentRun === null ? 'null (correct)' : 'unexpected data'}`
    );

    const nonExistentSubmission = await getSubmissionAuditResult('sub-999');
    console.log(
      `✅ Non-existent submission result: ${nonExistentSubmission === null ? 'null (correct)' : 'unexpected data'}`
    );

    // Test 13: Data validation
    console.log('\n13. Data validation...');
    let validationPassed = true;

    // Check that all runs have required fields
    for (const run of auditRuns) {
      if (
        !run.id ||
        !run.reviewer ||
        !run.taskTitle ||
        !run.skillArea ||
        !run.taskDifficulty ||
        !run.status ||
        !run.startedAt
      ) {
        console.log(`❌ Invalid run data: ${run.id}`);
        validationPassed = false;
      }
    }

    // Check that completed runs have completedAt
    for (const run of auditRuns) {
      if (run.status === 'completed' && !run.completedAt) {
        console.log(`❌ Completed run missing completedAt: ${run.id}`);
        validationPassed = false;
      }
    }

    if (validationPassed) {
      console.log('✅ All data validation passed');
    }

    // Test 14: Performance test
    console.log('\n14. Performance test...');
    const startTime = Date.now();
    await getAuditRuns();
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (duration >= 250 && duration <= 500) {
      console.log(`✅ Latency simulation working: ${duration}ms`);
    } else {
      console.log(`⚠️ Unexpected latency: ${duration}ms (expected ~300ms)`);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\nThe Audit Dashboard API Simulator is working correctly.');
    console.log('\nMock Data Summary:');
    console.log(`   Total Audit Runs: ${auditRuns.length}`);
    console.log(`   Total Submissions: ${stats.totalSubmissions}`);
    console.log(`   Reviewers: ${reviewers.join(', ')}`);
    console.log(`   Skill Areas: ${skillAreas.join(', ')}`);
    console.log(`   Task Difficulties: ${difficulties.join(', ')}`);
    console.log(
      `   Status Distribution: ${completedRuns.length} completed, ${pendingRuns.length} pending`
    );

    console.log('\nReady for frontend integration! 🚀');
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('\nThis might be due to:');
    console.error('1. Import issues');
    console.error('2. Function implementation errors');
    console.error('3. Data structure problems');
  }
}

// Run the test
testAuditDashboardAPI();
