/**
 * Test Script for Audit Run Exporter
 *
 * Demonstrates all the functionality of the audit run exporter utility
 */

import {
  exportAuditRun,
  exportMultipleRuns,
  listAvailableRuns,
  getExportStats,
} from './audit-run-exporter';

import * as fs from 'fs';
import * as path from 'path';

async function runTests() {
  console.log('=== Audit Run Exporter Test Suite ===\n');

  // Test 1: Basic CSV export
  console.log('1. Basic CSV Export:');
  console.log('-------------------');

  try {
    const csvFilepath = await exportAuditRun('run-test-001', 'csv');
    console.log(`✅ CSV export successful: ${csvFilepath}`);

    // Verify file exists and has content
    if (fs.existsSync(csvFilepath)) {
      const stats = fs.statSync(csvFilepath);
      const content = fs.readFileSync(csvFilepath, 'utf8');
      const lines = content.split('\n');
      console.log(`   File size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`   Lines: ${lines.length}`);
      console.log(`   Headers: ${lines[0]?.split(',').length} columns`);
    }
  } catch (error) {
    console.error('❌ CSV export failed:', error);
  }

  console.log();

  // Test 2: Basic JSON export
  console.log('2. Basic JSON Export:');
  console.log('--------------------');

  try {
    const jsonFilepath = await exportAuditRun('run-test-002', 'json');
    console.log(`✅ JSON export successful: ${jsonFilepath}`);

    // Verify file exists and has content
    if (fs.existsSync(jsonFilepath)) {
      const stats = fs.statSync(jsonFilepath);
      const content = fs.readFileSync(jsonFilepath, 'utf8');
      const data = JSON.parse(content);
      console.log(`   File size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`   Data type: ${typeof data}`);
      console.log(`   Results count: ${data.results?.length || 'N/A'}`);
    }
  } catch (error) {
    console.error('❌ JSON export failed:', error);
  }

  console.log();

  // Test 3: JSON export with flattened results
  console.log('3. JSON Export (Flattened):');
  console.log('----------------------------');

  try {
    const flattenedFilepath = await exportAuditRun('run-test-003', 'json', {
      flattenResults: true,
    });
    console.log(`✅ Flattened JSON export successful: ${flattenedFilepath}`);

    // Verify file exists and has content
    if (fs.existsSync(flattenedFilepath)) {
      const stats = fs.statSync(flattenedFilepath);
      const content = fs.readFileSync(flattenedFilepath, 'utf8');
      const data = JSON.parse(content);
      console.log(`   File size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(
        `   Data type: ${Array.isArray(data) ? 'Array' : typeof data}`
      );
      console.log(
        `   Records count: ${Array.isArray(data) ? data.length : 'N/A'}`
      );

      if (Array.isArray(data) && data.length > 0) {
        console.log(
          `   Sample record keys: ${Object.keys(data[0]).join(', ')}`
        );
      }
    }
  } catch (error) {
    console.error('❌ Flattened JSON export failed:', error);
  }

  console.log();

  // Test 4: Custom output directory
  console.log('4. Custom Output Directory:');
  console.log('---------------------------');

  try {
    const customFilepath = await exportAuditRun('run-test-004', 'csv', {
      outputDir: 'custom-exports',
    });
    console.log(`✅ Custom directory export successful: ${customFilepath}`);

    // Verify custom directory was created
    if (fs.existsSync('custom-exports')) {
      const files = fs.readdirSync('custom-exports');
      console.log(`   Custom directory files: ${files.length}`);
    }
  } catch (error) {
    console.error('❌ Custom directory export failed:', error);
  }

  console.log();

  // Test 5: Batch export
  console.log('5. Batch Export:');
  console.log('----------------');

  try {
    const runIds = ['run-batch-001', 'run-batch-002', 'run-batch-003'];
    const batchFilepaths = await exportMultipleRuns(runIds, 'csv', {
      outputDir: 'batch-exports',
    });

    console.log(
      `✅ Batch export successful: ${batchFilepaths.length}/${runIds.length} files`
    );
    batchFilepaths.forEach((filepath, index) => {
      console.log(`   ${index + 1}. ${path.basename(filepath)}`);
    });
  } catch (error) {
    console.error('❌ Batch export failed:', error);
  }

  console.log();

  // Test 6: List available runs
  console.log('6. List Available Runs:');
  console.log('-----------------------');

  try {
    const availableRuns = await listAvailableRuns();
    console.log(`✅ Found ${availableRuns.length} available runs:`);
    availableRuns.forEach((runId, index) => {
      console.log(`   ${index + 1}. ${runId}`);
    });
  } catch (error) {
    console.error('❌ List runs failed:', error);
  }

  console.log();

  // Test 7: Export statistics
  console.log('7. Export Statistics:');
  console.log('--------------------');

  try {
    const stats = await getExportStats('exports');
    console.log('✅ Export statistics:');
    console.log(`   Total files: ${stats.totalFiles}`);
    console.log(`   CSV files: ${stats.csvFiles}`);
    console.log(`   JSON files: ${stats.jsonFiles}`);
    console.log(`   Total size: ${stats.totalSize}`);
    console.log(`   Recent exports: ${stats.recentExports.length}`);

    if (stats.recentExports.length > 0) {
      console.log('   Recent files:');
      stats.recentExports.forEach((file, index) => {
        console.log(`     ${index + 1}. ${file}`);
      });
    }
  } catch (error) {
    console.error('❌ Export statistics failed:', error);
  }

  console.log();

  // Test 8: Error handling
  console.log('8. Error Handling:');
  console.log('------------------');

  try {
    // Test with invalid format
    await exportAuditRun('run-error-test', 'invalid' as any);
    console.log('❌ Should have failed with invalid format');
  } catch (error) {
    console.log('✅ Properly handled invalid format error');
  }

  console.log();

  // Test 9: File content validation
  console.log('9. File Content Validation:');
  console.log('---------------------------');

  try {
    // Export a test run
    const testFilepath = await exportAuditRun('run-content-test', 'csv');

    if (fs.existsSync(testFilepath)) {
      const content = fs.readFileSync(testFilepath, 'utf8');
      const lines = content.split('\n');

      console.log('✅ File content validation:');
      console.log(`   File: ${path.basename(testFilepath)}`);
      console.log(`   Total lines: ${lines.length}`);
      console.log(`   Has header: ${lines[0]?.includes('Audit Run ID')}`);
      console.log(`   Data rows: ${lines.length - 1}`);

      // Check CSV structure
      if (lines.length > 1) {
        const headerCount = lines[0].split(',').length;
        const dataRowCount = lines[1].split(',').length;
        console.log(`   Header columns: ${headerCount}`);
        console.log(`   Data columns: ${dataRowCount}`);
        console.log(`   Structure valid: ${headerCount === dataRowCount}`);
      }
    }
  } catch (error) {
    console.error('❌ Content validation failed:', error);
  }

  console.log();

  // Test 10: Performance test
  console.log('10. Performance Test:');
  console.log('--------------------');

  try {
    const startTime = Date.now();
    await exportAuditRun('run-performance-test', 'json');
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ Performance test completed in ${duration}ms`);
  } catch (error) {
    console.error('❌ Performance test failed:', error);
  }

  console.log();

  // Test 11: Different export formats comparison
  console.log('11. Format Comparison:');
  console.log('----------------------');

  try {
    const runId = 'run-format-comparison';

    // Export to CSV
    const csvStart = Date.now();
    const csvFilepath = await exportAuditRun(runId, 'csv');
    const csvDuration = Date.now() - csvStart;
    const csvSize = fs.existsSync(csvFilepath)
      ? fs.statSync(csvFilepath).size
      : 0;

    // Export to JSON
    const jsonStart = Date.now();
    const jsonFilepath = await exportAuditRun(runId, 'json');
    const jsonDuration = Date.now() - jsonStart;
    const jsonSize = fs.existsSync(jsonFilepath)
      ? fs.statSync(jsonFilepath).size
      : 0;

    console.log('✅ Format comparison:');
    console.log(`   CSV: ${csvDuration}ms, ${(csvSize / 1024).toFixed(2)} KB`);
    console.log(
      `   JSON: ${jsonDuration}ms, ${(jsonSize / 1024).toFixed(2)} KB`
    );
    console.log(`   Size ratio: ${(csvSize / jsonSize).toFixed(2)}x`);
  } catch (error) {
    console.error('❌ Format comparison failed:', error);
  }

  console.log();

  // Test 12: Cleanup and summary
  console.log('12. Cleanup and Summary:');
  console.log('------------------------');

  try {
    // Get final statistics
    const finalStats = await getExportStats('exports');
    const customStats = await getExportStats('custom-exports');
    const batchStats = await getExportStats('batch-exports');

    console.log('✅ Final export summary:');
    console.log(
      `   Main exports: ${finalStats.totalFiles} files (${finalStats.totalSize})`
    );
    console.log(
      `   Custom exports: ${customStats.totalFiles} files (${customStats.totalSize})`
    );
    console.log(
      `   Batch exports: ${batchStats.totalFiles} files (${batchStats.totalSize})`
    );

    const totalFiles =
      finalStats.totalFiles + customStats.totalFiles + batchStats.totalFiles;
    console.log(`   Total exports: ${totalFiles} files`);

    // List all export directories
    const directories = ['exports', 'custom-exports', 'batch-exports'];
    directories.forEach((dir) => {
      if (fs.existsSync(dir)) {
        const files = fs
          .readdirSync(dir)
          .filter((f) => f.startsWith('audit-run-'));
        console.log(`   ${dir}/: ${files.length} audit files`);
      }
    });
  } catch (error) {
    console.error('❌ Summary failed:', error);
  }

  console.log();
  console.log('=== Test Suite Complete ===');
  console.log('\nAll tests completed! 🎉');
  console.log('\nGenerated files are available in:');
  console.log('  - exports/');
  console.log('  - custom-exports/');
  console.log('  - batch-exports/');
}

// Run the tests
runTests().catch(console.error);
