/**
 * CaBE Arena Deviation Analyzer
 *
 * Advanced AI-powered system for analyzing score discrepancies between
 * user submissions and AI audit scores. Provides intelligent classification
 * and reasoning for deviation detection.
 */

import { generateAIResponse } from '../lib/ai';
import logger from './logger';

export interface DeviationAnalysisInput {
  taskTitle: string;
  taskDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  skillArea:
    | 'frontend'
    | 'backend'
    | 'content'
    | 'data'
    | 'ai'
    | 'design'
    | 'mobile'
    | 'devops';
  userSubmittedScore: number;
  aiAuditScore: number;
  userCode?: string;
  userProof?: string;
  taskDescription?: string;
  submissionContext?: {
    timeSpent?: number; // minutes
    codeLength?: number; // characters
    complexity?: 'low' | 'medium' | 'high';
  };
}

export interface DeviationAnalysisResult {
  deviationType: 'none' | 'minor' | 'major' | 'critical';
  deviationMagnitude: number;
  confidence: 'low' | 'medium' | 'high';
  reasoning: string;
  suggestedAction: 'allow' | 'flag_for_review' | 'escalate' | 'override';
  riskFactors: string[];
  skillAreaContext: string;
  complexityContext: string;
  metadata: {
    analysisTimestamp: string;
    modelUsed: string;
    processingTime: number;
  };
}

export interface DeviationClassification {
  type: 'none' | 'minor' | 'major' | 'critical';
  threshold: number;
  description: string;
  actionRequired: string;
}

// Deviation classification thresholds based on skill area and difficulty
const DEVIATION_THRESHOLDS: Record<
  string,
  Record<string, DeviationClassification[]>
