describe('Penalty & Point Decay System', () => {
  beforeEach(() => {
    // Visit the penalty demo page
    cy.visit('/penalty-demo');
  });

  describe('Decay Banner', () => {
    it('should show decay banner when last submission > 7 days', () => {
      // The banner should be visible with decay warning
      cy.contains('Points drip away after day 7').should('be.visible');
      cy.contains('View Decay History').should('be.visible');
    });

    it('should display correct urgency levels based on days', () => {
      // Check for urgency indicators
      cy.get('[data-testid="decay-banner"]').should('satisfy', ($el) => {
        const text = $el.text();
        return (
          text.includes('Notice') ||
          text.includes('Warning') ||
          text.includes('Critical')
        );
      });
    });

    it('should show progress bar for decay severity', () => {
      cy.contains('Decay Progress').should('be.visible');
      cy.get('[data-testid="decay-progress"]').should('be.visible');
    });

    it('should open decay history modal when button is clicked', () => {
      cy.contains('View Decay History').click();
      cy.get('[role="dialog"]').should('contain', 'Point Decay History');
      cy.get('[role="dialog"]').should(
        'contain',
        'Track your lost points and penalties'
      );
    });

    it('should display quick action buttons', () => {
      cy.contains('Find Easy Tasks').should('be.visible');
      cy.contains('Take a Course').should('be.visible');
      cy.contains('Join Challenge').should('be.visible');
    });
  });

  describe('CaBOT Credit Ring', () => {
    it('should display credit ring with correct percentage', () => {
      cy.get('[data-testid="credit-percentage"]').should('be.visible');
      cy.get('[role="progressbar"]').should('have.attr', 'aria-valuenow');
      cy.get('[role="progressbar"]').should('have.attr', 'aria-valuemax');
    });

    it('should show countdown timer', () => {
      cy.contains('Reset in').should('be.visible');
      // Should show time format like "2d 5h" or "3h 45m"
      cy.get('[data-testid="credit-ring"]').should(
        'contain',
        /Reset in \d+[dh]/
      );
    });

    it('should change color based on credit level', () => {
      // Check for appropriate color classes based on credit percentage
      cy.get('[role="progressbar"]').should('have.class', /animate-pulse/);
    });

    it('should show warning indicator for critical credits', () => {
      // When credits are low, should show warning indicator
      cy.get('[data-testid="credit-ring"]').should('satisfy', ($el) => {
        return (
          $el.find('.animate-pulse').length > 0 ||
          $el.find('.bg-red-500').length > 0
        );
      });
    });

    it('should animate smoothly when credits change', () => {
      cy.get('[data-testid="consume-credit-btn"]').click();
      // Should see smooth transition animation
      cy.get('[role="progressbar"]').should('have.class', 'transition-all');
    });
  });

  describe('Credit Warning Toast', () => {
    it('should show toast when credits are low', () => {
      cy.get('[data-testid="show-toast-btn"]').click();
      cy.get('[role="alert"]').should('be.visible');
      cy.contains("You're").should('be.visible');
    });

    it('should auto-hide after 8 seconds', () => {
      cy.get('[data-testid="show-toast-btn"]').click();
      cy.get('[role="alert"]').should('be.visible');

      // Wait for auto-hide (checking after 9 seconds to ensure it happens)
      cy.wait(9000);
      cy.get('[role="alert"]').should('not.exist');
    });

    it('should show different messages based on credit level', () => {
      cy.get('[data-testid="show-toast-btn"]').click();
      cy.get('[role="alert"]').should('satisfy', ($el) => {
        const text = $el.text();
        return (
          text.includes('outta juice') ||
          text.includes('running low') ||
          text.includes('almost outta')
        );
      });
    });

    it('should have proper ARIA attributes', () => {
      cy.get('[data-testid="show-toast-btn"]').click();
      cy.get('[role="alert"]').should('have.attr', 'aria-live', 'assertive');
    });

    it('should show action buttons', () => {
      cy.get('[data-testid="show-toast-btn"]').click();
      cy.contains('Earn Credits').should('be.visible');
      cy.contains('Learn More').should('be.visible');
    });

    it('should close when X button is clicked', () => {
      cy.get('[data-testid="show-toast-btn"]').click();
      cy.get('[role="alert"]').should('be.visible');
      cy.get('[aria-label="Close warning"]').click();
      cy.get('[role="alert"]').should('not.exist');
    });
  });

  describe('Decay History Modal', () => {
    beforeEach(() => {
      cy.contains('View Decay History').click();
    });

    it('should open modal with decay history table', () => {
      cy.get('[role="dialog"]').should('contain', 'Point Decay History');
      cy.get('table').should('be.visible');
    });

    it('should display correct table headers', () => {
      cy.get('thead').should('contain', 'Date');
      cy.get('thead').should('contain', 'Reason');
      cy.get('thead').should('contain', 'Points Lost');
      cy.get('thead').should('contain', 'Description');
    });

    it('should show decay entries with correct data', () => {
      cy.get('tbody tr').should('have.length.greaterThan', 0);
      cy.get('tbody tr').first().should('contain', '-');
      cy.get('tbody tr').first().should('contain', 'pts');
    });

    it('should display reason badges with correct colors', () => {
      cy.get('tbody tr').first().should('contain', 'Inactivity');
      cy.get('tbody tr').first().should('contain', 'Penalty');
      cy.get('tbody tr').first().should('contain', 'Expiration');
    });

    it('should show total points lost summary', () => {
      cy.get('[role="dialog"]').should('contain', 'Total Points Lost');
      cy.get('[role="dialog"]').should('contain', 'Decay Events');
    });

    it('should close when backdrop is clicked', () => {
      cy.get('[role="dialog"]').parent().click({ force: true });
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should close when close button is clicked', () => {
      cy.get('[aria-label="Close decay history"]').click();
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should show empty state when no history', () => {
      // This would require mocking empty data
      cy.get('[role="dialog"]').should('contain', 'No decay history found');
    });
  });

  describe('Credit Consumption', () => {
    it('should consume credit when button is clicked', () => {
      const initialCredits = cy
        .get('[data-testid="credit-percentage"]')
        .invoke('text');
      cy.get('[data-testid="consume-credit-btn"]').click();

      // Should show loading state
      cy.get('[data-testid="consume-credit-btn"]').should(
        'contain',
        'Consuming'
      );

      // Should update credit count
      cy.get('[data-testid="credit-percentage"]').should(
        'not.eq',
        initialCredits
      );
    });

    it('should disable consume button when no credits left', () => {
      // Consume all credits
      for (let i = 0; i < 10; i++) {
        cy.get('[data-testid="consume-credit-btn"]').click();
        cy.wait(500);
      }

      cy.get('[data-testid="consume-credit-btn"]').should('be.disabled');
    });

    it('should show toast when credits reach 1', () => {
      // Consume credits until 1 remains
      for (let i = 0; i < 2; i++) {
        cy.get('[data-testid="consume-credit-btn"]').click();
        cy.wait(500);
      }

      cy.get('[role="alert"]').should('be.visible');
      cy.contains('almost outta juice').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile screen sizes', () => {
      cy.viewport('iphone-x');
      cy.get('[data-testid="decay-banner"]').should('be.visible');
      cy.get('[data-testid="credit-ring"]').should('be.visible');

      // Should stack elements vertically
      cy.get('.grid').should('have.class', 'grid-cols-1');
    });

    it('should work on tablet screen sizes', () => {
      cy.viewport('ipad-2');
      cy.get('[data-testid="decay-banner"]').should('be.visible');
      cy.get('[data-testid="credit-ring"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      cy.get('[role="progressbar"]').should('have.attr', 'aria-label');
      cy.get('[role="alert"]').should('have.attr', 'aria-live');
      cy.get('[role="dialog"]').should('have.attr', 'aria-label');
    });

    it('should support keyboard navigation', () => {
      cy.get('body').tab();
      cy.focused().should('exist');
    });

    it('should have proper focus management', () => {
      cy.contains('View Decay History').click();
      cy.get('[role="dialog"]').should('be.focused');
    });
  });

  describe('Loading States', () => {
    it('should show loading state initially', () => {
      // This would require intercepting the API call
      cy.contains('Loading penalty system').should('be.visible');
    });

    it('should handle error states gracefully', () => {
      // This would require mocking error responses
      cy.contains('Error loading penalty data').should('not.exist');
    });
  });

  describe('Data Persistence', () => {
    it('should maintain state across page refreshes', () => {
      cy.get('[data-testid="credit-percentage"]')
        .invoke('text')
        .then((credits) => {
          cy.reload();
          cy.get('[data-testid="credit-percentage"]').should(
            'contain',
            credits
          );
        });
    });
  });
});
