/**
 * CaBE v5 Points Calculation System
 *
 * This module implements the CaBE v5 scoring logic for calculating points
 * awarded based on task performance and task characteristics.
 */

// Task interface for points calculation
export interface Task {
  id: string;
  title: string;
  description: string;
  skill_area: string;
  duration: number; // Duration factor (0-100)
  skill: number; // Skill factor (0-100)
  complexity: number; // Complexity factor (0-100)
  visibility: number; // Visibility factor (0-100)
  professional_impact: number; // Professional Impact factor (0-100)
  autonomy: number; // Autonomy factor (0-100)
  created_at: string;
  is_active: boolean;
}

// Points calculation result
export interface PointsResult {
  pointsAwarded: number;
  breakdown?: {
    base: number;
    bonus: number;
    normalizedFactors: {
      duration: number;
      skill: number;
      complexity: number;
      visibility: number;
      professional_impact: number;
      autonomy: number;
    };
    weights: {
      duration: number;
      skill: number;
      complexity: number;
      visibility: number;
      professional_impact: number;
      autonomy: number;
    };
    weightedSum: number;
    totalWeight: number;
    bonusMax: number;
  };
}

// CaBE v5 Weights
const WEIGHTS = {
  duration: 1.2,
  skill: 0.9,
  complexity: 0.8,
  visibility: 0.5,
  professional_impact: 1.0,
  autonomy: 0.2,
};

/**
 * Normalize a value from 0-100 range to 0-1 range
 * @param value - The value to normalize (0-100)
 * @returns Normalized value (0-1)
 */
function normalizeValue(value: number): number {
  return Math.max(0, Math.min(1, value / 100));
}

/**
 * Calculate task points using CaBE v5 scoring logic
 *
 * Formula: Bonus = B_max × (Σ(Wᵢ × Nᵢ) / ΣW) + R
 * Total Points = Base + round(Bonus)
 *
 * Where:
 * - Nᵢ = normalized factor value from 0–1
 * - Wᵢ = corresponding weight
 * - B_max = (score / 100) × 100
 * - Base = 0, R = 0
 *
 * @param score - Performance score (0-100)
 * @param task - Task object with all six factor fields
 * @param includeBreakdown - Whether to include detailed breakdown in result
 * @returns Points calculation result
 */
export function calculateTaskPoints(
  score: number,
  task: Task,
  includeBreakdown: boolean = false
): PointsResult {
  // Validate inputs
  if (score < 0 || score > 100) {
    throw new Error('Score must be between 0 and 100');
  }

  if (!task) {
    throw new Error('Task object is required');
  }

  // Validate task factors are present
  const requiredFactors = [
    'duration',
    'skill',
    'complexity',
    'visibility',
    'professional_impact',
    'autonomy',
  ];
  for (const factor of requiredFactors) {
    if (
      task[factor as keyof Task] === undefined ||
      task[factor as keyof Task] === null
    ) {
      throw new Error(`Task is missing required factor: ${factor}`);
    }
  }

  // Normalize all factor values to 0-1 range
  const normalizedFactors = {
    duration: normalizeValue(task.duration),
    skill: normalizeValue(task.skill),
    complexity: normalizeValue(task.complexity),
    visibility: normalizeValue(task.visibility),
    professional_impact: normalizeValue(task.professional_impact),
    autonomy: normalizeValue(task.autonomy),
  };

  // Calculate weighted sum: Σ(Wᵢ × Nᵢ)
  const weightedSum =
    WEIGHTS.duration * normalizedFactors.duration +
    WEIGHTS.skill * normalizedFactors.skill +
    WEIGHTS.complexity * normalizedFactors.complexity +
    WEIGHTS.visibility * normalizedFactors.visibility +
    WEIGHTS.professional_impact * normalizedFactors.professional_impact +
    WEIGHTS.autonomy * normalizedFactors.autonomy;

  // Calculate total weight: ΣW
  const totalWeight = Object.values(WEIGHTS).reduce(
    (sum, weight) => sum + weight,
    0
  );

  // Calculate B_max = (score / 100) × 100
  const bonusMax = (score / 100) * 100;

  // Calculate bonus: B_max × (Σ(Wᵢ × Nᵢ) / ΣW) + R
  // Where R = 0
  const bonus = bonusMax * (weightedSum / totalWeight) + 0;

  // Calculate total points: Base + round(Bonus)
  // Where Base = 0
  const base = 0;
  const pointsAwarded = base + Math.round(bonus);

  // Ensure points are non-negative
  const finalPoints = Math.max(0, pointsAwarded);

  const result: PointsResult = {
    pointsAwarded: finalPoints,
  };

  // Include breakdown if requested
  if (includeBreakdown) {
    result.breakdown = {
      base,
      bonus,
      normalizedFactors,
      weights: WEIGHTS,
      weightedSum,
      totalWeight,
      bonusMax,
    };
  }

  return result;
}

/**
 * Calculate points for multiple tasks and return summary
 * @param score - Performance score (0-100)
 * @param tasks - Array of task objects
 * @returns Summary of points calculation
 */
export function calculateMultipleTaskPoints(
  score: number,
  tasks: Task[]
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
    const result = calculateTaskPoints(score, task);
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
 * Get CaBE v5 weights for reference
 * @returns Object containing all weights
 */
export function getCaBEWeights(): typeof WEIGHTS {
  return { ...WEIGHTS };
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
    { name: 'professional_impact', value: task.professional_impact },
    { name: 'autonomy', value: task.autonomy },
  ];

  for (const factor of factors) {
    if (factor.value === undefined || factor.value === null) {
      errors.push(`Missing required factor: ${factor.name}`);
    } else if (factor.value < 0 || factor.value > 100) {
      errors.push(
        `${factor.name} must be between 0 and 100, got: ${factor.value}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate theoretical maximum points for a task
 * @param task - Task object
 * @returns Maximum possible points
 */
export function calculateMaxTaskPoints(task: Task): number {
  return calculateTaskPoints(100, task).pointsAwarded;
}

/**
 * Calculate theoretical minimum points for a task
 * @param task - Task object
 * @returns Minimum possible points
 */
export function calculateMinTaskPoints(task: Task): number {
  return calculateTaskPoints(0, task).pointsAwarded;
}

export default {
  calculateTaskPoints,
  calculateMultipleTaskPoints,
  getCaBEWeights,
  validateTaskFactors,
  calculateMaxTaskPoints,
  calculateMinTaskPoints,
};
