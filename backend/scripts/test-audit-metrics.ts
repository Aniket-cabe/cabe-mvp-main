#!/usr/bin/env tsx

/**
 * Test script for Audit Metrics Utility
 *
 * This script tests the centralized audit metrics calculation functions
 * to ensure they work correctly across different scenarios.
 */

import {
  getAuditHealthMetrics,
  getStatusEmoji,
  getStatusText,
  getHealthScoreColor,
  getHealthScoreLabel,
  calculateAuditTrend,
  type AuditResult,
} from '../src/utils/audit-metrics';
import logger from '../src/utils/logger';
import { config } from 'dotenv';

// Load environment variables
config();

function createTestAuditResults(scenario: string): AuditResult[] {
  switch (scenario) {
    case 'excellent':
      // All results within 5 points deviation
      return Array.from({ length: 20 }, (_, i) => ({
        task_id: `task-${i}`,
        user_id: `user-${i}`,
        skill_area: ['ai-ml', 'cloud-devops', 'data-analytics', 'fullstack-dev'][i % 4],
        original_score: 80,
        new_score: 80 + (Math.random() - 0.5) * 4, // ±2 points
        deviation: Math.random() * 3, // 0-3 points
        status: 'pass' as const,
        critical_issue: false,
        timestamp: new Date().toISOString(),
        audit_run_id: 'test-excellent',
      }));

    case 'good':
      // Most results within 10 points, some minor issues
      return Array.from({ length: 20 }, (_, i) => {
        const deviation = i < 15 ? Math.random() * 8 : Math.random() * 5 + 8; // 15 within 8, 5 within 8-13
        return {
          task_id: `task-${i}`,
          user_id: `user-${i}`,
          skill_area: ['ai-ml', 'cloud-devops', 'data-analytics', 'fullstack-dev'][i % 4],
          original_score: 80,
          new_score: 80 + (Math.random() - 0.5) * 20,
          deviation,
          status: deviation <= 5 ? 'pass' : deviation <= 10 ? 'minor' : 'major',
          critical_issue: false,
          timestamp: new Date().toISOString(),
          audit_run_id: 'test-good',
        };
      });

    case 'warning':
      // Several major issues, some critical
      return Array.from({ length: 20 }, (_, i) => {
        let deviation: number;
        let status: 'pass' | 'minor' | 'major' | 'critical';
        let critical_issue: boolean;

        if (i < 8) {
          deviation = Math.random() * 5; // 8 within 5
          status = 'pass';
          critical_issue = false;
        } else if (i < 12) {
          deviation = Math.random() * 5 + 5; // 4 within 5-10
          status = 'minor';
          critical_issue = false;
        } else if (i < 16) {
          deviation = Math.random() * 5 + 10; // 4 within 10-15
          status = 'major';
          critical_issue = false;
        } else {
          deviation = Math.random() * 10 + 15; // 4 within 15-25
          status = 'critical';
          critical_issue = true;
        }

        return {
          task_id: `task-${i}`,
          user_id: `user-${i}`,
          skill_area: ['ai-ml', 'cloud-devops', 'data-analytics', 'fullstack-dev'][i % 4],
          original_score: 80,
          new_score: 80 + (Math.random() - 0.5) * 40,
          deviation,
          status,
          critical_issue,
          timestamp: new Date().toISOString(),
          audit_run_id: 'test-warning',
        };
      });

    case 'critical':
      // Many critical issues
      return Array.from({ length: 20 }, (_, i) => {
        const deviation = Math.random() * 20 + 15; // 15-35 points
        return {
          task_id: `task-${i}`,
          user_id: `user-${i}`,
          skill_area: ['ai-ml', 'cloud-devops', 'data-analytics', 'fullstack-dev'][i % 4],
          original_score: 80,
          new_score: 80 + (Math.random() - 0.5) * 60,
          deviation,
          status: 'critical' as const,
          critical_issue: true,
          timestamp: new Date().toISOString(),
          audit_run_id: 'test-critical',
        };
      });

    case 'mixed':
      // Mixed results across all categories
      return Array.from({ length: 20 }, (_, i) => {
        const category = i % 4;
        let deviation: number;
        let status: 'pass' | 'minor' | 'major' | 'critical';
        let critical_issue: boolean;

        switch (category) {
          case 0: // pass
            deviation = Math.random() * 5;
            status = 'pass';
            critical_issue = false;
            break;
          case 1: // minor
            deviation = Math.random() * 5 + 5;
            status = 'minor';
            critical_issue = false;
            break;
          case 2: // major
            deviation = Math.random() * 5 + 10;
            status = 'major';
            critical_issue = false;
            break;
          case 3: // critical
            deviation = Math.random() * 10 + 15;
            status = 'critical';
            critical_issue = true;
            break;
        }

        return {
          task_id: `task-${i}`,
          user_id: `user-${i}`,
          skill_area: ['ai-ml', 'cloud-devops', 'data-analytics', 'fullstack-dev'][i % 4],
          original_score: 80,
          new_score: 80 + (Math.random() - 0.5) * 40,
          deviation,
          status,
          critical_issue,
          timestamp: new Date().toISOString(),
          audit_run_id: 'test-mixed',
        };
      });

    default:
      return [];
  }
}

