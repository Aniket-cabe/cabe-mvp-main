import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocket } from 'ws';
import {
  CollaborationServer,
  initializeCollaborationServer,
} from '../src/websocket/collab.server';
import jwt from 'jsonwebtoken';

// Mock WebSocket
class MockWebSocket {
  readyState = WebSocket.OPEN;
  send = vi.fn();
  close = vi.fn();
  on = vi.fn();
  emit = vi.fn();
}

// Mock WebSocketServer
class MockWebSocketServer {
  on = vi.fn();
  close = vi.fn();
}

vi.mock('ws', () => ({
  WebSocket: MockWebSocket,
  WebSocketServer: MockWebSocketServer,
}));

vi.mock('../utils/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Collaboration Server', () => {
  let server: CollaborationServer;
  let mockWs: MockWebSocket;

  beforeEach(() => {
    vi.clearAllMocks();
    server = new CollaborationServer(8081);
    mockWs = new MockWebSocket();
  });

  afterEach(() => {
    server.close();
  });

  describe('Server Initialization', () => {
    it('should initialize with correct port', () => {
      expect(server).toBeInstanceOf(CollaborationServer);
    });

    it('should return singleton instance', () => {
      const server1 = initializeCollaborationServer(8081);
      const server2 = initializeCollaborationServer(8082);
      expect(server1).toBe(server2);
    });
  });

  describe('User Authentication', () => {
    it('should authenticate valid JWT token', async () => {
      const token = jwt.sign(
        { userId: 'user123', username: 'testuser' },
        process.env.JWT_SECRET || 'test-secret'
      );

      const message = {
        type: 'join_room',
        roomId: 'room1',
        token,
      };

      // Simulate connection
      const connectionHandler = vi.mocked(server['wss'].on).mock.calls[0][1];
      connectionHandler(mockWs);

      // Simulate message
      const messageHandler = mockWs.on.mock.calls.find(
        (call) => call[0] === 'message'
      )?.[1];
      if (messageHandler) {
        messageHandler(Buffer.from(JSON.stringify(message)));
      }

      // Check if user was added to room
      const stats = server.getStats();
      expect(stats.totalUsers).toBe(1);
    });

    it('should reject invalid JWT token', async () => {
      const message = {
        type: 'join_room',
        roomId: 'room1',
        token: 'invalid-token',
      };

      // Simulate connection
      const connectionHandler = vi.mocked(server['wss'].on).mock.calls[0][1];
      connectionHandler(mockWs);

      // Simulate message
      const messageHandler = mockWs.on.mock.calls.find(
        (call) => call[0] === 'message'
      )?.[1];
      if (messageHandler) {
        messageHandler(Buffer.from(JSON.stringify(message)));
      }

      // Check that no user was added
      const stats = server.getStats();
      expect(stats.totalUsers).toBe(0);
    });
  });

  describe('Room Management', () => {
    it('should create room when first user joins', async () => {
      const token = jwt.sign(
        { userId: 'user123', username: 'testuser' },
        process.env.JWT_SECRET || 'test-secret'
      );

      const message = {
        type: 'join_room',
        roomId: 'new-room',
        token,
      };

      // Simulate connection and join
      const connectionHandler = vi.mocked(server['wss'].on).mock.calls[0][1];
      connectionHandler(mockWs);

      const messageHandler = mockWs.on.mock.calls.find(
        (call) => call[0] === 'message'
      )?.[1];
      if (messageHandler) {
        messageHandler(Buffer.from(JSON.stringify(message)));
      }

      const stats = server.getStats();
      expect(stats.totalRooms).toBe(1);
    });

    it('should remove empty room when last user leaves', async () => {
      const token = jwt.sign(
        { userId: 'user123', username: 'testuser' },
        process.env.JWT_SECRET || 'test-secret'
      );

      const message = {
        type: 'join_room',
        roomId: 'temp-room',
        token,
      };

      // Join room
      const connectionHandler = vi.mocked(server['wss'].on).mock.calls[0][1];
      connectionHandler(mockWs);

      const messageHandler = mockWs.on.mock.calls.find(
        (call) => call[0] === 'message'
      )?.[1];
      if (messageHandler) {
        messageHandler(Buffer.from(JSON.stringify(message)));
      }

      // Simulate disconnect
      const closeHandler = mockWs.on.mock.calls.find(
        (call) => call[0] === 'close'
      )?.[1];
      if (closeHandler) {
        closeHandler();
      }

      const stats = server.getStats();
      expect(stats.totalRooms).toBe(0);
    });
  });

  describe('Chat Messages', () => {
    it('should broadcast chat messages to room', async () => {
      const token = jwt.sign(
        { userId: 'user123', username: 'testuser' },
        process.env.JWT_SECRET || 'test-secret'
      );

      // Join room
      const joinMessage = {
        type: 'join_room',
        roomId: 'chat-room',
        token,
      };

      const connectionHandler = vi.mocked(server['wss'].on).mock.calls[0][1];
      connectionHandler(mockWs);

      const messageHandler = mockWs.on.mock.calls.find(
        (call) => call[0] === 'message'
      )?.[1];
      if (messageHandler) {
        messageHandler(Buffer.from(JSON.stringify(joinMessage)));
      }

      // Send chat message
      const chatMessage = {
        type: 'chat_message',
        roomId: 'chat-room',
        content: 'Hello, world!',
      };

      if (messageHandler) {
        messageHandler(Buffer.from(JSON.stringify(chatMessage)));
      }

      // Verify message was sent
      expect(mockWs.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"chat_message"')
      );
    });
  });

  describe('Code Changes', () => {
    it('should broadcast code changes to room', async () => {
      const token = jwt.sign(
        { userId: 'user123', username: 'testuser' },
        process.env.JWT_SECRET || 'test-secret'
      );

      // Join room
      const joinMessage = {
        type: 'join_room',
        roomId: 'code-room',
        token,
      };

      const connectionHandler = vi.mocked(server['wss'].on).mock.calls[0][1];
      connectionHandler(mockWs);

      const messageHandler = mockWs.on.mock.calls.find(
        (call) => call[0] === 'message'
      )?.[1];
      if (messageHandler) {
        messageHandler(Buffer.from(JSON.stringify(joinMessage)));
      }

      // Send code change
      const codeChange = {
        type: 'code_change',
        roomId: 'code-room',
        change: {
          from: { line: 1, ch: 0 },
          to: { line: 1, ch: 5 },
          text: ['Hello'],
        },
      };

      if (messageHandler) {
        messageHandler(Buffer.from(JSON.stringify(codeChange)));
      }

      // Verify change was broadcast
      expect(mockWs.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"code_change"')
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON messages', async () => {
      const connectionHandler = vi.mocked(server['wss'].on).mock.calls[0][1];
      connectionHandler(mockWs);

      const messageHandler = mockWs.on.mock.calls.find(
        (call) => call[0] === 'message'
      )?.[1];
      if (messageHandler) {
        messageHandler(Buffer.from('invalid json'));
      }

      expect(mockWs.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"error"')
      );
    });

    it('should handle unknown message types', async () => {
      const connectionHandler = vi.mocked(server['wss'].on).mock.calls[0][1];
      connectionHandler(mockWs);

      const messageHandler = mockWs.on.mock.calls.find(
        (call) => call[0] === 'message'
      )?.[1];
      if (messageHandler) {
        messageHandler(
          Buffer.from(
            JSON.stringify({
              type: 'unknown_type',
              data: 'test',
            })
          )
        );
      }

      // Should not crash and should send error
      expect(mockWs.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"error"')
      );
    });
  });

  describe('Server Statistics', () => {
    it('should return correct statistics', async () => {
      const token = jwt.sign(
        { userId: 'user123', username: 'testuser' },
        process.env.JWT_SECRET || 'test-secret'
      );

      const message = {
        type: 'join_room',
        roomId: 'stats-room',
        token,
      };

      // Join room
      const connectionHandler = vi.mocked(server['wss'].on).mock.calls[0][1];
      connectionHandler(mockWs);

      const messageHandler = mockWs.on.mock.calls.find(
        (call) => call[0] === 'message'
      )?.[1];
      if (messageHandler) {
        messageHandler(Buffer.from(JSON.stringify(message)));
      }

      const stats = server.getStats();
      expect(stats.totalRooms).toBe(1);
      expect(stats.totalUsers).toBe(1);
    });
  });
});
