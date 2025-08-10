import { envWithHelpers } from '../config/env';
import logger from './logger';

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens: number;
  temperature: number;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface OpenRouterError {
  error: {
    message: string;
    type: string;
  };
}

/**
 * Automatically score a code submission using AI
 * @param taskTitle - The title of the task being evaluated
 * @param userCode - The user's submitted code
 * @returns Promise<number> - Score between 0-100
 */
export async function autoScoreSubmission(
  taskTitle: string,
  userCode: string
): Promise<number> {
  try {
    logger.info('🤖 Starting AI auto-scoring for submission', {
      taskTitle,
      codeLength: userCode.length,
    });

    // Validate inputs
    if (!taskTitle || !userCode) {
      logger.warn('❌ Missing required inputs for AI scoring', {
        hasTaskTitle: !!taskTitle,
        hasUserCode: !!userCode,
      });
      throw new Error('Task title and user code are required');
    }

    // Create the scoring prompt
    const scoringPrompt = `You are an expert code reviewer. Please evaluate the following code submission and provide a score from 0 to 100.

TASK: ${taskTitle}

USER CODE:
\`\`\`
${userCode}
\`\`\`

EVALUATION CRITERIA:
- Correctness: Does the code solve the task correctly? (0-40 points)
- Readability: Is the code clear, well-structured, and easy to understand? (0-30 points)
- Adherence: Does the code follow the task requirements and best practices? (0-30 points)

INSTRUCTIONS:
1. Analyze the code thoroughly
2. Consider the task requirements
3. Evaluate each criterion
4. Provide a final score from 0 to 100
5. Respond with ONLY the numeric score (e.g., "85" or "72")

SCORE:`;

    // Prepare the request
    const requestBody: OpenRouterRequest = {
      model: 'mistralai/mistral-7b-instruct',
      messages: [
        {
          role: 'system',
          content:
            'You are a precise code reviewer. Always respond with only a numeric score between 0 and 100.',
        },
        {
          role: 'user',
          content: scoringPrompt,
        },
      ],
      max_tokens: 50,
      temperature: 0.1, // Low temperature for consistent scoring
    };

    logger.info('📤 Sending scoring request to OpenRouter AI');

    // Make the API request
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${envWithHelpers.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://cabe-arena.com',
          'X-Title': 'Cabe Arena AI Scoring',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData: OpenRouterError = await response.json();
      logger.error('❌ OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData.error?.message,
      });
      throw new Error(
        `OpenRouter API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data: OpenRouterResponse = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content?.trim();

    if (!aiResponse) {
      logger.error('❌ Empty response from AI');
      throw new Error('Empty response from AI');
    }

    logger.info('📥 Received AI response:', { aiResponse });

    // Parse the score from the AI response
    const score = parseScoreFromResponse(aiResponse);

    logger.info('✅ AI scoring completed successfully', {
      taskTitle,
      rawResponse: aiResponse,
      parsedScore: score,
    });

    return score;
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error occurred';
    logger.error('❌ AI auto-scoring failed:', {
      error: errorMessage,
      taskTitle,
      codeLength: userCode?.length || 0,
    });

    // Return a fallback score based on error type
    if (
      errorMessage.includes('API key') ||
      errorMessage.includes('authentication')
    ) {
      logger.warn('🔑 Using fallback score due to authentication error');
      return 50; // Neutral fallback score
    }

    if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
      logger.warn('⏱️ Using fallback score due to rate limiting');
      return 50; // Neutral fallback score
    }

    if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      logger.warn('🌐 Using fallback score due to network error');
      return 50; // Neutral fallback score
    }

    // For other errors, throw to let caller handle
    throw new Error(`AI scoring failed: ${errorMessage}`);
  }
}

/**
 * Parse a numeric score from the AI response
 * @param response - The AI's response text
 * @returns number - Parsed score (0-100)
 */
function parseScoreFromResponse(response: string): number {
  try {
    // Remove any non-numeric characters except dots and commas
    const cleaned = response.replace(/[^\d.,]/g, '');

    // Try to parse as number
    let score = parseFloat(cleaned);

    // If that fails, try to extract number from text
    if (isNaN(score)) {
      const numberMatch = response.match(/\b(\d{1,3})\b/);
      if (numberMatch) {
        score = parseInt(numberMatch[1], 10);
      }
    }

    // Validate the score
    if (isNaN(score)) {
      logger.warn('⚠️ Could not parse score from AI response, using fallback', {
        response,
      });
      return 50; // Fallback score
    }

    // Ensure score is within valid range
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    return Math.round(score); // Return integer score
  } catch (err) {
    logger.error('❌ Error parsing score from AI response:', {
      response,
      error: err,
    });
    return 50; // Fallback score
  }
}

/**
 * Get a detailed scoring breakdown from AI
 * @param taskTitle - The title of the task being evaluated
 * @param userCode - The user's submitted code
 * @returns Promise<{score: number, breakdown: string, feedback: string}>
 */
export async function getDetailedScore(
  taskTitle: string,
  userCode: string
): Promise<{ score: number; breakdown: string; feedback: string }> {
  try {
    logger.info('🔍 Getting detailed AI scoring breakdown', { taskTitle });

    const detailedPrompt = `You are an expert code reviewer. Please provide a detailed evaluation of the following code submission.

TASK: ${taskTitle}

USER CODE:
\`\`\`
${userCode}
\`\`\`

Please provide your evaluation in the following format:

SCORE: [0-100]
BREAKDOWN: [Brief breakdown of points by category]
FEEDBACK: [Detailed feedback and suggestions]

Focus on:
- Correctness (0-40 points): Does it solve the task correctly?
- Readability (0-30 points): Is the code clear and well-structured?
- Adherence (0-30 points): Does it follow requirements and best practices?`;

    const requestBody: OpenRouterRequest = {
      model: 'mistralai/mistral-7b-instruct',
      messages: [
        {
          role: 'system',
          content:
            'You are a detailed code reviewer. Provide structured feedback with score, breakdown, and suggestions.',
        },
        {
          role: 'user',
          content: detailedPrompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    };

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${envWithHelpers.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://cabe-arena.com',
          'X-Title': 'Cabe Arena AI Scoring',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data: OpenRouterResponse = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content?.trim();

    if (!aiResponse) {
      throw new Error('Empty response from AI');
    }

    // Parse the structured response
    const scoreMatch = aiResponse.match(/SCORE:\s*(\d+)/i);
    const breakdownMatch = aiResponse.match(/BREAKDOWN:\s*(.+?)(?=\n|$)/i);
    const feedbackMatch = aiResponse.match(/FEEDBACK:\s*(.+)/is);

    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 50;
    const breakdown = breakdownMatch
      ? breakdownMatch[1].trim()
      : 'No breakdown provided';
    const feedback = feedbackMatch
      ? feedbackMatch[1].trim()
      : 'No feedback provided';

    logger.info('✅ Detailed scoring completed', {
      score,
      breakdown: breakdown.substring(0, 50) + '...',
    });

    return {
      score: Math.max(0, Math.min(100, score)),
      breakdown,
      feedback,
    };
  } catch (err) {
    logger.error('❌ Detailed scoring failed:', err);
    return {
      score: 50,
      breakdown: 'Scoring failed due to technical error',
      feedback: 'Unable to provide detailed feedback at this time',
    };
  }
}

export default {
  autoScoreSubmission,
  getDetailedScore,
};
