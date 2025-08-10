/**
 * Audit Insight Engine
 *
 * Analyzes audit runs and returns smart insights, patterns, and performance signals
 * for use in dashboards and reports.
 */

// Types for audit run data
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

// Types for insight results
interface AuditInsightsResult {
  // Basic metrics
  deviationBreakdown: {
    none: number;
    minor: number;
    major: number;
    critical: number;
  };
  actionDistribution: {
    allow: number;
    flag_for_review: number;
    escalate: number;
    override: number;
  };
  averageDeviation: number;
  maxDeviation: number;
  minDeviation: number;

  // Critical analysis
  criticalSubmissions: string[];
  flagsTriggered: number;
  overrideCount: number;

  // Quality assessment
  reviewQuality: 'excellent' | 'good' | 'fair' | 'poor';
  qualityScore: number; // 0-100

  // Pattern detection
  notablePatterns: string[];
  skillAreaAnalysis: SkillAreaInsight[];
  difficultyAnalysis: DifficultyInsight[];

  // Performance signals
  performanceSignals: PerformanceSignal[];
  riskIndicators: RiskIndicator[];

  // Summary
  insightSummary: string[];
  recommendations: string[];

  // Metadata
  analysisTimestamp: string;
  totalSubmissions: number;
  analysisDuration: number;
}

interface SkillAreaInsight {
  skillArea: string;
  submissionCount: number;
  averageDeviation: number;
  criticalCount: number;
  qualityRating: 'excellent' | 'good' | 'fair' | 'poor';
  notableTrend: string;
}

interface DifficultyInsight {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  submissionCount: number;
  averageDeviation: number;
  criticalCount: number;
  qualityRating: 'excellent' | 'good' | 'fair' | 'poor';
  notableTrend: string;
}

interface PerformanceSignal {
  type: 'positive' | 'warning' | 'critical';
  message: string;
  impact: 'low' | 'medium' | 'high';
  data?: any;
}

interface RiskIndicator {
  type: 'score_inflation' | 'ai_bias' | 'reviewer_pattern' | 'skill_gap';
  severity: 'low' | 'medium' | 'high';
  description: string;
  evidence: string[];
  affectedSubmissions: string[];
}

// Quality thresholds
const QUALITY_THRESHOLDS = {
  excellent: { maxAvgDeviation: 8, maxCriticalRate: 0.05 },
  good: { maxAvgDeviation: 15, maxCriticalRate: 0.15 },
  fair: { maxAvgDeviation: 25, maxCriticalRate: 0.25 },
  poor: { maxAvgDeviation: Infinity, maxCriticalRate: 1.0 },
};

// Risk thresholds
const RISK_THRESHOLDS = {
  scoreInflation: { minDeviation: 30, minUserScore: 85 },
  aiBias: { minDeviation: 25, maxAiScore: 50 },
  reviewerOverride: { minOverrideRate: 0.3 },
  skillGap: { minCriticalRate: 0.4 },
};

/**
 * Generate comprehensive insights from an audit run
 */
export function generateAuditInsights(auditRun: AuditRun): AuditInsightsResult {
  const startTime = Date.now();

  // Basic calculations
  const deviationBreakdown = calculateDeviationBreakdown(auditRun.results);
  const actionDistribution = calculateActionDistribution(auditRun.results);
  const deviationStats = calculateDeviationStats(auditRun.results);
  const criticalSubmissions = getCriticalSubmissions(auditRun.results);
  const flagsTriggered = countFlagsTriggered(auditRun.results);
  const overrideCount = countOverrides(auditRun.results);

  // Quality assessment
  const reviewQuality = assessReviewQuality(
    deviationStats.average,
    deviationBreakdown.critical,
    auditRun.totalSubmissions
  );
  const qualityScore = calculateQualityScore(
    deviationStats.average,
    deviationBreakdown.critical,
    auditRun.totalSubmissions
  );

  // Pattern analysis
  const skillAreaAnalysis = analyzeSkillAreas(auditRun.results);
  const difficultyAnalysis = analyzeDifficulties(auditRun.results);
  const notablePatterns = detectNotablePatterns(
    auditRun,
    skillAreaAnalysis,
    difficultyAnalysis
  );

  // Performance and risk analysis
  const performanceSignals = generatePerformanceSignals(
    auditRun,
    deviationStats,
    deviationBreakdown
  );
  const riskIndicators = detectRiskIndicators(
    auditRun.results,
    deviationStats,
    actionDistribution
  );

  // Summary and recommendations
  const insightSummary = generateInsightSummary(
    auditRun,
    reviewQuality,
    deviationStats,
    criticalSubmissions
  );
  const recommendations = generateRecommendations(
    reviewQuality,
    riskIndicators,
    performanceSignals
  );

  const analysisDuration = Date.now() - startTime;

  return {
    // Basic metrics
    deviationBreakdown,
    actionDistribution,
    averageDeviation: deviationStats.average,
    maxDeviation: deviationStats.max,
    minDeviation: deviationStats.min,

    // Critical analysis
    criticalSubmissions,
    flagsTriggered,
    overrideCount,

    // Quality assessment
    reviewQuality,
    qualityScore,

    // Pattern detection
    notablePatterns,
    skillAreaAnalysis,
    difficultyAnalysis,

    // Performance signals
    performanceSignals,
    riskIndicators,

    // Summary
    insightSummary,
    recommendations,

    // Metadata
    analysisTimestamp: new Date().toISOString(),
    totalSubmissions: auditRun.totalSubmissions,
    analysisDuration,
  };
}

