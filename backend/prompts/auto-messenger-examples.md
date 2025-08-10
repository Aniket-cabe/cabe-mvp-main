# CaBOT Messenger Examples

This document shows how CaBOT Messenger generates platform messages across different tones and contexts.

## Tone Examples by Context

### 1. Authentication Messages

#### Login Success

**Input:**

```json
{ "context": "User successfully logged in", "tone": "friendly" }
```

**Output:** `Hey there! Welcome back to CaBE ✨`

**Input:**

```json
{ "context": "User successfully logged in", "tone": "serious" }
```

**Output:** `Login successful. Access granted.`

**Input:**

```json
{ "context": "User successfully logged in", "tone": "hype" }
```

**Output:** `YOOO YOU'RE BACK! Let's get this bread! 🔥💯`

#### Login Failed

**Input:**

```json
{ "context": "Invalid login credentials provided", "tone": "friendly" }
```

**Output:** `Hmm, those credentials didn't work. Want to try again? 😊`

**Input:**

```json
{ "context": "Invalid login credentials provided", "tone": "serious" }
```

**Output:** `Authentication failed. Please verify your credentials.`

**Input:**

```json
{ "context": "Invalid login credentials provided", "tone": "hype" }
```

**Output:** `Nah fam, those creds ain't it! Try again bestie 💀`

#### Email Verification

**Input:**

```json
{ "context": "Email verification link sent", "tone": "friendly" }
```

**Output:** `Check your inbox! We sent you a verification link 📧`

**Input:**

```json
{ "context": "Email verification link sent", "tone": "serious" }
```

**Output:** `Verification email sent. Check your inbox to continue.`

**Input:**

```json
{ "context": "Email verification link sent", "tone": "hype" }
```

**Output:** `EMAIL INCOMING! Check that inbox NOW! ⚡📬`

### 2. Submission Messages

#### Proof Approved

**Input:**

```json
{ "context": "User proof passed moderation review", "tone": "friendly" }
```

**Output:** `Great work! Your proof has been approved 👍`

**Input:**

```json
{ "context": "User proof passed moderation review", "tone": "serious" }
```

**Output:** `Proof approved. Points have been awarded.`

**Input:**

```json
{ "context": "User proof passed moderation review", "tone": "hype" }
```

**Output:** `PROOF APPROVED! You absolutely SLAYED that! 🔥💯✨`

#### Proof Rejected

**Input:**

```json
{ "context": "User proof failed moderation review", "tone": "friendly" }
```

**Output:** `Your proof needs some work. Check the feedback and try again!`

**Input:**

```json
{ "context": "User proof failed moderation review", "tone": "serious" }
```

**Output:** `Proof rejected. Review requirements and resubmit.`

**Input:**

```json
{ "context": "User proof failed moderation review", "tone": "hype" }
```

**Output:** `Proof got rejected bestie 💀 But don't give up! Try again!`

#### Submission Pending

**Input:**

```json
{ "context": "User submission is under review", "tone": "friendly" }
```

**Output:** `Your submission is being reviewed. We'll get back to you soon!`

**Input:**

```json
{ "context": "User submission is under review", "tone": "serious" }
```

**Output:** `Submission received. Review in progress.`

**Input:**

```json
{ "context": "User submission is under review", "tone": "hype" }
```

**Output:** `SUBMISSION LOCKED IN! Our team is checking it out! ⏳🔥`

### 3. Achievement Messages

#### New Badge Earned

**Input:**

```json
{ "context": "User earned their first coding badge", "tone": "friendly" }
```

**Output:** `Congrats! You just earned your first coding badge 🏆`

**Input:**

```json
{ "context": "User earned their first coding badge", "tone": "serious" }
```

**Output:** `Coding badge unlocked. Achievement recorded.`

**Input:**

```json
{ "context": "User earned their first coding badge", "tone": "hype" }
```

**Output:** `FIRST CODING BADGE UNLOCKED! You're absolutely CRUSHING IT! 🏆💯🔥`

#### Streak Milestone

**Input:**

```json
{ "context": "User reached 7-day submission streak", "tone": "friendly" }
```

**Output:** `Amazing! You've got a 7-day streak going 🔥`

**Input:**

```json
{ "context": "User reached 7-day submission streak", "tone": "serious" }
```

**Output:** `7-day streak achieved. Consistency bonus applied.`

**Input:**

```json
{ "context": "User reached 7-day submission streak", "tone": "hype" }
```

**Output:** `7 DAYS STRAIGHT! You're on FIRE bestie! Keep going! 🔥⚡💪`

#### Rank Promotion

**Input:**

```json
{ "context": "User promoted from Bronze to Silver rank", "tone": "friendly" }
```

**Output:** `Woohoo! You've been promoted to Silver rank ✨`

**Input:**

```json
{ "context": "User promoted from Bronze to Silver rank", "tone": "serious" }
```

**Output:** `Rank promotion: Bronze to Silver. New privileges unlocked.`

