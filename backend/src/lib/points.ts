/**
 * CaBE Arena Service Points Formula v5 Implementation
 *
 * This module implements the exact Service Points Formula v5 for calculating points
 * awarded based on task performance and task characteristics.
 * 
 * Formula: L = Σ(Wᵢ × Fᵢ) / Σ(Wᵢ) // Weighted average effort score
 *          f(L) = (e^(5.5 × L) − 1) / (e^5.5 − 1) // Nonlinear bonus function
 *          Bonus = min(MaxBonus × f(L), MaxBonus)
 *          Total = Base + Bonus + R (if ≤ Cap) OR Cap + OverCapBoost (if L ≥ 0.95 and R = 50)
 * 
 * NEW: Skill-specific weightings and multipliers for fair point distribution
 */

// Task interface for points calculation
export interface Task {
  id: string;
  title: string;
  description: string;
  skill_area: string;
  duration: number; // Duration factor (0.0 to 1.0)
  skill: number; // Skill Required factor (0.0 to 1.0)
  complexity: number; // Complexity factor (0.0 to 1.0)
  visibility: number; // Visibility/Reach factor (0.0 to 1.0)
  prestige: number; // Prestige/Impact factor (0.0 to 1.0)
  autonomy: number; // Autonomy factor (0.0 to 1.0)
  created_at: string;
  is_active: boolean;
}

// Points calculation result
export interface PointsResult {
  pointsAwarded: number;
  breakdown?: {
    base: number;
    bonus: number;
    proofBonus: number;
    total: number;
    weightedAverage: number;
    nonlinearBonus: number;
    factors: {
      duration: number;
      skill: number;
      complexity: number;
      visibility: number;
      prestige: number;
      autonomy: number;
    };
    weights: {
      duration: number;
      skill: number;
      complexity: number;
      visibility: number;
      prestige: number;
      autonomy: number;
    };
    maxBonus: number;
    cap: number;
    overCapBoost: number;
    skillMultiplier: number;
    skillCategory: string;
  };
}

// Skill-specific configurations for fair point distribution
const SKILL_CONFIGURATIONS = {
  'Full-Stack Software Development': {
    name: 'Full-Stack Software Development',
    slug: 'fullstack-dev',
    baseMultiplier: 1.2, // Higher base due to broad skill requirements
    bonusMultiplier: 1.1, // Slightly higher bonus for complexity
    cap: 2200, // Higher cap for full-stack expertise
    overCapBoost: 600, // Higher over-cap bonus
    weights: {
      duration: 1.0,
      skill: 1.2, // Higher skill weight for full-stack
      complexity: 1.1, // Slightly higher complexity weight
      visibility: 1.0,
      prestige: 1.0,
      autonomy: 1.0,
    },
    description: 'Comprehensive full-stack development with frontend, backend, and database integration',
  },
  'Cloud Computing & DevOps': {
    name: 'Cloud Computing & DevOps',
    slug: 'cloud-devops',
    baseMultiplier: 1.3, // Highest base due to infrastructure complexity
    bonusMultiplier: 1.2, // Higher bonus for infrastructure expertise
    cap: 2400, // Highest cap for cloud/devops expertise
    overCapBoost: 700, // Highest over-cap bonus
    weights: {
      duration: 1.1, // Slightly higher duration weight
      skill: 1.3, // Highest skill weight for cloud expertise
      complexity: 1.2, // Higher complexity weight
      visibility: 1.0,
      prestige: 1.1, // Slightly higher prestige
      autonomy: 1.1, // Slightly higher autonomy
    },
    description: 'Infrastructure, deployment, and operational excellence',
  },
  'Data Science & Analytics': {
    name: 'Data Science & Analytics',
    slug: 'data-analytics',
    baseMultiplier: 1.15, // Good base for data expertise
    bonusMultiplier: 1.05, // Standard bonus
    cap: 2100, // Good cap for data expertise
    overCapBoost: 550, // Standard over-cap bonus
    weights: {
      duration: 1.0,
      skill: 1.1, // Slightly higher skill weight
      complexity: 1.0,
      visibility: 1.1, // Slightly higher visibility for data insights
      prestige: 1.0,
      autonomy: 1.0,
    },
    description: 'Data analysis, visualization, and business intelligence',
  },
  'AI / Machine Learning': {
    name: 'AI / Machine Learning',
    slug: 'ai-ml',
    baseMultiplier: 1.25, // High base for AI/ML expertise
    bonusMultiplier: 1.15, // Higher bonus for AI complexity
    cap: 2300, // High cap for AI expertise
    overCapBoost: 650, // Higher over-cap bonus
    weights: {
      duration: 1.0,
      skill: 1.25, // High skill weight for AI expertise
      complexity: 1.15, // Higher complexity weight
      visibility: 1.0,
      prestige: 1.1, // Slightly higher prestige
      autonomy: 1.05, // Slightly higher autonomy
    },
    description: 'Machine learning, AI models, and intelligent systems',
  },
} as const;

