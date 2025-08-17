import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { performanceTestUtils } from '../setup/performance.setup';
import request from 'supertest';
import { app } from '../../src/app';

// Realistic performance thresholds for free tiers
const REALISTIC_THRESHOLDS = {
  responseTime: {
    fast: 200,      // ms - Good performance
    acceptable: 800, // ms - Acceptable for free tier
    slow: 1500,     // ms - Warning threshold
    critical: 3000  // ms - Critical threshold
  },
  throughput: {
    min: 10,        // requests per second - Minimum for free tier
    target: 50,     // requests per second - Target for free tier
    max: 100        // requests per second - Maximum for free tier
  },
  memory: {
    max: 512 * 1024 * 1024, // 512MB - Free tier limit
    warning: 256 * 1024 * 1024 // 256MB - Warning threshold
  },
  cpu: {
    max: 70,        // percentage - Free tier limit
    warning: 50     // percentage - Warning threshold
  }
};

// CI/CD specific thresholds (more aggressive)
const CI_THRESHOLDS = {
  responseTime: {
    fast: 100,
    acceptable: 500,
    slow: 1000,
    critical: 2000
  },
  throughput: {
    min: 50,
    target: 200,
    max: 500
  }
};

// Load test scenarios - Realistic for free tiers
const REALISTIC_SCENARIOS = {
  light: {
    users: 5,           // 5 concurrent users
    duration: 5000,     // 5 seconds
    requestsPerSecond: 2 // 2 requests per second
  },
  medium: {
    users: 10,          // 10 concurrent users
    duration: 10000,    // 10 seconds
    requestsPerSecond: 5 // 5 requests per second
  },
  heavy: {
    users: 20,          // 20 concurrent users (free tier limit)
    duration: 15000,    // 15 seconds
    requestsPerSecond: 10 // 10 requests per second
  }
};

// CI/CD scenarios (more aggressive)
const CI_SCENARIOS = {
  light: {
    users: 10,
    duration: 10000,
    requestsPerSecond: 10
  },
  medium: {
    users: 25,
    duration: 20000,
    requestsPerSecond: 25
  },
  heavy: {
    users: 50,
    duration: 30000,
    requestsPerSecond: 50
  }
};

// Determine which thresholds to use
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
const thresholds = isCI ? CI_THRESHOLDS : REALISTIC_THRESHOLDS;
const scenarios = isCI ? CI_SCENARIOS : REALISTIC_SCENARIOS;