/**
 * Calculate deviation breakdown by type
 */
function calculateDeviationBreakdown(
  results: AuditResult[]
): AuditInsightsResult['deviationBreakdown'] {
  return results.reduce(
    (acc, result) => {
      acc[result.deviationType]++;
      return acc;
    },
    { none: 0, minor: 0, major: 0, critical: 0 }
  );
}

/**
 * Calculate action distribution
 */
function calculateActionDistribution(
  results: AuditResult[]
): AuditInsightsResult['actionDistribution'] {
  return results.reduce(
    (acc, result) => {
      const action = result.actionTaken || result.suggestedAction;
      acc[action]++;
      return acc;
    },
    { allow: 0, flag_for_review: 0, escalate: 0, override: 0 }
  );
}

/**
 * Calculate deviation statistics
 */
function calculateDeviationStats(results: AuditResult[]): {
  average: number;
  max: number;
  min: number;
  median: number;
} {
  const deviations = results.map((r) => r.deviation).sort((a, b) => a - b);
  const sum = deviations.reduce((acc, val) => acc + val, 0);
  const average = sum / deviations.length;
  const max = Math.max(...deviations);
  const min = Math.min(...deviations);
  const median = deviations[Math.floor(deviations.length / 2)];

  return { average, max, min, median };
}

/**
 * Get list of critical submission IDs
 */
function getCriticalSubmissions(results: AuditResult[]): string[] {
  return results
    .filter((result) => result.deviationType === 'critical')
    .map((result) => result.submissionId);
}

/**
 * Count flag and escalate actions
 */
function countFlagsTriggered(results: AuditResult[]): number {
  return results.filter(
    (result) =>
      result.suggestedAction === 'flag_for_review' ||
      result.suggestedAction === 'escalate'
  ).length;
}

/**
 * Count override actions
 */
function countOverrides(results: AuditResult[]): number {
  return results.filter((result) => result.actionTaken === 'override').length;
}

/**
 * Assess review quality based on deviation metrics
 */
function assessReviewQuality(
  averageDeviation: number,
  criticalCount: number,
  totalSubmissions: number
): 'excellent' | 'good' | 'fair' | 'poor' {
  const criticalRate = criticalCount / totalSubmissions;

  if (
    averageDeviation <= QUALITY_THRESHOLDS.excellent.maxAvgDeviation &&
    criticalRate <= QUALITY_THRESHOLDS.excellent.maxCriticalRate
  ) {
    return 'excellent';
  } else if (
    averageDeviation <= QUALITY_THRESHOLDS.good.maxAvgDeviation &&
    criticalRate <= QUALITY_THRESHOLDS.good.maxCriticalRate
  ) {
    return 'good';
  } else if (
    averageDeviation <= QUALITY_THRESHOLDS.fair.maxAvgDeviation &&
    criticalRate <= QUALITY_THRESHOLDS.fair.maxCriticalRate
  ) {
    return 'fair';
  } else {
    return 'poor';
  }
}

/**
 * Calculate quality score (0-100)
 */
