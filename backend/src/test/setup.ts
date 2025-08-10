import { config } from 'dotenv';
import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';

// Load test environment variables
config({ path: '.env.test' });

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3002';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long';
process.env.LOG_LEVEL = 'error';

// Global test setup
beforeAll(async () => {
  // Setup test database or mocks
  console.log('🧪 Setting up test environment...');
});

afterAll(async () => {
  // Cleanup test resources
  console.log('🧹 Cleaning up test environment...');
});

beforeEach(async () => {
  // Reset test state before each test
});

afterEach(async () => {
  // Cleanup after each test
});

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
beforeAll(() => {
  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});
