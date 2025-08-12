import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';

// Mock environment variables
vi.stubEnv('VITE_API_URL', 'http://localhost:3001');
vi.stubEnv('VITE_APP_NAME', 'CaBE Arena Test');

// Mock external services
vi.mock('../services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn()
  }
}));

vi.mock('../services/auth', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    getCurrentUser: vi.fn(),
    updateProfile: vi.fn()
  }
}));

vi.mock('../services/tasks', () => ({
  taskService: {
    getTasks: vi.fn(),
    getTask: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    submitTask: vi.fn(),
    generateTasks: vi.fn(),
    getTaskLeaderboard: vi.fn()
  }
}));

vi.mock('../services/ai', () => ({
  aiService: {
    generateResponse: vi.fn(),
    scoreSubmission: vi.fn(),
    analyzeCode: vi.fn(),
    generateTask: vi.fn()
  }
}));

vi.mock('../services/analytics', () => ({
  analyticsService: {
    trackEvent: vi.fn(),
    trackPageView: vi.fn(),
    trackUserAction: vi.fn(),
    getAnalytics: vi.fn()
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock fetch
global.fetch = vi.fn();

// Test utilities
export const testUtils = {
  // Create test user data
  createTestUser(overrides: any = {}) {
    return {
      id: 'test-user-123',
      email: 'test@example.com',
      username: 'testuser',
      full_name: 'Test User',
      avatar_url: null,
      skill_level: 'beginner',
      points: 100,
      rank: 'Bronze',
      created_at: '2024-01-01T00:00:00Z',
      ...overrides
    };
  },

  // Create test task data
  createTestTask(overrides: any = {}) {
    return {
      id: 'test-task-123',
      title: 'Test Task',
      description: 'A test task for testing',
      difficulty: 'beginner',
              skill_area: 'ai-ml',
      points_reward: 10,
      time_limit: 30,
      created_at: '2024-01-01T00:00:00Z',
      ...overrides
    };
  },

  // Create test submission data
  createTestSubmission(overrides: any = {}) {
    return {
      id: 'test-submission-123',
      user_id: 'test-user-123',
      task_id: 'test-task-123',
      code: 'console.log("Hello World");',
      score: 75,
      status: 'completed',
      submitted_at: '2024-01-01T00:00:00Z',
      ...overrides
    };
  },

  // Create test achievement data
  createTestAchievement(overrides: any = {}) {
    return {
      id: 'test-achievement-123',
      name: 'Test Achievement',
      description: 'A test achievement',
      icon: '🏆',
      points_reward: 50,
      category: 'milestone',
      ...overrides
    };
  },

  // Mock API responses
  mockApiResponse(data: any, status = 200) {
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data))
    });
  },

  // Mock API error
  mockApiError(message: string, status = 400) {
    return Promise.resolve({
      ok: false,
      status,
      json: () => Promise.resolve({ error: message }),
      text: () => Promise.resolve(JSON.stringify({ error: message }))
    });
  },

  // Wait for async operations
  waitFor(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Mock router navigation
  mockNavigate: vi.fn(),

  // Mock router location
  mockLocation: {
    pathname: '/',
    search: '',
    hash: '',
    state: null
  }
};

// Custom render function with providers
export const renderWithProviders = (
  ui: React.ReactElement,
  {
    initialAuthState = null,
    initialTheme = 'light',
    ...renderOptions
  } = {}
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity
      },
      mutations: {
        retry: false
      }
    }
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider initialTheme={initialTheme}>
          <AuthProvider initialUser={initialAuthState}>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient
  };
};

// Test constants
export const TEST_CONSTANTS = {
  VALID_USER_ID: 'test-user-123',
  VALID_TASK_ID: 'test-task-123',
  VALID_SUBMISSION_ID: 'test-submission-123',
  TEST_EMAIL: 'test@example.com',
  TEST_USERNAME: 'testuser',
  TEST_PASSWORD: 'TestPassword123!',
  API_BASE_URL: 'http://localhost:3001'
};

// Mock data factories
export const mockData = {
  users: {
    current: testUtils.createTestUser(),
    admin: testUtils.createTestUser({
      id: 'admin-user-123',
      email: 'admin@example.com',
      username: 'admin',
      role: 'admin'
    }),
    premium: testUtils.createTestUser({
      id: 'premium-user-123',
      email: 'premium@example.com',
      username: 'premium',
      rank: 'Gold',
      points: 5000
    })
  },

  tasks: {
    beginner: testUtils.createTestTask({
      id: 'beginner-task-123',
      title: 'Beginner Task',
      difficulty: 'beginner',
      points_reward: 10
    }),
    intermediate: testUtils.createTestTask({
      id: 'intermediate-task-123',
      title: 'Intermediate Task',
      difficulty: 'intermediate',
      points_reward: 25
    }),
    expert: testUtils.createTestTask({
      id: 'expert-task-123',
      title: 'Expert Task',
      difficulty: 'expert',
      points_reward: 50
    })
  },

  submissions: {
    completed: testUtils.createTestSubmission({
      id: 'completed-submission-123',
      status: 'completed',
      score: 85
    }),
    pending: testUtils.createTestSubmission({
      id: 'pending-submission-123',
      status: 'pending',
      score: null
    }),
    failed: testUtils.createTestSubmission({
      id: 'failed-submission-123',
      status: 'failed',
      score: 30
    })
  },

  achievements: {
    milestone: testUtils.createTestAchievement({
      id: 'milestone-achievement-123',
      name: 'First Task',
      category: 'milestone'
    }),
    streak: testUtils.createTestAchievement({
      id: 'streak-achievement-123',
      name: '7 Day Streak',
      category: 'streak'
    }),
    special: testUtils.createTestAchievement({
      id: 'special-achievement-123',
      name: 'Perfect Score',
      category: 'special'
    })
  }
};

// Global test setup
beforeAll(() => {
  console.log('🧪 Setting up frontend test environment...');
});

// Global test cleanup
afterAll(() => {
  console.log('🧹 Cleaning up frontend test environment...');
});

// Per-test cleanup
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
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
