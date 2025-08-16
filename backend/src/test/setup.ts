import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Test database client
export const testSupabase = createClient(
  process.env.SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-key'
);

// Test utilities
export const testUtils = {
  // Clean up test data
  async cleanupTestData() {
    const tables = [
      'user_suspensions',
      'admin_audit_log',
      'generated_tasks',
      'task_templates',
      'cabot_credit_refills',
      'cabot_usage',
      'referrals',
      'utm_shares',
      'user_achievements',
      'achievements',
      'leaderboard',
      'point_decay_history',
      'points_history',
      'submissions',
      'tasks',
      'users'
    ];

    for (const table of tables) {
      try {
        await testSupabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (error) {
        // Ignore errors for non-existent tables
      }
    }
  },

  // Create test user
  async createTestUser(overrides: any = {}) {
    const testUser = {
      id: 'test-user-' + Date.now(),
      email: `test-${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      full_name: 'Test User',
      avatar_url: null,
      skill_level: 'beginner',
      points: 0,
      rank: 'Bronze',
      created_at: new Date().toISOString(),
      ...overrides
    };

    const { data, error } = await testSupabase
      .from('users')
      .insert(testUser)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create test task
  async createTestTask(overrides: any = {}) {
    const testTask = {
      id: 'test-task-' + Date.now(),
      title: 'Test Task',
      description: 'A test task for testing',
      difficulty: 'beginner',
              skill_area: 'ai-ml',
      points_reward: 10,
      time_limit: 30,
      created_at: new Date().toISOString(),
      ...overrides
    };

    const { data, error } = await testSupabase
      .from('tasks')
      .insert(testTask)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create test submission
  async createTestSubmission(overrides: any = {}) {
    const testSubmission = {
      id: 'test-submission-' + Date.now(),
      user_id: overrides.user_id || 'test-user-id',
      task_id: overrides.task_id || 'test-task-id',
      code: 'console.log("Hello World");',
      score: 75,
      status: 'completed',
      submitted_at: new Date().toISOString(),
      ...overrides
    };

    const { data, error } = await testSupabase
      .from('submissions')
      .insert(testSubmission)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Generate JWT token for testing
  generateTestToken(userId: string) {
    // This is a simplified token for testing
    return `test-token-${userId}-${Date.now()}`;
  }
};

// Global test setup
beforeAll(async () => {
  console.log('🧪 Setting up test environment...');
  
  // Verify test database connection
  try {
    const { data, error } = await testSupabase.from('users').select('count').limit(1);
    if (error) {
      console.warn('⚠️ Test database connection issue:', error.message);
    } else {
      console.log('✅ Test database connected successfully');
    }
  } catch (error) {
    console.warn('⚠️ Could not verify test database connection');
  }
});

// Global test cleanup
afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
  await testUtils.cleanupTestData();
});

// Per-test setup
beforeEach(async () => {
  // Clean up any test data from previous tests
  await testUtils.cleanupTestData();
});

// Per-test cleanup
afterEach(async () => {
  // Clean up test data after each test
  await testUtils.cleanupTestData();
});

// Mock external services
export const mockExternalServices = {
  // Mock OpenRouter API
  openRouter: {
    generate: vi.fn().mockResolvedValue({
      choices: [{ message: { content: 'Mocked AI response' } }]
    }),
    score: vi.fn().mockResolvedValue(75)
  },

  // Mock Slack notifications
  slack: {
    sendNotification: vi.fn().mockResolvedValue(true)
  },

  // Mock email service
  email: {
    sendEmail: vi.fn().mockResolvedValue(true)
  }
};

// Test constants
export const TEST_CONSTANTS = {
  VALID_USER_ID: 'test-user-123',
  VALID_TASK_ID: 'test-task-123',
  VALID_SUBMISSION_ID: 'test-submission-123',
  TEST_EMAIL: 'test@example.com',
  TEST_USERNAME: 'testuser',
  TEST_PASSWORD: 'TestPassword123!'
};
