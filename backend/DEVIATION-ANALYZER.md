# CaBE Arena Deviation Analyzer

## Overview

The **Deviation Analyzer** is an advanced AI-powered system designed to detect, classify, and analyze score discrepancies between user submissions and AI audit scores in the CaBE Arena coding submission review system. This system provides intelligent reasoning and actionable insights to improve scoring accuracy and fairness.

## 🎯 Objectives

- **Detect Abnormal Discrepancies**: Identify when user-submitted scores significantly differ from AI audit scores
- **Classify Deviation Severity**: Categorize discrepancies as minor, major, or critical based on skill area and difficulty
- **Provide Intelligent Reasoning**: Generate AI-powered explanations for why deviations occurred
- **Recommend Actions**: Suggest appropriate responses (allow, flag for review, escalate, override)
- **Identify Risk Factors**: Highlight potential issues that may contribute to scoring discrepancies
- **Enable Pattern Detection**: Analyze multiple submissions to identify systemic scoring issues

## 🏗️ Architecture

### Core Components

1. **Deviation Classification Engine**
   - Skill area-specific thresholds
   - Difficulty-based variance allowances
   - Multi-level classification (none/minor/major/critical)

2. **AI Reasoning Generator**
   - Context-aware prompt engineering
   - Comprehensive analysis of contributing factors
   - Actionable insights and recommendations

3. **Risk Factor Analyzer**
   - Pattern recognition for score inflation/deflation
   - Code quality indicators
   - Submission context analysis

4. **Action Recommendation System**
   - Contextual decision making
   - Escalation criteria
   - Review prioritization

### Key Interfaces

```typescript
interface DeviationAnalysisInput {
  taskTitle: string;
  taskDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  skillArea:
    | 'frontend'
    | 'backend'
    | 'content'
    | 'data'
    | 'ai'
    | 'design'
    | 'mobile'
    | 'devops';
  userSubmittedScore: number;
  aiAuditScore: number;
  userCode?: string;
  userProof?: string;
  taskDescription?: string;
  submissionContext?: {
    timeSpent?: number;
    codeLength?: number;
    complexity?: 'low' | 'medium' | 'high';
  };
}

interface DeviationAnalysisResult {
  deviationType: 'none' | 'minor' | 'major' | 'critical';
  deviationMagnitude: number;
  confidence: 'low' | 'medium' | 'high';
  reasoning: string;
  suggestedAction: 'allow' | 'flag_for_review' | 'escalate' | 'override';
  riskFactors: string[];
  skillAreaContext: string;
  complexityContext: string;
  metadata: {
    analysisTimestamp: string;
    modelUsed: string;
    processingTime: number;
  };
}
```

## 📊 Deviation Classification

### Thresholds by Skill Area and Difficulty

The system uses different thresholds based on the skill area and task difficulty to account for the inherent subjectivity and complexity variations:

#### Frontend Development

- **Easy**: ±3 points (none), ±8 points (minor), ±15 points (major)
- **Medium**: ±5 points (none), ±12 points (minor), ±20 points (major)
- **Hard**: ±8 points (none), ±15 points (minor), ±25 points (major)
- **Expert**: ±10 points (none), ±18 points (minor), ±30 points (major)

#### Backend Development

- **Easy**: ±4 points (none), ±10 points (minor), ±18 points (major)
- **Medium**: ±6 points (none), ±14 points (minor), ±22 points (major)
- **Hard**: ±10 points (none), ±18 points (minor), ±28 points (major)
- **Expert**: ±12 points (none), ±20 points (minor), ±32 points (major)

#### Content Creation

- **Easy**: ±5 points (none), ±12 points (minor), ±20 points (major)
- **Medium**: ±7 points (none), ±15 points (minor), ±25 points (major)
- **Hard**: ±10 points (none), ±18 points (minor), ±28 points (major)
- **Expert**: ±12 points (none), ±20 points (minor), ±30 points (major)

#### Data Science

- **Easy**: ±4 points (none), ±10 points (minor), ±18 points (major)
- **Medium**: ±6 points (none), ±14 points (minor), ±22 points (major)
- **Hard**: ±8 points (none), ±16 points (minor), ±26 points (major)
- **Expert**: ±10 points (none), ±18 points (minor), ±28 points (major)

## 🤖 AI-Powered Reasoning

### Prompt Engineering

The system generates comprehensive prompts that include:

1. **Task Context**: Title, skill area, difficulty level, scores
2. **Submission Details**: Code, proof, description, context
3. **Analysis Requirements**: Specific factors to consider
4. **Output Format**: Structured reasoning requirements

