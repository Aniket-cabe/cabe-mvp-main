describe('Moderation Modal System', () => {
  beforeEach(() => {
    // Visit the moderation demo page
    cy.visit('/moderation-demo');
  });

  describe('Modal Opening and Display', () => {
    it('should open review pending modal with correct message', () => {
      cy.get('[data-testid="review-pending-btn"]').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.get('[aria-label="Moderation Notice"]').should('be.visible');
      cy.contains('Hold tight. Our bots are eye-balling your proof.').should(
        'be.visible'
      );
      cy.get('[data-testid="appeal-button"]').should('not.exist');
    });

    it('should open suspicious modal with correct message', () => {
      cy.get('[data-testid="suspicious-btn"]').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.contains("Hmm… stuff's not adding up. We're digging deeper.").should(
        'be.visible'
      );
      cy.get('[data-testid="appeal-button"]').should('not.exist');
    });

    it('should open rejected modal with correct message and appeal button', () => {
      cy.get('[data-testid="rejected-btn"]').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('Proof failed the vibe check. Lose 50 pts.').should(
        'be.visible'
      );
      cy.get('[data-testid="appeal-button"]').should('be.visible');
    });

    it('should display correct icons for each modal type', () => {
      // Review pending
      cy.get('[data-testid="review-pending-btn"]').click();
      cy.get('[role="dialog"]').should('contain', '🟡');
      cy.get('[role="dialog"]').should('contain', 'Clock');

      cy.get('[data-testid="close-modal"]').click();

      // Suspicious
      cy.get('[data-testid="suspicious-btn"]').click();
      cy.get('[role="dialog"]').should('contain', '🟠');
      cy.get('[role="dialog"]').should('contain', 'AlertTriangle');

      cy.get('[data-testid="close-modal"]').click();

      // Rejected
      cy.get('[data-testid="rejected-btn"]').click();
      cy.get('[role="dialog"]').should('contain', '🔴');
      cy.get('[role="dialog"]').should('contain', 'Ban');
    });
  });

  describe('Modal Interactions', () => {
    it('should close rejected modal when close button is clicked', () => {
      cy.get('[data-testid="rejected-btn"]').click();
      cy.get('[role="dialog"]').should('be.visible');

      cy.get('[data-testid="close-modal"]').click();
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should close rejected modal when backdrop is clicked', () => {
      cy.get('[data-testid="rejected-btn"]').click();
      cy.get('[role="dialog"]').should('be.visible');

      cy.get('[role="dialog"]').parent().click({ force: true });
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should not close review pending modal when backdrop is clicked', () => {
      cy.get('[data-testid="review-pending-btn"]').click();
      cy.get('[role="dialog"]').should('be.visible');

      cy.get('[role="dialog"]').parent().click({ force: true });
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('should not close suspicious modal when backdrop is clicked', () => {
      cy.get('[data-testid="suspicious-btn"]').click();
      cy.get('[role="dialog"]').should('be.visible');

      cy.get('[role="dialog"]').parent().click({ force: true });
      cy.get('[role="dialog"]').should('be.visible');
    });
  });

  describe('Keyboard Navigation and Accessibility', () => {
    it('should trap focus within the modal', () => {
      cy.get('[data-testid="rejected-btn"]').click();

      // Focus should be on the modal
      cy.get('[role="dialog"]').should('be.focused');

      // Tab should cycle through focusable elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'appeal-button');

      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'close-modal');
    });

    it('should close rejected modal with ESC key', () => {
      cy.get('[data-testid="rejected-btn"]').click();
      cy.get('[role="dialog"]').should('be.visible');

      cy.get('body').type('{esc}');
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should not close review pending modal with ESC key', () => {
      cy.get('[data-testid="review-pending-btn"]').click();
      cy.get('[role="dialog"]').should('be.visible');

      cy.get('body').type('{esc}');
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('should have proper ARIA attributes', () => {
      cy.get('[data-testid="rejected-btn"]').click();

      cy.get('[role="dialog"]').should('have.attr', 'aria-modal', 'true');
      cy.get('[role="dialog"]').should(
        'have.attr',
        'aria-label',
        'Moderation Notice'
      );
    });
  });

  describe('Appeal Form', () => {
    it('should open appeal form when appeal button is clicked', () => {
      cy.get('[data-testid="rejected-btn"]').click();
      cy.get('[data-testid="appeal-button"]').click();

      // Appeal form should be visible
      cy.get('[role="dialog"]').should('contain', 'Appeal Decision');
      cy.get('[role="dialog"]').should('contain', 'Explain why you disagree');
    });

    it('should focus on textarea when appeal form opens', () => {
      cy.get('[data-testid="rejected-btn"]').click();
      cy.get('[data-testid="appeal-button"]').click();

      cy.get('#appeal-reason').should('be.focused');
    });

    it('should validate appeal form submission', () => {
      cy.get('[data-testid="rejected-btn"]').click();
      cy.get('[data-testid="appeal-button"]').click();

      // Submit button should be disabled initially
      cy.get('button[type="submit"]').should('be.disabled');

      // Type minimum required characters
      cy.get('#appeal-reason').type(
        'This is a test appeal with enough characters to meet the minimum requirement.'
      );

      // Submit button should be enabled
      cy.get('button[type="submit"]').should('not.be.disabled');
    });

    it('should close appeal form with ESC key', () => {
      cy.get('[data-testid="rejected-btn"]').click();
      cy.get('[data-testid="appeal-button"]').click();

      cy.get('body').type('{esc}');
      cy.get('[role="dialog"]').should('not.contain', 'Appeal Decision');
    });

    it('should submit appeal form successfully', () => {
      cy.get('[data-testid="rejected-btn"]').click();
      cy.get('[data-testid="appeal-button"]').click();

      cy.get('#appeal-reason').type(
        'This is a test appeal with enough characters to meet the minimum requirement.'
      );
      cy.get('button[type="submit"]').click();

      // Should show loading state
      cy.contains('Submitting...').should('be.visible');

      // Should close after submission
      cy.get('[role="dialog"]').should('not.exist');
    });
  });

  describe('Auto-close Behavior', () => {
    it('should auto-close review pending modal after 8 seconds', () => {
      cy.get('[data-testid="review-pending-btn"]').click();
      cy.get('[role="dialog"]').should('be.visible');

      // Wait for auto-close
      cy.wait(8500);
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should auto-close suspicious modal after 12 seconds', () => {
      cy.get('[data-testid="suspicious-btn"]').click();
      cy.get('[role="dialog"]').should('be.visible');

      // Wait for auto-close
      cy.wait(12500);
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should show processing indicator for non-closable modals', () => {
      cy.get('[data-testid="review-pending-btn"]').click();
      cy.contains('Processing...').should('be.visible');

      cy.get('[data-testid="suspicious-btn"]').click();
      cy.contains('Processing...').should('be.visible');
    });
  });

  describe('Random Moderation Trigger', () => {
    it('should trigger random moderation when random button is clicked', () => {
      cy.get('[data-testid="random-btn"]').click();

      // Should open a modal with one of the three types
      cy.get('[role="dialog"]').should('be.visible');

      // Should contain one of the expected messages
      cy.get('[role="dialog"]').should('satisfy', ($el) => {
        const text = $el.text();
        return (
          text.includes('Hold tight') ||
          text.includes("stuff's not adding up") ||
          text.includes('Proof failed the vibe check')
        );
      });
    });
  });

  describe('Body Scroll Prevention', () => {
    it('should prevent body scroll when modal is open', () => {
      cy.get('[data-testid="rejected-btn"]').click();

      // Body should have overflow hidden
      cy.get('body').should('have.css', 'overflow', 'hidden');

      cy.get('[data-testid="close-modal"]').click();

      // Body should have overflow restored
      cy.get('body').should('have.css', 'overflow', 'unset');
    });
  });

  describe('Animation Effects', () => {
    it('should apply shake animation to rejected modal', () => {
      cy.get('[data-testid="rejected-btn"]').click();

      // Check for shake animation class
      cy.get('[role="dialog"]').should('have.class', 'animate-shake');
    });

    it('should apply pulse glow animation to review pending modal', () => {
      cy.get('[data-testid="review-pending-btn"]').click();

      // Check for pulse glow animation class
      cy.get('[role="dialog"]').should('have.class', 'animate-pulse-glow');
    });

    it('should apply fade-in zoom animation to suspicious modal', () => {
      cy.get('[data-testid="suspicious-btn"]').click();

      // Check for fade-in zoom animation class
      cy.get('[role="dialog"]').should('have.class', 'animate-fade-in-zoom');
    });
  });
});
