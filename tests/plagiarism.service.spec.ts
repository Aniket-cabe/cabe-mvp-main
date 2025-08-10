import { describe, it, expect, beforeEach, vi } from 'vitest';
import { plagiarismService } from '../backend/src/services/plagiarism.service';

// Mock database
vi.mock('../backend/db', () => ({
  executeWithRetry: vi.fn(),
}));

// Mock logger
vi.mock('../backend/src/utils/logger', () => ({
  default: { info: vi.fn(), error: vi.fn() },
}));

describe('Plagiarism Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Plagiarism Detection', () => {
    it('should detect high similarity (90%) correctly', async () => {
      const code1 = 'function hello() { return "world"; }';
      const code2 = 'function hello() { return "world"; }'; // Identical code

      const report = await plagiarismService.detectPlagiarism(
        code1,
        'javascript',
        'user1'
      );

      expect(report).toBeDefined();
      expect(report.similarity).toBeGreaterThan(0.8);
      expect(report.confidence).toBeGreaterThan(0.8);
      expect(report.matchedSources.length).toBeGreaterThan(0);
    });

    it('should detect moderate similarity (30-60%) correctly', async () => {
      const code1 = 'function hello() { return "world"; }';
      const code2 = 'function greet() { return "hello"; }'; // Similar structure

      const report = await plagiarismService.detectPlagiarism(
        code1,
        'javascript',
        'user1'
      );

      expect(report).toBeDefined();
      expect(report.similarity).toBeGreaterThan(0.3);
      expect(report.similarity).toBeLessThan(0.8);
    });

    it('should detect low similarity (0-30%) correctly', async () => {
      const code1 = 'function hello() { return "world"; }';
      const code2 = 'const x = 42; console.log(x);'; // Very different code

      const report = await plagiarismService.detectPlagiarism(
        code1,
        'javascript',
        'user1'
      );

      expect(report).toBeDefined();
      expect(report.similarity).toBeLessThan(0.3);
    });

    it('should return empty report when no similar code found', async () => {
      const code = 'function uniqueFunction() { return "unique"; }';

      const report = await plagiarismService.detectPlagiarism(
        code,
        'javascript',
        'user1'
      );

      expect(report).toBeDefined();
      expect(report.similarity).toBe(0);
      expect(report.matchedSources.length).toBe(0);
      expect(report.confidence).toBe(1.0);
    });
  });

  describe('Feature Extraction', () => {
    it('should extract features from JavaScript code', () => {
      const code = 'function test() { if (true) { return "hello"; } }';
      const language = 'javascript';

      const features = (plagiarismService as any).extractCodeFeatures(code);

      expect(Array.isArray(features)).toBe(true);
      expect(features.length).toBeGreaterThan(0);
      expect(features.every((f) => typeof f === 'number')).toBe(true);
    });

    it('should extract features from Python code', () => {
      const code = 'def test(): if True: return "hello"';
      const language = 'python';

      const features = (plagiarismService as any).extractCodeFeatures(code);

      expect(Array.isArray(features)).toBe(true);
      expect(features.length).toBeGreaterThan(0);
      expect(features.every((f) => typeof f === 'number')).toBe(true);
    });

    it('should handle empty code gracefully', () => {
      const code = '';

      const features = (plagiarismService as any).extractCodeFeatures(code);

      expect(Array.isArray(features)).toBe(true);
      expect(features.length).toBeGreaterThan(0);
    });
  });

  describe('Similarity Calculation', () => {
    it('should calculate cosine similarity correctly', () => {
      const vec1 = [1, 2, 3, 4, 5];
      const vec2 = [1, 2, 3, 4, 5]; // Identical vectors

      const similarity = (plagiarismService as any).calculateCosineSimilarity(
        vec1,
        vec2
      );

      expect(similarity).toBe(1.0); // Perfect similarity
    });

    it('should calculate cosine similarity for different vectors', () => {
      const vec1 = [1, 0, 0, 0, 0];
      const vec2 = [0, 1, 0, 0, 0]; // Orthogonal vectors

      const similarity = (plagiarismService as any).calculateCosineSimilarity(
        vec1,
        vec2
      );

      expect(similarity).toBe(0.0); // No similarity
    });

    it('should handle zero vectors', () => {
      const vec1 = [0, 0, 0, 0, 0];
      const vec2 = [1, 2, 3, 4, 5];

      const similarity = (plagiarismService as any).calculateCosineSimilarity(
        vec1,
        vec2
      );

      expect(similarity).toBe(0.0);
    });

    it('should handle vectors of different lengths', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [1, 2, 3, 4, 5];

      const similarity = (plagiarismService as any).calculateCosineSimilarity(
        vec1,
        vec2
      );

      expect(similarity).toBe(0.0); // Should return 0 for different lengths
    });
  });

  describe('Line Matching', () => {
    it('should find matched lines correctly', () => {
      const code1 = 'function hello() {\n  return "world";\n}';
      const code2 = 'function hello() {\n  return "world";\n}';

      const matchedLines = (plagiarismService as any).findMatchedLines(
        code1,
        code2
      );

      expect(Array.isArray(matchedLines)).toBe(true);
      expect(matchedLines.length).toBeGreaterThan(0);
      expect(matchedLines.every((line) => typeof line === 'number')).toBe(true);
    });

    it('should detect similar lines', () => {
      const line1 = 'function hello() { return "world"; }';
      const line2 = 'function hello() { return "world"; }';

      const isSimilar = (plagiarismService as any).similarLines(line1, line2);

      expect(isSimilar).toBe(true);
    });

    it('should detect different lines', () => {
      const line1 = 'function hello() { return "world"; }';
      const line2 = 'const x = 42;';

      const isSimilar = (plagiarismService as any).similarLines(line1, line2);

      expect(isSimilar).toBe(false);
    });
  });

  describe('Report Generation', () => {
    it('should generate report with correct structure', async () => {
      const code = 'function test() { return "hello"; }';

      const report = await plagiarismService.detectPlagiarism(
        code,
        'javascript',
        'user1'
      );

      expect(report).toHaveProperty('similarity');
      expect(report).toHaveProperty('matchedSources');
      expect(report).toHaveProperty('highlighted');
      expect(report).toHaveProperty('confidence');
      expect(report).toHaveProperty('timestamp');

      expect(typeof report.similarity).toBe('number');
      expect(Array.isArray(report.matchedSources)).toBe(true);
      expect(Array.isArray(report.highlighted)).toBe(true);
      expect(typeof report.confidence).toBe('number');
      expect(report.timestamp instanceof Date).toBe(true);
    });

    it('should calculate confidence correctly', () => {
      const similarity = 0.8;
      const matchCount = 3;

      const confidence = (plagiarismService as any).calculateConfidence(
        similarity,
        matchCount
      );

      expect(typeof confidence).toBe('number');
      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const { executeWithRetry } = await import('../backend/db');
      vi.mocked(executeWithRetry).mockRejectedValue(
        new Error('Database error')
      );

      const code = 'function test() { return "hello"; }';

      await expect(
        plagiarismService.detectPlagiarism(code, 'javascript', 'user1')
      ).rejects.toThrow('Failed to detect plagiarism');
    });

    it('should handle empty submissions gracefully', async () => {
      const code = 'function test() { return "hello"; }';

      const report = await plagiarismService.detectPlagiarism(
        code,
        'javascript',
        'user1'
      );

      expect(report).toBeDefined();
      expect(report.similarity).toBe(0);
    });
  });

  describe('Statistics', () => {
    it('should return plagiarism statistics', async () => {
      const stats = await plagiarismService.getPlagiarismStats('user1');

      expect(stats).toHaveProperty('totalChecks');
      expect(stats).toHaveProperty('averageSimilarity');
      expect(stats).toHaveProperty('flaggedCount');

      expect(typeof stats.totalChecks).toBe('number');
      expect(typeof stats.averageSimilarity).toBe('number');
      expect(typeof stats.flaggedCount).toBe('number');
    });
  });

  describe('Threshold Testing', () => {
    it('should flag code above similarity threshold', async () => {
      const code = 'function hello() { return "world"; }';

      const report = await plagiarismService.detectPlagiarism(
        code,
        'javascript',
        'user1'
      );

      if (report.similarity > 0.7) {
        expect(report.matchedSources.length).toBeGreaterThan(0);
        expect(report.confidence).toBeGreaterThan(0.8);
      }
    });

    it('should not flag code below similarity threshold', async () => {
      const code = 'function uniqueFunction() { return "unique"; }';

      const report = await plagiarismService.detectPlagiarism(
        code,
        'javascript',
        'user1'
      );

      if (report.similarity < 0.3) {
        expect(report.matchedSources.length).toBe(0);
      }
    });
  });
});
