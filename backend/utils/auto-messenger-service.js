/**
 * Auto-Messenger Service
 *
 * Service for generating platform messages using the CaBOT Messenger LLM system.
 * Handles message generation, caching, and tone consistency across the platform.
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Auto-Messenger Configuration
 */
const DEFAULT_CONFIG = {
  maxMessageLength: 40, // Maximum words per message
  minMessageLength: 8, // Minimum words per message
  cacheEnabled: true, // Cache generated messages
  cacheTimeout: 3600000, // 1 hour cache timeout
  defaultTone: 'friendly', // Fallback tone
  timeoutMs: 10000, // 10 second timeout for LLM calls
  retryAttempts: 2, // Retry failed generations
  validateLength: true, // Enforce length limits
  logMessages: true, // Log generated messages
};

/**
 * Supported tones with validation
 */
const VALID_TONES = ['friendly', 'serious', 'hype'];

/**
 * Context categories for better message generation
 */
const CONTEXT_CATEGORIES = {
  authentication: ['login', 'logout', 'verification', 'password', 'signup'],
  submissions: [
    'proof',
    'review',
    'approved',
    'rejected',
    'pending',
    'moderation',
  ],
  achievements: ['badge', 'streak', 'rank', 'milestone', 'unlock', 'level'],
  system: ['maintenance', 'update', 'feature', 'downtime', 'restored'],
  moderation: ['warning', 'violation', 'suspended', 'appeal', 'banned'],
  points: ['earned', 'awarded', 'bonus', 'deducted', 'spent', 'balance'],
  social: ['follower', 'mention', 'share', 'comment', 'like', 'message'],
};

/**
 * Auto-Messenger Service Class
 */
class AutoMessengerService {
  constructor(llmService, config = {}) {
    this.llmService = llmService;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.promptCache = null;
    this.messageCache = new Map();
    this.promptPath = path.join(__dirname, '../prompts/auto-messenger.txt');
    this.stats = {
      totalGenerated: 0,
      cacheHits: 0,
      toneDistribution: { friendly: 0, serious: 0, hype: 0 },
      averageLength: 0,
      lastReset: new Date(),
    };
  }

  /**
   * Load and cache the auto-messenger prompt
   */
  async loadPrompt() {
    if (!this.promptCache) {
      try {
        this.promptCache = await fs.readFile(this.promptPath, 'utf8');
      } catch (error) {
        throw new Error(
          `Failed to load auto-messenger prompt: ${error.message}`
        );
      }
    }
    return this.promptCache;
  }

  /**
   * Generate cache key for message requests
   */
  generateCacheKey(context, tone) {
    const normalizedContext = context.toLowerCase().trim();
    const key = `${normalizedContext}:${tone}`;
    return crypto.createHash('md5').update(key).digest('hex').substring(0, 12);
  }

