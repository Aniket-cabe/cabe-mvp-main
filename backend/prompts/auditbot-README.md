# AuditBot - Automated Code Review System

AuditBot is a strict, no-nonsense LLM-powered code validation system for the CaBE platform. It performs comprehensive audits for code quality, security vulnerabilities, plagiarism detection, and complexity analysis.

## 🎯 Purpose

AuditBot maintains high code quality standards by:

- **Detecting plagiarism** with >80% accuracy
- **Identifying security vulnerabilities** in real-time
- **Preventing complex, unmaintainable code** (complexity >15)
- **Enforcing coding standards** with zero tolerance

## 🧠 System Architecture

### Core Components

```
backend/
├── prompts/
│   ├── code-validator.txt           # Main AuditBot prompt
│   ├── code-validator-examples.md   # Test cases and examples
│   └── auditbot-README.md          # This documentation
├── utils/
│   └── auditbot-service.js         # Service integration layer
├── routes/
│   └── auditbot-api.js             # Express.js API routes
└── scripts/
    └── test-auditbot.js            # Validation test suite
```

### Audit Process Flow

```
Code Submission → Input Validation → LLM Processing → Response Parsing → Business Rules → Final Verdict
```

## 🔍 Audit Criteria

### 1. Raw Code Review

- ✅ Syntax validation and error detection
- ✅ Code formatting and indentation
- ✅ Comment quality and documentation
- ✅ Variable naming conventions
- ✅ Code structure and organization

### 2. Plagiarism Detection

- ✅ Vector database comparison (simulated)
- ✅ Similarity scoring (0-100%)
- ✅ **Auto-fail threshold: >30% similarity**
- ✅ Copy-paste pattern detection
- ✅ Tutorial/Stack Overflow identification

### 3. Security Linting

- ✅ Hardcoded API keys and credentials
- ✅ SQL injection vulnerabilities
- ✅ XSS attack vectors
- ✅ Unsafe `eval()` and dynamic imports
- ✅ ReDoS (Regular Expression Denial of Service)
- ✅ Input validation gaps

### 4. Logic Audit

- ✅ Dead code and unreachable conditions
- ✅ Redundant logic and duplicate code
- ✅ Async/await misuse and race conditions
- ✅ Memory leaks (event listeners)
- ✅ Infinite loops and recursion risks
- ✅ Unused variables and imports

### 5. Complexity Analysis

- ✅ Cognitive complexity calculation
- ✅ **Auto-fail threshold: >15 complexity**
- ✅ Nested condition detection (>4 levels)
- ✅ Function length analysis (>50 lines)
- ✅ Class method count (>10 methods)

## 📊 Scoring System

### Verdict Rules

- **FAIL**: Plagiarism >30%, security issues, complexity >15, critical logic errors
- **PASS**: All checks pass, clean code, complexity ≤15, plagiarism <30%

### Score Ranges

- **0-40**: Failed submissions (immediate rejection)
- **60-79**: Passing with minor issues
- **80-100**: High-quality code following best practices

### Plagiarism Levels

- **0-30%**: ✅ Acceptable (common patterns/libraries)
- **31-50%**: ⚠️ Suspicious (requires monitoring)
- **51-79%**: 🔶 High concern (manual review needed)
- **80-100%**: ❌ Plagiarism (automatic failure)

## 🚀 API Usage

### Single Code Audit

```javascript
POST /api/audit/code

{
  "code": "function fizzbuzz(n) { ... }",
  "userId": "user123",
  "taskId": "task456",
  "language": "javascript"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "verdict": "pass",
    "score": 85,
    "plagiarismScore": 15,
    "cognitiveComplexity": 6,
    "reasons": [],
    "flags": [],
    "criticalIssues": [],
    "suggestions": ["Consider adding JSDoc comments"],
    "metadata": {
      "auditId": "audit-1234567890",
      "processingTime": 850,
      "cached": false,
      "auditedAt": "2024-01-30T10:30:00Z"
    }
  }
}
```

### Batch Processing

```javascript
POST /api/audit/batch

{
  "submissions": [
    {
      "code": "function test1() { ... }",
      "userId": "user123",
      "taskId": "task1"
    },
    {
      "code": "function test2() { ... }",
      "userId": "user123",
      "taskId": "task2"
    }
  ]
}
```

### Health Check

