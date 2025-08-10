# Review Assistant Prompt Generator

## Overview

The **Review Assistant Prompt Generator** is a utility that converts audit run and submission data into structured prompts for LLM-powered chat assistants. This enables AI-powered analysis and recommendations for human reviewers during the audit process.

## Features

### 🎯 **Core Functionality**

- **Structured Prompt Generation**: Converts raw audit data into well-formatted prompts
- **Comprehensive Data Presentation**: Includes metadata, submission table, and totals
- **LLM-Optimized Format**: Designed for optimal AI assistant performance
- **Flexible Input**: Handles various audit data structures
- **Clear Instructions**: Provides specific guidance for AI analysis

### 📊 **Prompt Structure**

- **Audit Metadata**: Run details, reviewer info, task context
- **Submission Table**: Formatted table with all submission data
- **Statistical Totals**: Deviation and action type summaries
- **Analysis Instructions**: Clear guidance for AI assistant

## API Reference

### Types

```typescript
export interface ReviewPromptInput {
  auditMetadata: {
    runId: string;
    reviewer: string;
    skillArea: string;
    taskTitle: string;
    taskDifficulty: string;
    auditStartedAt: string;
    auditCompletedAt: string;
  };
  submissions: {
    submissionId: string;
    userId: string;
    userScore: number;
    aiScore: number;
    deviationType: 'none' | 'minor' | 'major' | 'critical';
    suggestedAction: 'allow' | 'flag_for_review' | 'escalate' | 'override';
    notes?: string;
  }[];
}
```

### Main Function

#### `generateReviewAssistantPrompt(input: ReviewPromptInput): string`

Generates a structured prompt for LLM chat assistants.

**Parameters:**

- `input`: Complete audit data with metadata and submissions

**Returns:** `string` - Formatted prompt ready for LLM consumption

**Example:**

```typescript
import { generateReviewAssistantPrompt } from '../src/utils/AuditReviewChatHelper';

const auditData: ReviewPromptInput = {
  auditMetadata: {
    runId: 'run-123',
    reviewer: 'admin-1',
    skillArea: 'Backend',
    taskTitle: 'Build a secure API',
    taskDifficulty: 'Hard',
    auditStartedAt: '2024-01-01T10:00:00Z',
    auditCompletedAt: '2024-01-01T12:30:00Z',
  },
  submissions: [
    {
      submissionId: 'sub-01',
      userId: 'u001',
      userScore: 90,
      aiScore: 80,
      deviationType: 'minor',
      suggestedAction: 'flag_for_review',
      notes: 'Code quality exceeds AI assessment',
    },
    // ... more submissions
  ],
};

const prompt = generateReviewAssistantPrompt(auditData);
console.log(prompt);
```

## Output Format

### Generated Prompt Structure

```
📋 Audit Metadata
Run ID: run-123
Reviewer: admin-1
Skill Area: Backend
Task: Build a secure API
Difficulty: Hard
Started At: 01/01/2024, 10:00 AM
Completed At: 01/01/2024, 12:30 PM

📊 Submission Summary
| Sub ID  | User | User Score | AI Score | Deviation | Action           | Notes       |
|---------|------|------------|----------|-----------|------------------|-------------|
| sub-01  | u001 |         90 |       80 |         10 | flag_for_review  | Code quality exceeds AI assessment |
| sub-02  | u002 |         70 |       75 |          5 | allow            | --          |
| sub-03  | u003 |         95 |       60 |         35 | escalate         | Suspicious scoring pattern |

✅ Totals
- Deviations: none: 3, minor: 2, major: 1, critical: 2
- Actions: allow (3), flag_for_review (2), escalate (2), override (1)

🧠 Instruction:
Analyze these audit results and give a concise performance summary + list of 3 recommendations for future audits.
```

## Integration Examples

### Basic Usage

```typescript
// Simple integration
import { generateReviewAssistantPrompt } from '../src/utils/AuditReviewChatHelper';

async function analyzeAuditWithAI(auditData: ReviewPromptInput) {
  // Generate the prompt
  const prompt = generateReviewAssistantPrompt(auditData);

  // Send to LLM assistant (example with OpenAI)
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert audit analyst assistant. Provide clear, actionable insights.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  return response.choices[0].message.content;
}
```

### Integration with Audit Dashboard

```typescript
// React component integration
import React, { useState } from 'react';
import { generateReviewAssistantPrompt } from '../src/utils/AuditReviewChatHelper';

interface AuditAnalysisProps {
  auditData: ReviewPromptInput;
}

function AuditAnalysis({ auditData }: AuditAnalysisProps) {
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const analyzeWithAI = async () => {
    setIsLoading(true);
    try {
      const prompt = generateReviewAssistantPrompt(auditData);

      // Send to your AI service
      const analysis = await sendToAIAssistant(prompt);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="audit-analysis">
      <button
        onClick={analyzeWithAI}
        disabled={isLoading}
        className="analyze-btn"
      >
        {isLoading ? 'Analyzing...' : 'Analyze with AI'}
      </button>

      {aiAnalysis && (
        <div className="ai-analysis-result">
          <h3>AI Analysis</h3>
          <pre>{aiAnalysis}</pre>
        </div>
      )}
    </div>
  );
}
```

### Integration with API Endpoints

