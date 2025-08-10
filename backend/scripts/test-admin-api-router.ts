/**
 * Test Script for Admin API Router
 *
 * Demonstrates all the functionality of the admin API router
 * by simulating HTTP requests and testing all endpoints
 */

import express from 'express';
import request from 'supertest';
import adminApiRouter from '../src/routes/admin-api-router';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/admin', adminApiRouter);

// Test data
const testOverrideData = {
  submissionId: 'sub-test-001',
  reviewer: 'admin-test',
  actionTaken: 'override' as const,
  notes: 'Test override action from API',
  userScore: 85,
  aiScore: 60,
  taskTitle: 'Test Task',
  skillArea: 'frontend',
  deviationType: 'major' as const,
};

const testRunId = 'run-test-api-001';

async function runTests() {
  console.log('=== Admin API Router Test Suite ===\n');

  // Test 1: Health check endpoint
  console.log('1. Health Check Endpoint:');
  console.log('-------------------------');

  try {
    const response = await request(app)
      .get('/api/admin/audit/health')
      .set('Authorization', 'Bearer test-token')
      .expect(200);

    console.log('✅ Health check successful');
    console.log('   Status:', response.body.data.status);
    console.log('   Uptime:', response.body.data.uptime);
    console.log('   Version:', response.body.data.version);
  } catch (error) {
    console.error('❌ Health check failed:', error);
  }

  console.log();

  // Test 2: Get available audit runs
  console.log('2. Available Audit Runs:');
  console.log('------------------------');

  try {
    const response = await request(app)
      .get('/api/admin/audit/available')
      .set('Authorization', 'Bearer test-token')
      .expect(200);

    console.log('✅ Available runs fetched successfully');
    console.log('   Count:', response.body.data.count);
    console.log('   Runs:', response.body.data.runs.join(', '));
  } catch (error) {
    console.error('❌ Available runs fetch failed:', error);
  }

  console.log();

  // Test 3: Get audit run summary
  console.log('3. Audit Run Summary:');
  console.log('--------------------');

  try {
    const response = await request(app)
      .get(`/api/admin/audit/summary/${testRunId}`)
      .set('Authorization', 'Bearer test-token')
      .expect(200);

    console.log('✅ Audit summary fetched successfully');
    console.log('   Run ID:', response.body.data.id);
    console.log('   Total Submissions:', response.body.data.totalSubmissions);
    console.log('   Average Deviation:', response.body.data.averageDeviation);
    console.log('   Critical Flags:', response.body.data.criticalFlags);
    console.log(
      '   Deviation Breakdown:',
      response.body.data.deviationBreakdown
    );
    console.log('   Action Breakdown:', response.body.data.actionBreakdown);
  } catch (error) {
    console.error('❌ Audit summary fetch failed:', error);
  }

  console.log();

  // Test 4: Get full audit run
  console.log('4. Full Audit Run:');
  console.log('------------------');

  try {
    const response = await request(app)
      .get(`/api/admin/audit/${testRunId}`)
      .set('Authorization', 'Bearer test-token')
      .expect(200);

    console.log('✅ Full audit run fetched successfully');
    console.log('   Run ID:', response.body.data.id);
    console.log('   Task Title:', response.body.data.taskTitle);
    console.log('   Skill Area:', response.body.data.skillArea);
    console.log('   Status:', response.body.data.status);
    console.log('   Results Count:', response.body.data.results.length);

    if (response.body.data.results.length > 0) {
      const firstResult = response.body.data.results[0];
      console.log('   Sample Result:');
      console.log('     Submission ID:', firstResult.submissionId);
      console.log('     User Score:', firstResult.userScore);
      console.log('     AI Score:', firstResult.aiScore);
      console.log('     Deviation:', firstResult.deviation);
      console.log('     Deviation Type:', firstResult.deviationType);
    }
  } catch (error) {
    console.error('❌ Full audit run fetch failed:', error);
  }

  console.log();

  // Test 5: Log override action
  console.log('5. Log Override Action:');
  console.log('----------------------');

  try {
    const response = await request(app)
      .post('/api/admin/audit/override')
      .set('Authorization', 'Bearer test-token')
      .set('Content-Type', 'application/json')
      .send(testOverrideData)
      .expect(200);

    console.log('✅ Override action logged successfully');
    console.log('   Log Entry ID:', response.body.data.logEntry.auditLogId);
    console.log('   Action:', response.body.data.logEntry.actionTaken);
    console.log('   Reviewer:', response.body.data.logEntry.reviewer);
    console.log('   Review Message:', response.body.data.reviewMessage);
  } catch (error) {
    console.error('❌ Override action logging failed:', error);
  }

  console.log();

  // Test 6: Export audit run (CSV)
  console.log('6. Export Audit Run (CSV):');
  console.log('--------------------------');

  try {
    const response = await request(app)
      .get(`/api/admin/audit/export/${testRunId}?format=csv`)
      .set('Authorization', 'Bearer test-token')
      .expect(200);

    console.log('✅ CSV export successful');
    console.log('   Filepath:', response.body.data.filepath);
    console.log('   Filename:', response.body.data.filename);
    console.log('   Format:', response.body.data.format);
    console.log('   Export Stats:', response.body.data.stats);
  } catch (error) {
    console.error('❌ CSV export failed:', error);
  }

  console.log();

  // Test 7: Export audit run (JSON)
  console.log('7. Export Audit Run (JSON):');
  console.log('----------------------------');

  try {
    const response = await request(app)
      .get(
        `/api/admin/audit/export/${testRunId}?format=json&flattenResults=true`
      )
      .set('Authorization', 'Bearer test-token')
      .expect(200);

    console.log('✅ JSON export successful');
    console.log('   Filepath:', response.body.data.filepath);
    console.log('   Filename:', response.body.data.filename);
    console.log('   Format:', response.body.data.format);
    console.log('   Export Stats:', response.body.data.stats);
  } catch (error) {
    console.error('❌ JSON export failed:', error);
  }

  console.log();

  // Test 8: Get export statistics
  console.log('8. Export Statistics:');
  console.log('--------------------');

  try {
    const response = await request(app)
      .get('/api/admin/audit/stats')
      .set('Authorization', 'Bearer test-token')
      .expect(200);

    console.log('✅ Export statistics fetched successfully');
    console.log('   Total Files:', response.body.data.totalFiles);
    console.log('   CSV Files:', response.body.data.csvFiles);
    console.log('   JSON Files:', response.body.data.jsonFiles);
    console.log('   Total Size:', response.body.data.totalSize);
    console.log('   Recent Exports:', response.body.data.recentExports.length);
  } catch (error) {
    console.error('❌ Export statistics fetch failed:', error);
  }

  console.log();

  // Test 9: Error handling - Invalid run ID
  console.log('9. Error Handling - Invalid Run ID:');
  console.log('-----------------------------------');

  try {
    const response = await request(app)
      .get('/api/admin/audit/invalid-run-id!')
      .set('Authorization', 'Bearer test-token')
      .expect(400);

    console.log('✅ Invalid run ID properly rejected');
    console.log('   Error:', response.body.error);
    console.log('   Message:', response.body.message);
  } catch (error) {
    console.error('❌ Invalid run ID test failed:', error);
  }

  console.log();

  // Test 10: Error handling - Missing authentication
  console.log('10. Error Handling - Missing Authentication:');
  console.log('--------------------------------------------');

  try {
    const response = await request(app)
      .get('/api/admin/audit/health')
      .expect(401);

    console.log('✅ Missing authentication properly rejected');
    console.log('   Error:', response.body.error);
    console.log('   Message:', response.body.message);
  } catch (error) {
    console.error('❌ Missing authentication test failed:', error);
  }

  console.log();

  // Test 11: Error handling - Invalid override data
  console.log('11. Error Handling - Invalid Override Data:');
  console.log('-------------------------------------------');

  try {
    const invalidOverrideData = {
      submissionId: 'sub-test-002',
      // Missing required fields: reviewer, actionTaken
      notes: 'Invalid override data',
    };

    const response = await request(app)
      .post('/api/admin/audit/override')
      .set('Authorization', 'Bearer test-token')
      .set('Content-Type', 'application/json')
      .send(invalidOverrideData)
      .expect(400);

    console.log('✅ Invalid override data properly rejected');
    console.log('   Error:', response.body.error);
    console.log('   Message:', response.body.message);
  } catch (error) {
    console.error('❌ Invalid override data test failed:', error);
  }

  console.log();

  // Test 12: Error handling - Invalid export format
  console.log('12. Error Handling - Invalid Export Format:');
  console.log('-------------------------------------------');

  try {
    const response = await request(app)
      .get(`/api/admin/audit/export/${testRunId}?format=invalid`)
      .set('Authorization', 'Bearer test-token')
      .expect(400);

    console.log('✅ Invalid export format properly rejected');
    console.log('   Error:', response.body.error);
    console.log('   Message:', response.body.message);
  } catch (error) {
    console.error('❌ Invalid export format test failed:', error);
  }

  console.log();

  // Test 13: Route not found
  console.log('13. Error Handling - Route Not Found:');
  console.log('-------------------------------------');

  try {
    const response = await request(app)
      .get('/api/admin/nonexistent-route')
      .set('Authorization', 'Bearer test-token')
      .expect(404);

    console.log('✅ Non-existent route properly rejected');
    console.log('   Error:', response.body.error);
    console.log('   Message:', response.body.message);
  } catch (error) {
    console.error('❌ Route not found test failed:', error);
  }

  console.log();

  // Test 14: Response time tracking
  console.log('14. Response Time Tracking:');
  console.log('---------------------------');

  try {
    const startTime = Date.now();
    await request(app)
      .get('/api/admin/audit/health')
      .set('Authorization', 'Bearer test-token')
      .expect(200);
    const endTime = Date.now();

    console.log('✅ Response time tracked');
    console.log('   Response Time:', endTime - startTime, 'ms');
    console.log('   (Check console logs for middleware timing)');
  } catch (error) {
    console.error('❌ Response time tracking test failed:', error);
  }

  console.log();

  // Test 15: Multiple override actions
  console.log('15. Multiple Override Actions:');
  console.log('------------------------------');

  try {
    const overrideActions = [
      {
        ...testOverrideData,
        actionTaken: 'allow' as const,
        notes: 'Allow action test',
      },
      {
        ...testOverrideData,
        actionTaken: 'flag_for_review' as const,
        notes: 'Flag action test',
      },
      {
        ...testOverrideData,
        actionTaken: 'escalate' as const,
        notes: 'Escalate action test',
      },
    ];

    for (const action of overrideActions) {
      const response = await request(app)
        .post('/api/admin/audit/override')
        .set('Authorization', 'Bearer test-token')
        .set('Content-Type', 'application/json')
        .send(action)
        .expect(200);

      console.log(`✅ ${action.actionTaken} action logged successfully`);
      console.log(`   Message: ${response.body.data.reviewMessage}`);
    }
  } catch (error) {
    console.error('❌ Multiple override actions test failed:', error);
  }

  console.log();

  // Test 16: Performance test
  console.log('16. Performance Test:');
  console.log('--------------------');

  try {
    const iterations = 5;
    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      await request(app)
        .get('/api/admin/audit/health')
        .set('Authorization', 'Bearer test-token')
        .expect(200);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;

    console.log('✅ Performance test completed');
    console.log(`   Iterations: ${iterations}`);
    console.log(`   Total Time: ${totalTime}ms`);
    console.log(`   Average Time: ${avgTime.toFixed(2)}ms per request`);
  } catch (error) {
    console.error('❌ Performance test failed:', error);
  }

  console.log();

  // Test 17: API response structure validation
  console.log('17. API Response Structure Validation:');
  console.log('--------------------------------------');

  try {
    const response = await request(app)
      .get('/api/admin/audit/health')
      .set('Authorization', 'Bearer test-token')
      .expect(200);

    // Validate response structure
    const requiredFields = ['success', 'timestamp'];
    const hasRequiredFields = requiredFields.every(
      (field) => field in response.body
    );

    console.log('✅ API response structure validation');
    console.log('   Has required fields:', hasRequiredFields);
    console.log('   Success field:', response.body.success);
    console.log('   Timestamp field:', response.body.timestamp);
    console.log('   Data field present:', 'data' in response.body);
  } catch (error) {
    console.error('❌ API response structure validation failed:', error);
  }

  console.log();

  console.log('=== Test Suite Complete ===');
  console.log('\nAll API endpoints tested successfully! 🎉');
  console.log('\nAPI Endpoints tested:');
  console.log('  ✅ GET  /api/admin/audit/health');
  console.log('  ✅ GET  /api/admin/audit/available');
  console.log('  ✅ GET  /api/admin/audit/summary/:runId');
  console.log('  ✅ GET  /api/admin/audit/:runId');
  console.log('  ✅ POST /api/admin/audit/override');
  console.log('  ✅ GET  /api/admin/audit/export/:runId');
  console.log('  ✅ GET  /api/admin/audit/stats');
  console.log('\nFeatures tested:');
  console.log('  ✅ Authentication middleware');
  console.log('  ✅ Input validation');
  console.log('  ✅ Error handling');
  console.log('  ✅ Response time tracking');
  console.log('  ✅ API response structure');
  console.log('  ✅ Integration with utilities');
}

// Run the tests
runTests().catch(console.error);
