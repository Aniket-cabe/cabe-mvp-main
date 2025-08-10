# CaBOT Auto-Messenger System

An intelligent LLM-powered system for generating contextual micro-messages across the CaBE platform. The Auto-Messenger creates short, punchy messages that match the platform's personality and adapt to different communication tones.

## 🎯 Purpose

The Auto-Messenger system provides:

- **Consistent messaging** across all platform interactions
- **Tone-adaptive communication** for different user contexts
- **Micro-message generation** (8-40 words) for optimal engagement
- **Real-time message creation** for dynamic platform events
- **A/B testing support** with message variants

## 🧠 System Architecture

### Core Components

```
backend/
├── prompts/
│   ├── auto-messenger.txt              # Main LLM prompt
│   ├── auto-messenger-examples.md      # Comprehensive examples
│   └── auto-messenger-README.md        # This documentation
├── utils/
│   └── auto-messenger-service.js       # Service integration layer
├── routes/
│   └── auto-messenger-api.js           # Express.js API routes
└── scripts/
    └── test-auto-messenger.js          # Validation test suite
```

### Message Generation Flow

```
Context Input → Tone Selection → LLM Processing → Validation → Caching → Response
```

## 🎨 Supported Tones

### 1. Friendly 😊

- **Personality**: Warm, encouraging, supportive
- **Language**: Casual, conversational
- **Emojis**: Light usage (😊, 👍, ✨, 🎉)
- **Use Cases**: General notifications, positive updates, welcomes

**Example:**

```
Input: "User proof passed moderation review"
Output: "Great work! Your proof has been approved 👍"
```

### 2. Serious 📋

- **Personality**: Professional, direct, factual
- **Language**: Formal, clear, no-nonsense
- **Emojis**: None
- **Use Cases**: Important alerts, system notifications, policy messages

**Example:**

```
Input: "User proof passed moderation review"
Output: "Proof approved. Points have been awarded."
```

### 3. Hype 🔥

- **Personality**: Gen-Z energy, excitement, dopamine-driven
- **Language**: Trending slang, energetic expressions
- **Emojis**: Heavy usage (🔥💯⚡💀)
- **Use Cases**: Achievements, celebrations, engagement boosts

**Example:**

```
Input: "User proof passed moderation review"
Output: "PROOF APPROVED! You absolutely SLAYED that! 🔥💯✨"
```

## 📝 Input Format

### JSON Request Structure

```json
{
  "context": "User earned 50 points for completing task",
  "tone": "friendly"
}
```

### Context Categories

The system automatically detects context categories for optimized responses:

- **Authentication**: login, logout, verification, passwords
- **Submissions**: proofs, reviews, approvals, rejections
- **Achievements**: badges, streaks, ranks, milestones
- **System**: maintenance, updates, features, downtime
- **Moderation**: warnings, violations, appeals
- **Points**: earned, awarded, bonuses, deductions
- **Social**: followers, mentions, shares, comments

## 🚀 API Usage

### Generate Single Message

```javascript
POST /api/messenger/generate

{
  "context": "User reached 7-day submission streak",
  "tone": "hype",
  "options": {
    "bypassCache": false
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "7 DAYS STRAIGHT! You're on FIRE bestie! Keep going! 🔥⚡💪",
    "tone": "hype",
    "context": "User reached 7-day submission streak",
    "category": "achievements",
    "wordCount": 12,
    "metadata": {
      "messageId": "msg-1234567890",
      "processingTime": 450,
      "cached": false,
      "generatedAt": "2024-01-30T10:30:00Z",
      "attempts": 1
    }
  }
}
```

### Generate Message Variants for A/B Testing

