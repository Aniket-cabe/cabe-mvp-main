import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { executeWithRetry } from '../../db';

describe('Real-time Metrics API', () => {
  const baseUrl = '/api/metrics/realtime';

  beforeAll(async () => {
    // Setup test data
    await executeWithRetry(async (client) => {
      // Create test tasks
      await client.from('tasks').insert([
        {
          id: 'test-task-1',
          title: 'Test Task 1',
          skill: 'javascript',
          task_type: 'arena',
          created_at: new Date().toISOString(),
        },
        {
          id: 'test-task-2',
          title: 'Test Task 2',
          skill: 'python',
          task_type: 'learning',
          created_at: new Date().toISOString(),
        },
      ]);

      // Create test submissions
      await client.from('submissions').insert([
        {
          id: 'test-submission-1',
          user_id: 'test-user-1',
          task_id: 'test-task-1',
          status: 'approved',
          score: 85,
          created_at: new Date().toISOString(),
        },
        {
          id: 'test-submission-2',
          user_id: 'test-user-2',
          task_id: 'test-task-2',
          status: 'approved',
          score: 92,
          created_at: new Date().toISOString(),
        },
      ]);
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await executeWithRetry(async (client) => {
      await client
        .from('submissions')
        .delete()
        .in('id', ['test-submission-1', 'test-submission-2']);
      await client
        .from('tasks')
        .delete()
        .in('id', ['test-task-1', 'test-task-2']);
    });
  });

  describe('GET /api/metrics/realtime', () => {
    it('should return real-time metrics with valid parameters', async () => {
      const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const to = new Date().toISOString();

      const response = await request(app)
        .get(baseUrl)
        .query({ from, to })
        .expect(200);

      expect(response.body).toHaveProperty('submissionRate');
      expect(response.body).toHaveProperty('activeUsers');
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('filters');
      expect(response.body).toHaveProperty('metadata');

      expect(Array.isArray(response.body.submissionRate)).toBe(true);
      expect(Array.isArray(response.body.activeUsers)).toBe(true);
      expect(typeof response.body.summary.totalSubmissions).toBe('number');
      expect(typeof response.body.summary.totalUsers).toBe('number');
    });

    it('should filter by skill when provided', async () => {
      const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const to = new Date().toISOString();

      const response = await request(app)
        .get(baseUrl)
        .query({ from, to, skill: 'javascript' })
        .expect(200);

      expect(response.body.filters.skill).toBe('javascript');
    });

    it('should filter by task type when provided', async () => {
      const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const to = new Date().toISOString();

      const response = await request(app)
        .get(baseUrl)
        .query({ from, to, type: 'arena' })
        .expect(200);

      expect(response.body.filters.type).toBe('arena');
    });

    it('should return 400 for invalid from date', async () => {
      const to = new Date().toISOString();

      const response = await request(app)
        .get(baseUrl)
        .query({ from: 'invalid-date', to })
        .expect(400);

      expect(response.body.error).toBe('Invalid request parameters');
      expect(response.body.details).toHaveLength(1);
      expect(response.body.details[0].field).toBe('from');
    });

    it('should return 400 for invalid to date', async () => {
      const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const response = await request(app)
        .get(baseUrl)
        .query({ from, to: 'invalid-date' })
        .expect(400);

      expect(response.body.error).toBe('Invalid request parameters');
      expect(response.body.details).toHaveLength(1);
      expect(response.body.details[0].field).toBe('to');
    });

    it('should return 400 when from date is after to date', async () => {
      const from = new Date().toISOString();
      const to = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const response = await request(app)
        .get(baseUrl)
        .query({ from, to })
        .expect(400);

      expect(response.body.error).toBe('Invalid request parameters');
      expect(response.body.details).toHaveLength(1);
      expect(response.body.details[0].field).toBe('from');
      expect(response.body.details[0].message).toBe(
        'From date must be before to date'
      );
    });

    it('should return 400 for invalid skill value', async () => {
      const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const to = new Date().toISOString();

      const response = await request(app)
        .get(baseUrl)
        .query({ from, to, skill: 'invalid-skill' })
        .expect(400);

      expect(response.body.error).toBe('Invalid request parameters');
      expect(response.body.details).toHaveLength(1);
      expect(response.body.details[0].field).toBe('skill');
      expect(response.body.details[0].message).toBe('Invalid skill value');
    });

    it('should return 400 for invalid task type', async () => {
      const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const to = new Date().toISOString();

      const response = await request(app)
        .get(baseUrl)
        .query({ from, to, type: 'invalid-type' })
        .expect(400);

      expect(response.body.error).toBe('Invalid request parameters');
      expect(response.body.details).toHaveLength(1);
      expect(response.body.details[0].field).toBe('type');
    });

    it('should return 400 for missing required parameters', async () => {
      const response = await request(app).get(baseUrl).expect(400);

      expect(response.body.error).toBe('Invalid request parameters');
    });

    it('should handle multiple validation errors', async () => {
      const response = await request(app)
        .get(baseUrl)
        .query({
          from: 'invalid-date',
          to: 'invalid-date',
          skill: 'invalid-skill',
          type: 'invalid-type',
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid request parameters');
      expect(response.body.details.length).toBeGreaterThan(1);
    });
  });

  describe('GET /api/metrics/realtime/skills', () => {
    it('should return available skills', async () => {
      const response = await request(app).get(`${baseUrl}/skills`).expect(200);

      expect(response.body).toHaveProperty('skills');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.skills)).toBe(true);
      expect(typeof response.body.total).toBe('number');

      if (response.body.skills.length > 0) {
        const skill = response.body.skills[0];
        expect(skill).toHaveProperty('value');
        expect(skill).toHaveProperty('label');
        expect(skill).toHaveProperty('count');
      }
    });

    it('should return skills sorted by count', async () => {
      const response = await request(app).get(`${baseUrl}/skills`).expect(200);

      const skills = response.body.skills;
      if (skills.length > 1) {
        expect(skills[0].count).toBeGreaterThanOrEqual(skills[1].count);
      }
    });
  });

  describe('GET /api/metrics/realtime/types', () => {
    it('should return available task types', async () => {
      const response = await request(app).get(`${baseUrl}/types`).expect(200);

      expect(response.body).toHaveProperty('types');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.types)).toBe(true);
      expect(typeof response.body.total).toBe('number');

      if (response.body.types.length > 0) {
        const type = response.body.types[0];
        expect(type).toHaveProperty('value');
        expect(type).toHaveProperty('label');
        expect(type).toHaveProperty('count');
      }
    });

    it('should return types sorted by count', async () => {
      const response = await request(app).get(`${baseUrl}/types`).expect(200);

      const types = response.body.types;
      if (types.length > 1) {
        expect(types[0].count).toBeGreaterThanOrEqual(types[1].count);
      }
    });
  });

  describe('GET /api/metrics/realtime/health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get(`${baseUrl}/health`).expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('database', 'connected');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large date ranges', async () => {
      const from = new Date(
        Date.now() - 365 * 24 * 60 * 60 * 1000
      ).toISOString();
      const to = new Date().toISOString();

      const response = await request(app)
        .get(baseUrl)
        .query({ from, to })
        .expect(200);

      expect(response.body).toHaveProperty('submissionRate');
      expect(response.body).toHaveProperty('activeUsers');
    });

    it('should handle empty result sets', async () => {
      const from = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const to = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

      const response = await request(app)
        .get(baseUrl)
        .query({ from, to })
        .expect(200);

      expect(response.body.submissionRate).toHaveLength(0);
      expect(response.body.activeUsers).toHaveLength(0);
      expect(response.body.summary.totalSubmissions).toBe(0);
    });

    it('should handle concurrent requests', async () => {
      const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const to = new Date().toISOString();

      const requests = Array.from({ length: 5 }, () =>
        request(app).get(baseUrl).query({ from, to })
      );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('submissionRate');
        expect(response.body).toHaveProperty('activeUsers');
      });
    });
  });

  describe('Performance Tests', () => {
    it('should complete request within reasonable time', async () => {
      const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const to = new Date().toISOString();

      const startTime = Date.now();

      await request(app).get(baseUrl).query({ from, to }).expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within 1 second
      expect(duration).toBeLessThan(1000);
    });

    it('should handle multiple filter combinations efficiently', async () => {
      const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const to = new Date().toISOString();

      const filterCombinations = [
        { skill: 'javascript' },
        { type: 'arena' },
        { skill: 'python', type: 'learning' },
      ];

      const startTime = Date.now();

      const requests = filterCombinations.map((filters) =>
        request(app)
          .get(baseUrl)
          .query({ from, to, ...filters })
      );

      await Promise.all(requests);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete all requests within 2 seconds
      expect(duration).toBeLessThan(2000);
    });
  });
});
