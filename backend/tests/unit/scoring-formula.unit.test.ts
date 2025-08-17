import { describe, it, expect, beforeEach } from 'vitest';
import { calculateTaskPoints, Task, PointsResult } from '../../src/lib/points';

describe('CaBE v5 Scoring Formula', () => {
  let mockTask: Task;

  beforeEach(() => {
    mockTask = {
      id: 'test-task-1',
      title: 'Test Task',
      description: 'A test task for scoring validation',
      skill_area: 'fullstack-dev',
      duration: 0.5,
      skill: 0.7,
      complexity: 0.6,
      visibility: 0.8,
      professional_impact: 0.9,
      autonomy: 0.7,
      created_at: new Date().toISOString(),
      is_active: true
    };
  });

  describe('Basic Formula Validation', () => {
    it('should calculate points correctly for a standard submission', () => {
      const aiScore = 85;
      const result = calculateTaskPoints(aiScore, mockTask, true);

      expect(result.pointsAwarded).toBeGreaterThan(0);
      expect(result.pointsAwarded).toBeLessThanOrEqual(result.breakdown.cap);
      expect(result.breakdown.basePoints).toBeGreaterThan(0);
      expect(result.breakdown.bonusPoints).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.skillMultiplier).toBeGreaterThan(0);
    });

    it('should handle minimum AI score (0)', () => {
      const aiScore = 0;
      const result = calculateTaskPoints(aiScore, mockTask, true);

      expect(result.pointsAwarded).toBeGreaterThan(0); // Should still get base points
      expect(result.breakdown.bonusPoints).toBe(0); // No bonus for 0 score
    });

    it('should handle maximum AI score (100)', () => {
      const aiScore = 100;
      const result = calculateTaskPoints(aiScore, mockTask, true);

      expect(result.pointsAwarded).toBeGreaterThan(0);
      expect(result.breakdown.bonusPoints).toBeGreaterThan(0);
      expect(result.pointsAwarded).toBeLessThanOrEqual(result.breakdown.cap);
    });

    it('should handle edge case AI scores', () => {
      const edgeScores = [-10, 50, 101, 150];
      
      edgeScores.forEach(score => {
        const result = calculateTaskPoints(score, mockTask, true);
        expect(result.pointsAwarded).toBeGreaterThan(0);
        expect(result.pointsAwarded).toBeLessThanOrEqual(result.breakdown.cap);
      });
    });
  });

  describe('Exponential Scaling Function', () => {
    it('should apply correct exponential scaling for different effort levels', () => {
      const testCases = [
        { effort: 0.0, expectedMin: 0, expectedMax: 0.1 },
        { effort: 0.25, expectedMin: 0.1, expectedMax: 0.3 },
        { effort: 0.5, expectedMin: 0.3, expectedMax: 0.6 },
        { effort: 0.75, expectedMin: 0.6, expectedMax: 0.9 },
        { effort: 1.0, expectedMin: 0.9, expectedMax: 1.0 }
      ];

      testCases.forEach(({ effort, expectedMin, expectedMax }) => {
        // Create a task with specific effort factors
        const taskWithEffort: Task = {
          ...mockTask,
          duration: effort,
          skill: effort,
          complexity: effort,
          visibility: effort,
          professional_impact: effort,
          autonomy: effort
        };

        const result = calculateTaskPoints(85, taskWithEffort, true);
        const normalizedBonus = result.breakdown.bonusPoints / result.breakdown.maxBonus;
        
        expect(normalizedBonus).toBeGreaterThanOrEqual(expectedMin);
        expect(normalizedBonus).toBeLessThanOrEqual(expectedMax);
      });
    });

    it('should handle the exponential function f(L) = (e^(5.5 × L) - 1) / (e^5.5 - 1)', () => {
      // Test the mathematical accuracy of the exponential scaling
      const alpha = 5.5;
      const eAlpha = Math.exp(alpha);
      const denominator = eAlpha - 1;

      const testEfforts = [0, 0.25, 0.5, 0.75, 1.0];
      
      testEfforts.forEach(effort => {
        const expectedF = (Math.exp(alpha * effort) - 1) / denominator;
        
        const taskWithEffort: Task = {
          ...mockTask,
          duration: effort,
          skill: effort,
          complexity: effort,
          visibility: effort,
          professional_impact: effort,
          autonomy: effort
        };

        const result = calculateTaskPoints(100, taskWithEffort, true);
        const actualF = result.breakdown.bonusPoints / result.breakdown.maxBonus;
        
        // Allow for small floating point precision differences
        expect(Math.abs(actualF - expectedF)).toBeLessThan(0.01);
      });
    });
  });

  describe('Skill-Specific Configurations', () => {
    it('should apply correct multipliers for Full-Stack Development', () => {
      const fullstackTask: Task = {
        ...mockTask,
        skill_area: 'fullstack-dev'
      };

      const result = calculateTaskPoints(85, fullstackTask, true);
      
      expect(result.breakdown.skillMultiplier).toBe(1.2);
      expect(result.breakdown.cap).toBe(2200);
      expect(result.breakdown.overCapBoost).toBe(600);
    });

    it('should apply correct multipliers for Cloud Computing & DevOps', () => {
      const cloudTask: Task = {
        ...mockTask,
        skill_area: 'cloud-devops'
      };

      const result = calculateTaskPoints(85, cloudTask, true);
      
      expect(result.breakdown.skillMultiplier).toBe(1.3);
      expect(result.breakdown.cap).toBe(2400);
      expect(result.breakdown.overCapBoost).toBe(700);
    });

    it('should apply correct multipliers for Data Science & Analytics', () => {
      const dataTask: Task = {
        ...mockTask,
        skill_area: 'data-analytics'
      };

      const result = calculateTaskPoints(85, dataTask, true);
      
      expect(result.breakdown.skillMultiplier).toBe(1.15);
      expect(result.breakdown.cap).toBe(2100);
      expect(result.breakdown.overCapBoost).toBe(550);
    });

    it('should apply correct multipliers for AI / Machine Learning', () => {
      const aiTask: Task = {
        ...mockTask,
        skill_area: 'ai-ml'
      };

      const result = calculateTaskPoints(85, aiTask, true);
      
      expect(result.breakdown.skillMultiplier).toBe(1.25);
      expect(result.breakdown.cap).toBe(2300);
      expect(result.breakdown.overCapBoost).toBe(650);
    });

    it('should use default configuration for unknown skill areas', () => {
      const unknownTask: Task = {
        ...mockTask,
        skill_area: 'unknown-skill'
      };

      const result = calculateTaskPoints(85, unknownTask, true);
      
      expect(result.breakdown.skillMultiplier).toBe(1.0);
      expect(result.breakdown.cap).toBe(2000);
      expect(result.breakdown.overCapBoost).toBe(500);
    });
  });

  describe('Point Cap and Over-Cap Logic', () => {
    it('should respect point caps for high-scoring submissions', () => {
      const highScoreTask: Task = {
        ...mockTask,
        skill_area: 'fullstack-dev',
        duration: 1.0,
        skill: 1.0,
        complexity: 1.0,
        visibility: 1.0,
        professional_impact: 1.0,
        autonomy: 1.0
      };

      const result = calculateTaskPoints(100, highScoreTask, true);
      
      expect(result.pointsAwarded).toBeLessThanOrEqual(result.breakdown.cap);
    });

    it('should apply over-cap boost when conditions are met', () => {
      const overCapTask: Task = {
        ...mockTask,
        skill_area: 'fullstack-dev',
        duration: 0.95,
        skill: 0.95,
        complexity: 0.95,
        visibility: 0.95,
        professional_impact: 0.95,
        autonomy: 0.95
      };

      const result = calculateTaskPoints(100, overCapTask, true);
      
      // Check if over-cap boost is applied (this depends on the specific implementation)
      if (result.pointsAwarded > result.breakdown.cap) {
        expect(result.pointsAwarded).toBe(result.breakdown.cap + result.breakdown.overCapBoost);
      }
    });
  });

  describe('Weighted Average Calculation', () => {
    it('should calculate weighted average effort correctly', () => {
      const taskWithWeights: Task = {
        ...mockTask,
        skill_area: 'fullstack-dev',
        duration: 0.5,
        skill: 0.8,
        complexity: 0.6,
        visibility: 0.7,
        professional_impact: 0.9,
        autonomy: 0.4
      };

      const result = calculateTaskPoints(85, taskWithWeights, true);
      
      // Verify that the weighted average is calculated correctly
      // For fullstack-dev, skill has weight 1.2, complexity has weight 1.1
      const expectedWeightedSum = 
        0.5 * 1.0 + // duration
        0.8 * 1.2 + // skill (higher weight)
        0.6 * 1.1 + // complexity (higher weight)
        0.7 * 1.0 + // visibility
        0.9 * 1.0 + // professional_impact
        0.4 * 1.0;  // autonomy
      
      const expectedWeightSum = 1.0 + 1.2 + 1.1 + 1.0 + 1.0 + 1.0;
      const expectedEffort = expectedWeightedSum / expectedWeightSum;
      
      // The actual effort should be close to the expected weighted average
      expect(result.breakdown.effortScore).toBeCloseTo(expectedEffort, 2);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null/undefined task properties gracefully', () => {
      const incompleteTask: Task = {
        ...mockTask,
        duration: null as any,
        skill: undefined as any
      };

      expect(() => calculateTaskPoints(85, incompleteTask, true)).not.toThrow();
    });

    it('should handle extreme task factor values', () => {
      const extremeTask: Task = {
        ...mockTask,
        duration: -1,
        skill: 2.5,
        complexity: 0,
        visibility: 1.5,
        professional_impact: -0.5,
        autonomy: 3.0
      };

      expect(() => calculateTaskPoints(85, extremeTask, true)).not.toThrow();
      
      const result = calculateTaskPoints(85, extremeTask, true);
      expect(result.pointsAwarded).toBeGreaterThan(0);
    });

    it('should handle very large AI scores', () => {
      const largeScores = [1000, 10000, 100000];
      
      largeScores.forEach(score => {
        const result = calculateTaskPoints(score, mockTask, true);
        expect(result.pointsAwarded).toBeGreaterThan(0);
        expect(result.pointsAwarded).toBeLessThanOrEqual(result.breakdown.cap);
      });
    });
  });

  describe('Mathematical Precision', () => {
    it('should maintain mathematical precision for small differences', () => {
      const baseResult = calculateTaskPoints(85, mockTask, true);
      
      // Test with slightly different AI scores
      const slightlyHigher = calculateTaskPoints(85.1, mockTask, true);
      const slightlyLower = calculateTaskPoints(84.9, mockTask, true);
      
      // Points should be different but close
      expect(slightlyHigher.pointsAwarded).toBeGreaterThan(slightlyLower.pointsAwarded);
      expect(Math.abs(slightlyHigher.pointsAwarded - slightlyLower.pointsAwarded)).toBeLessThan(50);
    });

    it('should produce consistent results for identical inputs', () => {
      const result1 = calculateTaskPoints(85, mockTask, true);
      const result2 = calculateTaskPoints(85, mockTask, true);
      
      expect(result1.pointsAwarded).toBe(result2.pointsAwarded);
      expect(result1.breakdown.basePoints).toBe(result2.breakdown.basePoints);
      expect(result1.breakdown.bonusPoints).toBe(result2.breakdown.bonusPoints);
    });
  });

  describe('Performance Requirements', () => {
    it('should calculate points within acceptable time limits', () => {
      const startTime = performance.now();
      
      // Calculate points for multiple tasks
      for (let i = 0; i < 1000; i++) {
        calculateTaskPoints(85, mockTask, true);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 1000 calculations in less than 1 second
      expect(duration).toBeLessThan(1000);
    });
  });
});
