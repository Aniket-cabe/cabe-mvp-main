describe('User Dashboard', () => {
  beforeEach(() => {
    // Mock the user summary API
    cy.intercept('GET', '/api/user/summary*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'Alex Johnson',
            avatar:
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            currentRank: {
              level: 'bronze',
              name: 'Bronze',
              icon: '🥉',
              color: '#CD7F32',
              minPoints: 0,
              maxPoints: 1000,
              features: [
                'Basic Arena Access',
                'Course Library',
                'Community Forums',
              ],
            },
            currentPoints: 750,
            nextThreshold: 1000,
            totalPoints: 750,
            streakDays: 5,
            joinDate: '2024-01-01T00:00:00Z',
            lastActive: '2024-01-15T10:30:00Z',
          },
          recentSubmissions: [
            {
              id: 'sub-1',
              taskTitle: 'Design a Modern Landing Page',
              taskType: 'arena',
              skillArea: 'ai-ml',
              status: 'approved',
              score: 92,
              points: 150,
              submittedAt: '2024-01-15T10:30:00Z',
              reviewedAt: '2024-01-15T14:20:00Z',
            },
            {
              id: 'sub-2',
              taskTitle: 'Build a REST API with Node.js',
              taskType: 'arena',
              skillArea: 'cloud-devops',
              status: 'pending',
              submittedAt: '2024-01-14T16:45:00Z',
            },
            {
              id: 'sub-3',
              taskTitle: 'Create a React Component Library',
              taskType: 'challenge',
              skillArea: 'fullstack-dev',
              status: 'approved',
              score: 88,
              points: 200,
              submittedAt: '2024-01-13T09:15:00Z',
              reviewedAt: '2024-01-13T18:30:00Z',
            },
          ],
          unlockables: [
            {
              id: 'unlock-1',
              name: 'Advanced Analytics Dashboard',
              description:
                'Get detailed insights into your performance with advanced charts and metrics',
              icon: '📊',
              rankRequired: 'Silver',
              pointsRequired: 1000,
              isUnlocked: false,
              category: 'feature',
            },
            {
              id: 'unlock-2',
              name: 'Priority Task Queue',
              description:
                'Jump to the front of the line with priority access to new tasks',
              icon: '⚡',
              rankRequired: 'Silver',
              pointsRequired: 1000,
              isUnlocked: false,
              category: 'perk',
            },
          ],
        },
      },
    }).as('getUserSummary');
  });

  it('should load the dashboard with user information', () => {
    cy.visit('/dashboard');
    cy.wait('@getUserSummary');

    // Check if main elements are loaded
    cy.get('[data-testid="user-name"]').should('contain', 'Alex Johnson');
    cy.get('[data-testid="current-rank"]').should('contain', 'Bronze');
    cy.get('[data-testid="current-points"]').should('contain', '750');
    cy.get('[data-testid="total-points"]').should('contain', '750');
    cy.get('[data-testid="streak-days"]').should('contain', '5');
  });

  it('should display progress ring correctly', () => {
    cy.visit('/dashboard');
    cy.wait('@getUserSummary');

    // Check progress ring
    cy.get('[data-testid="progress-percentage"]').should('contain', '75');

    // Check progress message
    cy.contains('Only 250 pts to Silver. Smash a quick task?').should(
      'be.visible'
    );
  });

  it('should show streak banner when streak >= 3 days', () => {
    cy.visit('/dashboard');
    cy.wait('@getUserSummary');

    // Check streak banner
    cy.contains('🔥 5 Day Streak!').should('be.visible');
    cy.contains('Keep up the great work!').should('be.visible');
  });

  it('should display recent activity table', () => {
    cy.visit('/dashboard');
    cy.wait('@getUserSummary');

    // Check activity table
    cy.get('[data-testid="activity-table"]').should('be.visible');
    cy.get('[data-testid="task-title-sub-1"]').should(
      'contain',
      'Design a Modern Landing Page'
    );
    cy.get('[data-testid="task-title-sub-2"]').should(
      'contain',
      'Build a REST API with Node.js'
    );
    cy.get('[data-testid="task-title-sub-3"]').should(
      'contain',
      'Create a React Component Library'
    );
  });

  it('should show correct status indicators in activity table', () => {
    cy.visit('/dashboard');
    cy.wait('@getUserSummary');

    // Check status indicators
    cy.get('[data-testid="status-sub-1"]').should('contain', 'approved');
    cy.get('[data-testid="status-sub-2"]').should('contain', 'pending');
    cy.get('[data-testid="status-sub-3"]').should('contain', 'approved');
  });

  it('should display scores in activity table', () => {
    cy.visit('/dashboard');
    cy.wait('@getUserSummary');

    // Check scores
    cy.get('[data-testid="score-sub-1"]').should('contain', '92%');
    cy.get('[data-testid="score-sub-3"]').should('contain', '88%');
  });

  it('should show unlock carousel with upcoming features', () => {
    cy.visit('/dashboard');
    cy.wait('@getUserSummary');

    // Check carousel
    cy.get('[data-testid="unlock-title-0"]').should(
      'contain',
      'Advanced Analytics Dashboard'
    );
    cy.get('[data-testid="unlock-description-0"]').should(
      'contain',
      'Get detailed insights'
    );

    // Check carousel navigation
    cy.get('[data-testid="carousel-next"]').should('be.visible');
    cy.get('[data-testid="carousel-prev"]').should('be.visible');
  });

  it('should support carousel keyboard navigation', () => {
    cy.visit('/dashboard');
    cy.wait('@getUserSummary');

    // Focus on carousel and test keyboard navigation
    cy.get('[role="region"]').focus();
    cy.get('[role="region"]').type('{rightarrow}');

    // Should show second slide
    cy.get('[data-testid="unlock-title-1"]').should(
      'contain',
      'Priority Task Queue'
    );
  });

  it('should auto-slide carousel every 6 seconds', () => {
    cy.visit('/dashboard');
    cy.wait('@getUserSummary');

    // Wait for auto-slide (checking after 7 seconds to ensure it happens)
    cy.wait(7000);

    // Should have moved to next slide
    cy.get('[data-testid="unlock-title-1"]').should('be.visible');
  });

  it('should pause carousel on hover', () => {
    cy.visit('/dashboard');
    cy.wait('@getUserSummary');

    // Hover over carousel
    cy.get('[role="region"]').trigger('mouseenter');

    // Wait and check that it didn't auto-slide
    cy.wait(3000);
    cy.get('[data-testid="unlock-title-0"]').should('be.visible');
  });

  it('should display user avatar and rank badge', () => {
    cy.visit('/dashboard');
    cy.wait('@getUserSummary');

    // Check avatar
    cy.get('img[alt="Alex Johnson"]').should('be.visible');

    // Check rank badge
    cy.contains('🥉').should('be.visible');
  });

  it('should show join date and last active time', () => {
    cy.visit('/dashboard');
    cy.wait('@getUserSummary');

    // Check join date
    cy.contains('Joined January 1, 2024').should('be.visible');

    // Check last active (should show relative time)
    cy.contains('Last active').should('be.visible');
  });

  it('should display quick action buttons', () => {
    cy.visit('/dashboard');
    cy.wait('@getUserSummary');

    // Check quick actions
    cy.contains('Find Tasks').should('be.visible');
    cy.contains('View Progress').should('be.visible');
    cy.contains('Take Course').should('be.visible');
  });

  it('should handle loading state', () => {
    // Mock slow response
    cy.intercept('GET', '/api/user/summary*', (req) => {
      req.reply({
        delay: 2000,
        statusCode: 200,
        body: { success: true, data: {} },
      });
    }).as('getSlowUserSummary');

    cy.visit('/dashboard');

    // Should show loading state
    cy.contains('Loading your dashboard...').should('be.visible');
  });

  it('should handle error state', () => {
    // Mock error response
    cy.intercept('GET', '/api/user/summary*', {
      statusCode: 500,
      body: { success: false, message: 'Server error' },
    }).as('getErrorUserSummary');

    cy.visit('/dashboard');
    cy.wait('@getErrorUserSummary');

    // Should show error state
    cy.contains('Error Loading Dashboard').should('be.visible');
    cy.contains('Try Again').should('be.visible');
  });

  it('should handle empty activity state', () => {
    // Mock empty submissions
    cy.intercept('GET', '/api/user/summary*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'Alex Johnson',
            currentRank: {
              level: 'bronze',
              name: 'Bronze',
              icon: '🥉',
              color: '#CD7F32',
              minPoints: 0,
              maxPoints: 1000,
              features: [],
            },
            currentPoints: 0,
            nextThreshold: 1000,
            totalPoints: 0,
            streakDays: 0,
            joinDate: '2024-01-01T00:00:00Z',
            lastActive: '2024-01-15T10:30:00Z',
          },
          recentSubmissions: [],
          unlockables: [],
        },
      },
    }).as('getEmptyUserSummary');

    cy.visit('/dashboard');
    cy.wait('@getEmptyUserSummary');

    // Should show empty activity state
    cy.contains('No recent activity').should('be.visible');
    cy.contains('Complete your first task to see activity here').should(
      'be.visible'
    );
  });

  it('should not show streak banner when streak < 3 days', () => {
    // Mock user with low streak
    cy.intercept('GET', '/api/user/summary*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'Alex Johnson',
            currentRank: {
              level: 'bronze',
              name: 'Bronze',
              icon: '🥉',
              color: '#CD7F32',
              minPoints: 0,
              maxPoints: 1000,
              features: [],
            },
            currentPoints: 750,
            nextThreshold: 1000,
            totalPoints: 750,
            streakDays: 2,
            joinDate: '2024-01-01T00:00:00Z',
            lastActive: '2024-01-15T10:30:00Z',
          },
          recentSubmissions: [],
          unlockables: [],
        },
      },
    }).as('getLowStreakUserSummary');

    cy.visit('/dashboard');
    cy.wait('@getLowStreakUserSummary');

    // Should not show streak banner
    cy.contains('Day Streak!').should('not.exist');
  });

  it('should display skill area badges correctly', () => {
    cy.visit('/dashboard');
    cy.wait('@getUserSummary');

    // Check skill area badges
    cy.contains('ai-ml').should('be.visible');
    cy.contains('cloud-devops').should('be.visible');
    cy.contains('fullstack-dev').should('be.visible');
  });

  it('should show task type icons correctly', () => {
    cy.visit('/dashboard');
    cy.wait('@getUserSummary');

    // Check task type icons (these are rendered as SVG icons)
    cy.get('[data-testid="activity-table"]').should('contain', 'arena');
    cy.get('[data-testid="activity-table"]').should('contain', 'challenge');
  });

  it('should format dates correctly in activity table', () => {
    cy.visit('/dashboard');
    cy.wait('@getUserSummary');

    // Check date formatting (should show relative time)
    cy.get('[data-testid="date-sub-1"]').should('be.visible');
    cy.get('[data-testid="date-sub-2"]').should('be.visible');
    cy.get('[data-testid="date-sub-3"]').should('be.visible');
  });

  it('should have proper ARIA labels for accessibility', () => {
    cy.visit('/dashboard');
    cy.wait('@getUserSummary');

    // Check ARIA labels
    cy.get('[role="progressbar"]').should('have.attr', 'aria-valuenow');
    cy.get('[role="region"]').should('have.attr', 'aria-label');
    cy.get('[role="region"]').should('have.attr', 'aria-live');
  });

  it('should support keyboard navigation', () => {
    cy.visit('/dashboard');
    cy.wait('@getUserSummary');

    // Tab through interactive elements
    cy.get('body').tab();
    cy.focused().should('exist');
  });

  it('should display points information correctly', () => {
    cy.visit('/dashboard');
    cy.wait('@getUserSummary');

    // Check points display
    cy.get('[data-testid="current-points"]').should('contain', '750');
    cy.get('[data-testid="total-points"]').should('contain', '750');

    // Check points in activity table
    cy.contains('150 points').should('be.visible');
    cy.contains('200 points').should('be.visible');
  });

  it('should show carousel dots indicator', () => {
    cy.visit('/dashboard');
    cy.wait('@getUserSummary');

    // Check carousel dots
    cy.get('[data-testid="carousel-dot-0"]').should('be.visible');
    cy.get('[data-testid="carousel-dot-1"]').should('be.visible');
  });

  it('should allow manual carousel navigation', () => {
    cy.visit('/dashboard');
    cy.wait('@getUserSummary');

    // Click next button
    cy.get('[data-testid="carousel-next"]').click();
    cy.get('[data-testid="unlock-title-1"]').should('be.visible');

    // Click prev button
    cy.get('[data-testid="carousel-prev"]').click();
    cy.get('[data-testid="unlock-title-0"]').should('be.visible');
  });
});