```javascript
POST /api/messenger/variants

{
  "context": "User earned their first coding badge",
  "tone": "friendly",
  "count": 3
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "variants": [
      {
        "message": "Congrats! You just earned your first coding badge 🏆",
        "wordCount": 9,
        "processingTime": 420
      },
      {
        "message": "Amazing! Your first coding badge is here ✨",
        "wordCount": 8,
        "processingTime": 380
      },
      {
        "message": "Woohoo! First coding badge unlocked 🎉",
        "wordCount": 6,
        "processingTime": 390
      }
    ],
    "stats": {
      "total": 3,
      "successful": 3,
      "failed": 0
    }
  }
}
```

### Batch Message Generation

```javascript
POST /api/messenger/batch

{
  "requests": [
    {
      "context": "User logged in successfully",
      "tone": "friendly"
    },
    {
      "context": "System maintenance starting",
      "tone": "serious"
    },
    {
      "context": "New feature launched",
      "tone": "hype"
    }
  ]
}
```

### Service Health Check

```javascript
GET /api/messenger/health

{
  "status": "healthy",
  "service": "auto-messenger",
  "responseTime": "420ms",
  "cacheSize": 847,
  "wordCount": 12,
  "timestamp": "2024-01-30T10:30:00Z"
}
```

### Get Service Statistics

```javascript
GET /api/messenger/stats

{
  "success": true,
  "data": {
    "totalGenerated": 2847,
    "cacheHits": 1203,
    "cacheHitRate": 42,
    "averageLength": 14.2,
    "toneDistribution": {
      "friendly": 1547,
      "serious": 892,
      "hype": 408
    },
    "cacheSize": 847,
    "uptime": 7234567,
    "supportedTones": ["friendly", "serious", "hype"]
  }
}
```

## 🔧 Configuration

### Service Configuration

```javascript
const config = {
  maxMessageLength: 40, // Maximum words per message
  minMessageLength: 8, // Minimum words per message
  cacheEnabled: true, // Enable message caching
  cacheTimeout: 3600000, // 1 hour cache timeout
  defaultTone: 'friendly', // Fallback tone
  timeoutMs: 10000, // 10 second LLM timeout
  retryAttempts: 2, // Retry failed generations
  validateLength: true, // Enforce length limits
  logMessages: true, // Log generated messages
};
```

### Rate Limiting

```javascript
// Standard message generation: 100 per 15 minutes per IP
// Batch operations: 5 per hour per IP
// Health checks: Unlimited
```

### Environment Variables

```env
# LLM Service Configuration
LLM_API_KEY=your_api_key_here
LLM_MODEL=gpt-4
LLM_MAX_TOKENS=100

# Auto-Messenger Configuration
MESSENGER_DEFAULT_TONE=friendly
MESSENGER_CACHE_ENABLED=true
MESSENGER_MAX_LENGTH=40
MESSENGER_MIN_LENGTH=8
MESSENGER_LOG_LEVEL=info
```

## 🧪 Message Examples by Context

### Authentication Messages

| Context                | Friendly                                                  | Serious                                                | Hype                                               |
| ---------------------- | --------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------- |
| **Login Success**      | Hey there! Welcome back to CaBE ✨                        | Login successful. Access granted.                      | YOOO YOU'RE BACK! Let's get this bread! 🔥💯       |
| **Login Failed**       | Hmm, those credentials didn't work. Want to try again? 😊 | Authentication failed. Please verify your credentials. | Nah fam, those creds ain't it! Try again bestie 💀 |
| **Email Verification** | Check your inbox! We sent you a verification link 📧      | Verification email sent. Check your inbox to continue. | EMAIL INCOMING! Check that inbox NOW! ⚡📬         |

### Submission Messages

| Context            | Friendly                                                       | Serious                                           | Hype                                                       |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------- |
| **Proof Approved** | Great work! Your proof has been approved 👍                    | Proof approved. Points have been awarded.         | PROOF APPROVED! You absolutely SLAYED that! 🔥💯✨         |
| **Proof Rejected** | Your proof needs some work. Check the feedback and try again!  | Proof rejected. Review requirements and resubmit. | Proof got rejected bestie 💀 But don't give up! Try again! |
| **Under Review**   | Your submission is being reviewed. We'll get back to you soon! | Submission received. Review in progress.          | SUBMISSION LOCKED IN! Our team is checking it out! ⏳🔥    |

