import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock environment variables
process.env.VITE_API_URL = 'http://localhost:3000';
process.env.VITE_APP_NAME = 'CaBE Arena Test';

// Mock external dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  BrowserRouter: ({ children }: any) => <div>{children}</div>,
  Routes: ({ children }: any) => <div>{children}</div>,
  Route: ({ children }: any) => <div>{children}</div>
}));

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

// Mock API calls
vi.mock('../src/api/auth', () => ({
  login: vi.fn(() => Promise.resolve({ success: true, token: 'test-token' })),
  register: vi.fn(() => Promise.resolve({ success: true, token: 'test-token' })),
  logout: vi.fn(() => Promise.resolve({ success: true })),
  getCurrentUser: vi.fn(() => Promise.resolve({ 
    id: 'test-user-123', 
    email: 'test@example.com',
    points: 500,
    rankLevel: 'Bronze'
  }))
}));

vi.mock('../src/api/tasks', () => ({
  fetchTasks: vi.fn(() => Promise.resolve([
    {
      id: 'task-1',
      title: 'Test Task 1',
      description: 'A test task',
      skill_area: 'fullstack-dev',
      duration: 0.5,
      skill: 0.7,
      complexity: 0.6,
      visibility: 0.8,
      professional_impact: 0.9,
      autonomy: 0.7
    }
  ])),
  submitTask: vi.fn(() => Promise.resolve({
    success: true,
    submission: {
      id: 'submission-1',
      task_id: 'task-1',
      ai_score: 85,
      points_awarded: 150
    }
  }))
}));

// Mock WebSocket
vi.mock('../src/hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    send: vi.fn(),
    lastMessage: null,
    readyState: 1
  })
}));

// Global test setup
beforeAll(async () => {
  // Set up test environment
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
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
});

afterEach(() => {
  // Cleanup after each test
  vi.clearAllTimers();
});
