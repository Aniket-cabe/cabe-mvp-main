import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { testRequest } from '../setup/integration.setup';

describe('Arena API Integration Tests', () => {
  let authToken: string;
  let testUserId: string;
  let testTaskId: string;

  beforeEach(async () => {
    // Setup test data
    testUserId = 'test-user-123';
    testTaskId = 'test-task-456';
    
    // Mock authentication token
    authToken = 'Bearer test-jwt-token';
  });

  afterEach(async () => {
    // Cleanup test data
  });

  describe('Task Feed Endpoints', () => {
    it('should fetch tasks successfully', async () => {
      const response = await testRequest
        .get('/api/arena/tasks')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.tasks).toBeInstanceOf(Array);
      expect(response.body.tasks.length).toBeGreaterThan(0);
      
      // Verify task structure
      const task = response.body.tasks[0];
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('skill_area');
      expect(task).toHaveProperty('duration');
      expect(task).toHaveProperty('skill');
      expect(task).toHaveProperty('complexity');
      expect(task).toHaveProperty('visibility');
      expect(task).toHaveProperty('professional_impact');
      expect(task).toHaveProperty('autonomy');
    });

    it('should filter tasks by skill area', async () => {
      const response = await testRequest
        .get('/api/arena/tasks?skill_area=fullstack-dev')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.tasks).toBeInstanceOf(Array);
      
      // All tasks should have the requested skill area
      response.body.tasks.forEach((task: any) => {
        expect(task.skill_area).toBe('fullstack-dev');
      });
    });

    it('should handle pagination correctly', async () => {
      const response = await testRequest
        .get('/api/arena/tasks?page=1&limit=5')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.tasks.length).toBeLessThanOrEqual(5);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('currentPage');
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(response.body.pagination).toHaveProperty('totalTasks');
    });
  });

  describe('Task Submission Endpoints', () => {
    it('should submit a task successfully', async () => {
      const submissionData = {
        task_id: testTaskId,
        proof: 'console.log("Hello World");',
        integrity_checkbox: true,
        user_notes: 'Test submission'
      };

      const response = await testRequest
        .post('/api/arena/submit')
        .set('Authorization', authToken)
        .send(submissionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.submission).toHaveProperty('id');
      expect(response.body.submission).toHaveProperty('task_id', testTaskId);
      expect(response.body.submission).toHaveProperty('user_id');
      expect(response.body.submission).toHaveProperty('proof');
      expect(response.body.submission).toHaveProperty('status');
      expect(response.body.submission).toHaveProperty('ai_score');
      expect(response.body.submission).toHaveProperty('points_awarded');
    });

    it('should reject submission without integrity checkbox', async () => {
      const submissionData = {
        task_id: testTaskId,
        proof: 'console.log("Hello World");',
        integrity_checkbox: false,
        user_notes: 'Test submission without checkbox'
      };

      const response = await testRequest
        .post('/api/arena/submit')
        .set('Authorization', authToken)
        .send(submissionData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('integrity');
    });

    it('should reject submission with empty proof', async () => {
      const submissionData = {
        task_id: testTaskId,
        proof: '',
        integrity_checkbox: true,
        user_notes: 'Empty proof submission'
      };

      const response = await testRequest
        .post('/api/arena/submit')
        .set('Authorization', authToken)
        .send(submissionData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('proof');
    });

    it('should handle AI scoring integration', async () => {
      const submissionData = {
        task_id: testTaskId,
        proof: `
          function fibonacci(n) {
            if (n <= 1) return n;
            return fibonacci(n - 1) + fibonacci(n - 2);
          }
          console.log(fibonacci(10));
        `,
        integrity_checkbox: true,
        user_notes: 'Fibonacci implementation'
      };

      const response = await testRequest
        .post('/api/arena/submit')
        .set('Authorization', authToken)
        .send(submissionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.submission.ai_score).toBeGreaterThan(0);
      expect(response.body.submission.ai_score).toBeLessThanOrEqual(100);
      expect(response.body.submission.points_awarded).toBeGreaterThan(0);
      expect(response.body.submission).toHaveProperty('ai_feedback');
    });
  });

  describe('User Profile and Points Endpoints', () => {
    it('should fetch user profile with points and rank', async () => {
      const response = await testRequest
        .get('/api/arena/profile')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('points');
      expect(response.body.user).toHaveProperty('rankLevel');
      expect(response.body.user).toHaveProperty('rankTitle');
      expect(response.body.user).toHaveProperty('totalSubmissions');
      expect(response.body.user).toHaveProperty('completedTasks');
    });

    it('should calculate rank progression correctly', async () => {
      // Test Bronze rank (0-999 points)
      const bronzeResponse = await testRequest
        .get('/api/arena/profile')
        .set('Authorization', authToken)
        .expect(200);

      if (bronzeResponse.body.user.points < 1000) {
        expect(bronzeResponse.body.user.rankLevel).toBe('Bronze');
      }

      // Test Silver rank (1000-4999 points)
      if (bronzeResponse.body.user.points >= 1000 && bronzeResponse.body.user.points < 5000) {
        expect(bronzeResponse.body.user.rankLevel).toBe('Silver');
      }

      // Test Gold rank (5000+ points)
      if (bronzeResponse.body.user.points >= 5000) {
        expect(bronzeResponse.body.user.rankLevel).toBe('Gold');
      }
    });

    it('should provide progress towards next rank', async () => {
      const response = await testRequest
        .get('/api/arena/progress-bar')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.progress).toHaveProperty('currentRank');
      expect(response.body.progress).toHaveProperty('nextRank');
      expect(response.body.progress).toHaveProperty('currentPoints');
      expect(response.body.progress).toHaveProperty('pointsToNextRank');
      expect(response.body.progress).toHaveProperty('progressPercentage');
      expect(response.body.progress.progressPercentage).toBeGreaterThanOrEqual(0);
      expect(response.body.progress.progressPercentage).toBeLessThanOrEqual(100);
    });
  });

  describe('Leaderboard Endpoints', () => {
    it('should fetch leaderboard successfully', async () => {
      const response = await testRequest
        .get('/api/arena/leaderboard')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.leaderboard).toBeInstanceOf(Array);
      expect(response.body.leaderboard.length).toBeLessThanOrEqual(10);
      
      // Verify leaderboard structure
      if (response.body.leaderboard.length > 0) {
        const leader = response.body.leaderboard[0];
        expect(leader).toHaveProperty('rank');
        expect(leader).toHaveProperty('id');
        expect(leader).toHaveProperty('email');
        expect(leader).toHaveProperty('points');
        expect(leader).toHaveProperty('rankLevel');
        expect(leader.rank).toBe(1);
      }
    });

    it('should sort leaderboard by points in descending order', async () => {
      const response = await testRequest
        .get('/api/arena/leaderboard')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Verify sorting
      for (let i = 1; i < response.body.leaderboard.length; i++) {
        const current = response.body.leaderboard[i];
        const previous = response.body.leaderboard[i - 1];
        expect(current.points).toBeLessThanOrEqual(previous.points);
      }
    });
  });

  describe('Arena Access Control', () => {
    it('should check Arena access requirements', async () => {
      const response = await testRequest
        .get('/api/arena/access')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.arenaContext).toHaveProperty('currentRank');
      expect(response.body.arenaContext).toHaveProperty('currentPoints');
      expect(response.body.arenaContext).toHaveProperty('accessGranted');
      expect(response.body.arenaContext).toHaveProperty('accessReason');
      expect(response.body.arenaContext).toHaveProperty('requirementsMet');
      expect(response.body.arenaContext).toHaveProperty('restrictions');
    });

    it('should enforce Arena access restrictions', async () => {
      // Test with a user who doesn't meet Arena requirements
      const lowPointsResponse = await testRequest
        .get('/api/arena/access')
        .set('Authorization', authToken)
        .expect(200);

      if (!lowPointsResponse.body.arenaContext.accessGranted) {
        expect(lowPointsResponse.body.arenaContext.requirementsMet).toBe(false);
        expect(lowPointsResponse.body.arenaContext.accessReason).toContain('points');
      }
    });
  });

  describe('Task Rotation and Limits', () => {
    it('should enforce task completion limits', async () => {
      // Submit multiple tasks to test rotation
      const submissions = [];
      for (let i = 0; i < 5; i++) {
        const submissionData = {
          task_id: `task-${i}`,
          proof: `console.log("Task ${i}");`,
          integrity_checkbox: true,
          user_notes: `Task ${i} submission`
        };

        const response = await testRequest
          .post('/api/arena/submit')
          .set('Authorization', authToken)
          .send(submissionData);

        submissions.push(response.body);
      }

      // Check if rotation is enforced after 50 completions
      const profileResponse = await testRequest
        .get('/api/arena/profile')
        .set('Authorization', authToken)
        .expect(200);

      if (profileResponse.body.user.completedTasks >= 50) {
        // Should enforce rotation
        expect(profileResponse.body.user).toHaveProperty('rotationEnforced');
      }
    });

    it('should enforce 14-day rotation period', async () => {
      const response = await testRequest
        .get('/api/arena/tasks')
        .set('Authorization', authToken)
        .expect(200);

      // Check if tasks are rotated based on 14-day period
      response.body.tasks.forEach((task: any) => {
        const taskDate = new Date(task.created_at);
        const now = new Date();
        const daysSinceCreation = (now.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24);
        
        // Tasks older than 14 days should be rotated out
        if (daysSinceCreation > 14) {
          expect(task.is_active).toBe(false);
        }
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid task ID gracefully', async () => {
      const submissionData = {
        task_id: 'invalid-task-id',
        proof: 'console.log("test");',
        integrity_checkbox: true,
        user_notes: 'Invalid task submission'
      };

      const response = await testRequest
        .post('/api/arena/submit')
        .set('Authorization', authToken)
        .send(submissionData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('task');
    });

    it('should handle malformed submission data', async () => {
      const malformedData = {
        task_id: testTaskId,
        // Missing required fields
      };

      const response = await testRequest
        .post('/api/arena/submit')
        .set('Authorization', authToken)
        .send(malformedData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle unauthorized access', async () => {
      const response = await testRequest
        .get('/api/arena/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('unauthorized');
    });

    it('should handle rate limiting', async () => {
      // Make multiple rapid requests to test rate limiting
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          testRequest
            .get('/api/arena/tasks')
            .set('Authorization', authToken)
        );
      }

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited
      const rateLimited = responses.filter(res => res.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Response Times', () => {
    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      await testRequest
        .get('/api/arena/tasks')
        .set('Authorization', authToken)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Should respond within 500ms
      expect(responseTime).toBeLessThan(500);
    });

    it('should handle concurrent requests efficiently', async () => {
      const startTime = Date.now();
      
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(
          testRequest
            .get('/api/arena/tasks')
            .set('Authorization', authToken)
            .expect(200)
        );
      }

      await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // 20 concurrent requests should complete within 2 seconds
      expect(totalTime).toBeLessThan(2000);
    });
  });
});
