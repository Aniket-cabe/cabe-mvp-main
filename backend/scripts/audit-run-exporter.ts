#!/usr/bin/env node

/**
 * Audit Run Exporter
 *
 * Exports complete audit run data to CSV or JSON format
 * for admin reports, offline analysis, or evidence backups.
 */

import * as fs from 'fs';
import * as path from 'path';

// Types
interface AuditRun {
  id: string;
  reviewer: string;
  startedAt: string;
  completedAt: string;
  taskTitle: string;
  taskDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  skillArea: string;
  status: 'completed' | 'failed' | 'running';
  totalSubmissions: number;
  averageDeviation: number;
  criticalFlags: number;
  results: AuditResult[];
}

interface AuditResult {
  id: string;
  submissionId: string;
  userId: string;
  userScore: number;
  aiScore: number;
  deviation: number;
  deviationType: 'none' | 'minor' | 'major' | 'critical';
  suggestedAction: 'allow' | 'flag_for_review' | 'escalate' | 'override';
  actionTaken?: 'allow' | 'flag_for_review' | 'escalate' | 'override';
  taskTitle: string;
  skillArea: string;
  taskDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  timestamp: string;
  reviewer?: string;
  notes?: string;
}

interface ExportOptions {
  runId: string;
  format: 'csv' | 'json';
  outputDir?: string;
  includeMetadata?: boolean;
  flattenResults?: boolean;
}

interface CSVRow {
  'Audit Run ID': string;
  'Submission ID': string;
  'User ID': string;
  'Task Title': string;
  'Skill Area': string;
  Difficulty: string;
  'User Score': number;
  'AI Score': number;
  Deviation: number;
  'Deviation Type': string;
  'Suggested Action': string;
  'Action Taken': string;
  Reviewer: string;
  Timestamp: string;
  Notes: string;
  'Audit Status': string;
  'Total Submissions': number;
  'Average Deviation': number;
  'Critical Flags': number;
  'Audit Started': string;
  'Audit Completed': string;
}

