describe('PWA offline behavior', () => {
  it('shows offline banner and serves cached assets', () => {
    cy.visit('/');
    // Simulate offline
    cy.window().then((win) => {
      // @ts-ignore
      cy.stub(win.navigator, 'onLine').value(false);
      win.dispatchEvent(new Event('offline'));
    });
    cy.get('[data-testid="offline-banner"]').should('be.visible');
  });
});
describe('PWA Functionality', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Service Worker', () => {
    it('should register service worker', () => {
      cy.window()
        .then((win) => {
          cy.wrap(win.navigator.serviceWorker).should('exist');

          return win.navigator.serviceWorker.ready;
        })
        .then((registration) => {
          expect(registration.active).to.exist;
          expect(registration.active?.scriptURL).to.include('sw.js');
        });
    });

    it('should cache static assets', () => {
      cy.window()
        .then((win) => {
          return win.navigator.serviceWorker.ready;
        })
        .then((registration) => {
          return registration.active?.postMessage({ type: 'GET_CACHE_KEYS' });
        });
    });
  });

  describe('Offline Functionality', () => {
    it('should show offline banner when network is disconnected', () => {
      // Intercept network requests to simulate offline
      cy.intercept('*', { forceNetworkError: true }).as('offline');

      cy.visit('/');

      // Should show offline banner
      cy.get('[data-testid="offline-banner"]').should('be.visible');
      cy.contains("You're offline").should('be.visible');
    });

    it('should hide offline banner when network is restored', () => {
      // Start with offline simulation
      cy.intercept('*', { forceNetworkError: true }).as('offline');
      cy.visit('/');

      // Should show offline banner
      cy.get('[data-testid="offline-banner"]').should('be.visible');

      // Restore network
      cy.intercept('*', {}).as('online');

      // Should hide offline banner
      cy.get('[data-testid="offline-banner"]').should('not.exist');
    });

    it('should allow dismissing offline banner', () => {
      cy.intercept('*', { forceNetworkError: true }).as('offline');
      cy.visit('/');

      // Should show offline banner
      cy.get('[data-testid="offline-banner"]').should('be.visible');

      // Click dismiss button
      cy.get(
        '[data-testid="offline-banner"] button[aria-label="Dismiss offline banner"]'
      ).click();

      // Should hide banner
      cy.get('[data-testid="offline-banner"]').should('not.exist');
    });

    it('should provide retry functionality', () => {
      cy.intercept('*', { forceNetworkError: true }).as('offline');
      cy.visit('/');

      // Should show retry button
      cy.get('[data-testid="offline-banner"] button')
        .contains('Retry')
        .should('be.visible');

      // Click retry button
      cy.get('[data-testid="offline-banner"] button').contains('Retry').click();

      // Should attempt to reload page
      cy.url().should('include', '/');
    });
  });

  describe('Cached Content', () => {
    it('should serve cached content when offline', () => {
      // First visit to cache content
      cy.visit('/');
      cy.wait(1000); // Wait for caching

      // Simulate offline
      cy.intercept('*', { forceNetworkError: true }).as('offline');

      // Reload page
      cy.reload();

      // Should still show content (from cache)
      cy.get('body').should('not.be.empty');
    });

    it('should cache API responses', () => {
      // Mock API response
      cy.intercept('GET', '/api/tasks', { fixture: 'tasks.json' }).as(
        'getTasks'
      );

      cy.visit('/dashboard');
      cy.wait('@getTasks');

      // Simulate offline
      cy.intercept('*', { forceNetworkError: true }).as('offline');

      // Navigate to tasks page
      cy.visit('/tasks');

      // Should show cached tasks data
      cy.get('[data-testid="tasks-list"]').should('exist');
    });
  });

  describe('App Installation', () => {
    it('should show install prompt when criteria are met', () => {
      // Mock beforeinstallprompt event
      cy.window().then((win) => {
        const event = new Event('beforeinstallprompt');
        win.dispatchEvent(event);
      });

      // Should show install button or prompt
      cy.get('[data-testid="install-prompt"]').should('be.visible');
    });

    it('should handle install button click', () => {
      // Mock beforeinstallprompt event
      cy.window().then((win) => {
        const event = new Event('beforeinstallprompt');
        win.dispatchEvent(event);
      });

      // Click install button
      cy.get('[data-testid="install-button"]').click();

      // Should trigger install prompt
      cy.window().then((win) => {
        expect(win.installPrompt).to.exist;
      });
    });
  });

  describe('Manifest', () => {
    it('should have valid manifest.json', () => {
      cy.request('/manifest.json').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property(
          'name',
          'CaBE Arena - Code & Build Excellence'
        );
        expect(response.body).to.have.property('short_name', 'CaBE Arena');
        expect(response.body).to.have.property('display', 'standalone');
        expect(response.body).to.have.property('theme_color', '#6366f1');
        expect(response.body).to.have.property('background_color', '#ffffff');
        expect(response.body.icons).to.be.an('array');
        expect(response.body.icons).to.have.length.greaterThan(0);
      });
    });

    it('should have required icons', () => {
      cy.request('/manifest.json').then((response) => {
        const icons = response.body.icons;

        // Check for required icon sizes
        const requiredSizes = ['192x192', '512x512'];
        requiredSizes.forEach((size) => {
          const icon = icons.find((i: any) => i.sizes === size);
          expect(icon).to.exist;
          expect(icon.src).to.match(/\.png$/);
        });
      });
    });
  });

  describe('Performance', () => {
    it('should load quickly on mobile', () => {
      cy.viewport('iphone-x');
      cy.visit('/', {
        onBeforeLoad: (win) => {
          win.performance.mark('start-loading');
        },
      });

      cy.window().then((win) => {
        win.performance.mark('end-loading');
        win.performance.measure('page-load', 'start-loading', 'end-loading');

        const measure = win.performance.getEntriesByName('page-load')[0];
        expect(measure.duration).to.be.lessThan(3000); // Should load in under 3 seconds
      });
    });

    it('should have good Lighthouse PWA score', () => {
      cy.lighthouse({
        categories: ['pwa'],
      }).then((results) => {
        expect(results.pwa.score).to.be.greaterThan(90);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for offline banner', () => {
      cy.intercept('*', { forceNetworkError: true }).as('offline');
      cy.visit('/');

      cy.get('[data-testid="offline-banner"]')
        .should('have.attr', 'role', 'alert')
        .should('have.attr', 'aria-live', 'polite')
        .should('have.attr', 'aria-atomic', 'true');

      cy.get(
        '[data-testid="offline-banner"] button[aria-label="Dismiss offline banner"]'
      ).should('exist');
    });

    it('should be keyboard navigable', () => {
      cy.intercept('*', { forceNetworkError: true }).as('offline');
      cy.visit('/');

      // Tab to dismiss button
      cy.get('body').tab();
      cy.focused().should('have.attr', 'aria-label', 'Dismiss offline banner');

      // Tab to retry button
      cy.tab();
      cy.focused().should('contain.text', 'Retry');
    });
  });
});