  /**
   * Detect context category for better message generation
   */
  detectContextCategory(context) {
    const lowerContext = context.toLowerCase();

    for (const [category, keywords] of Object.entries(CONTEXT_CATEGORIES)) {
      if (keywords.some((keyword) => lowerContext.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }

  /**
   * Validate input parameters
   */
  validateInput(context, tone) {
    const errors = [];

    // Validate context
    if (!context || typeof context !== 'string') {
      errors.push('Context must be a non-empty string');
    } else if (context.trim().length < 3) {
      errors.push('Context too short (minimum 3 characters)');
    } else if (context.length > 500) {
      errors.push('Context too long (maximum 500 characters)');
    }

    // Validate tone
    if (!tone || typeof tone !== 'string') {
      errors.push('Tone must be a string');
    } else if (!VALID_TONES.includes(tone.toLowerCase())) {
      errors.push(`Invalid tone. Must be one of: ${VALID_TONES.join(', ')}`);
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return true;
  }

  /**
   * Validate generated message
   */
  validateMessage(message) {
    if (!message || typeof message !== 'string') {
      throw new Error('Generated message is not a valid string');
    }

    const trimmed = message.trim();
    if (trimmed.length === 0) {
      throw new Error('Generated message is empty');
    }

    // Check for unwanted formatting
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      throw new Error('Generated message should not be quoted');
    }

    if (trimmed.includes('```') || trimmed.includes('json')) {
      throw new Error('Generated message contains formatting artifacts');
    }

    // Word count validation
    if (this.config.validateLength) {
      const wordCount = trimmed.split(/\s+/).length;

      if (wordCount < this.config.minMessageLength) {
        throw new Error(
          `Message too short: ${wordCount} words (minimum ${this.config.minMessageLength})`
        );
      }

      if (wordCount > this.config.maxMessageLength) {
        throw new Error(
          `Message too long: ${wordCount} words (maximum ${this.config.maxMessageLength})`
        );
      }
    }

    return trimmed;
  }

  /**
   * Update statistics
   */
  updateStats(tone, message, cached = false) {
    this.stats.totalGenerated++;

    if (cached) {
      this.stats.cacheHits++;
    }

    if (VALID_TONES.includes(tone)) {
      this.stats.toneDistribution[tone]++;
    }

    // Update average length
    const wordCount = message.split(/\s+/).length;
    const total = this.stats.totalGenerated;
    this.stats.averageLength =
      (this.stats.averageLength * (total - 1) + wordCount) / total;
  }

  /**
   * Generate platform message
   */
  async generateMessage(context, tone = 'friendly', options = {}) {
    try {
      // Validate input
      this.validateInput(context, tone);

      const normalizedTone = tone.toLowerCase();
      const { bypassCache = false, requestId = null } = options;

      // Check cache if enabled
      const cacheKey = this.generateCacheKey(context, normalizedTone);
      if (
        this.config.cacheEnabled &&
        !bypassCache &&
        this.messageCache.has(cacheKey)
      ) {
        const cached = this.messageCache.get(cacheKey);

        // Check if cache entry is still valid
        if (Date.now() - cached.timestamp < this.config.cacheTimeout) {
          this.updateStats(normalizedTone, cached.message, true);

          if (this.config.logMessages) {
            console.log(
              `Cache hit for message: ${cacheKey} (${normalizedTone})`
            );
          }

          return {
            message: cached.message,
            tone: normalizedTone,
            context: context,
            category: cached.category,
            cached: true,
            requestId: requestId || cacheKey,
            generatedAt: cached.timestamp,
            wordCount: cached.wordCount,
          };
        } else {
          // Remove expired cache entry
          this.messageCache.delete(cacheKey);
        }
      }

      // Detect context category
      const category = this.detectContextCategory(context);

      // Load prompt
      const systemPrompt = await this.loadPrompt();

      // Prepare input for LLM
      const userInput = `Context: ${context}\nTone: ${normalizedTone}`;

      const startTime = Date.now();
      let attempts = 0;
      let lastError;

      while (attempts <= this.config.retryAttempts) {
        try {
          // Call LLM service
          const response = await Promise.race([
            this.llmService.complete({
              system: systemPrompt,
              user: userInput,
              maxTokens: 100,
              temperature: 0.7, // Moderate creativity for variety
              stopSequences: ['\n\n', '---', 'Context:'],
            }),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error('Request timeout')),
                this.config.timeoutMs
              )
            ),
          ]);

          // Validate and clean response
          const generatedMessage = this.validateMessage(response.content);
          const processingTime = Date.now() - startTime;
          const wordCount = generatedMessage.split(/\s+/).length;

          // Create result object
          const result = {
            message: generatedMessage,
            tone: normalizedTone,
            context: context,
            category: category,
            cached: false,
            requestId: requestId || cacheKey,
            generatedAt: new Date().toISOString(),
            processingTime: processingTime,
            wordCount: wordCount,
            attempts: attempts + 1,
            llmTokens: response.tokensUsed || 0,
          };

          // Cache result if enabled
          if (this.config.cacheEnabled) {
            this.messageCache.set(cacheKey, {
              message: generatedMessage,
              category: category,
              wordCount: wordCount,
              timestamp: Date.now(),
            });
          }

          // Update statistics
          this.updateStats(normalizedTone, generatedMessage, false);

          // Log generation if enabled
          if (this.config.logMessages) {
            console.log(
              `Message generated: "${generatedMessage}" (${normalizedTone}, ${processingTime}ms)`
            );
          }

          return result;
        } catch (error) {
          lastError = error;
          attempts++;

          if (attempts <= this.config.retryAttempts) {
            console.log(
              `Message generation attempt ${attempts} failed, retrying: ${error.message}`
            );
            await new Promise((resolve) => setTimeout(resolve, 500 * attempts));
          }
        }
      }

      throw new Error(
        `Message generation failed after ${this.config.retryAttempts + 1} attempts: ${lastError.message}`
      );
    } catch (error) {
      // Return fallback message for critical errors
      const fallbackMessages = {
        friendly: 'Something happened! Check your dashboard for details 📱',
        serious: 'System notification. Check your account for details.',
        hype: "SOMETHING'S UP! Check your dashboard NOW! ⚡",
      };

      const fallbackMessage =
        fallbackMessages[tone] || fallbackMessages.friendly;

      console.error('Auto-messenger error:', error.message);

      return {
        message: fallbackMessage,
        tone: tone,
        context: context,
        category: 'error',
        cached: false,
        requestId: options.requestId || 'error',
        generatedAt: new Date().toISOString(),
        processingTime: 0,
        wordCount: fallbackMessage.split(/\s+/).length,
        attempts: 0,
        error: true,
        errorMessage: error.message,
      };
    }
  }

  /**
   * Generate multiple messages for A/B testing
   */
  async generateVariants(context, tone, count = 3) {
    const variants = [];
    const errors = [];

    for (let i = 0; i < count; i++) {
      try {
        const result = await this.generateMessage(context, tone, {
          bypassCache: true,
          requestId: `variant-${i + 1}`,
        });
        variants.push(result);
      } catch (error) {
        errors.push({ index: i + 1, error: error.message });
      }
    }

    return {
      variants,
      errors,
      stats: {
        total: count,
        successful: variants.length,
        failed: errors.length,
      },
    };
  }

