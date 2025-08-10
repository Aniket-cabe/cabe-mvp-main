# AI Integration with OpenRouter

This backend includes AI functionality powered by OpenRouter API using the Mistral-7B-Instruct model.

## 📁 File Structure

```
backend/src/lib/
├── ai.ts                    # AI utility functions
├── supabase-admin.ts        # Supabase admin client
└── supabase-utils.ts        # Database utility functions
```

## 🔧 Configuration

### Environment Variables

The AI functionality requires this environment variable:

```env
OPENROUTER_API_KEY=your-openrouter-api-key-here
```

### Getting an OpenRouter API Key

1. **Sign up** at [OpenRouter](https://openrouter.ai/)
2. **Add credits** to your account
3. **Generate an API key** in your dashboard
4. **Add the key** to your `.env` file

## 🎯 Core Functions

### 1. `generateAIResponse(prompt: string)`

Generates an AI response using the Mistral-7B-Instruct model.

**Parameters:**

- `prompt` (string): The user prompt to send to the AI

**Returns:** `Promise<string>` - The AI generated response

**Throws:** `Error` - If the API call fails or returns an error

**Example:**

```typescript
import { generateAIResponse } from './lib/ai';

try {
  const response = await generateAIResponse(
    'Explain TypeScript in simple terms'
  );
  console.log('AI Response:', response);
} catch (error) {
  console.error('AI Error:', error.message);
}
```

### 2. `generateGreeting(name: string)`

Generates a friendly greeting for a specific person.

**Parameters:**

- `name` (string): The name to greet

**Returns:** `Promise<string>` - A personalized greeting

**Example:**

```typescript
import { generateGreeting } from './lib/ai';

const greeting = await generateGreeting('Alice');
// Output: "Hello Alice! It's wonderful to meet you..."
```

### 3. `generateCodeFeedback(taskTitle: string, userCode: string)`

Generates constructive feedback on submitted code.

**Parameters:**

- `taskTitle` (string): The title of the coding task
- `userCode` (string): The user's submitted code

**Returns:** `Promise<string>` - Constructive feedback on the code

**Example:**

```typescript
import { generateCodeFeedback } from './lib/ai';

const feedback = await generateCodeFeedback(
  'Build a React Component',
  'function Button() { return <button>Click me</button>; }'
);
```

## 🧪 Test Endpoints

The application includes test endpoints to verify AI functionality:

### Generate AI Response

```bash
POST /api/test/ai/generate
Content-Type: application/json

{
  "prompt": "Explain what is React in simple terms"
}
```

**Success Response:**

```json
{
  "success": true,
  "prompt": "Explain what is React in simple terms",
  "response": "React is a JavaScript library for building user interfaces...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Generate Greeting

```bash
POST /api/test/ai/greeting
Content-Type: application/json

{
  "name": "John"
}
```

**Success Response:**

```json
{
  "success": true,
  "name": "John",
  "greeting": "Hello John! It's wonderful to meet you...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Generate Code Feedback

```bash
POST /api/test/ai/feedback
Content-Type: application/json

{
  "taskTitle": "Build a React Component",
  "userCode": "function Button() { return <button>Click me</button>; }"
}
```

**Success Response:**

```json
{
  "success": true,
  "taskTitle": "Build a React Component",
  "userCode": "function Button() { return <button>Click me</button>; }",
  "feedback": "Great start! Your component is functional...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 API Configuration

### OpenRouter API Settings

The AI functions are configured with these settings:

- **Model**: `mistralai/mistral-7b-instruct`
- **Temperature**: `0.7` (balanced creativity and consistency)
- **Max Tokens**: `1000` (reasonable response length)
- **Headers**: Proper authentication and analytics headers

### Request Structure

```typescript
{
  model: 'mistralai/mistral-7b-instruct',
  messages: [
    {
      role: 'user',
      content: prompt
    }
  ],
  temperature: 0.7,
  max_tokens: 1000
}
```

## 📊 Logging and Monitoring

### Log Messages

The AI functions log the following:

- **Request Start**: `🤖 Generating AI response for prompt: "..."`
- **Success**: `✅ AI response generated successfully`
- **Usage Stats**: `📊 AI response generated successfully: {token counts}`
- **Errors**: `❌ AI response generation failed: {error details}`

### Usage Statistics

When available, the API returns usage statistics:

```json
{
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 150,
    "total_tokens": 175
  }
}
```

## 🔒 Error Handling

### Common Error Scenarios

1. **Missing API Key**: `OPENROUTER_API_KEY is not configured`
2. **Invalid API Key**: `OpenRouter API error: Invalid API key`
3. **Rate Limiting**: `OpenRouter API error: Rate limit exceeded`
4. **Network Issues**: `OpenRouter API error: Network timeout`
5. **Model Unavailable**: `OpenRouter API error: Model not available`

### Error Handling Example

```typescript
try {
  const response = await generateAIResponse(prompt);
  // Handle success
} catch (error) {
  if (error.message.includes('API key')) {
    // Handle authentication error
    logger.error('OpenRouter API key is invalid or missing');
  } else if (error.message.includes('Rate limit')) {
    // Handle rate limiting
    logger.warn('OpenRouter rate limit exceeded');
  } else {
    // Handle other errors
    logger.error('AI generation failed:', error);
  }
}
```

## 💰 Cost Management

### Token Usage

- **Input Tokens**: Counted for the prompt
- **Output Tokens**: Counted for the response
- **Total Cost**: Based on total tokens used

### Cost Optimization

1. **Keep Prompts Concise**: Shorter prompts cost less
2. **Set Max Tokens**: Limit response length
3. **Monitor Usage**: Check token counts in logs
4. **Cache Responses**: Store common responses

## 🚀 Best Practices

### 1. Prompt Engineering

```typescript
// Good: Clear and specific
const prompt = 'Explain TypeScript interfaces with 3 examples';

// Avoid: Vague or overly complex
const prompt = 'Tell me about programming stuff';
```

### 2. Error Handling

```typescript
const response = await generateAIResponse(prompt).catch((error) => {
  logger.error('AI generation failed:', error);
  return 'Sorry, I could not generate a response at this time.';
});
```

### 3. Rate Limiting

```typescript
// Implement rate limiting for production use
const rateLimiter = new Map();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userRequests = rateLimiter.get(userId) || [];
  const recentRequests = userRequests.filter((time) => now - time < 60000); // 1 minute

  if (recentRequests.length >= 10) {
    // 10 requests per minute
    return false;
  }

  recentRequests.push(now);
  rateLimiter.set(userId, recentRequests);
  return true;
}
```

### 4. Response Validation

```typescript
function validateAIResponse(response: string): boolean {
  return response && response.length > 0 && response.length < 5000;
}
```

## 🔍 Troubleshooting

### Common Issues

1. **"API key not configured"**
   - Check `.env` file has `OPENROUTER_API_KEY`
   - Verify the key is valid in OpenRouter dashboard

2. **"Rate limit exceeded"**
   - Wait before making more requests
   - Implement rate limiting in your application

3. **"Model not available"**
   - Check OpenRouter service status
   - Verify model name is correct

4. **"Network timeout"**
   - Check internet connection
   - Verify firewall settings

### Debug Mode

Enable debug logging by setting:

```env
LOG_LEVEL=debug
```

This will provide detailed AI request/response logs for troubleshooting.

## 📈 Performance Monitoring

Monitor these metrics:

- **Response Time**: Time to generate AI responses
- **Success Rate**: Percentage of successful requests
- **Token Usage**: Total tokens consumed
- **Error Rate**: Frequency of API errors
- **Cost**: Monthly API usage costs
