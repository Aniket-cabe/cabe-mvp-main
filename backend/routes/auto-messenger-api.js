/**
 * Auto-Messenger API Routes
 *
 * Express.js routes for the CaBOT Messenger system.
 * Provides endpoints for generating platform messages with different tones.
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  AutoMessengerService,
  MockMessengerLLMService,
  VALID_TONES,
} = require('../utils/auto-messenger-service');

const router = express.Router();

// Initialize Auto-Messenger service
// In production, replace MockMessengerLLMService with your actual LLM service
const llmService = new MockMessengerLLMService();
const messenger = new AutoMessengerService(llmService, {
  maxMessageLength: 40,
  minMessageLength: 8,
  cacheEnabled: true,
  defaultTone: 'friendly',
  validateLength: true,
  logMessages: true,
});

// Rate limiting for message generation
const messageRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 message generations per window
  message: {
    error:
      'Too many message generation requests. Please try again in 15 minutes.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for batch operations
const batchRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit batch operations
  message: {
    error: 'Too many batch message requests. Please try again in 1 hour.',
    retryAfter: 60 * 60,
  },
});

/**
 * POST /api/messenger/generate
 * Generate a single platform message
 */
router.post('/generate', messageRateLimit, async (req, res) => {
  try {
    const { context, tone = 'friendly', options = {} } = req.body;

    // Validate required fields
    if (!context) {
      return res.status(400).json({
        error: 'Context is required for message generation',
        code: 'MISSING_CONTEXT',
      });
    }

    if (typeof context !== 'string') {
      return res.status(400).json({
        error: 'Context must be a string',
        code: 'INVALID_CONTEXT_TYPE',
      });
    }

    // Validate tone
    if (tone && !VALID_TONES.includes(tone.toLowerCase())) {
      return res.status(400).json({
        error: `Invalid tone. Must be one of: ${VALID_TONES.join(', ')}`,
        code: 'INVALID_TONE',
      });
    }

    // Prepare options
    const generateOptions = {
      bypassCache: options.bypassCache || false,
      requestId: req.id || `msg-${Date.now()}`,
    };

    // Generate message
    const result = await messenger.generateMessage(
      context,
      tone,
      generateOptions
    );

    // Log generation result
    console.log(
      `Message generated: "${result.message}" (${result.tone}, ${result.processingTime}ms)`
    );

    // Return result
    res.json({
      success: true,
      data: {
        message: result.message,
        tone: result.tone,
        context: result.context,
        category: result.category,
        wordCount: result.wordCount,
        metadata: {
          messageId: result.requestId,
          processingTime: result.processingTime,
          cached: result.cached,
          generatedAt: result.generatedAt,
          attempts: result.attempts,
        },
      },
    });
  } catch (error) {
    console.error('Message generation error:', error.message);

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
      error.message.includes('too short') ||
      error.message.includes('too long')
    ) {
      res.status(400).json({
        error: 'Context length invalid. Please adjust and try again.',
        code: 'INVALID_LENGTH',
      });
    } else if (error.message.includes('timeout')) {
      res.status(408).json({
        error: 'Message generation timed out. Please try again.',
        code: 'GENERATION_TIMEOUT',
      });
    } else {
      res.status(500).json({
        error: 'Failed to generate message. Please try again later.',
        code: 'GENERATION_ERROR',
      });
    }
  }
});

/**
 * POST /api/messenger/variants
 * Generate multiple message variants for A/B testing
 */
router.post('/variants', messageRateLimit, async (req, res) => {
  try {
    const { context, tone = 'friendly', count = 3 } = req.body;

    // Validate input
    if (!context) {
      return res.status(400).json({
        error: 'Context is required for variant generation',
        code: 'MISSING_CONTEXT',
      });
    }

    if (typeof count !== 'number' || count < 1 || count > 5) {
      return res.status(400).json({
        error: 'Count must be a number between 1 and 5',
        code: 'INVALID_COUNT',
      });
    }

    // Generate variants
    const result = await messenger.generateVariants(context, tone, count);

    console.log(
      `Generated ${result.variants.length} variants for: "${context}" (${tone})`
    );

    res.json({
      success: true,
      data: {
        variants: result.variants,
        errors: result.errors,
        stats: result.stats,
        context: context,
        tone: tone,
      },
    });
  } catch (error) {
    console.error('Variant generation error:', error.message);

    res.status(500).json({
      error: 'Failed to generate message variants',
      code: 'VARIANT_ERROR',
    });
  }
});

/**
 * POST /api/messenger/batch
 * Generate multiple messages in batch
 */