### Example Prompt Structure

```
You are an expert code review analyst specializing in detecting scoring anomalies and deviations in programming task submissions.

TASK CONTEXT:
- Task Title: "Build a responsive navigation bar"
- Skill Area: FRONTEND
- Difficulty Level: EASY
- User Submitted Score: 85/100
- AI Audit Score: 78/100
- Score Difference: 7 points (User score is higher than AI score)
- Deviation Classification: MINOR

USER CODE:
[Code snippet with context]

ANALYSIS REQUIREMENTS:
1. Evaluate the reasonableness of the score discrepancy
2. Consider the skill area context and difficulty level
3. Identify potential factors contributing to the deviation
4. Assess whether this represents a scoring error, bias, or legitimate difference in evaluation criteria

POTENTIAL FACTORS TO CONSIDER:
- Code quality vs. functionality assessment differences
- Complexity evaluation variations
- Skill area-specific evaluation criteria
- Task difficulty expectations
- Code length vs. quality trade-offs
- Documentation and explanation quality
- Best practices adherence

Please provide a detailed analysis explaining:
1. Why this deviation occurred
2. Whether it represents a legitimate difference in evaluation or a potential error
3. What factors most likely contributed to the discrepancy
4. Recommendations for addressing similar cases in the future
```

## 🎯 Action Recommendations

### Decision Matrix

| Deviation Type | Expert Tasks    | AI/ML Tasks     | Other Tasks     | Recommended Action |
| -------------- | --------------- | --------------- | --------------- | ------------------ |
| **None**       | -               | -               | -               | Allow              |
| **Minor**      | Flag for Review | Flag for Review | Allow           | Context-dependent  |
| **Major**      | Flag for Review | Flag for Review | Flag for Review | Flag for Review    |
| **Critical**   | Escalate        | Escalate        | Escalate        | Escalate           |

### Action Types

1. **Allow**: No action required, scores are within acceptable variance
2. **Flag for Review**: Submission requires human review for final decision
3. **Escalate**: Critical issue requiring immediate attention and potential system review
4. **Override**: Manual override of automated decision (rare, requires admin approval)

## 🔍 Risk Factor Analysis

### Automatic Risk Detection

The system automatically identifies risk factors including:

- **High Score Discrepancy**: Deviations > 20 points
- **Skill Area Complexity**: AI/ML evaluation complexity, subjective content evaluation
- **Task Difficulty**: Expert-level task complexity
- **Code Quality Indicators**: Minimal code submissions, very short completion times
- **Score Patterns**: Potential inflation (user > 90, AI < 60) or deflation (user < 30, AI > 70)

### Risk Factor Examples

```typescript
// Score inflation pattern
if (userSubmittedScore > 90 && aiAuditScore < 60) {
  riskFactors.push('Potential score inflation');
}

// Minimal submission
if (submissionContext?.codeLength && submissionContext.codeLength < 100) {
  riskFactors.push('Minimal code submission');
}

// Expert task with deviation
if (taskDifficulty === 'expert' && deviationMagnitude > 10) {
  riskFactors.push('Expert-level task complexity');
}
```

## 📈 Batch Analysis

### Pattern Detection

The system can analyze multiple submissions to identify:

- **Skill Area Patterns**: Average deviations by skill area
- **Difficulty Patterns**: Deviation trends by task difficulty
- **Critical Issues**: Systemic problems requiring attention
- **Scoring Bias**: Consistent over/under-scoring patterns

### Batch Analysis Example

```typescript
const batchResult = await batchAnalyzeDeviations(submissions);

console.log('Deviation Type Distribution:');
// { none: 5, minor: 3, major: 2, critical: 1 }

console.log('Critical Issues:');
// ['1 critical deviations detected requiring immediate attention']

console.log('Suggested Actions:');
// { allow: 5, flag_for_review: 4, escalate: 1 }
```

## 🚀 Usage Examples

### Basic Usage

```typescript
import { analyzeDeviation } from '../src/utils/deviation-analyzer';

const input: DeviationAnalysisInput = {
  taskTitle: 'Build a React component',
  taskDifficulty: 'medium',
  skillArea: 'frontend',
  userSubmittedScore: 85,
  aiAuditScore: 72,
  userCode: 'const Component = () => <div>Hello World</div>;',
  userProof: 'Created a simple React component',
  submissionContext: {
    timeSpent: 30,
    codeLength: 50,
    complexity: 'low',
  },
};

const result = await analyzeDeviation(input);
console.log(`Deviation Type: ${result.deviationType}`);
console.log(`Reasoning: ${result.reasoning}`);
console.log(`Suggested Action: ${result.suggestedAction}`);
```

