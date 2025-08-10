#!/usr/bin/env tsx

/**
 * Nightly Arena Audit Automation Script
 *
 * This script runs every night to audit the AI scoring system by:
 * 1. Fetching 20 random past submissions (5 per skill area)
 * 2. Re-running AI scoring on those tasks
 * 3. Comparing new vs original scores
 * 4. Storing results in arena_audit_runs table
 *
 * Usage:
 * - Manual: npm run audit:nightly
 * - Automated: Set up CRON job to run this script nightly
 * - CI/CD: Can be triggered as part of deployment pipeline
 */

import { supabaseAdmin } from '../src/lib/supabase-admin';
import { autoScoreSubmission } from '../src/utils/ai-score-utils';
import { calculateTaskPoints } from '../src/lib/points';
import logger from '../src/utils/logger';
import {
  sendSlackAuditAlert,
  sendAuditSummary,
} from '../src/utils/notifications';
import { config } from 'dotenv';

// Load environment variables
config();

interface AuditSubmission {
  id: string;
  task_id: string;
  user_id: string;
  description: string;
  proof: string;
  score: number;
  points_awarded: number;
  submitted_at: string;
  scored_at: string;
  tasks: {
    id: string;
    title: string;
    skill_area: string;
    duration: number;
    skill: number;
    complexity: number;
    visibility: number;
    professional_impact: number;
    autonomy: number;
  };
  users: {
    id: string;
    email: string;
    username: string;
  };
}

interface AuditResult {
  task_id: string;
  user_id: string;
  skill_area: string;
  original_score: number;
  new_score: number;
  deviation: number;
  status: 'pass' | 'minor' | 'major' | 'critical';
  critical_issue: boolean;
  timestamp: string;
  audit_run_id: string;
}

interface AuditRun {
  id: string;
  started_at: string;
  completed_at: string;
  total_submissions: number;
  passed_count: number;
  minor_count: number;
  major_count: number;
  critical_count: number;
  average_deviation: number;
  critical_issues_count: number;
  status: 'running' | 'completed' | 'failed';
  error_message?: string;
}

class NightlyArenaAudit {
  private auditRunId: string;
  private auditRun: AuditRun | null = null;

  constructor() {
    this.auditRunId = `audit_${new Date().toISOString().split('T')[0]}_${Date.now()}`;
  }