// Default weights for backward compatibility
const DEFAULT_WEIGHTS = {
  duration: 1.0,
  skill: 1.0,
  complexity: 1.0,
  visibility: 1.0,
  prestige: 1.0,
  autonomy: 1.0,
};

// Core Parameters (0.0 to 1.0)
const ALPHA = 5.5; // Nonlinear bonus parameter
const BASE_MAX_BONUS = 1000; // Base maximum bonus points
const BASE_CAP = 2000; // Base point cap
const BASE_OVER_CAP_BOOST = 500; // Base bonus when exceeding cap

/**
 * Get skill configuration for a given skill area
 * @param skillArea - The skill area to get configuration for
 * @returns Skill configuration or default configuration
 */
function getSkillConfiguration(skillArea: string) {
  const config = Object.values(SKILL_CONFIGURATIONS).find(
    (config) => config.slug === skillArea || config.name === skillArea
  );
  
  if (!config) {
    // Return default configuration for unknown skills
    return {
      name: skillArea,
      slug: skillArea,
      baseMultiplier: 1.0,
      bonusMultiplier: 1.0,
      cap: BASE_CAP,
      overCapBoost: BASE_OVER_CAP_BOOST,
      weights: DEFAULT_WEIGHTS,
      description: 'Standard skill configuration',
    };
  }
  
  return config;
}

/**
 * Calculate weighted average effort score: L = Σ(Wᵢ × Fᵢ) / Σ(Wᵢ)
 * @param factors - Task factors (0.0 to 1.0)
 * @param weights - Skill-specific weights
 * @returns Weighted average effort score (0.0 to 1.0)
 */
function calculateWeightedAverage(
  factors: {
    duration: number;
    skill: number;
    complexity: number;
    visibility: number;
    prestige: number;
    autonomy: number;
  },
  weights: typeof DEFAULT_WEIGHTS
): number {
  const weightedSum = 
    weights.duration * factors.duration +
    weights.skill * factors.skill +
    weights.complexity * factors.complexity +
    weights.visibility * factors.visibility +
    weights.prestige * factors.prestige +
    weights.autonomy * factors.autonomy;

  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  
  return weightedSum / totalWeight;
}

/**
 * Calculate nonlinear bonus function: f(L) = (e^(5.5 × L) − 1) / (e^5.5 − 1)
 * @param L - Weighted average effort score (0.0 to 1.0)
 * @returns Nonlinear bonus value (0.0 to 1.0)
 */
function calculateNonlinearBonus(L: number): number {
  const numerator = Math.exp(ALPHA * L) - 1;
  const denominator = Math.exp(ALPHA) - 1;
  return numerator / denominator;
}