### Integration with Audit System

```typescript
import { analyzeDeviation } from '../src/utils/deviation-analyzer';
import { runScoringAudit } from '../src/utils/scoring-audit';

// Run standard audit
const auditResult = await runScoringAudit();

// Analyze deviations for flagged submissions
for (const result of auditResult.results) {
  if (result.status !== '✅ PASS') {
    const deviationInput: DeviationAnalysisInput = {
      taskTitle: result.submissionId,
      taskDifficulty: 'medium', // Would come from task metadata
      skillArea: result.skill,
      userSubmittedScore: result.expectedScore,
      aiAuditScore: result.actualScore,
    };

    const deviationResult = await analyzeDeviation(deviationInput);

    if (deviationResult.suggestedAction === 'escalate') {
      // Send to admin review queue
      await escalateForReview(result.submissionId, deviationResult);
    }
  }
}
```

## 🧪 Testing

### Test Scenarios

The system includes comprehensive test scenarios covering:

1. **Minor Deviations**: Small score differences within acceptable ranges
2. **Major Deviations**: Significant disagreements requiring review
3. **Critical Deviations**: Extreme discrepancies requiring escalation
4. **Score Inflation**: User scores much higher than AI scores
5. **Score Deflation**: User scores much lower than AI scores
6. **No Deviation**: Scores within acceptable variance

### Running Tests

```bash
# Run the complete test suite
npm run test:deviation-analyzer

# Run specific test scenarios
npm run test:deviation-analyzer -- --grep "Critical Deviation"
```

## 🔧 Configuration

### Environment Variables

```bash
# Required for AI reasoning generation
OPENROUTER_API_KEY=your_openrouter_api_key

# Optional: Customize AI model
DEVIATION_ANALYZER_MODEL=mistralai/mistral-7b-instruct
```

### Threshold Customization

Thresholds can be customized by modifying the `DEVIATION_THRESHOLDS` constant in `deviation-analyzer.ts`:

```typescript
const DEVIATION_THRESHOLDS: Record<
  string,
  Record<string, DeviationClassification[]>
> = {
  frontend: {
    easy: [
      {
        type: 'none',
        threshold: 3,
        description: 'Acceptable variance for simple frontend tasks',
        actionRequired: 'No action needed',
      },
      // ... customize thresholds as needed
    ],
  },
  // ... other skill areas
};
```

## 📊 Monitoring and Analytics

### Key Metrics

- **Deviation Distribution**: Percentage of submissions by deviation type
- **Average Deviation**: Mean deviation magnitude across submissions
- **Critical Issue Rate**: Percentage of submissions requiring escalation
- **Processing Time**: Average time to analyze deviations
- **Confidence Levels**: Distribution of analysis confidence

### Dashboard Integration

The system integrates with the existing audit dashboard to provide:

- Real-time deviation alerts
- Trend analysis over time
- Skill area performance metrics
- Action recommendation summaries

## 🔮 Future Enhancements

### Planned Features

1. **Machine Learning Integration**: Train models on historical deviation data
2. **Advanced Pattern Recognition**: Detect sophisticated scoring manipulation
3. **Multi-Model Consensus**: Use multiple AI models for higher accuracy
4. **Real-time Learning**: Continuously improve thresholds based on outcomes
5. **Custom Skill Areas**: Support for additional skill areas and domains

### Research Areas

- **Bias Detection**: Identify and mitigate scoring biases
- **Contextual Analysis**: Better understanding of submission context
- **Predictive Analytics**: Predict potential deviations before they occur
- **Automated Threshold Tuning**: Dynamic threshold adjustment based on performance

## 🤝 Contributing

### Development Guidelines

1. **Test Coverage**: All new features must include comprehensive tests
2. **Documentation**: Update documentation for any API changes
3. **Performance**: Monitor processing time and optimize as needed
4. **Security**: Ensure AI prompts don't expose sensitive information

### Code Review Process

1. **Unit Tests**: All functions must have unit tests
2. **Integration Tests**: Test with real AI API calls
3. **Performance Tests**: Ensure analysis completes within acceptable time
4. **Security Review**: Review AI prompts for potential issues

## 📚 References

- [AI Scoring Documentation](./AI-SCORING.md)
- [Audit System Documentation](./AI.md)
- [Test Suite Documentation](./scripts/test-deviation-analyzer.ts)
- [API Integration Guide](./ARENA-API.md)

---

**Note**: This system is designed to enhance the fairness and accuracy of the CaBE Arena scoring system. It should be used as part of a comprehensive review process that includes human oversight and continuous improvement.