```typescript
// Express.js API endpoint
import { generateReviewAssistantPrompt } from '../src/utils/AuditReviewChatHelper';

app.post('/api/audit/:runId/analyze', async (req, res) => {
  try {
    const { runId } = req.params;

    // Fetch audit data
    const auditData = await fetchAuditData(runId);

    // Generate prompt
    const prompt = generateReviewAssistantPrompt(auditData);

    // Send to AI service
    const aiResponse = await sendToAIAssistant(prompt);

    res.json({
      success: true,
      data: {
        prompt,
        analysis: aiResponse,
        auditId: runId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to analyze audit',
    });
  }
});
```

## Configuration Options

### Customizing the Prompt

You can extend the function to support custom instructions:

```typescript
// Extended version with custom instructions
function generateCustomReviewPrompt(
  input: ReviewPromptInput,
  customInstruction?: string
): string {
  const basePrompt = generateReviewAssistantPrompt(input);

  if (customInstruction) {
    return basePrompt.replace(
      'Analyze these audit results and give a concise performance summary + list of 3 recommendations for future audits.',
      customInstruction
    );
  }

  return basePrompt;
}

// Usage with custom instruction
const customPrompt = generateCustomReviewPrompt(
  auditData,
  'Focus on security implications and provide 5 specific security recommendations.'
);
```

### Prompt Length Optimization

For large datasets, consider chunking:

```typescript
function generateChunkedPrompt(
  input: ReviewPromptInput,
  maxSubmissions: number = 20
): string[] {
  const { auditMetadata, submissions } = input;

  if (submissions.length <= maxSubmissions) {
    return [generateReviewAssistantPrompt(input)];
  }

  // Split into chunks
  const chunks: ReviewPromptInput[] = [];
  for (let i = 0; i < submissions.length; i += maxSubmissions) {
    chunks.push({
      auditMetadata,
      submissions: submissions.slice(i, i + maxSubmissions),
    });
  }

  return chunks.map((chunk) => generateReviewAssistantPrompt(chunk));
}
```

## Testing

### Running Tests

```bash
# Run the test script
cd backend
npx tsx scripts/test-review-assistant-prompt.ts
```

### Test Coverage

The test suite verifies:

- ✅ Prompt structure and formatting
- ✅ Data accuracy and completeness
- ✅ Totals calculation
- ✅ Table alignment
- ✅ Metadata inclusion
- ✅ Instruction clarity

### Example Test Output

```
🧠 Testing Review Assistant Prompt Generator

✅ Successfully generated review assistant prompt

📋 Generated Prompt:
===================
📋 Audit Metadata
Run ID: run-123
Reviewer: admin-1
Skill Area: Backend
Task: Build a secure API
Difficulty: Hard
Started At: 01/01/2024, 10:00 AM
Completed At: 01/01/2024, 12:30 PM

📊 Submission Summary
| Sub ID  | User | User Score | AI Score | Deviation | Action           | Notes       |
|---------|------|------------|----------|-----------|------------------|-------------|
| sub-01  | u001 |         90 |       80 |         10 | flag_for_review  | Code quality exceeds AI assessment |
...

🔍 Prompt Structure Verification:
================================
✅ Audit Metadata: Found
✅ Submission Summary: Found
✅ Table Header: Found
✅ Totals Section: Found
✅ Instruction: Found

📊 Data Verification:
===================
✅ Run ID: Present
✅ Reviewer: Present
✅ Skill Area: Present
✅ Task Title: Present
✅ Difficulty: Present

🎉 Review Assistant Prompt Test Complete!
```

## Best Practices

### 1. Data Validation

Always validate input data before generating prompts:

```typescript
function validateAuditData(input: ReviewPromptInput): boolean {
  if (!input.auditMetadata || !input.submissions) {
    return false;
  }

  if (input.submissions.length === 0) {
    return false;
  }

  // Validate each submission
  return input.submissions.every(
    (sub) =>
      sub.submissionId &&
      sub.userId &&
      typeof sub.userScore === 'number' &&
      typeof sub.aiScore === 'number'
  );
}
```

### 2. Error Handling

Implement proper error handling:

```typescript
function safeGeneratePrompt(input: ReviewPromptInput): string {
  try {
    if (!validateAuditData(input)) {
      throw new Error('Invalid audit data');
    }

    return generateReviewAssistantPrompt(input);
  } catch (error) {
    console.error('Failed to generate prompt:', error);
    return 'Error: Unable to generate analysis prompt';
  }
}
```

### 3. Performance Considerations

For large datasets:

- Consider chunking prompts
- Implement caching for repeated analyses
- Use streaming for real-time analysis

### 4. AI Service Integration

When integrating with AI services:

- Set appropriate rate limits
- Implement retry logic
- Cache responses when possible
- Monitor token usage

## Future Enhancements

### Planned Features

- **Multi-language Support**: Generate prompts in different languages
- **Custom Templates**: Allow custom prompt templates
- **Real-time Analysis**: Stream analysis results
- **Batch Processing**: Process multiple audits simultaneously
- **Advanced Filtering**: Filter submissions before analysis
- **Export Capabilities**: Export prompts to various formats

### Integration Roadmap

- **ChatGPT Integration**: Direct OpenAI API integration
- **Claude Integration**: Anthropic Claude API support
- **Local LLM Support**: Integration with local models
- **Slack Integration**: Send analysis to Slack channels
- **Email Integration**: Email analysis reports
- **Dashboard Widgets**: Real-time analysis widgets

## Support

For questions or issues with the Review Assistant Prompt Generator:

1. Check the test suite for examples
2. Review the integration examples
3. Validate your input data structure
4. Contact the development team

---

**The Review Assistant Prompt Generator is production-ready and provides seamless integration between audit data and AI-powered analysis.** 🧠✨
