/**
 * Integration Example: Deviation Analyzer with Existing Audit System
 *
 * Demonstrates how to integrate the Deviation Analyzer with the existing
 * CaBE Arena audit infrastructure for enhanced scoring analysis.
 */

import {
  analyzeDeviation,
  batchAnalyzeDeviations,
  DeviationAnalysisInput,
} from '../src/utils/deviation-analyzer';
import { runScoringAudit, printAuditReport } from '../src/utils/scoring-audit';
import { getAuditHealthMetrics } from '../src/utils/audit-metrics';
import logger from '../src/utils/logger';

/**
 * Enhanced audit system that includes deviation analysis
 */
export async function runEnhancedAudit() {
  console.log('🚀 CABE ARENA ENHANCED AUDIT WITH DEVIATION ANALYSIS');
  console.log('===================================================\n');

  try {
    // Step 1: Run the standard scoring audit
    console.log('📊 Step 1: Running Standard Scoring Audit...');
    const auditResult = await runScoringAudit();

    // Step 2: Convert audit results to deviation analysis inputs
    console.log('🔄 Step 2: Converting Results for Deviation Analysis...');
    const deviationInputs = convertAuditResultsToDeviationInputs(
      auditResult.results
    );

    // Step 3: Run deviation analysis on flagged submissions
    console.log('🔍 Step 3: Running Deviation Analysis...');
    const deviationResults = await analyzeFlaggedSubmissions(deviationInputs);

    // Step 4: Generate enhanced report
    console.log('📋 Step 4: Generating Enhanced Report...');
    await generateEnhancedReport(auditResult, deviationResults);

    console.log('\n✅ Enhanced audit completed successfully!');
  } catch (error) {
    console.error('❌ Enhanced audit failed:', error);
    throw error;
  }
}

/**
 * Convert audit results to deviation analysis inputs
 */
function convertAuditResultsToDeviationInputs(
  auditResults: any[]
): DeviationAnalysisInput[] {
  return auditResults.map((result) => ({
    taskTitle: result.submissionId,
    taskDifficulty: determineDifficultyFromScore(result.expectedScore),
    skillArea: result.skill as any,
    userSubmittedScore: result.expectedScore,
    aiAuditScore: result.actualScore,
    // Note: In a real implementation, you would fetch the actual code and proof
    // from the database using the submission ID
    userCode: `// Code for ${result.submissionId} would be fetched from database`,
    userProof: `// Proof for ${result.submissionId} would be fetched from database`,
    taskDescription: `Task description for ${result.submissionId}`,
    submissionContext: {
      timeSpent: Math.floor(Math.random() * 120) + 30, // Mock data
      codeLength: Math.floor(Math.random() * 1000) + 100, // Mock data
      complexity: determineComplexityFromScore(result.expectedScore),
    },
  }));
}

/**
 * Determine task difficulty based on expected score
 */
function determineDifficultyFromScore(
  score: number
): 'easy' | 'medium' | 'hard' | 'expert' {
  if (score < 40) return 'easy';
  if (score < 70) return 'medium';
  if (score < 90) return 'hard';
  return 'expert';
}

/**
 * Determine complexity based on score
 */
function determineComplexityFromScore(
  score: number
): 'low' | 'medium' | 'high' {
  if (score < 50) return 'low';
  if (score < 80) return 'medium';
  return 'high';
}

/**
 * Analyze only submissions that have significant deviations
 */
async function analyzeFlaggedSubmissions(
  inputs: DeviationAnalysisInput[]
): Promise<{
  flaggedResults: any[];
  summary: {
    totalAnalyzed: number;
    deviationsFound: number;
    criticalIssues: number;
    averageDeviation: number;
  };
}> {
  const flaggedResults: any[] = [];
  let totalDeviation = 0;
  let criticalCount = 0;

  console.log(`\n🔍 Analyzing ${inputs.length} submissions for deviations...`);

  for (const input of inputs) {
    const deviation = Math.abs(input.userSubmittedScore - input.aiAuditScore);

    // Only analyze submissions with significant deviations (> 5 points)
    if (deviation > 5) {
      try {
        const result = await analyzeDeviation(input);
        flaggedResults.push({
          ...result,
          originalInput: input,
        });

        totalDeviation += result.deviationMagnitude;
        if (result.deviationType === 'critical') {
          criticalCount++;
        }

        // Log significant findings
        if (
          result.deviationType === 'major' ||
          result.deviationType === 'critical'
        ) {
          console.log(
            `⚠️ ${result.deviationType.toUpperCase()} deviation detected: ${input.taskTitle}`
          );
          console.log(
            `   User: ${input.userSubmittedScore}/100 | AI: ${input.aiAuditScore}/100 | Diff: ${deviation} points`
          );
          console.log(`   Action: ${result.suggestedAction}`);
        }
      } catch (error) {
        logger.error(
          `Failed to analyze deviation for ${input.taskTitle}:`,
          error
        );
      }
    }
  }

  return {
    flaggedResults,
    summary: {
      totalAnalyzed: inputs.length,
      deviationsFound: flaggedResults.length,
      criticalIssues: criticalCount,
      averageDeviation:
        flaggedResults.length > 0 ? totalDeviation / flaggedResults.length : 0,
    },
  };
}

