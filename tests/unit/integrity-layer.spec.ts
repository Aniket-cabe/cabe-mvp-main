import { describe, it, expect, beforeEach, vi } from 'vitest';

// Integrity Layer Implementation
interface IntegrityCheck {
  submissionId: string;
  userId: string;
  proofText: string;
  proofType: 'text' | 'image' | 'file' | 'link';
  proofUrl?: string;
  submissionTime: Date;
  userHistory: SubmissionHistory[];
}

interface SubmissionHistory {
  submissionId: string;
  submissionTime: Date;
  proofText: string;
  pointsAwarded: number;
  status: 'approved' | 'rejected' | 'pending';
}

interface IntegrityResult {
  isSuspicious: boolean;
  riskScore: number;
  flags: string[];
  deterrentMessage?: string;
  requiresReview: boolean;
  autoReject: boolean;
}

class IntegrityLayer {
  private readonly SUSPICIOUS_PATTERNS = [
    /fake/i,
    /test/i,
    /placeholder/i,
    /lorem ipsum/i,
    /asdf/i,
    /qwerty/i,
    /123456/i,
    /password/i
  ];

  private readonly MIN_PROOF_LENGTH = 20;
  private readonly MAX_SUBMISSIONS_PER_HOUR = 10;
  private readonly MIN_TIME_BETWEEN_SUBMISSIONS = 300000; // 5 minutes in ms
  private readonly HIGH_RISK_THRESHOLD = 0.7;
  private readonly AUTO_REJECT_THRESHOLD = 0.9;

  // Main integrity check function
  checkIntegrity(submission: IntegrityCheck): IntegrityResult {
    const flags: string[] = [];
    let riskScore = 0;

    // Check for suspicious patterns in proof text
    const patternFlags = this.checkSuspiciousPatterns(submission.proofText);
    flags.push(...patternFlags);
    riskScore += patternFlags.length * 0.2;

    // Check proof length
    if (submission.proofText.length < this.MIN_PROOF_LENGTH) {
      flags.push('PROOF_TOO_SHORT');
      riskScore += 0.3;
    }

    // Check submission frequency
    const frequencyFlags = this.checkSubmissionFrequency(submission);
    flags.push(...frequencyFlags);
    riskScore += frequencyFlags.length * 0.25;

    // Check for duplicate submissions
    if (this.isDuplicateSubmission(submission)) {
      flags.push('DUPLICATE_SUBMISSION');
      riskScore += 0.4;
    }

    // Check for rapid point accumulation
    const rapidAccumulationFlags = this.checkRapidPointAccumulation(submission);
    flags.push(...rapidAccumulationFlags);
    riskScore += rapidAccumulationFlags.length * 0.3;

    // Check for suspicious timing patterns
    const timingFlags = this.checkSuspiciousTiming(submission);
    flags.push(...timingFlags);
    riskScore += timingFlags.length * 0.2;

    // Determine if submission is suspicious
    const isSuspicious = riskScore > 0.3;
    const requiresReview = riskScore > this.HIGH_RISK_THRESHOLD;
    const autoReject = riskScore > this.AUTO_REJECT_THRESHOLD;

    // Generate deterrent message if suspicious
    let deterrentMessage: string | undefined;
    if (isSuspicious && !autoReject) {
      deterrentMessage = this.generateDeterrentMessage(flags);
    }

    return {
      isSuspicious,
      riskScore: Math.min(riskScore, 1.0),
      flags,
      deterrentMessage,
      requiresReview,
      autoReject
    };
  }

  private checkSuspiciousPatterns(proofText: string): string[] {
    const flags: string[] = [];
    
    this.SUSPICIOUS_PATTERNS.forEach(pattern => {
      if (pattern.test(proofText)) {
        flags.push('SUSPICIOUS_PATTERN');
      }
    });

    // Check for repeated characters
    if (/(.)\1{5,}/.test(proofText)) {
      flags.push('REPEATED_CHARACTERS');
    }

    // Check for random character sequences
    if (/[a-z]{10,}/i.test(proofText) && !/\s/.test(proofText)) {
      flags.push('RANDOM_CHARACTERS');
    }

    return flags;
  }

  private checkSubmissionFrequency(submission: IntegrityCheck): string[] {
    const flags: string[] = [];
    const oneHourAgo = new Date(submission.submissionTime.getTime() - 3600000);
    
    const recentSubmissions = submission.userHistory.filter(
      history => history.submissionTime > oneHourAgo
    );

    if (recentSubmissions.length >= this.MAX_SUBMISSIONS_PER_HOUR) {
      flags.push('TOO_MANY_SUBMISSIONS');
    }

    // Check time between submissions
    if (submission.userHistory.length > 0) {
      const lastSubmission = submission.userHistory[0];
      const timeDiff = submission.submissionTime.getTime() - lastSubmission.submissionTime.getTime();
      
      if (timeDiff < this.MIN_TIME_BETWEEN_SUBMISSIONS) {
        flags.push('SUBMISSIONS_TOO_CLOSE');
      }
    }

    return flags;
  }

