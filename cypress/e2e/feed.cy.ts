describe('AI Task Feed', () => {
  beforeEach(() => {
    // Mock the feed API
    cy.intercept('GET', '/api/feed*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          tasks: [
            {
              id: 'task-1',
              title: 'Design a Modern Landing Page',
              description:
                'Create a responsive landing page design for a SaaS product with modern UI/UX principles',
              type: 'arena',
              skill_area: 'design',
              points: 150,
              xp_value: 75,
              difficulty: 'medium',
              duration: 120,
              relevance_score: 92,
              relevance_reason:
                'Perfect match for your design skills! This task will boost your Design XP and help you practice modern UI/UX principles.',
              created_at: '2024-01-15T10:00:00Z',
              is_active: true,
              tags: ['UI/UX', 'Responsive', 'SaaS'],
            },
            {
              id: 'task-2',
              title: 'Build a REST API with Node.js',
              description:
                'Develop a RESTful API using Node.js, Express, and MongoDB for a task management system',
              type: 'arena',
              skill_area: 'backend',
              points: 200,
              xp_value: 100,
              difficulty: 'hard',
              duration: 180,
              relevance_score: 88,
              relevance_reason:
                'Great opportunity to strengthen your backend skills! This will significantly boost your Backend XP.',
              created_at: '2024-01-15T09:30:00Z',
              is_active: true,
              tags: ['Node.js', 'Express', 'MongoDB', 'API'],
            },
            {
              id: 'task-3',
              title: 'Create a React Component Library',
              description:
                'Build a reusable component library with TypeScript and Storybook documentation',
              type: 'challenge',
              skill_area: 'frontend',
              points: 300,
              xp_value: 150,
              difficulty: 'hard',
              duration: 240,
              relevance_score: 85,
              relevance_reason:
                'Excellent for advancing your frontend expertise! This challenge will boost your Frontend XP significantly.',
              created_at: '2024-01-15T08:45:00Z',
              is_active: true,
              tags: ['React', 'TypeScript', 'Storybook', 'Components'],
            },
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 3,
            hasNextPage: false,
          },
          metadata: {
            user_rank: 'bronze',
            skills: ['design', 'web', 'ai'],
            total_recommendations: 3,
            generated_at: new Date().toISOString(),
          },
        },
        timestamp: new Date().toISOString(),
      },
    }).as('getFeedData');
  });

  it('should load the feed page with AI recommendations', () => {
    cy.visit('/home');
    cy.wait('@getFeedData');

    // Check if main elements are loaded
    cy.get('h1').should('contain', 'AI Task Feed');
    cy.get('[data-testid="task-card-task-1"]').should('be.visible');
    cy.get('[data-testid="task-card-task-2"]').should('be.visible');
    cy.get('[data-testid="task-card-task-3"]').should('be.visible');
  });

  it('should display task cards with all required information', () => {
    cy.visit('/home');
    cy.wait('@getFeedData');

    // Check first task card
    cy.get('[data-testid="task-card-task-1"]').within(() => {
      cy.get('[data-testid="task-title"]').should(
        'contain',
        'Design a Modern Landing Page'
      );
      cy.get('[data-testid="task-description"]').should(
        'contain',
        'Create a responsive landing page design'
      );
      cy.get('[data-testid="task-points"]').should('contain', '150');
      cy.get('[data-testid="task-xp"]').should('contain', '75');
      cy.get('[data-testid="task-duration"]').should('contain', '2h');
      cy.get('[data-testid="accept-task-button"]').should('be.visible');
    });
  });

  it('should show AI recommendation tooltips', () => {
    cy.visit('/home');
    cy.wait('@getFeedData');

    // Check if WhyThisChip is present
    cy.get('[data-testid="why-this-chip"]').should('be.visible');

    // Click on the chip to show tooltip
    cy.get('[data-testid="why-this-chip"]').first().click();
    cy.get('[data-testid="why-this-tooltip"]').should('be.visible');
    cy.get('[data-testid="why-this-tooltip"]').should(
      'contain',
      'AI Recommendation'
    );
    cy.get('[data-testid="why-this-tooltip"]').should(
      'contain',
      'Perfect match for your design skills'
    );
  });

  it('should show tooltip on focus for accessibility', () => {
    cy.visit('/home');
    cy.wait('@getFeedData');

    // Focus on the chip to show tooltip
    cy.get('[data-testid="why-this-chip"]').first().focus();
    cy.get('[data-testid="why-this-tooltip"]').should('be.visible');
  });

  it('should allow discarding tasks with swipe animation', () => {
    cy.visit('/home');
    cy.wait('@getFeedData');

    // Check initial task count
    cy.get('[data-testid^="task-card-"]').should('have.length', 3);

    // Discard first task
    cy.get('[data-testid="task-card-task-1"]').should('be.visible');

    // Simulate swipe left (mouse drag)
    cy.get('[data-testid="task-card-task-1"]')
      .trigger('mousedown', { clientX: 100 })
      .trigger('mousemove', { clientX: -50 })
      .trigger('mouseup');

    // Task should be removed
    cy.get('[data-testid="task-card-task-1"]').should('not.exist');
    cy.get('[data-testid^="task-card-"]').should('have.length', 2);
  });

  it('should show discard hint during swipe', () => {
    cy.visit('/home');
    cy.wait('@getFeedData');

    // Start swiping but don't complete
    cy.get('[data-testid="task-card-task-1"]')
      .trigger('mousedown', { clientX: 100 })
      .trigger('mousemove', { clientX: -30 });

    // Should show discard hint
    cy.get('[data-testid="task-card-task-1"]').should('contain', 'X');
  });

  it('should handle task acceptance', () => {
    cy.visit('/home');
    cy.wait('@getFeedData');

    // Click accept button
    cy.get('[data-testid="accept-task-button"]').first().click();

    // Should log acceptance (in real app, would navigate to task page)
    cy.window().its('console.log').should('be.called');
  });

  it('should support keyboard navigation', () => {
    cy.visit('/home');
    cy.wait('@getFeedData');

    // Tab through interactive elements
    cy.get('body').tab();
    cy.focused().should('exist');

    // Test keyboard activation of task card
    cy.get('[data-testid="task-card-task-1"]').focus();
    cy.get('[data-testid="task-card-task-1"]').type('{enter}');

    // Should trigger task acceptance
    cy.window().its('console.log').should('be.called');
  });

  it('should toggle filters panel', () => {
    cy.visit('/home');
    cy.wait('@getFeedData');

    // Click filters button
    cy.contains('Filters').click();

    // Filter panel should be visible
    cy.contains('Skills').should('be.visible');
    cy.contains('Difficulty').should('be.visible');
    cy.contains('Type').should('be.visible');

    // Click again to hide
    cy.contains('Filters').click();
    cy.contains('Skills').should('not.exist');
  });

  it('should filter by skills', () => {
    cy.visit('/home');
    cy.wait('@getFeedData');

    // Open filters
    cy.contains('Filters').click();

    // Select Design skill
    cy.contains('🎨 Design').click();
    cy.contains('Apply Filters').click();

    // Should only show design tasks
    cy.get('[data-testid="task-card-task-1"]').should('be.visible');
    cy.get('[data-testid="task-card-task-2"]').should('not.exist');
  });

  it('should filter by difficulty', () => {
    cy.visit('/home');
    cy.wait('@getFeedData');

    // Open filters
    cy.contains('Filters').click();

    // Select Hard difficulty
    cy.contains('Hard').click();
    cy.contains('Apply Filters').click();

    // Should only show hard tasks
    cy.get('[data-testid="task-card-task-2"]').should('be.visible');
    cy.get('[data-testid="task-card-task-1"]').should('not.exist');
  });

  it('should filter by type', () => {
    cy.visit('/home');
    cy.wait('@getFeedData');

    // Open filters
    cy.contains('Filters').click();

    // Select Challenge type
    cy.contains('Challenge').click();
    cy.contains('Apply Filters').click();

    // Should only show challenge tasks
    cy.get('[data-testid="task-card-task-3"]').should('be.visible');
    cy.get('[data-testid="task-card-task-1"]').should('not.exist');
  });

  it('should clear all filters', () => {
    cy.visit('/home');
    cy.wait('@getFeedData');

    // Open filters and apply some
    cy.contains('Filters').click();
    cy.contains('🎨 Design').click();
    cy.contains('Apply Filters').click();

    // Should filter results
    cy.get('[data-testid="task-card-task-2"]').should('not.exist');

    // Clear filters
    cy.contains('Filters').click();
    cy.contains('Clear All').click();

    // Should show all tasks again
    cy.get('[data-testid="task-card-task-1"]').should('be.visible');
    cy.get('[data-testid="task-card-task-2"]').should('be.visible');
    cy.get('[data-testid="task-card-task-3"]').should('be.visible');
  });

  it('should handle loading state', () => {
    // Mock slow response
    cy.intercept('GET', '/api/feed*', (req) => {
      req.reply({
        delay: 1000,
        statusCode: 200,
        body: {
          success: true,
          data: { tasks: [], pagination: { hasNextPage: false }, metadata: {} },
        },
      });
    }).as('getSlowFeedData');

    cy.visit('/home');

    // Should show loading state
    cy.contains('Loading personalized recommendations...').should('be.visible');
  });

  it('should handle error state', () => {
    // Mock error response
    cy.intercept('GET', '/api/feed*', {
      statusCode: 500,
      body: { success: false, message: 'Server error' },
    }).as('getErrorFeedData');

    cy.visit('/home');
    cy.wait('@getErrorFeedData');

    // Should show error state
    cy.contains('Error Loading Feed').should('be.visible');
    cy.contains('Try Again').should('be.visible');
  });

  it('should handle empty feed state', () => {
    // Mock empty response
    cy.intercept('GET', '/api/feed*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          tasks: [],
          pagination: { hasNextPage: false },
          metadata: { total_recommendations: 0 },
        },
      },
    }).as('getEmptyFeedData');

    cy.visit('/home');
    cy.wait('@getEmptyFeedData');

    // Should show empty state
    cy.contains('No quests left').should('be.visible');
    cy.contains('Come back tomorrow').should('be.visible');
  });

  it('should refresh feed', () => {
    cy.visit('/home');
    cy.wait('@getFeedData');

    // Click refresh button
    cy.contains('Refresh').click();

    // Should reload data
    cy.wait('@getFeedData');
  });

  it('should display task type badges correctly', () => {
    cy.visit('/home');
    cy.wait('@getFeedData');

    // Check arena task
    cy.get('[data-testid="task-card-task-1"]').should('contain', 'Arena');

    // Check challenge task
    cy.get('[data-testid="task-card-task-3"]').should('contain', 'Challenge');
  });

  it('should display difficulty badges correctly', () => {
    cy.visit('/home');
    cy.wait('@getFeedData');

    // Check medium difficulty
    cy.get('[data-testid="task-card-task-1"]').should('contain', 'medium');

    // Check hard difficulty
    cy.get('[data-testid="task-card-task-2"]').should('contain', 'hard');
  });

  it('should display task tags', () => {
    cy.visit('/home');
    cy.wait('@getFeedData');

    // Check if tags are displayed
    cy.get('[data-testid="task-card-task-1"]').should('contain', 'UI/UX');
    cy.get('[data-testid="task-card-task-1"]').should('contain', 'Responsive');
    cy.get('[data-testid="task-card-task-1"]').should('contain', 'SaaS');
  });

  it('should handle touch swipe on mobile', () => {
    cy.visit('/home');
    cy.wait('@getFeedData');

    // Simulate touch swipe
    cy.get('[data-testid="task-card-task-1"]')
      .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
      .trigger('touchmove', { touches: [{ clientX: -50, clientY: 100 }] })
      .trigger('touchend');

    // Task should be removed
    cy.get('[data-testid="task-card-task-1"]').should('not.exist');
  });

  it('should have proper ARIA labels', () => {
    cy.visit('/home');
    cy.wait('@getFeedData');

    // Check ARIA labels
    cy.get('[data-testid="task-card-task-1"]')
      .should('have.attr', 'aria-label')
      .and('include', 'Task: Design a Modern Landing Page');

    cy.get('[data-testid="accept-task-button"]')
      .should('have.attr', 'aria-label')
      .and('include', 'Accept task: Design a Modern Landing Page');
  });

  it('should support infinite scroll', () => {
    // Mock paginated response
    cy.intercept('GET', '/api/feed*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          tasks: [
            {
              id: 'task-4',
              title: 'New Task',
              description: 'A new task for testing',
              type: 'arena',
              skill_area: 'design',
              points: 100,
              xp_value: 50,
              difficulty: 'easy',
              duration: 60,
              relevance_score: 80,
              relevance_reason: 'Test reason',
              created_at: '2024-01-15T10:00:00Z',
              is_active: true,
            },
          ],
          pagination: {
            page: 2,
            limit: 10,
            total: 4,
            hasNextPage: false,
          },
          metadata: {},
        },
      },
    }).as('getMoreFeedData');

    cy.visit('/home');
    cy.wait('@getFeedData');

    // Scroll to bottom to trigger infinite scroll
    cy.scrollTo('bottom');

    // Should load more data
    cy.wait('@getMoreFeedData');
  });

  it('should display empty state when no tasks available', () => {
    // Mock empty response
    cy.intercept('GET', '/api/feed*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          tasks: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            hasNextPage: false,
          },
          metadata: {},
        },
      },
    }).as('getEmptyFeedData');

    cy.visit('/home');
    cy.wait('@getEmptyFeedData');

    // Check empty state
    cy.get('h3').should('contain', 'No quests left');
    cy.get('p').should('contain', 'Come back tomorrow 💫');
    cy.get('button').should('contain', 'Refresh');
  });

  it('should handle API errors gracefully', () => {
    // Mock error response
    cy.intercept('GET', '/api/feed*', {
      statusCode: 500,
      body: { error: 'Internal server error' },
    }).as('getFeedError');

    cy.visit('/home');
    cy.wait('@getFeedError');

    // Check error state
    cy.get('p').should('contain', 'Failed to load tasks');
    cy.get('button').should('contain', 'Try Again');
  });

  it('should show loading state while fetching tasks', () => {
    // Mock delayed response
    cy.intercept('GET', '/api/feed*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          tasks: [],
          pagination: { page: 1, limit: 10, total: 0, hasNextPage: false },
          metadata: {},
        },
      },
      delay: 1000,
    }).as('getDelayedFeedData');

    cy.visit('/home');

    // Check loading state
    cy.get('p').should('contain', 'Loading AI recommendations');

    cy.wait('@getDelayedFeedData');
  });
});
