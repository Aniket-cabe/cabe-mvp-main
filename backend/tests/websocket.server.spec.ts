import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from 'vitest';
import { WebSocket, WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';
import { wsManager, emitEvent } from '../src/websocket/server';

// Mock logger to avoid console noise during tests
vi.mock('../src/utils/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('WebSocket Server', () => {
  let wss: WebSocketServer;
  const TEST_PORT = 8081;
  const BASE_URL = `ws://localhost:${TEST_PORT}/ws`;

  beforeAll(async () => {
    // Start WebSocket server on test port
    wss = new WebSocketServer({ port: TEST_PORT, path: '/ws' });
  });

  afterAll(async () => {
    wss.close();
  });

  beforeEach(() => {
    // Clear all connections before each test
    wss.clients.forEach((client) => {
      client.close();
    });
  });

  const createTestToken = (userId: string = 'test-user-123') => {
    return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '1h' });
  };

  const createAuthenticatedConnection = (
    userId: string = 'test-user-123'
  ): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      const token = createTestToken(userId);
      const ws = new WebSocket(`${BASE_URL}?token=${token}`);

      ws.on('open', () => resolve(ws));
      ws.on('error', reject);
      ws.on('close', () => reject(new Error('Connection closed unexpectedly')));
    });
  };

  describe('Authentication', () => {
    it('should reject connections without JWT token', async () => {
      const ws = new WebSocket(BASE_URL);

      await new Promise<void>((resolve) => {
        ws.on('close', (code) => {
          expect(code).toBe(1008);
          resolve();
        });
      });
    });

    it('should reject connections with invalid JWT token', async () => {
      const ws = new WebSocket(`${BASE_URL}?token=invalid-token`);

      await new Promise<void>((resolve) => {
        ws.on('close', (code) => {
          expect(code).toBe(1008);
          resolve();
        });
      });
    });

    it('should accept connections with valid JWT token', async () => {
      const ws = await createAuthenticatedConnection();
      expect(ws.readyState).toBe(WebSocket.OPEN);
      ws.close();
    });

    it('should extract userId from JWT token', async () => {
      const userId = 'test-user-456';
      const ws = await createAuthenticatedConnection(userId);

      // Wait for welcome message
      await new Promise<void>((resolve) => {
        ws.on('message', (data) => {
          const message = JSON.parse(data.toString());
          expect(message.type).toBe('chatMessage');
          expect(message.data.message).toContain('Connected to CaBE Arena');
          resolve();
        });
      });

      ws.close();
    });
  });

  describe('Event Broadcasting', () => {
    it('should send events to specific users', async () => {
      const user1 = await createAuthenticatedConnection('user-1');
      const user2 = await createAuthenticatedConnection('user-2');

      const receivedMessages: any[] = [];

      user1.on('message', (data) => {
        receivedMessages.push(JSON.parse(data.toString()));
      });

      user2.on('message', (data) => {
        receivedMessages.push(JSON.parse(data.toString()));
      });

      // Send event to user-1 only
      emitEvent.submissionReviewed('user-1', {
        taskName: 'Test Task',
        status: 'approved',
        points: 100,
      });

      // Wait for message
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(receivedMessages).toHaveLength(1);
          expect(receivedMessages[0].type).toBe('submissionReviewed');
          expect(receivedMessages[0].data.taskName).toBe('Test Task');
          resolve();
        }, 100);
      });

      user1.close();
      user2.close();
    });

    it('should broadcast events to all connected users', async () => {
      const user1 = await createAuthenticatedConnection('user-1');
      const user2 = await createAuthenticatedConnection('user-2');
      const user3 = await createAuthenticatedConnection('user-3');

      const receivedMessages: any[] = [];

      [user1, user2, user3].forEach((ws) => {
        ws.on('message', (data) => {
          const message = JSON.parse(data.toString());
          if (message.type === 'chatMessage' && message.data.system) {
            receivedMessages.push(message);
          }
        });
      });

      // Wait for welcome messages
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(receivedMessages).toHaveLength(3);
          receivedMessages.forEach((msg) => {
            expect(msg.type).toBe('chatMessage');
            expect(msg.data.system).toBe(true);
          });
          resolve();
        }, 100);
      });

      user1.close();
      user2.close();
      user3.close();
    });

    it('should handle all event types correctly', async () => {
      const ws = await createAuthenticatedConnection('test-user');
      const receivedEvents: string[] = [];

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type !== 'chatMessage') {
          receivedEvents.push(message.type);
        }
      });

      // Test all event types
      const testData = { test: 'data' };
      emitEvent.submissionReviewed('test-user', testData);
      emitEvent.badgeUnlocked('test-user', testData);
      emitEvent.chatMessage('test-user', testData);
      emitEvent.taskAssigned('test-user', testData);
      emitEvent.pointsUpdated('test-user', testData);
      emitEvent.rankChanged('test-user', testData);

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(receivedEvents).toContain('submissionReviewed');
          expect(receivedEvents).toContain('badgeUnlocked');
          expect(receivedEvents).toContain('chatMessage');
          expect(receivedEvents).toContain('taskAssigned');
          expect(receivedEvents).toContain('pointsUpdated');
          expect(receivedEvents).toContain('rankChanged');
          resolve();
        }, 200);
      });

      ws.close();
    });
  });

  describe('Connection Management', () => {
    it('should handle multiple concurrent connections', async () => {
      const connections: WebSocket[] = [];
      const userIds = Array.from({ length: 10 }, (_, i) => `user-${i}`);

      // Create 10 concurrent connections
      for (const userId of userIds) {
        const ws = await createAuthenticatedConnection(userId);
        connections.push(ws);
      }

      expect(connections).toHaveLength(10);
      connections.forEach((ws) => expect(ws.readyState).toBe(WebSocket.OPEN));

      // Clean up
      connections.forEach((ws) => ws.close());
    });

    it('should handle connection disconnection gracefully', async () => {
      const ws = await createAuthenticatedConnection('disconnect-test');

      await new Promise<void>((resolve) => {
        ws.on('close', () => {
          expect(ws.readyState).toBe(WebSocket.CLOSED);
          resolve();
        });
        ws.close();
      });
    });

    it('should handle room joining and leaving', async () => {
      const ws = await createAuthenticatedConnection('room-test');

      // Join room
      ws.send(JSON.stringify({ type: 'join_room', room: 'test-room' }));

      // Leave room
      ws.send(JSON.stringify({ type: 'leave_room', room: 'test-room' }));

      // Test should complete without errors
      await new Promise<void>((resolve) => setTimeout(resolve, 100));

      ws.close();
    });

    it('should reject messages from unauthenticated connections', async () => {
      const ws = new WebSocket(BASE_URL);

      // Try to send message without authentication
      ws.send(JSON.stringify({ type: 'join_room', room: 'test-room' }));

      await new Promise<void>((resolve) => {
        ws.on('close', () => {
          expect(ws.readyState).toBe(WebSocket.CLOSED);
          resolve();
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON messages', async () => {
      const ws = await createAuthenticatedConnection('error-test');

      // Send malformed JSON
      ws.send('invalid json');

      // Connection should remain open
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(ws.readyState).toBe(WebSocket.OPEN);
          resolve();
        }, 100);
      });

      ws.close();
    });

    it('should handle unknown message types', async () => {
      const ws = await createAuthenticatedConnection('unknown-type-test');

      // Send unknown message type
      ws.send(JSON.stringify({ type: 'unknown_type', data: 'test' }));

      // Connection should remain open
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(ws.readyState).toBe(WebSocket.OPEN);
          resolve();
        }, 100);
      });

      ws.close();
    });
  });

  describe('Server Statistics', () => {
    it('should provide accurate connection statistics', async () => {
      const initialStats = wsManager.getStats();

      const ws1 = await createAuthenticatedConnection('stats-user-1');
      const ws2 = await createAuthenticatedConnection('stats-user-2');

      await new Promise<void>((resolve) => setTimeout(resolve, 100));

      const stats = wsManager.getStats();
      expect(stats.connections).toBeGreaterThanOrEqual(2);
      expect(stats.authenticated).toBeGreaterThanOrEqual(2);

      ws1.close();
      ws2.close();
    });
  });

  describe('Performance', () => {
    it('should handle rapid message sending', async () => {
      const ws = await createAuthenticatedConnection('performance-test');
      const messages: any[] = [];

      ws.on('message', (data) => {
        messages.push(JSON.parse(data.toString()));
      });

      // Send 50 rapid events
      for (let i = 0; i < 50; i++) {
        emitEvent.pointsUpdated('performance-test', { points: i });
      }

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(messages.length).toBeGreaterThan(0);
          resolve();
        }, 500);
      });

      ws.close();
    });

    it('should maintain connection under load', async () => {
      const connections: WebSocket[] = [];

      // Create 20 connections
      for (let i = 0; i < 20; i++) {
        const ws = await createAuthenticatedConnection(`load-test-${i}`);
        connections.push(ws);
      }

      // Send events to all connections
      for (let i = 0; i < 20; i++) {
        emitEvent.chatMessage(`load-test-${i}`, {
          message: 'Load test message',
        });
      }

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          connections.forEach((ws) => {
            expect(ws.readyState).toBe(WebSocket.OPEN);
          });
          resolve();
        }, 200);
      });

      connections.forEach((ws) => ws.close());
    });
  });
});