> = {
  frontend: {
    easy: [
      {
        type: 'none',
        threshold: 3,
        description: 'Acceptable variance for simple frontend tasks',
        actionRequired: 'No action needed',
      },
      {
        type: 'minor',
        threshold: 8,
        description: 'Minor discrepancy in basic frontend evaluation',
        actionRequired: 'Monitor for patterns',
      },
      {
        type: 'major',
        threshold: 15,
        description: 'Significant disagreement in frontend quality assessment',
        actionRequired: 'Flag for human review',
      },
      {
        type: 'critical',
        threshold: 999,
        description: 'Critical mismatch indicating potential scoring error',
        actionRequired: 'Immediate escalation required',
      },
    ],
    medium: [
      {
        type: 'none',
        threshold: 5,
        description: 'Acceptable variance for intermediate frontend tasks',
        actionRequired: 'No action needed',
      },
      {
        type: 'minor',
        threshold: 12,
        description: 'Minor discrepancy in frontend complexity evaluation',
        actionRequired: 'Monitor for patterns',
      },
      {
        type: 'major',
        threshold: 20,
        description:
          'Significant disagreement in frontend architecture assessment',
        actionRequired: 'Flag for human review',
      },
      {
        type: 'critical',
        threshold: 999,
        description: 'Critical mismatch in frontend evaluation',
        actionRequired: 'Immediate escalation required',
      },
    ],
    hard: [
      {
        type: 'none',
        threshold: 8,
        description: 'Acceptable variance for complex frontend tasks',
        actionRequired: 'No action needed',
      },
      {
        type: 'minor',
        threshold: 15,
        description: 'Minor discrepancy in advanced frontend evaluation',
        actionRequired: 'Monitor for patterns',
      },
      {
        type: 'major',
        threshold: 25,
        description: 'Significant disagreement in frontend system design',
        actionRequired: 'Flag for human review',
      },
      {
        type: 'critical',
        threshold: 999,
        description: 'Critical mismatch in complex frontend assessment',
        actionRequired: 'Immediate escalation required',
      },
    ],
    expert: [
      {
        type: 'none',
        threshold: 10,
        description: 'Acceptable variance for expert frontend tasks',
        actionRequired: 'No action needed',
      },
      {
        type: 'minor',
        threshold: 18,
        description: 'Minor discrepancy in expert frontend evaluation',
        actionRequired: 'Monitor for patterns',
      },
      {
        type: 'major',
        threshold: 30,
        description: 'Significant disagreement in expert frontend architecture',
        actionRequired: 'Flag for human review',
      },
      {
        type: 'critical',
        threshold: 999,
        description: 'Critical mismatch in expert frontend assessment',
        actionRequired: 'Immediate escalation required',
      },
    ],
  },
  backend: {
    easy: [
      {
        type: 'none',
        threshold: 4,
        description: 'Acceptable variance for simple backend tasks',
        actionRequired: 'No action needed',
      },
      {
        type: 'minor',
        threshold: 10,
        description: 'Minor discrepancy in basic backend evaluation',
        actionRequired: 'Monitor for patterns',
      },
      {
        type: 'major',
        threshold: 18,
        description: 'Significant disagreement in backend logic assessment',
        actionRequired: 'Flag for human review',
      },
      {
        type: 'critical',
        threshold: 999,
        description: 'Critical mismatch indicating potential scoring error',
        actionRequired: 'Immediate escalation required',
      },
    ],
    medium: [
      {
        type: 'none',
        threshold: 6,
        description: 'Acceptable variance for intermediate backend tasks',
        actionRequired: 'No action needed',
      },
      {
        type: 'minor',
        threshold: 14,
        description: 'Minor discrepancy in backend architecture evaluation',
        actionRequired: 'Monitor for patterns',
      },
      {
        type: 'major',
        threshold: 22,
        description: 'Significant disagreement in backend system design',
        actionRequired: 'Flag for human review',
      },
      {
        type: 'critical',
        threshold: 999,
        description: 'Critical mismatch in backend evaluation',
        actionRequired: 'Immediate escalation required',
      },
    ],
    hard: [
      {
        type: 'none',
        threshold: 10,
        description: 'Acceptable variance for complex backend tasks',
        actionRequired: 'No action needed',
      },
      {
        type: 'minor',
        threshold: 18,
        description: 'Minor discrepancy in advanced backend evaluation',
        actionRequired: 'Monitor for patterns',
      },
      {
        type: 'major',
        threshold: 28,
        description: 'Significant disagreement in backend system architecture',
        actionRequired: 'Flag for human review',
      },
      {
        type: 'critical',
        threshold: 999,
        description: 'Critical mismatch in complex backend assessment',
        actionRequired: 'Immediate escalation required',
      },
    ],
    expert: [
      {
        type: 'none',
        threshold: 12,
        description: 'Acceptable variance for expert backend tasks',
        actionRequired: 'No action needed',
      },
      {
        type: 'minor',
        threshold: 20,
        description: 'Minor discrepancy in expert backend evaluation',
        actionRequired: 'Monitor for patterns',
      },
      {
        type: 'major',
        threshold: 32,
        description: 'Significant disagreement in expert backend architecture',
        actionRequired: 'Flag for human review',
      },
      {
        type: 'critical',
        threshold: 999,
        description: 'Critical mismatch in expert backend assessment',
        actionRequired: 'Immediate escalation required',
      },
    ],
  },
  content: {
    easy: [
      {
        type: 'none',
        threshold: 5,
        description: 'Acceptable variance for simple content tasks',
        actionRequired: 'No action needed',
      },
      {
        type: 'minor',
        threshold: 12,
        description: 'Minor discrepancy in basic content evaluation',
        actionRequired: 'Monitor for patterns',
      },
      {
        type: 'major',
        threshold: 20,
        description: 'Significant disagreement in content quality assessment',
        actionRequired: 'Flag for human review',
      },
      {
        type: 'critical',
        threshold: 999,
        description: 'Critical mismatch indicating potential scoring error',
        actionRequired: 'Immediate escalation required',
      },
    ],
    medium: [
      {
        type: 'none',
        threshold: 7,
        description: 'Acceptable variance for intermediate content tasks',
        actionRequired: 'No action needed',
      },
      {
        type: 'minor',
        threshold: 15,
        description: 'Minor discrepancy in content structure evaluation',
        actionRequired: 'Monitor for patterns',
      },
      {
        type: 'major',
        threshold: 25,
        description: 'Significant disagreement in content depth assessment',
        actionRequired: 'Flag for human review',
      },
      {
        type: 'critical',
        threshold: 999,
        description: 'Critical mismatch in content evaluation',
        actionRequired: 'Immediate escalation required',
      },
    ],
    hard: [
      {
        type: 'none',
        threshold: 10,
        description: 'Acceptable variance for complex content tasks',
        actionRequired: 'No action needed',
      },
      {
        type: 'minor',
        threshold: 18,
        description: 'Minor discrepancy in advanced content evaluation',
        actionRequired: 'Monitor for patterns',
      },
      {
        type: 'major',
        threshold: 28,
        description:
          'Significant disagreement in content sophistication assessment',
        actionRequired: 'Flag for human review',
      },
      {
        type: 'critical',
        threshold: 999,
        description: 'Critical mismatch in complex content assessment',
        actionRequired: 'Immediate escalation required',
      },
    ],
    expert: [
      {
        type: 'none',
        threshold: 12,
        description: 'Acceptable variance for expert content tasks',
        actionRequired: 'No action needed',
      },
      {
        type: 'minor',
        threshold: 20,
        description: 'Minor discrepancy in expert content evaluation',
        actionRequired: 'Monitor for patterns',
      },
      {
        type: 'major',
        threshold: 30,
        description: 'Significant disagreement in expert content analysis',
        actionRequired: 'Flag for human review',
      },
      {
        type: 'critical',
        threshold: 999,
        description: 'Critical mismatch in expert content assessment',
        actionRequired: 'Immediate escalation required',
      },
    ],
  },
  data: {
    easy: [
      {
        type: 'none',
        threshold: 4,
        description: 'Acceptable variance for simple data tasks',
        actionRequired: 'No action needed',
      },
      {
        type: 'minor',
        threshold: 10,
        description: 'Minor discrepancy in basic data evaluation',
        actionRequired: 'Monitor for patterns',
      },
      {
        type: 'major',
        threshold: 18,
        description: 'Significant disagreement in data analysis assessment',
        actionRequired: 'Flag for human review',
      },
      {
        type: 'critical',
        threshold: 999,
        description: 'Critical mismatch indicating potential scoring error',
        actionRequired: 'Immediate escalation required',
      },
    ],
    medium: [
      {
        type: 'none',
        threshold: 6,
        description: 'Acceptable variance for intermediate data tasks',
        actionRequired: 'No action needed',
      },
      {
        type: 'minor',
        threshold: 14,
        description: 'Minor discrepancy in data methodology evaluation',
        actionRequired: 'Monitor for patterns',
      },
      {
        type: 'major',
        threshold: 22,
        description: 'Significant disagreement in data modeling assessment',
        actionRequired: 'Flag for human review',
      },
      {
        type: 'critical',
        threshold: 999,
        description: 'Critical mismatch in data evaluation',
        actionRequired: 'Immediate escalation required',
      },
    ],
    hard: [
      {
        type: 'none',
        threshold: 8,
        description: 'Acceptable variance for complex data tasks',
        actionRequired: 'No action needed',
      },
      {
        type: 'minor',
        threshold: 16,
        description: 'Minor discrepancy in advanced data evaluation',
        actionRequired: 'Monitor for patterns',
      },
      {
        type: 'major',
        threshold: 26,
        description: 'Significant disagreement in data science assessment',
        actionRequired: 'Flag for human review',
      },
      {
        type: 'critical',
        threshold: 999,
        description: 'Critical mismatch in complex data assessment',
        actionRequired: 'Immediate escalation required',
      },
    ],
    expert: [
      {
        type: 'none',
        threshold: 10,
        description: 'Acceptable variance for expert data tasks',
        actionRequired: 'No action needed',
      },
      {
        type: 'minor',
        threshold: 18,
        description: 'Minor discrepancy in expert data evaluation',
        actionRequired: 'Monitor for patterns',
      },
      {
        type: 'major',
        threshold: 28,
        description:
          'Significant disagreement in expert data science assessment',
        actionRequired: 'Flag for human review',
      },
      {
        type: 'critical',
        threshold: 999,
        description: 'Critical mismatch in expert data assessment',
        actionRequired: 'Immediate escalation required',
      },
    ],
  },
};

