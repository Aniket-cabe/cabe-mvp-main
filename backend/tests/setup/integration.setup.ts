import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { config } from 'dotenv';
import request from 'supertest';
import { app } from '../../src/app';

// Load test environment variables
config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3002';
  
  // Start test server
  await new Promise<void>((resolve) => {
    const server = app.listen(3002, () => {
      console.log('Test server started on port 3002');
      resolve();
    });
    
    // Store server reference for cleanup
    (global as any).testServer = server;
  });
});

afterAll(async () => {
  // Cleanup test server
  if ((global as any).testServer) {
    await new Promise<void>((resolve) => {
      (global as any).testServer.close(() => {
        console.log('Test server closed');
        resolve();
      });
    });
  }
});

beforeEach(() => {
  // Reset database state if needed
  // This would typically involve clearing test data
});

afterEach(() => {
  // Cleanup after each test
});

// Export test utilities
export const testApp = app;
export const testRequest = request(app);