**Input:**

```json
{ "context": "User promoted from Bronze to Silver rank", "tone": "hype" }
```

**Output:** `SILVER RANK UNLOCKED! You're leveling UP! So proud! 🥈💯⚡`

### 4. System Update Messages

#### Maintenance Notice

**Input:**

```json
{ "context": "Platform maintenance scheduled in 1 hour", "tone": "friendly" }
```

**Output:** `Hey! We'll be doing some quick maintenance in an hour 🔧`

**Input:**

```json
{ "context": "Platform maintenance scheduled in 1 hour", "tone": "serious" }
```

**Output:** `Scheduled maintenance begins in 1 hour. Plan accordingly.`

**Input:**

```json
{ "context": "Platform maintenance scheduled in 1 hour", "tone": "hype" }
```

**Output:** `MAINTENANCE INCOMING in 1 hour! We're making things even MORE epic! 🔧⚡`

#### New Feature Launch

**Input:**

```json
{ "context": "New AI helper feature now available", "tone": "friendly" }
```

**Output:** `Check it out! Our new AI helper is here to assist you 🤖`

**Input:**

```json
{ "context": "New AI helper feature now available", "tone": "serious" }
```

**Output:** `New feature available: AI Helper. Access via main menu.`

**Input:**

```json
{ "context": "New AI helper feature now available", "tone": "hype" }
```

**Output:** `NEW AI HELPER JUST DROPPED! This is about to change EVERYTHING! 🤖🔥💯`

#### Service Restored

**Input:**

```json
{
  "context": "Platform services fully restored after outage",
  "tone": "friendly"
}
```

**Output:** `We're back! Thanks for your patience during the downtime 😊`

**Input:**

```json
{
  "context": "Platform services fully restored after outage",
  "tone": "serious"
}
```

**Output:** `All services restored. Normal operations resumed.`

**Input:**

```json
{ "context": "Platform services fully restored after outage", "tone": "hype" }
```

**Output:** `WE'RE BACK BABY! Let's pick up where we left off! 🔥⚡`

### 5. Moderation Messages

#### Warning Issued

**Input:**

```json
{
  "context": "User received warning for inappropriate content",
  "tone": "friendly"
}
```

**Output:** `Heads up! Please keep content appropriate for the community.`

**Input:**

```json
{
  "context": "User received warning for inappropriate content",
  "tone": "serious"
}
```

**Output:** `Warning issued. Content must comply with community guidelines.`

**Input:**

```json
{ "context": "User received warning for inappropriate content", "tone": "hype" }
```

**Output:** `Yo hold up! Keep it clean bestie - let's respect the vibes! ✋`

#### Account Suspended

**Input:**

```json
{ "context": "User account suspended for violations", "tone": "friendly" }
```

**Output:** `Your account has been temporarily suspended. Please review our guidelines.`

**Input:**

```json
{ "context": "User account suspended for violations", "tone": "serious" }
```

**Output:** `Account suspended due to policy violations. Contact support for details.`

**Input:**

```json
{ "context": "User account suspended for violations", "tone": "hype" }
```

**Output:** `Account suspended bestie 💀 Time to reflect and come back stronger!`

#### Appeal Approved

**Input:**

```json
{ "context": "User appeal for content removal approved", "tone": "friendly" }
```

**Output:** `Good news! Your appeal was approved and content restored 👍`

**Input:**

```json
{ "context": "User appeal for content removal approved", "tone": "serious" }
```

**Output:** `Appeal approved. Content has been restored.`

**Input:**

```json
{ "context": "User appeal for content removal approved", "tone": "hype" }
```

**Output:** `APPEAL APPROVED! Your content is BACK! Justice served! ⚖️💯`

### 6. Points and Rewards

#### Points Earned

**Input:**

```json
{ "context": "User earned 50 points for completing task", "tone": "friendly" }
```

**Output:** `Nice! You earned 50 points for that task 🎉`

**Input:**

```json
{ "context": "User earned 50 points for completing task", "tone": "serious" }
```

**Output:** `Task completed. 50 points awarded.`

**Input:**

```json
{ "context": "User earned 50 points for completing task", "tone": "hype" }
```

**Output:** `50 POINTS IN THE BAG! You're absolutely COOKING! 💰🔥`

#### Bonus Points

**Input:**

```json
{
  "context": "User received bonus points for quality submission",
  "tone": "friendly"
}
```

**Output:** `Bonus points! That submission was exceptional quality ✨`

**Input:**

```json
{
  "context": "User received bonus points for quality submission",
  "tone": "serious"
}
```

**Output:** `Quality bonus applied. Additional points awarded.`

**Input:**

```json
{
  "context": "User received bonus points for quality submission",
  "tone": "hype"
}
```

**Output:** `BONUS POINTS! That submission was CHEF'S KISS! 👨‍🍳💯⚡`

#### Points Deducted

**Input:**