/**
 * Generate enhanced audit report with deviation analysis
 */
async function generateEnhancedReport(auditResult: any, deviationResults: any) {
  console.log('\n📊 ENHANCED AUDIT REPORT');
  console.log('========================\n');

  // Original audit summary
  console.log('📈 ORIGINAL AUDIT SUMMARY');
  console.log(`Total Tests: ${auditResult.summary.totalTests}`);
  console.log(
    `Passed: ${auditResult.summary.passed} (${Math.round((auditResult.summary.passed / auditResult.summary.totalTests) * 100)}%)`
  );
  console.log(
    `Failed: ${auditResult.summary.failed} (${Math.round((auditResult.summary.failed / auditResult.summary.totalTests) * 100)}%)`
  );
  console.log(
    `Average Deviation: ${auditResult.summary.averageDeviation.toFixed(2)} points\n`
  );

  // Deviation analysis summary
  console.log('🔍 DEVIATION ANALYSIS SUMMARY');
  console.log(
    `Submissions Analyzed: ${deviationResults.summary.totalAnalyzed}`
  );
  console.log(
    `Significant Deviations Found: ${deviationResults.summary.deviationsFound}`
  );
  console.log(`Critical Issues: ${deviationResults.summary.criticalIssues}`);
  console.log(
    `Average Deviation Magnitude: ${deviationResults.summary.averageDeviation.toFixed(2)} points\n`
  );

  // Deviation type breakdown
  const deviationTypes = deviationResults.flaggedResults.reduce(
    (acc: any, result: any) => {
      acc[result.deviationType] = (acc[result.deviationType] || 0) + 1;
      return acc;
    },
    {}
  );

  console.log('📊 DEVIATION TYPE BREAKDOWN');
  Object.entries(deviationTypes).forEach(([type, count]) => {
    console.log(`${type.toUpperCase()}: ${count} submissions`);
  });
  console.log();

  // Action recommendations
  const actions = deviationResults.flaggedResults.reduce(
    (acc: any, result: any) => {
      acc[result.suggestedAction] = (acc[result.suggestedAction] || 0) + 1;
      return acc;
    },
    {}
  );

  console.log('🎯 RECOMMENDED ACTIONS');
  Object.entries(actions).forEach(([action, count]) => {
    console.log(
      `${action.replace('_', ' ').toUpperCase()}: ${count} submissions`
    );
  });
  console.log();

  // Critical issues requiring immediate attention
  if (deviationResults.summary.criticalIssues > 0) {
    console.log('🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION');
    console.log('='.repeat(55));

    deviationResults.flaggedResults
      .filter((result: any) => result.deviationType === 'critical')
      .forEach((result: any, index: number) => {
        console.log(`\n${index + 1}. ${result.originalInput.taskTitle}`);
        console.log(
          `   Skill Area: ${result.originalInput.skillArea.toUpperCase()}`
        );
        console.log(
          `   Difficulty: ${result.originalInput.taskDifficulty.toUpperCase()}`
        );
        console.log(
          `   User Score: ${result.originalInput.userSubmittedScore}/100`
        );
        console.log(`   AI Score: ${result.originalInput.aiAuditScore}/100`);
        console.log(`   Deviation: ${result.deviationMagnitude} points`);
        console.log(`   Risk Factors: ${result.riskFactors.join(', ')}`);
        console.log(`   Reasoning: ${result.reasoning.substring(0, 150)}...`);
      });
  }

  // Skill area analysis
  console.log('\n🎯 SKILL AREA ANALYSIS');
  console.log('='.repeat(25));

  const skillAnalysis = deviationResults.flaggedResults.reduce(
    (acc: any, result: any) => {
      const skill = result.originalInput.skillArea;
      if (!acc[skill]) {
        acc[skill] = { count: 0, totalDeviation: 0, criticalCount: 0 };
      }
      acc[skill].count++;
      acc[skill].totalDeviation += result.deviationMagnitude;
      if (result.deviationType === 'critical') {
        acc[skill].criticalCount++;
      }
      return acc;
    },
    {}
  );

  Object.entries(skillAnalysis).forEach(([skill, data]: [string, any]) => {
    const avgDeviation = data.totalDeviation / data.count;
    console.log(`${skill.toUpperCase()}:`);
    console.log(`  Submissions with deviations: ${data.count}`);
    console.log(`  Average deviation: ${avgDeviation.toFixed(2)} points`);
    console.log(`  Critical issues: ${data.criticalCount}`);
  });

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('='.repeat(20));

  const recommendations: string[] = [];

  if (deviationResults.summary.criticalIssues > 0) {
    recommendations.push(
      'Immediately review all critical deviations to identify systemic scoring issues'
    );
  }

  if (deviationResults.summary.averageDeviation > 15) {
    recommendations.push(
      'Consider adjusting AI scoring criteria to reduce variance'
    );
  }

  const majorDeviations = deviationResults.flaggedResults.filter(
    (r: any) => r.deviationType === 'major'
  ).length;
  if (majorDeviations > 5) {
    recommendations.push(
      'Implement additional human review for submissions with major deviations'
    );
  }

  // Skill area specific recommendations
  Object.entries(skillAnalysis).forEach(([skill, data]: [string, any]) => {
    if (data.criticalCount > 0) {
      recommendations.push(
        `Review scoring criteria for ${skill} tasks to address critical deviations`
      );
    }
  });

  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('Enhanced audit report completed! 🎉');
}

