/**
 * CaBOT Task Explainer Integration
 *
 * This module provides integration functions for the Task Explainer prompt system
 * to be used within the CaBE platform backend.
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Task Explainer Service
 */
class TaskExplainerService {
  constructor(llmService) {
    this.llmService = llmService;
    this.promptCache = null;
    this.promptPath = path.join(__dirname, '../prompts/task-explainer.txt');
  }

  /**
   * Load and cache the system prompt
   */
  async loadPrompt() {
    if (!this.promptCache) {
      try {
        this.promptCache = await fs.readFile(this.promptPath, 'utf8');
      } catch (error) {
        throw new Error(
          `Failed to load task explainer prompt: ${error.message}`
        );
      }
    }
    return this.promptCache;
  }

  /**
   * Validate input data
   */
  validateInput(taskData) {
    if (!taskData || typeof taskData !== 'object') {
      throw new Error('Task data must be an object');
    }

    if (!taskData.title || typeof taskData.title !== 'string') {
      throw new Error('Task title is required and must be a string');
    }

    if (taskData.title.length > 200) {
      throw new Error('Task title must be 200 characters or less');
    }

    if (taskData.context && typeof taskData.context !== 'string') {
      throw new Error('Task context must be a string');
    }

    if (taskData.context && taskData.context.length > 1000) {
      throw new Error('Task context must be 1000 characters or less');
    }
  }

  /**
   * Count words in response (excluding markdown)
   */
  countWords(text) {
    return text
      .replace(/\*\*[^*]+\*\*/g, '') // Remove markdown bold
      .replace(/[•\-]/g, '') // Remove bullet points
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .split(' ')
      .filter((word) => word.length > 0).length;
  }

  /**
   * Validate response structure and content
   */
  validateResponse(response) {
    const requiredSections = [
      /\*\*What You'll Do:\*\*/,
      /\*\*Skills You'll Need:\*\*/,
      /\*\*Pro Tip:\*\*/,
    ];

    const missingsections = requiredSections.filter(
      (pattern) => !pattern.test(response)
    );

    if (missingsections.length > 0) {
      throw new Error(
        `Response missing required sections: ${missingSections.length} sections`
      );
    }

    const wordCount = this.countWords(response);
    if (wordCount > 120) {
      throw new Error(`Response too long: ${wordCount} words (max 120)`);
    }

    return {
      wordCount,
      isValid: true,
    };
  }

  /**
   * Explain a task using the LLM
   */
  async explainTask(taskData) {
    try {
      // Validate input
      this.validateInput(taskData);

      // Load prompt
      const systemPrompt = await this.loadPrompt();

      // Prepare user input
      const userInput = JSON.stringify({
        title: taskData.title.trim(),
        context: taskData.context ? taskData.context.trim() : '',
      });

      // Call LLM service
      const response = await this.llmService.complete({
        system: systemPrompt,
        user: userInput,
        maxTokens: 200,
        temperature: 0.7,
        stopSequences: ['\n\n---', '\n\nExample:'],
      });

      // Validate response
      const validation = this.validateResponse(response.content);

      return {
        explanation: response.content,
        metadata: {
          wordCount: validation.wordCount,
          tokensUsed: response.tokensUsed,
          generatedAt: new Date().toISOString(),
          taskId: taskData.id || null,
        },
      };
    } catch (error) {
      throw new Error(`Task explanation failed: ${error.message}`);
    }
  }

  /**
   * Batch explain multiple tasks
   */
  async explainTasks(taskDataArray, options = {}) {
    const { concurrency = 3, retryAttempts = 2 } = options;
    const results = [];
    const errors = [];

    // Process in batches to avoid overwhelming the LLM service
    for (let i = 0; i < taskDataArray.length; i += concurrency) {
      const batch = taskDataArray.slice(i, i + concurrency);

      const batchPromises = batch.map(async (taskData, index) => {
        let attempts = 0;
        while (attempts <= retryAttempts) {
          try {
            const result = await this.explainTask(taskData);
            return { index: i + index, result, success: true };
          } catch (error) {
            attempts++;
            if (attempts > retryAttempts) {
              return {
                index: i + index,
                error: error.message,
                success: false,
                taskData,
              };
            }
            // Wait before retry
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * attempts)
            );
          }
        }
      });

