import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useWebSocket,
  useSubmissionNotifications,
  useBadgeNotifications,
} from '../src/hooks/useWebSocket';

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

// Mock useAuth hook
vi.mock('../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-123', email: 'test@example.com' },
    token: 'mock-jwt-token',
  }),
}));

// Mock WebSocket constructor
global.WebSocket = vi.fn(() => mockWebSocket) as any;

describe('useWebSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWebSocket.readyState = 1; // OPEN
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Connection Management', () => {
    it('should connect to WebSocket with JWT token', () => {
      const handlers = {
        submissionReviewed: vi.fn(),
        badgeUnlocked: vi.fn(),
      };

      renderHook(() => useWebSocket({ handlers }));

      expect(global.WebSocket).toHaveBeenCalledWith(
        'ws://localhost:8080/ws?token=mock-jwt-token'
      );
    });

    it('should not connect without auth token', () => {
      // Mock useAuth to return no token
      vi.mocked(require('../src/hooks/useAuth').useAuth).mockReturnValue({
        user: null,
        token: null,
      });

      const handlers = { submissionReviewed: vi.fn() };
      renderHook(() => useWebSocket({ handlers }));

      expect(global.WebSocket).not.toHaveBeenCalled();
    });

    it('should handle connection open event', () => {
      const handlers = { submissionReviewed: vi.fn() };
      const { result } = renderHook(() => useWebSocket({ handlers }));

      // Simulate connection open
      act(() => {
        mockWebSocket.onopen?.();
      });

      expect(result.current.isConnected).toBe(true);
      expect(result.current.isConnecting).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle connection error', () => {
      const handlers = { submissionReviewed: vi.fn() };
      const { result } = renderHook(() => useWebSocket({ handlers }));

      // Simulate connection error
      act(() => {
        mockWebSocket.onerror?.(new Error('Connection failed'));
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.isConnecting).toBe(false);
      expect(result.current.error).toBe('Connection failed');
    });

    it('should handle connection close', () => {
      const handlers = { submissionReviewed: vi.fn() };
      const { result } = renderHook(() => useWebSocket({ handlers }));

      // First connect
      act(() => {
        mockWebSocket.onopen?.();
      });

      // Then close
      act(() => {
        mockWebSocket.onclose?.({ code: 1000, reason: 'Normal closure' });
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.isConnecting).toBe(false);
    });
  });

  describe('Message Handling', () => {
    it('should handle incoming messages and call appropriate handlers', () => {
      const submissionHandler = vi.fn();
      const badgeHandler = vi.fn();

      const handlers = {
        submissionReviewed: submissionHandler,
        badgeUnlocked: badgeHandler,
      };

      renderHook(() => useWebSocket({ handlers }));

      // Simulate incoming message
      act(() => {
        mockWebSocket.onmessage?.({
          data: JSON.stringify({
            type: 'submissionReviewed',
            data: { taskName: 'Test Task', status: 'approved' },
            timestamp: Date.now(),
          }),
        });
      });

      expect(submissionHandler).toHaveBeenCalledWith({
        taskName: 'Test Task',
        status: 'approved',
      });
      expect(badgeHandler).not.toHaveBeenCalled();
    });

    it('should handle malformed JSON messages gracefully', () => {
      const handlers = { submissionReviewed: vi.fn() };
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      renderHook(() => useWebSocket({ handlers }));

      // Simulate malformed message
      act(() => {
        mockWebSocket.onmessage?.({ data: 'invalid json' });
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ Failed to parse WebSocket message:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should warn about unknown message types', () => {
      const handlers = { submissionReviewed: vi.fn() };
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      renderHook(() => useWebSocket({ handlers }));

      // Simulate unknown message type
      act(() => {
        mockWebSocket.onmessage?.({
          data: JSON.stringify({
            type: 'unknownType',
            data: { test: 'data' },
            timestamp: Date.now(),
          }),
        });
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '⚠️ No handler for event type: unknownType'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Reconnection Logic', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should attempt reconnection on connection close', () => {
      const handlers = { submissionReviewed: vi.fn() };
      const { result } = renderHook(() =>
        useWebSocket({
          handlers,
          autoReconnect: true,
          maxReconnectAttempts: 3,
        })
      );

      // Initial connection
      act(() => {
        mockWebSocket.onopen?.();
      });

      // Close connection (not normal closure)
      act(() => {
        mockWebSocket.onclose?.({ code: 1006, reason: 'Abnormal closure' });
      });

      expect(result.current.reconnectAttempts).toBe(1);

      // Fast-forward time to trigger reconnection
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Should attempt to reconnect
      expect(global.WebSocket).toHaveBeenCalledTimes(2);
    });

    it('should stop reconnecting after max attempts', () => {
      const handlers = { submissionReviewed: vi.fn() };
      const { result } = renderHook(() =>
        useWebSocket({
          handlers,
          autoReconnect: true,
          maxReconnectAttempts: 2,
        })
      );

      // Initial connection
      act(() => {
        mockWebSocket.onopen?.();
      });

      // First reconnection attempt
      act(() => {
        mockWebSocket.onclose?.({ code: 1006, reason: 'Abnormal closure' });
        vi.advanceTimersByTime(3000);
      });

      // Second reconnection attempt
      act(() => {
        mockWebSocket.onclose?.({ code: 1006, reason: 'Abnormal closure' });
        vi.advanceTimersByTime(6000);
      });

      // Third attempt should not happen
      act(() => {
        mockWebSocket.onclose?.({ code: 1006, reason: 'Abnormal closure' });
        vi.advanceTimersByTime(12000);
      });

      expect(result.current.reconnectAttempts).toBe(2);
      expect(global.WebSocket).toHaveBeenCalledTimes(3); // Initial + 2 attempts
    });

    it('should not reconnect on normal closure', () => {
      const handlers = { submissionReviewed: vi.fn() };
      renderHook(() => useWebSocket({ handlers, autoReconnect: true }));

      // Initial connection
      act(() => {
        mockWebSocket.onopen?.();
      });

      // Normal closure
      act(() => {
        mockWebSocket.onclose?.({ code: 1000, reason: 'Normal closure' });
        vi.advanceTimersByTime(3000);
      });

      expect(global.WebSocket).toHaveBeenCalledTimes(1); // Only initial connection
    });
  });

  describe('Message Sending', () => {
    it('should send messages when connected', () => {
      const handlers = { submissionReviewed: vi.fn() };
      const { result } = renderHook(() => useWebSocket({ handlers }));

      // Connect first
      act(() => {
        mockWebSocket.onopen?.();
      });

      // Send message
      act(() => {
        const success = result.current.sendMessage({
          type: 'test',
          data: 'test',
        });
        expect(success).toBe(true);
      });

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'test', data: 'test' })
      );
    });

    it('should not send messages when disconnected', () => {
      const handlers = { submissionReviewed: vi.fn() };
      const { result } = renderHook(() => useWebSocket({ handlers }));

      // Don't connect, try to send message
      act(() => {
        const success = result.current.sendMessage({
          type: 'test',
          data: 'test',
        });
        expect(success).toBe(false);
      });

      expect(mockWebSocket.send).not.toHaveBeenCalled();
    });

    it('should handle room operations', () => {
      const handlers = { submissionReviewed: vi.fn() };
      const { result } = renderHook(() => useWebSocket({ handlers }));

      // Connect first
      act(() => {
        mockWebSocket.onopen?.();
      });

      // Join room
      act(() => {
        result.current.joinRoom('test-room');
      });

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'join_room', room: 'test-room' })
      );

      // Leave room
      act(() => {
        result.current.leaveRoom('test-room');
      });

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'leave_room', room: 'test-room' })
      );
    });
  });

  describe('Cleanup', () => {
    it('should cleanup on unmount', () => {
      const handlers = { submissionReviewed: vi.fn() };
      const { unmount } = renderHook(() => useWebSocket({ handlers }));

      // Connect first
      act(() => {
        mockWebSocket.onopen?.();
      });

      // Unmount
      unmount();

      expect(mockWebSocket.close).toHaveBeenCalled();
    });
  });
});

