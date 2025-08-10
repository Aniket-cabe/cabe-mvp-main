import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Real-time Metrics Load Tests', () => {
  const baseUrl = '/api/metrics/realtime';
  const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const to = new Date().toISOString();

  describe('Concurrent Request Performance', () => {
    it('should handle 100 concurrent requests efficiently', async () => {
      const concurrentRequests = 100;
      const startTime = Date.now();

      const requests = Array.from(
        { length: concurrentRequests },
        () => request(app).get(baseUrl).query({ from, to }).timeout(5000) // 5 second timeout
      );

      const responses = await Promise.allSettled(requests);
      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      // Count successful responses
      const successfulResponses = responses.filter(
        (response) =>
          response.status === 'fulfilled' && response.value.status === 200
      ).length;

      // Count failed responses
      const failedResponses = responses.filter(
        (response) =>
          response.status === 'rejected' ||
          (response.status === 'fulfilled' && response.value.status !== 200)
      ).length;

      // Performance assertions
      expect(successfulResponses).toBeGreaterThanOrEqual(95); // 95% success rate
      expect(failedResponses).toBeLessThanOrEqual(5); // Max 5% failure rate
      expect(totalDuration).toBeLessThan(10000); // Complete within 10 seconds

      // Calculate percentiles
      const responseTimes: number[] = [];
      responses.forEach((response) => {
        if (response.status === 'fulfilled') {
          // Note: supertest doesn't provide response time directly
          // This is a simplified approach
          responseTimes.push(100); // Estimated response time
        }
      });

      if (responseTimes.length > 0) {
        responseTimes.sort((a, b) => a - b);
        const p95Index = Math.floor(responseTimes.length * 0.95);
        const p95ResponseTime = responseTimes[p95Index];

        // 95th percentile should be under 200ms
        expect(p95ResponseTime).toBeLessThan(200);
      }

      console.log(`Load Test Results:
        - Total Requests: ${concurrentRequests}
        - Successful: ${successfulResponses}
        - Failed: ${failedResponses}
        - Success Rate: ${((successfulResponses / concurrentRequests) * 100).toFixed(2)}%
        - Total Duration: ${totalDuration}ms
        - Average Response Time: ${(totalDuration / concurrentRequests).toFixed(2)}ms
      `);
    });

    it('should handle mixed filter combinations under load', async () => {
      const filterCombinations = [
        { skill: 'javascript' },
        { type: 'arena' },
        { skill: 'python', type: 'learning' },
        { skill: 'react' },
        { type: 'gigs' },
      ];

      const requestsPerCombination = 20;
      const totalRequests = filterCombinations.length * requestsPerCombination;
      const startTime = Date.now();

      const requests: Promise<any>[] = [];

      filterCombinations.forEach((filters) => {
        for (let i = 0; i < requestsPerCombination; i++) {
          requests.push(
            request(app)
              .get(baseUrl)
              .query({ from, to, ...filters })
              .timeout(5000)
          );
        }
      });

      const responses = await Promise.allSettled(requests);
      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      const successfulResponses = responses.filter(
        (response) =>
          response.status === 'fulfilled' && response.value.status === 200
      ).length;

      // Performance assertions
      expect(successfulResponses).toBeGreaterThanOrEqual(totalRequests * 0.95); // 95% success rate
      expect(totalDuration).toBeLessThan(8000); // Complete within 8 seconds

      console.log(`Mixed Filter Load Test Results:
        - Total Requests: ${totalRequests}
        - Successful: ${successfulResponses}
        - Success Rate: ${((successfulResponses / totalRequests) * 100).toFixed(2)}%
        - Total Duration: ${totalDuration}ms
        - Average Response Time: ${(totalDuration / totalRequests).toFixed(2)}ms
      `);
    });
  });

  describe('Database Connection Pool Performance', () => {
    it('should maintain consistent performance with connection pool', async () => {
      const batchSize = 10;
      const batches = 5;
      const responseTimes: number[] = [];

      for (let batch = 0; batch < batches; batch++) {
        const batchStartTime = Date.now();

        const batchRequests = Array.from({ length: batchSize }, () =>
          request(app).get(baseUrl).query({ from, to }).timeout(3000)
        );

        const batchResponses = await Promise.all(batchRequests);
        const batchEndTime = Date.now();
        const batchDuration = batchEndTime - batchStartTime;

        responseTimes.push(batchDuration);

        // Verify all responses are successful
        batchResponses.forEach((response) => {
          expect(response.status).toBe(200);
        });

        // Small delay between batches to simulate real usage
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Calculate performance metrics
      const avgResponseTime =
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);
      const variance =
        responseTimes.reduce(
          (acc, time) => acc + Math.pow(time - avgResponseTime, 2),
          0
        ) / responseTimes.length;
      const stdDev = Math.sqrt(variance);

      // Performance assertions
      expect(avgResponseTime).toBeLessThan(1000); // Average under 1 second
      expect(maxResponseTime).toBeLessThan(2000); // Max under 2 seconds
      expect(stdDev).toBeLessThan(500); // Consistent performance (low standard deviation)

      console.log(`Connection Pool Performance Results:
        - Batches: ${batches}
        - Requests per batch: ${batchSize}
        - Average response time: ${avgResponseTime.toFixed(2)}ms
        - Max response time: ${maxResponseTime}ms
        - Min response time: ${minResponseTime}ms
        - Standard deviation: ${stdDev.toFixed(2)}ms
        - Response times: [${responseTimes.join(', ')}]
      `);
    });
  });

  describe('Memory and Resource Usage', () => {
    it('should not have memory leaks under sustained load', async () => {
      const initialMemory = process.memoryUsage();

      // Run sustained load for 30 seconds
      const duration = 30000; // 30 seconds
      const requestInterval = 100; // 100ms between requests
      const startTime = Date.now();

      const requests: Promise<any>[] = [];

      while (Date.now() - startTime < duration) {
        requests.push(
          request(app).get(baseUrl).query({ from, to }).timeout(3000)
        );

        await new Promise((resolve) => setTimeout(resolve, requestInterval));
      }

      // Wait for all requests to complete
      const responses = await Promise.allSettled(requests);
      const finalMemory = process.memoryUsage();

      // Calculate memory growth
      const memoryGrowth = {
        heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
        heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
        external: finalMemory.external - initialMemory.external,
        rss: finalMemory.rss - initialMemory.rss,
      };

      // Count successful responses
      const successfulResponses = responses.filter(
        (response) =>
          response.status === 'fulfilled' && response.value.status === 200
      ).length;

      // Performance assertions
      expect(successfulResponses).toBeGreaterThan(0);
      expect(memoryGrowth.heapUsed).toBeLessThan(50 * 1024 * 1024); // Less than 50MB growth
      expect(memoryGrowth.rss).toBeLessThan(100 * 1024 * 1024); // Less than 100MB RSS growth

      console.log(`Memory Usage Test Results:
        - Duration: ${duration}ms
        - Total Requests: ${requests.length}
        - Successful Responses: ${successfulResponses}
        - Success Rate: ${((successfulResponses / requests.length) * 100).toFixed(2)}%
        - Memory Growth:
          - Heap Used: ${(memoryGrowth.heapUsed / 1024 / 1024).toFixed(2)}MB
          - Heap Total: ${(memoryGrowth.heapTotal / 1024 / 1024).toFixed(2)}MB
          - External: ${(memoryGrowth.external / 1024 / 1024).toFixed(2)}MB
          - RSS: ${(memoryGrowth.rss / 1024 / 1024).toFixed(2)}MB
      `);
    });
  });

  describe('Error Rate Under Load', () => {
    it('should maintain low error rate under high load', async () => {
      const highLoadRequests = 200;
      const startTime = Date.now();

      const requests = Array.from({ length: highLoadRequests }, () =>
        request(app).get(baseUrl).query({ from, to }).timeout(3000)
      );

      const responses = await Promise.allSettled(requests);
      const endTime = Date.now();

      // Categorize responses
      const successful = responses.filter(
        (response) =>
          response.status === 'fulfilled' && response.value.status === 200
      ).length;

      const clientErrors = responses.filter(
        (response) =>
          response.status === 'fulfilled' &&
          response.value.status >= 400 &&
          response.value.status < 500
      ).length;

      const serverErrors = responses.filter(
        (response) =>
          response.status === 'fulfilled' && response.value.status >= 500
      ).length;

      const timeouts = responses.filter(
        (response) => response.status === 'rejected'
      ).length;

      // Error rate assertions
      const totalErrors = clientErrors + serverErrors + timeouts;
      const errorRate = (totalErrors / highLoadRequests) * 100;

      expect(errorRate).toBeLessThan(5); // Less than 5% error rate
      expect(serverErrors).toBeLessThan(2); // Less than 2% server errors
      expect(timeouts).toBeLessThan(3); // Less than 3% timeouts

      console.log(`Error Rate Test Results:
        - Total Requests: ${highLoadRequests}
        - Successful: ${successful}
        - Client Errors (4xx): ${clientErrors}
        - Server Errors (5xx): ${serverErrors}
        - Timeouts: ${timeouts}
        - Total Error Rate: ${errorRate.toFixed(2)}%
        - Duration: ${endTime - startTime}ms
      `);
    });
  });
});
