# CaBOT Task Explainer Prompt System

A specialized LLM prompt system that transforms complex tasks into clear, actionable explanations for users on the CaBE platform.

## 🎯 Purpose

The Task Explainer helps users understand what they need to do by breaking down complex tasks into:

- **Clear action steps** (what to do)
- **Required skills** (what to learn)
- **Helpful insights** (pro tips)

All delivered in under 120 words with a friendly, encouraging tone.

## 📁 Files

- `task-explainer.txt` - Main system prompt for LLM
- `task-explainer-examples.md` - Usage examples and patterns
- `README.md` - This documentation

## 🔤 Input Format

The system expects JSON input with task details:

```json
{
  "title": "Task name or title",
  "context": "Additional context, requirements, or background information"
}
```

## 📤 Output Format

CaBOT responds with structured explanations:

```
**What You'll Do:**
[2-3 clear, actionable steps in 40-60 words]

**Skills You'll Need:**
[2-4 relevant skills in 20-30 words]

**Pro Tip:**
[One helpful insight in 15-25 words with appropriate emoji]
```

## 🎨 Design Principles

### Tone & Voice

- **Friendly mentor** not formal instructor
- **8th grade reading level** with simple, clear language
- **Encouraging and positive** - builds confidence
- **Light humor** where appropriate, never forced

### Content Structure

- **Action-oriented steps** - concrete, doable tasks
- **Learnable skills** - specific abilities users can develop
- **Practical insights** - real tips that add value
- **Word efficiency** - every word serves a purpose

### Technical Requirements

- **120 word maximum** total response length
- **Consistent formatting** with markdown structure
- **Appropriate emojis** (1 per response maximum)
- **No jargon** without explanation

## 🚀 Integration Guide

### API Integration

```javascript
// Example API call to LLM service
const explainTask = async (taskData) => {
  const prompt = await fs.readFile(
    'backend/prompts/task-explainer.txt',
    'utf8'
  );

  const response = await llmService.complete({
    system: prompt,
    user: JSON.stringify(taskData),
    maxTokens: 150,
    temperature: 0.7,
  });

  return response.content;
};
```

### Frontend Usage

```typescript
// React component example
const TaskExplanation = ({ task }) => {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const getExplanation = async () => {
    setLoading(true);
    try {
      const result = await explainTask({
        title: task.title,
        context: task.description
      });
      setExplanation(result);
    } catch (error) {
      console.error('Failed to get task explanation:', error);
    }
    setLoading(false);
  };

  return (
    <div className="task-explanation">
      <button onClick={getExplanation} disabled={loading}>
        {loading ? 'Getting explanation...' : 'Explain this task'}
      </button>
      {explanation && (
        <div className="explanation-content">
          {explanation}
        </div>
      )}
    </div>
  );
};
```

## 📊 Quality Metrics

### Success Criteria

- ✅ **Clarity**: Users understand what to do
- ✅ **Completeness**: All essential information included
- ✅ **Confidence**: Users feel capable of starting
- ✅ **Conciseness**: Under 120 words consistently
- ✅ **Consistency**: Similar tasks get similar structure

### Monitoring

Track these metrics to ensure prompt effectiveness:

- Word count distribution (target: 80-120 words)
- User engagement with explained tasks
- Task completion rates after explanation
- User feedback on explanation quality

## 🧪 Testing

### Manual Testing

Use the examples in `task-explainer-examples.md` to verify:

1. Prompt generates appropriate responses
2. Word counts stay within limits
3. Tone remains consistent across task types
4. Skills and steps are relevant and actionable

### A/B Testing

Compare task completion rates:

- Tasks with CaBOT explanations vs without
- Different prompt variations
- Various word count limits

## 🔧 Customization

### Adjusting Tone

Modify these sections in `task-explainer.txt`:

- **TONE GUIDELINES** - Adjust personality and style
- **EXAMPLE RESPONSE** - Update structure and voice
- **WORD BUDGET** - Change section length allocations

### Adding Task Types

Create specialized versions for specific domains:

- `task-explainer-design.txt` - Design-focused prompts
- `task-explainer-coding.txt` - Development-specific language
- `task-explainer-writing.txt` - Content creation emphasis

### Localization

Adapt for different audiences:

- Adjust reading level for age groups
- Modify cultural references and humor
- Change example types for different contexts

## 🎓 Best Practices

### Prompt Engineering

1. **Keep examples diverse** - Cover various task types
2. **Maintain consistency** - Use same structure across examples
3. **Test edge cases** - Very short/long task descriptions
4. **Monitor outputs** - Regularly check quality and adjust

### Content Guidelines

1. **Action verbs** - Start steps with doing words
2. **Concrete skills** - Avoid vague abilities
3. **Relevant tips** - Ensure pro tips add real value
4. **Positive framing** - Present challenges as opportunities

### Integration Tips

1. **Cache responses** - Avoid re-explaining identical tasks
2. **Fallback content** - Have backup explanations if LLM fails
3. **User feedback** - Collect ratings on explanation quality
4. **Iterative improvement** - Update prompt based on usage data

## 🐛 Troubleshooting

### Common Issues

**Responses too long:**

- Reduce word budget in prompt
- Add stricter length enforcement
- Simplify example responses

**Tone inconsistency:**

- Strengthen tone guidelines
- Add more voice examples
- Test with diverse task types

**Missing information:**

- Ensure input context is complete
- Add prompts for specific skill types
- Include more comprehensive examples

**Technical jargon:**

- Emphasize reading level requirement
- Add jargon detection examples
- Test with non-technical reviewers

### Performance Optimization

- **Token efficiency** - Optimize prompt length
- **Response caching** - Store common explanations
- **Batch processing** - Handle multiple tasks together
- **Fallback strategies** - Graceful degradation if LLM unavailable

## 📈 Future Enhancements

### Planned Features

- **Difficulty adaptation** - Adjust explanation depth by user level
- **Skill integration** - Connect to user's existing skills
- **Progress tracking** - Link explanations to completion rates
- **Multi-language** - Support for different languages

### Advanced Capabilities

- **Visual aids** - Generate accompanying diagrams
- **Video integration** - Create explanation videos
- **Interactive elements** - Step-by-step guided walkthroughs
- **Personalization** - Adapt to individual learning styles

---

**CaBOT Task Explainer v1.0** - Making complex tasks feel achievable, one explanation at a time! 🤖✨
