/**
 * Arena Audit Notification System
 *
 * Provides Slack webhook-based notifications for critical audit findings
 * and system health monitoring.
 */

import logger from './logger';
import { config } from 'dotenv';
import {
  getAuditHealthMetrics,
  getStatusEmoji,
  getStatusText,
  getHealthScoreColor,
  getHealthScoreLabel,
  type AuditResult,
} from './audit-metrics';

// Load environment variables
config();

interface AuditSummary {
  auditRunId: string;
  totalSubmissions: number;
  passedCount: number;
  minorCount: number;
  majorCount: number;
  criticalCount: number;
  averageDeviation: number;
  criticalIssuesCount: number;
  status: 'completed' | 'failed';
  errorMessage?: string;
  duration?: number;
  skillBreakdown?: Record<
    string,
    {
      count: number;
      avgDeviation: number;
    }
  >;
}

interface SlackMessage {
  text: string;
  blocks?: any[];
  attachments?: any[];
}

interface SlackWebhookResponse {
  ok: boolean;
  error?: string;
}

/**
 * Send audit alert to Slack via webhook
 */
export async function sendSlackAuditAlert(
  summary: AuditSummary
): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    logger.warn(
      '⚠️ SLACK_WEBHOOK_URL not configured, skipping Slack notification'
    );
    return false;
  }

  try {
    // Convert summary to audit results format for metrics calculation
    const auditResults = convertSummaryToAuditResults(summary);

    // Calculate metrics using centralized utility
    const metrics = getAuditHealthMetrics(auditResults);

    // Determine if alert should be sent
    const shouldAlert = shouldSendAlert(metrics);

    if (!shouldAlert) {
      logger.info(
        '📊 Audit results within acceptable range, no Slack alert needed'
      );
      return true;
    }

    // Create Slack message
    const message = createAuditAlertMessage(summary, metrics);

    // Send to Slack
    const response = await sendSlackWebhook(webhookUrl, message);

    if (response.ok) {
      logger.info('✅ Slack audit alert sent successfully', {
        auditRunId: summary.auditRunId,
        criticalCount: metrics.criticalIssuesCount,
        averageDeviation: metrics.averageDeviation,
        healthScore: metrics.healthScore,
      });
      return true;
    } else {
      logger.error('❌ Slack webhook failed:', response.error);
      return false;
    }
  } catch (error) {
    logger.error('💥 Failed to send Slack audit alert:', error);
    return false;
  }
}

/**
 * Convert audit summary to audit results format for metrics calculation
 */
function convertSummaryToAuditResults(summary: AuditSummary): AuditResult[] {
  if (summary.status === 'failed') {
    return [];
  }

  const results: AuditResult[] = [];
  const totalSubmissions = summary.totalSubmissions;

  // Create dummy audit results based on summary counts
  // This is a simplified conversion - in practice, you'd have the actual results

  // Add passed submissions
  for (let i = 0; i < summary.passedCount; i++) {
    results.push({
      task_id: `dummy-${i}`,
      user_id: `dummy-user-${i}`,
      skill_area: 'unknown',
      original_score: 80,
      new_score: 82,
      deviation: 2,
      status: 'pass',
      critical_issue: false,
      timestamp: new Date().toISOString(),
      audit_run_id: summary.auditRunId,
    });
  }

  // Add minor submissions
  for (let i = 0; i < summary.minorCount; i++) {
    results.push({
      task_id: `dummy-minor-${i}`,
      user_id: `dummy-user-minor-${i}`,
      skill_area: 'unknown',
      original_score: 80,
      new_score: 72,
      deviation: 8,
      status: 'minor',
      critical_issue: false,
      timestamp: new Date().toISOString(),
      audit_run_id: summary.auditRunId,
    });
  }

  // Add major submissions
  for (let i = 0; i < summary.majorCount; i++) {
    results.push({
      task_id: `dummy-major-${i}`,
      user_id: `dummy-user-major-${i}`,
      skill_area: 'unknown',
      original_score: 80,
      new_score: 62,
      deviation: 18,
      status: 'major',
      critical_issue: false,
      timestamp: new Date().toISOString(),
      audit_run_id: summary.auditRunId,
    });
  }

  // Add critical submissions
  for (let i = 0; i < summary.criticalCount; i++) {
    results.push({
      task_id: `dummy-critical-${i}`,
      user_id: `dummy-user-critical-${i}`,
      skill_area: 'unknown',
      original_score: 80,
      new_score: 50,
      deviation: 30,
      status: 'critical',
      critical_issue: true,
      timestamp: new Date().toISOString(),
      audit_run_id: summary.auditRunId,
    });
  }

  return results;
}