```javascript
GET /api/audit/health

{
  "status": "healthy",
  "service": "auditbot",
  "responseTime": "750ms",
  "cacheSize": 1250,
  "timestamp": "2024-01-30T10:30:00Z"
}
```

### Statistics

```javascript
GET /api/audit/stats

{
  "success": true,
  "data": {
    "totalAudits": 5420,
    "passRate": 78,
    "averageScore": 72,
    "averagePlagiarism": 18,
    "averageComplexity": 8.5,
    "commonFlags": [
      { "flag": "style", "count": 245 },
      { "flag": "logic", "count": 189 },
      { "flag": "security", "count": 67 }
    ],
    "cacheSize": 1250
  }
}
```

## 🧪 Test Cases

### Security Vulnerability Detection

```javascript
// Input: Code with hardcoded credentials
const API_KEY = 'sk_test_51H8K9LGHf9vYZp0123456789';
app.get('/users/:id', (req, res) => {
  const query = `SELECT * FROM users WHERE id = ${req.params.id}`;
  db.query(query, (err, result) => res.json(result));
});

// Expected: FAIL
// Reasons: ["Hardcoded API key found", "SQL injection vulnerability"]
// Flags: ["security"]
// Score: 15/100
```

### Plagiarism Detection

```javascript
// Input: Common tutorial navbar code
import React from 'react';
const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <a href="/">LOGO</a>
        </div>
      </div>
    </nav>
  );
};

// Expected: FAIL
// Reasons: ["Plagiarism score 90% - exact match with tutorial"]
// Flags: ["plagiarism"]
// Score: 0/100
```

### High Complexity Code

```javascript
// Input: Overly nested function
function processData(data, options, callbacks, validators) {
  if (data && data.length > 0) {
    if (options && options.validate) {
      if (validators && validators.length > 0) {
        for (let i = 0; i < data.length; i++) {
          if (data[i] && data[i].id) {
            for (let j = 0; j < validators.length; j++) {
              // ... more nesting ...
            }
          }
        }
      }
    }
  }
}

// Expected: FAIL
// Reasons: ["Cognitive complexity 18 exceeds limit of 15"]
// Flags: ["complexity"]
// Score: 20/100
```

### Clean, Passing Code

```javascript
// Input: Well-structured FizzBuzz
function fizzBuzz(max) {
  if (typeof max !== 'number' || max < 1) {
    throw new Error('Max must be a positive number');
  }

  const results = [];
  for (let i = 1; i <= max; i++) {
    if (i % 15 === 0) results.push('FizzBuzz');
    else if (i % 3 === 0) results.push('Fizz');
    else if (i % 5 === 0) results.push('Buzz');
    else results.push(i.toString());
  }
  return results;
}

// Expected: PASS
// Score: 85/100
// Suggestions: ["Consider using constants for divisors"]
```

## 📋 Integration Guide

### Backend Integration

```javascript
const { AuditBotService, MockLLMService } = require('./utils/auditbot-service');

// Initialize service
const llmService = new OpenAIService(); // or your LLM provider
const auditBot = new AuditBotService(llmService, {
  plagiarismThreshold: 30,
  complexityLimit: 15,
  enableCaching: true,
});

// Audit single submission
const result = await auditBot.auditCode(userCode, {
  userId: user.id,
  taskId: task.id,
});

// Process verdict
if (result.finalVerdict === 'fail') {
  return res.status(422).json({
    error: 'Code quality check failed',
    details: result.reasons,
    suggestions: result.suggestions,
  });
}
```

### Frontend Integration

```typescript
// React component for code submission
const CodeSubmissionForm = () => {
  const [code, setCode] = useState('');
  const [auditResult, setAuditResult] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const handleSubmit = async () => {
    setIsAuditing(true);

    try {
      const response = await fetch('/api/audit/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          userId: user.id,
          taskId: task.id
        })
      });

      const result = await response.json();
      setAuditResult(result.data);

    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste your code here..."
      />

      <button onClick={handleSubmit} disabled={isAuditing}>
        {isAuditing ? 'Auditing...' : 'Submit Code'}
      </button>

      {auditResult && (
        <AuditResultDisplay result={auditResult} />
      )}
    </div>
  );
};
```

## ⚙️ Configuration

### Service Configuration