/**
 * Calculate Service Points Formula v5 with skill-specific weightings
 * 
 * @param score - Performance score (0-100)
 * @param task - Task object with all six factor fields (0.0 to 1.0)
 * @param proofStrength - Proof strength bonus (0, 10, 25, or 50)
 * @param includeBreakdown - Whether to include detailed breakdown in result
 * @returns Points calculation result
 */
export function calculateTaskPoints(
  score: number,
  task: Task,
  proofStrength: number = 0,
  includeBreakdown: boolean = false
): PointsResult {
  // Validate inputs
  if (score < 0 || score > 100) {
    throw new Error('Score must be between 0 and 100');
  }

  if (!task) {
    throw new Error('Task object is required');
  }

  // Validate task factors are present and in correct range
  const requiredFactors = [
    'duration',
    'skill',
    'complexity',
    'visibility',
    'prestige',
    'autonomy',
  ];
  
  for (const factor of requiredFactors) {
    const value = task[factor as keyof Task];
    if (value === undefined || value === null) {
      throw new Error(`Task is missing required factor: ${factor}`);
    }
    if (value < 0 || value > 1) {
      throw new Error(`${factor} must be between 0.0 and 1.0, got: ${value}`);
    }
  }

  // Validate proof strength
  if (![0, 10, 25, 50].includes(proofStrength)) {
    throw new Error('Proof strength must be 0, 10, 25, or 50');
  }

  // Get skill-specific configuration
  const skillConfig = getSkillConfiguration(task.skill_area);

  // Extract factors
  const factors = {
    duration: task.duration,
    skill: task.skill,
    complexity: task.complexity,
    visibility: task.visibility,
    prestige: task.prestige,
    autonomy: task.autonomy,
  };

  // Step 1: Calculate weighted average effort score with skill-specific weights
  const L = calculateWeightedAverage(factors, skillConfig.weights);

  // Step 2: Calculate nonlinear bonus function
  const f_L = calculateNonlinearBonus(L);

  // Step 3: Calculate bonus with skill-specific multiplier and cap
  const maxBonus = BASE_MAX_BONUS * skillConfig.bonusMultiplier;
  const bonus = Math.min(maxBonus * f_L, maxBonus);

  // Step 4: Calculate base points with skill-specific multiplier
  const base = (score / 100) * BASE_MAX_BONUS * skillConfig.baseMultiplier;

  // Step 5: Calculate total with proof bonus
  let total = base + bonus + proofStrength;

  // Step 6: Apply skill-specific cap logic
  let overCapBoost = 0;
  if (L >= 0.95 && proofStrength === 50) {
    // Special case: high effort + strong proof allows exceeding cap
    if (total > skillConfig.cap) {
      overCapBoost = total - skillConfig.cap;
      total = skillConfig.cap + skillConfig.overCapBoost;
    }
  } else {
    // Normal cap enforcement with skill-specific cap
    total = Math.min(total, skillConfig.cap);
  }

  // Ensure points are non-negative
  const finalPoints = Math.max(0, Math.round(total));

  const result: PointsResult = {
    pointsAwarded: finalPoints,
  };

  // Include breakdown if requested
  if (includeBreakdown) {
    result.breakdown = {
      base: Math.round(base),
      bonus: Math.round(bonus),
      proofBonus: proofStrength,
      total: finalPoints,
      weightedAverage: L,
      nonlinearBonus: f_L,
      factors,
      weights: skillConfig.weights,
      maxBonus: Math.round(maxBonus),
      cap: skillConfig.cap,
      overCapBoost,
      skillMultiplier: skillConfig.baseMultiplier,
      skillCategory: skillConfig.name,
    };
  }

  return result;
}

/**
 * Calculate points for multiple tasks and return summary
 * @param score - Performance score (0-100)
 * @param tasks - Array of task objects
 * @param proofStrength - Proof strength bonus (0, 10, 25, or 50)
 * @returns Summary of points calculation
 */