async function testAuditMetrics(): Promise<void> {
  try {
    logger.info('🧪 Starting audit metrics utility tests');

    const testScenarios = ['excellent', 'good', 'warning', 'critical', 'mixed'];

    console.log('\n🔍 AUDIT METRICS UTILITY TESTS');
    console.log('================================');

    for (const scenario of testScenarios) {
      console.log(`\n📊 Testing Scenario: ${scenario.toUpperCase()}`);
      console.log('─'.repeat(50));

      const testResults = createTestAuditResults(scenario);
      const metrics = getAuditHealthMetrics(testResults);

      console.log(`Total Results: ${metrics.summary.totalResults}`);
      console.log(
        `Average Deviation: ${metrics.averageDeviation.toFixed(2)} points`
      );
      console.log(
        `Overall Status: ${metrics.status} ${getStatusEmoji(metrics.status)}`
      );
      console.log(
        `Health Score: ${metrics.healthScore} (${getHealthScoreLabel(metrics.healthScore)})`
      );
      console.log(`Critical Issues: ${metrics.criticalIssuesCount}`);

      console.log('\n📈 Results Breakdown:');
      console.log(`  Passed: ${metrics.summary.passedCount} ✅`);
      console.log(`  Minor: ${metrics.summary.minorCount} ⚠️`);
      console.log(`  Major: ${metrics.summary.majorCount} 🔶`);
      console.log(`  Critical: ${metrics.summary.criticalCount} ❗`);

      console.log('\n📊 Deviation Ranges:');
      console.log(
        `  ≤5 points: ${metrics.breakdown.counts.within5} (${metrics.breakdown.percentages.within5}%)`
      );
      console.log(
        `  ≤10 points: ${metrics.breakdown.counts.within10} (${metrics.breakdown.percentages.within10}%)`
      );
      console.log(
        `  ≤15 points: ${metrics.breakdown.counts.within15} (${metrics.breakdown.percentages.within15}%)`
      );
      console.log(
        `  >15 points: ${metrics.breakdown.counts.over15} (${metrics.breakdown.percentages.over15}%)`
      );

      console.log('\n🎯 Skill Area Breakdown:');
      Object.entries(metrics.skillBreakdown).forEach(([skill, stats]) => {
        console.log(
          `  ${skill.toUpperCase()}: ${stats.count} submissions, ${stats.avgDeviation.toFixed(2)} avg deviation`
        );
      });

      // Test utility functions
      console.log('\n🔧 Utility Function Tests:');
      console.log(`  Status Emoji: ${getStatusEmoji(metrics.status)}`);
      console.log(`  Status Text: ${getStatusText(metrics.status)}`);
      console.log(
        `  Health Score Color: ${getHealthScoreColor(metrics.healthScore)}`
      );
      console.log(
        `  Health Score Label: ${getHealthScoreLabel(metrics.healthScore)}`
      );
    }

    // Test trend analysis
    console.log('\n📈 TREND ANALYSIS TEST');
    console.log('─'.repeat(50));

    const trendData = [
      {
        averageDeviation: 5.2,
        healthScore: 85,
        criticalCount: 1,
        timestamp: '2024-08-01T00:00:00Z',
      },
      {
        averageDeviation: 6.8,
        healthScore: 78,
        criticalCount: 2,
        timestamp: '2024-08-02T00:00:00Z',
      },
      {
        averageDeviation: 4.1,
        healthScore: 92,
        criticalCount: 0,
        timestamp: '2024-08-03T00:00:00Z',
      },
      {
        averageDeviation: 7.5,
        healthScore: 75,
        criticalCount: 3,
        timestamp: '2024-08-04T00:00:00Z',
      },
      {
        averageDeviation: 3.8,
        healthScore: 95,
        criticalCount: 0,
        timestamp: '2024-08-05T00:00:00Z',
      },
      {
        averageDeviation: 6.2,
        healthScore: 82,
        criticalCount: 1,
        timestamp: '2024-08-06T00:00:00Z',
      },
    ];

    const trend = calculateAuditTrend(trendData);
    console.log(`Overall Trend: ${trend.trend}`);
    console.log(`Average Deviation Trend: ${trend.averageDeviationTrend}`);
    console.log(`Health Score Trend: ${trend.healthScoreTrend}`);
    console.log(`Critical Issues Trend: ${trend.criticalIssuesTrend}`);

    // Test edge cases
    console.log('\n⚠️ EDGE CASE TESTS');
    console.log('─'.repeat(50));

    // Empty results
    const emptyMetrics = getAuditHealthMetrics([]);
    console.log('Empty Results:');
    console.log(`  Status: ${emptyMetrics.status}`);
    console.log(`  Health Score: ${emptyMetrics.healthScore}`);
    console.log(`  Total Results: ${emptyMetrics.summary.totalResults}`);

    // Single result
    const singleResult = createTestAuditResults('excellent').slice(0, 1);
    const singleMetrics = getAuditHealthMetrics(singleResult);
    console.log('\nSingle Result:');
    console.log(`  Status: ${singleMetrics.status}`);
    console.log(`  Health Score: ${singleMetrics.healthScore}`);
    console.log(`  Average Deviation: ${singleMetrics.averageDeviation}`);

    console.log('\n✅ All audit metrics utility tests completed successfully!');
  } catch (error) {
    logger.error('💥 Audit metrics utility tests failed:', error);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testAuditMetrics()
    .then(() => {
      logger.info('🎉 Audit metrics utility tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 Audit metrics utility tests failed:', error);
      process.exit(1);
    });
}

export default testAuditMetrics;