function calculateQualityScore(
  averageDeviation: number,
  criticalCount: number,
  totalSubmissions: number
): number {
  const criticalRate = criticalCount / totalSubmissions;

  // Base score from average deviation (0-60 points)
  const deviationScore = Math.max(0, 60 - averageDeviation * 2);

  // Bonus for low critical rate (0-40 points)
  const criticalScore = Math.max(0, 40 - criticalRate * 100);

  return Math.round(deviationScore + criticalScore);
}

/**
 * Analyze submissions by skill area
 */
function analyzeSkillAreas(results: AuditResult[]): SkillAreaInsight[] {
  const skillAreaMap = new Map<string, AuditResult[]>();

  // Group by skill area
  results.forEach((result) => {
    if (!skillAreaMap.has(result.skillArea)) {
      skillAreaMap.set(result.skillArea, []);
    }
    skillAreaMap.get(result.skillArea)!.push(result);
  });

  return Array.from(skillAreaMap.entries()).map(([skillArea, submissions]) => {
    const deviations = submissions.map((s) => s.deviation);
    const averageDeviation =
      deviations.reduce((sum, d) => sum + d, 0) / deviations.length;
    const criticalCount = submissions.filter(
      (s) => s.deviationType === 'critical'
    ).length;
    const qualityRating = assessReviewQuality(
      averageDeviation,
      criticalCount,
      submissions.length
    );

    // Determine notable trend
    let notableTrend = 'Standard performance';
    if (averageDeviation > 20) {
      notableTrend = 'High deviation rate';
    } else if (averageDeviation < 5) {
      notableTrend = 'Excellent alignment';
    } else if (criticalCount > submissions.length * 0.2) {
      notableTrend = 'High critical rate';
    }

    return {
      skillArea,
      submissionCount: submissions.length,
      averageDeviation,
      criticalCount,
      qualityRating,
      notableTrend,
    };
  });
}

/**
 * Analyze submissions by difficulty level
 */
function analyzeDifficulties(results: AuditResult[]): DifficultyInsight[] {
  const difficultyMap = new Map<string, AuditResult[]>();

  // Group by difficulty
  results.forEach((result) => {
    if (!difficultyMap.has(result.taskDifficulty)) {
      difficultyMap.set(result.taskDifficulty, []);
    }
    difficultyMap.get(result.taskDifficulty)!.push(result);
  });

  return Array.from(difficultyMap.entries()).map(
    ([difficulty, submissions]) => {
      const deviations = submissions.map((s) => s.deviation);
      const averageDeviation =
        deviations.reduce((sum, d) => sum + d, 0) / deviations.length;
      const criticalCount = submissions.filter(
        (s) => s.deviationType === 'critical'
      ).length;
      const qualityRating = assessReviewQuality(
        averageDeviation,
        criticalCount,
        submissions.length
      );

      // Determine notable trend
      let notableTrend = 'Expected performance';
      if (difficulty === 'expert' && averageDeviation > 15) {
        notableTrend = 'High deviation for expert level';
      } else if (difficulty === 'easy' && averageDeviation > 10) {
        notableTrend = 'Unexpected deviation for easy tasks';
      } else if (averageDeviation < 3) {
        notableTrend = 'Excellent scoring consistency';
      }

      return {
        difficulty: difficulty as 'easy' | 'medium' | 'hard' | 'expert',
        submissionCount: submissions.length,
        averageDeviation,
        criticalCount,
        qualityRating,
        notableTrend,
      };
    }
  );
}

/**
 * Detect notable patterns in the audit data
 */
function detectNotablePatterns(
  auditRun: AuditRun,
  skillAreaAnalysis: SkillAreaInsight[],
  difficultyAnalysis: DifficultyInsight[]
): string[] {
  const patterns: string[] = [];

  // Skill area patterns
  const highDeviationSkills = skillAreaAnalysis.filter(
    (s) => s.averageDeviation > 15
  );
  if (highDeviationSkills.length > 0) {
    patterns.push(
      `High deviation detected in ${highDeviationSkills.map((s) => s.skillArea).join(', ')}`
    );
  }

  const excellentSkills = skillAreaAnalysis.filter(
    (s) => s.qualityRating === 'excellent'
  );
  if (excellentSkills.length > 0) {
    patterns.push(
      `Excellent performance in ${excellentSkills.map((s) => s.skillArea).join(', ')}`
    );
  }

  // Difficulty patterns
  const expertIssues = difficultyAnalysis.find(
    (d) => d.difficulty === 'expert' && d.averageDeviation > 20
  );
  if (expertIssues) {
    patterns.push('Expert-level tasks showing high deviation rates');
  }

  const easyIssues = difficultyAnalysis.find(
    (d) => d.difficulty === 'easy' && d.averageDeviation > 10
  );
  if (easyIssues) {
    patterns.push('Unexpected deviations in easy-level tasks');
  }

  // Overall patterns
  if (auditRun.averageDeviation < 5) {
    patterns.push('Overall excellent scoring consistency');
  } else if (auditRun.averageDeviation > 20) {
    patterns.push('Overall high deviation rate requiring attention');
  }

  // Critical pattern
  if (auditRun.criticalFlags > auditRun.totalSubmissions * 0.2) {
    patterns.push(
      'High critical flag rate indicating potential systemic issues'
    );
  }

  return patterns;
}