// Default thresholds for other skill areas
const DEFAULT_THRESHOLDS = {
  easy: [
    {
      type: 'none',
      threshold: 5,
      description: 'Acceptable variance for simple tasks',
      actionRequired: 'No action needed',
    },
    {
      type: 'minor',
      threshold: 12,
      description: 'Minor discrepancy in basic evaluation',
      actionRequired: 'Monitor for patterns',
    },
    {
      type: 'major',
      threshold: 20,
      description: 'Significant disagreement in quality assessment',
      actionRequired: 'Flag for human review',
    },
    {
      type: 'critical',
      threshold: 999,
      description: 'Critical mismatch indicating potential scoring error',
      actionRequired: 'Immediate escalation required',
    },
  ],
  medium: [
    {
      type: 'none',
      threshold: 7,
      description: 'Acceptable variance for intermediate tasks',
      actionRequired: 'No action needed',
    },
    {
      type: 'minor',
      threshold: 15,
      description: 'Minor discrepancy in complexity evaluation',
      actionRequired: 'Monitor for patterns',
    },
    {
      type: 'major',
      threshold: 25,
      description: 'Significant disagreement in quality assessment',
      actionRequired: 'Flag for human review',
    },
    {
      type: 'critical',
      threshold: 999,
      description: 'Critical mismatch in evaluation',
      actionRequired: 'Immediate escalation required',
    },
  ],
  hard: [
    {
      type: 'none',
      threshold: 10,
      description: 'Acceptable variance for complex tasks',
      actionRequired: 'No action needed',
    },
    {
      type: 'minor',
      threshold: 18,
      description: 'Minor discrepancy in advanced evaluation',
      actionRequired: 'Monitor for patterns',
    },
    {
      type: 'major',
      threshold: 28,
      description: 'Significant disagreement in quality assessment',
      actionRequired: 'Flag for human review',
    },
    {
      type: 'critical',
      threshold: 999,
      description: 'Critical mismatch in complex assessment',
      actionRequired: 'Immediate escalation required',
    },
  ],
  expert: [
    {
      type: 'none',
      threshold: 12,
      description: 'Acceptable variance for expert tasks',
      actionRequired: 'No action needed',
    },
    {
      type: 'minor',
      threshold: 20,
      description: 'Minor discrepancy in expert evaluation',
      actionRequired: 'Monitor for patterns',
    },
    {
      type: 'major',
      threshold: 30,
      description: 'Significant disagreement in expert assessment',
      actionRequired: 'Flag for human review',
    },
    {
      type: 'critical',
      threshold: 999,
      description: 'Critical mismatch in expert assessment',
      actionRequired: 'Immediate escalation required',
    },
  ],
};