### Achievement Messages

| Context              | Friendly                                             | Serious                                                    | Hype                                                               |
| -------------------- | ---------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| **New Badge**        | Congrats! You just earned your first coding badge 🏆 | Coding badge unlocked. Achievement recorded.               | FIRST CODING BADGE UNLOCKED! You're absolutely CRUSHING IT! 🏆💯🔥 |
| **Streak Milestone** | Amazing! You've got a 7-day streak going 🔥          | 7-day streak achieved. Consistency bonus applied.          | 7 DAYS STRAIGHT! You're on FIRE bestie! Keep going! 🔥⚡💪         |
| **Rank Promotion**   | Woohoo! You've been promoted to Silver rank ✨       | Rank promotion: Bronze to Silver. New privileges unlocked. | SILVER RANK UNLOCKED! You're leveling UP! So proud! 🥈💯⚡         |

### System Updates

| Context                | Friendly                                                    | Serious                                                   | Hype                                                                     |
| ---------------------- | ----------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Maintenance Notice** | Hey! We'll be doing some quick maintenance in an hour 🔧    | Scheduled maintenance begins in 1 hour. Plan accordingly. | MAINTENANCE INCOMING in 1 hour! We're making things even MORE epic! 🔧⚡ |
| **New Feature**        | Check it out! Our new AI helper is here to assist you 🤖    | New feature available: AI Helper. Access via main menu.   | NEW AI HELPER JUST DROPPED! This is about to change EVERYTHING! 🤖🔥💯   |
| **Service Restored**   | We're back! Thanks for your patience during the downtime 😊 | All services restored. Normal operations resumed.         | WE'RE BACK BABY! Let's pick up where we left off! 🔥⚡                   |

## 📊 Quality Validation

### Message Length Requirements

- **Minimum**: 8 words (ensures complete thoughts)
- **Maximum**: 40 words (maintains micro-message format)
- **Sweet spot**: 15-25 words (optimal engagement)

### Tone Consistency Checks

- **Friendly**: Must include welcoming language and appropriate emojis
- **Serious**: No emojis, formal language, direct communication
- **Hype**: Must include excitement words, caps, and energy emojis

### Content Validation

- No corporate speak or jargon
- Context-appropriate messaging
- Platform personality alignment
- Grammatically correct structure

## 🚀 Integration Examples

### Frontend React Component

```typescript
import React, { useState } from 'react';

interface MessageGeneratorProps {
  context: string;
  onMessageGenerated: (message: string) => void;
}

const MessageGenerator: React.FC<MessageGeneratorProps> = ({
  context,
  onMessageGenerated
}) => {
  const [tone, setTone] = useState<'friendly' | 'serious' | 'hype'>('friendly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<string>('');

  const generateMessage = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/messenger/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, tone })
      });

      const result = await response.json();

      if (result.success) {
        setMessage(result.data.message);
        onMessageGenerated(result.data.message);
      }
    } catch (error) {
      console.error('Message generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="message-generator">
      <div className="tone-selector">
        {['friendly', 'serious', 'hype'].map(toneOption => (
          <button
            key={toneOption}
            onClick={() => setTone(toneOption as any)}
            className={tone === toneOption ? 'active' : ''}
          >
            {toneOption}
          </button>
        ))}
      </div>

      <button onClick={generateMessage} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate Message'}
      </button>

      {message && (
        <div className="generated-message">
          "{message}"
        </div>
      )}
    </div>
  );
};
```

### Backend Service Integration