/**
 * Determine if an alert should be sent based on audit metrics
 */
function shouldSendAlert(metrics: any): boolean {
  // Alert conditions based on centralized metrics:
  // 1. Critical status
  // 2. Major status with high deviation
  // 3. Low health score

  const criticalStatus = metrics.status === 'critical';
  const majorStatus = metrics.status === 'major';
  const lowHealthScore = metrics.healthScore < 60;
  const highDeviation = metrics.averageDeviation > 10;

  return criticalStatus || (majorStatus && highDeviation) || lowHealthScore;
}

/**
 * Create formatted Slack message for audit alert
 */
function createAuditAlertMessage(
  summary: AuditSummary,
  metrics: any
): SlackMessage {
  const baseUrl = process.env.FRONTEND_URL || 'https://cabe.ai';
  const auditUrl = `${baseUrl}/admin/arena-audit/run/${summary.auditRunId}`;

  // Use centralized utility functions
  const statusEmoji = getStatusEmoji(metrics.status);
  const statusText = getStatusText(metrics.status);
  const healthScoreColor = getHealthScoreColor(metrics.healthScore);
  const healthScoreLabel = getHealthScoreLabel(metrics.healthScore);

  const deviationEmoji = metrics.averageDeviation > 10 ? '📈' : '📊';
  const criticalEmoji = metrics.criticalIssuesCount > 0 ? '❗' : '✅';

  // Create main message text
  const messageText =
    `${statusEmoji} *Nightly Audit Alert* ${statusEmoji}\n` +
    `• Run ID: \`${summary.auditRunId}\`\n` +
    `• Deviation: ${metrics.averageDeviation.toFixed(1)} ${deviationEmoji}\n` +
    `• Critical Issues: ${metrics.criticalIssuesCount} ${criticalEmoji}\n` +
    `• Health Score: ${metrics.healthScore} (${healthScoreLabel})\n` +
    `• Status: ${statusText}`;

  // Create rich message blocks
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${statusEmoji} Arena Nightly Audit Alert ${statusEmoji}`,
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Run ID:*\n\`${summary.auditRunId}\``,
        },
        {
          type: 'mrkdwn',
          text: `*Status:*\n${statusText}`,
        },
        {
          type: 'mrkdwn',
          text: `*Total Submissions:*\n${metrics.summary.totalResults}`,
        },
        {
          type: 'mrkdwn',
          text: `*Average Deviation:*\n${metrics.averageDeviation.toFixed(1)} points`,
        },
        {
          type: 'mrkdwn',
          text: `*Critical Issues:*\n${metrics.criticalIssuesCount}`,
        },
        {
          type: 'mrkdwn',
          text: `*Health Score:*\n${metrics.healthScore} (${healthScoreLabel})`,
        },
      ],
    },
  ];

  // Add breakdown section
  blocks.push({
    type: 'section',
    fields: [
      {
        type: 'mrkdwn',
        text: `*Results Breakdown:*\n${metrics.summary.passedCount} ✅ ${metrics.summary.minorCount} ⚠️ ${metrics.summary.majorCount} 🔶 ${metrics.summary.criticalCount} ❗`,
      },
      {
        type: 'mrkdwn',
        text: `*Deviation Ranges:*\n≤5: ${metrics.breakdown.percentages.within5}%\n≤10: ${metrics.breakdown.percentages.within10}%\n≤15: ${metrics.breakdown.percentages.within15}%\n>15: ${metrics.breakdown.percentages.over15}%`,
      },
    ],
  });

  // Add skill breakdown if available
  if (
    summary.skillBreakdown &&
    Object.keys(summary.skillBreakdown).length > 0
  ) {
    const skillFields = Object.entries(summary.skillBreakdown).map(
      ([skill, stats]) => ({
        type: 'mrkdwn',
        text: `*${skill.toUpperCase()}:*\n${stats.count} submissions, ${stats.avgDeviation.toFixed(1)} avg deviation`,
      })
    );

    blocks.push({
      type: 'section',
      fields: skillFields.slice(0, 4), // Limit to 4 fields per section
    });
  }

  // Add error message if audit failed
  if (summary.status === 'failed' && summary.errorMessage) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Error:*\n\`\`\`${summary.errorMessage}\`\`\``,
        emoji: true,
      },
    });
  }

  // Add action button
  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'View Full Report',
          emoji: true,
        },
        url: auditUrl,
        style: metrics.status === 'critical' ? 'danger' : 'primary',
      },
    ],
  });

  // Add timestamp
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `Audit completed at ${new Date().toLocaleString()}`,
        emoji: true,
      },
    ],
  });

  return {
    text: messageText,
    blocks,
  };
}

