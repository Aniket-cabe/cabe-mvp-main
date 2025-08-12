describe('WebSocket Real-time Features', () => {
  beforeEach(() => {
    // Mock WebSocket for testing
    cy.window().then((win) => {
      // Create a mock WebSocket that simulates the real WebSocket behavior
      const mockWebSocket = {
        readyState: 1, // OPEN
        send: cy.stub().as('wsSend'),
        close: cy.stub().as('wsClose'),
        onopen: null as any,
        onmessage: null as any,
        onclose: null as any,
        onerror: null as any,
      };

      // Mock the WebSocket constructor
      win.WebSocket = cy.stub().returns(mockWebSocket).as('WebSocket');
    });

    // Visit the dashboard where WebSocket is used
    cy.visit('/dashboard');
  });

  describe('WebSocket Connection', () => {
    it('should connect to WebSocket server on page load', () => {
      cy.get('@WebSocket').should(
        'have.been.calledWith',
        `ws://localhost:8080/ws?token=${Cypress.env('TEST_TOKEN')}`
      );
    });

    it('should handle connection open event', () => {
      cy.window().then((win) => {
        const mockWs = win.WebSocket.returnValues[0];

        // Simulate connection open
        mockWs.onopen();

        // Check that connection state is updated
        cy.get('[data-testid="ws-status"]').should('contain', 'Connected');
      });
    });

    it('should handle connection errors gracefully', () => {
      cy.window().then((win) => {
        const mockWs = win.WebSocket.returnValues[0];

        // Simulate connection error
        mockWs.onerror(new Error('Connection failed'));

        // Check that error state is displayed
        cy.get('[data-testid="ws-error"]').should(
          'contain',
          'Connection failed'
        );
      });
    });

    it('should attempt reconnection on connection close', () => {
      cy.window().then((win) => {
        const mockWs = win.WebSocket.returnValues[0];

        // Simulate connection close (abnormal)
        mockWs.onclose({ code: 1006, reason: 'Abnormal closure' });

        // Wait for reconnection attempt
        cy.wait(3000);

        // Should attempt to reconnect
        cy.get('@WebSocket').should('have.been.calledTwice');
      });
    });
  });

  describe('Real-time Notifications', () => {
    it('should display submission review notification', () => {
      cy.window().then((win) => {
        const mockWs = win.WebSocket.returnValues[0];

        // Simulate submission reviewed event
        mockWs.onmessage({
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

        // Check that notification appears
        cy.get('[data-testid="notification-toast"]')
          .should('be.visible')
          .and('contain', 'Submission Reviewed')
          .and('contain', 'Test Task')
          .and('contain', 'approved');
      });
    });

    it('should display badge unlock notification', () => {
      cy.window().then((win) => {
        const mockWs = win.WebSocket.returnValues[0];

        // Simulate badge unlocked event
        mockWs.onmessage({
          data: JSON.stringify({
            type: 'badgeUnlocked',
            data: {
              badgeName: 'First Win',
              badgeIcon: '🏆',
            },
            timestamp: Date.now(),
          }),
        });

        // Check that notification appears
        cy.get('[data-testid="notification-toast"]')
          .should('be.visible')
          .and('contain', 'Badge Unlocked! 🏆')
          .and('contain', 'First Win');
      });
    });

    it('should display task assignment notification', () => {
      cy.window().then((win) => {
        const mockWs = win.WebSocket.returnValues[0];

        // Simulate task assigned event
        mockWs.onmessage({
          data: JSON.stringify({
            type: 'taskAssigned',
            data: {
              taskName: 'New Challenge',
              description: 'Complete this exciting task!',
            },
            timestamp: Date.now(),
          }),
        });

        // Check that notification appears
        cy.get('[data-testid="notification-toast"]')
          .should('be.visible')
          .and('contain', 'New Task Assigned')
          .and('contain', 'New Challenge');
      });
    });

    it('should display rank change notification', () => {
      cy.window().then((win) => {
        const mockWs = win.WebSocket.returnValues[0];

        // Simulate rank changed event
        mockWs.onmessage({
          data: JSON.stringify({
            type: 'rankChanged',
            data: {
              newRank: 'Silver',
              oldRank: 'Bronze',
            },
            timestamp: Date.now(),
          }),
        });

        // Check that notification appears
        cy.get('[data-testid="notification-toast"]')
          .should('be.visible')
          .and('contain', 'Rank Promotion! 🚀')
          .and('contain', 'Silver');
      });
    });

    it('should auto-dismiss notifications after timeout', () => {
      cy.window().then((win) => {
        const mockWs = win.WebSocket.returnValues[0];

        // Simulate notification
        mockWs.onmessage({
          data: JSON.stringify({
            type: 'pointsUpdated',
            data: {
              newPoints: 1500,
            },
            timestamp: Date.now(),
          }),
        });

        // Check that notification appears
        cy.get('[data-testid="notification-toast"]').should('be.visible');

        // Wait for auto-dismiss (5 seconds)
        cy.wait(5000);

        // Check that notification is dismissed
        cy.get('[data-testid="notification-toast"]').should('not.exist');
      });
    });

    it('should allow manual dismissal of notifications', () => {
      cy.window().then((win) => {
        const mockWs = win.WebSocket.returnValues[0];

        // Simulate notification
        mockWs.onmessage({
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

        // Check that notification appears
        cy.get('[data-testid="notification-toast"]').should('be.visible');

        // Click dismiss button
        cy.get(
          '[data-testid="notification-toast"] [data-testid="dismiss-btn"]'
        ).click();

        // Check that notification is dismissed
        cy.get('[data-testid="notification-toast"]').should('not.exist');
      });
    });

    it('should show appeal button for rejected submissions', () => {
      cy.window().then((win) => {
        const mockWs = win.WebSocket.returnValues[0];

        // Simulate rejected submission
        mockWs.onmessage({
          data: JSON.stringify({
            type: 'submissionReviewed',
            data: {
              taskName: 'Test Task',
              status: 'rejected',
              reason: 'Incomplete proof',
            },
            timestamp: Date.now(),
          }),
        });

        // Check that notification appears with appeal button
        cy.get('[data-testid="notification-toast"]')
          .should('be.visible')
          .and('contain', 'rejected');

        cy.get('[data-testid="notification-toast"]').should(
          'contain',
          'Appeal this decision'
        );
      });
    });
  });

  describe('Notification Management', () => {
    it('should limit number of visible notifications', () => {
      cy.window().then((win) => {
        const mockWs = win.WebSocket.returnValues[0];

        // Send 6 notifications
        for (let i = 0; i < 6; i++) {
          mockWs.onmessage({
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
        }

        // Should only show 5 notifications (default limit)
        cy.get('[data-testid="notification-toast"]').should('have.length', 5);
      });
    });

    it('should allow dismissing all notifications', () => {
      cy.window().then((win) => {
        const mockWs = win.WebSocket.returnValues[0];

        // Send multiple notifications
        for (let i = 0; i < 3; i++) {
          mockWs.onmessage({
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
        }

        // Check that multiple notifications are visible
        cy.get('[data-testid="notification-toast"]').should('have.length', 3);

        // Click dismiss all button
        cy.get('[data-testid="dismiss-all-btn"]').click();

        // Check that all notifications are dismissed
        cy.get('[data-testid="notification-toast"]').should('not.exist');
      });
    });
  });

  describe('WebSocket Message Handling', () => {
    it('should handle malformed messages gracefully', () => {
      cy.window().then((win) => {
        const mockWs = win.WebSocket.returnValues[0];

        // Spy on console.error
        cy.window().then((win) => {
          cy.stub(win.console, 'error').as('consoleError');
        });

        // Send malformed message
        mockWs.onmessage({ data: 'invalid json' });

        // Check that error was logged
        cy.get('@consoleError').should('have.been.called');

        // Connection should remain stable
        cy.get('[data-testid="ws-status"]').should('contain', 'Connected');
      });
    });

    it('should handle unknown message types', () => {
      cy.window().then((win) => {
        const mockWs = win.WebSocket.returnValues[0];

        // Spy on console.warn
        cy.window().then((win) => {
          cy.stub(win.console, 'warn').as('consoleWarn');
        });

        // Send unknown message type
        mockWs.onmessage({
          data: JSON.stringify({
            type: 'unknownType',
            data: { test: 'data' },
            timestamp: Date.now(),
          }),
        });

        // Check that warning was logged
        cy.get('@consoleWarn').should(
          'have.been.calledWith',
          '⚠️ No handler for event type: unknownType'
        );
      });
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle rapid message sending', () => {
      cy.window().then((win) => {
        const mockWs = win.WebSocket.returnValues[0];

        // Send 20 rapid messages
        for (let i = 0; i < 20; i++) {
          mockWs.onmessage({
            data: JSON.stringify({
              type: 'pointsUpdated',
              data: { points: i },
              timestamp: Date.now(),
            }),
          });
        }

        // Should handle all messages without errors
        cy.get('[data-testid="ws-status"]').should('contain', 'Connected');

        // Should show notifications (limited to 5)
        cy.get('[data-testid="notification-toast"]').should('have.length', 5);
      });
    });

    it('should maintain connection under load', () => {
      cy.window().then((win) => {
        const mockWs = win.WebSocket.returnValues[0];

        // Simulate high-frequency updates
        const interval = setInterval(() => {
          mockWs.onmessage({
            data: JSON.stringify({
              type: 'pointsUpdated',
              data: { points: Math.random() * 1000 },
              timestamp: Date.now(),
            }),
          });
        }, 100);

        // Let it run for 2 seconds
        cy.wait(2000);

        // Clear interval
        clearInterval(interval);

        // Connection should remain stable
        cy.get('[data-testid="ws-status"]').should('contain', 'Connected');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for notifications', () => {
      cy.window().then((win) => {
        const mockWs = win.WebSocket.returnValues[0];

        // Simulate notification
        mockWs.onmessage({
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

        // Check ARIA attributes
        cy.get('[data-testid="notification-toast"]')
          .should('have.attr', 'role', 'alert')
          .and('have.attr', 'aria-live', 'assertive');

        cy.get(
          '[data-testid="notification-toast"] [data-testid="dismiss-btn"]'
        ).should('have.attr', 'aria-label');
      });
    });

    it('should support keyboard navigation', () => {
      cy.window().then((win) => {
        const mockWs = win.WebSocket.returnValues[0];

        // Simulate notification
        mockWs.onmessage({
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

        // Tab to dismiss button
        cy.get('body').tab();

        // Should focus on dismiss button
        cy.get(
          '[data-testid="notification-toast"] [data-testid="dismiss-btn"]'
        ).should('be.focused');

        // Press Enter to dismiss
        cy.get(
          '[data-testid="notification-toast"] [data-testid="dismiss-btn"]'
        ).type('{enter}');

        // Notification should be dismissed
        cy.get('[data-testid="notification-toast"]').should('not.exist');
      });
    });
  });
});