  private isDuplicateSubmission(submission: IntegrityCheck): boolean {
    return submission.userHistory.some(history => 
      history.proofText.toLowerCase().trim() === submission.proofText.toLowerCase().trim()
    );
  }

  private checkRapidPointAccumulation(submission: IntegrityCheck): string[] {
    const flags: string[] = [];
    const oneDayAgo = new Date(submission.submissionTime.getTime() - 86400000);
    
    const recentPoints = submission.userHistory
      .filter(history => history.submissionTime > oneDayAgo)
      .reduce((sum, history) => sum + history.pointsAwarded, 0);

    // Flag if user earned more than 2000 points in a day
    if (recentPoints > 2000) {
      flags.push('RAPID_POINT_ACCUMULATION');
    }

    return flags;
  }

  private checkSuspiciousTiming(submission: IntegrityCheck): string[] {
    const flags: string[] = [];
    const hour = submission.submissionTime.getHours();

    // Flag submissions at unusual hours (2 AM - 6 AM)
    if (hour >= 2 && hour <= 6) {
      flags.push('UNUSUAL_SUBMISSION_TIME');
    }

    // Check for submissions at exact minute intervals (suggesting automation)
    const minute = submission.submissionTime.getMinutes();
    if (minute === 0 || minute === 30) {
      flags.push('REGULAR_SUBMISSION_PATTERN');
    }

    return flags;
  }

  private generateDeterrentMessage(flags: string[]): string {
    const messages = [
      "We've noticed some unusual activity with your submission. Please ensure your proof demonstrates genuine effort and learning.",
      "Your submission has been flagged for review. High-quality proofs typically include detailed explanations and evidence of work completed.",
      "We're reviewing your submission to ensure it meets our quality standards. Please provide more detailed proof of your work.",
      "Your submission appears to be incomplete. Please provide a more comprehensive proof of task completion.",
      "We've detected patterns that suggest this submission may not reflect genuine work. Please review and resubmit with more detailed proof."
    ];

    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }

  // Psychological deterrents
  generateFakeMessage(): string {
    const fakeMessages = [
      "🎉 Congratulations! You've been selected for an exclusive internship opportunity!",
      "💼 New gig opportunity: $500 for a 2-hour coding session",
      "🌟 You've unlocked the premium features! Access advanced analytics now.",
      "🏆 You're in the top 5% of users! Special rewards await.",
      "📈 Your profile has been featured on our leaderboard!",
      "🎯 New achievement unlocked: Speed Demon - Complete 10 tasks in 1 hour",
      "💎 Diamond rank users get exclusive access to premium job opportunities",
      "🚀 You've been nominated for our monthly excellence award!"
    ];

    const randomIndex = Math.floor(Math.random() * fakeMessages.length);
    return fakeMessages[randomIndex];
  }

  // Check if user should see fake message (10% chance)
  shouldShowFakeMessage(): boolean {
    return Math.random() < 0.1;
  }
}

