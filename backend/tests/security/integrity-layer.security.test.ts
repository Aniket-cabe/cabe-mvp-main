import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { securityTestUtils } from '../setup/security.setup';
import request from 'supertest';
import { app } from '../../src/app';

describe('Security Tests - Integrity Layer & Psychological Deterrents', () => {
  let testServer: any;

  beforeEach(async () => {
    // Start test server
    testServer = app.listen(3003);
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterEach(async () => {
    if (testServer) {
      testServer.close();
    }
  });

  describe('Integrity Layer Validation', () => {
    it('should enforce integrity checkbox requirement', async () => {
      const submissionWithoutCheckbox = {
        taskId: 'test-task-1',
        proof: 'console.log("test submission");',
        userId: 'test-user-1',
        // Missing integrity_checkbox: true
      };

      const response = await request(app)
        .post('/api/submissions')
        .send(submissionWithoutCheckbox)
        .set('Authorization', 'Bearer mock-token')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('integrity');
      expect(response.body.error).toContain('checkbox');
    });

    it('should reject submissions with unchecked integrity checkbox', async () => {
      const submissionWithFalseCheckbox = {
        taskId: 'test-task-1',
        proof: 'console.log("test submission");',
        userId: 'test-user-1',
        integrity_checkbox: false
      };

      const response = await request(app)
        .post('/api/submissions')
        .send(submissionWithFalseCheckbox)
        .set('Authorization', 'Bearer mock-token')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('integrity');
    });

    it('should accept submissions with checked integrity checkbox', async () => {
      const validSubmission = {
        taskId: 'test-task-1',
        proof: 'console.log("valid submission");',
        userId: 'test-user-1',
        integrity_checkbox: true
      };

      const response = await request(app)
        .post('/api/submissions')
        .send(validSubmission)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Psychological Deterrents - Fake Messages', () => {
    it('should trigger fake success message for suspicious submissions', async () => {
      const suspiciousSubmission = {
        taskId: 'test-task-1',
        proof: 'This is clearly copied from somewhere else without understanding',
        userId: 'test-user-1',
        integrity_checkbox: true
      };

      const response = await request(app)
        .post('/api/submissions')
        .send(suspiciousSubmission)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      // Should return fake success message
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Great job');
      expect(response.body).toHaveProperty('fake_success', true);
    });

    it('should trigger fake error message for obvious cheating attempts', async () => {
      const cheatingSubmission = {
        taskId: 'test-task-1',
        proof: 'I copied this from Stack Overflow without understanding',
        userId: 'test-user-1',
        integrity_checkbox: true
      };

      const response = await request(app)
        .post('/api/submissions')
        .send(cheatingSubmission)
        .set('Authorization', 'Bearer mock-token')
        .expect(400);

      // Should return fake error message
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('try again');
      expect(response.body).toHaveProperty('fake_error', true);
    });

    it('should not trigger fake messages for legitimate submissions', async () => {
      const legitimateSubmission = {
        taskId: 'test-task-1',
        proof: 'I implemented this solution step by step, understanding each part',
        userId: 'test-user-1',
        integrity_checkbox: true
      };

      const response = await request(app)
        .post('/api/submissions')
        .send(legitimateSubmission)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      // Should not have fake message indicators
      expect(response.body).not.toHaveProperty('fake_success');
      expect(response.body).not.toHaveProperty('fake_error');
    });
  });

  describe('Proof Validation - Anti-Cheating Measures', () => {
    it('should detect copied/AI-generated content', async () => {
      const copiedSubmission = {
        taskId: 'test-task-1',
        proof: 'Here is the solution as requested. The algorithm works by... [obviously AI-generated text]',
        userId: 'test-user-1',
        integrity_checkbox: true
      };

      const response = await request(app)
        .post('/api/submissions/validate')
        .send(copiedSubmission)
        .set('Authorization', 'Bearer mock-token')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('copied');
      expect(response.body).toHaveProperty('detection_type', 'ai_generated');
    });

    it('should detect low-effort submissions', async () => {
      const lowEffortSubmission = {
        taskId: 'test-task-1',
        proof: 'I did it',
        userId: 'test-user-1',
        integrity_checkbox: true
      };

      const response = await request(app)
        .post('/api/submissions/validate')
        .send(lowEffortSubmission)
        .set('Authorization', 'Bearer mock-token')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('low effort');
      expect(response.body).toHaveProperty('detection_type', 'low_effort');
    });

    it('should detect fake proof submissions', async () => {
      const fakeProofSubmission = {
        taskId: 'test-task-1',
        proof: 'I completed this task perfectly and got 100% score',
        userId: 'test-user-1',
        integrity_checkbox: true
      };

      const response = await request(app)
        .post('/api/submissions/validate')
        .send(fakeProofSubmission)
        .set('Authorization', 'Bearer mock-token')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('fake');
      expect(response.body).toHaveProperty('detection_type', 'fake_proof');
    });

    it('should accept legitimate proof submissions', async () => {
      const legitimateProof = {
        taskId: 'test-task-1',
        proof: 'I solved this step by step. First, I analyzed the problem... [detailed explanation]',
        userId: 'test-user-1',
        integrity_checkbox: true
      };

      const response = await request(app)
        .post('/api/submissions/validate')
        .send(legitimateProof)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('score');
    });
  });

  describe('Rate Limiting & Abuse Prevention', () => {
    it('should limit submission frequency per user', async () => {
      const submission = {
        taskId: 'test-task-1',
        proof: 'Test submission',
        userId: 'test-user-1',
        integrity_checkbox: true
      };

      // Make multiple rapid submissions
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/submissions')
            .send(submission)
            .set('Authorization', 'Bearer mock-token')
        );
      }

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should detect and block bot-like behavior', async () => {
      const botSubmission = {
        taskId: 'test-task-1',
        proof: 'Automated submission',
        userId: 'bot-user-1',
        integrity_checkbox: true
      };

      const response = await request(app)
        .post('/api/submissions')
        .send(botSubmission)
        .set('User-Agent', 'Bot/1.0')
        .set('Authorization', 'Bearer mock-token')
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('bot');
    });

    it('should track and flag suspicious user patterns', async () => {
      const suspiciousUser = 'suspicious-user-1';
      
      // Simulate suspicious behavior (multiple failed submissions)
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/submissions')
          .send({
            taskId: 'test-task-1',
            proof: 'Suspicious submission',
            userId: suspiciousUser,
            integrity_checkbox: true
          })
          .set('Authorization', 'Bearer mock-token');
      }

      // Check if user is flagged
      const response = await request(app)
        .get(`/api/users/${suspiciousUser}/status`)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toHaveProperty('flagged', true);
      expect(response.body).toHaveProperty('suspicious_activity', true);
    });
  });

  describe('Data Validation & Sanitization', () => {
    it('should prevent XSS attacks in submissions', async () => {
      const xssSubmission = {
        taskId: 'test-task-1',
        proof: '<script>alert("XSS")</script>console.log("test");',
        userId: 'test-user-1',
        integrity_checkbox: true
      };

      const response = await request(app)
        .post('/api/submissions')
        .send(xssSubmission)
        .set('Authorization', 'Bearer mock-token')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('XSS');
    });

    it('should prevent SQL injection in user inputs', async () => {
      const sqlInjectionSubmission = {
        taskId: 'test-task-1',
        proof: "'; DROP TABLE users; --",
        userId: 'test-user-1',
        integrity_checkbox: true
      };

      const response = await request(app)
        .post('/api/submissions')
        .send(sqlInjectionSubmission)
        .set('Authorization', 'Bearer mock-token')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('SQL injection');
    });

    it('should prevent path traversal attacks', async () => {
      const pathTraversalSubmission = {
        taskId: 'test-task-1',
        proof: '../../../etc/passwd',
        userId: 'test-user-1',
        integrity_checkbox: true
      };

      const response = await request(app)
        .post('/api/submissions')
        .send(pathTraversalSubmission)
        .set('Authorization', 'Bearer mock-token')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('path traversal');
    });
  });

  describe('Authentication & Authorization', () => {
    it('should require valid JWT token for submissions', async () => {
      const submission = {
        taskId: 'test-task-1',
        proof: 'Test submission',
        userId: 'test-user-1',
        integrity_checkbox: true
      };

      const response = await request(app)
        .post('/api/submissions')
        .send(submission)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('unauthorized');
    });

    it('should reject expired JWT tokens', async () => {
      const submission = {
        taskId: 'test-task-1',
        proof: 'Test submission',
        userId: 'test-user-1',
        integrity_checkbox: true
      };

      const response = await request(app)
        .post('/api/submissions')
        .send(submission)
        .set('Authorization', `Bearer ${securityTestUtils.jwtTokens.expired}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('expired');
    });

    it('should reject submissions with invalid user ownership', async () => {
      const submission = {
        taskId: 'test-task-1',
        proof: 'Test submission',
        userId: 'different-user-1', // Different from token user
        integrity_checkbox: true
      };

      const response = await request(app)
        .post('/api/submissions')
        .send(submission)
        .set('Authorization', 'Bearer mock-token')
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('forbidden');
    });
  });

  describe('Compliance & Legal Safety', () => {
    it('should enforce no-scraping policy', async () => {
      const scrapingAttempt = {
        taskId: 'test-task-1',
        proof: 'I scraped this from a website',
        userId: 'test-user-1',
        integrity_checkbox: true
      };

      const response = await request(app)
        .post('/api/submissions/validate')
        .send(scrapingAttempt)
        .set('Authorization', 'Bearer mock-token')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('scraping');
      expect(response.body).toHaveProperty('policy_violation', 'no_scraping');
    });

    it('should enforce rewrites-only policy', async () => {
      const copyPasteAttempt = {
        taskId: 'test-task-1',
        proof: 'I copied this directly from the source',
        userId: 'test-user-1',
        integrity_checkbox: true
      };

      const response = await request(app)
        .post('/api/submissions/validate')
        .send(copyPasteAttempt)
        .set('Authorization', 'Bearer mock-token')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('rewrites only');
      expect(response.body).toHaveProperty('policy_violation', 'copy_paste');
    });

    it('should accept properly rewritten content', async () => {
      const rewrittenContent = {
        taskId: 'test-task-1',
        proof: 'I understood the concept and rewrote it in my own words',
        userId: 'test-user-1',
        integrity_checkbox: true
      };

      const response = await request(app)
        .post('/api/submissions/validate')
        .send(rewrittenContent)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('compliance', 'passed');
    });
  });

  describe('Audit Trail & Monitoring', () => {
    it('should log all submission attempts', async () => {
      const submission = {
        taskId: 'test-task-1',
        proof: 'Test submission for audit',
        userId: 'test-user-1',
        integrity_checkbox: true
      };

      await request(app)
        .post('/api/submissions')
        .send(submission)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      // Check audit logs
      const auditResponse = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(auditResponse.body).toHaveProperty('logs');
      expect(auditResponse.body.logs.length).toBeGreaterThan(0);
      
      const submissionLog = auditResponse.body.logs.find(
        (log: any) => log.action === 'submission_attempt' && log.userId === 'test-user-1'
      );
      
      expect(submissionLog).toBeDefined();
      expect(submissionLog).toHaveProperty('timestamp');
      expect(submissionLog).toHaveProperty('ip_address');
      expect(submissionLog).toHaveProperty('user_agent');
    });

    it('should flag suspicious patterns for review', async () => {
      const suspiciousSubmission = {
        taskId: 'test-task-1',
        proof: 'Suspicious content that should be flagged',
        userId: 'suspicious-user-1',
        integrity_checkbox: true
      };

      await request(app)
        .post('/api/submissions')
        .send(suspiciousSubmission)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      // Check flagged submissions
      const flaggedResponse = await request(app)
        .get('/api/admin/flagged-submissions')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(flaggedResponse.body).toHaveProperty('flagged');
      expect(flaggedResponse.body.flagged.length).toBeGreaterThan(0);
      
      const flaggedSubmission = flaggedResponse.body.flagged.find(
        (sub: any) => sub.userId === 'suspicious-user-1'
      );
      
      expect(flaggedSubmission).toBeDefined();
      expect(flaggedSubmission).toHaveProperty('reason');
      expect(flaggedSubmission).toHaveProperty('confidence_score');
    });

    it('should provide detailed security metrics', async () => {
      const metricsResponse = await request(app)
        .get('/api/admin/security-metrics')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(metricsResponse.body).toHaveProperty('total_submissions');
      expect(metricsResponse.body).toHaveProperty('flagged_submissions');
      expect(metricsResponse.body).toHaveProperty('integrity_violations');
      expect(metricsResponse.body).toHaveProperty('rate_limit_violations');
      expect(metricsResponse.body).toHaveProperty('suspicious_patterns');
      expect(metricsResponse.body).toHaveProperty('compliance_violations');
    });
  });

  describe('Psychological Deterrents - Advanced Scenarios', () => {
    it('should show fake progress for repeated failures', async () => {
      const user = 'failing-user-1';
      
      // Simulate multiple failed submissions
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/submissions')
          .send({
            taskId: 'test-task-1',
            proof: 'Failed attempt',
            userId: user,
            integrity_checkbox: true
          })
          .set('Authorization', 'Bearer mock-token');
      }

      // Check user progress (should show fake progress)
      const progressResponse = await request(app)
        .get(`/api/users/${user}/progress`)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(progressResponse.body).toHaveProperty('fake_progress', true);
      expect(progressResponse.body).toHaveProperty('encouragement_message');
    });

    it('should trigger intervention for persistent cheating', async () => {
      const cheatingUser = 'persistent-cheater-1';
      
      // Simulate persistent cheating attempts
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/submissions')
          .send({
            taskId: 'test-task-1',
            proof: 'Obviously copied content',
            userId: cheatingUser,
            integrity_checkbox: true
          })
          .set('Authorization', 'Bearer mock-token');
      }

      // Check if intervention is triggered
      const interventionResponse = await request(app)
        .get(`/api/users/${cheatingUser}/intervention`)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(interventionResponse.body).toHaveProperty('intervention_required', true);
      expect(interventionResponse.body).toHaveProperty('intervention_type');
      expect(interventionResponse.body).toHaveProperty('educational_message');
    });

    it('should provide positive reinforcement for legitimate efforts', async () => {
      const legitimateUser = 'legitimate-user-1';
      
      // Simulate legitimate submission
      const submission = {
        taskId: 'test-task-1',
        proof: 'I worked hard on this and learned a lot',
        userId: legitimateUser,
        integrity_checkbox: true
      };

      const response = await request(app)
        .post('/api/submissions')
        .send(submission)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toHaveProperty('positive_reinforcement', true);
      expect(response.body).toHaveProperty('encouragement_message');
      expect(response.body).toHaveProperty('learning_tips');
    });
  });
});
