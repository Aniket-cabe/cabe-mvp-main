/**
 * AuditBot API Routes
 *
 * Express.js routes for the AuditBot code validation system.
 * Provides endpoints for code auditing, batch processing, and statistics.
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  AuditBotService,
  MockLLMService,
} = require('../utils/auditbot-service');

const router = express.Router();

// Initialize AuditBot service
// In production, replace MockLLMService with your actual LLM service
const llmService = new MockLLMService();
const auditBot = new AuditBotService(llmService, {
  maxCodeLength: 50000,
  timeoutMs: 30000,
  plagiarismThreshold: 30,
  complexityLimit: 15,
  enableCaching: true,
  logAudits: true,
});

// Rate limiting for code audits
const auditRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 audits per window
  message: {
    error: 'Too many audit requests. Please try again in 15 minutes.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for batch operations
const batchRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit batch operations
  message: {
    error: 'Too many batch audit requests. Please try again in 1 hour.',
    retryAfter: 60 * 60,
  },
});

/**
 * POST /api/audit/code
 * Audit a single code submission
 */
router.post('/code', auditRateLimit, async (req, res) => {
  try {
    const { code, userId, taskId, language = 'javascript' } = req.body;

    // Validate required fields
    if (!code) {
      return res.status(400).json({
        error: 'Code is required for audit',
        code: 'MISSING_CODE',
      });
    }

    if (typeof code !== 'string') {
      return res.status(400).json({
        error: 'Code must be a string',
        code: 'INVALID_CODE_TYPE',
      });
    }

    // Prepare metadata
    const metadata = {
      userId,
      taskId,
      language,
      requestId: req.id || `audit-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };

    // Perform audit
    const result = await auditBot.auditCode(code, metadata);

    // Log audit result (for analytics)
    console.log(
      `Code audit: ${result.finalVerdict} | User: ${userId || 'anonymous'} | Task: ${taskId || 'none'}`
    );

    // Return result
    res.json({
      success: true,
      data: {
        verdict: result.finalVerdict,
        score: result.score,
        plagiarismScore: result.plagiarismScore,
        cognitiveComplexity: result.cognitiveComplexity,
        reasons: result.reasons,
        flags: result.flags,
        criticalIssues: result.criticalIssues,
        suggestions: result.suggestions,
        metadata: {
          auditId: result.metadata.requestId,
          processingTime: result.metadata.processingTime,
          cached: result.cached,
          auditedAt: result.metadata.auditedAt,
        },
      },
    });
  } catch (error) {
    console.error('Code audit error:', error.message);

    // Return appropriate error response
    if (
      error.message.includes('validation') ||
      error.message.includes('required')
    ) {
      res.status(400).json({
        error: error.message,
        code: 'VALIDATION_ERROR',
      });
    } else if (
      error.message.includes('too large') ||
      error.message.includes('exceeds')
    ) {
      res.status(413).json({
        error: 'Code submission too large. Please reduce size and try again.',
        code: 'CODE_TOO_LARGE',
      });
    } else if (error.message.includes('timeout')) {
      res.status(408).json({
        error: 'Audit request timed out. Please try again.',
        code: 'AUDIT_TIMEOUT',
      });
    } else {
      res.status(500).json({
        error: 'Failed to audit code. Please try again later.',
        code: 'AUDIT_ERROR',
      });
    }
  }
});

/**
 * POST /api/audit/batch
 * Audit multiple code submissions in batch
 */
router.post('/batch', batchRateLimit, async (req, res) => {
  try {
    const { submissions } = req.body;

    // Validate input
    if (!Array.isArray(submissions)) {
      return res.status(400).json({
        error: 'Submissions must be an array',
        code: 'INVALID_INPUT',
      });
    }

    if (submissions.length === 0) {
      return res.status(400).json({
        error: 'At least one submission is required',
        code: 'EMPTY_BATCH',
      });
    }

    if (submissions.length > 10) {
      return res.status(400).json({
        error: 'Maximum 10 submissions per batch',
        code: 'BATCH_TOO_LARGE',
      });
    }

    // Validate each submission
    for (let i = 0; i < submissions.length; i++) {
      const submission = submissions[i];
      if (!submission.code || typeof submission.code !== 'string') {
        return res.status(400).json({
          error: `Submission ${i + 1}: Code is required and must be a string`,
          code: 'INVALID_SUBMISSION',
        });
      }
    }

    // Prepare submissions with metadata
    const preparedSubmissions = submissions.map((submission, index) => ({
      code: submission.code,
      metadata: {
        userId: submission.userId,
        taskId: submission.taskId,
        language: submission.language || 'javascript',
        requestId: `batch-${Date.now()}-${index}`,
        batchIndex: index,
      },
    }));

    // Process batch
    const batchResult = await auditBot.auditBatch(preparedSubmissions, {
      concurrency: 3,
      failFast: false,
    });

    console.log(
      `Batch audit completed: ${batchResult.stats.successful}/${batchResult.stats.total} successful`
    );

    res.json({
      success: true,
      data: {
        results: batchResult.results,
        errors: batchResult.errors,
        stats: batchResult.stats,
      },
    });
  } catch (error) {
    console.error('Batch audit error:', error.message);

    res.status(500).json({
      error: 'Failed to process batch audit. Please try again.',
      code: 'BATCH_ERROR',
    });
  }
});

/**
 * GET /api/audit/health
 * Health check for AuditBot service
 */
router.get('/health', async (req, res) => {
  try {
    const health = await auditBot.healthCheck();

    if (health.status === 'healthy') {
      res.json({
        status: 'healthy',
        service: 'auditbot',
        responseTime: `${health.responseTime}ms`,
        cacheSize: health.cacheSize,
        timestamp: health.timestamp,
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        service: 'auditbot',
        error: health.error,
        timestamp: health.timestamp,
      });
    }
  } catch (error) {
    console.error('Health check failed:', error.message);

    res.status(503).json({
      status: 'unhealthy',
      service: 'auditbot',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/audit/stats
 * Get AuditBot service statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = auditBot.getStats();

    res.json({
      success: true,
      data: {
        ...stats,
        service: 'auditbot',
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Stats retrieval error:', error.message);

    res.status(500).json({
      error: 'Failed to retrieve audit statistics',
      code: 'STATS_ERROR',
    });
  }
});

/**
 * POST /api/audit/feedback
 * Submit feedback on audit quality
 */
router.post('/feedback', async (req, res) => {
  try {
    const { auditId, verdict, accuracy, helpfulness, comments, userId } =
      req.body;

    // Validate required fields
    if (!auditId) {
      return res.status(400).json({
        error: 'Audit ID is required',
        code: 'MISSING_AUDIT_ID',
      });
    }

    if (!verdict || !['accurate', 'inaccurate'].includes(verdict)) {
      return res.status(400).json({
        error: 'Verdict must be "accurate" or "inaccurate"',
        code: 'INVALID_VERDICT',
      });
    }

    if (accuracy && (accuracy < 1 || accuracy > 5)) {
      return res.status(400).json({
        error: 'Accuracy rating must be between 1 and 5',
        code: 'INVALID_ACCURACY',
      });
    }

    if (helpfulness && (helpfulness < 1 || helpfulness > 5)) {
      return res.status(400).json({
        error: 'Helpfulness rating must be between 1 and 5',
        code: 'INVALID_HELPFULNESS',
      });
    }

    // Create feedback record
    const feedback = {
      id: `feedback-${Date.now()}`,
      auditId,
      userId,
      verdict,
      accuracy: accuracy || null,
      helpfulness: helpfulness || null,
      comments: comments ? comments.trim() : null,
      submittedAt: new Date().toISOString(),
    };

    // In production, save to database
    console.log('Audit feedback received:', feedback);

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        feedbackId: feedback.id,
      },
    });
  } catch (error) {
    console.error('Feedback submission error:', error.message);

    res.status(500).json({
      error: 'Failed to submit feedback',
      code: 'FEEDBACK_ERROR',
    });
  }
});

/**
 * DELETE /api/audit/cache
 * Clear audit cache (admin only)
 */
router.delete('/cache', async (req, res) => {
  try {
    // In production, add admin authentication check here
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.includes('admin-token')) {
      return res.status(403).json({
        error: 'Admin access required',
        code: 'FORBIDDEN',
      });
    }

    auditBot.clearCache();

    res.json({
      success: true,
      message: 'Audit cache cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cache clear error:', error.message);

    res.status(500).json({
      error: 'Failed to clear cache',
      code: 'CACHE_ERROR',
    });
  }
});

/**
 * GET /api/audit/thresholds
 * Get current audit thresholds and configuration
 */
router.get('/thresholds', async (req, res) => {
  try {
    const config = {
      plagiarismThreshold: auditBot.config.plagiarismThreshold,
      complexityLimit: auditBot.config.complexityLimit,
      minPassScore: auditBot.config.minPassScore,
      maxCodeLength: auditBot.config.maxCodeLength,
      timeoutMs: auditBot.config.timeoutMs,
    };

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Thresholds retrieval error:', error.message);

    res.status(500).json({
      error: 'Failed to retrieve thresholds',
      code: 'THRESHOLDS_ERROR',
    });
  }
});

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('AuditBot route error:', error);

  res.status(500).json({
    error: 'An unexpected error occurred in AuditBot',
    code: 'INTERNAL_ERROR',
    requestId: req.id || Date.now().toString(),
  });
});

module.exports = router;