describe('useSubmissionNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWebSocket.readyState = 1;
  });

  it('should handle submission review notifications', () => {
    const { result } = renderHook(() => useSubmissionNotifications());

    // Simulate submission reviewed event
    act(() => {
      mockWebSocket.onmessage?.({
        data: JSON.stringify({
          type: 'submissionReviewed',
          data: {
            taskName: 'Test Task',
            status: 'approved',
            points: 100,
          },
          timestamp: Date.now(),
        }),
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].taskName).toBe('Test Task');
    expect(result.current.notifications[0].status).toBe('approved');
  });

  it('should limit notifications to 10 items', () => {
    const { result } = renderHook(() => useSubmissionNotifications());

    // Add 12 notifications
    for (let i = 0; i < 12; i++) {
      act(() => {
        mockWebSocket.onmessage?.({
          data: JSON.stringify({
            type: 'submissionReviewed',
            data: {
              taskName: `Task ${i}`,
              status: 'approved',
              points: 100,
            },
            timestamp: Date.now(),
          }),
        });
      });
    }

    expect(result.current.notifications).toHaveLength(10);
    expect(result.current.notifications[0].taskName).toBe('Task 11'); // Latest first
  });

  it('should clear notifications', () => {
    const { result } = renderHook(() => useSubmissionNotifications());

    // Add a notification
    act(() => {
      mockWebSocket.onmessage?.({
        data: JSON.stringify({
          type: 'submissionReviewed',
          data: {
            taskName: 'Test Task',
            status: 'approved',
            points: 100,
          },
          timestamp: Date.now(),
        }),
      });
    });

    expect(result.current.notifications).toHaveLength(1);

    // Clear specific notification
    act(() => {
      result.current.clearNotification(result.current.notifications[0].id);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('should clear all notifications', () => {
    const { result } = renderHook(() => useSubmissionNotifications());

    // Add multiple notifications
    for (let i = 0; i < 3; i++) {
      act(() => {
        mockWebSocket.onmessage?.({
          data: JSON.stringify({
            type: 'submissionReviewed',
            data: {
              taskName: `Task ${i}`,
              status: 'approved',
              points: 100,
            },
            timestamp: Date.now(),
          }),
        });
      });
    }

    expect(result.current.notifications).toHaveLength(3);

    // Clear all
    act(() => {
      result.current.clearAll();
    });

    expect(result.current.notifications).toHaveLength(0);
  });
});

describe('useBadgeNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWebSocket.readyState = 1;
  });

  it('should handle badge unlock notifications', () => {
    const { result } = renderHook(() => useBadgeNotifications());

    // Simulate badge unlocked event
    act(() => {
      mockWebSocket.onmessage?.({
        data: JSON.stringify({
          type: 'badgeUnlocked',
          data: {
            badgeName: 'First Win',
            badgeIcon: '🏆',
          },
          timestamp: Date.now(),
        }),
      });
    });

    expect(result.current.unlockedBadges).toHaveLength(1);
    expect(result.current.unlockedBadges[0].badgeName).toBe('First Win');
    expect(result.current.unlockedBadges[0].badgeIcon).toBe('🏆');
  });

  it('should limit badges to 5 items', () => {
    const { result } = renderHook(() => useBadgeNotifications());

    // Add 7 badges
    for (let i = 0; i < 7; i++) {
      act(() => {
        mockWebSocket.onmessage?.({
          data: JSON.stringify({
            type: 'badgeUnlocked',
            data: {
              badgeName: `Badge ${i}`,
              badgeIcon: '🏆',
            },
            timestamp: Date.now(),
          }),
        });
      });
    }

    expect(result.current.unlockedBadges).toHaveLength(5);
    expect(result.current.unlockedBadges[0].badgeName).toBe('Badge 6'); // Latest first
  });

  it('should clear specific badges', () => {
    const { result } = renderHook(() => useBadgeNotifications());

    // Add a badge
    act(() => {
      mockWebSocket.onmessage?.({
        data: JSON.stringify({
          type: 'badgeUnlocked',
          data: {
            badgeName: 'Test Badge',
            badgeIcon: '🏆',
          },
          timestamp: Date.now(),
        }),
      });
    });

    expect(result.current.unlockedBadges).toHaveLength(1);

    // Clear specific badge
    act(() => {
      result.current.clearBadge(result.current.unlockedBadges[0].id);
    });

    expect(result.current.unlockedBadges).toHaveLength(0);
  });
});
