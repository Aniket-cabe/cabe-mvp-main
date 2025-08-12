import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWebSocket } from '../src/hooks/useWebSocket';

// Mock useAuth hook
vi.mock('../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-123', email: 'test@example.com' },
    token: 'mock-jwt-token',
  }),
}));

// Mock WebSocket
const mockWebSocket = {
  readyState: 1, // OPEN
  send: vi.fn(),
  close: vi.fn(),
  onopen: null as any,
  onmessage: null as any,
  onclose: null as any,
  onerror: null as any,
};

// Mock WebSocket constructor
global.WebSocket = vi.fn(() => mockWebSocket) as any;

describe('useWebSocket', () => {
  it('should render without errors', () => {
    const handlers = {
      submissionReviewed: vi.fn(),
      badgeUnlocked: vi.fn(),
    };

    const { result } = renderHook(() => useWebSocket({ handlers }));

    expect(result.current).toBeDefined();
    expect(typeof result.current.sendMessage).toBe('function');
    expect(typeof result.current.joinRoom).toBe('function');
    expect(typeof result.current.leaveRoom).toBe('function');
  });

  it('should have initial state', () => {
    const handlers = {
      submissionReviewed: vi.fn(),
    };

    const { result } = renderHook(() => useWebSocket({ handlers }));

    expect(result.current.isConnected).toBeDefined();
    expect(result.current.isConnecting).toBeDefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.reconnectAttempts).toBeDefined();
  });
});
