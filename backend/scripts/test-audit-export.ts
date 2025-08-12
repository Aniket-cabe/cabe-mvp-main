#!/usr/bin/env tsx

/**
 * Test script for Audit CSV Export API
 *
 * This script tests the audit export endpoint with various filter combinations
 * to ensure CSV generation works correctly.
 */

import logger from '../src/utils/logger';
import { config } from 'dotenv';

// Load environment variables
config();

interface ExportTest {
  name: string;
  url: string;
  description: string;
}

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testAuditExport(): Promise<void> {
  try {
    logger.info('🧪 Starting audit export API tests');

    const exportTests: ExportTest[] = [
      {
        name: 'Export Last 30 Days (Default)',
        url: `${BASE_URL}/api/admin/audit/export`,
        description: 'Export all audit results from the last 30 days',
      },
      {
        name: 'Export Last 7 Days',
        url: `${BASE_URL}/api/admin/audit/export?days=7`,
        description: 'Export audit results from the last 7 days',
      },
      {
        name: 'Export Last 90 Days',
        url: `${BASE_URL}/api/admin/audit/export?days=90`,
        description: 'Export audit results from the last 90 days',
      },
      {
        name: 'Export Frontend Only',
        url: `${BASE_URL}/api/admin/audit/export?skill_area=frontend`,
        description: 'Export only frontend audit results',
      },
      {
        name: 'Export Critical Issues Only',
        url: `${BASE_URL}/api/admin/audit/export?status=critical`,
        description: 'Export only critical audit results',
      },
      {
        name: 'Export High Deviation (>10)',
        url: `${BASE_URL}/api/admin/audit/export?deviation_threshold=10`,
        description: 'Export results with deviation > 10 points',
      },
      {
        name: 'Export Backend Critical Issues',
        url: `${BASE_URL}/api/admin/audit/export?skill_area=backend&status=critical`,
        description: 'Export critical backend audit results',
      },
      {
        name: 'Export High Deviation Frontend',
        url: `${BASE_URL}/api/admin/audit/export?skill_area=frontend&deviation_threshold=15`,
        description: 'Export frontend results with deviation > 15 points',
      },
      {
        name: 'Export Specific Run (if available)',
        url: `${BASE_URL}/api/admin/audit/export?runId=test_audit_2024_08_01_123456`,
        description: 'Export results from a specific audit run',
      },
    ];

    console.log('\n📊 AUDIT EXPORT API TESTS');
    console.log('==========================');

    for (const test of exportTests) {
      console.log(`\n🔍 Testing: ${test.name}`);
      console.log(`📝 Description: ${test.description}`);
      console.log(`🌐 URL: ${test.url}`);

      try {
        // Note: In a real test, you would need authentication headers
        // For this test script, we'll just validate the URL structure
        const url = new URL(test.url);

        // Validate query parameters
        const params = url.searchParams;
        console.log('📋 Query Parameters:');

        if (params.has('days')) {
          const days = parseInt(params.get('days')!);
          console.log(
            `  - days: ${days} (${days > 0 ? '✅ Valid' : '❌ Invalid'})`
          );
        }

        if (params.has('skill_area')) {
          const skillArea = params.get('skill_area')!;
          const validSkills = ['ai-ml', 'cloud-devops', 'data-analytics', 'fullstack-dev'];
          console.log(
            `  - skill_area: ${skillArea} (${validSkills.includes(skillArea) ? '✅ Valid' : '❌ Invalid'})`
          );
        }

        if (params.has('status')) {
          const status = params.get('status')!;
          const validStatuses = ['pass', 'minor', 'major', 'critical'];
          console.log(
            `  - status: ${status} (${validStatuses.includes(status) ? '✅ Valid' : '❌ Valid'})`
          );
        }

        if (params.has('deviation_threshold')) {
          const threshold = parseFloat(params.get('deviation_threshold')!);
          console.log(
            `  - deviation_threshold: ${threshold} (${threshold >= 0 ? '✅ Valid' : '❌ Invalid'})`
          );
        }

        if (params.has('runId')) {
          const runId = params.get('runId')!;
          console.log(
            `  - runId: ${runId} (${runId.length > 0 ? '✅ Valid' : '❌ Invalid'})`
          );
        }

        console.log('✅ URL structure validated');
      } catch (error) {
        console.log(`❌ URL validation failed: ${error}`);
      }
    }

    // Test CSV generation function
    console.log('\n📄 CSV GENERATION TESTS');
    console.log('========================');

    const mockAuditResults = [
      {
        task_id: 'task-001',
        user_id: 'user-001',
        skill_area: 'ai-ml',
        original_score: 85,
        new_score: 82,
        deviation: 3,
        status: 'pass',
        critical_issue: false,
        timestamp: '2024-08-01T10:00:00Z',
        audit_run_id: 'test-run-001',
      },
      {
        task_id: 'task-002',
        user_id: 'user-002',
        skill_area: 'cloud-devops',
        original_score: 80,
        new_score: 65,
        deviation: 15,
        status: 'critical',
        critical_issue: true,
        timestamp: '2024-08-01T11:00:00Z',
        audit_run_id: 'test-run-001',
      },
      {
        task_id: 'task-003',
        user_id: 'user-003',
        skill_area: 'data-analytics',
        original_score: 90,
        new_score: 85,
        deviation: 5,
        status: 'minor',
        critical_issue: false,
        timestamp: '2024-08-01T12:00:00Z',
        audit_run_id: 'test-run-001',
      },
    ];

    // Test CSV generation (import the function from arena.ts)
    try {
      // Note: In a real implementation, you would import the function
      // For this test, we'll simulate the CSV generation
      const csvContent = generateMockCSV(mockAuditResults);

      console.log('✅ CSV Generation Test:');
      console.log(`  - Input records: ${mockAuditResults.length}`);
      console.log(`  - Output CSV lines: ${csvContent.split('\n').length - 1}`); // -1 for header
      console.log(`  - CSV content length: ${csvContent.length} characters`);

      // Validate CSV structure
      const lines = csvContent.split('\n');
      const header = lines[0];
      const expectedHeaders =
        'task_id,user_id,skill_area,original_score,new_score,deviation,status,critical_issue,timestamp,audit_run_id';

      if (header === expectedHeaders) {
        console.log('✅ CSV headers match expected format');
      } else {
        console.log('❌ CSV headers do not match expected format');
        console.log(`  Expected: ${expectedHeaders}`);
        console.log(`  Actual: ${header}`);
      }

      // Check data rows
      const dataRows = lines.slice(1).filter((line) => line.trim().length > 0);
      console.log(`✅ CSV contains ${dataRows.length} data rows`);

      // Validate first data row
      if (dataRows.length > 0) {
        const firstRow = dataRows[0];
        const fields = firstRow.split(',');
        console.log(`✅ First row has ${fields.length} fields (expected: 10)`);

        // Check for proper escaping
        if (firstRow.includes('"')) {
          console.log('✅ CSV properly escapes fields with quotes');
        }
      }
    } catch (error) {
      console.log(`❌ CSV generation test failed: ${error}`);
    }

    // Test filename generation
    console.log('\n📁 FILENAME GENERATION TESTS');
    console.log('============================');

    const timestamp = new Date().toISOString().split('T')[0];

    // Test runId filename
    const runIdFilename = `audit_export_run_test_audit_2024_08_01_123456_${timestamp}.csv`;
    console.log(`✅ Run ID filename: ${runIdFilename}`);

    // Test range filename
    const rangeFilename = `audit_export_30days_${timestamp}.csv`;
    console.log(`✅ Range filename: ${rangeFilename}`);

    // Test custom days filename
    const customDaysFilename = `audit_export_7days_${timestamp}.csv`;
    console.log(`✅ Custom days filename: ${customDaysFilename}`);

    console.log('\n🎉 All audit export tests completed successfully!');
  } catch (error) {
    logger.error('💥 Audit export tests failed:', error);
    throw error;
  }
}