/**
 * Send message to Slack via webhook
 */
async function sendSlackWebhook(
  webhookUrl: string,
  message: SlackMessage
): Promise<SlackWebhookResponse> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        ok: false,
        error: `HTTP ${response.status}: ${errorText}`,
      };
    }

    const result = await response.text();

    // Slack returns "ok" for successful webhooks
    if (result === 'ok') {
      return { ok: true };
    } else {
      return {
        ok: false,
        error: `Unexpected response: ${result}`,
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send audit completion summary (non-alert)
 */
export async function sendAuditSummary(
  summary: AuditSummary
): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    logger.info('📊 SLACK_WEBHOOK_URL not configured, skipping audit summary');
    return false;
  }

  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://cabe.ai';
    const auditUrl = `${baseUrl}/admin/arena-audit/run/${summary.auditRunId}`;

    const message: SlackMessage = {
      text:
        `📊 *Arena Audit Complete*\n` +
        `• Run ID: \`${summary.auditRunId}\`\n` +
        `• Submissions: ${summary.totalSubmissions}\n` +
        `• Passed: ${summary.passedCount} ✅\n` +
        `• Minor: ${summary.minorCount} ⚠️\n` +
        `• Major: ${summary.majorCount} 🔶\n` +
        `• Critical: ${summary.criticalCount} ❗\n` +
        `• Avg Deviation: ${summary.averageDeviation.toFixed(1)} points\n` +
        `• Duration: ${summary.duration ? `${summary.duration}ms` : 'N/A'}\n` +
        `• <${auditUrl}|View Full Report>`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text:
              `📊 *Arena Nightly Audit Complete*\n` +
              `Run ID: \`${summary.auditRunId}\``,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Results:*\n${summary.passedCount} ✅ ${summary.minorCount} ⚠️ ${summary.majorCount} 🔶 ${summary.criticalCount} ❗`,
            },
            {
              type: 'mrkdwn',
              text: `*Metrics:*\n${summary.averageDeviation.toFixed(1)} avg deviation\n${summary.totalSubmissions} total`,
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Report',
                emoji: true,
              },
              url: auditUrl,
            },
          ],
        },
      ],
    };

    const response = await sendSlackWebhook(webhookUrl, message);

    if (response.ok) {
      logger.info('✅ Audit summary sent to Slack');
      return true;
    } else {
      logger.error('❌ Failed to send audit summary to Slack:', response.error);
      return false;
    }
  } catch (error) {
    logger.error('💥 Failed to send audit summary:', error);
    return false;
  }
}

/**
 * Send system health check notification
 */
export async function sendHealthCheck(
  status: 'healthy' | 'warning' | 'critical',
  message: string
): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    logger.info('📊 SLACK_WEBHOOK_URL not configured, skipping health check');
    return false;
  }

  try {
    const emoji =
      status === 'healthy' ? '✅' : status === 'warning' ? '⚠️' : '🚨';
    const color =
      status === 'healthy'
        ? 'good'
        : status === 'warning'
          ? 'warning'
          : 'danger';

    const slackMessage: SlackMessage = {
      text: `${emoji} *Arena System Health Check*\n${message}`,
      attachments: [
        {
          color,
          text: message,
          footer: 'Arena Audit System',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    const response = await sendSlackWebhook(webhookUrl, slackMessage);

    if (response.ok) {
      logger.info('✅ Health check notification sent to Slack');
      return true;
    } else {
      logger.error('❌ Failed to send health check to Slack:', response.error);
      return false;
    }
  } catch (error) {
    logger.error('💥 Failed to send health check notification:', error);
    return false;
  }
}

/**
 * Test Slack webhook connectivity
 */
export async function testSlackWebhook(): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    logger.warn('⚠️ SLACK_WEBHOOK_URL not configured');
    return false;
  }

  try {
    const testMessage: SlackMessage = {
      text: '🧪 *Arena Audit System Test*\nThis is a test message to verify Slack webhook connectivity.',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🧪 *Arena Audit System Test*\nThis is a test message to verify Slack webhook connectivity.',
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Test sent at ${new Date().toLocaleString()}`,
            },
          ],
        },
      ],
    };

    const response = await sendSlackWebhook(webhookUrl, testMessage);

    if (response.ok) {
      logger.info('✅ Slack webhook test successful');
      return true;
    } else {
      logger.error('❌ Slack webhook test failed:', response.error);
      return false;
    }
  } catch (error) {
    logger.error('💥 Slack webhook test error:', error);
    return false;
  }
}