  /**
   * Batch generate messages
   */
  async generateBatch(requests, options = {}) {
    const { concurrency = 3 } = options;
    const results = [];
    const errors = [];

    // Process in batches
    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);

      const batchPromises = batch.map(async (request, batchIndex) => {
        const globalIndex = i + batchIndex;

        try {
          const result = await this.generateMessage(
            request.context,
            request.tone || this.config.defaultTone,
            {
              ...request.options,
              requestId: request.requestId || `batch-${globalIndex}`,
            }
          );

          return { index: globalIndex, result, success: true };
        } catch (error) {
          return {
            index: globalIndex,
            error: error.message,
            success: false,
            request,
          };
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
        total: requests.length,
        successful: results.filter((r) => r).length,
        failed: errors.length,
      },
    };
  }

  /**
   * Get service statistics
   */
  getStats() {
    const cacheSize = this.messageCache.size;
    const cacheHitRate =
      this.stats.totalGenerated > 0
        ? Math.round((this.stats.cacheHits / this.stats.totalGenerated) * 100)
        : 0;

    return {
      ...this.stats,
      cacheSize,
      cacheHitRate,
      averageLength: Math.round(this.stats.averageLength * 10) / 10,
      uptime: Date.now() - this.stats.lastReset.getTime(),
    };
  }

  /**
   * Clear cache and reset statistics
   */
  clearCache() {
    this.messageCache.clear();
    console.log('Auto-messenger cache cleared');
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalGenerated: 0,
      cacheHits: 0,
      toneDistribution: { friendly: 0, serious: 0, hype: 0 },
      averageLength: 0,
      lastReset: new Date(),
    };
    console.log('Auto-messenger statistics reset');
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const testMessage = await this.generateMessage(
        'Test message generation',
        'friendly',
        { requestId: 'health-check', bypassCache: true }
      );

      return {
        status: 'healthy',
        responseTime: testMessage.processingTime,
        cacheSize: this.messageCache.size,
        wordCount: testMessage.wordCount,
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
class MockMessengerLLMService {
  async complete({ system, user, maxTokens, temperature }) {
    // Simulate processing delay
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 500 + 200)
    );

    // Parse input
    const contextMatch = user.match(/Context: (.+)/);
    const toneMatch = user.match(/Tone: (.+)/);

    const context = contextMatch ? contextMatch[1] : 'system update';
    const tone = toneMatch ? toneMatch[1] : 'friendly';

    // Generate mock response based on context and tone
    const mockMessage = this.generateMockMessage(context, tone);

    return {
      content: mockMessage,
      tokensUsed: Math.floor(mockMessage.length / 4),
    };
  }

  generateMockMessage(context, tone) {
    const contextLower = context.toLowerCase();

    // Mock responses based on context patterns
    const responseMap = {
      friendly: {
        login: 'Welcome back! Ready to tackle some tasks? 😊',
        approved: 'Great work! Your submission has been approved 👍',
        rejected:
          'Your submission needs some work. Check the feedback and try again!',
        badge: 'Congrats! You just earned a new badge 🏆',
        maintenance: "Hey! We'll be doing some quick maintenance soon 🔧",
        points: 'Nice! You earned some points for that task 🎉',
        default: 'Hey there! Something good happened ✨',
      },
      serious: {
        login: 'Login successful. Access granted.',
        approved: 'Submission approved. Points have been awarded.',
        rejected: 'Submission rejected. Review requirements and resubmit.',
        badge: 'Achievement unlocked. Badge has been awarded.',
        maintenance: 'Scheduled maintenance will begin shortly.',
        points: 'Task completed. Points have been credited.',
        default: 'System notification. Check your account for details.',
      },
      hype: {
        login: "YOOO YOU'RE BACK! Let's get this bread! 🔥💯",
        approved: 'SUBMISSION APPROVED! You absolutely SLAYED that! 🔥💯✨',
        rejected:
          "Submission got rejected bestie 💀 But don't give up! Try again!",
        badge: "NEW BADGE UNLOCKED! You're absolutely CRUSHING IT! 🏆💯🔥",
        maintenance:
          "MAINTENANCE INCOMING! We're making things even MORE epic! 🔧⚡",
        points: "POINTS IN THE BAG! You're absolutely COOKING! 💰🔥",
        default: 'SOMETHING EPIC HAPPENED! Check it out NOW! ⚡🔥',
      },
    };

    const toneResponses = responseMap[tone] || responseMap.friendly;

    // Find matching context pattern
    for (const [pattern, response] of Object.entries(toneResponses)) {
      if (pattern !== 'default' && contextLower.includes(pattern)) {
        return response;
      }
    }

    return toneResponses.default;
  }
}

module.exports = {
  AutoMessengerService,
  MockMessengerLLMService,
  DEFAULT_CONFIG,
  VALID_TONES,
  CONTEXT_CATEGORIES,
};
