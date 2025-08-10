import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { URL } from 'url';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import logger from '../utils/logger';

// Event types for real-time notifications
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

export interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAuthenticated: boolean;
  room?: string;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private rooms: Map<string, Set<AuthenticatedWebSocket>> = new Map();
  private connections: Map<string, AuthenticatedWebSocket> = new Map();

  constructor(port: number = 8080) {
    this.wss = new WebSocketServer({
      port,
      path: '/ws',
      clientTracking: true,
    });

    this.setupEventHandlers();
    logger.info(`🚀 WebSocket server started on port ${port}`);
  }

  private setupEventHandlers(): void {
    this.wss.on(
      'connection',
      (ws: AuthenticatedWebSocket, request: IncomingMessage) => {
        this.handleConnection(ws, request);
      }
    );

    this.wss.on('error', (error) => {
      logger.error('❌ WebSocket server error:', error);
    });

    this.wss.on('close', () => {
      logger.info('🔌 WebSocket server closed');
    });
  }

  private async handleConnection(
    ws: AuthenticatedWebSocket,
    request: IncomingMessage
  ): Promise<void> {
    try {
      // Extract JWT token from query parameters or headers
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      const token =
        url.searchParams.get('token') ||
        request.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        logger.warn('🔒 WebSocket connection attempt without token');
        ws.close(1008, 'Authentication required');
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      ws.userId = decoded.userId;
      ws.isAuthenticated = true;
      ws.room = `user:${decoded.userId}`;

      // Add to user room
      this.joinRoom(ws.room, ws);
      this.connections.set(decoded.userId, ws);

      logger.info(`✅ WebSocket authenticated for user: ${decoded.userId}`);

      // Send welcome message
      this.sendToUser(decoded.userId, {
        type: 'chatMessage',
        data: { message: 'Connected to CaBE Arena! 🚀', system: true },
        timestamp: Date.now(),
      });

      // Handle incoming messages
      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          logger.error('❌ Invalid message format:', error);
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      ws.on('error', (error) => {
        logger.error(`❌ WebSocket error for user ${ws.userId}:`, error);
        this.handleDisconnection(ws);
      });
    } catch (error) {
      logger.error('❌ WebSocket authentication failed:', error);
      ws.close(1008, 'Authentication failed');
    }
  }

  private handleMessage(ws: AuthenticatedWebSocket, message: any): void {
    if (!ws.isAuthenticated) {
      logger.warn('📨 Message from unauthenticated connection');
      return;
    }

    switch (message.type) {
      case 'join_room':
        if (message.room) {
          this.joinRoom(message.room, ws);
          ws.room = message.room;
        }
        break;

      case 'leave_room':
        if (ws.room) {
          this.leaveRoom(ws.room, ws);
          ws.room = undefined;
        }
        break;

      default:
        logger.debug(`📨 Unknown message type: ${message.type}`);
    }
  }

  private handleDisconnection(ws: AuthenticatedWebSocket): void {
    if (ws.userId) {
      this.connections.delete(ws.userId);
      logger.info(`🔌 User ${ws.userId} disconnected`);
    }

    if (ws.room) {
      this.leaveRoom(ws.room, ws);
    }
  }

  private joinRoom(room: string, ws: AuthenticatedWebSocket): void {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room)!.add(ws);
    logger.debug(`👥 User ${ws.userId} joined room: ${room}`);
  }

  private leaveRoom(room: string, ws: AuthenticatedWebSocket): void {
    const roomSet = this.rooms.get(room);
    if (roomSet) {
      roomSet.delete(ws);
      if (roomSet.size === 0) {
        this.rooms.delete(room);
      }
      logger.debug(`👋 User ${ws.userId} left room: ${room}`);
    }
  }

  // Public methods for broadcasting events
  public sendToUser(userId: string, event: WebSocketEvent): void {
    const ws = this.connections.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event));
      logger.debug(`📤 Sent ${event.type} to user ${userId}`);
    } else {
      logger.debug(`📤 User ${userId} not connected, event queued`);
    }
  }

  public sendToRoom(room: string, event: WebSocketEvent): void {
    const roomSet = this.rooms.get(room);
    if (roomSet) {
      const message = JSON.stringify(event);
      let sentCount = 0;

      roomSet.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
          sentCount++;
        }
      });

      logger.debug(
        `📤 Sent ${event.type} to ${sentCount} users in room ${room}`
      );
    }
  }

  public broadcast(event: WebSocketEvent): void {
    const message = JSON.stringify(event);
    let sentCount = 0;

    this.wss.clients.forEach((client) => {
      const ws = client as AuthenticatedWebSocket;
      if (ws.isAuthenticated && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
        sentCount++;
      }
    });

    logger.debug(`📤 Broadcasted ${event.type} to ${sentCount} users`);
  }

  public getStats(): {
    connections: number;
    rooms: number;
    authenticated: number;
  } {
    let authenticated = 0;
    this.wss.clients.forEach((client) => {
      const ws = client as AuthenticatedWebSocket;
      if (ws.isAuthenticated) authenticated++;
    });

    return {
      connections: this.wss.clients.size,
      rooms: this.rooms.size,
      authenticated,
    };
  }

  public close(): void {
    this.wss.close();
  }
}

// Create singleton instance
const wsManager = new WebSocketManager(env.WEBSOCKET_PORT || 8080);

// Export for use in other modules
export { wsManager };

// Event emission helpers for backend services
export const emitEvent = {
  submissionReviewed: (userId: string, data: any) => {
    wsManager.sendToUser(userId, {
      type: 'submissionReviewed',
      data,
      timestamp: Date.now(),
      userId,
    });
  },

  badgeUnlocked: (userId: string, data: any) => {
    wsManager.sendToUser(userId, {
      type: 'badgeUnlocked',
      data,
      timestamp: Date.now(),
      userId,
    });
  },

  chatMessage: (userId: string, data: any) => {
    wsManager.sendToUser(userId, {
      type: 'chatMessage',
      data,
      timestamp: Date.now(),
      userId,
    });
  },

  taskAssigned: (userId: string, data: any) => {
    wsManager.sendToUser(userId, {
      type: 'taskAssigned',
      data,
      timestamp: Date.now(),
      userId,
    });
  },

  pointsUpdated: (userId: string, data: any) => {
    wsManager.sendToUser(userId, {
      type: 'pointsUpdated',
      data,
      timestamp: Date.now(),
      userId,
    });
  },

  rankChanged: (userId: string, data: any) => {
    wsManager.sendToUser(userId, {
      type: 'rankChanged',
      data,
      timestamp: Date.now(),
      userId,
    });
  },
};

export default wsManager;
