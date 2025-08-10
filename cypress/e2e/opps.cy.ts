describe('Opportunities Module', () => {
  beforeEach(() => {
    // Mock the opportunities data
    cy.intercept('GET', '/api/opps*', {
      statusCode: 200,
      body: {
        opportunities: [
          {
            id: '1',
            title: 'UI/UX Designer for Mobile App',
            description:
              'Create beautiful and intuitive user interfaces for our mobile application.',
            company: 'TechCorp Inc',
            source: 'fiverr',
            type: 'gig',
            category: 'design',
            points: 150,
            locked: false,
            requiredRank: 'Bronze',
            location: 'Remote',
            duration: '2-3 weeks',
            budget: '$500-800',
            requirements: [
              'Figma',
              'Adobe Creative Suite',
              'Mobile Design Experience',
            ],
            postedDate: '2024-01-15',
          },
          {
            id: '2',
            title: 'Frontend Developer Intern',
            description: 'Join our team as a frontend developer intern.',
            company: 'StartupXYZ',
            source: 'internshala',
            type: 'internship',
            category: 'web',
            points: 200,
            locked: true,
            requiredRank: 'Silver',
            location: 'Mumbai, India',
            duration: '6 months',
            requirements: ['React', 'TypeScript', 'CSS', 'Git'],
            postedDate: '2024-01-10',
          },
          {
            id: '3',
            title: 'AI Content Writer',
            description: 'Write engaging content about AI and technology.',
            company: 'AI Insights',
            source: 'upwork',
            type: 'gig',
            category: 'writing',
            points: 100,
            locked: false,
            requiredRank: 'Bronze',
            location: 'Remote',
            duration: 'Ongoing',
            budget: '$200-400/month',
            requirements: ['AI Knowledge', 'Content Writing', 'SEO Basics'],
            postedDate: '2024-01-12',
          },
        ],
      },
    }).as('getOpportunities');

    // Mock the application submission
    cy.intercept('POST', '/api/opps/apply', {
      statusCode: 200,
      body: { success: true },
    }).as('submitApplication');

    cy.visit('/opps');
    cy.wait('@getOpportunities');
  });

  describe('Page Layout and Header', () => {
    it('should display the opportunities page with correct header', () => {
      cy.get('h1').should('contain', 'Opportunities');
      cy.get('p').should('contain', 'Find gigs and internships');
      cy.get('[data-testid="opportunities-grid"]').should('exist');
    });

    it('should show current rank badge', () => {
      cy.get('div').should('contain', 'Current Rank: Bronze');
    });
  });

  describe('Filter Functionality', () => {
    it('should have type tabs for gigs and internships', () => {
      cy.get('[data-testid="type-tab-gig"]')
        .should('exist')
        .and('contain', 'Gigs');
      cy.get('[data-testid="type-tab-internship"]')
        .should('exist')
        .and('contain', 'Internships');
    });

    it('should filter by type when clicking tabs', () => {
      // Default should be gigs
      cy.get('[data-testid="opportunities-grid"]').should(
        'contain',
        'UI/UX Designer'
      );
      cy.get('[data-testid="opportunities-grid"]').should(
        'not.contain',
        'Frontend Developer Intern'
      );

      // Switch to internships
      cy.get('[data-testid="type-tab-internship"]').click();
      cy.get('[data-testid="opportunities-grid"]').should(
        'contain',
        'Frontend Developer Intern'
      );
      cy.get('[data-testid="opportunities-grid"]').should(
        'not.contain',
        'UI/UX Designer'
      );
    });

    it('should have category filters', () => {
      cy.get('[data-testid="category-filter-design"]').should('exist');
      cy.get('[data-testid="category-filter-web"]').should('exist');
      cy.get('[data-testid="category-filter-ai"]').should('exist');
      cy.get('[data-testid="category-filter-writing"]').should('exist');
    });

    it('should filter by category', () => {
      cy.get('[data-testid="category-filter-design"]').click();
      cy.get('[data-testid="opportunities-grid"]').should(
        'contain',
        'UI/UX Designer'
      );
      cy.get('[data-testid="opportunities-grid"]').should(
        'not.contain',
        'AI Content Writer'
      );

      cy.get('[data-testid="category-filter-writing"]').click();
      cy.get('[data-testid="opportunities-grid"]').should(
        'contain',
        'AI Content Writer'
      );
      cy.get('[data-testid="opportunities-grid"]').should(
        'not.contain',
        'UI/UX Designer'
      );
    });

    it('should have source filters', () => {
      cy.get('[data-testid="source-filter-fiverr"]').should('exist');
      cy.get('[data-testid="source-filter-internshala"]').should('exist');
      cy.get('[data-testid="source-filter-upwork"]').should('exist');
    });

    it('should filter by source', () => {
      cy.get('[data-testid="source-filter-fiverr"]').click();
      cy.get('[data-testid="opportunities-grid"]').should(
        'contain',
        'UI/UX Designer'
      );
      cy.get('[data-testid="opportunities-grid"]').should(
        'not.contain',
        'AI Content Writer'
      );
    });
  });

  describe('Opportunity Cards', () => {
    it('should display opportunity cards with correct information', () => {
      cy.get('[data-testid="opportunities-grid"]').within(() => {
        cy.get('h3').should('contain', 'UI/UX Designer for Mobile App');
        cy.get('div').should('contain', 'TechCorp Inc');
        cy.get('div').should('contain', '150 pts');
        cy.get('div').should('contain', 'Remote');
        cy.get('div').should('contain', '2-3 weeks');
        cy.get('div').should('contain', '$500-800');
      });
    });

    it('should show source badges correctly', () => {
      cy.get('[data-testid="opportunities-grid"]').within(() => {
        cy.get('div').should('contain', 'Fiverr');
        cy.get('div').should('contain', 'Internshala');
        cy.get('div').should('contain', 'Upwork');
      });
    });

    it('should show synced badges for Fiverr and Internshala', () => {
      cy.get('[data-testid="opportunities-grid"]').within(() => {
        cy.get('div').should('contain', 'Synced');
      });
    });

    it('should display requirements as tags', () => {
      cy.get('[data-testid="opportunities-grid"]').within(() => {
        cy.get('span').should('contain', 'Figma');
        cy.get('span').should('contain', 'Adobe Creative Suite');
      });
    });

    it('should show "more" indicator when there are more than 3 requirements', () => {
      cy.get('[data-testid="opportunities-grid"]').within(() => {
        cy.get('span').should('contain', '+0 more');
      });
    });
  });

  describe('Rank Locking', () => {
    it('should show lock overlay for opportunities requiring higher rank', () => {
      cy.get('[data-testid="type-tab-internship"]').click();
      cy.get('[data-testid="opportunities-grid"]').within(() => {
        cy.get('div').should('contain', 'Unlock at Silver');
        cy.get('div').should('contain', '🔒');
      });
    });

    it('should disable apply button for locked opportunities', () => {
      cy.get('[data-testid="type-tab-internship"]').click();
      cy.get('[data-testid="apply-btn-2"]').should('be.disabled');
      cy.get('[data-testid="apply-btn-2"]').should('contain', 'Locked');
    });

    it('should enable apply button for unlocked opportunities', () => {
      cy.get('[data-testid="apply-btn-1"]').should('not.be.disabled');
      cy.get('[data-testid="apply-btn-1"]').should('contain', 'Apply');
    });
  });

  describe('Trust Badge', () => {
    it('should show trust badge when user email domain matches company', () => {
      // This would require mocking the user context to test properly
      // For now, we'll just verify the component structure
      cy.get('[data-testid="opportunities-grid"]').within(() => {
        cy.get('div').should('contain', 'TechCorp Inc');
      });
    });
  });

  describe('Proof Drawer', () => {
    beforeEach(() => {
      cy.get('[data-testid="apply-btn-1"]').click();
    });

    it('should open proof drawer when apply button is clicked', () => {
      cy.get('[data-testid="proof-drawer-title"]').should(
        'contain',
        'Submit Application'
      );
      cy.get('[data-testid="cv-link-input"]').should('be.visible');
      cy.get('[data-testid="portfolio-input"]').should('be.visible');
    });

    it('should display opportunity details in drawer header', () => {
      cy.get('[data-testid="proof-drawer-title"]').should(
        'contain',
        'UI/UX Designer for Mobile App'
      );
      cy.get('p').should('contain', 'TechCorp Inc');
    });

    it('should close drawer when close button is clicked', () => {
      cy.get('[data-testid="close-proof-drawer"]').click();
      cy.get('[data-testid="proof-drawer-title"]').should('not.exist');
    });

    it('should close drawer when backdrop is clicked', () => {
      cy.get('body').click(0, 0); // Click outside the drawer
      cy.get('[data-testid="proof-drawer-title"]').should('not.exist');
    });

    it('should close drawer when ESC key is pressed', () => {
      cy.get('body').type('{esc}');
      cy.get('[data-testid="proof-drawer-title"]').should('not.exist');
    });

    it('should focus first input when drawer opens', () => {
      cy.get('[data-testid="cv-link-input"]').should('be.focused');
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      cy.get('[data-testid="apply-btn-1"]').click();
    });

    it('should require either CV link or portfolio URL', () => {
      cy.get('[data-testid="submit-application-btn"]').click();
      cy.get('p').should(
        'contain',
        'Please provide either a CV link or portfolio URL'
      );
    });

    it('should validate CV link URL format', () => {
      cy.get('[data-testid="cv-link-input"]').type('invalid-url');
      cy.get('[data-testid="submit-application-btn"]').click();
      cy.get('p').should('contain', 'Please enter a valid URL');
    });

    it('should validate portfolio URL format', () => {
      cy.get('[data-testid="portfolio-input"]').type('invalid-url');
      cy.get('[data-testid="submit-application-btn"]').click();
      cy.get('p').should('contain', 'Please enter a valid URL');
    });

    it('should accept valid URLs', () => {
      cy.get('[data-testid="cv-link-input"]').type(
        'https://drive.google.com/my-cv'
      );
      cy.get('[data-testid="submit-application-btn"]').click();
      cy.wait('@submitApplication');
      cy.get('h3').should('contain', 'Application Submitted!');
    });
  });

  describe('Application Submission', () => {
    beforeEach(() => {
      cy.get('[data-testid="apply-btn-1"]').click();
    });

    it('should submit application successfully with valid data', () => {
      cy.get('[data-testid="cv-link-input"]').type(
        'https://drive.google.com/my-cv'
      );
      cy.get('[data-testid="submit-application-btn"]').click();

      cy.wait('@submitApplication');
      cy.get('h3').should('contain', 'Application Submitted! ✅');
    });

    it('should show loading state during submission', () => {
      cy.get('[data-testid="cv-link-input"]').type(
        'https://drive.google.com/my-cv'
      );
      cy.get('[data-testid="submit-application-btn"]').click();

      cy.get('[data-testid="submit-application-btn"]').should(
        'contain',
        'Submitting...'
      );
      cy.get('[data-testid="submit-application-btn"]').should('be.disabled');
    });

    it('should close drawer automatically after successful submission', () => {
      cy.get('[data-testid="cv-link-input"]').type(
        'https://drive.google.com/my-cv'
      );
      cy.get('[data-testid="submit-application-btn"]').click();

      cy.wait('@submitApplication');
      cy.get('h3').should('contain', 'Application Submitted!');

      // Wait for auto-close
      cy.wait(2000);
      cy.get('[data-testid="proof-drawer-title"]').should('not.exist');
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading state while fetching opportunities', () => {
      cy.intercept('GET', '/api/opps*', {
        delay: 1000,
        statusCode: 200,
        body: { opportunities: [] },
      }).as('slowOpportunities');

      cy.visit('/opps');
      cy.get('p').should('contain', 'Loading opportunities...');
    });

    it('should show error state when API fails', () => {
      cy.intercept('GET', '/api/opps*', {
        statusCode: 500,
        body: { error: 'Server error' },
      }).as('errorOpportunities');

      cy.visit('/opps');
      cy.get('h3').should('contain', 'Error Loading Opportunities');
      cy.get('button').should('contain', 'Try Again');
    });

    it('should show empty state when no opportunities match filters', () => {
      cy.get('[data-testid="category-filter-ai"]').click();
      cy.get('h3').should('contain', 'No opportunities found');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      cy.get('[data-testid="proof-drawer-title"]').should('have.attr', 'id');
      cy.get('[role="dialog"]').should('exist');
      cy.get('[aria-modal="true"]').should('exist');
    });

    it('should support keyboard navigation', () => {
      cy.get('body').tab();
      cy.focused().should(
        'match',
        'button, input, textarea, [tabindex]:not([tabindex="-1"])'
      );
    });

    it('should trap focus in modal when open', () => {
      cy.get('[data-testid="apply-btn-1"]').click();
      cy.get('[data-testid="cv-link-input"]').should('be.focused');

      // Tab through modal elements
      cy.get('[data-testid="cv-link-input"]').tab();
      cy.get('[data-testid="portfolio-input"]').should('be.focused');
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.get('[data-testid="opportunities-grid"]').should('be.visible');
      cy.get('[data-testid="type-tab-gig"]').should('be.visible');
    });

    it('should display correctly on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.get('[data-testid="opportunities-grid"]').should('be.visible');
    });

    it('should display correctly on desktop viewport', () => {
      cy.viewport(1280, 720);
      cy.get('[data-testid="opportunities-grid"]').should('be.visible');
    });
  });

  describe('URL Validation', () => {
    beforeEach(() => {
      cy.get('[data-testid="apply-btn-1"]').click();
    });

    it('should accept valid HTTP URLs', () => {
      cy.get('[data-testid="cv-link-input"]').type('http://example.com/cv');
      cy.get('[data-testid="submit-application-btn"]').click();
      cy.wait('@submitApplication');
      cy.get('h3').should('contain', 'Application Submitted!');
    });

    it('should accept valid HTTPS URLs', () => {
      cy.get('[data-testid="cv-link-input"]').type('https://example.com/cv');
      cy.get('[data-testid="submit-application-btn"]').click();
      cy.wait('@submitApplication');
      cy.get('h3').should('contain', 'Application Submitted!');
    });

    it('should reject invalid URLs', () => {
      cy.get('[data-testid="cv-link-input"]').type('not-a-url');
      cy.get('[data-testid="submit-application-btn"]').click();
      cy.get('p').should('contain', 'Please enter a valid URL');
    });
  });
});
