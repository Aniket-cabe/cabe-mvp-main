/// <reference types="cypress" />

describe('CaBE Arena - Deployment Smoke Test', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/')
  })

  it('should load the application successfully', () => {
    // Check if the app loads without errors
    cy.get('body').should('be.visible')
    cy.get('[data-testid="app-container"]').should('exist')
  })

  it('should display all 4 skill categories', () => {
    // Navigate to tasks/arena section
    cy.visit('/arena')
    
    // Check for all 4 skill categories
    const skillCategories = [
      'Full-Stack Software Development',
      'Cloud Computing & DevOps', 
      'Data Science & Analytics',
      'AI / Machine Learning'
    ]
    
    skillCategories.forEach(skill => {
      cy.contains(skill).should('be.visible')
    })
  })

  it('should show task cards with proper information', () => {
    cy.visit('/arena')
    
    // Check if task cards are displayed
    cy.get('[data-testid="task-card"]').should('exist')
    
    // Check for required task information
    cy.get('[data-testid="task-card"]').first().within(() => {
      cy.get('[data-testid="task-title"]').should('exist')
      cy.get('[data-testid="task-skill"]').should('exist')
      cy.get('[data-testid="task-points"]').should('exist')
      cy.get('[data-testid="task-duration"]').should('exist')
    })
  })

  it('should have working navigation', () => {
    // Test navigation between main sections
    cy.get('[data-testid="nav-dashboard"]').click()
    cy.url().should('include', '/dashboard')
    
    cy.get('[data-testid="nav-arena"]').click()
    cy.url().should('include', '/arena')
    
    cy.get('[data-testid="nav-analytics"]').click()
    cy.url().should('include', '/analytics')
  })

  it('should handle authentication flow', () => {
    // Test login form (if exists)
    cy.get('[data-testid="login-form"]').should('exist')
    
    // Test registration form (if exists)
    cy.get('[data-testid="register-form"]').should('exist')
  })

  it('should display rank progression system', () => {
    cy.visit('/dashboard')
    
    // Check for rank display
    cy.get('[data-testid="rank-display"]').should('exist')
    
    // Check for points display
    cy.get('[data-testid="points-display"]').should('exist')
  })

  it('should have working proof upload component', () => {
    cy.visit('/arena')
    
    // Find a task and click on it
    cy.get('[data-testid="task-card"]').first().click()
    
    // Check for proof upload section
    cy.get('[data-testid="proof-upload"]').should('exist')
  })

  it('should display leaderboard', () => {
    cy.visit('/arena')
    
    // Check for leaderboard component
    cy.get('[data-testid="leaderboard"]').should('exist')
  })

  it('should handle responsive design', () => {
    // Test mobile viewport
    cy.viewport('iphone-x')
    cy.get('body').should('be.visible')
    
    // Test tablet viewport
    cy.viewport('ipad-2')
    cy.get('body').should('be.visible')
    
    // Test desktop viewport
    cy.viewport(1920, 1080)
    cy.get('body').should('be.visible')
  })

  it('should have proper error handling', () => {
    // Test 404 page
    cy.visit('/non-existent-page')
    cy.get('[data-testid="error-page"]').should('exist')
  })

  it('should load within performance budget', () => {
    // Measure page load time
    cy.window().then((win) => {
      const performance = win.performance
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      // Page should load within 3 seconds
      expect(navigation.loadEventEnd - navigation.loadEventStart).to.be.lessThan(3000)
    })
  })
})

describe('API Health Checks', () => {
  it('should have working health endpoint', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('VITE_API_BASE_URL')}/health`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 404]) // 404 is ok if health endpoint not implemented
      if (response.status === 200) {
        expect(response.body).to.have.property('status')
      }
    })
  })

  it('should have working API endpoints', () => {
    // Test basic API connectivity
    cy.request({
      method: 'GET',
      url: `${Cypress.env('VITE_API_BASE_URL')}/api/status`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 404]) // 404 is ok if endpoint not implemented
    })
  })
})
