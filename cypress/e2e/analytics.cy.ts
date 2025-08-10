describe('Analytics Page E2E', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/metrics/realtime/skills', {
      statusCode: 200,
      body: {
        skills: [
          { value: 'javascript', label: 'JavaScript', count: 150 },
          { value: 'python', label: 'Python', count: 120 },
        ],
        total: 2,
      },
    }).as('getSkills');

    cy.intercept('GET', '/api/metrics/realtime/types', {
      statusCode: 200,
      body: {
        types: [
          { value: 'arena', label: 'Arena', count: 200 },
          { value: 'learning', label: 'Learning', count: 100 },
        ],
        total: 2,
      },
    }).as('getTypes');

    cy.intercept('GET', '/api/metrics/realtime*', {
      statusCode: 200,
      body: {
        submissionRate: [
          { timestamp: '2024-01-01T10:00:00Z', count: 5, averageScore: '85.5' },
        ],
        activeUsers: [
          { timestamp: '2024-01-01T10:00:00Z', count: 25, uniqueUsers: 20 },
        ],
        summary: {
          totalSubmissions: 25,
          totalUsers: 30,
          averageScore: '87.3',
          topSkill: 'javascript',
        },
      },
    }).as('getMetrics');

    cy.visit('/analytics/realtime');
  });

  describe('Page Load and Charts', () => {
    it('should load analytics page with charts', () => {
      cy.get('h1').should('contain', 'Real-Time Analytics');
      cy.wait('@getMetrics');

      cy.get('[data-testid="submission-rate-chart"]').should('be.visible');
      cy.get('[data-testid="active-users-chart"]').should('be.visible');

      cy.get('[data-testid="summary-cards"]').within(() => {
        cy.get('[data-testid="total-submissions"]').should('contain', '25');
        cy.get('[data-testid="active-users"]').should('contain', '30');
      });
    });

    it('should display real-time indicators', () => {
      cy.get('[data-testid="live-indicator"]').should('be.visible');
      cy.get('[data-testid="last-updated"]').should('be.visible');
    });
  });

  describe('Filter Application', () => {
    it('should apply filters and update data', () => {
      cy.wait('@getMetrics');

      cy.get('[data-testid="filter-toggle"]').click();
      cy.get('[data-testid="skill-select"]').select('javascript');
      cy.get('[data-testid="apply-filters"]').click();

      cy.wait('@getMetrics')
        .its('request.url')
        .should('include', 'skill=javascript');
      cy.get('[data-testid="active-filters"]').should('contain', 'JavaScript');
    });

    it('should combine multiple filters', () => {
      cy.wait('@getMetrics');

      cy.get('[data-testid="filter-toggle"]').click();
      cy.get('[data-testid="skill-select"]').select('python');
      cy.get('[data-testid="type-select"]').select('learning');
      cy.get('[data-testid="apply-filters"]').click();

      cy.wait('@getMetrics')
        .its('request.url')
        .should('include', 'skill=python&type=learning');
    });
  });

  describe('Real-time Polling', () => {
    it('should poll for updates', () => {
      cy.wait('@getMetrics');
      cy.wait(6000);
      cy.get('@getMetrics.all').should('have.length.at.least', 2);
    });

    it('should toggle polling', () => {
      cy.wait('@getMetrics');

      cy.get('[data-testid="polling-toggle"]').click();
      cy.get('[data-testid="polling-toggle"]').should('contain', 'Paused');

      cy.get('[data-testid="polling-toggle"]').click();
      cy.get('[data-testid="polling-toggle"]').should('contain', 'Live');
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading state', () => {
      cy.intercept('GET', '/api/metrics/realtime*', {
        statusCode: 200,
        body: {},
        delay: 1000,
      }).as('getMetricsSlow');

      cy.visit('/analytics/realtime');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      cy.wait('@getMetricsSlow');
    });

    it('should handle errors gracefully', () => {
      cy.intercept('GET', '/api/metrics/realtime*', {
        statusCode: 500,
        body: { error: 'Internal server error' },
      }).as('getMetricsError');

      cy.visit('/analytics/realtime');
      cy.wait('@getMetricsError');

      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should pass accessibility tests', () => {
      cy.wait('@getMetrics');
      cy.injectAxe();
      cy.checkA11y('[data-testid="analytics-page"]');
    });

    it('should support keyboard navigation', () => {
      cy.wait('@getMetrics');

      cy.get('body').tab();
      cy.get('[data-testid="polling-toggle"]').should('be.focused');

      cy.get('[data-testid="polling-toggle"]').tab();
      cy.get('[data-testid="refresh-button"]').should('be.focused');
    });

    it('should have proper ARIA labels', () => {
      cy.wait('@getMetrics');

      cy.get('[data-testid="submission-rate-chart"]')
        .should('have.attr', 'role', 'img')
        .and('have.attr', 'aria-label');

      cy.get('[data-testid="active-users-chart"]')
        .should('have.attr', 'role', 'img')
        .and('have.attr', 'aria-label');
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on different screen sizes', () => {
      cy.wait('@getMetrics');

      cy.viewport('iphone-6');
      cy.get('[data-testid="submission-rate-chart"]').should('be.visible');

      cy.viewport('ipad-2');
      cy.get('[data-testid="active-users-chart"]').should('be.visible');

      cy.viewport(1920, 1080);
      cy.get('[data-testid="summary-cards"]').should('be.visible');
    });
  });
});