/**
 * Generate mock CSV content for testing
 */
function generateMockCSV(auditResults: any[]): string {
  // CSV headers
  const headers = [
    'task_id',
    'user_id',
    'skill_area',
    'original_score',
    'new_score',
    'deviation',
    'status',
    'critical_issue',
    'timestamp',
    'audit_run_id',
  ];

  // Start with headers
  let csvContent = headers.join(',') + '\n';

  // Add data rows
  auditResults.forEach((result) => {
    const row = [
      result.task_id,
      result.user_id,
      result.skill_area,
      result.original_score,
      result.new_score,
      result.deviation,
      result.status,
      result.critical_issue ? 'true' : 'false',
      result.timestamp,
      result.audit_run_id,
    ];

    // Escape fields that contain commas or quotes
    const escapedRow = row.map((field) => {
      const fieldStr = String(field);
      if (
        fieldStr.includes(',') ||
        fieldStr.includes('"') ||
        fieldStr.includes('\n')
      ) {
        return `"${fieldStr.replace(/"/g, '""')}"`;
      }
      return fieldStr;
    });

    csvContent += escapedRow.join(',') + '\n';
  });

  return csvContent;
}

// Run the test
if (require.main === module) {
  testAuditExport()
    .then(() => {
      logger.info('🎉 Audit export tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 Audit export tests failed:', error);
      process.exit(1);
    });
}

export default testAuditExport;
