import { executeWithRetry } from '../../db';
import logger from '../utils/logger';

interface PlagiarismReport {
  similarity: number;
  matchedSources: Array<{
    submissionId: string;
    userId: string;
    username: string;
    similarity: number;
    matchedLines: number[];
  }>;
  highlighted: Array<{
    line: number;
    content: string;
    isMatched: boolean;
  }>;
  confidence: number;
  timestamp: Date;
}

interface CodeSubmission {
  id: string;
  userId: string;
  username: string;
  code: string;
  language: string;
  createdAt: Date;
}

class PlagiarismService {
  private similarityThreshold = 0.7;
  private confidenceThreshold = 0.8;

  async detectPlagiarism(
    code: string,
    language: string,
    currentUserId: string
  ): Promise<PlagiarismReport> {
    logger.info('Starting plagiarism detection...');

    try {
      // Get existing submissions for comparison
      const existingSubmissions = await this.getExistingSubmissions(
        language,
        currentUserId
      );

      if (existingSubmissions.length === 0) {
        return this.createEmptyReport();
      }

      // Extract features from current code
      const currentFeatures = this.extractCodeFeatures(code);

      // Compare with existing submissions
      const matches = await this.findSimilarSubmissions(
        currentFeatures,
        existingSubmissions
      );

      // Generate detailed report
      const report = this.generateReport(code, matches);

      // Store audit log
      await this.storeAuditLog(currentUserId, report);

      logger.info(
        `Plagiarism detection completed. Similarity: ${report.similarity}`
      );
      return report;
    } catch (error) {
      logger.error('Plagiarism detection failed:', error);
      throw new Error('Failed to detect plagiarism');
    }
  }

  private async getExistingSubmissions(
    language: string,
    excludeUserId: string
  ): Promise<CodeSubmission[]> {
    try {
      // Mock data - replace with actual database query
      const submissions = [
        {
          id: '1',
          userId: 'user2',
          username: 'alice',
          code: 'function hello() { return "world"; }',
          language: 'javascript',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          userId: 'user3',
          username: 'bob',
          code: 'def hello(): return "world"',
          language: 'python',
          createdAt: new Date('2024-01-02'),
        },
      ];

      return submissions.filter(
        (sub) => sub.language === language && sub.userId !== excludeUserId
      );
    } catch (error) {
      logger.error('Failed to fetch existing submissions:', error);
      return [];
    }
  }

  private extractCodeFeatures(code: string): number[] {
    // Extract code features for similarity comparison
    const features = [
      code.length,
      (code.match(/function|def|class/g) || []).length,
      (code.match(/if|else|for|while/g) || []).length,
      (code.match(/[A-Z]/g) || []).length,
      (code.match(/[a-z]/g) || []).length,
      (code.match(/[0-9]/g) || []).length,
      (code.match(/[^a-zA-Z0-9\s]/g) || []).length,
      code.split('\n').length,
      code.split(' ').length,
    ];

    return features;
  }

  private async findSimilarSubmissions(
    currentFeatures: number[],
    submissions: CodeSubmission[]
  ): Promise<
    Array<{
      submission: CodeSubmission;
      similarity: number;
      matchedLines: number[];
    }>
  > {
    const matches = [];

    for (const submission of submissions) {
      const submissionFeatures = this.extractCodeFeatures(submission.code);
      const similarity = this.calculateCosineSimilarity(
        currentFeatures,
        submissionFeatures
      );

      if (similarity >= this.similarityThreshold) {
        const matchedLines = this.findMatchedLines(
          submission.code,
          submission.code
        );
        matches.push({
          submission,
          similarity,
          matchedLines,
        });
      }
    }

    return matches.sort((a, b) => b.similarity - a.similarity);
  }

  private calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  private findMatchedLines(code1: string, code2: string): number[] {
    const lines1 = code1.split('\n');
    const lines2 = code2.split('\n');
    const matchedLines = [];

    for (let i = 0; i < Math.min(lines1.length, lines2.length); i++) {
      if (this.similarLines(lines1[i], lines2[i])) {
        matchedLines.push(i + 1);
      }
    }

    return matchedLines;
  }

  private similarLines(line1: string, line2: string): boolean {
    const normalized1 = line1.trim().toLowerCase();
    const normalized2 = line2.trim().toLowerCase();

    if (normalized1 === normalized2) return true;

    // Check for high similarity
    const similarity = this.calculateCosineSimilarity(
      this.extractCodeFeatures(normalized1),
      this.extractCodeFeatures(normalized2)
    );

    return similarity > 0.8;
  }

  private generateReport(
    code: string,
    matches: Array<{
      submission: CodeSubmission;
      similarity: number;
      matchedLines: number[];
    }>
  ): PlagiarismReport {
    const maxSimilarity =
      matches.length > 0 ? Math.max(...matches.map((m) => m.similarity)) : 0;

    const matchedSources = matches.map((match) => ({
      submissionId: match.submission.id,
      userId: match.submission.userId,
      username: match.submission.username,
      similarity: match.similarity,
      matchedLines: match.matchedLines,
    }));

    const highlighted = this.highlightMatchedLines(code, matches);

    const confidence = this.calculateConfidence(maxSimilarity, matches.length);

    return {
      similarity: maxSimilarity,
      matchedSources,
      highlighted,
      confidence,
      timestamp: new Date(),
    };
  }

  private highlightMatchedLines(
    code: string,
    matches: Array<{
      submission: CodeSubmission;
      similarity: number;
      matchedLines: number[];
    }>
  ): Array<{ line: number; content: string; isMatched: boolean }> {
    const lines = code.split('\n');
    const allMatchedLines = new Set<number>();

    matches.forEach((match) => {
      match.matchedLines.forEach((lineNum) => {
        allMatchedLines.add(lineNum);
      });
    });

    return lines.map((line, index) => ({
      line: index + 1,
      content: line,
      isMatched: allMatchedLines.has(index + 1),
    }));
  }

  private calculateConfidence(similarity: number, matchCount: number): number {
    // Higher similarity and more matches increase confidence
    const similarityWeight = 0.7;
    const matchWeight = 0.3;

    const matchScore = Math.min(matchCount / 5, 1); // Cap at 5 matches

    return similarity * similarityWeight + matchScore * matchWeight;
  }

  private createEmptyReport(): PlagiarismReport {
    return {
      similarity: 0,
      matchedSources: [],
      highlighted: [],
      confidence: 1.0,
      timestamp: new Date(),
    };
  }

  private async storeAuditLog(
    userId: string,
    report: PlagiarismReport
  ): Promise<void> {
    try {
      // Store plagiarism audit log
      const auditData = {
        userId,
        similarity: report.similarity,
        confidence: report.confidence,
        matchedCount: report.matchedSources.length,
        timestamp: new Date(),
      };

      // Mock database insert - replace with actual
      logger.info('Plagiarism audit log stored', auditData);
    } catch (error) {
      logger.error('Failed to store audit log:', error);
    }
  }

  async getPlagiarismStats(userId: string): Promise<{
    totalChecks: number;
    averageSimilarity: number;
    flaggedCount: number;
  }> {
    try {
      // Mock stats - replace with actual database query
      return {
        totalChecks: 15,
        averageSimilarity: 0.23,
        flaggedCount: 2,
      };
    } catch (error) {
      logger.error('Failed to get plagiarism stats:', error);
      return { totalChecks: 0, averageSimilarity: 0, flaggedCount: 0 };
    }
  }
}

export const plagiarismService = new PlagiarismService();
export default plagiarismService;
