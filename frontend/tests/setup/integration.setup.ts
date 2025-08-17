import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock environment variables
process.env.VITE_API_URL = 'http://localhost:3000';
process.env.VITE_APP_NAME = 'CaBE Arena Test';

// Mock external dependencies
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>
}));

// Mock API calls with more realistic responses
vi.mock('../src/api/auth', () => ({
  login: vi.fn((credentials) => {
    if (credentials.email === 'test@example.com' && credentials.password === 'password') {
      return Promise.resolve({ 
        success: true, 
        token: 'test-jwt-token',
        user: {
          id: 'test-user-123',
          email: 'test@example.com',
          points: 500,
          rankLevel: 'Bronze'
        }
      });
    } else {
      return Promise.reject(new Error('Invalid credentials'));
    }
  }),
  register: vi.fn((userData) => {
    if (userData.email && userData.password) {
      return Promise.resolve({ 
        success: true, 
        token: 'test-jwt-token',
        user: {
          id: 'new-user-456',
          email: userData.email,
          points: 0,
          rankLevel: 'Bronze'
        }
      });
    } else {
      return Promise.reject(new Error('Invalid user data'));
    }
  }),
  logout: vi.fn(() => Promise.resolve({ success: true })),
  getCurrentUser: vi.fn(() => Promise.resolve({ 
    id: 'test-user-123', 
    email: 'test@example.com',
    points: 500,
    rankLevel: 'Bronze',
    totalSubmissions: 10,
    completedTasks: 8
  }))
}));

vi.mock('../src/api/tasks', () => ({
  fetchTasks: vi.fn((filters = {}) => {
    const mockTasks = [
      {
        id: 'task-1',
        title: 'Build a React Component',
        description: 'Create a reusable React component with TypeScript',
        skill_area: 'fullstack-dev',
        duration: 0.5,
        skill: 0.7,
        complexity: 0.6,
        visibility: 0.8,
        professional_impact: 0.9,
        autonomy: 0.7,
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 'task-2',
        title: 'Implement API Integration',
        description: 'Connect frontend to backend API with error handling',
        skill_area: 'fullstack-dev',
        duration: 0.8,
        skill: 0.9,
        complexity: 0.8,
        visibility: 0.9,
        professional_impact: 0.95,
        autonomy: 0.8,
        created_at: new Date().toISOString(),
        is_active: true
      }
    ];

    if (filters.skill_area) {
      return Promise.resolve(mockTasks.filter(task => task.skill_area === filters.skill_area));
    }

    return Promise.resolve(mockTasks);
  }),
  submitTask: vi.fn((submissionData) => {
    if (submissionData.integrity_checkbox && submissionData.proof) {
      return Promise.resolve({
        success: true,
        submission: {
          id: 'submission-1',
          task_id: submissionData.task_id,
          user_id: 'test-user-123',
          proof: submissionData.proof,
          ai_score: 85,
          points_awarded: 150,
          status: 'completed',
          submitted_at: new Date().toISOString(),
          ai_feedback: 'Good implementation with room for improvement'
        }
      });
    } else {
      return Promise.reject(new Error('Invalid submission data'));
    }
  }),
  fetchLeaderboard: vi.fn(() => Promise.resolve([
    {
      rank: 1,
      id: 'user-1',
      email: 'top@example.com',
      points: 2500,
      rankLevel: 'Silver'
    },
    {
      rank: 2,
      id: 'user-2',
      email: 'second@example.com',
      points: 1800,
      rankLevel: 'Silver'
    }
  ])),
  fetchUserProfile: vi.fn(() => Promise.resolve({
    id: 'test-user-123',
    email: 'test@example.com',
    points: 500,
    rankLevel: 'Bronze',
    rankTitle: 'Bronze Developer',
    totalSubmissions: 10,
    completedTasks: 8,
    averageScore: 82.5
  }))
}));

// Mock WebSocket with realistic behavior
vi.mock('../src/hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    send: vi.fn(),
    lastMessage: {
      type: 'task_update',
      data: { taskId: 'task-1', status: 'completed' }
    },
    readyState: 1,
    connect: vi.fn(),
    disconnect: vi.fn()
  })
}));

// Custom render function with providers
export const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <BrowserRouter>
        {children}
      </BrowserRouter>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Global test setup
beforeAll(async () => {
  // Set up test environment
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
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock window.scrollTo
  Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true
  });

  // Mock fetch for API calls
  global.fetch = vi.fn();
});

afterAll(async () => {
  // Cleanup
  vi.restoreAllMocks();
});

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks();
  
  // Clear localStorage
  localStorage.clear();
  
  // Reset document body
  document.body.innerHTML = '';
  
  // Set up default fetch mock
  (global.fetch as any).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ success: true, data: {} })
  });
});

afterEach(() => {
  // Cleanup after each test
  vi.clearAllTimers();
});
