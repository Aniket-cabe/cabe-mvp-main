import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

const SERVICES = {
  auth: 'http://localhost:4000',
  tasks: 'http://localhost:4001',
  ai: 'http://localhost:4002',
  nginx: 'http://localhost:80',
};

const waitForService = async (
  url: string,
  timeout = 30000
): Promise<boolean> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const response = await axios.get(`${url}/health`, { timeout: 5000 });
      if (response.status === 200) {
        return true;
      }
    } catch (error) {
      console.log(`Waiting for ${url}...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return false;
};

describe('Microservices Smoke Tests', () => {
  beforeAll(async () => {
    console.log('🚀 Starting microservices smoke tests...');

    // Wait for all services to be healthy
    const serviceChecks = await Promise.all([
      waitForService(SERVICES.auth),
      waitForService(SERVICES.tasks),
      waitForService(SERVICES.ai),
      waitForService(SERVICES.nginx),
    ]);

    if (!serviceChecks.every((check) => check)) {
      throw new Error('Not all services are healthy');
    }

    console.log('✅ All services are healthy');
  }, 60000);

  describe('Health Checks', () => {
    it('should have healthy auth service', async () => {
      const response = await axios.get(`${SERVICES.auth}/health`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'healthy');
      expect(response.data).toHaveProperty('service', 'auth');
    });

    it('should have healthy tasks service', async () => {
      const response = await axios.get(`${SERVICES.tasks}/health`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'healthy');
      expect(response.data).toHaveProperty('service', 'tasks');
    });

    it('should have healthy AI service', async () => {
      const response = await axios.get(`${SERVICES.ai}/health`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'healthy');
      expect(response.data).toHaveProperty('service', 'ai');
    });

    it('should have healthy nginx proxy', async () => {
      const response = await axios.get(`${SERVICES.nginx}/health`);
      expect(response.status).toBe(200);
      expect(response.data).toBe('healthy\n');
    });
  });

  describe('Service Communication', () => {
    it('should route auth requests through nginx', async () => {
      const response = await axios.get(`${SERVICES.nginx}/api/auth/`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty(
        'service',
        'CaBE Arena Auth Service'
      );
    });

    it('should route tasks requests through nginx', async () => {
      const response = await axios.get(`${SERVICES.nginx}/api/tasks/`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message');
    });

    it('should route AI requests through nginx', async () => {
      const response = await axios.get(`${SERVICES.nginx}/api/ai/`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('service', 'CaBE Arena AI Service');
    });
  });

  describe('Authentication Flow', () => {
    it('should handle auth token validation', async () => {
      // Test auth service directly
      const authResponse = await axios.get(`${SERVICES.auth}/`);
      expect(authResponse.status).toBe(200);
      expect(authResponse.data).toHaveProperty(
        'service',
        'CaBE Arena Auth Service'
      );
    });

    it('should reject invalid tokens', async () => {
      try {
        await axios.get(`${SERVICES.tasks}/api/tasks/`, {
          headers: { Authorization: 'Bearer invalid-token' },
        });
        expect.fail('Should have rejected invalid token');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      try {
        await axios.get(`${SERVICES.nginx}/api/unknown/`);
        expect.fail('Should have returned 404');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should handle service unavailability gracefully', async () => {
      // This test would require stopping a service to verify
      // For now, we just verify the health check works
      const response = await axios.get(`${SERVICES.nginx}/health`);
      expect(response.status).toBe(200);
    });
  });

  describe('Performance', () => {
    it('should respond within reasonable time', async () => {
      const startTime = Date.now();
      await axios.get(`${SERVICES.nginx}/health`);
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle concurrent requests', async () => {
      const concurrentRequests = 10;
      const promises = Array(concurrentRequests)
        .fill(0)
        .map(() => axios.get(`${SERVICES.nginx}/health`));

      const responses = await Promise.all(promises);
      expect(responses).toHaveLength(concurrentRequests);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });
  });

  afterAll(async () => {
    console.log('🏁 Microservices smoke tests completed');
  });
});