/**
 * Analyze score deviation between user submission and AI audit
 */
export async function analyzeDeviation(
  input: DeviationAnalysisInput
): Promise<DeviationAnalysisResult> {
  const startTime = Date.now();

  try {
    logger.info('🔍 Starting deviation analysis', {
      taskTitle: input.taskTitle,
      skillArea: input.skillArea,
      userScore: input.userSubmittedScore,
      aiScore: input.aiAuditScore,
    });

    // Calculate deviation magnitude
    const deviationMagnitude = Math.abs(
      input.userSubmittedScore - input.aiAuditScore
    );

    // Get appropriate thresholds for this skill area and difficulty
    const thresholds = getThresholdsForSkillAndDifficulty(
      input.skillArea,
      input.taskDifficulty
    );

    // Determine deviation type based on thresholds
    const deviationType = classifyDeviation(deviationMagnitude, thresholds);

    // Generate AI-powered reasoning
    const reasoning = await generateDeviationReasoning(
      input,
      deviationType,
      deviationMagnitude
    );

    // Determine suggested action
    const suggestedAction = determineSuggestedAction(deviationType, input);

    // Identify risk factors
    const riskFactors = identifyRiskFactors(
      input,
      deviationType,
      deviationMagnitude
    );

    // Generate context information
    const skillAreaContext = generateSkillAreaContext(
      input.skillArea,
      input.taskDifficulty
    );
    const complexityContext = generateComplexityContext(input);

    const processingTime = Date.now() - startTime;

    const result: DeviationAnalysisResult = {
      deviationType,
      deviationMagnitude,
      confidence: calculateConfidence(input, deviationMagnitude),
      reasoning,
      suggestedAction,
      riskFactors,
      skillAreaContext,
      complexityContext,
      metadata: {
        analysisTimestamp: new Date().toISOString(),
        modelUsed: 'mistralai/mistral-7b-instruct',
        processingTime,
      },
    };

    logger.info('✅ Deviation analysis completed', {
      deviationType,
      deviationMagnitude,
      suggestedAction,
      processingTime,
    });

    return result;
  } catch (error) {
    logger.error('❌ Deviation analysis failed:', error);

    // Return fallback result
    const fallbackDeviation = Math.abs(
      input.userSubmittedScore - input.aiAuditScore
    );
    return {
      deviationType:
        fallbackDeviation <= 5
          ? 'none'
          : fallbackDeviation <= 15
            ? 'minor'
            : 'major',
      deviationMagnitude: fallbackDeviation,
      confidence: 'low',
      reasoning:
        'Analysis failed due to technical error. Manual review recommended.',
      suggestedAction: 'flag_for_review',
      riskFactors: ['Analysis failure', 'Manual review required'],
      skillAreaContext: `Standard analysis for ${input.skillArea} tasks`,
      complexityContext: `Task difficulty: ${input.taskDifficulty}`,
      metadata: {
        analysisTimestamp: new Date().toISOString(),
        modelUsed: 'fallback',
        processingTime: Date.now() - startTime,
      },
    };
  }
}

