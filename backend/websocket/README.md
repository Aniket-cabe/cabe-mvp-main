# WebSocket Real-time Features

This directory contains the WebSocket server implementation for CaBE Arena's real-time features, including live notifications, event broadcasting, and connection management.

## 🏗️ Architecture

The WebSocket system consists of:

- **WebSocket Server** (`server.ts`): Main server with JWT authentication and event broadcasting
- **Frontend Hook** (`useWebSocket.ts`): React hook for connection management and event handling
- **Notification Component** (`NotificationToast.tsx`): UI component for displaying real-time notifications
- **Comprehensive Tests**: Backend unit tests, frontend hook tests, and E2E tests

## 📁 File Structure

```
backend/
├── src/websocket/
│   └── server.ts                 # WebSocket server implementation
├── tests/
│   └── websocket.server.spec.ts  # Backend WebSocket tests
└── websocket/
    └── README.md                 # This documentation

frontend/
├── src/hooks/
│   └── useWebSocket.ts           # React WebSocket hook
├── src/components/
│   └── NotificationToast.tsx     # Notification UI component
├── tests/
│   └── useWebSocket.spec.ts      # Frontend hook tests
└── cypress/e2e/
    └── websocket.cy.ts           # E2E WebSocket tests
```

## 🚀 Features

### Backend WebSocket Server

- **JWT Authentication**: Secure connections with JWT token validation
- **Event Broadcasting**: Send events to specific users, rooms, or all connected clients
- **Connection Management**: Handle multiple concurrent connections with room support
- **Error Handling**: Graceful error handling and logging
- **Statistics**: Real-time connection and room statistics

### Frontend WebSocket Hook

- **Auto-reconnection**: Exponential backoff reconnection logic
- **Event Handling**: Type-safe event handling with custom handlers
- **Connection State**: Real-time connection status and error handling
- **Room Management**: Join/leave rooms for targeted messaging
- **Cleanup**: Proper cleanup on component unmount

### Notification System

- **Real-time Notifications**: Instant notification display for various events
- **Auto-dismiss**: Configurable auto-dismiss with progress indicators
- **Manual Dismiss**: User-controlled notification dismissal
- **Accessibility**: Full ARIA support and keyboard navigation
- **Multiple Types**: Support for different notification types with custom styling

## 🔧 Configuration

### Environment Variables

```bash
# WebSocket Configuration
WEBSOCKET_PORT=8080              # WebSocket server port
```

### Event Types

The system supports the following event types:

```typescript
type EventType =
  | 'submissionReviewed' // Task submission review results
  | 'badgeUnlocked' // Badge/achievement unlocks
  | 'chatMessage' // Chat messages
  | 'taskAssigned' // New task assignments
  | 'pointsUpdated' // Point balance changes
  | 'rankChanged'; // Rank promotions
```

## 📡 API Reference

### Backend WebSocket Server

#### Event Emission

```typescript
import { emitEvent } from '../src/websocket/server';

// Send event to specific user
emitEvent.submissionReviewed(userId, {
  taskName: 'Design Challenge',
  status: 'approved',
  points: 100,
});

// Send event to all connected users
wsManager.broadcast({
  type: 'systemMessage',
  data: { message: 'Server maintenance in 5 minutes' },
  timestamp: Date.now(),
});
```

#### Server Statistics

```typescript
const stats = wsManager.getStats();
console.log(stats);
// {
//   connections: 25,
//   rooms: 5,
//   authenticated: 23
// }
```

### Frontend WebSocket Hook

#### Basic Usage

```typescript
import { useWebSocket } from '../src/hooks/useWebSocket';

function MyComponent() {
  const { isConnected, sendMessage } = useWebSocket({
    handlers: {
      submissionReviewed: (data) => {
        console.log('Submission reviewed:', data);
      },
      badgeUnlocked: (data) => {
        console.log('Badge unlocked:', data);
      }
    }
  });

  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
}
```

#### Notification Hook

```typescript
import { useNotificationToast } from '../src/components/NotificationToast';

function App() {
  const { notifications, dismissNotification, dismissAll } = useNotificationToast();

  return (
    <div>
      <NotificationToast
        notifications={notifications}
        onDismiss={dismissNotification}
        onDismissAll={dismissAll}
      />
    </div>
  );
}
```

## 🧪 Testing

### Backend Tests

```bash
# Run WebSocket server tests
npm run test tests/websocket.server.spec.ts

# Run all backend tests
npm run test
```

### Frontend Tests

```bash
# Run WebSocket hook tests
npm run test tests/useWebSocket.spec.ts

# Run all frontend tests
npm run test
```

