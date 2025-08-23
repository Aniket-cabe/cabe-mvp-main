import { WebSocket, WebSocketServer } from 'ws';
import jsonwebtoken, { verify, sign } from 'jsonwebtoken';
import logger from '../utils/logger';

interface CollaborationUser {
  id: string;
  username: string;
  cursor?: { line: number; column: number };
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
}

class CollaborationRoom {
  id: string;
  users: Map<string, CollaborationUser> = new Map();
  chatMessages: ChatMessage[] = [];

  constructor(id: string) {
    this.id = id;
  }

  addUser(user: CollaborationUser) {
    this.users.set(user.id, user);
    return Array.from(this.users.values());
  }

  removeUser(userId: string) {
    this.users.delete(userId);
    return Array.from(this.users.values());
  }

  addChatMessage(message: ChatMessage) {
    this.chatMessages.push(message);
    if (this.chatMessages.length > 50) {
      this.chatMessages = this.chatMessages.slice(-50);
    }
  }
}

class CollaborationServer {
  private wss: WebSocketServer;
  private rooms: Map<string, CollaborationRoom> = new Map();
  private userConnections: Map<string, WebSocket> = new Map();

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.setupEventHandlers();
    logger.info(`Collaboration server started on port ${port}`);
  }

  private setupEventHandlers() {
    this.wss.on('connection', (ws: WebSocket) => {
      this.handleConnection(ws);
    });
  }

  private handleConnection(ws: WebSocket) {
    let userId: string | null = null;
    let currentRoom: CollaborationRoom | null = null;

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'join_room') {
          const user = await this.authenticateUser(message.token);
          if (user) {
            userId = user.id;
            currentRoom = this.joinRoom(message.roomId, user, ws);
            this.userConnections.set(userId, ws);
          }
        } else if (message.type === 'chat_message' && currentRoom) {
          this.handleChatMessage(currentRoom, userId!, message);
        } else if (message.type === 'code_change' && currentRoom) {
          this.broadcastToRoom(
            currentRoom.id,
            {
              type: 'code_change',
              userId,
              change: message.change,
            },
            userId || undefined
          );
        }
      } catch (error) {
        logger.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message' }));
      }
    });

    ws.on('close', () => {
      if (userId && currentRoom) {
        this.leaveRoom(currentRoom, userId);
        this.userConnections.delete(userId);
      }
    });
  }

  private async authenticateUser(
    token: string
  ): Promise<{ id: string; username: string } | null> {
    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as any;
      return { id: decoded.userId, username: decoded.username };
    } catch (error) {
      return null;
    }
  }

  private joinRoom(
    roomId: string,
    user: { id: string; username: string },
    ws: WebSocket
  ): CollaborationRoom {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = new CollaborationRoom(roomId);
      this.rooms.set(roomId, room);
    }

    const collaborationUser: CollaborationUser = {
      id: user.id,
      username: user.username,
    };

    const users = room.addUser(collaborationUser);

    ws.send(
      JSON.stringify({
        type: 'room_joined',
        roomId,
        users,
        chatMessages: room.chatMessages,
      })
    );

    this.broadcastToRoom(
      roomId,
      {
        type: 'user_joined',
        user: collaborationUser,
      },
      user.id
    );

    return room;
  }

  private leaveRoom(room: CollaborationRoom, userId: string) {
    room.removeUser(userId);
    this.broadcastToRoom(room.id, {
      type: 'user_left',
      userId,
    });

    if (room.users.size === 0) {
      this.rooms.delete(room.id);
    }
  }

  private handleChatMessage(
    room: CollaborationRoom,
    userId: string,
    message: any
  ) {
    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${userId}`,
      userId,
      username: room.users.get(userId)?.username || 'Unknown',
      content: message.content,
      timestamp: new Date(),
    };

    room.addChatMessage(chatMessage);

    this.broadcastToRoom(room.id, {
      type: 'chat_message',
      message: chatMessage,
    });
  }

  private broadcastToRoom(roomId: string, event: any, excludeUserId?: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const eventData = JSON.stringify(event);

    room.users.forEach((user) => {
      if (user.id !== excludeUserId) {
        const ws = this.userConnections.get(user.id);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(eventData);
        }
      }
    });
  }

  public getStats() {
    return {
      totalRooms: this.rooms.size,
      totalUsers: this.userConnections.size,
    };
  }

  public close() {
    this.wss.close();
  }
}

let collaborationServer: CollaborationServer | null = null;

export function initializeCollaborationServer(
  port: number = 8081
): CollaborationServer {
  if (!collaborationServer) {
    collaborationServer = new CollaborationServer(port);
  }
  return collaborationServer;
}

export function getCollaborationServer(): CollaborationServer | null {
  return collaborationServer;
}

export default CollaborationServer;