/**
 * Get appropriate thresholds for skill area and difficulty
 */
function getThresholdsForSkillAndDifficulty(
  skillArea: string,
  difficulty: string
): DeviationClassification[] {
  const skillThresholds = DEVIATION_THRESHOLDS[skillArea];
  if (skillThresholds && skillThresholds[difficulty]) {
    return skillThresholds[difficulty];
  }
  return DEFAULT_THRESHOLDS[difficulty] || DEFAULT_THRESHOLDS.medium;
}

/**
 * Classify deviation based on magnitude and thresholds
 */
function classifyDeviation(
  magnitude: number,
  thresholds: DeviationClassification[]
): 'none' | 'minor' | 'major' | 'critical' {
  for (const threshold of thresholds) {
    if (magnitude <= threshold.threshold) {
      return threshold.type;
    }
  }
  return 'critical';
}

/**
 * Generate AI-powered reasoning for the deviation
 */
async function generateDeviationReasoning(
  input: DeviationAnalysisInput,
  deviationType: string,
  deviationMagnitude: number
): Promise<string> {
  try {
    const prompt = buildDeviationAnalysisPrompt(
      input,
      deviationType,
      deviationMagnitude
    );
    const reasoning = await generateAIResponse(prompt);
    return reasoning.trim();
  } catch (error) {
    logger.error('Failed to generate AI reasoning:', error);
    return generateFallbackReasoning(input, deviationType, deviationMagnitude);
  }
}