router.post('/batch', batchRateLimit, async (req, res) => {
  try {
    const { requests } = req.body;

    // Validate input
    if (!Array.isArray(requests)) {
      return res.status(400).json({
        error: 'Requests must be an array',
        code: 'INVALID_INPUT',
      });
    }

    if (requests.length === 0) {
      return res.status(400).json({
        error: 'At least one request is required',
        code: 'EMPTY_BATCH',
      });
    }

    if (requests.length > 20) {
      return res.status(400).json({
        error: 'Maximum 20 requests per batch',
        code: 'BATCH_TOO_LARGE',
      });
    }

    // Validate each request
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      if (!request.context || typeof request.context !== 'string') {
        return res.status(400).json({
          error: `Request ${i + 1}: Context is required and must be a string`,
          code: 'INVALID_REQUEST',
        });
      }

      if (request.tone && !VALID_TONES.includes(request.tone.toLowerCase())) {
        return res.status(400).json({
          error: `Request ${i + 1}: Invalid tone. Must be one of: ${VALID_TONES.join(', ')}`,
          code: 'INVALID_TONE',
        });
      }
    }

    // Process batch
    const batchResult = await messenger.generateBatch(requests, {
      concurrency: 3,
    });

    console.log(
      `Batch generation completed: ${batchResult.stats.successful}/${batchResult.stats.total} successful`
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
    console.error('Batch generation error:', error.message);

    res.status(500).json({
      error: 'Failed to process batch message generation',
      code: 'BATCH_ERROR',
    });
  }
});

/**
 * GET /api/messenger/health
 * Health check for auto-messenger service
 */
router.get('/health', async (req, res) => {
  try {
    const health = await messenger.healthCheck();

    if (health.status === 'healthy') {
      res.json({
        status: 'healthy',
        service: 'auto-messenger',
        responseTime: `${health.responseTime}ms`,
        cacheSize: health.cacheSize,
        wordCount: health.wordCount,
        timestamp: health.timestamp,
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        service: 'auto-messenger',
        error: health.error,
        timestamp: health.timestamp,
      });
    }
  } catch (error) {
    console.error('Health check failed:', error.message);

    res.status(503).json({
      status: 'unhealthy',
      service: 'auto-messenger',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/messenger/stats
 * Get auto-messenger service statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = messenger.getStats();

    res.json({
      success: true,
      data: {
        ...stats,
        service: 'auto-messenger',
        supportedTones: VALID_TONES,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Stats retrieval error:', error.message);

    res.status(500).json({
      error: 'Failed to retrieve messenger statistics',
      code: 'STATS_ERROR',
    });
  }
});

/**
 * GET /api/messenger/tones
 * Get supported tones and their descriptions
 */
router.get('/tones', async (req, res) => {
  try {
    const toneDescriptions = {
      friendly: {
        name: 'Friendly',
        description: 'Warm, encouraging, and helpful tone with light emojis',
        example: 'Hey! Your submission has been approved 👍',
        useCase: 'General platform messages, positive updates',
      },
      serious: {
        name: 'Serious',
        description: 'Professional, direct, and factual tone without emojis',
        example: 'Submission approved. Points have been awarded.',
        useCase: 'Important notifications, system alerts',
      },
      hype: {
        name: 'Hype',
        description: 'Gen-Z energy with heavy emojis and exciting language',
        example: 'SUBMISSION APPROVED! You absolutely SLAYED that! 🔥💯',
        useCase: 'Achievements, celebrations, engagement boosts',
      },
    };

    res.json({
      success: true,
      data: {
        supportedTones: VALID_TONES,
        descriptions: toneDescriptions,
        defaultTone: messenger.config.defaultTone,
      },
    });
  } catch (error) {
    console.error('Tones retrieval error:', error.message);

    res.status(500).json({
      error: 'Failed to retrieve tone information',
      code: 'TONES_ERROR',
    });
  }
});

/**
 * DELETE /api/messenger/cache
 * Clear message cache (admin only)
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

    messenger.clearCache();

    res.json({
      success: true,
      message: 'Message cache cleared successfully',
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
 * POST /api/messenger/reset-stats
 * Reset service statistics (admin only)
 */
router.post('/reset-stats', async (req, res) => {
  try {
    // In production, add admin authentication check here
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.includes('admin-token')) {
      return res.status(403).json({
        error: 'Admin access required',
        code: 'FORBIDDEN',
      });
    }

    messenger.resetStats();

    res.json({
      success: true,
      message: 'Statistics reset successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Stats reset error:', error.message);

    res.status(500).json({
      error: 'Failed to reset statistics',
      code: 'RESET_ERROR',
    });
  }
});

/**
 * GET /api/messenger/config
 * Get current messenger configuration
 */
router.get('/config', async (req, res) => {
  try {
    const config = {
      maxMessageLength: messenger.config.maxMessageLength,
      minMessageLength: messenger.config.minMessageLength,
      defaultTone: messenger.config.defaultTone,
      cacheEnabled: messenger.config.cacheEnabled,
      cacheTimeout: messenger.config.cacheTimeout,
      timeoutMs: messenger.config.timeoutMs,
      validateLength: messenger.config.validateLength,
    };

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Config retrieval error:', error.message);

    res.status(500).json({
      error: 'Failed to retrieve configuration',
      code: 'CONFIG_ERROR',
    });
  }
});

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Auto-messenger route error:', error);

  res.status(500).json({
    error: 'An unexpected error occurred in the messenger service',
    code: 'INTERNAL_ERROR',
    requestId: req.id || Date.now().toString(),
  });
});

module.exports = router;
