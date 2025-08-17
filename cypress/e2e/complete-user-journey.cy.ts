/// <reference types="cypress" />

describe('Complete User Journey', () => {
  beforeEach(() => {
    // Reset database state before each test
    cy.exec('npm run db:reset:test');
    
    // Visit the application
    cy.visit('/');
  });

  it('should complete the full user journey from registration to task completion', () => {
    // Step 1: User Registration
    cy.get('[data-testid="register-button"]').click();
    cy.get('[data-testid="email-input"]').type('testuser@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="confirm-password-input"]').type('password123');
    cy.get('[data-testid="register-submit"]').click();
    
    // Verify registration success
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="welcome-message"]').should('contain', 'Welcome');

    // Step 2: Complete Onboarding
    cy.get('[data-testid="onboarding-start"]').click();
    cy.get('[data-testid="skill-selection"]').click();
    cy.get('[data-testid="skill-fullstack"]').click();
    cy.get('[data-testid="experience-level"]').select('Beginner');
    cy.get('[data-testid="onboarding-submit"]').click();
    
    // Verify onboarding completion
    cy.get('[data-testid="onboarding-complete"]').should('be.visible');

    // Step 3: Navigate to Arena
    cy.get('[data-testid="arena-nav"]').click();
    cy.url().should('include', '/arena');
    
    // Verify Arena access
    cy.get('[data-testid="arena-welcome"]').should('contain', 'Welcome to the Arena');

    // Step 4: Browse Tasks
    cy.get('[data-testid="task-feed"]').should('be.visible');
    cy.get('[data-testid="task-card"]').should('have.length.greaterThan', 0);
    
    // Filter tasks by skill area
    cy.get('[data-testid="skill-filter"]').click();
    cy.get('[data-testid="filter-fullstack"]').click();
    cy.get('[data-testid="task-card"]').each(($card) => {
      cy.wrap($card).should('contain', 'Full-Stack Development');
    });

    // Step 5: Select and Submit a Task
    cy.get('[data-testid="task-card"]').first().click();
    cy.get('[data-testid="task-details"]').should('be.visible');
    cy.get('[data-testid="submit-task-button"]').click();
    
    // Fill submission form
    cy.get('[data-testid="code-input"]').type(`
      function helloWorld() {
        console.log("Hello, World!");
        return "Hello, World!";
      }
      
      // Test the function
      helloWorld();
    `);
    cy.get('[data-testid="notes-input"]').type('My first submission to CaBE Arena');
    cy.get('[data-testid="integrity-checkbox"]').check();
    cy.get('[data-testid="submit-solution"]').click();
    
    // Verify submission success
    cy.get('[data-testid="submission-success"]').should('be.visible');
    cy.get('[data-testid="ai-score"]').should('be.visible');
    cy.get('[data-testid="points-awarded"]').should('be.visible');

    // Step 6: Check Points and Rank Progression
    cy.get('[data-testid="close-modal"]').click();
    cy.get('[data-testid="profile-nav"]').click();
    cy.url().should('include', '/profile');
    
    // Verify points and rank
    cy.get('[data-testid="user-points"]').should('contain', '150');
    cy.get('[data-testid="user-rank"]').should('contain', 'Bronze');
    cy.get('[data-testid="progress-bar"]').should('be.visible');

    // Step 7: View Leaderboard
    cy.get('[data-testid="leaderboard-nav"]').click();
    cy.url().should('include', '/leaderboard');
    cy.get('[data-testid="leaderboard-table"]').should('be.visible');
    cy.get('[data-testid="leaderboard-row"]').should('have.length.greaterThan', 0);

    // Step 8: Complete Multiple Tasks for Rank Progression
    cy.get('[data-testid="arena-nav"]').click();
    
    // Submit second task
    cy.get('[data-testid="task-card"]').eq(1).click();
    cy.get('[data-testid="submit-task-button"]').click();
    cy.get('[data-testid="code-input"]').type(`
      function fibonacci(n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
      }
      
      console.log(fibonacci(10));
    `);
    cy.get('[data-testid="notes-input"]').type('Fibonacci implementation');
    cy.get('[data-testid="integrity-checkbox"]').check();
    cy.get('[data-testid="submit-solution"]').click();
    
    // Submit third task
    cy.get('[data-testid="close-modal"]').click();
    cy.get('[data-testid="task-card"]').eq(2).click();
    cy.get('[data-testid="submit-task-button"]').click();
    cy.get('[data-testid="code-input"]').type(`
      function reverseString(str) {
        return str.split('').reverse().join('');
      }
      
      console.log(reverseString("Hello"));
    `);
    cy.get('[data-testid="notes-input"]').type('String reversal function');
    cy.get('[data-testid="integrity-checkbox"]').check();
    cy.get('[data-testid="submit-solution"]').click();

    // Step 9: Check Rank Progression
    cy.get('[data-testid="close-modal"]').click();
    cy.get('[data-testid="profile-nav"]').click();
    
    // Verify increased points
    cy.get('[data-testid="user-points"]').should('contain', '450');
    cy.get('[data-testid="completed-tasks"]').should('contain', '3');

    // Step 10: Explore Analytics
    cy.get('[data-testid="analytics-nav"]').click();
    cy.url().should('include', '/analytics');
    cy.get('[data-testid="analytics-dashboard"]').should('be.visible');
    cy.get('[data-testid="skill-chart"]').should('be.visible');
    cy.get('[data-testid="progress-chart"]').should('be.visible');

    // Step 11: Test Task Rotation
    cy.get('[data-testid="arena-nav"]').click();
    
    // Complete many tasks to trigger rotation
    for (let i = 0; i < 5; i++) {
      cy.get('[data-testid="task-card"]').first().click();
      cy.get('[data-testid="submit-task-button"]').click();
      cy.get('[data-testid="code-input"]').type(`console.log("Task ${i + 4}");`);
      cy.get('[data-testid="notes-input"]').type(`Task ${i + 4} submission`);
      cy.get('[data-testid="integrity-checkbox"]').check();
      cy.get('[data-testid="submit-solution"]').click();
      cy.get('[data-testid="close-modal"]').click();
    }

    // Verify task rotation message
    cy.get('[data-testid="rotation-notice"]').should('be.visible');

    // Step 12: Test CaBOT Integration
    cy.get('[data-testid="cabot-nav"]').click();
    cy.url().should('include', '/cabot');
    cy.get('[data-testid="cabot-interface"]').should('be.visible');
    
    // Ask CaBOT for advice
    cy.get('[data-testid="cabot-input"]').type('How can I improve my coding skills?');
    cy.get('[data-testid="cabot-submit"]').click();
    cy.get('[data-testid="cabot-response"]').should('be.visible');

    // Step 13: Test Achievement System
    cy.get('[data-testid="achievements-nav"]').click();
    cy.url().should('include', '/achievements');
    cy.get('[data-testid="achievements-grid"]').should('be.visible');
    
    // Verify earned achievements
    cy.get('[data-testid="achievement-first-task"]').should('have.class', 'earned');
    cy.get('[data-testid="achievement-bronze"]').should('have.class', 'earned');

    // Step 14: Test Social Features
    cy.get('[data-testid="community-nav"]').click();
    cy.url().should('include', '/community');
    cy.get('[data-testid="community-feed"]').should('be.visible');
    
    // Post a community update
    cy.get('[data-testid="post-input"]').type('Just completed my first task! Feeling great!');
    cy.get('[data-testid="post-submit"]').click();
    cy.get('[data-testid="community-post"]').should('contain', 'Just completed my first task!');

    // Step 15: Test Settings and Preferences
    cy.get('[data-testid="settings-nav"]').click();
    cy.url().should('include', '/settings');
    cy.get('[data-testid="settings-form"]').should('be.visible');
    
    // Update notification preferences
    cy.get('[data-testid="email-notifications"]').check();
    cy.get('[data-testid="push-notifications"]').uncheck();
    cy.get('[data-testid="save-settings"]').click();
    cy.get('[data-testid="settings-saved"]').should('be.visible');

    // Step 16: Test Logout and Session Management
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    cy.url().should('include', '/login');
    
    // Verify session is cleared
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it('should handle edge cases and error scenarios', () => {
    // Test invalid login
    cy.get('[data-testid="login-button"]').click();
    cy.get('[data-testid="email-input"]').type('invalid@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-submit"]').click();
    cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials');

    // Test task submission without integrity checkbox
    cy.get('[data-testid="register-button"]').click();
    cy.get('[data-testid="email-input"]').type('testuser2@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="confirm-password-input"]').type('password123');
    cy.get('[data-testid="register-submit"]').click();
    
    cy.get('[data-testid="arena-nav"]').click();
    cy.get('[data-testid="task-card"]').first().click();
    cy.get('[data-testid="submit-task-button"]').click();
    cy.get('[data-testid="code-input"]').type('console.log("test");');
    cy.get('[data-testid="submit-solution"]').click();
    cy.get('[data-testid="error-message"]').should('contain', 'integrity checkbox');

    // Test empty submission
    cy.get('[data-testid="code-input"]').clear();
    cy.get('[data-testid="integrity-checkbox"]').check();
    cy.get('[data-testid="submit-solution"]').click();
    cy.get('[data-testid="error-message"]').should('contain', 'solution');

    // Test rate limiting
    for (let i = 0; i < 10; i++) {
      cy.get('[data-testid="code-input"]').type(`console.log("test ${i}");`);
      cy.get('[data-testid="submit-solution"]').click();
    }
    cy.get('[data-testid="rate-limit-error"]').should('be.visible');
  });

  it('should test responsive design and mobile functionality', () => {
    // Test mobile viewport
    cy.viewport('iphone-x');
    cy.visit('/');
    
    // Verify mobile navigation
    cy.get('[data-testid="mobile-menu"]').should('be.visible');
    cy.get('[data-testid="mobile-menu"]').click();
    cy.get('[data-testid="mobile-nav-items"]').should('be.visible');
    
    // Test mobile task submission
    cy.get('[data-testid="arena-nav"]').click();
    cy.get('[data-testid="task-card"]').first().click();
    cy.get('[data-testid="submit-task-button"]').click();
    
    // Verify mobile-friendly form
    cy.get('[data-testid="code-input"]').should('be.visible');
    cy.get('[data-testid="mobile-keyboard"]').should('be.visible');
    
    // Test tablet viewport
    cy.viewport('ipad-2');
    cy.reload();
    cy.get('[data-testid="tablet-layout"]').should('be.visible');
  });

  it('should test accessibility features', () => {
    // Test keyboard navigation
    cy.visit('/');
    cy.get('body').tab();
    cy.focused().should('have.attr', 'data-testid', 'login-button');
    
    // Test screen reader compatibility
    cy.get('[data-testid="login-button"]').should('have.attr', 'aria-label');
    cy.get('[data-testid="email-input"]').should('have.attr', 'aria-describedby');
    
    // Test color contrast
    cy.get('[data-testid="main-content"]').should('have.css', 'color').and('not.eq', 'rgb(255, 255, 255)');
    
    // Test focus management
    cy.get('[data-testid="register-button"]').click();
    cy.get('[data-testid="email-input"]').should('be.focused');
  });

  it('should test performance and loading states', () => {
    // Test loading states
    cy.visit('/');
    cy.get('[data-testid="loading-spinner"]').should('be.visible');
    cy.get('[data-testid="main-content"]').should('be.visible');
    
    // Test lazy loading
    cy.get('[data-testid="arena-nav"]').click();
    cy.get('[data-testid="task-feed"]').should('be.visible');
    cy.scrollTo('bottom');
    cy.get('[data-testid="loading-more"]').should('be.visible');
    
    // Test image optimization
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'loading', 'lazy');
    });
  });

  it('should test data persistence and state management', () => {
    // Register and login
    cy.get('[data-testid="register-button"]').click();
    cy.get('[data-testid="email-input"]').type('testuser3@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="confirm-password-input"]').type('password123');
    cy.get('[data-testid="register-submit"]').click();
    
    // Complete a task
    cy.get('[data-testid="arena-nav"]').click();
    cy.get('[data-testid="task-card"]').first().click();
    cy.get('[data-testid="submit-task-button"]').click();
    cy.get('[data-testid="code-input"]').type('console.log("test");');
    cy.get('[data-testid="integrity-checkbox"]').check();
    cy.get('[data-testid="submit-solution"]').click();
    
    // Verify data persistence
    cy.reload();
    cy.get('[data-testid="user-points"]').should('contain', '150');
    cy.get('[data-testid="completed-tasks"]').should('contain', '1');
  });
});