```javascript
const config = {
  maxCodeLength: 50000, // 50KB max file size
  timeoutMs: 30000, // 30 second timeout
  retryAttempts: 2, // Retry failed requests
  plagiarismThreshold: 30, // Fail if >30% similar
  complexityLimit: 15, // Fail if complexity >15
  minPassScore: 60, // Minimum score to pass
  enableCaching: true, // Cache results by hash
  logAudits: true, // Log all audits
};
```

### Rate Limiting

```javascript
// Standard audits: 30 per 15 minutes
// Batch audits: 3 per hour
// Health checks: Unlimited
```

### Environment Variables

```env
# LLM Service Configuration
LLM_API_KEY=your_api_key_here
LLM_MODEL=gpt-4
LLM_MAX_TOKENS=500

# AuditBot Configuration
AUDITBOT_PLAGIARISM_THRESHOLD=30
AUDITBOT_COMPLEXITY_LIMIT=15
AUDITBOT_CACHE_ENABLED=true
AUDITBOT_LOG_LEVEL=info
```

## 🔒 Security Features

### Input Validation

- Code length limits (50KB max)
- Input sanitization
- Type checking for all parameters
- SQL injection prevention in logging

### Rate Limiting

- IP-based request limiting
- Progressive backoff for repeat offenders
- Batch operation restrictions
- Health check exemptions

### Output Sanitization

- JSON schema validation
- Error message sanitization
- No code echoing in responses
- Secure logging practices

## 📈 Performance Optimization

### Caching Strategy

- **Hash-based caching**: Identical code returns cached results
- **Memory cache**: In-memory storage for fast retrieval
- **Cache invalidation**: Manual admin cache clearing
- **Hit rate monitoring**: Track cache effectiveness

### Batch Processing

- **Concurrent processing**: 3 submissions simultaneously
- **Fail-fast option**: Stop on first critical error
- **Progress tracking**: Monitor batch completion
- **Error isolation**: Failed audits don't affect others

### Response Time Targets

- **Single audit**: <2 seconds average
- **Batch processing**: <5 seconds per item
- **Health checks**: <500ms
- **Cache hits**: <100ms

## 🚨 Error Handling

### Common Error Codes

- `MISSING_CODE`: No code provided
- `INVALID_CODE_TYPE`: Code is not a string
- `CODE_TOO_LARGE`: Exceeds size limit
- `VALIDATION_ERROR`: Input validation failed
- `AUDIT_TIMEOUT`: Processing timeout
- `AUDIT_ERROR`: General audit failure
- `SYSTEM_ERROR`: Internal system error

### Error Response Format

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "requestId": "unique-request-identifier",
  "timestamp": "2024-01-30T10:30:00Z"
}
```

## 📊 Monitoring & Analytics

### Key Metrics

- **Audit volume**: Total audits per day/hour
- **Pass/fail rates**: Success percentages
- **Average scores**: Code quality trends
- **Processing times**: Performance monitoring
- **Error rates**: System reliability
- **Cache hit rates**: Efficiency metrics

### Alerting Thresholds

- **Error rate >5%**: System health alert
- **Response time >5s**: Performance alert
- **Pass rate <50%**: Quality concern alert
- **Cache hit rate <30%**: Efficiency alert

## 🔄 Maintenance

### Regular Tasks

- **Cache cleanup**: Weekly cache clearing
- **Log rotation**: Daily log archival
- **Performance review**: Weekly metrics analysis
- **Threshold tuning**: Monthly adjustments

### Update Procedures

- **Prompt updates**: Version-controlled prompt changes
- **Threshold adjustments**: Data-driven parameter tuning
- **Model upgrades**: LLM service improvements
- **Feature additions**: New audit capabilities

## 📚 Troubleshooting

### Common Issues

**High false positive rate:**

- Adjust plagiarism threshold
- Review prompt examples
- Update vector database
- Improve training data

**Slow response times:**

- Check LLM service status
- Monitor cache hit rates
- Review batch sizes
- Optimize prompt length

**Security vulnerabilities missed:**

- Update security patterns
- Enhance prompt examples
- Add new vulnerability types
- Improve detection rules

### Debug Mode

```javascript
// Enable detailed logging
process.env.AUDITBOT_DEBUG = 'true';

// Check service health
const health = await auditBot.healthCheck();
console.log('Service status:', health);

// Review recent audits
const stats = auditBot.getStats();
console.log('Audit statistics:', stats);
```

---

**AuditBot v1.0** - Maintaining code quality with zero tolerance for mediocrity! 🤖🔍