export function calculateMultipleTaskPoints(
  score: number,
  tasks: Task[],
  proofStrength: number = 0
): {
  totalPoints: number;
  averagePoints: number;
  taskBreakdown: Array<{
    taskId: string;
    taskTitle: string;
    pointsAwarded: number;
  }>;
} {
  if (!tasks || tasks.length === 0) {
    return {
      totalPoints: 0,
      averagePoints: 0,
      taskBreakdown: [],
    };
  }

  const taskBreakdown = tasks.map((task) => {
    const result = calculateTaskPoints(score, task, proofStrength);
    return {
      taskId: task.id,
      taskTitle: task.title,
      pointsAwarded: result.pointsAwarded,
    };
  });

  const totalPoints = taskBreakdown.reduce(
    (sum, task) => sum + task.pointsAwarded,
    0
  );
  const averagePoints = totalPoints / tasks.length;

  return {
    totalPoints,
    averagePoints,
    taskBreakdown,
  };
}

/**
 * Get Service Points Formula v5 weights for reference
 * @returns Object containing all weights
 */
export function getServicePointsWeights(): typeof DEFAULT_WEIGHTS {
  return { ...DEFAULT_WEIGHTS };
}

/**
 * Validate task factors are within expected ranges
 * @param task - Task object to validate
 * @returns Validation result
 */
