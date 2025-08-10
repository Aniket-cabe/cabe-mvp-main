describe('Analytics Filters', () => {
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

  describe('Filter Controls', () => {
    it('should display and toggle filter controls', () => {
      cy.get('[data-testid="filter-controls"]').should('be.visible');
      cy.get('[data-testid="filter-toggle"]').click();
      cy.get('[data-testid="filter-content"]').should('be.visible');
    });

    it('should load skills and types dropdowns', () => {
      cy.wait('@getSkills');
      cy.wait('@getTypes');

      cy.get('[data-testid="skill-select"]').should('be.visible');
      cy.get('[data-testid="type-select"]').should('be.visible');
    });
  });

  describe('Date Range Selection', () => {
    it('should allow date range selection', () => {
      cy.get('[data-testid="filter-toggle"]').click();

      cy.get('[data-testid="from-date"]').click();
      cy.get('.react-datepicker__day--today').click();

      cy.get('[data-testid="to-date"]').click();
      cy.get('.react-datepicker__day--today').click();

      cy.get('[data-testid="apply-filters"]').click();
      cy.wait('@getMetrics');
    });

    it('should validate date range', () => {
      cy.get('[data-testid="filter-toggle"]').click();

      // Set invalid range
      cy.get('[data-testid="from-date"]').click();
      cy.get('.react-datepicker__day').first().click();

      cy.get('[data-testid="to-date"]').click();
      cy.get('.react-datepicker__day').first().click();

      cy.get('[data-testid="date-range-error"]')
        .should('be.visible')
        .and('contain', 'From date must be before to date');
    });
  });

  describe('Skill and Type Filtering', () => {
    it('should filter by skill', () => {
      cy.get('[data-testid="filter-toggle"]').click();
      cy.get('[data-testid="skill-select"]').select('javascript');
      cy.get('[data-testid="apply-filters"]').click();

      cy.wait('@getMetrics')
        .its('request.url')
        .should('include', 'skill=javascript');
    });

    it('should filter by task type', () => {
      cy.get('[data-testid="filter-toggle"]').click();
      cy.get('[data-testid="type-select"]').select('arena');
      cy.get('[data-testid="apply-filters"]').click();

      cy.wait('@getMetrics').its('request.url').should('include', 'type=arena');
    });

    it('should combine multiple filters', () => {
      cy.get('[data-testid="filter-toggle"]').click();
      cy.get('[data-testid="skill-select"]').select('python');
      cy.get('[data-testid="type-select"]').select('learning');
      cy.get('[data-testid="apply-filters"]').click();

      cy.wait('@getMetrics')
        .its('request.url')
        .should('include', 'skill=python&type=learning');
    });
  });

  describe('Loading States', () => {
    it('should show loading state', () => {
      cy.intercept('GET', '/api/metrics/realtime*', {
        statusCode: 200,
        body: {},
        delay: 1000,
      }).as('getMetricsSlow');

      cy.get('[data-testid="filter-toggle"]').click();
      cy.get('[data-testid="apply-filters"]').click();

      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      cy.get('[data-testid="apply-filters"]').should('be.disabled');

      cy.wait('@getMetricsSlow');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', () => {
      cy.intercept('GET', '/api/metrics/realtime*', {
        statusCode: 500,
        body: { error: 'Internal server error' },
      }).as('getMetricsError');

      cy.get('[data-testid="filter-toggle"]').click();
      cy.get('[data-testid="apply-filters"]').click();

      cy.wait('@getMetricsError');
      cy.get('[data-testid="error-message"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', () => {
      cy.get('[data-testid="filter-toggle"]').click();

      cy.get('body').tab();
      cy.get('[data-testid="from-date"]').should('be.focused');

      cy.get('[data-testid="from-date"]').tab();
      cy.get('[data-testid="to-date"]').should('be.focused');
    });

    it('should have proper ARIA labels', () => {
      cy.get('[data-testid="filter-toggle"]').click();

      cy.get('[data-testid="from-date"]').should(
        'have.attr',
        'aria-label',
        'Select start date'
      );

      cy.get('[data-testid="skill-select"]').should(
        'have.attr',
        'aria-label',
        'Select skill filter'
      );
    });
  });
});