```javascript
const {
  AutoMessengerService,
  OpenAILLMService,
} = require('./utils/auto-messenger-service');

// Initialize service
const llmService = new OpenAILLMService(process.env.OPENAI_API_KEY);
const messenger = new AutoMessengerService(llmService);

// Generate message for user action
async function notifyUserAction(userId, action, details) {
  try {
    const context = `User ${action}: ${details}`;
    const tone = getUserPreferredTone(userId) || 'friendly';

    const result = await messenger.generateMessage(context, tone, {
      requestId: `user-${userId}-${Date.now()}`,
    });

    // Send notification
    await sendNotification(userId, result.message);

    // Log for analytics
    logNotification(userId, action, result);
  } catch (error) {
    console.error('Failed to generate notification:', error);
    // Fallback to static message
    await sendNotification(userId, getStaticMessage(action));
  }
}

// Example usage
await notifyUserAction('user123', 'earned badge', 'First Coding Badge');
await notifyUserAction('user456', 'proof approved', 'React Component Task');
```

## 📈 Performance Optimization

### Caching Strategy

- **Hash-based caching**: Identical context+tone combinations return cached results
- **Memory cache**: Fast in-memory storage with TTL
- **Cache warming**: Pre-generate common message types
- **Hit rate monitoring**: Track cache effectiveness (target >40%)

### Response Time Targets

- **Single message**: <1 second average
- **Batch processing**: <3 seconds for 10 messages
- **Cache hits**: <100ms
- **Health checks**: <500ms

### Scaling Considerations

- **Horizontal scaling**: Multiple service instances
- **Load balancing**: Distribute requests across instances
- **Cache sharing**: Redis for shared cache across instances
- **Rate limiting**: Prevent abuse and ensure fair usage

## 🔒 Security Features

### Input Sanitization

- Context length validation (3-500 characters)
- Tone validation against whitelist
- SQL injection prevention
- XSS protection

### Rate Limiting

- IP-based request limiting
- User-based quotas
- Progressive backoff for abuse
- Emergency circuit breakers

### Output Validation

- Message length enforcement
- Content filtering for inappropriate material
- Emoji validation for platform compatibility
- Character encoding safety

## 📊 Monitoring & Analytics

### Key Metrics

- **Generation volume**: Messages per hour/day
- **Tone distribution**: Usage across friendly/serious/hype
- **Cache performance**: Hit rates and efficiency
- **Response times**: Latency monitoring
- **Error rates**: System reliability tracking
- **User engagement**: Message effectiveness metrics

### Alerting Thresholds

- **Error rate >5%**: System health alert
- **Response time >2s**: Performance alert
- **Cache hit rate <30%**: Efficiency alert
- **Generation volume >1000/hour**: Capacity alert

## 🔄 Maintenance

### Regular Tasks

- **Cache optimization**: Weekly cache analysis and tuning
- **Prompt updates**: Monthly prompt refinements
- **Performance review**: Weekly metrics analysis
- **A/B testing**: Continuous message variant testing

### Update Procedures

- **Prompt versioning**: Track prompt changes with git
- **Gradual rollouts**: Deploy changes incrementally
- **Rollback capability**: Quick revert for issues
- **Testing requirements**: Validate all changes thoroughly

## 📚 Troubleshooting

### Common Issues

**Poor message quality:**

- Review prompt examples
- Adjust tone parameters
- Update LLM model
- Refine context categories

**High response times:**

- Check LLM service status
- Monitor cache hit rates
- Optimize prompt length
- Scale service instances

**Low cache hit rates:**

- Analyze context patterns
- Adjust cache timeout
- Improve context normalization
- Monitor cache size limits

### Debug Commands

```javascript
// Check service health
const health = await messenger.healthCheck();
console.log('Service status:', health);

// Review statistics
const stats = messenger.getStats();
console.log('Service stats:', stats);

// Clear cache
messenger.clearCache();

// Reset statistics
messenger.resetStats();

// Generate test message
const test = await messenger.generateMessage(
  'Test message generation',
  'friendly',
  { requestId: 'debug-test' }
);
```

---

**CaBOT Auto-Messenger v1.0** - Bringing personality to every platform interaction! 🤖💬✨