/**
 * Run batch analysis on all submissions
 */
async function runBatchDeviationAnalysis() {
  console.log('\n🔍 RUNNING BATCH DEVIATION ANALYSIS');
  console.log('===================================\n');

  try {
    // Get audit results
    const auditResult = await runScoringAudit();
    const deviationInputs = convertAuditResultsToDeviationInputs(
      auditResult.results
    );

    // Run batch analysis
    const batchResult = await batchAnalyzeDeviations(deviationInputs);

    console.log('📊 BATCH ANALYSIS RESULTS');
    console.log(`Total Submissions: ${batchResult.results.length}`);

    // Deviation distribution
    const deviationCounts = batchResult.results.reduce(
      (acc: any, result: any) => {
        acc[result.deviationType] = (acc[result.deviationType] || 0) + 1;
        return acc;
      },
      {}
    );

    console.log('\n📈 Deviation Distribution:');
    Object.entries(deviationCounts).forEach(([type, count]) => {
      const percentage = (
        ((count as number) / batchResult.results.length) *
        100
      ).toFixed(1);
      console.log(`${type.toUpperCase()}: ${count} (${percentage}%)`);
    });

    // Critical issues
    if (batchResult.patterns.criticalIssues.length > 0) {
      console.log('\n🚨 Critical Issues:');
      batchResult.patterns.criticalIssues.forEach((issue) => {
        console.log(`• ${issue}`);
      });
    }

    // Average deviation
    const avgDeviation =
      batchResult.results.reduce(
        (sum, result) => sum + result.deviationMagnitude,
        0
      ) / batchResult.results.length;
    console.log(`\n📊 Average Deviation: ${avgDeviation.toFixed(2)} points`);
  } catch (error) {
    console.error('❌ Batch analysis failed:', error);
  }
}

/**
 * Main integration runner
 */
async function main() {
  console.log('🚀 CABE ARENA DEVIATION ANALYZER INTEGRATION');
  console.log('============================================\n');

  try {
    // Run enhanced audit
    await runEnhancedAudit();

    // Run batch analysis
    await runBatchDeviationAnalysis();

    console.log('\n✅ Integration test completed successfully!');
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  runEnhancedAudit,
  runBatchDeviationAnalysis,
  convertAuditResultsToDeviationInputs,
  analyzeFlaggedSubmissions,
  generateEnhancedReport,
};
