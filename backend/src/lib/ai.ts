import OpenAI from 'openai';
import { z } from 'zod';
import logger from '../utils/logger';
import { ai } from '../config/env';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: ai.openaiApiKey,
});

// AI Response schemas
const CodeReviewSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.array(z.string()),
  issues: z.array(
    z.object({
      type: z.enum([
        'security',
        'performance',
        'style',
        'logic',
        'documentation',
      ]),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      message: z.string(),
      line: z.number().optional(),
    })
  ),
  suggestions: z.array(z.string()),
  plagiarismScore: z.number().min(0).max(100),
  complexityScore: z.number().min(0).max(100),
});

const TaskFeedbackSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  nextSteps: z.array(z.string()),
});

const CodeValidationSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(
    z.object({
      type: z.enum(['syntax', 'logic', 'security', 'style']),
      message: z.string(),
      line: z.number().optional(),
    })
  ),
  warnings: z.array(z.string()),
  suggestions: z.array(z.string()),
});

// AI scoring function
export async function scoreSubmission(
  taskDescription: string,
  userCode: string,
  language: string = 'javascript'
): Promise<z.infer<typeof CodeReviewSchema>> {
  try {
    const prompt = `
You are an expert code reviewer for the CaBE platform. Review the following code submission and provide a comprehensive assessment.

TASK DESCRIPTION:
${taskDescription}

USER CODE (${language}):
\`\`\`${language}
${userCode}
\`\`\`

Please provide a detailed code review in the following JSON format:
{
  "score": number (0-100),
  "feedback": ["specific feedback points"],
  "issues": [
    {
      "type": "security|performance|style|logic|documentation",
      "severity": "low|medium|high|critical",
      "message": "description of the issue",
      "line": number (optional)
    }
  ],
  "suggestions": ["improvement suggestions"],
  "plagiarismScore": number (0-100, estimate of originality),
  "complexityScore": number (0-100, code complexity assessment)
}

Focus on:
- Code quality and best practices
- Security vulnerabilities
- Performance considerations
- Readability and maintainability
- Task requirements fulfillment
- Originality and creativity
`;

    const completion = await openai.chat.completions.create({
      model: ai.openaiModel,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert code reviewer. Always respond with valid JSON in the exact format specified.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI service');
    }

    // Parse and validate the response
    const parsedResponse = JSON.parse(response);
    const validatedResponse = CodeReviewSchema.parse(parsedResponse);

    logger.info('AI scoring completed', {
      score: validatedResponse.score,
      issuesCount: validatedResponse.issues.length,
      plagiarismScore: validatedResponse.plagiarismScore,
    });

    return validatedResponse;
  } catch (error) {
    logger.error('AI scoring failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error('Failed to score submission');
  }
}

// Generate task feedback
export async function generateTaskFeedback(
  taskTitle: string,
  userScore: number,
  maxScore: number,
  userCode: string,
  aiFeedback: string[]
): Promise<z.infer<typeof TaskFeedbackSchema>> {
  try {
    const prompt = `
You are a supportive mentor providing feedback to a developer. Generate encouraging and constructive feedback for their task submission.

TASK: ${taskTitle}
USER SCORE: ${userScore}/${maxScore}
USER CODE:
\`\`\`
${userCode}
\`\`\`

AI FEEDBACK:
${aiFeedback.join('\n')}

Please provide feedback in the following JSON format:
{
  "score": number (0-100, adjusted score),
  "feedback": "overall feedback message",
  "strengths": ["what they did well"],
  "weaknesses": ["areas for improvement"],
  "suggestions": ["specific suggestions"],
  "nextSteps": ["recommended next actions"]
}

Be encouraging but honest. Focus on growth and learning.
`;

    const completion = await openai.chat.completions.create({
      model: ai.openaiModel,
      messages: [
        {
          role: 'system',
          content:
            'You are a supportive coding mentor. Always respond with valid JSON in the exact format specified.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI service');
    }

    const parsedResponse = JSON.parse(response);
    const validatedResponse = TaskFeedbackSchema.parse(parsedResponse);

    logger.info('AI feedback generated', {
      taskTitle,
      userScore,
      maxScore,
    });

    return validatedResponse;
  } catch (error) {
    logger.error('AI feedback generation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error('Failed to generate feedback');
  }
}

// Validate code syntax and structure
export async function validateCode(
  code: string,
  language: string = 'javascript'
): Promise<z.infer<typeof CodeValidationSchema>> {
  try {
    const prompt = `
You are a code validator. Check the following code for syntax errors, logic issues, and potential problems.

CODE (${language}):
\`\`\`${language}
${code}
\`\`\`

Please validate the code and respond in the following JSON format:
{
  "isValid": boolean,
  "errors": [
    {
      "type": "syntax|logic|security|style",
      "message": "description of the error",
      "line": number (optional)
    }
  ],
  "warnings": ["warning messages"],
  "suggestions": ["improvement suggestions"]
}

Focus on:
- Syntax errors
- Logic errors
- Security vulnerabilities
- Code style issues
- Best practices violations
`;

    const completion = await openai.chat.completions.create({
      model: ai.openaiModel,
      messages: [
        {
          role: 'system',
          content:
            'You are a code validator. Always respond with valid JSON in the exact format specified.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI service');
    }

    const parsedResponse = JSON.parse(response);
    const validatedResponse = CodeValidationSchema.parse(parsedResponse);

    logger.info('Code validation completed', {
      isValid: validatedResponse.isValid,
      errorsCount: validatedResponse.errors.length,
      warningsCount: validatedResponse.warnings.length,
    });

    return validatedResponse;
  } catch (error) {
    logger.error('Code validation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error('Failed to validate code');
  }
}

// Generate personalized task recommendations
export async function generateTaskRecommendations(
  userSkills: string[],
  userLevel: string,
  completedTasks: string[]
): Promise<string[]> {
  try {
    const prompt = `
You are a task recommendation system. Based on the user's profile, suggest relevant tasks.

USER SKILLS: ${userSkills.join(', ')}
USER LEVEL: ${userLevel}
RECENTLY COMPLETED TASKS: ${completedTasks.join(', ')}

Suggest 5 relevant tasks that would help the user grow. Consider:
- Skill progression
- Difficulty appropriate for their level
- Variety in task types
- Building on completed work

Respond with a JSON array of task titles:
["Task 1", "Task 2", "Task 3", "Task 4", "Task 5"]
`;

    const completion = await openai.chat.completions.create({
      model: ai.openaiModel,
      messages: [
        {
          role: 'system',
          content:
            'You are a task recommendation system. Always respond with valid JSON array.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI service');
    }

    const recommendations = JSON.parse(response);

    if (!Array.isArray(recommendations)) {
      throw new Error('Invalid recommendations format');
    }

    logger.info('Task recommendations generated', {
      userSkills,
      userLevel,
      recommendationsCount: recommendations.length,
    });

    return recommendations;
  } catch (error) {
    logger.error('Task recommendations failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error('Failed to generate recommendations');
  }
}

// Health check for AI service
export async function checkAIServiceHealth(): Promise<boolean> {
  try {
    const completion = await openai.chat.completions.create({
      model: ai.openaiModel,
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5,
    });

    return !!completion.choices[0]?.message?.content;
  } catch (error) {
    logger.error('AI service health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}
