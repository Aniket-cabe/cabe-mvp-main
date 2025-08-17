import { describe, it, expect, beforeEach } from 'vitest';

// Service Points Formula v5 Implementation
interface TaskSubmission {
  taskId: string;
  skillCategory: string;
  taskType: 'practice' | 'mini_project';
  basePoints: number;
  maxPoints: number;
  proofStrength: number; // 10, 25, or 50
  userLevel: number; // Current user level
  skillWeight: number; // Weight for this skill category
}

interface ScoringResult {
  pointsAwarded: number;
  bonusPoints: number;
  totalPoints: number;
  rankProgress: number;
  newRank: string;
}

// Service Points Formula v5
class ServicePointsFormulaV5 {
  private readonly ALPHA = 5.5; // Exponential scaling factor
  private readonly MAX_BONUS_CAP = 1000; // Maximum bonus cap
  private readonly OVER_CAP_BOOST = 1.5; // Multiplier when over cap

  // Exponential scaling function f(L) = (e^(5.5 × L) - 1) / (e^5.5 - 1)
  private exponentialScaling(level: number): number {
    const numerator = Math.exp(this.ALPHA * level) - 1;
    const denominator = Math.exp(this.ALPHA) - 1;
    return numerator / denominator;
  }

  // Calculate bonus points: Bonus = Bmax × (Σ(Wᵢ × Nᵢ) / ΣW) + R
  private calculateBonus(
    maxBonus: number,
    skillWeights: number[],
    skillCounts: number[],
    proofStrength: number
  ): number {
    const weightedSum = skillWeights.reduce((sum, weight, index) => {
      return sum + (weight * skillCounts[index]);
    }, 0);
    
    const totalWeight = skillWeights.reduce((sum, weight) => sum + weight, 0);
    const weightedAverage = weightedSum / totalWeight;
    
    return Math.min(maxBonus * weightedAverage + proofStrength, this.MAX_BONUS_CAP);
  }

  // Calculate rank based on total points
  private calculateRank(totalPoints: number): { rank: string; progress: number } {
    if (totalPoints < 1000) {
      return { rank: 'Bronze', progress: (totalPoints / 1000) * 100 };
    } else if (totalPoints < 5000) {
      return { rank: 'Silver', progress: ((totalPoints - 1000) / 4000) * 100 };
    } else if (totalPoints < 15000) {
      return { rank: 'Gold', progress: ((totalPoints - 5000) / 10000) * 100 };
    } else if (totalPoints < 50000) {
      return { rank: 'Platinum', progress: ((totalPoints - 15000) / 35000) * 100 };
    } else {
      return { rank: 'Diamond', progress: 100 };
    }
  }

  // Main scoring function
  calculatePoints(submission: TaskSubmission, userHistory: TaskSubmission[]): ScoringResult {
    // Base points calculation
    const basePoints = submission.basePoints;
    
    // Calculate user level from history
    const userLevel = this.calculateUserLevel(userHistory);
    
    // Apply exponential scaling
    const scaledPoints = basePoints * this.exponentialScaling(userLevel);
    
    // Calculate bonus points
    const skillWeights = this.getSkillWeights(userHistory);
    const skillCounts = this.getSkillCounts(userHistory);
    const maxBonus = submission.maxPoints - submission.basePoints;
    
    let bonusPoints = this.calculateBonus(
      maxBonus,
      skillWeights,
      skillCounts,
      submission.proofStrength
    );
    
    // Apply over-cap boost if bonus exceeds cap
    if (bonusPoints >= this.MAX_BONUS_CAP) {
      bonusPoints *= this.OVER_CAP_BOOST;
    }
    
    const totalPoints = Math.round(scaledPoints + bonusPoints);
    
    // Calculate rank progression
    const currentTotalPoints = this.calculateTotalPoints(userHistory) + totalPoints;
    const { rank, progress } = this.calculateRank(currentTotalPoints);
    
    return {
      pointsAwarded: totalPoints,
      bonusPoints: Math.round(bonusPoints),
      totalPoints: currentTotalPoints,
      rankProgress: progress,
      newRank: rank
    };
  }

  private calculateUserLevel(history: TaskSubmission[]): number {
    if (history.length === 0) return 0;
    
    const totalPoints = this.calculateTotalPoints(history);
    return Math.floor(totalPoints / 1000); // Level increases every 1000 points
  }

