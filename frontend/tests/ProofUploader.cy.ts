describe('ProofUploader Component', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/uploads', {
      statusCode: 200,
      body: {
        uploadUrl: 'https://example.com/uploads/test-file.jpg',
        fileId: 'test-file-123',
        mimeType: 'image/jpeg',
      },
    }).as('uploadFile');

    cy.visit('/test-upload');
  });

  it('should accept valid files via drag and drop', () => {
    const testFile = new File(['test content'], 'test-image.jpg', {
      type: 'image/jpeg',
    });

    cy.get('[data-testid="dropzone"]').trigger('drop', {
      dataTransfer: { files: [testFile] },
    });

    cy.wait('@uploadFile');
    cy.get('[data-testid="file-list"]').should('contain', 'test-image.jpg');
  });

  it('should reject invalid file types', () => {
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

    cy.get('[data-testid="dropzone"]').trigger('drop', {
      dataTransfer: { files: [invalidFile] },
    });

    cy.get('[data-testid="error-toast"]').should(
      'contain',
      'not a supported file type'
    );
  });

  it('should reject oversized files', () => {
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });

    cy.get('[data-testid="dropzone"]').trigger('drop', {
      dataTransfer: { files: [largeFile] },
    });

    cy.get('[data-testid="error-toast"]').should('contain', 'too large');
  });

  it('should show upload progress', () => {
    cy.intercept('POST', '/api/uploads', {
      statusCode: 200,
      body: { uploadUrl: 'test', fileId: 'test', mimeType: 'image/jpeg' },
      delay: 1000,
    }).as('uploadWithDelay');

    const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    cy.get('[data-testid="dropzone"]').trigger('drop', {
      dataTransfer: { files: [testFile] },
    });

    cy.get('[data-testid="upload-progress"]').should('be.visible');
    cy.wait('@uploadWithDelay');
    cy.get('[data-testid="upload-success"]').should('be.visible');
  });

  it('should allow removing files', () => {
    const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    cy.get('[data-testid="dropzone"]').trigger('drop', {
      dataTransfer: { files: [testFile] },
    });

    cy.wait('@uploadFile');
    cy.get('[data-testid="remove-file"]').click();
    cy.get('[data-testid="file-list"]').should('not.contain', 'test.jpg');
  });

  it('should support keyboard navigation', () => {
    cy.get('[data-testid="dropzone"]').focus();
    cy.get('[data-testid="dropzone"]').should('be.focused');
  });

  it('should have proper ARIA labels', () => {
    cy.get('[data-testid="dropzone"]')
      .should('have.attr', 'aria-label')
      .and('contain', 'Upload proof files');
  });
});