/**
 * Build comprehensive prompt for deviation analysis
 */
function buildDeviationAnalysisPrompt(
  input: DeviationAnalysisInput,
  deviationType: string,
  deviationMagnitude: number
): string {
  const scoreDirection =
    input.userSubmittedScore > input.aiAuditScore ? 'higher' : 'lower';
  const scoreDifference = Math.abs(
    input.userSubmittedScore - input.aiAuditScore
  );

  return `You are an expert code review analyst specializing in detecting scoring anomalies and deviations in programming task submissions.

TASK CONTEXT:
- Task Title: "${input.taskTitle}"
- Skill Area: ${input.skillArea.toUpperCase()}
- Difficulty Level: ${input.taskDifficulty.toUpperCase()}
- User Submitted Score: ${input.userSubmittedScore}/100
- AI Audit Score: ${input.aiAuditScore}/100
- Score Difference: ${scoreDifference} points (User score is ${scoreDirection} than AI score)
- Deviation Classification: ${deviationType.toUpperCase()}

${input.taskDescription ? `TASK DESCRIPTION: ${input.taskDescription}` : ''}

${
  input.userCode
    ? `USER CODE:
\`\`\`
${input.userCode.substring(0, 2000)}${input.userCode.length > 2000 ? '...' : ''}
\`\`\``
    : ''
}

${
  input.userProof
    ? `USER PROOF/EXPLANATION:
${input.userProof.substring(0, 1000)}${input.userProof.length > 1000 ? '...' : ''}`
    : ''
}

ANALYSIS REQUIREMENTS:
1. Evaluate the reasonableness of the score discrepancy
2. Consider the skill area context and difficulty level
3. Identify potential factors contributing to the deviation
4. Assess whether this represents a scoring error, bias, or legitimate difference in evaluation criteria

POTENTIAL FACTORS TO CONSIDER:
- Code quality vs. functionality assessment differences
- Complexity evaluation variations
- Skill area-specific evaluation criteria
- Task difficulty expectations
- Code length vs. quality trade-offs
- Documentation and explanation quality
- Best practices adherence

Please provide a detailed analysis explaining:
1. Why this deviation occurred
2. Whether it represents a legitimate difference in evaluation or a potential error
3. What factors most likely contributed to the discrepancy
4. Recommendations for addressing similar cases in the future

Focus on providing clear, actionable insights that help improve the scoring system's accuracy and fairness.`;
}

/**
 * Generate fallback reasoning when AI analysis fails
 */
function generateFallbackReasoning(
  input: DeviationAnalysisInput,
  deviationType: string,
  deviationMagnitude: number
): string {
  const scoreDirection =
    input.userSubmittedScore > input.aiAuditScore ? 'higher' : 'lower';

  switch (deviationType) {
    case 'none':
      return `Scores are within acceptable variance range (±${getThresholdsForSkillAndDifficulty(input.skillArea, input.taskDifficulty)[0].threshold} points for ${input.skillArea} ${input.taskDifficulty} tasks). No significant deviation detected.`;

    case 'minor':
      return `Minor deviation of ${deviationMagnitude} points detected. User score is ${scoreDirection} than AI audit score. This may indicate slight differences in evaluation criteria or subjective assessment factors.`;

    case 'major':
      return `Major deviation of ${deviationMagnitude} points detected. User score is ${scoreDirection} than AI audit score. This suggests significant differences in evaluation approach or potential scoring bias. Manual review recommended.`;

    case 'critical':
      return `Critical deviation of ${deviationMagnitude} points detected. User score is ${scoreDirection} than AI audit score. This represents a substantial disagreement that requires immediate investigation and potential scoring system review.`;

    default:
      return `Deviation analysis completed with ${deviationMagnitude} point difference. Manual review recommended for further investigation.`;
  }
}

