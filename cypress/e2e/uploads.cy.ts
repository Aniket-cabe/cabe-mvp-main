describe('File Upload System', () => {
  beforeEach(() => {
    // Mock authentication and upload API
    cy.intercept('GET', '/api/auth/me', {
      statusCode: 200,
      body: { id: 'test-user-123', email: 'test@example.com' },
    }).as('getUser');

    cy.intercept('POST', '/api/uploads', {
      statusCode: 200,
      body: {
        uploadUrl: '/uploads/test-file.png',
        fileId: 'test-file-id',
        mimeType: 'image/png',
      },
    }).as('uploadFile');

    cy.visit('/upload');
  });

  describe('ProofUploader Component', () => {
    it('should accept files via drag and drop', () => {
      const testFile = new File(['test content'], 'test-image.png', {
        type: 'image/png',
      });

      cy.get('[data-testid="proof-uploader"]').trigger('drop', {
        dataTransfer: {
          files: [testFile],
          types: ['Files'],
        },
      });

      // Should show file preview and progress
      cy.get('[data-testid="file-preview"]').should('be.visible');
      cy.get('[data-testid="progress-bar"]').should('be.visible');

      // Should complete upload
      cy.wait('@uploadFile');
      cy.get('[data-testid="upload-success"]').should('be.visible');
    });

    it('should reject invalid file types', () => {
      const testFile = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });

      cy.get('[data-testid="proof-uploader"]').trigger('drop', {
        dataTransfer: {
          files: [testFile],
          types: ['Files'],
        },
      });

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'not supported');
    });

    it('should allow removing selected files', () => {
      const testFile = new File(['test content'], 'test-image.png', {
        type: 'image/png',
      });

      cy.get('[data-testid="proof-uploader"]').trigger('drop', {
        dataTransfer: {
          files: [testFile],
          types: ['Files'],
        },
      });

      cy.get('[data-testid="file-preview"]').should('be.visible');
      cy.get('[data-testid="remove-button"]').click();
      cy.get('[data-testid="empty-state"]').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle upload failures', () => {
      cy.intercept('POST', '/api/uploads', {
        statusCode: 500,
        body: { message: 'Upload failed' },
      }).as('uploadFailure');

      const testFile = new File(['test content'], 'test-image.png', {
        type: 'image/png',
      });

      cy.get('[data-testid="proof-uploader"]').trigger('drop', {
        dataTransfer: {
          files: [testFile],
          types: ['Files'],
        },
      });

      cy.wait('@uploadFailure');
      cy.get('[data-testid="error-message"]').should(
        'contain',
        'Upload failed'
      );
    });
  });

  describe('Performance', () => {
    it('should complete uploads within 5 seconds', () => {
      const testFile = new File(['test content'], 'test-image.png', {
        type: 'image/png',
      });

      const startTime = Date.now();

      cy.get('[data-testid="proof-uploader"]').trigger('drop', {
        dataTransfer: {
          files: [testFile],
          types: ['Files'],
        },
      });

      cy.wait('@uploadFile').then(() => {
        const duration = Date.now() - startTime;
        expect(duration).to.be.lessThan(5000);
      });
    });
  });
});