```json
{ "context": "Points deducted for policy violation", "tone": "friendly" }
```

**Output:** `Some points were deducted due to a policy issue. Stay on track!`

**Input:**

```json
{ "context": "Points deducted for policy violation", "tone": "serious" }
```

**Output:** `Points deducted due to policy violation.`

**Input:**

```json
{ "context": "Points deducted for policy violation", "tone": "hype" }
```

**Output:** `Points got yeeted for policy stuff 💀 Learn and bounce back!`

### 7. Social Interactions

#### New Follower

**Input:**

```json
{ "context": "User gained a new follower", "tone": "friendly" }
```

**Output:** `Someone new started following you! 👥`

**Input:**

```json
{ "context": "User gained a new follower", "tone": "serious" }
```

**Output:** `New follower added to your network.`

**Input:**

```json
{ "context": "User gained a new follower", "tone": "hype" }
```

**Output:** `NEW FOLLOWER ALERT! Your influence is GROWING! 📈🔥`

#### Mention Received

**Input:**

```json
{ "context": "User was mentioned in a comment", "tone": "friendly" }
```

**Output:** `Someone mentioned you in a comment! Check it out 💬`

**Input:**

```json
{ "context": "User was mentioned in a comment", "tone": "serious" }
```

**Output:** `You have been mentioned in a comment.`

**Input:**

```json
{ "context": "User was mentioned in a comment", "tone": "hype" }
```

**Output:** `YOU GOT MENTIONED! Someone's talking about you! 💬⚡`

#### Project Shared

**Input:**

```json
{ "context": "User project was shared by someone", "tone": "friendly" }
```

**Output:** `Your project was shared! It's getting some love 💕`

**Input:**

```json
{ "context": "User project was shared by someone", "tone": "serious" }
```

**Output:** `Your project has been shared by another user.`

**Input:**

```json
{ "context": "User project was shared by someone", "tone": "hype" }
```

**Output:** `PROJECT WENT VIRAL! Someone shared your FIRE work! 🔥📢`

## Tone Consistency Patterns

### Friendly Tone Characteristics

- **Greeting words**: "Hey", "Hi", "Woohoo", "Nice", "Great"
- **Emojis**: Light usage (😊, 👍, ✨, 🎉, 💕)
- **Encouragement**: "Keep it up", "Try again", "You got this"
- **Casual language**: Contractions, conversational flow
- **Positive framing**: Even negative news sounds supportive

### Serious Tone Characteristics

- **Direct statements**: No fluff, straight to the point
- **Formal language**: Complete sentences, proper grammar
- **No emojis**: Clean, professional appearance
- **Action-focused**: Clear next steps or status updates
- **Factual**: Information without emotional coloring

### Hype Tone Characteristics

- **ALL CAPS**: For emphasis and excitement
- **Heavy emojis**: Multiple per message (🔥💯⚡💀)
- **Slang usage**: "bestie", "fam", "yo", "nah", "slay"
- **Energy words**: "EPIC", "FIRE", "CRUSHING", "COOK"
- **Exclamation points**: Multiple for extra emphasis
- **Gen-Z expressions**: "no cap", "it's giving", "chef's kiss"

## Message Length Guidelines

- **Minimum**: 8 words (ensures complete thought)
- **Maximum**: 40 words (keeps it micro-message size)
- **Sweet spot**: 15-25 words (clear but concise)
- **Emergency alerts**: Can be as short as 5 words
- **Complex updates**: Use maximum 40 words efficiently

## Context Pattern Recognition

### Success Contexts → Positive Messaging

- Approvals, completions, achievements, unlocks
- Use congratulatory language
- Friendly: celebratory, Serious: confirmatory, Hype: explosive

### Failure Contexts → Constructive Messaging

- Rejections, warnings, deductions, suspensions
- Focus on next steps and improvement
- Friendly: encouraging, Serious: informative, Hype: resilient

### Neutral Contexts → Informational Messaging

- Status updates, notifications, reminders
- Clear communication of facts
- Friendly: helpful, Serious: factual, Hype: engaging

### Urgent Contexts → Action-Oriented Messaging

- Maintenance, security, deadlines
- Emphasize importance and timing
- Friendly: considerate, Serious: directive, Hype: energetic

## Special Cases

### Error Handling

If context is unclear or missing, default to:

- **Friendly**: "Something happened! Check your dashboard for details 📱"
- **Serious**: "System notification. Check your account for details."
- **Hype**: "SOMETHING'S UP! Check your dashboard NOW! ⚡"

### Multiple Actions

For contexts with multiple events, prioritize the most important:

- "Badge earned AND points awarded" → Focus on badge (more exciting)
- "Warning issued AND points deducted" → Focus on warning (more important)

### Seasonal/Temporal Adjustments

- Morning: More energetic language
- Evening: Calmer, reflective tone
- Weekends: More casual, relaxed messaging
- Holidays: Appropriate seasonal references