describe('Performance Tests - Realistic Load Testing', () => {
  let testServer: any;

  beforeAll(async () => {
    // Start test server
    testServer = app.listen(3002);
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    if (testServer) {
      testServer.close();
    }
  });

  beforeEach(() => {
    // Reset metrics before each test
    performanceTestUtils.metrics.responseTimes = [];
    performanceTestUtils.metrics.throughput = 0;
    performanceTestUtils.metrics.errorRate = 0;
  });

  describe('Response Time Tests', () => {
    it('should handle single requests within acceptable time', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(thresholds.responseTime.acceptable);
      expect(response.body).toHaveProperty('status', 'ok');
    });

    it('should handle task feed requests efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(thresholds.responseTime.acceptable);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle user profile requests efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(thresholds.responseTime.acceptable);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('Concurrent Load Tests - Light Load', () => {
    it('should handle light concurrent load', async () => {
      const { users, duration, requestsPerSecond } = scenarios.light;
      const totalRequests = Math.floor((duration / 1000) * requestsPerSecond);
      const requests: Promise<any>[] = [];
      
      console.log(`Running light load test: ${users} users, ${totalRequests} total requests`);
      
      // Simulate concurrent users making requests
      for (let i = 0; i < totalRequests; i++) {
        const delay = (i / requestsPerSecond) * 1000;
        const requestPromise = new Promise(resolve => {
          setTimeout(async () => {
            const startTime = Date.now();
            try {
              const response = await request(app).get('/api/health');
              const responseTime = Date.now() - startTime;
              performanceTestUtils.metrics.responseTimes.push(responseTime);
              resolve({ success: true, responseTime });
            } catch (error) {
              resolve({ success: false, error });
            }
          }, delay);
        });
        requests.push(requestPromise);
      }
      
      const results = await Promise.all(requests);
      const successfulRequests = results.filter(r => r.success);
      const failedRequests = results.filter(r => !r.success);
      
      // Calculate metrics
      const avgResponseTime = successfulRequests.reduce((sum, r) => sum + r.responseTime, 0) / successfulRequests.length;
      const throughput = (successfulRequests.length / (duration / 1000));
      const errorRate = (failedRequests.length / totalRequests) * 100;
      
      console.log(`Light load results: Avg response time: ${avgResponseTime.toFixed(2)}ms, Throughput: ${throughput.toFixed(2)} req/s, Error rate: ${errorRate.toFixed(2)}%`);
      
      // Assertions for light load
      expect(avgResponseTime).toBeLessThan(thresholds.responseTime.acceptable);
      expect(throughput).toBeGreaterThan(thresholds.throughput.min);
      expect(errorRate).toBeLessThan(5); // Less than 5% error rate
    });
  });

  describe('Concurrent Load Tests - Medium Load', () => {
    it('should handle medium concurrent load', async () => {
      const { users, duration, requestsPerSecond } = scenarios.medium;
      const totalRequests = Math.floor((duration / 1000) * requestsPerSecond);
      const requests: Promise<any>[] = [];
      
      console.log(`Running medium load test: ${users} users, ${totalRequests} total requests`);
      
      // Simulate concurrent users making requests
      for (let i = 0; i < totalRequests; i++) {
        const delay = (i / requestsPerSecond) * 1000;
        const requestPromise = new Promise(resolve => {
          setTimeout(async () => {
            const startTime = Date.now();
            try {
              const response = await request(app).get('/api/tasks');
              const responseTime = Date.now() - startTime;
              performanceTestUtils.metrics.responseTimes.push(responseTime);
              resolve({ success: true, responseTime });
            } catch (error) {
              resolve({ success: false, error });
            }
          }, delay);
        });
        requests.push(requestPromise);
      }
      
      const results = await Promise.all(requests);
      const successfulRequests = results.filter(r => r.success);
      const failedRequests = results.filter(r => !r.success);
      
      // Calculate metrics
      const avgResponseTime = successfulRequests.reduce((sum, r) => sum + r.responseTime, 0) / successfulRequests.length;
      const throughput = (successfulRequests.length / (duration / 1000));
      const errorRate = (failedRequests.length / totalRequests) * 100;
      
      console.log(`Medium load results: Avg response time: ${avgResponseTime.toFixed(2)}ms, Throughput: ${throughput.toFixed(2)} req/s, Error rate: ${errorRate.toFixed(2)}%`);
      
      // Assertions for medium load
      expect(avgResponseTime).toBeLessThan(thresholds.responseTime.acceptable);
      expect(throughput).toBeGreaterThan(thresholds.throughput.min);
      expect(errorRate).toBeLessThan(10); // Less than 10% error rate
    });
  });

  describe('Stress Tests - Heavy Load (Free Tier Limits)', () => {
    it('should handle heavy load within free tier limits', async () => {
      const { users, duration, requestsPerSecond } = scenarios.heavy;
      const totalRequests = Math.floor((duration / 1000) * requestsPerSecond);
      const requests: Promise<any>[] = [];
      
      console.log(`Running heavy load test: ${users} users, ${totalRequests} total requests`);
      
      // Simulate concurrent users making requests
      for (let i = 0; i < totalRequests; i++) {
        const delay = (i / requestsPerSecond) * 1000;
        const requestPromise = new Promise(resolve => {
          setTimeout(async () => {
            const startTime = Date.now();
            try {
              const response = await request(app).get('/api/health');
              const responseTime = Date.now() - startTime;
              performanceTestUtils.metrics.responseTimes.push(responseTime);
              resolve({ success: true, responseTime });
            } catch (error) {
              resolve({ success: false, error });
            }
          }, delay);
        });
        requests.push(requestPromise);
      }
      
      const results = await Promise.all(requests);
      const successfulRequests = results.filter(r => r.success);
      const failedRequests = results.filter(r => !r.success);
      
      // Calculate metrics
      const avgResponseTime = successfulRequests.reduce((sum, r) => sum + r.responseTime, 0) / successfulRequests.length;
      const throughput = (successfulRequests.length / (duration / 1000));
      const errorRate = (failedRequests.length / totalRequests) * 100;
      
      console.log(`Heavy load results: Avg response time: ${avgResponseTime.toFixed(2)}ms, Throughput: ${throughput.toFixed(2)} req/s, Error rate: ${errorRate.toFixed(2)}%`);
      
      // Assertions for heavy load (more lenient for free tier)
      expect(avgResponseTime).toBeLessThan(thresholds.responseTime.slow);
      expect(throughput).toBeGreaterThan(thresholds.throughput.min);
      expect(errorRate).toBeLessThan(20); // Less than 20% error rate for heavy load
    });
  });

  describe('Memory Usage Tests', () => {
    it('should maintain reasonable memory usage', async () => {
      const initialMemory = process.memoryUsage();
      
      // Make several requests to simulate memory usage
      const requests = Array(50).fill(null).map(() => 
        request(app).get('/api/health')
      );
      
      await Promise.all(requests);
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
      
      console.log(`Memory usage increase: ${memoryIncreaseMB.toFixed(2)} MB`);
      
      // Memory should not increase excessively
      expect(memoryIncreaseMB).toBeLessThan(100); // Less than 100MB increase
    });
  });

  describe('Database Performance Tests', () => {
    it('should handle database queries efficiently', async () => {
      const startTime = Date.now();
      
      // Simulate database-heavy operation
      const response = await request(app)
        .get('/api/tasks')
        .query({ limit: 50, offset: 0 })
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(thresholds.responseTime.acceptable);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle complex queries within limits', async () => {
      const startTime = Date.now();
      
      // Simulate complex query with filters
      const response = await request(app)
        .get('/api/tasks')
        .query({ 
          difficulty: 'Medium',
          category: 'Programming',
          limit: 20,
          offset: 0
        })
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(thresholds.responseTime.acceptable);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('AI Scoring Performance Tests', () => {
    it('should handle AI scoring requests efficiently', async () => {
      const startTime = Date.now();
      
      const mockSubmission = {
        taskId: 'test-task-1',
        proof: 'This is a test submission for AI scoring',
        userId: 'test-user-1'
      };
      
      const response = await request(app)
        .post('/api/submissions/score')
        .send(mockSubmission)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      
      // AI scoring can take longer, so we use a more lenient threshold
      expect(responseTime).toBeLessThan(thresholds.responseTime.slow);
      expect(response.body).toHaveProperty('score');
    });
  });

  describe('Caching Performance Tests', () => {
    it('should benefit from caching on repeated requests', async () => {
      // First request (cache miss)
      const firstStartTime = Date.now();
      await request(app).get('/api/tasks').expect(200);
      const firstResponseTime = Date.now() - firstStartTime;
      
      // Second request (cache hit)
      const secondStartTime = Date.now();
      await request(app).get('/api/tasks').expect(200);
      const secondResponseTime = Date.now() - secondStartTime;
      
      // Cached response should be faster
      expect(secondResponseTime).toBeLessThan(firstResponseTime);
      console.log(`Cache performance: First request: ${firstResponseTime}ms, Second request: ${secondResponseTime}ms`);
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle errors gracefully without performance degradation', async () => {
      const startTime = Date.now();
      
      // Make a request that will likely result in an error
      const response = await request(app)
        .get('/api/nonexistent-endpoint')
        .expect(404);
      
      const responseTime = Date.now() - startTime;
      
      // Error responses should still be fast
      expect(responseTime).toBeLessThan(thresholds.responseTime.acceptable);
    });
  });

  describe('Resource Cleanup Tests', () => {
    it('should not leak memory after multiple requests', async () => {
      const initialMemory = process.memoryUsage();
      
      // Make many requests
      for (let i = 0; i < 100; i++) {
        await request(app).get('/api/health');
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
      
      console.log(`Memory after cleanup: ${memoryIncreaseMB.toFixed(2)} MB increase`);
      
      // Memory should not increase excessively
      expect(memoryIncreaseMB).toBeLessThan(50); // Less than 50MB increase
    });
  });
});
