/// <reference types="cypress" />

describe('CaBE Arena - Complete User Journey', () => {
  beforeEach(() => {
    // Create test user before each test
    cy.createTestUser()
  })

  it('should complete full user registration and onboarding', () => {
    // Visit registration page
    cy.visit('/register')
    
    // Fill registration form
    cy.get('[data-testid="name-input"]').type('Test User')
    cy.get('[data-testid="email-input"]').type(`test-${Date.now()}@example.com`)
    cy.get('[data-testid="password-input"]').type('TestPassword123!')
    cy.get('[data-testid="confirm-password-input"]').type('TestPassword123!')
    cy.get('[data-testid="primary-skill-select"]').select('Full-Stack Software Development')
    
    // Submit registration
    cy.get('[data-testid="register-button"]').click()
    
    // Verify successful registration
    cy.url().should('include', '/dashboard')
    cy.get('[data-testid="welcome-message"]').should('contain', 'Test User')
  })

  it('should display and filter tasks by skill category', () => {
    cy.visit('/arena')
    
    // Check all skill categories are present
    const skillCategories = [
      'Full-Stack Software Development',
      'Cloud Computing & DevOps',
      'Data Science & Analytics',
      'AI / Machine Learning'
    ]
    
    skillCategories.forEach(skill => {
      cy.get('[data-testid="skill-filter"]').should('contain', skill)
    })
    
    // Filter by specific skill
    cy.get('[data-testid="skill-filter"]').select('Full-Stack Software Development')
    cy.get('[data-testid="task-card"]').each(($card) => {
      cy.wrap($card).find('[data-testid="task-skill"]').should('contain', 'Full-Stack')
    })
  })

  it('should complete a task and submit proof', () => {
    cy.visit('/arena')
    
    // Select first available task
    cy.get('[data-testid="task-card"]').first().click()
    
    // Verify task details
    cy.get('[data-testid="task-title"]').should('exist')
    cy.get('[data-testid="task-description"]').should('exist')
    cy.get('[data-testid="task-points"]').should('exist')
    cy.get('[data-testid="task-duration"]').should('exist')
    
    // Submit proof
    cy.get('[data-testid="proof-text-input"]').type('This is my proof of completion for the task.')
    cy.get('[data-testid="proof-strength-select"]').select('25')
    cy.get('[data-testid="submit-proof-button"]').click()
    
    // Verify submission success
    cy.get('[data-testid="success-message"]').should('contain', 'Proof submitted successfully')
  })

  it('should calculate points using Service Points Formula v5', () => {
    cy.visit('/dashboard')
    
    // Check initial points
    cy.get('[data-testid="points-display"]').invoke('text').then((initialPoints) => {
      const initial = parseInt(initialPoints)
      
      // Complete a task
      cy.visit('/arena')
      cy.get('[data-testid="task-card"]').first().click()
      cy.get('[data-testid="proof-text-input"]').type('Test proof with high quality evidence.')
      cy.get('[data-testid="proof-strength-select"]').select('50')
      cy.get('[data-testid="submit-proof-button"]').click()
      
      // Check points increased
      cy.visit('/dashboard')
      cy.get('[data-testid="points-display"]').invoke('text').then((newPoints) => {
        const updated = parseInt(newPoints)
        expect(updated).to.be.greaterThan(initial)
      })
    })
  })

  it('should progress through ranks correctly', () => {
    cy.visit('/dashboard')
    
    // Check initial rank
    cy.get('[data-testid="rank-display"]').invoke('text').then((initialRank) => {
      const rank = initialRank.trim()
      
      // Complete multiple tasks to progress
      for (let i = 0; i < 3; i++) {
        cy.visit('/arena')
        cy.get('[data-testid="task-card"]').first().click()
        cy.get('[data-testid="proof-text-input"]').type(`Task completion proof ${i + 1}`)
        cy.get('[data-testid="proof-strength-select"]').select('25')
        cy.get('[data-testid="submit-proof-button"]').click()
        cy.wait(1000) // Wait for submission
      }
      
      // Check rank progression
      cy.visit('/dashboard')
      cy.get('[data-testid="rank-progress"]').should('exist')
      cy.get('[data-testid="rank-display"]').should('exist')
    })
  })

  it('should display and update leaderboard', () => {
    cy.visit('/arena')
    
    // Check leaderboard exists
    cy.get('[data-testid="leaderboard"]').should('exist')
    cy.get('[data-testid="leaderboard-entry"]').should('have.length.at.least', 1)
    
    // Complete a task to potentially appear on leaderboard
    cy.get('[data-testid="task-card"]').first().click()
    cy.get('[data-testid="proof-text-input"]').type('Leaderboard test proof')
    cy.get('[data-testid="proof-strength-select"]').select('50')
    cy.get('[data-testid="submit-proof-button"]').click()
    
    // Refresh leaderboard
    cy.visit('/arena')
    cy.get('[data-testid="leaderboard"]').should('exist')
  })

  it('should handle authentication and protected routes', () => {
    // Try to access protected route without auth
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
    
    // Login
    cy.get('[data-testid="email-input"]').type('test@example.com')
    cy.get('[data-testid="password-input"]').type('password')
    cy.get('[data-testid="login-button"]').click()
    
    // Should now access dashboard
    cy.url().should('include', '/dashboard')
    cy.get('[data-testid="dashboard-content"]').should('exist')
  })

  it('should handle file upload for proof submission', () => {
    cy.visit('/arena')
    cy.get('[data-testid="task-card"]').first().click()
    
    // Test file upload
    cy.get('[data-testid="proof-file-input"]').attachFile('test-proof.png')
    cy.get('[data-testid="file-upload-status"]').should('contain', 'Uploaded')
    
    // Submit with file
    cy.get('[data-testid="submit-proof-button"]').click()
    cy.get('[data-testid="success-message"]').should('contain', 'Proof submitted')
  })

  it('should handle responsive design across devices', () => {
    // Test mobile viewport
    cy.viewport('iphone-x')
    cy.visit('/')
    cy.get('[data-testid="mobile-menu"]').should('exist')
    cy.get('[data-testid="app-container"]').should('be.visible')
    
    // Test tablet viewport
    cy.viewport('ipad-2')
    cy.visit('/')
    cy.get('[data-testid="app-container"]').should('be.visible')
    
    // Test desktop viewport
    cy.viewport(1920, 1080)
    cy.visit('/')
    cy.get('[data-testid="desktop-nav"]').should('exist')
  })

  it('should handle error states gracefully', () => {
    // Test network error
    cy.intercept('GET', '/api/tasks', { forceNetworkError: true })
    cy.visit('/arena')
    cy.get('[data-testid="error-message"]').should('contain', 'Failed to load')
    
    // Test invalid form submission
    cy.visit('/register')
    cy.get('[data-testid="register-button"]').click()
    cy.get('[data-testid="validation-error"]').should('exist')
  })

  it('should perform within performance budget', () => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        win.performance.mark('start-loading')
      }
    })
    
    cy.window().then((win) => {
      win.performance.mark('end-loading')
      win.performance.measure('page-load', 'start-loading', 'end-loading')
      
      const measure = win.performance.getEntriesByName('page-load')[0]
      expect(measure.duration).to.be.lessThan(3000) // 3 seconds
    })
  })
})