/**
 * Generate performance signals
 */
function generatePerformanceSignals(
  auditRun: AuditRun,
  deviationStats: { average: number; max: number; min: number; median: number },
  deviationBreakdown: AuditInsightsResult['deviationBreakdown']
): PerformanceSignal[] {
  const signals: PerformanceSignal[] = [];

  // Positive signals
  if (deviationStats.average < 8) {
    signals.push({
      type: 'positive',
      message: 'Excellent scoring consistency across all submissions',
      impact: 'high',
      data: { averageDeviation: deviationStats.average },
    });
  }

  if (deviationBreakdown.critical === 0) {
    signals.push({
      type: 'positive',
      message: 'No critical deviations detected',
      impact: 'medium',
      data: { criticalCount: 0 },
    });
  }

  // Warning signals
  if (deviationStats.average > 15 && deviationStats.average <= 25) {
    signals.push({
      type: 'warning',
      message: 'Moderate deviation rate detected',
      impact: 'medium',
      data: { averageDeviation: deviationStats.average },
    });
  }

  if (deviationBreakdown.critical > auditRun.totalSubmissions * 0.1) {
    signals.push({
      type: 'warning',
      message: 'Elevated critical deviation rate',
      impact: 'high',
      data: {
        criticalRate: deviationBreakdown.critical / auditRun.totalSubmissions,
      },
    });
  }

  // Critical signals
  if (deviationStats.average > 25) {
    signals.push({
      type: 'critical',
      message: 'High deviation rate requiring immediate attention',
      impact: 'high',
      data: { averageDeviation: deviationStats.average },
    });
  }

  if (deviationStats.max > 50) {
    signals.push({
      type: 'critical',
      message: 'Extreme deviation detected in individual submissions',
      impact: 'high',
      data: { maxDeviation: deviationStats.max },
    });
  }

  return signals;
}

/**
 * Detect risk indicators
 */
function detectRiskIndicators(
  results: AuditResult[],
  deviationStats: { average: number; max: number; min: number; median: number },
  actionDistribution: AuditInsightsResult['actionDistribution']
): RiskIndicator[] {
  const indicators: RiskIndicator[] = [];

  // Score inflation detection
  const inflatedScores = results.filter(
    (r) =>
      r.deviation >= RISK_THRESHOLDS.scoreInflation.minDeviation &&
      r.userScore >= RISK_THRESHOLDS.scoreInflation.minUserScore
  );

  if (inflatedScores.length > 0) {
    indicators.push({
      type: 'score_inflation',
      severity:
        inflatedScores.length > results.length * 0.2 ? 'high' : 'medium',
      description: 'Potential score inflation detected',
      evidence: inflatedScores.map(
        (s) =>
          `User score ${s.userScore} vs AI score ${s.aiScore} (deviation: ${s.deviation})`
      ),
      affectedSubmissions: inflatedScores.map((s) => s.submissionId),
    });
  }

  // AI bias detection
  const aiBiasCases = results.filter(
    (r) =>
      r.deviation >= RISK_THRESHOLDS.aiBias.minDeviation &&
      r.aiScore <= RISK_THRESHOLDS.aiBias.maxAiScore
  );

  if (aiBiasCases.length > 0) {
    indicators.push({
      type: 'ai_bias',
      severity: aiBiasCases.length > results.length * 0.15 ? 'high' : 'medium',
      description: 'Potential AI scoring bias detected',
      evidence: aiBiasCases.map(
        (s) =>
          `AI score ${s.aiScore} significantly lower than user score ${s.userScore}`
      ),
      affectedSubmissions: aiBiasCases.map((s) => s.submissionId),
    });
  }

  // Reviewer override pattern
  const overrideRate = actionDistribution.override / results.length;
  if (overrideRate >= RISK_THRESHOLDS.reviewerOverride.minOverrideRate) {
    indicators.push({
      type: 'reviewer_pattern',
      severity: overrideRate > 0.5 ? 'high' : 'medium',
      description: 'High override rate detected',
      evidence: [`Override rate: ${(overrideRate * 100).toFixed(1)}%`],
      affectedSubmissions: results
        .filter((r) => r.actionTaken === 'override')
        .map((s) => s.submissionId),
    });
  }

  // Skill gap detection
  const criticalRate =
    results.filter((r) => r.deviationType === 'critical').length /
    results.length;
  if (criticalRate >= RISK_THRESHOLDS.skillGap.minCriticalRate) {
    indicators.push({
      type: 'skill_gap',
      severity: criticalRate > 0.6 ? 'high' : 'medium',
      description: 'High critical rate indicating potential skill gaps',
      evidence: [`Critical rate: ${(criticalRate * 100).toFixed(1)}%`],
      affectedSubmissions: results
        .filter((r) => r.deviationType === 'critical')
        .map((s) => s.submissionId),
    });
  }

  return indicators;
}