describe('Integrity Layer', () => {
  let integrityLayer: IntegrityLayer;
  let mockSubmission: IntegrityCheck;

  beforeEach(() => {
    integrityLayer = new IntegrityLayer();
    
    mockSubmission = {
      submissionId: 'sub-1',
      userId: 'user-1',
      proofText: 'I completed the React component task by creating a responsive navigation bar with proper state management.',
      proofType: 'text',
      submissionTime: new Date(),
      userHistory: []
    };
  });

  describe('Suspicious Pattern Detection', () => {
    it('should detect fake/test patterns', () => {
      const fakeSubmission = {
        ...mockSubmission,
        proofText: 'This is a fake submission for testing purposes'
      };

      const result = integrityLayer.checkIntegrity(fakeSubmission);
      
      expect(result.isSuspicious).toBe(true);
      expect(result.flags).toContain('SUSPICIOUS_PATTERN');
      expect(result.riskScore).toBeGreaterThan(0.2);
    });

    it('should detect placeholder text', () => {
      const placeholderSubmission = {
        ...mockSubmission,
        proofText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'
      };

      const result = integrityLayer.checkIntegrity(placeholderSubmission);
      
      expect(result.isSuspicious).toBe(true);
      expect(result.flags).toContain('SUSPICIOUS_PATTERN');
    });

    it('should detect repeated characters', () => {
      const repeatedSubmission = {
        ...mockSubmission,
        proofText: 'I completed the task aaaaaaaand it was great'
      };

      const result = integrityLayer.checkIntegrity(repeatedSubmission);
      
      expect(result.flags).toContain('REPEATED_CHARACTERS');
    });

    it('should detect random character sequences', () => {
      const randomSubmission = {
        ...mockSubmission,
        proofText: 'abcdefghijklmnopqrstuvwxyz'
      };

      const result = integrityLayer.checkIntegrity(randomSubmission);
      
      expect(result.flags).toContain('RANDOM_CHARACTERS');
    });
  });

  describe('Proof Length Validation', () => {
    it('should flag submissions that are too short', () => {
      const shortSubmission = {
        ...mockSubmission,
        proofText: 'Done'
      };

      const result = integrityLayer.checkIntegrity(shortSubmission);
      
      expect(result.flags).toContain('PROOF_TOO_SHORT');
      expect(result.riskScore).toBeGreaterThan(0.3);
    });

    it('should accept submissions with adequate length', () => {
      const adequateSubmission = {
        ...mockSubmission,
        proofText: 'I completed the task by implementing a responsive navigation component with proper state management and accessibility features.'
      };

      const result = integrityLayer.checkIntegrity(adequateSubmission);
      
      expect(result.flags).not.toContain('PROOF_TOO_SHORT');
    });
  });

  describe('Submission Frequency Checks', () => {
    it('should flag too many submissions in one hour', () => {
      const recentHistory = Array(10).fill(null).map((_, i) => ({
        submissionId: `sub-${i}`,
        submissionTime: new Date(Date.now() - i * 300000), // 5 minutes apart
        proofText: 'Valid proof',
        pointsAwarded: 100,
        status: 'approved' as const
      }));

      const frequentSubmission = {
        ...mockSubmission,
        userHistory: recentHistory
      };

      const result = integrityLayer.checkIntegrity(frequentSubmission);
      
      expect(result.flags).toContain('TOO_MANY_SUBMISSIONS');
    });

    it('should flag submissions that are too close together', () => {
      const recentHistory = [{
        submissionId: 'sub-recent',
        submissionTime: new Date(Date.now() - 60000), // 1 minute ago
        proofText: 'Previous proof',
        pointsAwarded: 100,
        status: 'approved' as const
      }];

      const closeSubmission = {
        ...mockSubmission,
        userHistory: recentHistory
      };

      const result = integrityLayer.checkIntegrity(closeSubmission);
      
      expect(result.flags).toContain('SUBMISSIONS_TOO_CLOSE');
    });
  });

  describe('Duplicate Detection', () => {
    it('should detect duplicate submissions', () => {
      const duplicateHistory = [{
        submissionId: 'sub-duplicate',
        submissionTime: new Date(Date.now() - 3600000),
        proofText: 'I completed the React component task by creating a responsive navigation bar with proper state management.',
        pointsAwarded: 100,
        status: 'approved' as const
      }];

      const duplicateSubmission = {
        ...mockSubmission,
        userHistory: duplicateHistory
      };

      const result = integrityLayer.checkIntegrity(duplicateSubmission);
      
      expect(result.flags).toContain('DUPLICATE_SUBMISSION');
      expect(result.riskScore).toBeGreaterThan(0.4);
    });

    it('should not flag similar but different submissions', () => {
      const similarHistory = [{
        submissionId: 'sub-similar',
        submissionTime: new Date(Date.now() - 3600000),
        proofText: 'I completed a different React component task by creating a responsive footer with proper state management.',
        pointsAwarded: 100,
        status: 'approved' as const
      }];

      const similarSubmission = {
        ...mockSubmission,
        userHistory: similarHistory
      };

      const result = integrityLayer.checkIntegrity(similarSubmission);
      
      expect(result.flags).not.toContain('DUPLICATE_SUBMISSION');
    });
  });

  describe('Rapid Point Accumulation Detection', () => {
    it('should flag rapid point accumulation', () => {
      const highPointHistory = Array(5).fill(null).map((_, i) => ({
        submissionId: `sub-${i}`,
        submissionTime: new Date(Date.now() - i * 3600000), // 1 hour apart
        proofText: 'Valid proof',
        pointsAwarded: 500, // High points per submission
        status: 'approved' as const
      }));

      const rapidSubmission = {
        ...mockSubmission,
        userHistory: highPointHistory
      };

      const result = integrityLayer.checkIntegrity(rapidSubmission);
      
      expect(result.flags).toContain('RAPID_POINT_ACCUMULATION');
    });
  });

  describe('Suspicious Timing Detection', () => {
    it('should flag submissions at unusual hours', () => {
      const unusualTimeSubmission = {
        ...mockSubmission,
        submissionTime: new Date('2024-01-01T03:30:00Z') // 3:30 AM
      };

      const result = integrityLayer.checkIntegrity(unusualTimeSubmission);
      
      expect(result.flags).toContain('UNUSUAL_SUBMISSION_TIME');
    });

    it('should flag regular submission patterns', () => {
      const regularTimeSubmission = {
        ...mockSubmission,
        submissionTime: new Date('2024-01-01T14:00:00Z') // 2:00 PM exactly
      };

      const result = integrityLayer.checkIntegrity(regularTimeSubmission);
      
      expect(result.flags).toContain('REGULAR_SUBMISSION_PATTERN');
    });
  });

  describe('Risk Score Calculation', () => {
    it('should calculate risk score based on multiple flags', () => {
      const highRiskSubmission = {
        ...mockSubmission,
        proofText: 'fake test submission',
        userHistory: Array(15).fill(null).map((_, i) => ({
          submissionId: `sub-${i}`,
          submissionTime: new Date(Date.now() - i * 300000),
          proofText: 'Valid proof',
          pointsAwarded: 500,
          status: 'approved' as const
        }))
      };

      const result = integrityLayer.checkIntegrity(highRiskSubmission);
      
      expect(result.riskScore).toBeGreaterThan(0.7);
      expect(result.requiresReview).toBe(true);
    });

    it('should cap risk score at 1.0', () => {
      const extremeSubmission = {
        ...mockSubmission,
        proofText: 'fake test lorem ipsum asdf qwerty 123456',
        userHistory: Array(20).fill(null).map((_, i) => ({
          submissionId: `sub-${i}`,
          submissionTime: new Date(Date.now() - i * 100000),
          proofText: 'Valid proof',
          pointsAwarded: 1000,
          status: 'approved' as const
        }))
      };

      const result = integrityLayer.checkIntegrity(extremeSubmission);
      
      expect(result.riskScore).toBeLessThanOrEqual(1.0);
      expect(result.autoReject).toBe(true);
    });
  });

  describe('Deterrent Message Generation', () => {
    it('should generate deterrent message for suspicious submissions', () => {
      const suspiciousSubmission = {
        ...mockSubmission,
        proofText: 'fake submission'
      };

      const result = integrityLayer.checkIntegrity(suspiciousSubmission);
      
      expect(result.deterrentMessage).toBeDefined();
      expect(result.deterrentMessage).toContain('unusual activity');
    });

    it('should not generate deterrent message for clean submissions', () => {
      const cleanSubmission = {
        ...mockSubmission,
        proofText: 'I completed the task by implementing a comprehensive React component with proper error handling and accessibility features.'
      };

      const result = integrityLayer.checkIntegrity(cleanSubmission);
      
      expect(result.deterrentMessage).toBeUndefined();
    });
  });

  describe('Psychological Deterrents', () => {
    it('should generate fake messages', () => {
      const fakeMessage = integrityLayer.generateFakeMessage();
      
      expect(fakeMessage).toContain('🎉');
      expect(fakeMessage.length).toBeGreaterThan(20);
    });

    it('should show fake messages with 10% probability', () => {
      const results = Array(1000).fill(null).map(() => 
        integrityLayer.shouldShowFakeMessage()
      );
      
      const trueCount = results.filter(Boolean).length;
      const probability = trueCount / 1000;
      
      // Should be approximately 10% (with some variance)
      expect(probability).toBeGreaterThan(0.05);
      expect(probability).toBeLessThan(0.15);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty proof text', () => {
      const emptySubmission = {
        ...mockSubmission,
        proofText: ''
      };

      const result = integrityLayer.checkIntegrity(emptySubmission);
      
      expect(result.flags).toContain('PROOF_TOO_SHORT');
      expect(result.autoReject).toBe(true);
    });

    it('should handle very long proof text', () => {
      const longProof = 'A'.repeat(10000);
      const longSubmission = {
        ...mockSubmission,
        proofText: longProof
      };

      const result = integrityLayer.checkIntegrity(longSubmission);
      
      expect(result.flags).not.toContain('PROOF_TOO_SHORT');
      expect(result.isSuspicious).toBe(false);
    });

    it('should handle submissions with no history', () => {
      const newUserSubmission = {
        ...mockSubmission,
        userHistory: []
      };

      const result = integrityLayer.checkIntegrity(newUserSubmission);
      
      expect(result.flags).not.toContain('TOO_MANY_SUBMISSIONS');
      expect(result.flags).not.toContain('SUBMISSIONS_TOO_CLOSE');
    });
  });
});