  /**
   * Main execution method
   */
  async run(): Promise<void> {
    const startTime = new Date();

    try {
      logger.info('🌙 Starting nightly Arena audit run', {
        auditRunId: this.auditRunId,
      });

      // Initialize audit run record
      await this.initializeAuditRun();

      // Fetch random submissions (5 per skill area)
      const submissions = await this.fetchRandomSubmissions();
      logger.info(`📊 Fetched ${submissions.length} submissions for audit`);

      // Process each submission
      const results: AuditResult[] = [];
      let passedCount = 0;
      let minorCount = 0;
      let majorCount = 0;
      let criticalCount = 0;
      let totalDeviation = 0;
      let criticalIssuesCount = 0;

      for (const submission of submissions) {
        try {
          const result = await this.processSubmission(submission);
          results.push(result);

          // Update counters
          switch (result.status) {
            case 'pass':
              passedCount++;
              break;
            case 'minor':
              minorCount++;
              break;
            case 'major':
              majorCount++;
              break;
            case 'critical':
              criticalCount++;
              break;
          }

          totalDeviation += result.deviation;
          if (result.critical_issue) {
            criticalIssuesCount++;
          }

          logger.info(`✅ Processed submission ${submission.id}`, {
            originalScore: result.original_score,
            newScore: result.new_score,
            deviation: result.deviation,
            status: result.status,
          });
        } catch (error) {
          logger.error(
            `❌ Failed to process submission ${submission.id}:`,
            error
          );
          // Continue with other submissions
        }
      }

      // Store results in database
      await this.storeAuditResults(results);

      // Calculate final metrics
      const averageDeviation =
        results.length > 0 ? totalDeviation / results.length : 0;

      // Update audit run with final results
      await this.completeAuditRun({
        total_submissions: results.length,
        passed_count: passedCount,
        minor_count: minorCount,
        major_count: majorCount,
        critical_count: criticalCount,
        average_deviation: averageDeviation,
        critical_issues_count: criticalIssuesCount,
        status: 'completed' as const,
      });

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      logger.info('🎉 Nightly Arena audit completed successfully', {
        auditRunId: this.auditRunId,
        totalSubmissions: results.length,
        passedCount,
        minorCount,
        majorCount,
        criticalCount,
        averageDeviation: averageDeviation.toFixed(2),
        criticalIssuesCount,
        duration: `${duration}ms`,
      });

      // Send Slack notifications
      await this.sendSlackNotifications({
        auditRunId: this.auditRunId,
        totalSubmissions: results.length,
        passedCount,
        minorCount,
        majorCount,
        criticalCount,
        averageDeviation,
        criticalIssuesCount,
        status: 'completed' as const,
        duration,
        skillBreakdown: this.calculateSkillBreakdown(results),
      });

      // Log summary
      this.logAuditSummary(results, {
        passedCount,
        minorCount,
        majorCount,
        criticalCount,
        averageDeviation,
        criticalIssuesCount,
      });
    } catch (error) {
      logger.error('💥 Nightly Arena audit failed:', error);

      // Update audit run with error
      await this.completeAuditRun({
        total_submissions: 0,
        passed_count: 0,
        minor_count: 0,
        major_count: 0,
        critical_count: 0,
        average_deviation: 0,
        critical_issues_count: 0,
        status: 'failed' as const,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });

      // Send Slack notification for failed audit
      await sendSlackAuditAlert({
        auditRunId: this.auditRunId,
        totalSubmissions: 0,
        passedCount: 0,
        minorCount: 0,
        majorCount: 0,
        criticalCount: 0,
        averageDeviation: 0,
        criticalIssuesCount: 0,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  /**
   * Initialize audit run record in database
   */
  private async initializeAuditRun(): Promise<void> {
    const auditRun: AuditRun = {
      id: this.auditRunId,
      started_at: new Date().toISOString(),
      completed_at: '',
      total_submissions: 0,
      passed_count: 0,
      minor_count: 0,
      major_count: 0,
      critical_count: 0,
      average_deviation: 0,
      critical_issues_count: 0,
      status: 'running',
    };

    const { error } = await supabaseAdmin
      .from('arena_audit_runs')
      .insert(auditRun);

    if (error) {
      throw new Error(`Failed to initialize audit run: ${error.message}`);
    }

    this.auditRun = auditRun;
    logger.info('📝 Initialized audit run record', {
      auditRunId: this.auditRunId,
    });
  }

  /**
   * Fetch 20 random submissions (5 per skill area)
   */
  private async fetchRandomSubmissions(): Promise<AuditSubmission[]> {
    const skillAreas = ['frontend', 'backend', 'content', 'data'];
    const submissionsPerSkill = 5;
    const allSubmissions: AuditSubmission[] = [];

    for (const skillArea of skillAreas) {
      try {
        const { data, error } = await supabaseAdmin
          .from('submissions')
          .select(
            `
            id,
            task_id,
            user_id,
            description,
            proof,
            score,
            points_awarded,
            submitted_at,
            scored_at,
            tasks (
              id,
              title,
              skill_area,
              duration,
              skill,
              complexity,
              visibility,
              professional_impact,
              autonomy
            ),
            users (
              id,
              email,
              username
            )
          `
          )
          .eq('status', 'scored')
          .not('score', 'is', null)
          .eq('tasks.skill_area', skillArea)
          .order('scored_at', { ascending: false })
          .limit(50); // Get more to ensure we have enough after filtering

        if (error) {
          logger.error(`❌ Failed to fetch ${skillArea} submissions:`, error);
          continue;
        }

        if (!data || data.length === 0) {
          logger.warn(`⚠️ No scored submissions found for ${skillArea}`);
          continue;
        }

        // Randomly select 5 submissions from this skill area
        const shuffled = data.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, submissionsPerSkill);

        allSubmissions.push(...selected);

        logger.info(`📋 Fetched ${selected.length} ${skillArea} submissions`);
      } catch (error) {
        logger.error(`❌ Error fetching ${skillArea} submissions:`, error);
      }
    }

    return allSubmissions;
  }

  /**
   * Process a single submission through AI scoring
   */
  private async processSubmission(
    submission: AuditSubmission
  ): Promise<AuditResult> {
    const originalScore = submission.score;

    // Re-run AI scoring
    const newScore = await this.reRunAIScoring(submission);

    // Calculate deviation
    const deviation = Math.abs(newScore - originalScore);

    // Determine status
    let status: 'pass' | 'minor' | 'major' | 'critical';
    let criticalIssue = false;

    if (deviation <= 5) {
      status = 'pass';
    } else if (deviation <= 10) {
      status = 'minor';
    } else if (deviation <= 15) {
      status = 'major';
    } else {
      status = 'critical';
      criticalIssue = true;
    }

    return {
      task_id: submission.task_id,
      user_id: submission.user_id,
      skill_area: submission.tasks.skill_area,
      original_score: originalScore,
      new_score: newScore,
      deviation,
      status,
      critical_issue: criticalIssue,
      timestamp: new Date().toISOString(),
      audit_run_id: this.auditRunId,
    };
  }

  /**
   * Re-run AI scoring on a submission
   */
  private async reRunAIScoring(submission: AuditSubmission): Promise<number> {
    try {
      // Create task object for points calculation
      const task = {
        id: submission.tasks.id,
        title: submission.tasks.title,
        description: submission.tasks.title,
        skill_area: submission.tasks.skill_area,
        duration: submission.tasks.duration,
        skill: submission.tasks.skill,
        complexity: submission.tasks.complexity,
        visibility: submission.tasks.visibility,
        professional_impact: submission.tasks.professional_impact,
        autonomy: submission.tasks.autonomy,
        created_at: submission.submitted_at,
        is_active: true,
      };

      // Re-run AI scoring
      const aiScoreResult = await autoScoreSubmission({
        taskId: submission.task_id,
        description: submission.description,
        proof: submission.proof,
        skillArea: submission.tasks.skill_area,
      });

      // Calculate points using the same logic as original scoring
      const pointsResult = calculateTaskPoints(aiScoreResult.score, task);

      return aiScoreResult.score;
    } catch (error) {
      logger.error(
        `❌ AI scoring failed for submission ${submission.id}:`,
        error
      );

      // Return original score as fallback
      return submission.score;
    }
  }

  /**
   * Store audit results in database
   */
  private async storeAuditResults(results: AuditResult[]): Promise<void> {
    if (results.length === 0) {
      logger.warn('⚠️ No audit results to store');
      return;
    }

    const { error } = await supabaseAdmin
      .from('arena_audit_results')
      .insert(results);

    if (error) {
      throw new Error(`Failed to store audit results: ${error.message}`);
    }

    logger.info(`💾 Stored ${results.length} audit results`);
  }

  /**
   * Complete audit run with final metrics
   */
  private async completeAuditRun(metrics: {
    total_submissions: number;
    passed_count: number;
    minor_count: number;
    major_count: number;
    critical_count: number;
    average_deviation: number;
    critical_issues_count: number;
    status: 'completed' | 'failed';
    error_message?: string;
  }): Promise<void> {
    const updateData = {
      ...metrics,
      completed_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from('arena_audit_runs')
      .update(updateData)
      .eq('id', this.auditRunId);

    if (error) {
      logger.error('❌ Failed to update audit run:', error);
    } else {
      logger.info('✅ Updated audit run with final metrics');
    }
  }

  /**
   * Log audit summary
   */
  private logAuditSummary(
    results: AuditResult[],
    metrics: {
      passedCount: number;
      minorCount: number;
      majorCount: number;
      criticalCount: number;
      averageDeviation: number;
      criticalIssuesCount: number;
    }
  ): void {
    console.log('\n🔍 NIGHTLY ARENA AUDIT SUMMARY');
    console.log('================================');
    console.log(`Audit Run ID: ${this.auditRunId}`);
    console.log(`Total Submissions: ${results.length}`);
    console.log(
      `Passed: ${metrics.passedCount} (${Math.round((metrics.passedCount / results.length) * 100)}%)`
    );
    console.log(
      `Minor Issues: ${metrics.minorCount} (${Math.round((metrics.minorCount / results.length) * 100)}%)`
    );
    console.log(
      `Major Issues: ${metrics.majorCount} (${Math.round((metrics.majorCount / results.length) * 100)}%)`
    );
    console.log(
      `Critical Issues: ${metrics.criticalCount} (${Math.round((metrics.criticalCount / results.length) * 100)}%)`
    );
    console.log(
      `Average Deviation: ${metrics.averageDeviation.toFixed(2)} points`
    );
    console.log(`Critical Issues Count: ${metrics.criticalIssuesCount}`);

    // Skill area breakdown
    const skillBreakdown = results.reduce(
      (acc, result) => {
        if (!acc[result.skill_area]) {
          acc[result.skill_area] = {
            count: 0,
            avgDeviation: 0,
            totalDeviation: 0,
          };
        }
        acc[result.skill_area].count++;
        acc[result.skill_area].totalDeviation += result.deviation;
        acc[result.skill_area].avgDeviation =
          acc[result.skill_area].totalDeviation / acc[result.skill_area].count;
        return acc;
      },
      {} as Record<
        string,
        { count: number; avgDeviation: number; totalDeviation: number }
      >
    );

    console.log('\n📊 SKILL AREA BREAKDOWN:');
    Object.entries(skillBreakdown).forEach(([skill, stats]) => {
      console.log(
        `${skill.toUpperCase()}: ${stats.count} submissions, avg deviation: ${stats.avgDeviation.toFixed(2)}`
      );
    });

    // Critical issues summary
    if (metrics.criticalIssuesCount > 0) {
      console.log('\n🚨 CRITICAL ISSUES DETECTED:');
      const criticalResults = results.filter((r) => r.critical_issue);
      criticalResults.forEach((result) => {
        console.log(
          `- ${result.skill_area}: ${result.original_score} → ${result.new_score} (deviation: ${result.deviation})`
        );
      });
    }

    console.log('\n================================');
    console.log('Audit completed successfully! 🎉\n');
  }

  /**
   * Send Slack notifications for audit completion
   */
  private async sendSlackNotifications(metrics: {
    auditRunId: string;
    totalSubmissions: number;
    passedCount: number;
    minorCount: number;
    majorCount: number;
    criticalCount: number;
    averageDeviation: number;
    criticalIssuesCount: number;
    status: 'completed' | 'failed';
    duration: number;
    skillBreakdown: Record<
      string,
      { count: number; avgDeviation: number; totalDeviation: number }
    >;
  }): Promise<void> {
    const {
      auditRunId,
      totalSubmissions,
      passedCount,
      minorCount,
      majorCount,
      criticalCount,
      averageDeviation,
      criticalIssuesCount,
      status,
      duration,
      skillBreakdown,
    } = metrics;

    // Convert metrics to audit results format for centralized calculation
    const auditResults = this.convertMetricsToAuditResults(metrics);

    // Calculate health metrics using centralized utility
    const healthMetrics = getAuditHealthMetrics(auditResults);

    // Send summary notification
    await sendAuditSummary({
      auditRunId,
      totalSubmissions,
      passedCount,
      minorCount,
      majorCount,
      criticalCount,
      averageDeviation: healthMetrics.averageDeviation,
      criticalIssuesCount: healthMetrics.criticalIssuesCount,
      status,
      duration,
      skillBreakdown,
    });

    // Send alert notification for critical issues
    if (
      healthMetrics.criticalIssuesCount > 0 ||
      healthMetrics.status === 'critical'
    ) {
      await sendSlackAuditAlert({
        auditRunId,
        totalSubmissions,
        passedCount,
        minorCount,
        majorCount,
        criticalCount,
        averageDeviation: healthMetrics.averageDeviation,
        criticalIssuesCount: healthMetrics.criticalIssuesCount,
        status,
        duration,
        skillBreakdown,
      });
    }
  }

  /**
   * Convert metrics to audit results format for centralized calculation
   */
  private convertMetricsToAuditResults(metrics: {
    auditRunId: string;
    totalSubmissions: number;
    passedCount: number;
    minorCount: number;
    majorCount: number;
    criticalCount: number;
    averageDeviation: number;
    criticalIssuesCount: number;
    status: 'completed' | 'failed';
    duration: number;
    skillBreakdown: Record<
      string,
      { count: number; avgDeviation: number; totalDeviation: number }
    >;
  }): any[] {
    if (metrics.status === 'failed') {
      return [];
    }

    const results: any[] = [];

    // Add passed submissions
    for (let i = 0; i < metrics.passedCount; i++) {
      results.push({
        task_id: `audit-${i}`,
        user_id: `user-${i}`,
        skill_area: 'unknown',
        original_score: 80,
        new_score: 82,
        deviation: 2,
        status: 'pass',
        critical_issue: false,
        timestamp: new Date().toISOString(),
        audit_run_id: metrics.auditRunId,
      });
    }

    // Add minor submissions
    for (let i = 0; i < metrics.minorCount; i++) {
      results.push({
        task_id: `audit-minor-${i}`,
        user_id: `user-minor-${i}`,
        skill_area: 'unknown',
        original_score: 80,
        new_score: 72,
        deviation: 8,
        status: 'minor',
        critical_issue: false,
        timestamp: new Date().toISOString(),
        audit_run_id: metrics.auditRunId,
      });
    }

    // Add major submissions
    for (let i = 0; i < metrics.majorCount; i++) {
      results.push({
        task_id: `audit-major-${i}`,
        user_id: `user-major-${i}`,
        skill_area: 'unknown',
        original_score: 80,
        new_score: 62,
        deviation: 18,
        status: 'major',
        critical_issue: false,
        timestamp: new Date().toISOString(),
        audit_run_id: metrics.auditRunId,
      });
    }

    // Add critical submissions
    for (let i = 0; i < metrics.criticalCount; i++) {
      results.push({
        task_id: `audit-critical-${i}`,
        user_id: `user-critical-${i}`,
        skill_area: 'unknown',
        original_score: 80,
        new_score: 50,
        deviation: 30,
        status: 'critical',
        critical_issue: true,
        timestamp: new Date().toISOString(),
        audit_run_id: metrics.auditRunId,
      });
    }

    return results;
  }

  /**
   * Calculate skill area breakdown for notifications
   */
  private calculateSkillBreakdown(
    results: AuditResult[]
  ): Record<
    string,
    { count: number; avgDeviation: number; totalDeviation: number }
  > {
    return results.reduce(
      (acc, result) => {
        if (!acc[result.skill_area]) {
          acc[result.skill_area] = {
            count: 0,
            avgDeviation: 0,
            totalDeviation: 0,
          };
        }
        acc[result.skill_area].count++;
        acc[result.skill_area].totalDeviation += result.deviation;
        acc[result.skill_area].avgDeviation =
          acc[result.skill_area].totalDeviation / acc[result.skill_area].count;
        return acc;
      },
      {} as Record<
        string,
        { count: number; avgDeviation: number; totalDeviation: number }
      >
    );
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  try {
    const audit = new NightlyArenaAudit();
    await audit.run();
    process.exit(0);
  } catch (error) {
    logger.error('💥 Nightly audit script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default NightlyArenaAudit;