### E2E Tests

```bash
# Run WebSocket E2E tests
npm run cypress run --spec "cypress/e2e/websocket.cy.ts"

# Run all E2E tests
npm run cypress run
```

## 🔒 Security

### Authentication

- All WebSocket connections require valid JWT tokens
- Tokens are validated on connection establishment
- Unauthenticated connections are immediately closed

### Event Validation

- All incoming messages are validated for proper JSON format
- Unknown message types are logged but don't break the connection
- Malformed messages are handled gracefully

### Rate Limiting

- Connection attempts are logged for monitoring
- Failed authentication attempts are tracked
- Server statistics help identify potential abuse

## 📊 Performance

### Connection Limits

- Default maximum connections: Based on server resources
- Room management for efficient broadcasting
- Connection pooling for optimal resource usage

### Message Handling

- Asynchronous message processing
- Event queuing for high-frequency updates
- Memory-efficient notification storage

### Load Testing

The system has been tested with:

- 50+ concurrent connections
- 100+ rapid message sends
- Continuous operation under load

## 🚨 Error Handling

### Connection Errors

- Automatic reconnection with exponential backoff
- Graceful degradation when WebSocket is unavailable
- Fallback to polling for critical updates

### Message Errors

- Malformed JSON is logged but doesn't break connections
- Unknown event types are logged for debugging
- Invalid message formats are safely ignored

### Server Errors

- Comprehensive error logging
- Graceful server shutdown
- Connection cleanup on errors

## 🔧 Development

### Local Development

1. Start the WebSocket server:

   ```bash
   cd backend
   npm run dev
   ```

2. The WebSocket server will start on port 8080 (configurable)

3. Frontend will automatically connect to the WebSocket server

### Debugging

Enable debug logging:

```bash
LOG_LEVEL=debug npm run dev
```

### Testing WebSocket Events

Use the test endpoints to simulate events:

```bash
# Test submission review event
curl -X POST http://localhost:3001/api/test/websocket/submission-reviewed \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user", "data": {"taskName": "Test", "status": "approved"}}'
```

## 📈 Monitoring

### Server Statistics

Monitor WebSocket server health:

```typescript
const stats = wsManager.getStats();
console.log('Active connections:', stats.connections);
console.log('Authenticated users:', stats.authenticated);
console.log('Active rooms:', stats.rooms);
```

### Event Logging

All WebSocket events are logged for monitoring:

```typescript
// Event emission logs
logger.debug(`📤 Sent ${event.type} to user ${userId}`);

// Connection logs
logger.info(`✅ WebSocket authenticated for user: ${userId}`);
logger.info(`🔌 User ${userId} disconnected`);
```

## 🔄 Integration

### Backend Services

Integrate WebSocket events into existing services:

```typescript
// In submission service
export async function reviewSubmission(submissionId: string, status: string) {
  // ... existing logic ...

  // Emit WebSocket event
  emitEvent.submissionReviewed(submission.userId, {
    taskName: submission.taskName,
    status,
    points: status === 'approved' ? submission.points : 0,
  });
}
```

### Frontend Components

Add real-time updates to components:

```typescript
// In dashboard component
const { isConnected } = useWebSocket({
  handlers: {
    pointsUpdated: (data) => {
      // Update points display
      setPoints(data.newPoints);
    },
    rankChanged: (data) => {
      // Show rank promotion
      setShowRankPromotion(true);
    },
  },
});
```

## 🚀 Deployment

### Production Considerations

1. **Load Balancing**: Use sticky sessions for WebSocket connections
2. **SSL/TLS**: Enable WSS (WebSocket Secure) in production
3. **Monitoring**: Set up alerts for connection drops and errors
4. **Scaling**: Consider horizontal scaling for high-traffic scenarios

### Environment Setup

```bash
# Production environment
WEBSOCKET_PORT=8080
NODE_ENV=production
LOG_LEVEL=warn
```

## 📚 Additional Resources

- [WebSocket Protocol Specification](https://tools.ietf.org/html/rfc6455)
- [React WebSocket Best Practices](https://react.dev/learn/effects#connecting-to-an-external-system)
- [WebSocket Security Guidelines](https://www.owasp.org/index.php/WebSocket_Security_Cheat_Sheet)

## 🤝 Contributing

When adding new WebSocket features:

1. Add new event types to the `EventType` union
2. Create corresponding event handlers
3. Add tests for new functionality
4. Update documentation
5. Consider backward compatibility

## 📄 License

This WebSocket implementation is part of the CaBE Arena project and follows the same licensing terms.
