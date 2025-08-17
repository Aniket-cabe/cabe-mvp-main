import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Performance test utilities
export const performanceTestUtils = {
  // Performance thresholds
  thresholds: {
    responseTime: {
      fast: 100, // ms
      acceptable: 500, // ms
      slow: 1000, // ms
      critical: 3000 // ms
    },
    throughput: {
      min: 100, // requests per second
      target: 500, // requests per second
      max: 1000 // requests per second
    },
    memory: {
      max: 100 * 1024 * 1024, // 100MB
      warning: 50 * 1024 * 1024 // 50MB
    },
    cpu: {
      max: 80, // percentage
      warning: 60 // percentage
    }
  },
  
  // Load test scenarios
  scenarios: {
    light: {
      users: 10,
      duration: 30, // seconds
      rampUp: 10 // seconds
    },
    medium: {
      users: 50,
      duration: 60, // seconds
      rampUp: 20 // seconds
    },
    heavy: {
      users: 100,
      duration: 120, // seconds
      rampUp: 30 // seconds
    },
    stress: {
      users: 200,
      duration: 300, // seconds
      rampUp: 60 // seconds
    }
  },
  
  // Performance metrics
  metrics: {
    responseTimes: [] as number[],
    throughput: 0,
    errorRate: 0,
    memoryUsage: 0,
    cpuUsage: 0
  }
};

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3004';
  
  // Enable performance monitoring
  process.env.ENABLE_PERFORMANCE_MONITORING = 'true';
});

afterAll(async () => {
  // Generate performance report
  console.log('Performance Test Summary:');
  console.log(`Average Response Time: ${performanceTestUtils.metrics.responseTimes.reduce((a, b) => a + b, 0) / performanceTestUtils.metrics.responseTimes.length}ms`);
  console.log(`Throughput: ${performanceTestUtils.metrics.throughput} req/s`);
  console.log(`Error Rate: ${performanceTestUtils.metrics.errorRate}%`);
  console.log(`Memory Usage: ${performanceTestUtils.metrics.memoryUsage}MB`);
  console.log(`CPU Usage: ${performanceTestUtils.metrics.cpuUsage}%`);
});

beforeEach(() => {
  // Reset performance metrics
  performanceTestUtils.metrics.responseTimes = [];
  performanceTestUtils.metrics.throughput = 0;
  performanceTestUtils.metrics.errorRate = 0;
  performanceTestUtils.metrics.memoryUsage = 0;
  performanceTestUtils.metrics.cpuUsage = 0;
});

afterEach(() => {
  // Record metrics after each test
});