      const batchResults = await Promise.all(batchPromises);

      batchResults.forEach((result) => {
        if (result.success) {
          results[result.index] = result.result;
        } else {
          errors.push({
            index: result.index,
            error: result.error,
            taskData: result.taskData,
          });
        }
      });
    }

    return {
      results,
      errors,
      stats: {
        total: taskDataArray.length,
        successful: results.filter((r) => r).length,
        failed: errors.length,
      },
    };
  }

  /**
   * Get explanation statistics
   */
  async getStats(explanations) {
    const wordCounts = explanations.map((exp) =>
      this.countWords(exp.explanation)
    );

    return {
      count: explanations.length,
      averageWordCount: Math.round(
        wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length
      ),
      minWordCount: Math.min(...wordCounts),
      maxWordCount: Math.max(...wordCounts),
      underLimit: wordCounts.filter((count) => count <= 120).length,
      overLimit: wordCounts.filter((count) => count > 120).length,
    };
  }
}

/**
 * Mock LLM Service for testing
 */
class MockLLMService {
  async complete({ system, user, maxTokens, temperature }) {
    // Parse the user input
    const taskData = JSON.parse(user);

    // Generate a mock response based on task type
    const mockResponse = this.generateMockResponse(taskData);

    return {
      content: mockResponse,
      tokensUsed: Math.floor(mockResponse.length / 4), // Rough estimate
      model: 'mock-llm-v1',
    };
  }

  generateMockResponse(taskData) {
    const responses = {
      design: `**What You'll Do:**
Research the visual requirements and target audience. Create 3-5 concept sketches exploring different approaches. Refine your best concept into a polished design that meets the brief.

**Skills You'll Need:**
• Visual design principles
• Sketching and ideation
• Client communication
• Design software proficiency

**Pro Tip:**
Start with rough sketches - perfect pixels come later, but great ideas come first! ✏️`,

      development: `**What You'll Do:**
Set up your development environment and review the requirements. Break the feature into smaller components and build them step by step. Test thoroughly and document your code.

**Skills You'll Need:**
• Programming fundamentals
• Problem-solving
• Testing and debugging
• Code documentation

**Pro Tip:**
Write tests as you code - future you will thank present you when bugs try to sneak in! 🐛`,

      writing: `**What You'll Do:**
Research your topic and understand your audience. Create an outline with key points and supporting details. Write your first draft, then edit for clarity and flow.

**Skills You'll Need:**
• Research and fact-checking
• Clear communication
• Audience awareness
• Editing and proofreading

**Pro Tip:**
Read your writing out loud - if it sounds awkward to your ears, it'll feel awkward to readers too! 📖`,

      default: `**What You'll Do:**
Break down the task into smaller, manageable steps. Gather all necessary resources and information. Execute each step systematically while monitoring quality.

**Skills You'll Need:**
• Task planning
• Resource management
• Quality control
• Time management

**Pro Tip:**
Start with the hardest part first - everything else will feel easier by comparison! 💪`,
    };

    // Simple keyword matching to determine response type
    const title = taskData.title.toLowerCase();
    if (
      title.includes('design') ||
      title.includes('logo') ||
      title.includes('visual')
    ) {
      return responses.design;
    } else if (
      title.includes('code') ||
      title.includes('app') ||
      title.includes('website')
    ) {
      return responses.development;
    } else if (
      title.includes('write') ||
      title.includes('blog') ||
      title.includes('article')
    ) {
      return responses.writing;
    } else {
      return responses.default;
    }
  }
}

module.exports = {
  TaskExplainerService,
  MockLLMService,
};
