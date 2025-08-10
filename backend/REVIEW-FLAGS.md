# Review Flags Audit Trail

This document tracks all submissions flagged for manual review in the Cabe Arena system.

## 📋 Overview

Review flags are created when submissions require human intervention for scoring or evaluation. This document serves as an internal audit trail for all flagged submissions.

## 🚩 Flag Creation Process

### Automatic Flagging

- **AI Scoring Failures**: When AI scoring encounters errors or ambiguous content
- **System Issues**: Database errors, network timeouts, or processing failures
- **Quality Assurance**: Automatic detection of suspicious or incomplete submissions

### Manual Flagging

- **User Requests**: Users can request manual review of their submissions
- **Admin Actions**: Administrators can flag submissions for various reasons
- **Quality Control**: Manual review for complex or subjective evaluations

## 📊 Flag Status Tracking

### Database Fields

- `status`: Set to "flagged"
- `flagged_reason`: Text description of why the submission was flagged
- `flagged_at`: Timestamp when the flag was created
- `previous_status`: The status before flagging (preserved for audit)

### Logging Format

```
🚩 Processing review flag request
📝 Flagging submission for manual review
✅ Submission flagged for manual review successfully
```

## 📝 Flag Reasons Categories

### 1. AI Scoring Issues

```
"AI scoring failed - ambiguous task requirements"
"AI scoring failed - code too complex for automated evaluation"
"AI scoring failed - network timeout"
"AI scoring failed - API rate limit exceeded"
"AI scoring failed - invalid response format"
```

### 2. Task Ambiguity

```
"Task requirements unclear - needs clarification"
"Task scope too broad - requires human judgment"
"Task involves subjective evaluation criteria"
"Task requires domain-specific knowledge"
```

### 3. Code Quality Issues

```
"Code submission incomplete"
"Code contains security vulnerabilities"
"Code violates best practices"
"Code requires manual security review"
```

### 4. User Requests

```
"User requested manual review"
"User disputes AI score"
"User provided additional context"
"User requested clarification"
```

### 5. System Issues

```
"Database connection error during scoring"
"System maintenance required"
"Unexpected error during processing"
"Manual review required due to system issue"
```

## 🔍 Review Process

### 1. Flag Detection

- Monitor submissions with `status = 'flagged'`
- Check `flagged_reason` for context
- Review `flagged_at` timestamp for urgency

### 2. Manual Review

- Admin reviews the flagged submission
- Evaluates the code against task requirements
- Considers the original flag reason
- Applies manual scoring (0-100)

### 3. Resolution

- Update submission status to "scored"
- Set manual score and feedback
- Update user points
- Log review completion

### 4. Audit Trail

- Record who performed the review
- Document the final score and reasoning
- Update review completion timestamp
- Maintain full history for compliance

## 📈 Monitoring and Analytics

### Key Metrics to Track

- **Flag Rate**: Percentage of submissions that get flagged
- **Flag Resolution Time**: Average time from flag to review completion
- **Flag Reasons Distribution**: Most common reasons for flagging
- **Review Quality**: Consistency of manual vs AI scoring
- **User Satisfaction**: Feedback on review process

### Health Checks

```bash
# Get all flagged submissions
curl http://localhost:3001/api/arena/submissions | jq '.submissions[] | select(.status == "flagged")'

# Get flag statistics
curl http://localhost:3001/api/arena/stats | jq '.stats.submissions.flagged'
```

## 🛠️ API Integration

### Flagging a Submission

```bash
curl -X POST http://localhost:3001/api/arena/review-flag \
  -H "Content-Type: application/json" \
  -d '{
    "submission_id": "submission-uuid-here",
    "reason": "AI scoring failed - ambiguous task requirements"
  }'
```

### JavaScript Example

```javascript
const flagSubmission = async (submissionId, reason) => {
  const response = await fetch('http://localhost:3001/api/arena/review-flag', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      submission_id: submissionId,
      reason: reason,
    }),
  });

  const result = await response.json();
  console.log('Flag result:', result);

  if (result.success) {
    console.log(`Submission ${submissionId} flagged for review`);
    console.log(`Reason: ${result.flagDetails.reason}`);
    console.log(`Flagged at: ${result.flagDetails.flaggedAt}`);
  }
};
```

## 📋 Review Queue Management

### Priority Levels

1. **High Priority**: System errors, security concerns
2. **Medium Priority**: AI scoring failures, user disputes
3. **Low Priority**: User requests, quality assurance

### Review Assignment

- Assign reviews to qualified team members
- Track review completion times
- Ensure consistent scoring standards
- Provide feedback on review quality

### Escalation Process

- Flag submissions that remain unreviewed for >24 hours
- Escalate complex cases to senior reviewers
- Notify users of review delays
- Maintain transparency in review process

## 🔒 Security and Compliance

### Data Protection

- All flag actions are logged with timestamps
- User data is protected during review process
- Review history is maintained for audit purposes
- Access to flagged submissions is restricted to authorized personnel

### Audit Requirements

- Log all flag creation events
- Record review completion details
- Maintain submission history
- Track reviewer assignments and actions
- Generate audit reports as needed

## 📊 Reporting

### Daily Reports

- Number of new flags created
- Number of flags resolved
- Average resolution time
- Flag reason distribution

### Weekly Reports

- Flag trends and patterns
- Review quality metrics
- User satisfaction scores
- System performance indicators

### Monthly Reports

- Comprehensive audit trail
- Compliance verification
- Process improvement recommendations
- Training needs assessment

## 🚀 Best Practices

### For Flagging

- Use specific, descriptive reasons
- Include relevant context when available
- Flag early to prevent delays
- Consider user experience impact

### For Reviewing

- Maintain consistent scoring standards
- Provide detailed feedback
- Complete reviews promptly
- Document reasoning for scores

### For Monitoring

- Track flag patterns and trends
- Identify system improvement opportunities
- Monitor review quality and consistency
- Ensure compliance with audit requirements

## 📞 Support and Escalation

### Review Team Contact

- **Primary Reviewer**: [Reviewer Name] - [Email]
- **Backup Reviewer**: [Reviewer Name] - [Email]
- **Escalation Contact**: [Manager Name] - [Email]

### Emergency Procedures

- For security-related flags: Immediate escalation
- For system-critical issues: 24/7 on-call support
- For user complaints: 4-hour response time
- For compliance issues: Immediate notification

## 📝 Change Log

### Version 1.0.0 (2024-01-01)

- Initial review flag system implementation
- Basic flag creation and tracking
- Manual review workflow
- Audit trail documentation

### Future Enhancements

- Automated flag prioritization
- Review assignment algorithms
- Quality assurance automation
- Advanced analytics and reporting
- Integration with external review systems

---

**Last Updated**: 2024-01-01  
**Document Version**: 1.0.0  
**Maintained By**: Cabe Arena Development Team
