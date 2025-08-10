import { useState, useEffect, useCallback, useRef } from 'react';
import type { ModerationType, UseModerationReturn } from '../types';

// Mock WebSocket for development
class WebSocketMock {
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private intervalId: NodeJS.Timeout | null = null;

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  // Simulate random moderation events
  startRandomEvents() {
    this.intervalId = setInterval(() => {
      const types: ModerationType[] = [
        'review_pending',
        'suspicious',
        'rejected',
      ];
      const randomType = types[Math.floor(Math.random() * types.length)];

      // Only trigger occasionally (10% chance every 30 seconds)
      if (Math.random() < 0.1) {
        this.emit('moderation:update', { type: randomType });
      }
    }, 30000); // Check every 30 seconds
  }

  stopRandomEvents() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  disconnect() {
    this.stopRandomEvents();
    this.listeners.clear();
  }
}

export function useModeration(): UseModerationReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<ModerationType | null>(null);
  const wsRef = useRef<WebSocketMock | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket mock
  useEffect(() => {
    wsRef.current = new WebSocketMock();

    // Listen for moderation updates
    wsRef.current.on('moderation:update', (data: { type: ModerationType }) => {
      openModal(data.type);
    });

    // Start random events in development
    if (process.env.NODE_ENV === 'development') {
      wsRef.current.startRandomEvents();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const openModal = useCallback((modalType: ModerationType) => {
    setType(modalType);
    setIsOpen(true);

    // Auto-close for review_pending and suspicious after timeout
    if (modalType === 'review_pending' || modalType === 'suspicious') {
      const timeout = modalType === 'review_pending' ? 8000 : 12000; // 8s for pending, 12s for suspicious
      timeoutRef.current = setTimeout(() => {
        closeModal();
      }, timeout);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setType(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const triggerRandomModeration = useCallback(() => {
    const types: ModerationType[] = [
      'review_pending',
      'suspicious',
      'rejected',
    ];
    const randomType = types[Math.floor(Math.random() * types.length)];
    openModal(randomType);
  }, [openModal]);

  return {
    isOpen,
    type,
    openModal,
    closeModal,
    triggerRandomModeration,
  };
}
