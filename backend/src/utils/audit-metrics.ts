/**
 * Arena Audit Metrics Utility
 *
 * Centralized functions for calculating audit health metrics and statistics
 * used across dashboard, Slack notifications, and reporting.
 */

export interface AuditResult {
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

export interface AuditHealthMetrics {
  averageDeviation: number;
  status: 'pass' | 'minor' | 'major' | 'critical';
  breakdown: {
    counts: {
      within5: number;
      within10: number;
      within15: number;
      over15: number;
    };
    percentages: {
      within5: number;
      within10: number;
      within15: number;
      over15: number;
    };
  };
  healthScore: number;
  criticalIssuesCount: number;
  summary: {
    totalResults: number;
    passedCount: number;
    minorCount: number;
    majorCount: number;
    criticalCount: number;
  };
  skillBreakdown: Record<
    string,
    {
      count: number;
      avgDeviation: number;
      totalDeviation: number;
    }
  >;
}

/**
 * Calculate comprehensive audit health metrics from audit results
 */
export function getAuditHealthMetrics(
  results: AuditResult[]
): AuditHealthMetrics {
  if (!results || results.length === 0) {
    return {
      averageDeviation: 0,
      status: 'pass',
      breakdown: {
        counts: { within5: 0, within10: 0, within15: 0, over15: 0 },
        percentages: { within5: 0, within10: 0, within15: 0, over15: 0 },
      },
      healthScore: 100,
      criticalIssuesCount: 0,
      summary: {
        totalResults: 0,
        passedCount: 0,
        minorCount: 0,
        majorCount: 0,
        criticalCount: 0,
      },
      skillBreakdown: {},
    };
  }

  const totalResults = results.length;

  // Calculate summary counts
  const passedCount = results.filter((r) => r.status === 'pass').length;
  const minorCount = results.filter((r) => r.status === 'minor').length;
  const majorCount = results.filter((r) => r.status === 'major').length;
  const criticalCount = results.filter((r) => r.status === 'critical').length;

  // Calculate average deviation
  const totalDeviation = results.reduce(
    (sum, result) => sum + result.deviation,
    0
  );
  const averageDeviation = totalDeviation / totalResults;

  // Calculate breakdown by deviation ranges
  const within5 = results.filter((r) => r.deviation <= 5).length;
  const within10 = results.filter((r) => r.deviation <= 10).length;
  const within15 = results.filter((r) => r.deviation <= 15).length;
  const over15 = results.filter((r) => r.deviation > 15).length;

  // Calculate percentages
  const percentages = {
    within5: Math.round((within5 / totalResults) * 100),
    within10: Math.round((within10 / totalResults) * 100),
    within15: Math.round((within15 / totalResults) * 100),
    over15: Math.round((over15 / totalResults) * 100),
  };

  // Calculate critical issues count
  const criticalIssuesCount = results.filter((r) => r.critical_issue).length;

  // Calculate overall status
  const status = calculateOverallStatus({
    criticalCount,
    majorCount,
    averageDeviation,
    totalResults,
  });

  // Calculate health score (0-100)
  const healthScore = calculateHealthScore({
    averageDeviation,
    criticalCount,
    majorCount,
    totalResults,
    within5,
    within10,
  });

  // Calculate skill area breakdown
  const skillBreakdown = calculateSkillBreakdown(results);

  return {
    averageDeviation: Math.round(averageDeviation * 100) / 100,
    status,
    breakdown: {
      counts: { within5, within10, within15, over15 },
      percentages,
    },
    healthScore,
    criticalIssuesCount,
    summary: {
      totalResults,
      passedCount,
      minorCount,
      majorCount,
      criticalCount,
    },
    skillBreakdown,
  };
}

/**
 * Calculate overall audit status based on metrics
 */
function calculateOverallStatus(params: {
  criticalCount: number;
  majorCount: number;
  averageDeviation: number;
  totalResults: number;
}): 'pass' | 'minor' | 'major' | 'critical' {
  const { criticalCount, majorCount, averageDeviation, totalResults } = params;

  // Critical status: any critical issues or very high deviation
  if (criticalCount > 0 || averageDeviation > 15) {
    return 'critical';
  }

  // Major status: high deviation or many major issues
  if (averageDeviation > 10 || majorCount > totalResults * 0.2) {
    return 'major';
  }

  // Minor status: moderate deviation
  if (averageDeviation > 5 || majorCount > 0) {
    return 'minor';
  }

  // Pass status: low deviation, no major issues
  return 'pass';
}

/**
 * Calculate health score (0-100) based on audit metrics
 */
function calculateHealthScore(params: {
  averageDeviation: number;
  criticalCount: number;
  majorCount: number;
  totalResults: number;
  within5: number;
  within10: number;
}): number {
  const {
    averageDeviation,
    criticalCount,
    majorCount,
    totalResults,
    within5,
    within10,
  } = params;

  // Base score starts at 100
  let score = 100;

  // Penalize for critical issues (severe penalty)
  score -= criticalCount * 20;

  // Penalize for major issues (moderate penalty)
  score -= majorCount * 10;

  // Penalize for high average deviation
  if (averageDeviation > 10) {
    score -= (averageDeviation - 10) * 2;
  } else if (averageDeviation > 5) {
    score -= (averageDeviation - 5) * 1;
  }

  // Bonus for good consistency (high percentage within 5 points)
  const within5Percentage = (within5 / totalResults) * 100;
  if (within5Percentage >= 80) {
    score += 5;
  } else if (within5Percentage >= 60) {
    score += 2;
  }

  // Bonus for overall consistency (high percentage within 10 points)
  const within10Percentage = (within10 / totalResults) * 100;
  if (within10Percentage >= 90) {
    score += 3;
  }

  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calculate skill area breakdown from audit results
 */
function calculateSkillBreakdown(results: AuditResult[]): Record<
  string,
  {
    count: number;
    avgDeviation: number;
    totalDeviation: number;
  }
> {
  return results.reduce(
    (acc, result) => {
      const skill = result.skill_area;

      if (!acc[skill]) {
        acc[skill] = { count: 0, avgDeviation: 0, totalDeviation: 0 };
      }

      acc[skill].count++;
      acc[skill].totalDeviation += result.deviation;
      acc[skill].avgDeviation = acc[skill].totalDeviation / acc[skill].count;

      return acc;
    },
    {} as Record<
      string,
      { count: number; avgDeviation: number; totalDeviation: number }
    >
  );
}

/**
 * Get status emoji based on audit status
 */
export function getStatusEmoji(
  status: 'pass' | 'minor' | 'major' | 'critical'
): string {
  switch (status) {
    case 'critical':
      return '🚨';
    case 'major':
      return '⚠️';
    case 'minor':
      return '🔶';
    case 'pass':
      return '✅';
    default:
      return '📊';
  }
}

/**
 * Get status text based on audit status
 */
export function getStatusText(
  status: 'pass' | 'minor' | 'major' | 'critical'
): string {
  switch (status) {
    case 'critical':
      return '🔴 Immediate Action Required';
    case 'major':
      return '🟡 Review Recommended';
    case 'minor':
      return '🟠 Monitor Closely';
    case 'pass':
      return '🟢 All Clear';
    default:
      return '📊 Normal';
  }
}

/**
 * Get health score color based on score value
 */
export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  if (score >= 40) return 'orange';
  return 'red';
}

/**
 * Get health score label based on score value
 */
export function getHealthScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Fair';
  if (score >= 60) return 'Poor';
  return 'Critical';
}