  private calculateTotalPoints(history: TaskSubmission[]): number {
    return history.reduce((sum, submission) => sum + submission.basePoints, 0);
  }

  private getSkillWeights(history: TaskSubmission[]): number[] {
    // Default skill weights for 4 categories
    return [1.0, 1.0, 1.0, 1.0]; // Equal weights for MVP
  }

  private getSkillCounts(history: TaskSubmission[]): number[] {
    const skillCounts = [0, 0, 0, 0];
    const skillCategories = [
      'Full-Stack Software Development',
      'Cloud Computing & DevOps',
      'Data Science & Analytics',
      'AI / Machine Learning'
    ];
    
    history.forEach(submission => {
      const index = skillCategories.indexOf(submission.skillCategory);
      if (index !== -1) {
        skillCounts[index]++;
      }
    });
    
    return skillCounts;
  }
}

describe('Service Points Formula v5', () => {
  let formula: ServicePointsFormulaV5;
  let mockSubmission: TaskSubmission;
  let mockHistory: TaskSubmission[];

  beforeEach(() => {
    formula = new ServicePointsFormulaV5();
    
    mockSubmission = {
      taskId: 'task-1',
      skillCategory: 'Full-Stack Software Development',
      taskType: 'practice',
      basePoints: 50,
      maxPoints: 200,
      proofStrength: 25,
      userLevel: 0,
      skillWeight: 1.0
    };
    
    mockHistory = [];
  });

  describe('Exponential Scaling Function', () => {
    it('should return 0 for level 0', () => {
      const result = formula['exponentialScaling'](0);
      expect(result).toBe(0);
    });

    it('should return 1 for level 1', () => {
      const result = formula['exponentialScaling'](1);
      expect(result).toBe(1);
    });

    it('should scale exponentially for higher levels', () => {
      const level2 = formula['exponentialScaling'](2);
      const level3 = formula['exponentialScaling'](3);
      
      expect(level2).toBeGreaterThan(1);
      expect(level3).toBeGreaterThan(level2);
      expect(level3 / level2).toBeGreaterThan(level2); // Exponential growth
    });

    it('should handle negative levels gracefully', () => {
      const result = formula['exponentialScaling'](-1);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });
  });

  describe('Bonus Calculation', () => {
    it('should calculate bonus with equal skill weights', () => {
      const skillWeights = [1.0, 1.0, 1.0, 1.0];
      const skillCounts = [2, 1, 0, 1];
      const maxBonus = 150;
      const proofStrength = 25;
      
      const bonus = formula['calculateBonus'](maxBonus, skillWeights, skillCounts, proofStrength);
      
      // Expected: (150 * (2+1+0+1)/4) + 25 = (150 * 1) + 25 = 175
      expect(bonus).toBe(175);
    });

    it('should respect maximum bonus cap', () => {
      const skillWeights = [1.0, 1.0, 1.0, 1.0];
      const skillCounts = [10, 10, 10, 10]; // High counts
      const maxBonus = 2000; // Exceeds cap
      const proofStrength = 50;
      
      const bonus = formula['calculateBonus'](maxBonus, skillWeights, skillCounts, proofStrength);
      
      expect(bonus).toBe(1000); // Should be capped at MAX_BONUS_CAP
    });

    it('should apply over-cap boost when bonus exceeds cap', () => {
      const skillWeights = [1.0, 1.0, 1.0, 1.0];
      const skillCounts = [10, 10, 10, 10];
      const maxBonus = 2000;
      const proofStrength = 50;
      
      const bonus = formula['calculateBonus'](maxBonus, skillWeights, skillCounts, proofStrength);
      
      // Should be capped at 1000, then boosted by 1.5
      expect(bonus).toBe(1500);
    });
  });

  describe('Rank Calculation', () => {
    it('should return Bronze for 0-999 points', () => {
      const { rank, progress } = formula['calculateRank'](500);
      expect(rank).toBe('Bronze');
      expect(progress).toBe(50); // 50% progress to Silver
    });

    it('should return Silver for 1000-4999 points', () => {
      const { rank, progress } = formula['calculateRank'](3000);
      expect(rank).toBe('Silver');
      expect(progress).toBe(50); // 50% progress to Gold
    });

    it('should return Gold for 5000-14999 points', () => {
      const { rank, progress } = formula['calculateRank'](10000);
      expect(rank).toBe('Gold');
      expect(progress).toBe(50); // 50% progress to Platinum
    });

    it('should return Platinum for 15000-49999 points', () => {
      const { rank, progress } = formula['calculateRank'](32500);
      expect(rank).toBe('Platinum');
      expect(progress).toBe(50); // 50% progress to Diamond
    });

    it('should return Diamond for 50000+ points', () => {
      const { rank, progress } = formula['calculateRank'](60000);
      expect(rank).toBe('Diamond');
      expect(progress).toBe(100);
    });
  });

  describe('Complete Scoring Integration', () => {
    it('should calculate points for new user', () => {
      const result = formula.calculatePoints(mockSubmission, []);
      
      expect(result.pointsAwarded).toBeGreaterThan(mockSubmission.basePoints);
      expect(result.bonusPoints).toBeGreaterThan(0);
      expect(result.newRank).toBe('Bronze');
      expect(result.rankProgress).toBeGreaterThan(0);
    });

    it('should scale points based on user level', () => {
      // Create history to increase user level
      const history = Array(5).fill(null).map((_, i) => ({
        ...mockSubmission,
        taskId: `task-${i}`,
        basePoints: 200
      }));
      
      const result = formula.calculatePoints(mockSubmission, history);
      
      // Higher level should result in more points due to exponential scaling
      expect(result.pointsAwarded).toBeGreaterThan(mockSubmission.basePoints * 2);
    });

    it('should handle different proof strengths correctly', () => {
      const weakProof = { ...mockSubmission, proofStrength: 10 };
      const strongProof = { ...mockSubmission, proofStrength: 50 };
      
      const weakResult = formula.calculatePoints(weakProof, []);
      const strongResult = formula.calculatePoints(strongProof, []);
      
      expect(strongResult.pointsAwarded).toBeGreaterThan(weakResult.pointsAwarded);
    });

    it('should calculate rank progression correctly', () => {
      // Create history to reach Silver rank
      const history = Array(6).fill(null).map((_, i) => ({
        ...mockSubmission,
        taskId: `task-${i}`,
        basePoints: 200
      }));
      
      const result = formula.calculatePoints(mockSubmission, history);
      
      expect(result.newRank).toBe('Silver');
      expect(result.rankProgress).toBeGreaterThan(0);
      expect(result.rankProgress).toBeLessThanOrEqual(100);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty submission history', () => {
      const result = formula.calculatePoints(mockSubmission, []);
      expect(result.pointsAwarded).toBeGreaterThan(0);
      expect(result.newRank).toBe('Bronze');
    });

    it('should handle very high proof strength', () => {
      const highStrengthSubmission = { ...mockSubmission, proofStrength: 100 };
      const result = formula.calculatePoints(highStrengthSubmission, []);
      expect(result.pointsAwarded).toBeGreaterThan(mockSubmission.basePoints);
    });

    it('should handle zero base points', () => {
      const zeroPointsSubmission = { ...mockSubmission, basePoints: 0 };
      const result = formula.calculatePoints(zeroPointsSubmission, []);
      expect(result.pointsAwarded).toBeGreaterThan(0); // Should still get bonus points
    });

    it('should handle negative proof strength', () => {
      const negativeStrengthSubmission = { ...mockSubmission, proofStrength: -10 };
      const result = formula.calculatePoints(negativeStrengthSubmission, []);
      expect(result.pointsAwarded).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large submission history efficiently', () => {
      const largeHistory = Array(1000).fill(null).map((_, i) => ({
        ...mockSubmission,
        taskId: `task-${i}`,
        basePoints: 100
      }));
      
      const startTime = Date.now();
      const result = formula.calculatePoints(mockSubmission, largeHistory);
      const endTime = Date.now();
      
      expect(result.pointsAwarded).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should maintain mathematical precision', () => {
      const result = formula.calculatePoints(mockSubmission, []);
      
      // Points should be rounded to whole numbers
      expect(Number.isInteger(result.pointsAwarded)).toBe(true);
      expect(Number.isInteger(result.bonusPoints)).toBe(true);
      expect(Number.isInteger(result.totalPoints)).toBe(true);
    });
  });
});
