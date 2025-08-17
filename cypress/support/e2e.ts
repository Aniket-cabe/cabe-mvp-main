// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add custom commands for CaBE Arena testing
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with test credentials
       * @example cy.login('test@example.com', 'password')
       */
      login(email: string, password: string): Chainable<void>
      
      /**
       * Custom command to create a test user
       * @example cy.createTestUser()
       */
      createTestUser(): Chainable<void>
      
      /**
       * Custom command to submit a task proof
       * @example cy.submitTaskProof(taskId, proofData)
       */
      submitTaskProof(taskId: string, proofData: any): Chainable<void>
      
      /**
       * Custom command to check rank progression
       * @example cy.checkRankProgression()
       */
      checkRankProgression(): Chainable<void>
    }
  }
}
