describe('Mobile responsiveness', () => {
  it('has adequate touch targets and layout at 375x812', () => {
    cy.viewport(375, 812);
    cy.visit('/');
    // Example: check buttons have min 44x44
    cy.get('button')
      .first()
      .should(($btn) => {
        const rect = $btn[0].getBoundingClientRect();
        expect(rect.width).to.be.gte(44);
        expect(rect.height).to.be.gte(44);
      });
  });
});
describe('Responsive Design & Mobile Optimization', () => {
  const breakpoints = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 720 },
  };

  describe('Mobile Breakpoints', () => {
    it('should display correctly on mobile devices', () => {
      cy.viewport(breakpoints.mobile.width, breakpoints.mobile.height);
      cy.visit('/');

      // Check mobile-specific elements
      cy.get('[data-testid="mobile-menu"]').should('be.visible');
      cy.get('[data-testid="desktop-menu"]').should('not.be.visible');

      // Check responsive layout
      cy.get('main').should('have.css', 'padding-left', '16px');
      cy.get('main').should('have.css', 'padding-right', '16px');
    });

    it('should display correctly on tablet devices', () => {
      cy.viewport(breakpoints.tablet.width, breakpoints.tablet.height);
      cy.visit('/');

      // Check tablet-specific layout
      cy.get('[data-testid="mobile-menu"]').should('not.be.visible');
      cy.get('[data-testid="desktop-menu"]').should('be.visible');

      // Check responsive grid
      cy.get('[data-testid="tasks-grid"]')
        .should('have.css', 'grid-template-columns')
        .and('match', /repeat\(2, 1fr\)/);
    });

    it('should display correctly on desktop devices', () => {
      cy.viewport(breakpoints.desktop.width, breakpoints.desktop.height);
      cy.visit('/');

      // Check desktop-specific elements
      cy.get('[data-testid="desktop-menu"]').should('be.visible');
      cy.get('[data-testid="sidebar"]').should('be.visible');

      // Check responsive grid
      cy.get('[data-testid="tasks-grid"]')
        .should('have.css', 'grid-template-columns')
        .and('match', /repeat\(3, 1fr\)/);
    });
  });

  describe('Touch Targets', () => {
    it('should have minimum 44x44px touch targets on mobile', () => {
      cy.viewport(breakpoints.mobile.width, breakpoints.mobile.height);
      cy.visit('/');

      // Check all interactive elements
      cy.get('button, a, [role="button"], input[type="submit"]').each(($el) => {
        const rect = $el[0].getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Touch targets should be at least 44x44px
        expect(width).to.be.greaterThan(43);
        expect(height).to.be.greaterThan(43);
      });
    });

    it('should have proper spacing between touch targets', () => {
      cy.viewport(breakpoints.mobile.width, breakpoints.mobile.height);
      cy.visit('/');

      // Check spacing between buttons in navigation
      cy.get('[data-testid="mobile-menu"] button').each(($el, index, $list) => {
        if (index < $list.length - 1) {
          const currentRect = $el[0].getBoundingClientRect();
          const nextRect = $list[index + 1].getBoundingClientRect();
          const spacing = nextRect.top - currentRect.bottom;

          // Should have at least 8px spacing between touch targets
          expect(spacing).to.be.greaterThan(7);
        }
      });
    });

    it('should remove 300ms click delay', () => {
      cy.viewport(breakpoints.mobile.width, breakpoints.mobile.height);
      cy.visit('/');

      // Check that touch-action is set to manipulation
      cy.get('button, a, [role="button"]').each(($el) => {
        const touchAction = $el.css('touch-action');
        expect(touchAction).to.include('manipulation');
      });
    });
  });

  describe('Mobile Navigation', () => {
    it('should have accessible mobile menu', () => {
      cy.viewport(breakpoints.mobile.width, breakpoints.mobile.height);
      cy.visit('/');

      // Check mobile menu button
      cy.get('[data-testid="mobile-menu-button"]')
        .should('be.visible')
        .should('have.attr', 'aria-label', 'Open menu')
        .should('have.attr', 'aria-expanded', 'false');

      // Open mobile menu
      cy.get('[data-testid="mobile-menu-button"]').click();

      // Check menu is open
      cy.get('[data-testid="mobile-menu"]').should('be.visible');
      cy.get('[data-testid="mobile-menu-button"]').should(
        'have.attr',
        'aria-expanded',
        'true'
      );

      // Check menu items are accessible
      cy.get('[data-testid="mobile-menu"] a').each(($link) => {
        cy.wrap($link).should('be.visible');
        cy.wrap($link).should('have.attr', 'tabindex', '0');
      });
    });

    it('should close mobile menu when clicking outside', () => {
      cy.viewport(breakpoints.mobile.width, breakpoints.mobile.height);
      cy.visit('/');

      // Open mobile menu
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-menu"]').should('be.visible');

      // Click outside menu
      cy.get('main').click();

      // Menu should close
      cy.get('[data-testid="mobile-menu"]').should('not.be.visible');
      cy.get('[data-testid="mobile-menu-button"]').should(
        'have.attr',
        'aria-expanded',
        'false'
      );
    });
  });

  describe('Form Optimization', () => {
    it('should have mobile-friendly form inputs', () => {
      cy.viewport(breakpoints.mobile.width, breakpoints.mobile.height);
      cy.visit('/login');

      // Check input sizes
      cy.get('input[type="email"], input[type="password"]').each(($input) => {
        const height = $input[0].getBoundingClientRect().height;
        expect(height).to.be.greaterThan(43); // Minimum touch target size
      });

      // Check input font size
      cy.get('input').each(($input) => {
        const fontSize = parseFloat($input.css('font-size'));
        expect(fontSize).to.be.greaterThan(15); // Prevent zoom on iOS
      });
    });

    it('should have proper keyboard types for inputs', () => {
      cy.viewport(breakpoints.mobile.width, breakpoints.mobile.height);
      cy.visit('/login');

      // Check email input
      cy.get('input[type="email"]').should('have.attr', 'inputmode', 'email');

      // Check password input
      cy.get('input[type="password"]').should(
        'have.attr',
        'autocomplete',
        'current-password'
      );
    });
  });

  describe('Content Optimization', () => {
    it('should have readable text on mobile', () => {
      cy.viewport(breakpoints.mobile.width, breakpoints.mobile.height);
      cy.visit('/');

      // Check body text size
      cy.get('body')
        .should('have.css', 'font-size')
        .and('match', /1[6-9]px/); // Should be 16px or larger

      // Check line height
      cy.get('p, div').each(($el) => {
        const lineHeight = parseFloat($el.css('line-height'));
        const fontSize = parseFloat($el.css('font-size'));
        const ratio = lineHeight / fontSize;

        expect(ratio).to.be.greaterThan(1.4); // Good readability
      });
    });

    it('should have proper content spacing', () => {
      cy.viewport(breakpoints.mobile.width, breakpoints.mobile.height);
      cy.visit('/');

      // Check section spacing
      cy.get('section, article').each(($section) => {
        const marginBottom = parseFloat($section.css('margin-bottom'));
        expect(marginBottom).to.be.greaterThan(15); // Adequate spacing
      });
    });
  });

  describe('Performance on Mobile', () => {
    it('should load quickly on mobile networks', () => {
      // Simulate slow 3G network
      cy.intercept('*', (req) => {
        req.reply({ delay: 1000 }); // 1 second delay
      });

      cy.viewport(breakpoints.mobile.width, breakpoints.mobile.height);
      cy.visit('/', {
        onBeforeLoad: (win) => {
          win.performance.mark('start-loading');
        },
      });

      cy.window().then((win) => {
        win.performance.mark('end-loading');
        win.performance.measure('mobile-load', 'start-loading', 'end-loading');

        const measure = win.performance.getEntriesByName('mobile-load')[0];
        expect(measure.duration).to.be.lessThan(5000); // Should load in under 5 seconds even on slow network
      });
    });

    it('should have optimized images for mobile', () => {
      cy.viewport(breakpoints.mobile.width, breakpoints.mobile.height);
      cy.visit('/');

      // Check image sizes
      cy.get('img').each(($img) => {
        const src = $img.attr('src');
        if (src && src.includes('mobile')) {
          // Mobile-optimized images should be smaller
          cy.request(src).then((response) => {
            expect(response.headers['content-length']).to.be.lessThan(100000); // Under 100KB
          });
        }
      });
    });
  });

  describe('Accessibility on Mobile', () => {
    it('should be fully keyboard navigable on mobile', () => {
      cy.viewport(breakpoints.mobile.width, breakpoints.mobile.height);
      cy.visit('/');

      // Tab through all interactive elements
      cy.get('body').tab();
      cy.focused().should('exist');

      // Continue tabbing through all elements
      cy.get('a, button, input, [tabindex]').each(($el) => {
        cy.wrap($el).should('be.visible');
        cy.wrap($el).should('not.have.attr', 'tabindex', '-1');
      });
    });

    it('should have proper focus indicators', () => {
      cy.viewport(breakpoints.mobile.width, breakpoints.mobile.height);
      cy.visit('/');

      // Check focus styles
      cy.get('button, a, input').first().focus();
      cy.focused().should('have.css', 'outline').and('not.eq', 'none');
    });
  });
});