// Dummy data generator
function generateDummyAuditRun(runId: string): AuditRun {
  const baseTime = new Date('2024-01-15T10:00:00Z');

  const results: AuditResult[] = [
    {
      id: 'result-1',
      submissionId: 'sub-001',
      userId: 'user-123',
      userScore: 85,
      aiScore: 78,
      deviation: 7,
      deviationType: 'minor',
      suggestedAction: 'flag_for_review',
      actionTaken: 'allow',
      taskTitle: 'Build Machine Learning Model',
      skillArea: 'ai-ml',
      taskDifficulty: 'medium',
      timestamp: new Date(baseTime.getTime() + 15 * 60000).toISOString(),
      reviewer: 'admin-1',
      notes: 'Code quality exceeds AI assessment',
    },
    {
      id: 'result-2',
      submissionId: 'sub-002',
      userId: 'user-456',
      userScore: 92,
      aiScore: 45,
      deviation: 47,
      deviationType: 'critical',
      suggestedAction: 'escalate',
      actionTaken: 'override',
      taskTitle: 'Deploy Application to Cloud',
      skillArea: 'cloud-devops',
      taskDifficulty: 'medium',
      timestamp: new Date(baseTime.getTime() + 30 * 60000).toISOString(),
      reviewer: 'admin-1',
      notes: 'Critical deviation requires manual review',
    },
    {
      id: 'result-3',
      submissionId: 'sub-003',
      userId: 'user-789',
      userScore: 88,
      aiScore: 87,
      deviation: 1,
      deviationType: 'none',
      suggestedAction: 'allow',
      actionTaken: 'allow',
      taskTitle: 'Create Data Analysis Dashboard',
      skillArea: 'data-analytics',
      taskDifficulty: 'medium',
      timestamp: new Date(baseTime.getTime() + 45 * 60000).toISOString(),
      reviewer: 'admin-1',
    },
    {
      id: 'result-4',
      submissionId: 'sub-004',
      userId: 'user-101',
      userScore: 75,
      aiScore: 82,
      deviation: 7,
      deviationType: 'minor',
      suggestedAction: 'flag_for_review',
      actionTaken: 'flag_for_review',
      taskTitle: 'Full-Stack E-commerce Platform',
      skillArea: 'fullstack-dev',
      taskDifficulty: 'medium',
      timestamp: new Date(baseTime.getTime() + 60 * 60000).toISOString(),
      reviewer: 'admin-1',
      notes: 'Score discrepancy flagged for verification',
    },
    {
      id: 'result-5',
      submissionId: 'sub-005',
      userId: 'user-202',
      userScore: 95,
      aiScore: 35,
      deviation: 60,
      deviationType: 'critical',
      suggestedAction: 'escalate',
      actionTaken: 'escalate',
      taskTitle: 'Implement Neural Network',
      skillArea: 'ai-ml',
      taskDifficulty: 'medium',
      timestamp: new Date(baseTime.getTime() + 75 * 60000).toISOString(),
      reviewer: 'admin-1',
      notes: 'Critical deviation escalated to senior review',
    },
    {
      id: 'result-6',
      submissionId: 'sub-006',
      userId: 'user-303',
      userScore: 82,
      aiScore: 79,
      deviation: 3,
      deviationType: 'none',
      suggestedAction: 'allow',
      actionTaken: 'allow',
      taskTitle: 'Set up Kubernetes Cluster',
      skillArea: 'cloud-devops',
      taskDifficulty: 'medium',
      timestamp: new Date(baseTime.getTime() + 90 * 60000).toISOString(),
      reviewer: 'admin-1',
    },
    {
      id: 'result-7',
      submissionId: 'sub-007',
      userId: 'user-404',
      userScore: 78,
      aiScore: 85,
      deviation: 7,
      deviationType: 'minor',
      suggestedAction: 'flag_for_review',
      actionTaken: 'flag_for_review',
      taskTitle: 'Data Pipeline Development',
      skillArea: 'data-analytics',
      taskDifficulty: 'medium',
      timestamp: new Date(baseTime.getTime() + 105 * 60000).toISOString(),
      reviewer: 'admin-1',
      notes: 'Minor discrepancy noted',
    },
    {
      id: 'result-8',
      submissionId: 'sub-008',
      userId: 'user-505',
      userScore: 90,
      aiScore: 88,
      deviation: 2,
      deviationType: 'none',
      suggestedAction: 'allow',
      actionTaken: 'allow',
      taskTitle: 'Microservices Architecture',
      skillArea: 'fullstack-dev',
      taskDifficulty: 'medium',
      timestamp: new Date(baseTime.getTime() + 120 * 60000).toISOString(),
      reviewer: 'admin-1',
    },
  ];

  const totalDeviation = results.reduce(
    (sum, result) => sum + result.deviation,
    0
  );
  const criticalFlags = results.filter(
    (result) => result.deviationType === 'critical'
  ).length;

  return {
    id: runId,
    reviewer: 'admin-1',
    startedAt: baseTime.toISOString(),
    completedAt: new Date(baseTime.getTime() + 150 * 60000).toISOString(),
    taskTitle: 'Build Machine Learning Model',
    taskDifficulty: 'medium',
    skillArea: 'ai-ml',
    status: 'completed',
    totalSubmissions: results.length,
    averageDeviation: totalDeviation / results.length,
    criticalFlags,
    results,
  };
}

// Fetch audit run (dummy implementation)
async function fetchAuditRun(runId: string): Promise<AuditRun> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // For now, generate dummy data
  // In real implementation, this would fetch from database
  return generateDummyAuditRun(runId);
}

