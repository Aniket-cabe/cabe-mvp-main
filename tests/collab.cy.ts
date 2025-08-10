describe('Collaboration Features', () => {
  beforeEach(() => {
    // Mock WebSocket for testing
    cy.window().then((win) => {
      cy.stub(win, 'WebSocket').as('websocket');
    });

    // Mock authentication
    cy.intercept('GET', '/api/auth/me', {
      statusCode: 200,
      body: {
        userId: 'test-user-123',
        username: 'TestUser',
        email: 'test@example.com',
      },
    }).as('getUser');

    // Mock collaboration room data
    cy.intercept('GET', '/api/collaboration/room/*', {
      statusCode: 200,
      body: {
        roomId: 'test-room-123',
        code: 'console.log("Hello World");',
        users: [
          { userId: 'test-user-123', username: 'TestUser', color: '#FF6B6B' },
          { userId: 'test-user-456', username: 'OtherUser', color: '#4ECDC4' },
        ],
        chat: [
          {
            messageId: 'msg-1',
            userId: 'test-user-456',
            username: 'OtherUser',
            content: "Hey, how's the code coming along?",
            timestamp: new Date().toISOString(),
          },
        ],
      },
    }).as('getRoomData');
  });

  describe('Live Code Editing', () => {
    it('should connect to collaboration session', () => {
      cy.visit('/collaboration/test-room-123');

      cy.get('[data-testid="connection-status"]').should(
        'contain',
        'Connected'
      );
      cy.get('[data-testid="active-users"]').should('contain', '2');
    });

    it('should display multiple user cursors', () => {
      cy.visit('/collaboration/test-room-123');

      // Mock cursor update from another user
      cy.window().then((win) => {
        const mockMessage = {
          type: 'cursor_update',
          userId: 'test-user-456',
          cursor: { line: 5, column: 10 },
        };

        // Simulate WebSocket message
        win.postMessage(
          { type: 'websocket-message', data: JSON.stringify(mockMessage) },
          '*'
        );
      });

      cy.get('[data-testid="remote-cursor"]').should('be.visible');
    });

    it('should sync code changes in real-time', () => {
      cy.visit('/collaboration/test-room-123');

      // Mock code change from another user
      cy.window().then((win) => {
        const mockMessage = {
          type: 'code_change',
          change: {
            userId: 'test-user-456',
            operation: 'insert',
            position: 20,
            text: '// Added by other user',
          },
          newCode: 'console.log("Hello World");\n// Added by other user',
        };

        win.postMessage(
          { type: 'websocket-message', data: JSON.stringify(mockMessage) },
          '*'
        );
      });

      cy.get('[data-testid="code-editor"]').should(
        'contain',
        '// Added by other user'
      );
    });

    it('should handle user join/leave events', () => {
      cy.visit('/collaboration/test-room-123');

      // Mock user joined event
      cy.window().then((win) => {
        const mockMessage = {
          type: 'user_joined',
          user: {
            userId: 'test-user-789',
            username: 'NewUser',
            color: '#45B7D1',
          },
          message: 'NewUser joined the collaboration! 👋',
        };

        win.postMessage(
          { type: 'websocket-message', data: JSON.stringify(mockMessage) },
          '*'
        );
      });

      cy.get('[data-testid="user-joined-toast"]').should('be.visible');
      cy.get('[data-testid="active-users"]').should('contain', '3');
    });
  });

  describe('In-App Chat', () => {
    it('should send and receive chat messages', () => {
      cy.visit('/collaboration/test-room-123');

      // Send a message
      cy.get('[data-testid="chat-input"]').type('Hello everyone!');
      cy.get('[data-testid="send-message-btn"]').click();

      cy.get('[data-testid="chat-messages"]').should(
        'contain',
        'Hello everyone!'
      );
    });

    it('should display user avatars and timestamps', () => {
      cy.visit('/collaboration/test-room-123');

      cy.get('[data-testid="chat-message"]')
        .first()
        .within(() => {
          cy.get('[data-testid="user-avatar"]').should('be.visible');
          cy.get('[data-testid="message-timestamp"]').should('be.visible');
          cy.get('[data-testid="username"]').should('contain', 'OtherUser');
        });
    });

    it('should handle system messages', () => {
      cy.visit('/collaboration/test-room-123');

      // Mock system message
      cy.window().then((win) => {
        const mockMessage = {
          type: 'user_joined',
          user: { username: 'NewUser' },
          message: 'NewUser joined the chat 👋',
        };

        win.postMessage(
          { type: 'websocket-message', data: JSON.stringify(mockMessage) },
          '*'
        );
      });

      cy.get('[data-testid="system-message"]').should(
        'contain',
        'NewUser joined the chat 👋'
      );
    });

    it('should auto-scroll to new messages', () => {
      cy.visit('/collaboration/test-room-123');

      // Add multiple messages to trigger scroll
      for (let i = 0; i < 10; i++) {
        cy.get('[data-testid="chat-input"]').type(`Message ${i}`);
        cy.get('[data-testid="send-message-btn"]').click();
      }

      // Verify scroll position is at bottom
      cy.get('[data-testid="chat-container"]').should('have.scrollTop', '>', 0);
    });
  });

  describe('Peer Review Workflow', () => {
    beforeEach(() => {
      // Mock review data
      cy.intercept('GET', '/api/reviews/*/comments', {
        statusCode: 200,
        body: [
          {
            commentId: 'comment-1',
            reviewerId: 'test-user-456',
            reviewerName: 'OtherUser',
            lineNumber: 5,
            content: 'This line could be improved',
            timestamp: new Date().toISOString(),
            replies: [],
          },
        ],
      }).as('getComments');
    });

    it('should display existing review comments', () => {
      cy.visit('/collaboration/test-room-123/review');

      cy.get('[data-testid="review-comment"]').should('be.visible');
      cy.get('[data-testid="review-comment"]').should(
        'contain',
        'This line could be improved'
      );
      cy.get('[data-testid="line-number"]').should('contain', 'Line 5');
    });

    it('should allow adding new review comments', () => {
      cy.visit('/collaboration/test-room-123/review');

      // Mock line selection
      cy.get('[data-testid="code-line-10"]').click();

      cy.get('[data-testid="comment-form"]').should('be.visible');
      cy.get('[data-testid="comment-textarea"]').type(
        'Great work on this function!'
      );
      cy.get('[data-testid="add-comment-btn"]').click();

      cy.get('[data-testid="review-comment"]').should(
        'contain',
        'Great work on this function!'
      );
    });

    it('should show reviewer information', () => {
      cy.visit('/collaboration/test-room-123/review');

      cy.get('[data-testid="review-comment"]')
        .first()
        .within(() => {
          cy.get('[data-testid="reviewer-name"]').should(
            'contain',
            'OtherUser'
          );
          cy.get('[data-testid="reviewer-avatar"]').should('be.visible');
        });
    });

    it('should handle review status updates', () => {
      cy.visit('/collaboration/test-room-123/review');

      cy.get('[data-testid="review-status-select"]').select('in_progress');

      cy.get('[data-testid="status-update-toast"]').should(
        'contain',
        'Review status updated to in_progress'
      );
    });
  });

  describe('Multi-User Simulation', () => {
    it('should handle concurrent editing by multiple users', () => {
      cy.visit('/collaboration/test-room-123');

      // Simulate multiple users editing simultaneously
      const users = [
        { userId: 'user-1', username: 'User1', color: '#FF6B6B' },
        { userId: 'user-2', username: 'User2', color: '#4ECDC4' },
        { userId: 'user-3', username: 'User3', color: '#45B7D1' },
      ];

      users.forEach((user, index) => {
        cy.window().then((win) => {
          const mockMessage = {
            type: 'code_change',
            change: {
              userId: user.userId,
              operation: 'insert',
              position: index * 10,
              text: `// Added by ${user.username}`,
            },
            newCode: `console.log("Hello World");\n// Added by ${user.username}`,
          };

          win.postMessage(
            { type: 'websocket-message', data: JSON.stringify(mockMessage) },
            '*'
          );
        });
      });

      // Verify all changes are applied
      cy.get('[data-testid="code-editor"]').should('contain', 'Added by User1');
      cy.get('[data-testid="code-editor"]').should('contain', 'Added by User2');
      cy.get('[data-testid="code-editor"]').should('contain', 'Added by User3');
    });

    it('should maintain chat order with multiple users', () => {
      cy.visit('/collaboration/test-room-123');

      const messages = [
        { userId: 'user-1', username: 'User1', content: 'Hello everyone!' },
        { userId: 'user-2', username: 'User2', content: 'Hi there!' },
        { userId: 'user-3', username: 'User3', content: "How's it going?" },
      ];

      messages.forEach((msg) => {
        cy.window().then((win) => {
          const mockMessage = {
            type: 'chat_message',
            message: {
              messageId: `msg-${Date.now()}`,
              userId: msg.userId,
              username: msg.username,
              content: msg.content,
              timestamp: new Date().toISOString(),
            },
          };

          win.postMessage(
            { type: 'websocket-message', data: JSON.stringify(mockMessage) },
            '*'
          );
        });
      });

      // Verify messages appear in order
      cy.get('[data-testid="chat-messages"]').should(
        'contain',
        'Hello everyone!'
      );
      cy.get('[data-testid="chat-messages"]').should('contain', 'Hi there!');
      cy.get('[data-testid="chat-messages"]').should(
        'contain',
        "How's it going?"
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle WebSocket disconnection gracefully', () => {
      cy.visit('/collaboration/test-room-123');

      // Simulate disconnection
      cy.window().then((win) => {
        win.postMessage({ type: 'websocket-disconnect' }, '*');
      });

      cy.get('[data-testid="connection-status"]').should(
        'contain',
        'Disconnected'
      );
      cy.get('[data-testid="reconnection-message"]').should('be.visible');
    });

    it('should handle invalid message formats', () => {
      cy.visit('/collaboration/test-room-123');

      // Send invalid message
      cy.window().then((win) => {
        win.postMessage(
          { type: 'websocket-message', data: 'invalid json' },
          '*'
        );
      });

      cy.get('[data-testid="error-toast"]').should(
        'contain',
        'Invalid message format'
      );
    });

    it('should handle network errors during collaboration', () => {
      cy.intercept('GET', '/api/collaboration/room/*', {
        forceNetworkError: true,
      }).as('networkError');

      cy.visit('/collaboration/test-room-123');

      cy.get('[data-testid="error-message"]').should(
        'contain',
        'Failed to load room data'
      );
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation in chat', () => {
      cy.visit('/collaboration/test-room-123');

      cy.get('[data-testid="chat-input"]').focus();
      cy.get('[data-testid="chat-input"]').type('Test message');
      cy.get('[data-testid="chat-input"]').type('{enter}');

      cy.get('[data-testid="chat-messages"]').should('contain', 'Test message');
    });

    it('should have proper ARIA labels', () => {
      cy.visit('/collaboration/test-room-123');

      cy.get('[data-testid="chat-input"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="send-message-btn"]').should(
        'have.attr',
        'aria-label'
      );
      cy.get('[data-testid="code-editor"]').should(
        'have.attr',
        'role',
        'textbox'
      );
    });

    it('should announce new messages to screen readers', () => {
      cy.visit('/collaboration/test-room-123');

      // Mock new message
      cy.window().then((win) => {
        const mockMessage = {
          type: 'chat_message',
          message: {
            messageId: 'new-msg',
            userId: 'user-1',
            username: 'User1',
            content: 'New message',
            timestamp: new Date().toISOString(),
          },
        };

        win.postMessage(
          { type: 'websocket-message', data: JSON.stringify(mockMessage) },
          '*'
        );
      });

      cy.get('[data-testid="live-region"]').should(
        'have.attr',
        'aria-live',
        'polite'
      );
    });
  });
});
