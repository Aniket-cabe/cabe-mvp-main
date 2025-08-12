import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import { testUtils, testSupabase } from '../setup';

describe('Tasks Integration Tests', () => {
  let testUser: any;
  let testTask: any;
  let authToken: string;

  beforeEach(async () => {
    await testUtils.cleanupTestData();
    
    // Create test user and get auth token
    testUser = await testUtils.createTestUser();
    authToken = testUtils.generateTestToken(testUser.id);
    
    // Create test task
    testTask = await testUtils.createTestTask();
  });

  describe('GET /api/tasks', () => {
    it('should return paginated tasks list', async () => {
      // Create multiple tasks
          await testUtils.createTestTask({ title: 'Task 1', skill_area: 'ai-ml' });
    await testUtils.createTestTask({ title: 'Task 2', skill_area: 'cloud-devops' });
    await testUtils.createTestTask({ title: 'Task 3', skill_area: 'ai-ml' });

      const response = await request(app)
        .get('/api/tasks')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('tasks');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.tasks)).toBe(true);
      expect(response.body.tasks.length).toBeGreaterThan(0);
    });

    it('should filter tasks by skill area', async () => {
          await testUtils.createTestTask({ title: 'AI/ML Task', skill_area: 'ai-ml' });
    await testUtils.createTestTask({ title: 'Cloud/DevOps Task', skill_area: 'cloud-devops' });

    const response = await request(app)
      .get('/api/tasks')
      .query({ skill_area: 'ai-ml' })
      .expect(200);

    expect(response.body.tasks.every((task: any) => task.skill_area === 'ai-ml')).toBe(true);
    });

    it('should filter tasks by difficulty', async () => {
      await testUtils.createTestTask({ title: 'Easy Task', difficulty: 'beginner' });
      await testUtils.createTestTask({ title: 'Hard Task', difficulty: 'expert' });

      const response = await request(app)
        .get('/api/tasks')
        .query({ difficulty: 'beginner' })
        .expect(200);

      expect(response.body.tasks.every((task: any) => task.difficulty === 'beginner')).toBe(true);
    });

    it('should search tasks by title', async () => {
      await testUtils.createTestTask({ title: 'React Component Task' });
      await testUtils.createTestTask({ title: 'Vue Component Task' });

      const response = await request(app)
        .get('/api/tasks')
        .query({ search: 'React' })
        .expect(200);

      expect(response.body.tasks.every((task: any) => task.title.includes('React'))).toBe(true);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return task details', async () => {
      const response = await request(app)
        .get(`/api/tasks/${testTask.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('task');
      expect(response.body.task.id).toBe(testTask.id);
      expect(response.body.task.title).toBe(testTask.title);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task with valid data', async () => {
      const taskData = {
        title: 'New Test Task',
        description: 'A comprehensive test task',
        difficulty: 'intermediate',
        skill_area: 'fullstack',
        points_reward: 25,
        time_limit: 45,
        requirements: ['React', 'Node.js'],
        test_cases: [
          { input: 'test input', expected_output: 'test output' }
        ]
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('task');
      expect(response.body.task.title).toBe(taskData.title);
      expect(response.body.task.difficulty).toBe(taskData.difficulty);
    });

    it('should reject task creation without authentication', async () => {
      const taskData = {
        title: 'Unauthorized Task',
        description: 'This should fail',
        difficulty: 'beginner',
        skill_area: 'ai-ml'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate required fields', async () => {
      const invalidTaskData = {
        description: 'Missing title and other required fields'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTaskData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('title');
    });
  });

  describe('POST /api/tasks/:id/submit', () => {
    it('should submit a task solution successfully', async () => {
      const submissionData = {
        code: 'console.log("Hello World");',
        language: 'javascript',
        time_taken: 15,
        additional_notes: 'Test submission'
      };

      const response = await request(app)
        .post(`/api/tasks/${testTask.id}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(submissionData)
        .expect(201);

      expect(response.body).toHaveProperty('submission');
      expect(response.body).toHaveProperty('score');
      expect(response.body.submission.task_id).toBe(testTask.id);
      expect(response.body.submission.user_id).toBe(testUser.id);
    });

    it('should reject submission without authentication', async () => {
      const submissionData = {
        code: 'console.log("Hello World");',
        language: 'javascript'
      };

      const response = await request(app)
        .post(`/api/tasks/${testTask.id}/submit`)
        .send(submissionData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate submission data', async () => {
      const invalidSubmissionData = {
        // Missing required code field
        language: 'javascript'
      };

      const response = await request(app)
        .post(`/api/tasks/${testTask.id}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidSubmissionData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('code');
    });

    it('should prevent duplicate submissions', async () => {
      const submissionData = {
        code: 'console.log("Hello World");',
        language: 'javascript'
      };

      // First submission
      await request(app)
        .post(`/api/tasks/${testTask.id}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(submissionData)
        .expect(201);

      // Second submission should fail
      const response = await request(app)
        .post(`/api/tasks/${testTask.id}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(submissionData)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already submitted');
    });
  });

  describe('GET /api/tasks/:id/submissions', () => {
    it('should return user submissions for a task', async () => {
      // Create a submission first
      await testUtils.createTestSubmission({
        user_id: testUser.id,
        task_id: testTask.id
      });

      const response = await request(app)
        .get(`/api/tasks/${testTask.id}/submissions`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('submissions');
      expect(Array.isArray(response.body.submissions)).toBe(true);
      expect(response.body.submissions.length).toBeGreaterThan(0);
    });

    it('should return empty array for task with no submissions', async () => {
      const response = await request(app)
        .get(`/api/tasks/${testTask.id}/submissions`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.submissions).toEqual([]);
    });
  });

  describe('POST /api/tasks/generate', () => {
    it('should generate tasks using AI', async () => {
      const generationData = {
        skill_area: 'ai-ml',
        difficulty: 'intermediate',
        count: 3,
        topics: ['Machine Learning', 'Neural Networks', 'Data Preprocessing']
      };

      const response = await request(app)
        .post('/api/tasks/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(generationData)
        .expect(201);

      expect(response.body).toHaveProperty('tasks');
      expect(Array.isArray(response.body.tasks)).toBe(true);
      expect(response.body.tasks.length).toBe(generationData.count);
    });

    it('should validate generation parameters', async () => {
      const invalidData = {
        skill_area: 'invalid_skill',
        count: 100 // Too many
      };

      const response = await request(app)
        .post('/api/tasks/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/tasks/leaderboard/:id', () => {
    it('should return task leaderboard', async () => {
      // Create multiple submissions with different scores
      await testUtils.createTestSubmission({
        user_id: 'user-1',
        task_id: testTask.id,
        score: 95
      });
      await testUtils.createTestSubmission({
        user_id: 'user-2',
        task_id: testTask.id,
        score: 87
      });
      await testUtils.createTestSubmission({
        user_id: 'user-3',
        task_id: testTask.id,
        score: 92
      });

      const response = await request(app)
        .get(`/api/tasks/leaderboard/${testTask.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('leaderboard');
      expect(Array.isArray(response.body.leaderboard)).toBe(true);
      expect(response.body.leaderboard.length).toBe(3);
      
      // Check if sorted by score (descending)
      const scores = response.body.leaderboard.map((entry: any) => entry.score);
      expect(scores).toEqual([95, 92, 87]);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update task with valid data', async () => {
      const updateData = {
        title: 'Updated Task Title',
        description: 'Updated description',
        points_reward: 50
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('task');
      expect(response.body.task.title).toBe(updateData.title);
      expect(response.body.task.description).toBe(updateData.description);
      expect(response.body.task.points_reward).toBe(updateData.points_reward);
    });

    it('should reject update without authentication', async () => {
      const updateData = {
        title: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask.id}`)
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete task successfully', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted');

      // Verify task is deleted
      const getResponse = await request(app)
        .get(`/api/tasks/${testTask.id}`)
        .expect(404);
    });

    it('should reject deletion without authentication', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${testTask.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/tasks/:id/rate', () => {
    it('should rate a task successfully', async () => {
      const ratingData = {
        rating: 5,
        feedback: 'Excellent task!'
      };

      const response = await request(app)
        .post(`/api/tasks/${testTask.id}/rate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(ratingData)
        .expect(201);

      expect(response.body).toHaveProperty('rating');
      expect(response.body.rating.rating).toBe(ratingData.rating);
      expect(response.body.rating.feedback).toBe(ratingData.feedback);
    });

    it('should validate rating value', async () => {
      const invalidRatingData = {
        rating: 7, // Invalid: should be 1-5
        feedback: 'Invalid rating'
      };

      const response = await request(app)
        .post(`/api/tasks/${testTask.id}/rate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRatingData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('rating');
    });
  });
});