/**
 * Generate insight summary
 */
function generateInsightSummary(
  auditRun: AuditRun,
  reviewQuality: string,
  deviationStats: { average: number; max: number; min: number; median: number },
  criticalSubmissions: string[]
): string[] {
  const summary: string[] = [];

  // Overall assessment
  summary.push(
    `This audit run shows ${reviewQuality} review quality with an average deviation of ${deviationStats.average.toFixed(1)} points between user and AI scores.`
  );

  // Critical issues
  if (criticalSubmissions.length > 0) {
    summary.push(
      `Critical deviations were detected in ${criticalSubmissions.length} submissions, representing ${((criticalSubmissions.length / auditRun.totalSubmissions) * 100).toFixed(1)}% of all submissions.`
    );
  } else {
    summary.push(
      'No critical deviations were detected, indicating good scoring consistency across the audit.'
    );
  }

  // Performance context
  if (deviationStats.average < 10) {
    summary.push(
      'The scoring system demonstrates excellent consistency and reliability.'
    );
  } else if (deviationStats.average > 20) {
    summary.push(
      'Significant scoring discrepancies suggest the need for review process improvements or system calibration.'
    );
  } else {
    summary.push(
      'Moderate deviations indicate normal variance with some areas for improvement.'
    );
  }

  return summary;
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  reviewQuality: string,
  riskIndicators: RiskIndicator[],
  performanceSignals: PerformanceSignal[]
): string[] {
  const recommendations: string[] = [];

  // Quality-based recommendations
  if (reviewQuality === 'poor') {
    recommendations.push(
      'Implement immediate review process improvements and system calibration.'
    );
    recommendations.push(
      'Consider additional training for reviewers and AI model fine-tuning.'
    );
  } else if (reviewQuality === 'fair') {
    recommendations.push(
      'Review scoring criteria and consider process refinements.'
    );
  }

  // Risk-based recommendations
  riskIndicators.forEach((indicator) => {
    switch (indicator.type) {
      case 'score_inflation':
        recommendations.push(
          'Investigate potential score inflation and review scoring standards.'
        );
        break;
      case 'ai_bias':
        recommendations.push(
          'Analyze AI model bias and consider retraining with balanced datasets.'
        );
        break;
      case 'reviewer_pattern':
        recommendations.push(
          'Review override patterns and provide additional reviewer training.'
        );
        break;
      case 'skill_gap':
        recommendations.push(
          'Address skill gaps through targeted training and support.'
        );
        break;
    }
  });

  // Performance-based recommendations
  const criticalSignals = performanceSignals.filter(
    (s) => s.type === 'critical'
  );
  if (criticalSignals.length > 0) {
    recommendations.push(
      'Prioritize addressing critical performance signals immediately.'
    );
  }

  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push(
      'Continue monitoring and maintain current review processes.'
    );
    recommendations.push(
      'Consider periodic system audits to ensure ongoing quality.'
    );
  }

  return recommendations.slice(0, 5); // Limit to top 5 recommendations
}

// Export types for external use
export type {
  AuditInsightsResult,
  SkillAreaInsight,
  DifficultyInsight,
  PerformanceSignal,
  RiskIndicator,
};