export function validateTaskFactors(task: Task): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const factors = [
    { name: 'duration', value: task.duration },
    { name: 'skill', value: task.skill },
    { name: 'complexity', value: task.complexity },
    { name: 'visibility', value: task.visibility },
    { name: 'prestige', value: task.prestige },
    { name: 'autonomy', value: task.autonomy },
  ];

  for (const factor of factors) {
    if (factor.value === undefined || factor.value === null) {
      errors.push(`Missing required factor: ${factor.name}`);
    } else if (factor.value < 0 || factor.value > 1) {
      errors.push(
        `${factor.name} must be between 0.0 and 1.0, got: ${factor.value}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get Service Points Formula v5 constants
 * @returns Object containing all constants
 */
export function getServicePointsConstants() {
  return {
    ALPHA,
    BASE_MAX_BONUS,
    BASE_CAP,
    BASE_OVER_CAP_BOOST,
  };
}

/**
 * Get all skill configurations
 * @returns Object containing all skill configurations
 */
export function getSkillConfigurations() {
  return { ...SKILL_CONFIGURATIONS };
}

/**
 * Get configuration for a specific skill
 * @param skillArea - The skill area to get configuration for
 * @returns Skill configuration or null if not found
 */
export function getSkillConfiguration(skillArea: string) {
  const config = Object.values(SKILL_CONFIGURATIONS).find(
    (config) => config.slug === skillArea || config.name === skillArea
  );
  
  return config || null;
}

/**
 * Compare points fairness across skills for same difficulty tasks
 * @param tasks - Array of tasks with same difficulty but different skills
 * @param score - Performance score (0-100)
 * @param proofStrength - Proof strength bonus (0, 10, 25, or 50)
 * @returns Fairness analysis
 */
export function analyzePointsFairness(
  tasks: Task[],
  score: number,
  proofStrength: number = 0
): {
  isFair: boolean;
  pointsRange: { min: number; max: number; difference: number };
  skillBreakdown: Array<{
    skill: string;
    points: number;
    multiplier: number;
    cap: number;
  }>;
  recommendations: string[];
} {
  if (tasks.length === 0) {
    return {
      isFair: false,
      pointsRange: { min: 0, max: 0, difference: 0 },
      skillBreakdown: [],
      recommendations: ['No tasks provided for analysis'],
    };
  }

  const skillBreakdown = tasks.map((task) => {
    const result = calculateTaskPoints(score, task, proofStrength, true);
    const config = getSkillConfiguration(task.skill_area);
    return {
      skill: task.skill_area,
      points: result.pointsAwarded,
      multiplier: config?.baseMultiplier || 1.0,
      cap: config?.cap || BASE_CAP,
    };
  });

  const points = skillBreakdown.map((item) => item.points);
  const minPoints = Math.min(...points);
  const maxPoints = Math.max(...points);
  const difference = maxPoints - minPoints;
  const averagePoints = points.reduce((sum, p) => sum + p, 0) / points.length;
  const variancePercentage = (difference / averagePoints) * 100;

  // Consider fair if variance is less than 20%
  const isFair = variancePercentage <= 20;

  const recommendations: string[] = [];
  if (!isFair) {
    recommendations.push(`Points variance is ${variancePercentage.toFixed(1)}%, which exceeds the 20% fairness threshold`);
    
    // Identify skills with significantly different points
    const highPoints = skillBreakdown.filter((item) => item.points > averagePoints * 1.1);
    const lowPoints = skillBreakdown.filter((item) => item.points < averagePoints * 0.9);
    
    if (highPoints.length > 0) {
      recommendations.push(`Skills with higher points: ${highPoints.map(item => item.skill).join(', ')}`);
    }
    if (lowPoints.length > 0) {
      recommendations.push(`Skills with lower points: ${lowPoints.map(item => item.skill).join(', ')}`);
    }
  } else {
    recommendations.push('Points distribution is fair across skills');
  }

  return {
    isFair,
    pointsRange: { min: minPoints, max: maxPoints, difference },
    skillBreakdown,
    recommendations,
  };
}

/**
 * Calculate theoretical maximum points for a task with skill-specific configuration
 * @param task - Task object
 * @param proofStrength - Proof strength bonus (0, 10, 25, or 50)
 * @returns Maximum possible points
 */
export function calculateMaxTaskPoints(task: Task, proofStrength: number = 50): number {
  return calculateTaskPoints(100, task, proofStrength).pointsAwarded;
}

/**
 * Calculate theoretical minimum points for a task with skill-specific configuration
 * @param task - Task object
 * @param proofStrength - Proof strength bonus (0, 10, 25, or 50)
 * @returns Minimum possible points
 */
export function calculateMinTaskPoints(task: Task, proofStrength: number = 0): number {
  return calculateTaskPoints(0, task, proofStrength).pointsAwarded;
}

/**
 * Validate skill-specific parameters
 * @param skillArea - Skill area to validate
 * @returns Validation result
 */
export function validateSkillArea(skillArea: string): {
  isValid: boolean;
  config: any;
  errors: string[];
} {
  const errors: string[] = [];
  const config = getSkillConfiguration(skillArea);

  if (!config) {
    errors.push(`Unknown skill area: ${skillArea}`);
    return {
      isValid: false,
      config: null,
      errors,
    };
  }

  // Validate configuration parameters
  if (config.baseMultiplier < 0.5 || config.baseMultiplier > 2.0) {
    errors.push(`Invalid base multiplier: ${config.baseMultiplier} (should be between 0.5 and 2.0)`);
  }

  if (config.bonusMultiplier < 0.5 || config.bonusMultiplier > 2.0) {
    errors.push(`Invalid bonus multiplier: ${config.bonusMultiplier} (should be between 0.5 and 2.0)`);
  }

  if (config.cap < 1000 || config.cap > 5000) {
    errors.push(`Invalid cap: ${config.cap} (should be between 1000 and 5000)`);
  }

  if (config.overCapBoost < 100 || config.overCapBoost > 1000) {
    errors.push(`Invalid over-cap boost: ${config.overCapBoost} (should be between 100 and 1000)`);
  }

  return {
    isValid: errors.length === 0,
    config,
    errors,
  };
}

export default {
  calculateTaskPoints,
  calculateMultipleTaskPoints,
  getServicePointsWeights,
  validateTaskFactors,
  calculateMaxTaskPoints,
  calculateMinTaskPoints,
  getServicePointsConstants,
  getSkillConfigurations,
  getSkillConfiguration,
  analyzePointsFairness,
  validateSkillArea,
};