// Convert audit run to CSV format
function convertToCSV(auditRun: AuditRun): string {
  const csvRows: CSVRow[] = auditRun.results.map((result) => ({
    'Audit Run ID': auditRun.id,
    'Submission ID': result.submissionId,
    'User ID': result.userId,
    'Task Title': result.taskTitle,
    'Skill Area': result.skillArea,
    Difficulty: result.taskDifficulty,
    'User Score': result.userScore,
    'AI Score': result.aiScore,
    Deviation: result.deviation,
    'Deviation Type': result.deviationType,
    'Suggested Action': result.suggestedAction,
    'Action Taken': result.actionTaken || result.suggestedAction,
    Reviewer: result.reviewer || auditRun.reviewer,
    Timestamp: result.timestamp,
    Notes: result.notes || '',
    'Audit Status': auditRun.status,
    'Total Submissions': auditRun.totalSubmissions,
    'Average Deviation': Math.round(auditRun.averageDeviation * 100) / 100,
    'Critical Flags': auditRun.criticalFlags,
    'Audit Started': auditRun.startedAt,
    'Audit Completed': auditRun.completedAt,
  }));

  // Generate CSV header
  const headers = Object.keys(csvRows[0]);
  const csvHeader = headers.join(',');

  // Generate CSV rows
  const csvData = csvRows.map((row) =>
    headers
      .map((header) => {
        const value = row[header as keyof CSVRow];
        // Escape commas and quotes in CSV values
        if (
          typeof value === 'string' &&
          (value.includes(',') || value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(',')
  );

  return [csvHeader, ...csvData].join('\n');
}

// Convert audit run to JSON format
function convertToJSON(auditRun: AuditRun, options: ExportOptions): string {
  if (options.flattenResults) {
    // Flattened format: array of submission records with audit metadata
    const flattenedResults = auditRun.results.map((result) => ({
      auditRunId: auditRun.id,
      auditReviewer: auditRun.reviewer,
      auditStartedAt: auditRun.startedAt,
      auditCompletedAt: auditRun.completedAt,
      auditStatus: auditRun.status,
      auditTotalSubmissions: auditRun.totalSubmissions,
      auditAverageDeviation: auditRun.averageDeviation,
      auditCriticalFlags: auditRun.criticalFlags,
      ...result,
    }));

    return JSON.stringify(flattenedResults, null, 2);
  } else {
    // Nested format: full audit run object
    return JSON.stringify(auditRun, null, 2);
  }
}

// Ensure exports directory exists
function ensureExportsDirectory(outputDir: string): void {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created exports directory: ${outputDir}`);
  }
}

// Main export function
export async function exportAuditRun(
  runId: string,
  format: 'csv' | 'json',
  options: Partial<ExportOptions> = {}
): Promise<string> {
  const {
    outputDir = 'exports',
    includeMetadata = true,
    flattenResults = false,
  } = options;

  console.log(`🔄 Exporting audit run: ${runId} (${format.toUpperCase()})`);

  try {
    // 1. Fetch audit run data
    console.log('📥 Fetching audit run data...');
    const auditRun = await fetchAuditRun(runId);
    console.log(`✅ Fetched ${auditRun.results.length} submissions`);

    // 2. Ensure output directory exists
    ensureExportsDirectory(outputDir);

    // 3. Convert data to requested format
    let exportData: string;
    let fileExtension: string;

    if (format === 'csv') {
      exportData = convertToCSV(auditRun);
      fileExtension = 'csv';
      console.log('📊 Converted to CSV format');
    } else {
      exportData = convertToJSON(auditRun, { runId, format, flattenResults });
      fileExtension = 'json';
      console.log('📄 Converted to JSON format');
    }

    // 4. Generate filename
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .split('T')[0];
    const filename = `audit-run-${runId}-${timestamp}.${fileExtension}`;
    const filepath = path.join(outputDir, filename);

    // 5. Write to file
    fs.writeFileSync(filepath, exportData, 'utf8');
    console.log(`💾 Exported to: ${filepath}`);

    // 6. Generate summary
    const fileSize = fs.statSync(filepath).size;
    const summary = {
      runId: auditRun.id,
      format,
      filename,
      filepath,
      fileSize: `${(fileSize / 1024).toFixed(2)} KB`,
      submissions: auditRun.results.length,
      status: auditRun.status,
      averageDeviation: auditRun.averageDeviation.toFixed(2),
      criticalFlags: auditRun.criticalFlags,
    };

    console.log('📋 Export Summary:');
    console.log(`   Run ID: ${summary.runId}`);
    console.log(`   Format: ${summary.format.toUpperCase()}`);
    console.log(`   File: ${summary.filename}`);
    console.log(`   Size: ${summary.fileSize}`);
    console.log(`   Submissions: ${summary.submissions}`);
    console.log(`   Status: ${summary.status}`);
    console.log(`   Avg Deviation: ${summary.averageDeviation}`);
    console.log(`   Critical Flags: ${summary.criticalFlags}`);

    return filepath;
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  }
}

// CLI argument parser
function parseCLIArgs(): {
  runId?: string;
  format?: 'csv' | 'json';
  help?: boolean;
} {
  const args = process.argv.slice(2);
  const parsed: any = {};

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else if (arg.startsWith('--runId=')) {
      parsed.runId = arg.split('=')[1];
    } else if (arg.startsWith('--format=')) {
      const format = arg.split('=')[1].toLowerCase();
      if (format === 'csv' || format === 'json') {
        parsed.format = format;
      }
    }
  }

  return parsed;
}

// CLI function
async function cli(): Promise<void> {
  const args = parseCLIArgs();

  if (args.help) {
    console.log(`
Audit Run Exporter - CaBE Arena

Usage:
  npx ts-node scripts/audit-run-exporter.ts --runId=<runId> --format=<format>

Options:
  --runId=<runId>     Audit run ID to export (required)
  --format=<format>   Export format: csv or json (required)
  --help, -h         Show this help message

Examples:
  npx ts-node scripts/audit-run-exporter.ts --runId=run-001 --format=csv
  npx ts-node scripts/audit-run-exporter.ts --runId=run-002 --format=json

Output:
  Files are saved to exports/ directory with timestamp
  CSV: audit-run-<runId>-<date>.csv
  JSON: audit-run-<runId>-<date>.json
`);
    return;
  }

  if (!args.runId) {
    console.error('❌ Error: --runId is required');
    console.log('Use --help for usage information');
    process.exit(1);
  }

  if (!args.format) {
    console.error('❌ Error: --format is required (csv or json)');
    console.log('Use --help for usage information');
    process.exit(1);
  }

  try {
    const filepath = await exportAuditRun(args.runId, args.format);
    console.log(`\n🎉 Export completed successfully!`);
    console.log(`📁 File: ${filepath}`);
  } catch (error) {
    console.error('\n💥 Export failed:', error);
    process.exit(1);
  }
}

// Batch export function for multiple runs
export async function exportMultipleRuns(
  runIds: string[],
  format: 'csv' | 'json',
  options: Partial<ExportOptions> = {}
): Promise<string[]> {
  console.log(
    `🔄 Batch exporting ${runIds.length} audit runs (${format.toUpperCase()})`
  );

  const results: string[] = [];

  for (const runId of runIds) {
    try {
      const filepath = await exportAuditRun(runId, format, options);
      results.push(filepath);
    } catch (error) {
      console.error(`❌ Failed to export ${runId}:`, error);
    }
  }

  console.log(
    `\n📊 Batch export completed: ${results.length}/${runIds.length} successful`
  );
  return results;
}

// Utility function to list available audit runs
export async function listAvailableRuns(): Promise<string[]> {
  // In real implementation, this would query the database
  // For now, return dummy run IDs
  return ['run-001', 'run-002', 'run-003', 'run-004', 'run-005'];
}

// Utility function to get export statistics
export async function getExportStats(outputDir: string = 'exports'): Promise<{
  totalFiles: number;
  csvFiles: number;
  jsonFiles: number;
  totalSize: string;
  recentExports: string[];
}> {
  if (!fs.existsSync(outputDir)) {
    return {
      totalFiles: 0,
      csvFiles: 0,
      jsonFiles: 0,
      totalSize: '0 KB',
      recentExports: [],
    };
  }

  const files = fs
    .readdirSync(outputDir)
    .filter((file) => file.startsWith('audit-run-'))
    .map((file) => ({
      name: file,
      path: path.join(outputDir, file),
      stats: fs.statSync(path.join(outputDir, file)),
    }))
    .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

  const csvFiles = files.filter((f) => f.name.endsWith('.csv')).length;
  const jsonFiles = files.filter((f) => f.name.endsWith('.json')).length;
  const totalSize = files.reduce((sum, f) => sum + f.stats.size, 0);
  const recentExports = files.slice(0, 5).map((f) => f.name);

  return {
    totalFiles: files.length,
    csvFiles,
    jsonFiles,
    totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
    recentExports,
  };
}

// Run CLI if this file is executed directly
if (require.main === module) {
  cli().catch(console.error);
}

// Export all functions for programmatic use
export default {
  exportAuditRun,
  exportMultipleRuns,
  listAvailableRuns,
  getExportStats,
  cli,
};
