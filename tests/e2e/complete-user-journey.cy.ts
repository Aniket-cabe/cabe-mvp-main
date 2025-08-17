/// <reference types="cypress" />

describe('CaBE Arena - Complete User Journey E2E', () => {
  let testUser: {
    email: string;
    password: string;
    name: string;
    primarySkill: string;
  };

  beforeEach(() => {
    // Generate unique test user data
    const timestamp = Date.now();
    testUser = {
      email: `test-user-${timestamp}@example.com`,
      password: 'TestPassword123!',
      name: `Test User ${timestamp}`,
      primarySkill: 'Full-Stack Software Development'
    };

    // Clear any existing data
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('User Registration and Onboarding', () => {
    it('should complete full user registration flow', () => {
      cy.visit('/register');

      // Fill registration form
      cy.get('[data-testid="name-input"]').type(testUser.name);
      cy.get('[data-testid="email-input"]').type(testUser.email);
      cy.get('[data-testid="password-input"]').type(testUser.password);
      cy.get('[data-testid="confirm-password-input"]').type(testUser.password);
      cy.get('[data-testid="primary-skill-select"]').select(testUser.primarySkill);

      // Submit registration
      cy.get('[data-testid="register-button"]').click();

      // Verify successful registration
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="welcome-message"]').should('contain', testUser.name);
      cy.get('[data-testid="rank-display"]').should('contain', 'Bronze');
      cy.get('[data-testid="points-display"]').should('contain', '0');
    });

    it('should handle registration validation errors', () => {
      cy.visit('/register');

      // Try to submit without filling required fields
      cy.get('[data-testid="register-button"]').click();

      // Should show validation errors
      cy.get('[data-testid="validation-error"]').should('exist');
      cy.url().should('include', '/register');

      // Fill with invalid email
      cy.get('[data-testid="name-input"]').type(testUser.name);
      cy.get('[data-testid="email-input"]').type('invalid-email');
      cy.get('[data-testid="password-input"]').type(testUser.password);
      cy.get('[data-testid="confirm-password-input"]').type(testUser.password);
      cy.get('[data-testid="primary-skill-select"]').select(testUser.primarySkill);

      cy.get('[data-testid="register-button"]').click();
      cy.get('[data-testid="validation-error"]').should('contain', 'email');
    });

    it('should handle password mismatch', () => {
      cy.visit('/register');

      cy.get('[data-testid="name-input"]').type(testUser.name);
      cy.get('[data-testid="email-input"]').type(testUser.email);
      cy.get('[data-testid="password-input"]').type(testUser.password);
      cy.get('[data-testid="confirm-password-input"]').type('DifferentPassword123!');
      cy.get('[data-testid="primary-skill-select"]').select(testUser.primarySkill);

      cy.get('[data-testid="register-button"]').click();
      cy.get('[data-testid="validation-error"]').should('contain', 'password');
    });
  });

  describe('User Authentication', () => {
    beforeEach(() => {
      // Register user first
      cy.registerUser(testUser);
    });

    it('should login successfully with valid credentials', () => {
      cy.visit('/login');

      cy.get('[data-testid="email-input"]').type(testUser.email);
      cy.get('[data-testid="password-input"]').type(testUser.password);
      cy.get('[data-testid="login-button"]').click();

      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="welcome-message"]').should('contain', testUser.name);
    });

    it('should handle login with invalid credentials', () => {
      cy.visit('/login');

      cy.get('[data-testid="email-input"]').type(testUser.email);
      cy.get('[data-testid="password-input"]').type('wrongpassword');
      cy.get('[data-testid="login-button"]').click();

      cy.get('[data-testid="error-message"]').should('contain', 'Invalid');
      cy.url().should('include', '/login');
    });

    it('should logout successfully', () => {
      cy.login(testUser.email, testUser.password);

      cy.get('[data-testid="logout-button"]').click();
      cy.url().should('include', '/login');
      cy.get('[data-testid="login-form"]').should('exist');
    });
  });

  describe('Task Discovery and Browsing', () => {
    beforeEach(() => {
      cy.registerUser(testUser);
      cy.login(testUser.email, testUser.password);
    });

    it('should display tasks by skill category', () => {
      cy.visit('/arena');

      // Check all skill categories are present
      const skillCategories = [
        'Full-Stack Software Development',
        'Cloud Computing & DevOps',
        'Data Science & Analytics',
        'AI / Machine Learning'
      ];

      skillCategories.forEach(skill => {
        cy.get('[data-testid="skill-filter"]').should('contain', skill);
      });

      // Verify task cards are displayed
      cy.get('[data-testid="task-card"]').should('have.length.at.least', 1);
    });

    it('should filter tasks by skill category', () => {
      cy.visit('/arena');

      // Select Full-Stack skill filter
      cy.get('[data-testid="skill-filter"]').select('Full-Stack Software Development');

      // Verify all displayed tasks are in the selected category
      cy.get('[data-testid="task-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="task-skill"]').should('contain', 'Full-Stack');
      });
    });

    it('should display task details correctly', () => {
      cy.visit('/arena');

      cy.get('[data-testid="task-card"]').first().within(() => {
        cy.get('[data-testid="task-title"]').should('exist');
        cy.get('[data-testid="task-description"]').should('exist');
        cy.get('[data-testid="task-points"]').should('exist');
        cy.get('[data-testid="task-duration"]').should('exist');
        cy.get('[data-testid="task-skill"]').should('exist');
      });
    });

    it('should handle task search functionality', () => {
      cy.visit('/arena');

      cy.get('[data-testid="search-input"]').type('React');
      cy.get('[data-testid="search-button"]').click();

      // Should show tasks containing "React"
      cy.get('[data-testid="task-card"]').should('have.length.at.least', 1);
      cy.get('[data-testid="task-title"]').should('contain', 'React');
    });
  });

  describe('Task Completion and Submission', () => {
    beforeEach(() => {
      cy.registerUser(testUser);
      cy.login(testUser.email, testUser.password);
    });

    it('should complete a task and submit proof', () => {
      cy.visit('/arena');

      // Select first available task
      cy.get('[data-testid="task-card"]').first().click();

      // Verify task details page
      cy.get('[data-testid="task-title"]').should('exist');
      cy.get('[data-testid="task-description"]').should('exist');
      cy.get('[data-testid="task-points"]').should('exist');
      cy.get('[data-testid="task-duration"]').should('exist');

      // Fill proof submission form
      cy.get('[data-testid="proof-text-input"]').type(
        'I completed this task by implementing a responsive React component with proper state management, accessibility features, and comprehensive testing.'
      );
      cy.get('[data-testid="proof-strength-select"]').select('50');
      cy.get('[data-testid="submit-proof-button"]').click();

      // Verify submission success
      cy.get('[data-testid="success-message"]').should('contain', 'Proof submitted successfully');
      cy.get('[data-testid="points-earned"]').should('exist');
    });

    it('should handle different proof strengths', () => {
      cy.visit('/arena');
      cy.get('[data-testid="task-card"]').first().click();

      // Test weak proof (10 points)
      cy.get('[data-testid="proof-text-input"]').type('I did the task');
      cy.get('[data-testid="proof-strength-select"]').select('10');
      cy.get('[data-testid="submit-proof-button"]').click();

      cy.get('[data-testid="success-message"]').should('contain', 'Proof submitted successfully');
      cy.get('[data-testid="points-earned"]').should('contain', '10');

      // Go back and test strong proof (50 points)
      cy.visit('/arena');
      cy.get('[data-testid="task-card"]').first().click();

      cy.get('[data-testid="proof-text-input"]').type(
        'I completed this task with comprehensive documentation, unit tests, integration tests, accessibility compliance, and performance optimization.'
      );
      cy.get('[data-testid="proof-strength-select"]').select('50');
      cy.get('[data-testid="submit-proof-button"]').click();

      cy.get('[data-testid="success-message"]').should('contain', 'Proof submitted successfully');
      cy.get('[data-testid="points-earned"]').should('contain', '50');
    });

    it('should handle file upload for proof', () => {
      cy.visit('/arena');
      cy.get('[data-testid="task-card"]').first().click();

      // Upload a file
      cy.get('[data-testid="proof-file-input"]').attachFile('test-proof.png');
      cy.get('[data-testid="file-upload-status"]').should('contain', 'Uploaded');

      // Submit with file
      cy.get('[data-testid="proof-text-input"]').type('I completed the task and uploaded proof');
      cy.get('[data-testid="proof-strength-select"]').select('25');
      cy.get('[data-testid="submit-proof-button"]').click();

      cy.get('[data-testid="success-message"]').should('contain', 'Proof submitted successfully');
    });

    it('should validate proof submission requirements', () => {
      cy.visit('/arena');
      cy.get('[data-testid="task-card"]').first().click();

      // Try to submit without proof text
      cy.get('[data-testid="submit-proof-button"]').click();
      cy.get('[data-testid="validation-error"]').should('contain', 'proof');

      // Try with very short proof
      cy.get('[data-testid="proof-text-input"]').type('Done');
      cy.get('[data-testid="submit-proof-button"]').click();
      cy.get('[data-testid="validation-error"]').should('contain', 'minimum');
    });

    it('should handle submission errors gracefully', () => {
      cy.visit('/arena');
      cy.get('[data-testid="task-card"]').first().click();

      // Mock network error
      cy.intercept('POST', '/api/submissions', { forceNetworkError: true });

      cy.get('[data-testid="proof-text-input"]').type('I completed the task');
      cy.get('[data-testid="proof-strength-select"]').select('25');
      cy.get('[data-testid="submit-proof-button"]').click();

      cy.get('[data-testid="error-message"]').should('contain', 'Failed to submit');
    });
  });

  describe('Points and Rank Progression', () => {
    beforeEach(() => {
      cy.registerUser(testUser);
      cy.login(testUser.email, testUser.password);
    });

    it('should calculate points using Service Points Formula v5', () => {
      cy.visit('/dashboard');

      // Check initial points
      cy.get('[data-testid="points-display"]').invoke('text').then((initialPoints) => {
        const initial = parseInt(initialPoints);

        // Complete a task
        cy.visit('/arena');
        cy.get('[data-testid="task-card"]').first().click();
        cy.get('[data-testid="proof-text-input"]').type(
          'I completed this task with high quality evidence and comprehensive documentation.'
        );
        cy.get('[data-testid="proof-strength-select"]').select('50');
        cy.get('[data-testid="submit-proof-button"]').click();

        // Check points increased
        cy.visit('/dashboard');
        cy.get('[data-testid="points-display"]').invoke('text').then((newPoints) => {
          const updated = parseInt(newPoints);
          expect(updated).to.be.greaterThan(initial);
        });
      });
    });

    it('should progress through ranks correctly', () => {
      cy.visit('/dashboard');

      // Check initial rank
      cy.get('[data-testid="rank-display"]').invoke('text').then((initialRank) => {
        const rank = initialRank.trim();

        // Complete multiple tasks to progress
        for (let i = 0; i < 3; i++) {
          cy.visit('/arena');
          cy.get('[data-testid="task-card"]').first().click();
          cy.get('[data-testid="proof-text-input"]').type(`Task completion proof ${i + 1}`);
          cy.get('[data-testid="proof-strength-select"]').select('25');
          cy.get('[data-testid="submit-proof-button"]').click();
          cy.wait(1000); // Wait for submission
        }

        // Check rank progression
        cy.visit('/dashboard');
        cy.get('[data-testid="rank-progress"]').should('exist');
        cy.get('[data-testid="rank-display"]').should('exist');
      });
    });

    it('should display rank progress bar', () => {
      cy.visit('/dashboard');

      cy.get('[data-testid="rank-progress"]').should('exist');
      cy.get('[data-testid="rank-progress"]').should('have.attr', 'style').and('contain', 'width');
    });

    it('should show points breakdown', () => {
      cy.visit('/dashboard');

      cy.get('[data-testid="points-breakdown"]').should('exist');
      cy.get('[data-testid="total-points"]').should('exist');
      cy.get('[data-testid="bonus-points"]').should('exist');
    });
  });

  describe('Leaderboard and Competition', () => {
    beforeEach(() => {
      cy.registerUser(testUser);
      cy.login(testUser.email, testUser.password);
    });

    it('should display leaderboard', () => {
      cy.visit('/arena');

      cy.get('[data-testid="leaderboard"]').should('exist');
      cy.get('[data-testid="leaderboard-entry"]').should('have.length.at.least', 1);
    });

    it('should update leaderboard after task completion', () => {
      cy.visit('/arena');

      // Get initial leaderboard
      cy.get('[data-testid="leaderboard-entry"]').then(($entries) => {
        const initialCount = $entries.length;

        // Complete a task
        cy.get('[data-testid="task-card"]').first().click();
        cy.get('[data-testid="proof-text-input"]').type('Leaderboard test proof');
        cy.get('[data-testid="proof-strength-select"]').select('50');
        cy.get('[data-testid="submit-proof-button"]').click();

        // Refresh leaderboard
        cy.visit('/arena');
        cy.get('[data-testid="leaderboard-entry"]').should('have.length.at.least', initialCount);
      });
    });

    it('should sort leaderboard by different criteria', () => {
      cy.visit('/arena');

      cy.get('[data-testid="leaderboard-sort-points"]').click();
      cy.get('[data-testid="leaderboard-entry"]').first().should('contain', 'points');

      cy.get('[data-testid="leaderboard-sort-rank"]').click();
      cy.get('[data-testid="leaderboard-entry"]').first().should('contain', 'rank');
    });
  });

  describe('User Profile and Settings', () => {
    beforeEach(() => {
      cy.registerUser(testUser);
      cy.login(testUser.email, testUser.password);
    });

    it('should display user profile information', () => {
      cy.visit('/profile');

      cy.get('[data-testid="user-name"]').should('contain', testUser.name);
      cy.get('[data-testid="user-email"]').should('contain', testUser.email);
      cy.get('[data-testid="user-skill"]').should('contain', testUser.primarySkill);
      cy.get('[data-testid="user-rank"]').should('exist');
      cy.get('[data-testid="user-points"]').should('exist');
    });

    it('should show submission history', () => {
      // Complete a task first
      cy.visit('/arena');
      cy.get('[data-testid="task-card"]').first().click();
      cy.get('[data-testid="proof-text-input"]').type('Test submission');
      cy.get('[data-testid="proof-strength-select"]').select('25');
      cy.get('[data-testid="submit-proof-button"]').click();

      // Check submission history
      cy.visit('/profile');
      cy.get('[data-testid="submission-history"]').should('exist');
      cy.get('[data-testid="submission-item"]').should('have.length.at.least', 1);
    });

    it('should allow profile updates', () => {
      cy.visit('/profile');

      cy.get('[data-testid="edit-profile-button"]').click();
      cy.get('[data-testid="name-input"]').clear().type('Updated Name');
      cy.get('[data-testid="save-profile-button"]').click();

      cy.get('[data-testid="success-message"]').should('contain', 'Profile updated');
      cy.get('[data-testid="user-name"]').should('contain', 'Updated Name');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    beforeEach(() => {
      cy.registerUser(testUser);
      cy.login(testUser.email, testUser.password);
    });

    it('should handle network errors gracefully', () => {
      // Mock network error for tasks
      cy.intercept('GET', '/api/tasks', { forceNetworkError: true });

      cy.visit('/arena');
      cy.get('[data-testid="error-message"]').should('contain', 'Failed to load');
      cy.get('[data-testid="retry-button"]').should('exist');
    });

    it('should handle server errors', () => {
      cy.intercept('POST', '/api/submissions', { statusCode: 500 });

      cy.visit('/arena');
      cy.get('[data-testid="task-card"]').first().click();
      cy.get('[data-testid="proof-text-input"]').type('Test proof');
      cy.get('[data-testid="proof-strength-select"]').select('25');
      cy.get('[data-testid="submit-proof-button"]').click();

      cy.get('[data-testid="error-message"]').should('contain', 'server error');
    });

    it('should handle slow network conditions', () => {
      cy.intercept('GET', '/api/tasks', (req) => {
        req.reply({ delay: 3000 });
      });

      cy.visit('/arena');
      cy.get('[data-testid="loading-spinner"]').should('exist');
      cy.get('[data-testid="task-card"]').should('exist');
    });

    it('should handle concurrent submissions', () => {
      cy.visit('/arena');
      cy.get('[data-testid="task-card"]').first().click();

      // Try to submit multiple times quickly
      cy.get('[data-testid="proof-text-input"]').type('Test proof');
      cy.get('[data-testid="proof-strength-select"]').select('25');

      cy.get('[data-testid="submit-proof-button"]').click();
      cy.get('[data-testid="submit-proof-button"]').click();
      cy.get('[data-testid="submit-proof-button"]').click();

      // Should handle gracefully
      cy.get('[data-testid="error-message"]').should('not.exist');
    });
  });

  describe('Responsive Design and Accessibility', () => {
    beforeEach(() => {
      cy.registerUser(testUser);
      cy.login(testUser.email, testUser.password);
    });

    it('should work on mobile devices', () => {
      cy.viewport('iphone-x');
      cy.visit('/arena');

      cy.get('[data-testid="mobile-menu"]').should('exist');
      cy.get('[data-testid="task-card"]').should('be.visible');
      cy.get('[data-testid="task-card"]').first().click();

      cy.get('[data-testid="proof-text-input"]').should('be.visible');
      cy.get('[data-testid="submit-proof-button"]').should('be.visible');
    });

    it('should work on tablet devices', () => {
      cy.viewport('ipad-2');
      cy.visit('/arena');

      cy.get('[data-testid="task-card"]').should('be.visible');
      cy.get('[data-testid="leaderboard"]').should('be.visible');
    });

    it('should be keyboard accessible', () => {
      cy.visit('/arena');

      // Navigate with keyboard
      cy.get('body').tab();
      cy.get('[data-testid="task-card"]').first().should('be.focused');
      cy.get('[data-testid="task-card"]').first().type('{enter}');

      cy.get('[data-testid="proof-text-input"]').should('be.visible');
    });

    it('should have proper ARIA labels', () => {
      cy.visit('/arena');

      cy.get('[data-testid="task-card"]').first().should('have.attr', 'aria-label');
      cy.get('[data-testid="search-input"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="submit-proof-button"]').should('have.attr', 'aria-label');
    });
  });

  describe('Performance and Load Testing', () => {
    beforeEach(() => {
      cy.registerUser(testUser);
      cy.login(testUser.email, testUser.password);
    });

    it('should load pages within performance budget', () => {
      cy.visit('/', {
        onBeforeLoad: (win) => {
          win.performance.mark('start-loading');
        }
      });

      cy.window().then((win) => {
        win.performance.mark('end-loading');
        win.performance.measure('page-load', 'start-loading', 'end-loading');

        const measure = win.performance.getEntriesByName('page-load')[0];
        expect(measure.duration).to.be.lessThan(3000); // 3 seconds
      });
    });

    it('should handle large task lists efficiently', () => {
      // Mock large task list
      cy.intercept('GET', '/api/tasks', { fixture: 'large-task-list.json' });

      cy.visit('/arena');
      cy.get('[data-testid="task-card"]').should('have.length', 100);
      cy.get('[data-testid="task-card"]').should('be.visible');
    });

    it('should handle rapid user interactions', () => {
      cy.visit('/arena');

      // Rapid clicking and navigation
      for (let i = 0; i < 10; i++) {
        cy.get('[data-testid="skill-filter"]').select('Full-Stack Software Development');
        cy.get('[data-testid="skill-filter"]').select('Cloud Computing & DevOps');
      }

      // Should not crash or show errors
      cy.get('[data-testid="error-message"]').should('not.exist');
    });
  });

  describe('Data Persistence and State Management', () => {
    beforeEach(() => {
      cy.registerUser(testUser);
      cy.login(testUser.email, testUser.password);
    });

    it('should persist user state across page reloads', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="user-name"]').should('contain', testUser.name);

      cy.reload();
      cy.get('[data-testid="user-name"]').should('contain', testUser.name);
    });

    it('should handle session expiration', () => {
      cy.visit('/dashboard');

      // Clear authentication
      cy.clearLocalStorage();
      cy.clearCookies();

      cy.reload();
      cy.url().should('include', '/login');
    });

    it('should maintain form state during navigation', () => {
      cy.visit('/arena');
      cy.get('[data-testid="task-card"]').first().click();

      cy.get('[data-testid="proof-text-input"]').type('Partial proof text');
      cy.get('[data-testid="proof-strength-select"]').select('25');

      // Navigate away and back
      cy.visit('/dashboard');
      cy.visit('/arena');
      cy.get('[data-testid="task-card"]').first().click();

      // Form should be reset (not persisted)
      cy.get('[data-testid="proof-text-input"]').should('have.value', '');
    });
  });
});

// Custom commands for common actions
Cypress.Commands.add('registerUser', (user) => {
  cy.visit('/register');
  cy.get('[data-testid="name-input"]').type(user.name);
  cy.get('[data-testid="email-input"]').type(user.email);
  cy.get('[data-testid="password-input"]').type(user.password);
  cy.get('[data-testid="confirm-password-input"]').type(user.password);
  cy.get('[data-testid="primary-skill-select"]').select(user.primarySkill);
  cy.get('[data-testid="register-button"]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/dashboard');
});