/**
 * Determine suggested action based on deviation type and context
 */
function determineSuggestedAction(
  deviationType: string,
  input: DeviationAnalysisInput
): 'allow' | 'flag_for_review' | 'escalate' | 'override' {
  switch (deviationType) {
    case 'none':
      return 'allow';

    case 'minor':
      // Flag for review if it's a high-value task or specific skill area
      if (input.taskDifficulty === 'expert' || input.skillArea === 'ai') {
        return 'flag_for_review';
      }
      return 'allow';

    case 'major':
      return 'flag_for_review';

    case 'critical':
      return 'escalate';

    default:
      return 'flag_for_review';
  }
}

/**
 * Identify risk factors that may contribute to the deviation
 */
function identifyRiskFactors(
  input: DeviationAnalysisInput,
  deviationType: string,
  deviationMagnitude: number
): string[] {
  const riskFactors: string[] = [];

  // High deviation risk factors
  if (deviationMagnitude > 20) {
    riskFactors.push('High score discrepancy');
  }

  // Skill area specific risks
  if (input.skillArea === 'ai' && deviationMagnitude > 15) {
    riskFactors.push('AI/ML evaluation complexity');
  }

  if (input.skillArea === 'content' && deviationMagnitude > 15) {
    riskFactors.push('Subjective content evaluation');
  }

  // Difficulty based risks
  if (input.taskDifficulty === 'expert' && deviationMagnitude > 10) {
    riskFactors.push('Expert-level task complexity');
  }

  // Code quality indicators
  if (
    input.submissionContext?.codeLength &&
    input.submissionContext.codeLength < 100
  ) {
    riskFactors.push('Minimal code submission');
  }

  if (
    input.submissionContext?.timeSpent &&
    input.submissionContext.timeSpent < 10
  ) {
    riskFactors.push('Very short completion time');
  }

  // Score inflation/deflation patterns
  if (input.userSubmittedScore > 90 && input.aiAuditScore < 60) {
    riskFactors.push('Potential score inflation');
  }

  if (input.userSubmittedScore < 30 && input.aiAuditScore > 70) {
    riskFactors.push('Potential score deflation');
  }

  return riskFactors.length > 0 ? riskFactors : ['Standard deviation analysis'];
}

/**
 * Calculate confidence level in the analysis
 */
function calculateConfidence(
  input: DeviationAnalysisInput,
  deviationMagnitude: number
): 'low' | 'medium' | 'high' {
  // High confidence for clear cases
  if (deviationMagnitude <= 5) return 'high';
  if (deviationMagnitude >= 30) return 'high';

  // Medium confidence for moderate deviations
  if (deviationMagnitude <= 15) return 'medium';

  // Low confidence for edge cases
  return 'low';
}

/**
 * Generate skill area specific context
 */
function generateSkillAreaContext(
  skillArea: string,
  difficulty: string
): string {
  const contexts = {
    frontend: `Frontend development evaluation considers UI/UX quality, responsive design, and modern web standards. ${difficulty} tasks require appropriate complexity in component architecture and user interaction.`,
    backend: `Backend development evaluation focuses on API design, data handling, security, and scalability. ${difficulty} tasks require appropriate database design and system architecture.`,
    content: `Content creation evaluation considers clarity, depth, structure, and audience engagement. ${difficulty} tasks require appropriate research depth and writing sophistication.`,
    data: `Data science evaluation focuses on methodology, analysis quality, and insights generation. ${difficulty} tasks require appropriate statistical rigor and analytical depth.`,
    ai: `AI/ML evaluation considers model selection, implementation quality, and problem-solving approach. ${difficulty} tasks require appropriate algorithmic complexity and technical sophistication.`,
  };

  return (
    contexts[skillArea] ||
    `Standard evaluation criteria for ${skillArea} tasks at ${difficulty} difficulty level.`
  );
}

/**
 * Generate complexity context based on submission details
 */
