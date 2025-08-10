/**
 * AuditBot Service
 *
 * Service class for integrating AuditBot code validation into the CaBE platform.
 * Handles code submissions, manages LLM interactions, and processes audit results.
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * AuditBot Configuration
 */
const DEFAULT_CONFIG = {
  maxCodeLength: 50000, // 50KB max code size
  timeoutMs: 30000, // 30 second timeout
  retryAttempts: 2, // Retry failed requests
  plagiarismThreshold: 30, // Fail if >30% similarity
  complexityLimit: 15, // Fail if complexity >15
  minPassScore: 60, // Minimum score to pass
  enableCaching: true, // Cache results by code hash
  logAudits: true, // Log all audit results
};

/**
 * AuditBot Service Class
 */
class AuditBotService {
  constructor(llmService, config = {}) {
    this.llmService = llmService;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.promptCache = null;
    this.resultCache = new Map();
    this.promptPath = path.join(__dirname, '../prompts/code-validator.txt');
  }

  /**
   * Load and cache the AuditBot prompt
   */
  async loadPrompt() {
    if (!this.promptCache) {
      try {
        this.promptCache = await fs.readFile(this.promptPath, 'utf8');
      } catch (error) {
        throw new Error(`Failed to load AuditBot prompt: ${error.message}`);
      }
    }
    return this.promptCache;
  }

