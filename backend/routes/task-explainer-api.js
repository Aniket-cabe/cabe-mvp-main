/**
 * Task Explainer API Routes
 *
 * Express.js routes for the CaBOT Task Explainer functionality
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  TaskExplainerService,
  MockLLMService,
} = require('../utils/task-explainer-integration');

const router = express.Router();

// Initialize the task explainer service
// In production, replace MockLLMService with your actual LLM service
const llmService = new MockLLMService();
const taskExplainer = new TaskExplainerService(llmService);

// Rate limiting for LLM calls
const explainerRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    error: 'Too many explanation requests. Please try again in 15 minutes.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Premium rate limiting for batch operations
const batchRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit batch operations
  message: {
    error: 'Too many batch requests. Please try again in 1 hour.',
    retryAfter: 60 * 60,
  },
});

/**
 * POST /api/tasks/explain
 * Explain a single task
 */
router.post('/explain', explainerRateLimit, async (req, res) => {
  try {
    const { title, context, taskId } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        error: 'Task title is required',
        code: 'MISSING_TITLE',
      });
    }

    // Prepare task data
    const taskData = {
      id: taskId,
      title: title.trim(),
      context: context ? context.trim() : '',
    };

    // Generate explanation
    const result = await taskExplainer.explainTask(taskData);

    // Log successful explanation (for analytics)
    console.log(
      `Task explained: ${taskId || 'unknown'} - ${result.metadata.wordCount} words`
    );

    res.json({
      success: true,
      data: {
        explanation: result.explanation,
        metadata: result.metadata,
      },
    });
  } catch (error) {
    console.error('Task explanation error:', error.message);

    // Return appropriate error response
    if (
      error.message.includes('validation') ||
      error.message.includes('required')
    ) {
      res.status(400).json({
        error: error.message,
        code: 'VALIDATION_ERROR',
      });
    } else if (error.message.includes('too long')) {
      res.status(400).json({
        error:
          'Task description too long. Please provide a shorter description.',
        code: 'INPUT_TOO_LONG',
      });
    } else {
      res.status(500).json({
        error: 'Failed to generate task explanation. Please try again.',
        code: 'EXPLANATION_ERROR',
      });
    }
  }
});

/**
 * POST /api/tasks/explain-batch
 * Explain multiple tasks in batch
 */
router.post('/explain-batch', batchRateLimit, async (req, res) => {
  try {
    const { tasks } = req.body;

    // Validate input
    if (!Array.isArray(tasks)) {
      return res.status(400).json({
        error: 'Tasks must be an array',
        code: 'INVALID_INPUT',
      });
    }

    if (tasks.length === 0) {
      return res.status(400).json({
        error: 'At least one task is required',
        code: 'EMPTY_BATCH',
      });
    }

    if (tasks.length > 20) {
      return res.status(400).json({
        error: 'Maximum 20 tasks per batch',
        code: 'BATCH_TOO_LARGE',
      });
    }

    // Process batch
    const batchResult = await taskExplainer.explainTasks(tasks, {
      concurrency: 3,
      retryAttempts: 2,
    });

    // Generate statistics
    const successfulExplanations = batchResult.results.filter((r) => r);
    const stats =
      successfulExplanations.length > 0
        ? await taskExplainer.getStats(successfulExplanations)
        : null;

    console.log(
      `Batch processed: ${batchResult.stats.successful}/${batchResult.stats.total} successful`
    );

    res.json({
      success: true,
      data: {
        results: batchResult.results,
        errors: batchResult.errors,
        stats: {
          ...batchResult.stats,
          explanationStats: stats,
        },
      },
    });
  } catch (error) {
    console.error('Batch explanation error:', error.message);

    res.status(500).json({
      error: 'Failed to process batch explanation. Please try again.',
      code: 'BATCH_ERROR',
    });
  }
});

/**
 * GET /api/tasks/explainer/health
 * Health check for the explainer service
 */
router.get('/explainer/health', async (req, res) => {
  try {
    // Test with a simple task
    const testTask = {
      title: 'Health Check Test',
      context: 'Simple test to verify the explainer service is working',
    };

    const startTime = Date.now();
    await taskExplainer.explainTask(testTask);
    const responseTime = Date.now() - startTime;

    res.json({
      status: 'healthy',
      service: 'task-explainer',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error.message);

    res.status(503).json({
      status: 'unhealthy',
      service: 'task-explainer',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/tasks/explainer/stats
 * Get service statistics
 */
router.get('/explainer/stats', async (req, res) => {
  try {
    // In production, these would come from a database or cache
    const stats = {
      totalExplanations: 1250,
      averageWordCount: 95,
      averageResponseTime: '850ms',
      successRate: 98.5,
      topTaskTypes: [
        { type: 'Design', count: 450 },
        { type: 'Development', count: 380 },
        { type: 'Writing', count: 250 },
        { type: 'Analysis', count: 170 },
      ],
      lastUpdated: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Stats retrieval error:', error.message);

    res.status(500).json({
      error: 'Failed to retrieve service statistics',
      code: 'STATS_ERROR',
    });
  }
});

/**
 * POST /api/tasks/explainer/feedback
 * Submit feedback on explanation quality
 */
router.post('/explainer/feedback', async (req, res) => {
  try {
    const { taskId, explanationId, rating, feedback, userId } = req.body;

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Rating must be between 1 and 5',
        code: 'INVALID_RATING',
      });
    }

    // In production, save feedback to database
    const feedbackRecord = {
      id: Date.now().toString(),
      taskId,
      explanationId,
      userId,
      rating,
      feedback: feedback ? feedback.trim() : null,
      submittedAt: new Date().toISOString(),
    };

    console.log('Feedback received:', feedbackRecord);

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        feedbackId: feedbackRecord.id,
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

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Task explainer route error:', error);

  res.status(500).json({
    error: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
    requestId: req.id || Date.now().toString(),
  });
});

module.exports = router;