/**
 * Calculate trend analysis from multiple audit runs
 */
export function calculateAuditTrend(
  auditRuns: Array<{
    averageDeviation: number;
    healthScore: number;
    criticalCount: number;
    timestamp: string;
  }>
): {
  trend: 'improving' | 'stable' | 'declining';
  averageDeviationTrend: number;
  healthScoreTrend: number;
  criticalIssuesTrend: number;
} {
  if (auditRuns.length < 2) {
    return {
      trend: 'stable',
      averageDeviationTrend: 0,
      healthScoreTrend: 0,
      criticalIssuesTrend: 0,
    };
  }

  // Sort by timestamp (newest first)
  const sortedRuns = auditRuns.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Get recent (last 3) and older (previous 3) runs
  const recentRuns = sortedRuns.slice(0, Math.min(3, sortedRuns.length));
  const olderRuns = sortedRuns.slice(3, Math.min(6, sortedRuns.length));

  if (olderRuns.length === 0) {
    return {
      trend: 'stable',
      averageDeviationTrend: 0,
      healthScoreTrend: 0,
      criticalIssuesTrend: 0,
    };
  }

  // Calculate averages for recent and older runs
  const recentAvgDeviation =
    recentRuns.reduce((sum, run) => sum + run.averageDeviation, 0) /
    recentRuns.length;
  const olderAvgDeviation =
    olderRuns.reduce((sum, run) => sum + run.averageDeviation, 0) /
    olderRuns.length;

  const recentAvgHealthScore =
    recentRuns.reduce((sum, run) => sum + run.healthScore, 0) /
    recentRuns.length;
  const olderAvgHealthScore =
    olderRuns.reduce((sum, run) => sum + run.healthScore, 0) / olderRuns.length;

  const recentAvgCriticalIssues =
    recentRuns.reduce((sum, run) => sum + run.criticalCount, 0) /
    recentRuns.length;
  const olderAvgCriticalIssues =
    olderRuns.reduce((sum, run) => sum + run.criticalCount, 0) /
    olderRuns.length;

  // Calculate trends
  const averageDeviationTrend = recentAvgDeviation - olderAvgDeviation;
  const healthScoreTrend = recentAvgHealthScore - olderAvgHealthScore;
  const criticalIssuesTrend = recentAvgCriticalIssues - olderAvgCriticalIssues;

  // Determine overall trend
  let improvingFactors = 0;
  let decliningFactors = 0;

  if (averageDeviationTrend < 0) improvingFactors++;
  else if (averageDeviationTrend > 0) decliningFactors++;

  if (healthScoreTrend > 0) improvingFactors++;
  else if (healthScoreTrend < 0) decliningFactors++;

  if (criticalIssuesTrend < 0) improvingFactors++;
  else if (criticalIssuesTrend > 0) decliningFactors++;

  let trend: 'improving' | 'stable' | 'declining';
  if (improvingFactors > decliningFactors) {
    trend = 'improving';
  } else if (decliningFactors > improvingFactors) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }

  return {
    trend,
    averageDeviationTrend: Math.round(averageDeviationTrend * 100) / 100,
    healthScoreTrend: Math.round(healthScoreTrend * 100) / 100,
    criticalIssuesTrend: Math.round(criticalIssuesTrend * 100) / 100,
  };
}
