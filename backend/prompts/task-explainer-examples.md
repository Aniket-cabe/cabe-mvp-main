# Task Explainer Examples

This document shows how the CaBOT Task Explainer prompt works with various task types.

## Example 1: Design Task

**Input:**

```json
{
  "title": "Logo Sketch for Café",
  "context": "Client wants a minimalist coffee-themed logo for branding. Prior logos attached."
}
```

**CaBOT Response:**

```
**What You'll Do:**
First, research the café's vibe and check out those reference logos. Then sketch 3-5 rough concepts focusing on coffee elements like beans, cups, or steam. Finally, refine your best idea into a clean, simple design that works at any size.

**Skills You'll Need:**
• Design fundamentals (composition, balance)
• Sketching and ideation
• Brand understanding
• Minimalist design principles

**Pro Tip:**
Great logos work as tiny app icons AND giant billboards - keep it simple, memorable, and meaningful! ☕
```

## Example 2: Web Development Task

**Input:**

```json
{
  "title": "Build Contact Form with Validation",
  "context": "React app needs a contact form with email validation, required fields, and success/error states."
}
```

**CaBOT Response:**

```
**What You'll Do:**
Create a React form component with input fields for name, email, and message. Add validation logic to check required fields and email format. Then build success/error feedback to show users what happened after they submit.

**Skills You'll Need:**
• React component building
• Form validation logic
• State management
• HTML form structure

**Pro Tip:**
Test your form by intentionally breaking it - try submitting empty fields and fake emails to make sure your validation catches everything! 🛡️
```

## Example 3: Writing Task

**Input:**

```json
{
  "title": "Blog Post: AI in Education",
  "context": "1500-word article for teachers about practical AI tools. Target audience: K-12 educators with minimal tech experience."
}
```

**CaBOT Response:**

```
**What You'll Do:**
Research 5-7 practical AI tools teachers actually use (like Grammarly, ChatGPT for lesson plans). Structure your post with clear examples and simple explanations. Write in plain language, avoiding tech jargon, and include specific classroom scenarios.

**Skills You'll Need:**
• Research and fact-checking
• Clear, accessible writing
• Audience awareness
• Educational content strategy

**Pro Tip:**
Think like your reader - if you wouldn't understand it as a busy teacher, rewrite it simpler! 📚
```

## Example 4: Data Analysis Task

**Input:**

```json
{
  "title": "Sales Dashboard Analysis",
  "context": "Analyze Q3 sales data and create visual dashboard showing trends, top products, regional performance."
}
```

**CaBOT Response:**

```
**What You'll Do:**
Clean and organize your Q3 sales data first. Then create charts showing monthly trends, identify top-performing products, and map regional sales patterns. Build a dashboard that tells the story at a glance.

**Skills You'll Need:**
• Data cleaning and organization
• Chart creation and visualization
• Trend analysis
• Dashboard design principles

**Pro Tip:**
Start with the big picture, then zoom into details - your dashboard should answer "How are we doing?" in 5 seconds! 📊
```

## Example 5: Video Editing Task

**Input:**

```json
{
  "title": "Product Demo Video",
  "context": "2-minute video showcasing new app features. Raw footage provided. Need titles, transitions, and background music."
}
```

**CaBOT Response:**

```
**What You'll Do:**
Review all raw footage and pick the best clips showing each feature. Cut them into a logical flow, add clear title cards for each feature, smooth transitions between sections, and layer in background music that matches the energy.

**Skills You'll Need:**
• Video editing software
• Pacing and rhythm
• Visual storytelling
• Audio mixing basics

**Pro Tip:**
Watch your video without sound first - if the story is clear visually, you're halfway there! 🎬
```

## Example 6: Social Media Task

**Input:**

```json
{
  "title": "Instagram Content Calendar",
  "context": "Plan 30 days of posts for fitness brand. Mix of workout tips, motivation, and product features. Brand guidelines attached."
}
```

**CaBOT Response:**

```
**What You'll Do:**
Map out 30 posts mixing workout tips (40%), motivation quotes (30%), and product features (30%). Create a content calendar with posting times, captions, and hashtag strategy. Follow brand colors and voice guidelines throughout.

**Skills You'll Need:**
• Content planning and strategy
• Social media best practices
• Brand voice consistency
• Visual content curation

**Pro Tip:**
Batch create similar content types together - write all motivational posts in one session for better flow and consistency! 💪
```

## Key Success Patterns

1. **Action-Oriented Steps**: Each explanation starts with concrete actions
2. **Skill Clarity**: Skills are specific and learnable
3. **Encouraging Tone**: Builds confidence rather than intimidation
4. **Practical Tips**: Pro tips offer real, actionable insights
5. **Word Economy**: Every word serves a purpose, staying under 120 words
6. **Visual Elements**: Emojis add personality without being excessive

## Tone Analysis

- **Reading Level**: 8th grade (simple sentence structure, common words)
- **Voice**: Friendly mentor, not formal instructor
- **Humor**: Light and appropriate, never at expense of clarity
- **Confidence**: Assumes the user can succeed with guidance
- **Specificity**: Concrete steps over vague suggestions
