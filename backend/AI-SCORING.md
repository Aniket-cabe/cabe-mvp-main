# AI Auto-Scoring System

This document describes the AI auto-scoring system for automatically evaluating code submissions using OpenRouter AI.

## 📁 File Structure

```
backend/src/utils/
├── ai-score-utils.ts     # AI scoring utility functions
├── logger.ts             # Logging utility
└── ai.ts                 # General AI utilities
```

## 🤖 Core Functions

### 1. `autoScoreSubmission(taskTitle: string, userCode: string): Promise<number>`

Automatically scores a code submission using AI evaluation.

**Parameters:**

- `taskTitle` (string): The title/description of the task
- `userCode` (string): The user's submitted code

**Returns:** `Promise<number>` - Score between 0-100

**Example:**

```typescript
import { autoScoreSubmission } from './utils/ai-score-utils';

const score = await autoScoreSubmission(
  'Build a React Navbar',
  'const Navbar = () => <nav>Menu</nav>'
);
console.log(`Score: ${score}`); // Output: Score: 75
```

### 2. `getDetailedScore(taskTitle: string, userCode: string): Promise<{score: number, breakdown: string, feedback: string}>`

Gets a detailed scoring breakdown with feedback.

**Returns:** Promise with score, breakdown, and detailed feedback

**Example:**

```typescript
import { getDetailedScore } from './utils/ai-score-utils';

const result = await getDetailedScore(
  'Build a React Navbar',
  'const Navbar = () => <nav>Menu</nav>'
);

console.log(result);
// Output:
// {
//   score: 75,
//   breakdown: "Correctness: 30/40, Readability: 25/30, Adherence: 20/30",
//   feedback: "Good basic structure but missing styling and accessibility..."
// }
```

## 🧪 Test Endpoint

### POST /api/test/ai/autoscore

Test the AI auto-scoring functionality.

**URL:** `POST /api/test/ai/autoscore`

**Request Body:**

```json
{
  "taskTitle": "Build a React Navbar",
  "userCode": "const Navbar = () => <nav>Menu</nav>"
}
```

**Success Response:**

```json
{
  "success": true,
  "taskTitle": "Build a React Navbar",
  "userCode": "const Navbar = () => <nav>Menu</nav>",
  "basicScore": 75,
  "detailedScore": {
    "score": 75,
    "breakdown": "Correctness: 30/40, Readability: 25/30, Adherence: 20/30",
    "feedback": "Good basic structure but missing styling and accessibility features..."
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Task title and user code are required",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🧪 Testing Examples

### Using curl

```bash
# Test basic scoring
curl -X POST http://localhost:3001/api/test/ai/autoscore \
  -H "Content-Type: application/json" \
  -d '{
    "taskTitle": "Build a React Navbar",
    "userCode": "const Navbar = () => <nav>Menu</nav>"
  }'

# Test with more complex code
curl -X POST http://localhost:3001/api/test/ai/autoscore \
  -H "Content-Type: application/json" \
  -d '{
    "taskTitle": "Create a Counter Component",
    "userCode": "import React, { useState } from \"react\";\n\nconst Counter = () => {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <div>\n      <h2>Count: {count}</h2>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n      <button onClick={() => setCount(count - 1)}>Decrement</button>\n    </div>\n  );\n};"
  }'
```

### Using JavaScript/Fetch

```javascript
// Test AI auto-scoring
const response = await fetch('http://localhost:3001/api/test/ai/autoscore', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    taskTitle: 'Build a React Navbar',
    userCode: 'const Navbar = () => <nav>Menu</nav>',
  }),
});

const result = await response.json();
console.log('Basic Score:', result.basicScore);
console.log('Detailed Score:', result.detailedScore);
```

## 📊 Scoring Criteria

The AI evaluates submissions based on three main criteria:

### 1. Correctness (0-40 points)

- Does the code solve the task correctly?
- Are the core requirements met?
- Does it function as expected?

### 2. Readability (0-30 points)

- Is the code clear and well-structured?
- Are variable and function names descriptive?
- Is the code easy to understand?

### 3. Adherence (0-30 points)

- Does the code follow task requirements?
- Are best practices followed?
- Is the code maintainable and scalable?

## 🔧 Configuration

### Environment Variables

The AI scoring system requires:

```env
OPENROUTER_API_KEY=your-openrouter-api-key-here
```

### AI Model Settings

- **Model**: `mistralai/mistral-7b-instruct`
- **Temperature**: 0.1 (for consistent scoring)
- **Max Tokens**: 50 (for basic scoring), 500 (for detailed scoring)
- **System Prompt**: Optimized for code review and scoring

## 📝 Scoring Process

### 1. Input Validation

- Validates task title and user code are provided
- Checks for empty or invalid inputs

### 2. AI Prompt Creation

- Creates structured prompts with evaluation criteria
- Includes task context and user code
- Requests specific scoring format

### 3. API Request

- Sends request to OpenRouter API
- Uses proper authentication and headers
- Handles rate limiting and errors

### 4. Response Parsing

- Extracts numeric score from AI response
- Handles various response formats
- Validates score range (0-100)

### 5. Error Handling

- Provides fallback scores for API errors
- Logs detailed error information
- Graceful degradation for network issues

## 🔒 Error Handling

### Common Error Scenarios

1. **API Key Issues**
   - Invalid or missing API key
   - Authentication failures
   - **Fallback**: Returns score of 50

2. **Rate Limiting**
   - API quota exceeded
   - Too many requests
   - **Fallback**: Returns score of 50

3. **Network Issues**
   - Connection timeouts
   - Network failures
   - **Fallback**: Returns score of 50

4. **Parsing Errors**
   - Invalid AI response format
   - Non-numeric responses
   - **Fallback**: Returns score of 50

### Error Response Format

```typescript
// For API errors, the function throws an error
throw new Error(`AI scoring failed: ${errorMessage}`);

