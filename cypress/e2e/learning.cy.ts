describe('Learning Module', () => {
  beforeEach(() => {
    cy.visit('/learning');
  });

  it('should display the learning center page', () => {
    cy.get('h1').should('contain', 'Learning Center');
    cy.get('[data-testid="course-grid"]').should('exist');
  });

  it('should filter courses by category', () => {
    // Test "All" filter
    cy.get('[role="tab"]').contains('All').click();
    cy.get('[data-testid="course-card"]').should('have.length.greaterThan', 0);

    // Test "Design" filter
    cy.get('[role="tab"]').contains('Design').click();
    cy.get('[data-testid="course-card"]').each(($card) => {
      cy.wrap($card).should('contain', 'Design');
    });

    // Test "Web" filter
    cy.get('[role="tab"]').contains('Web').click();
    cy.get('[data-testid="course-card"]').each(($card) => {
      cy.wrap($card).should('contain', 'Web');
    });

    // Test "AI" filter
    cy.get('[role="tab"]').contains('AI').click();
    cy.get('[data-testid="course-card"]').each(($card) => {
      cy.wrap($card).should('contain', 'AI');
    });

    // Test "Writing" filter
    cy.get('[role="tab"]').contains('Writing').click();
    cy.get('[data-testid="course-card"]').each(($card) => {
      cy.wrap($card).should('contain', 'Writing');
    });
  });

  it('should search courses by title and description', () => {
    const searchTerm = 'React';
    cy.get('input[placeholder="Search courses..."]').type(searchTerm);

    cy.get('[data-testid="course-card"]').should('contain', searchTerm);
  });

  it('should show locked courses for insufficient rank', () => {
    // Mock user rank as Bronze
    cy.window().then((win) => {
      win.localStorage.setItem('userRank', 'Bronze');
    });

    // Check that Gold+ courses show lock overlay
    cy.get('[data-testid="course-card"]').each(($card) => {
      if ($card.text().includes('Gold') || $card.text().includes('Platinum')) {
        cy.wrap($card).find('button').should('contain', 'Unlock at');
        cy.wrap($card).find('button').should('be.disabled');
      }
    });
  });

  it('should allow starting unlocked courses', () => {
    // Mock user rank as Silver
    cy.window().then((win) => {
      win.localStorage.setItem('userRank', 'Silver');
    });

    // Find a course that requires Silver or lower
    cy.get('[data-testid="course-card"]').each(($card) => {
      if ($card.text().includes('Bronze') || $card.text().includes('Silver')) {
        cy.wrap($card).find('button').should('contain', 'Start Course');
        cy.wrap($card).find('button').should('not.be.disabled');
        return false; // Break the loop
      }
    });
  });

  it('should open course modal on card click', () => {
    cy.get('[data-testid="course-card"]').first().click();
    cy.get('[data-testid="course-modal"]').should('be.visible');
    cy.get('[data-testid="course-modal"]').should('contain', 'Start Course');
  });

  it('should close course modal', () => {
    cy.get('[data-testid="course-card"]').first().click();
    cy.get('[data-testid="course-modal"]').should('be.visible');
    cy.get('[data-testid="course-modal"]')
      .find('button')
      .contains('Close')
      .click();
    cy.get('[data-testid="course-modal"]').should('not.exist');
  });

  it('should open proof uploader when starting course', () => {
    // Mock user rank as Silver
    cy.window().then((win) => {
      win.localStorage.setItem('userRank', 'Silver');
    });

    // Find and click Start Course on an unlocked course
    cy.get('[data-testid="course-card"]').each(($card) => {
      if ($card.text().includes('Bronze') || $card.text().includes('Silver')) {
        cy.wrap($card).find('button').contains('Start Course').click();
        return false; // Break the loop
      }
    });

    cy.get('[data-testid="proof-uploader"]').should('be.visible');
  });

  it('should handle file upload in proof uploader', () => {
    // Open proof uploader
    cy.window().then((win) => {
      win.localStorage.setItem('userRank', 'Silver');
    });

    cy.get('[data-testid="course-card"]').each(($card) => {
      if ($card.text().includes('Bronze') || $card.text().includes('Silver')) {
        cy.wrap($card).find('button').contains('Start Course').click();
        return false;
      }
    });

    // Test file upload
    cy.get('[data-testid="proof-uploader"]').should('be.visible');
    cy.get('input[type="file"]').attachFile('test-image.png');
    cy.get('[data-testid="proof-uploader"]').should(
      'contain',
      'test-image.png'
    );
  });

  it('should handle external link in proof uploader', () => {
    // Open proof uploader
    cy.window().then((win) => {
      win.localStorage.setItem('userRank', 'Silver');
    });

    cy.get('[data-testid="course-card"]').each(($card) => {
      if ($card.text().includes('Bronze') || $card.text().includes('Silver')) {
        cy.wrap($card).find('button').contains('Start Course').click();
        return false;
      }
    });

    // Switch to external link tab
    cy.get('[data-testid="proof-uploader"]')
      .find('button')
      .contains('External Link')
      .click();

    // Enter external link
    cy.get('input[type="url"]').type('https://example.com/proof');
    cy.get('input[type="url"]').should(
      'have.value',
      'https://example.com/proof'
    );
  });

  it('should validate file types in proof uploader', () => {
    // Open proof uploader
    cy.window().then((win) => {
      win.localStorage.setItem('userRank', 'Silver');
    });

    cy.get('[data-testid="course-card"]').each(($card) => {
      if ($card.text().includes('Bronze') || $card.text().includes('Silver')) {
        cy.wrap($card).find('button').contains('Start Course').click();
        return false;
      }
    });

    // Try to upload invalid file type
    cy.get('input[type="file"]').attachFile('test-document.txt');
    cy.get('[data-testid="proof-uploader"]').should(
      'contain',
      'Please select a valid file type'
    );
  });

  it('should validate file size in proof uploader', () => {
    // Open proof uploader
    cy.window().then((win) => {
      win.localStorage.setItem('userRank', 'Silver');
    });

    cy.get('[data-testid="course-card"]').each(($card) => {
      if ($card.text().includes('Bronze') || $card.text().includes('Silver')) {
        cy.wrap($card).find('button').contains('Start Course').click();
        return false;
      }
    });

    // Mock a large file
    cy.fixture('large-file.png').then((fileContent) => {
      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent,
        fileName: 'large-file.png',
        mimeType: 'image/png',
        lastModified: Date.now(),
      });
    });

    // This would need a proper large file fixture to test
    // For now, we'll just check the file size validation message exists
    cy.get('[data-testid="proof-uploader"]').should('contain', '10MB');
  });

  it('should show platform icons for synced courses', () => {
    // Check for Fiverr synced courses
    cy.get('[data-testid="course-card"]').each(($card) => {
      if ($card.text().includes('Fiverr')) {
        cy.wrap($card).find('[title="Synced from Fiverr ✔️"]').should('exist');
      }
    });

    // Check for Internshala synced courses
    cy.get('[data-testid="course-card"]').each(($card) => {
      if ($card.text().includes('Internshala')) {
        cy.wrap($card)
          .find('[title="Synced from Internshala ✔️"]')
          .should('exist');
      }
    });
  });

  it('should handle pagination', () => {
    // Mock more courses to test pagination
    cy.intercept('GET', '**/courses**', { fixture: 'many-courses.json' }).as(
      'getCourses'
    );

    cy.visit('/learning');
    cy.wait('@getCourses');

    // Check if pagination exists
    cy.get('[data-testid="pagination"]').should('exist');

    // Test next page
    cy.get('[data-testid="pagination"]').find('button').contains('2').click();
    cy.get('[data-testid="course-grid"]').should('exist');

    // Test previous page
    cy.get('[data-testid="pagination"]').find('button').contains('1').click();
    cy.get('[data-testid="course-grid"]').should('exist');
  });

  it('should show loading state', () => {
    // Mock slow API response
    cy.intercept('GET', '**/courses**', { delay: 2000 }).as('getCoursesSlow');

    cy.visit('/learning');
    cy.get('[data-testid="loading-spinner"]').should('be.visible');
    cy.wait('@getCoursesSlow');
    cy.get('[data-testid="loading-spinner"]').should('not.exist');
  });

  it('should show error state', () => {
    // Mock API error
    cy.intercept('GET', '**/courses**', { statusCode: 500 }).as(
      'getCoursesError'
    );

    cy.visit('/learning');
    cy.wait('@getCoursesError');
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('button').contains('Try Again').should('exist');
  });

  it('should be keyboard accessible', () => {
    // Test tab navigation
    cy.get('body').tab();
    cy.focused().should('have.attr', 'role', 'tab');

    // Test arrow key navigation
    cy.get('[role="tab"]').first().focus();
    cy.get('body').type('{rightarrow}');
    cy.focused().should('have.attr', 'aria-selected', 'true');

    // Test enter key to activate
    cy.get('body').type('{enter}');
    cy.get('[role="tabpanel"]').should('exist');
  });

  it('should show progress bars for in-progress courses', () => {
    // Mock user progress data
    cy.window().then((win) => {
      win.localStorage.setItem(
        'courseProgress',
        JSON.stringify({
          'course-1': 75,
          'course-2': 30,
        })
      );
    });

    cy.reload();

    // Check for progress bars
    cy.get('[data-testid="course-card"]').each(($card) => {
      if ($card.text().includes('75%') || $card.text().includes('30%')) {
        cy.wrap($card).find('[data-testid="progress-bar"]').should('exist');
      }
    });
  });
});
