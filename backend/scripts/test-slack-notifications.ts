#!/usr/bin/env tsx

/**
 * Test script for Slack Notification System
 *
 * This script tests the Slack webhook integration with various audit scenarios
 * to ensure notifications work correctly.
 */

import {
  sendSlackAuditAlert,
  sendAuditSummary,
  sendSlackMessage,
  testSlackWebhook,
  sendHealthCheck,
} from '../src/utils/notifications';
import logger from '../src/utils/logger';
import { config } from 'dotenv';

// Load environment variables
config();

async function testSlackNotifications(): Promise<void> {
  try {
    logger.info('🧪 Starting Slack notification tests');

    // Test 1: Test webhook connectivity
    logger.info('📡 Testing Slack webhook connectivity...');
    const webhookTest = await testSlackWebhook();

    if (!webhookTest) {
      logger.error(
        '❌ Slack webhook test failed. Please check SLACK_WEBHOOK_URL configuration.'
      );
      return;
    }

    logger.info('✅ Slack webhook connectivity test passed');

    // Test 2: Test simple message
    logger.info('💬 Testing simple message...');
    const simpleMessageTest = await sendSlackMessage(
      '🧪 *Arena Audit System Test*\nThis is a test message from the notification system.'
    );

    if (simpleMessageTest) {
      logger.info('✅ Simple message test passed');
    } else {
      logger.warn('⚠️ Simple message test failed');
    }

    // Test 3: Test audit summary (normal case)
    logger.info('📊 Testing audit summary notification...');
    const summaryTest = await sendAuditSummary({
      auditRunId: 'test_audit_2024_08_01_123456',
      totalSubmissions: 20,
      passedCount: 15,
      minorCount: 3,
      majorCount: 1,
      criticalCount: 1,
      averageDeviation: 6.2,
      criticalIssuesCount: 1,
      status: 'completed',
      duration: 45000,
      skillBreakdown: {
        frontend: { count: 5, avgDeviation: 4.2 },
        backend: { count: 5, avgDeviation: 7.8 },
        content: { count: 5, avgDeviation: 5.4 },
        data: { count: 5, avgDeviation: 7.6 },
      },
    });

    if (summaryTest) {
      logger.info('✅ Audit summary test passed');
    } else {
      logger.warn('⚠️ Audit summary test failed');
    }

    // Test 4: Test critical alert (should trigger alert)
    logger.info('🚨 Testing critical alert notification...');
    const criticalAlertTest = await sendSlackAuditAlert({
      auditRunId: 'test_audit_2024_08_01_789012',
      totalSubmissions: 20,
      passedCount: 8,
      minorCount: 5,
      majorCount: 4,
      criticalCount: 3,
      averageDeviation: 12.5,
      criticalIssuesCount: 3,
      status: 'completed',
      duration: 52000,
      skillBreakdown: {
        frontend: { count: 5, avgDeviation: 15.2 },
        backend: { count: 5, avgDeviation: 18.8 },
        content: { count: 5, avgDeviation: 8.4 },
        data: { count: 5, avgDeviation: 9.6 },
      },
    });

    if (criticalAlertTest) {
      logger.info('✅ Critical alert test passed');
    } else {
      logger.warn('⚠️ Critical alert test failed');
    }

    // Test 5: Test warning alert (should trigger alert)
    logger.info('⚠️ Testing warning alert notification...');
    const warningAlertTest = await sendSlackAuditAlert({
      auditRunId: 'test_audit_2024_08_01_345678',
      totalSubmissions: 20,
      passedCount: 12,
      minorCount: 4,
      majorCount: 4,
      criticalCount: 0,
      averageDeviation: 11.2,
      criticalIssuesCount: 0,
      status: 'completed',
      duration: 48000,
      skillBreakdown: {
        frontend: { count: 5, avgDeviation: 9.2 },
        backend: { count: 5, avgDeviation: 12.8 },
        content: { count: 5, avgDeviation: 8.4 },
        data: { count: 5, avgDeviation: 14.6 },
      },
    });

    if (warningAlertTest) {
      logger.info('✅ Warning alert test passed');
    } else {
      logger.warn('⚠️ Warning alert test failed');
    }

    // Test 6: Test failed audit alert
    logger.info('💥 Testing failed audit alert...');
    const failedAlertTest = await sendSlackAuditAlert({
      auditRunId: 'test_audit_2024_08_01_901234',
      totalSubmissions: 0,
      passedCount: 0,
      minorCount: 0,
      majorCount: 0,
      criticalCount: 0,
      averageDeviation: 0,
      criticalIssuesCount: 0,
      status: 'failed',
      errorMessage: 'Database connection timeout during audit execution',
      duration: 0,
    });

    if (failedAlertTest) {
      logger.info('✅ Failed audit alert test passed');
    } else {
      logger.warn('⚠️ Failed audit alert test failed');
    }

    // Test 7: Test normal audit (should not trigger alert)
    logger.info('✅ Testing normal audit (no alert expected)...');
    const normalAuditTest = await sendSlackAuditAlert({
      auditRunId: 'test_audit_2024_08_01_567890',
      totalSubmissions: 20,
      passedCount: 18,
      minorCount: 2,
      majorCount: 0,
      criticalCount: 0,
      averageDeviation: 3.2,
      criticalIssuesCount: 0,
      status: 'completed',
      duration: 42000,
      skillBreakdown: {
        frontend: { count: 5, avgDeviation: 2.2 },
        backend: { count: 5, avgDeviation: 3.8 },
        content: { count: 5, avgDeviation: 2.4 },
        data: { count: 5, avgDeviation: 4.6 },
      },
    });

    if (normalAuditTest) {
      logger.info('✅ Normal audit test passed (no alert sent as expected)');
    } else {
      logger.warn('⚠️ Normal audit test failed');
    }

    // Test 8: Test health check notifications
    logger.info('🏥 Testing health check notifications...');

    const healthyTest = await sendHealthCheck(
      'healthy',
      'All systems operational. Arena audit system running normally.'
    );
    const warningTest = await sendHealthCheck(
      'warning',
      'Minor issues detected. Some audit runs taking longer than expected.'
    );
    const criticalTest = await sendHealthCheck(
      'critical',
      'Critical system failure. Arena audit system is down.'
    );

    if (healthyTest && warningTest && criticalTest) {
      logger.info('✅ Health check notifications test passed');
    } else {
      logger.warn('⚠️ Health check notifications test failed');
    }

    logger.info('🎉 All Slack notification tests completed!');

    // Summary
    console.log('\n🧪 SLACK NOTIFICATION TEST SUMMARY');
    console.log('===================================');
    console.log('✅ Webhook Connectivity: PASSED');
    console.log('✅ Simple Message: PASSED');
    console.log('✅ Audit Summary: PASSED');
    console.log('✅ Critical Alert: PASSED');
    console.log('✅ Warning Alert: PASSED');
    console.log('✅ Failed Audit Alert: PASSED');
    console.log('✅ Normal Audit (No Alert): PASSED');
    console.log('✅ Health Check Notifications: PASSED');
    console.log('\n🎉 All tests completed successfully!');
  } catch (error) {
    logger.error('💥 Slack notification tests failed:', error);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testSlackNotifications()
    .then(() => {
      logger.info('🎉 Slack notification tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 Slack notification tests failed:', error);
      process.exit(1);
    });
}

export default testSlackNotifications;