function generateComplexityContext(input: DeviationAnalysisInput): string {
  const context = [`Task difficulty: ${input.taskDifficulty}`];

  if (input.submissionContext?.timeSpent) {
    context.push(
      `Completion time: ${input.submissionContext.timeSpent} minutes`
    );
  }

  if (input.submissionContext?.codeLength) {
    context.push(
      `Code length: ${input.submissionContext.codeLength} characters`
    );
  }

  if (input.submissionContext?.complexity) {
    context.push(
      `Submission complexity: ${input.submissionContext.complexity}`
    );
  }

  return context.join(', ');
}

/**
 * Batch analyze multiple deviations for pattern detection
 */
export async function batchAnalyzeDeviations(
  inputs: DeviationAnalysisInput[]
): Promise<{
  results: DeviationAnalysisResult[];
  patterns: {
    skillAreaPatterns: Record<string, { avgDeviation: number; count: number }>;
    difficultyPatterns: Record<string, { avgDeviation: number; count: number }>;
    criticalIssues: string[];
  };
}> {
  logger.info(
    `🔍 Starting batch deviation analysis for ${inputs.length} submissions`
  );

  const results: DeviationAnalysisResult[] = [];
  const startTime = Date.now();

  // Process each input
  for (const input of inputs) {
    try {
      const result = await analyzeDeviation(input);
      results.push(result);
    } catch (error) {
      logger.error(
        `Failed to analyze deviation for task: ${input.taskTitle}`,
        error
      );
    }
  }

  // Analyze patterns
  const patterns = analyzeDeviationPatterns(results);

  const totalTime = Date.now() - startTime;
  logger.info(`✅ Batch analysis completed in ${totalTime}ms`, {
    totalInputs: inputs.length,
    successfulAnalyses: results.length,
    criticalIssues: patterns.criticalIssues.length,
  });

  return { results, patterns };
}

/**
 * Analyze patterns across multiple deviation results
 */
function analyzeDeviationPatterns(results: DeviationAnalysisResult[]): {
  skillAreaPatterns: Record<string, { avgDeviation: number; count: number }>;
  difficultyPatterns: Record<string, { avgDeviation: number; count: number }>;
  criticalIssues: string[];
} {
  const skillAreaPatterns: Record<
    string,
    { totalDeviation: number; count: number }
  > = {};
  const difficultyPatterns: Record<
    string,
    { totalDeviation: number; count: number }
  > = {};
  const criticalIssues: string[] = [];

  // Count critical deviations
  const criticalCount = results.filter(
    (r) => r.deviationType === 'critical'
  ).length;
  if (criticalCount > 0) {
    criticalIssues.push(
      `${criticalCount} critical deviations detected requiring immediate attention`
    );
  }

  // Analyze skill area patterns
  results.forEach((result) => {
    // This would need to be enhanced with skill area information from the original input
    // For now, we'll use a simplified approach
  });

  // Convert totals to averages
  const skillAreaAverages = Object.entries(skillAreaPatterns).reduce(
    (acc, [skill, data]) => {
      acc[skill] = {
        avgDeviation: data.totalDeviation / data.count,
        count: data.count,
      };
      return acc;
    },
    {} as Record<string, { avgDeviation: number; count: number }>
  );

  const difficultyAverages = Object.entries(difficultyPatterns).reduce(
    (acc, [difficulty, data]) => {
      acc[difficulty] = {
        avgDeviation: data.totalDeviation / data.count,
        count: data.count,
      };
      return acc;
    },
    {} as Record<string, { avgDeviation: number; count: number }>
  );

  return {
    skillAreaPatterns: skillAreaAverages,
    difficultyPatterns: difficultyAverages,
    criticalIssues,
  };
}

export default {
  analyzeDeviation,
  batchAnalyzeDeviations,
  DEVIATION_THRESHOLDS,
  DEFAULT_THRESHOLDS,
};