  /**
   * Generate hash for code caching
   */
  generateCodeHash(code) {
    return crypto
      .createHash('sha256')
      .update(code.trim())
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Validate input code submission
   */
  validateInput(code, metadata = {}) {
    const errors = [];

    // Check if code is provided
    if (!code || typeof code !== 'string') {
      errors.push('Code must be a non-empty string');
    }

    // Check code length
    if (code && code.length > this.config.maxCodeLength) {
      errors.push(
        `Code exceeds maximum length of ${this.config.maxCodeLength} characters`
      );
    }

    // Check for minimum content
    if (code && code.trim().length < 10) {
      errors.push('Code submission too short (minimum 10 characters)');
    }

    // Validate metadata if provided
    if (metadata.userId && typeof metadata.userId !== 'string') {
      errors.push('User ID must be a string');
    }

    if (metadata.taskId && typeof metadata.taskId !== 'string') {
      errors.push('Task ID must be a string');
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return true;
  }

  /**
   * Parse and validate AuditBot response
   */
  parseAuditResponse(response) {
    let parsed;

    try {
      parsed = JSON.parse(response);
    } catch (error) {
      throw new Error('AuditBot returned invalid JSON response');
    }

    // Validate required fields
    const requiredFields = [
      'verdict',
      'score',
      'plagiarismScore',
      'cognitiveComplexity',
      'reasons',
      'flags',
    ];
    const missingFields = requiredFields.filter((field) => !(field in parsed));

    if (missingFields.length > 0) {
      throw new Error(
        `AuditBot response missing fields: ${missingFields.join(', ')}`
      );
    }

    // Validate field types and ranges
    if (!['pass', 'fail'].includes(parsed.verdict)) {
      throw new Error('Invalid verdict in AuditBot response');
    }

    if (
      typeof parsed.score !== 'number' ||
      parsed.score < 0 ||
      parsed.score > 100
    ) {
      throw new Error('Invalid score in AuditBot response');
    }

    if (
      typeof parsed.plagiarismScore !== 'number' ||
      parsed.plagiarismScore < 0 ||
      parsed.plagiarismScore > 100
    ) {
      throw new Error('Invalid plagiarism score in AuditBot response');
    }

    if (
      typeof parsed.cognitiveComplexity !== 'number' ||
      parsed.cognitiveComplexity < 0
    ) {
      throw new Error('Invalid cognitive complexity in AuditBot response');
    }

    if (!Array.isArray(parsed.reasons)) {
      throw new Error('Reasons must be an array in AuditBot response');
    }

    if (!Array.isArray(parsed.flags)) {
      throw new Error('Flags must be an array in AuditBot response');
    }

    return parsed;
  }

  /**
   * Apply business rules to audit result
   */
  applyBusinessRules(auditResult) {
    const rules = {
      autoFail: false,
      reasons: [],
      finalVerdict: auditResult.verdict,
    };

    // Auto-fail conditions
    if (auditResult.plagiarismScore > this.config.plagiarismThreshold) {
      rules.autoFail = true;
      rules.reasons.push(
        `Plagiarism score ${auditResult.plagiarismScore}% exceeds threshold`
      );
    }

    if (auditResult.cognitiveComplexity > this.config.complexityLimit) {
      rules.autoFail = true;
      rules.reasons.push(
        `Cognitive complexity ${auditResult.cognitiveComplexity} exceeds limit`
      );
    }

    if (auditResult.flags.includes('security')) {
      rules.autoFail = true;
      rules.reasons.push('Security vulnerabilities detected');
    }

    if (
      auditResult.verdict === 'pass' &&
      auditResult.score < this.config.minPassScore
    ) {
      rules.autoFail = true;
      rules.reasons.push(
        `Score ${auditResult.score} below minimum passing score`
      );
    }

    // Apply final verdict
    if (rules.autoFail) {
      rules.finalVerdict = 'fail';
    }

    return {
      ...auditResult,
      businessRules: rules,
      finalVerdict: rules.finalVerdict,
    };
  }

  /**
   * Audit code submission
   */
  async auditCode(code, metadata = {}) {
    try {
      // Validate input
      this.validateInput(code, metadata);

      // Check cache if enabled
      const codeHash = this.generateCodeHash(code);
      if (this.config.enableCaching && this.resultCache.has(codeHash)) {
        const cached = this.resultCache.get(codeHash);
        console.log(`Cache hit for code hash: ${codeHash}`);
        return {
          ...cached,
          cached: true,
          requestId: metadata.requestId || codeHash,
        };
      }

      // Load prompt
      const systemPrompt = await this.loadPrompt();

      // Prepare request
      const startTime = Date.now();
      let attempts = 0;
      let lastError;

      while (attempts <= this.config.retryAttempts) {
        try {
          // Call LLM service
          const response = await Promise.race([
            this.llmService.complete({
              system: systemPrompt,
              user: code,
              maxTokens: 500,
              temperature: 0.1, // Low temperature for consistent auditing
              stopSequences: ['}', '\n\n---'],
            }),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error('Request timeout')),
                this.config.timeoutMs
              )
            ),
          ]);

          // Parse and validate response
          const auditResult = this.parseAuditResponse(response.content);

          // Apply business rules
          const finalResult = this.applyBusinessRules(auditResult);

          // Add metadata
          const result = {
            ...finalResult,
            metadata: {
              codeHash,
              requestId: metadata.requestId || codeHash,
              userId: metadata.userId,
              taskId: metadata.taskId,
              auditedAt: new Date().toISOString(),
              processingTime: Date.now() - startTime,
              attempts: attempts + 1,
              llmTokens: response.tokensUsed || 0,
            },
            cached: false,
          };

          // Cache result if enabled
          if (this.config.enableCaching) {
            this.resultCache.set(codeHash, result);
          }

          // Log audit if enabled
          if (this.config.logAudits) {
            console.log(
              `Code audit completed: ${result.finalVerdict} (${result.metadata.processingTime}ms)`
            );
          }

          return result;
        } catch (error) {
          lastError = error;
          attempts++;

          if (attempts <= this.config.retryAttempts) {
            console.log(
              `Audit attempt ${attempts} failed, retrying: ${error.message}`
            );
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * attempts)
            );
          }
        }
      }

      throw new Error(
        `Audit failed after ${this.config.retryAttempts + 1} attempts: ${lastError.message}`
      );
    } catch (error) {
      // Return error result
      return {
        verdict: 'fail',
        finalVerdict: 'fail',
        score: 0,
        plagiarismScore: 0,
        cognitiveComplexity: 0,
        reasons: [`Audit system error: ${error.message}`],
        flags: ['system-error'],
        criticalIssues: ['Unable to complete code audit'],
        suggestions: [],
        error: true,
        metadata: {
          codeHash: this.generateCodeHash(code || ''),
          requestId: metadata.requestId || 'error',
          userId: metadata.userId,
          taskId: metadata.taskId,
          auditedAt: new Date().toISOString(),
          processingTime: 0,
          attempts: 0,
          llmTokens: 0,
        },
      };
    }
  }

  /**
   * Batch audit multiple code submissions
   */
  async auditBatch(codeSubmissions, options = {}) {
    const { concurrency = 3, failFast = false } = options;
    const results = [];
    const errors = [];

    // Process in batches
    for (let i = 0; i < codeSubmissions.length; i += concurrency) {
      const batch = codeSubmissions.slice(i, i + concurrency);

      const batchPromises = batch.map(async (submission, batchIndex) => {
        const globalIndex = i + batchIndex;

        try {
          const result = await this.auditCode(submission.code, {
            ...submission.metadata,
            requestId: submission.metadata?.requestId || `batch-${globalIndex}`,
          });

          return { index: globalIndex, result, success: true };
        } catch (error) {
          const errorResult = {
            index: globalIndex,
            error: error.message,
            success: false,
            submission,
          };

          if (failFast) {
            throw error;
          }

          return errorResult;
        }
      });

      const batchResults = await Promise.all(batchPromises);

      batchResults.forEach((result) => {
        if (result.success) {
          results[result.index] = result.result;
        } else {
          errors.push(result);
        }
      });
    }

    return {
      results: results.filter((r) => r), // Remove empty slots
      errors,
      stats: {
        total: codeSubmissions.length,
        successful: results.filter((r) => r).length,
        failed: errors.length,
        passRate: results.filter((r) => r && r.finalVerdict === 'pass').length,
      },
    };
  }

  /**
   * Get audit statistics
   */
  getStats() {
    const cached = Array.from(this.resultCache.values());

    if (cached.length === 0) {
      return {
        totalAudits: 0,
        passRate: 0,
        averageScore: 0,
        averagePlagiarism: 0,
        averageComplexity: 0,
        commonFlags: [],
        cacheHitRate: 0,
      };
    }

    const passes = cached.filter((r) => r.finalVerdict === 'pass').length;
    const scores = cached.map((r) => r.score);
    const plagiarismScores = cached.map((r) => r.plagiarismScore);
    const complexityScores = cached.map((r) => r.cognitiveComplexity);

    // Count flag frequency
    const flagCounts = {};
    cached.forEach((result) => {
      result.flags.forEach((flag) => {
        flagCounts[flag] = (flagCounts[flag] || 0) + 1;
      });
    });

    const commonFlags = Object.entries(flagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([flag, count]) => ({ flag, count }));

    return {
      totalAudits: cached.length,
      passRate: Math.round((passes / cached.length) * 100),
      averageScore: Math.round(
        scores.reduce((sum, score) => sum + score, 0) / scores.length
      ),
      averagePlagiarism: Math.round(
        plagiarismScores.reduce((sum, score) => sum + score, 0) /
          plagiarismScores.length
      ),
      averageComplexity:
        Math.round(
          (complexityScores.reduce((sum, score) => sum + score, 0) /
            complexityScores.length) *
            10
        ) / 10,
      commonFlags,
      cacheSize: this.resultCache.size,
    };
  }

  /**
   * Clear cache and reset statistics
   */
  clearCache() {
    this.resultCache.clear();
    console.log('AuditBot cache cleared');
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const testCode = `function test() { return "Hello, World!"; }`;
      const result = await this.auditCode(testCode, {
        requestId: 'health-check',
      });

      return {
        status: 'healthy',
        responseTime: result.metadata.processingTime,
        cacheSize: this.resultCache.size,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

/**
 * Mock LLM Service for testing
 */
class MockLLMService {
  async complete({ system, user, maxTokens, temperature }) {
    // Simulate processing delay
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 1000 + 500)
    );

    // Generate mock response based on code content
    const mockResponse = this.generateMockAuditResponse(user);

    return {
      content: mockResponse,
      tokensUsed: Math.floor(mockResponse.length / 4),
    };
  }

  generateMockAuditResponse(code) {
    const responses = {
      security: {
        verdict: 'fail',
        score: 15,
        plagiarismScore: 10,
        cognitiveComplexity: 5,
        reasons: ['Hardcoded API key found', 'SQL injection vulnerability'],
        flags: ['security'],
        criticalIssues: ['Security vulnerabilities pose immediate risk'],
        suggestions: [],
      },
      plagiarism: {
        verdict: 'fail',
        score: 0,
        plagiarismScore: 85,
        cognitiveComplexity: 4,
        reasons: ['Plagiarism score 85% - matches known code'],
        flags: ['plagiarism'],
        criticalIssues: ['Code appears copied from external source'],
        suggestions: [],
      },
      complexity: {
        verdict: 'fail',
        score: 25,
        plagiarismScore: 5,
        cognitiveComplexity: 18,
        reasons: ['Cognitive complexity 18 exceeds limit'],
        flags: ['complexity'],
        criticalIssues: ['Function too complex to maintain'],
        suggestions: [],
      },
      clean: {
        verdict: 'pass',
        score: 82,
        plagiarismScore: 15,
        cognitiveComplexity: 6,
        reasons: [],
        flags: [],
        criticalIssues: [],
        suggestions: ['Consider adding more comments'],
      },
    };

    // Simple heuristics to determine response type
    const codeLower = code.toLowerCase();

    if (
      codeLower.includes('api_key') ||
      codeLower.includes('password') ||
      codeLower.includes('sk_test')
    ) {
      return JSON.stringify(responses.security);
    }

    if (code.length > 2000 || (code.match(/if|for|while/g) || []).length > 10) {
      return JSON.stringify(responses.complexity);
    }

    if (
      code.includes('navbar') ||
      code.includes('bootstrap') ||
      code.includes('// copied from')
    ) {
      return JSON.stringify(responses.plagiarism);
    }

    return JSON.stringify(responses.clean);
  }
}

module.exports = {
  AuditBotService,
  MockLLMService,
  DEFAULT_CONFIG,
};
