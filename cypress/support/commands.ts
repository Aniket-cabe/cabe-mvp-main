/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to login with test credentials
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('[data-testid="email-input"]').type(email)
  cy.get('[data-testid="password-input"]').type(password)
  cy.get('[data-testid="login-button"]').click()
  cy.url().should('not.include', '/login')
})

// Custom command to create a test user
Cypress.Commands.add('createTestUser', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Test User',
    primarySkill: 'Full-Stack Software Development'
  }
  
  cy.request({
    method: 'POST',
    url: `${Cypress.env('VITE_API_BASE_URL')}/auth/register`,
    body: testUser,
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 201 || response.status === 409) {
      // User created or already exists
      cy.wrap(testUser).as('testUser')
    }
  })
})

// Custom command to submit a task proof
Cypress.Commands.add('submitTaskProof', (taskId: string, proofData: any) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('VITE_API_BASE_URL')}/submissions`,
    body: {
      taskId,
      proofType: 'text',
      proofText: proofData.text || 'Test proof submission',
      proofStrength: proofData.strength || 25
    },
    headers: {
      'Authorization': `Bearer ${Cypress.env('authToken')}`
    },
    failOnStatusCode: false
  })
})

// Custom command to check rank progression
Cypress.Commands.add('checkRankProgression', () => {
  cy.visit('/dashboard')
  cy.get('[data-testid="rank-display"]').should('exist')
  cy.get('[data-testid="points-display"]').should('exist')
  cy.get('[data-testid="rank-progress"]').should('exist')
})

// Override default visit command to handle authentication
Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
  // Check if we need to authenticate first
  if (Cypress.env('authToken')) {
    // Set auth token in localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('authToken', Cypress.env('authToken'))
    })
  }
  
  return originalFn(url, options)
})

// Custom command to wait for API response
Cypress.Commands.add('waitForApi', (method: string, url: string, timeout = 10000) => {
  cy.intercept(method, url).as('apiCall')
  cy.wait('@apiCall', { timeout })
})

// Custom command to check for errors
Cypress.Commands.add('checkForErrors', () => {
  cy.get('[data-testid="error-message"]').should('not.exist')
  cy.get('[data-testid="error-toast"]').should('not.exist')
})

// Custom command to validate task card
Cypress.Commands.add('validateTaskCard', () => {
  cy.get('[data-testid="task-card"]').should('exist')
  cy.get('[data-testid="task-title"]').should('exist')
  cy.get('[data-testid="task-skill"]').should('exist')
  cy.get('[data-testid="task-points"]').should('exist')
  cy.get('[data-testid="task-duration"]').should('exist')
})

// Custom command to test responsive design
Cypress.Commands.add('testResponsive', () => {
  const viewports = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1280, height: 720, name: 'desktop' }
  ]
  
  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height)
    cy.get('body').should('be.visible')
    cy.get('[data-testid="app-container"]').should('exist')
  })
})
