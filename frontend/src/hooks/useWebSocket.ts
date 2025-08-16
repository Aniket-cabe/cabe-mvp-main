import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from './useAuth';

export type EventType =
  | 'submissionReviewed'
  | 'badgeUnlocked'
  | 'chatMessage'
  | 'taskAssigned'
  | 'pointsUpdated'
  | 'rankChanged';

export interface WebSocketEvent {
  type: EventType;
  data: any;
  timestamp: number;
  userId?: string;
}

export interface WebSocketHandlers {
  submissionReviewed?: (data: any) => void;
  badgeUnlocked?: (data: any) => void;
  chatMessage?: (data: any) => void;
  taskAssigned?: (data: any) => void;
  pointsUpdated?: (data: any) => void;
  rankChanged?: (data: any) => void;
}

interface UseWebSocketOptions {
  url?: string;
  handlers: WebSocketHandlers;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

export function useWebSocket({
  url = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws',
  handlers,
  autoReconnect = true,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
}: UseWebSocketOptions) {
  const { user, token } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
  });

  // Cleanup function
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Connect function
  const connect = useCallback(() => {
    if (!token || !user) {
      console.warn('🔒 No auth token available for WebSocket connection');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('🔗 WebSocket already connected');
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Create WebSocket connection with JWT token
      const wsUrl = `${url}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0,
        }));
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketEvent = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', message);

          // Handle the event based on type
          const handler = (handlers as any)[message.type];
          if (handler) {
            handler(message.data);
          } else {
            console.warn(`⚠️ No handler for event type: ${message.type}`);
          }
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));

        // Auto-reconnect logic
        if (
          autoReconnect &&
          event.code !== 1000 &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current++;
          setState((prev) => ({
            ...prev,
            reconnectAttempts: reconnectAttemptsRef.current,
          }));

          console.log(
            `🔄 Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`
          );

          reconnectTimeoutRef.current = setTimeout(
            () => {
              connect();
            },
            reconnectInterval * Math.pow(2, reconnectAttemptsRef.current - 1)
          ); // Exponential backoff
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setState((prev) => ({
          ...prev,
          error: 'Connection failed',
          isConnecting: false,
        }));
      };
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to connect',
        isConnecting: false,
      }));
    }
  }, [
    url,
    token,
    user,
    handlers,
    autoReconnect,
    reconnectInterval,
    maxReconnectAttempts,
  ]);

  // Disconnect function
  const disconnect = useCallback(() => {
    cleanup();
    setState((prev) => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      error: null,
      reconnectAttempts: 0,
    }));
    reconnectAttemptsRef.current = 0;
  }, [cleanup]);

  // Send message function
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
      return false;
    }
  }, []);

  // Join room function
  const joinRoom = useCallback(
    (room: string) => {
      return sendMessage({ type: 'join_room', room });
    },
    [sendMessage]
  );

  // Leave room function
  const leaveRoom = useCallback(
    (room: string) => {
      return sendMessage({ type: 'leave_room', room });
    },
    [sendMessage]
  );

  // Connect on mount and when token changes
  useEffect(() => {
    if (token && user) {
      connect();
    }

    return () => {
      cleanup();
    };
  }, [token, user, connect, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    // State
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    error: state.error,
    reconnectAttempts: state.reconnectAttempts,

    // Actions
    connect,
    disconnect,
    sendMessage,
    joinRoom,
    leaveRoom,

    // WebSocket instance (for advanced usage)
    ws: wsRef.current,
  };
}

// Hook for specific event types
export function useWebSocketEvent<T = any>(
  eventType: EventType,
  handler: (data: T) => void
) {
  const { sendMessage } = useWebSocket({
    handlers: {
      [eventType]: handler,
    },
  });

  return { sendMessage };
}

// Hook for submission review notifications
export function useSubmissionNotifications() {
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      taskName: string;
      status: 'approved' | 'rejected' | 'pending';
      timestamp: number;
      message: string;
    }>
  >([]);

  const handleSubmissionReviewed = useCallback((data: any) => {
    const notification = {
      id: `submission-${Date.now()}`,
      taskName: data.taskName || 'Unknown Task',
      status: data.status,
      timestamp: Date.now(),
      message:
        data.status === 'approved'
          ? `🎉 Your submission for "${data.taskName}" was approved! +${data.points} points`
          : data.status === 'rejected'
            ? `❌ Your submission for "${data.taskName}" was rejected. ${data.reason || 'Please try again.'}`
            : `⏳ Your submission for "${data.taskName}" is under review...`,
    };

    setNotifications((prev) => [notification, ...prev.slice(0, 9)]); // Keep last 10
  }, []);

  useWebSocket({
    handlers: {
      submissionReviewed: handleSubmissionReviewed,
    },
  });

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    clearNotification,
    clearAll,
  };
}

// Hook for badge unlock notifications
export function useBadgeNotifications() {
  const [unlockedBadges, setUnlockedBadges] = useState<
    Array<{
      id: string;
      badgeName: string;
      badgeIcon: string;
      timestamp: number;
    }>
  >([]);

  const handleBadgeUnlocked = useCallback((data: any) => {
    const badge = {
      id: `badge-${Date.now()}`,
      badgeName: data.badgeName || 'Unknown Badge',
      badgeIcon: data.badgeIcon || '🏆',
      timestamp: Date.now(),
    };

    setUnlockedBadges((prev) => [badge, ...prev.slice(0, 4)]); // Keep last 5
  }, []);

  useWebSocket({
    handlers: {
      badgeUnlocked: handleBadgeUnlocked,
    },
  });

  const clearBadge = useCallback((id: string) => {
    setUnlockedBadges((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return {
    unlockedBadges,
    clearBadge,
  };
}

export default useWebSocket;