// For parsing errors, returns fallback score
return 50; // Neutral fallback score
```

## 📊 Logging

### Request Logging

```
🤖 Starting AI auto-scoring for submission
📤 Sending scoring request to OpenRouter AI
📥 Received AI response: 85
✅ AI scoring completed successfully
```

### Error Logging

```
❌ AI auto-scoring failed: API key invalid
🔑 Using fallback score due to authentication error
⚠️ Could not parse score from AI response, using fallback
```

### Detailed Scoring Logging

```
🔍 Getting detailed AI scoring breakdown
✅ Detailed scoring completed
```

## 🚀 Performance Considerations

### 1. Response Time

- Typical response time: 2-5 seconds
- Depends on code complexity and API load
- Consider caching for repeated evaluations

### 2. Token Usage

- Basic scoring: ~50 tokens
- Detailed scoring: ~500 tokens
- Monitor API usage and costs

### 3. Rate Limiting

- OpenRouter has rate limits
- Implement retry logic for production
- Consider batching requests

### 4. Caching Strategy

```typescript
// Example caching implementation
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedScore(
  taskTitle: string,
  userCode: string
): Promise<number> {
  const key = `${taskTitle}:${userCode}`;
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.score;
  }

  const score = await autoScoreSubmission(taskTitle, userCode);
  cache.set(key, { score, timestamp: Date.now() });
  return score;
}
```

## 🔧 Integration Examples

### 1. Arena Scoring Integration

```typescript
// In arena routes, integrate with auto-scoring
import { autoScoreSubmission } from '../utils/ai-score-utils';

// Auto-score a submission
const aiScore = await autoScoreSubmission(taskTitle, userCode);
const finalScore = Math.round((aiScore + manualScore) / 2); // Combine with manual scoring
```

### 2. Batch Processing

```typescript
// Process multiple submissions
async function batchScoreSubmissions(
  submissions: Array<{ taskTitle: string; userCode: string }>
) {
  const scores = await Promise.all(
    submissions.map((sub) => autoScoreSubmission(sub.taskTitle, sub.userCode))
  );
  return scores;
}
```

### 3. Quality Assurance

```typescript
// Validate AI scores with human review
async function validateAIScore(
  taskTitle: string,
  userCode: string,
  aiScore: number
) {
  if (aiScore < 30 || aiScore > 90) {
    // Flag for human review
    logger.warn('AI score outside expected range, flagging for review', {
      aiScore,
    });
    return { needsReview: true, aiScore };
  }
  return { needsReview: false, aiScore };
}
```

## 📈 Monitoring

### Key Metrics to Track

- **Response Times**: Average AI scoring response time
- **Success Rate**: Percentage of successful scoring attempts
- **Score Distribution**: Range and distribution of scores
- **Error Rates**: Frequency of different error types
- **API Usage**: Token consumption and costs

### Health Checks

```bash
# Test AI scoring endpoint
curl -X POST http://localhost:3001/api/test/ai/autoscore \
  -H "Content-Type: application/json" \
  -d '{"taskTitle":"Test","userCode":"test"}'

# Check API key validity
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  https://openrouter.ai/api/v1/auth/key
```

## 🔮 Future Enhancements

### 1. Multi-Model Scoring

- Use multiple AI models for consensus
- Compare scores across different models
- Implement voting mechanism

### 2. Custom Scoring Rubrics

- Allow custom evaluation criteria
- Support different scoring weights
- Domain-specific scoring rules

### 3. Learning System

- Collect human feedback on AI scores
- Improve scoring accuracy over time
- Implement feedback loops

### 4. Advanced Features

- Code quality metrics (complexity, maintainability)
- Security vulnerability detection
- Performance analysis
- Best practice compliance checking
