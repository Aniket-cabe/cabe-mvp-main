describe('Skills Dashboard', () => {
  beforeEach(() => {
    // Mock the skill data API
    cy.intercept('GET', '/api/arena/user-progress*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          skill: {
            slug: 'design',
            name: 'Design',
            icon: '🎨',
            tagline: 'Where creativity meets functionality',
            color: 'pink-500',
            description:
              'UI/UX design, graphic design, and visual communication',
          },
          stats: {
            totalTasks: 5,
            averagePoints: 180,
            totalXP: 900,
            completionRate: 100,
            averageScore: 87,
            bestScore: 95,
            lastActivity: '2024-01-15T10:30:00Z',
            streakDays: 3,
          },
          tasks: [
            {
              id: 'task-1',
              title: 'Design a Modern Landing Page',
              description:
                'Create a responsive landing page design for a SaaS product',
              skill_area: 'design',
              points_awarded: 150,
              score: 85,
              status: 'scored',
              submitted_at: '2024-01-15T10:30:00Z',
              scored_at: '2024-01-15T14:20:00Z',
              feedback: 'Excellent use of whitespace and typography.',
              breakdown: 'Design: 90, Usability: 85, Creativity: 80',
            },
            {
              id: 'task-2',
              title: 'Create a Mobile App Icon',
              description:
                'Design a modern app icon for a fitness tracking application',
              skill_area: 'design',
              points_awarded: 200,
              score: 92,
              status: 'scored',
              submitted_at: '2024-01-14T09:15:00Z',
              scored_at: '2024-01-14T16:45:00Z',
              feedback: 'Great color choice and scalability.',
              breakdown: 'Design: 95, Creativity: 90, Technical: 92',
            },
          ],
          badges: [
            {
              id: 'badge-1',
              name: 'First Steps',
              description: 'Complete your first task in this skill area',
              icon: '🌟',
              skillArea: 'design',
              unlockedAt: '2024-01-15T10:30:00Z',
              rarity: 'common',
              requirements: { tasksCompleted: 1, averageScore: 0, totalXP: 0 },
            },
            {
              id: 'badge-2',
              name: 'Design Master',
              description: 'Achieve high scores in multiple design tasks',
              icon: '🎨',
              skillArea: 'design',
              unlockedAt: '2024-01-14T16:45:00Z',
              rarity: 'rare',
              requirements: {
                tasksCompleted: 2,
                averageScore: 85,
                totalXP: 350,
              },
            },
          ],
          xpProgress: {
            current: 900,
            total: 1000,
            tier: 'Tier 4',
            nextTier: 'Tier 5',
            progressPercentage: 90,
          },
          heatmapData: [
            { date: '2024-01-15', count: 2 },
            { date: '2024-01-14', count: 1 },
            { date: '2024-01-13', count: 0 },
            { date: '2024-01-12', count: 1 },
            { date: '2024-01-11', count: 0 },
          ],
        },
      },
    }).as('getSkillData');
  });

  it('should load skill dashboard with design skill', () => {
    cy.visit('/skills/design');
    cy.wait('@getSkillData');

    // Check if main elements are loaded
    cy.get('[data-testid="skill-name"]').should('contain', 'Design');
    cy.get('[data-testid="skill-tagline"]').should(
      'contain',
      'Where creativity meets functionality'
    );
    cy.get('[data-testid="skill-description"]').should(
      'contain',
      'UI/UX design, graphic design'
    );
  });

  it('should display skill stats correctly', () => {
    cy.visit('/skills/design');
    cy.wait('@getSkillData');

    // Check stats cards
    cy.get('[data-testid="total-tasks"]').should('contain', '5');
    cy.get('[data-testid="average-points"]').should('contain', '180');
    cy.get('[data-testid="total-xp"]').should('contain', '900');
    cy.get('[data-testid="average-score"]').should('contain', '87');
    cy.get('[data-testid="best-score"]').should('contain', '95');
    cy.get('[data-testid="completion-rate"]').should('contain', '100');
  });

  it('should render XP progress bar correctly', () => {
    cy.visit('/skills/design');
    cy.wait('@getSkillData');

    // Check XP progress bar
    cy.get('[data-testid="xp-progress-bar"]')
      .should('be.visible')
      .and('have.attr', 'aria-valuenow', '90')
      .and('have.attr', 'aria-valuemax', '100');

    // Check progress text
    cy.contains('90% to Tier 5').should('be.visible');
  });

  it('should display SkillXPBar component with different sizes', () => {
    cy.visit('/skills-demo'); // Assuming demo route
    cy.wait('@getSkillData');

    // Check if XP bars are rendered
    cy.get('[data-testid="current-xp"]').should('have.length.at.least', 3);
    cy.get('[data-testid="xp-progress-bar"]').should('have.length.at.least', 3);
  });

  it('should display activity heatmap', () => {
    cy.visit('/skills/design');
    cy.wait('@getSkillData');

    // Check if heatmap is rendered
    cy.get('[data-testid="activity-heatmap"]').should('be.visible');
    cy.get('[data-testid="activity-heatmap"]')
      .find('div[role="button"]')
      .should('exist');

    // Check heatmap legend
    cy.contains('Less').should('be.visible');
    cy.contains('More').should('be.visible');
  });

  it('should show task history table', () => {
    cy.visit('/skills/design');
    cy.wait('@getSkillData');

    // Check task table
    cy.get('[data-testid="task-table"]').should('be.visible');
    cy.get('[data-testid="task-title-task-1"]').should(
      'contain',
      'Design a Modern Landing Page'
    );
    cy.get('[data-testid="task-title-task-2"]').should(
      'contain',
      'Create a Mobile App Icon'
    );
  });

  it('should allow expanding task details', () => {
    cy.visit('/skills/design');
    cy.wait('@getSkillData');

    // Click to expand first task
    cy.get('[data-testid="task-table"]').find('button').first().click();

    // Check if details are shown
    cy.contains('Task Description').should('be.visible');
    cy.contains('Create a responsive landing page design').should('be.visible');
  });

  it('should show feedback when toggled', () => {
    cy.visit('/skills/design');
    cy.wait('@getSkillData');

    // Expand task details
    cy.get('[data-testid="task-table"]').find('button').first().click();

    // Toggle feedback visibility
    cy.contains('Show Feedback').click();
    cy.contains('Excellent use of whitespace and typography.').should(
      'be.visible'
    );
  });

  it('should display badges correctly', () => {
    cy.visit('/skills/design');
    cy.wait('@getSkillData');

    // Check badge grid
    cy.get('[data-testid="badge-grid"]').should('be.visible');
    cy.get('[data-testid="badge-name-badge-1"]').should(
      'contain',
      'First Steps'
    );
    cy.get('[data-testid="badge-name-badge-2"]').should(
      'contain',
      'Design Master'
    );
  });

  it('should show badge tooltips on hover', () => {
    cy.visit('/skills/design');
    cy.wait('@getSkillData');

    // Hover over a badge
    cy.get('[data-testid="badge-1"]').trigger('mouseover');

    // Check if tooltip appears
    cy.contains('First Steps').should('be.visible');
    cy.contains('Complete your first task').should('be.visible');
  });

  it('should handle empty task list', () => {
    // Mock empty data
    cy.intercept('GET', '/api/arena/user-progress*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          skill: {
            slug: 'design',
            name: 'Design',
            icon: '🎨',
            tagline: 'Where creativity meets functionality',
            color: 'pink-500',
            description:
              'UI/UX design, graphic design, and visual communication',
          },
          stats: {
            totalTasks: 0,
            averagePoints: 0,
            totalXP: 0,
            completionRate: 0,
            averageScore: 0,
            bestScore: 0,
            lastActivity: '',
            streakDays: 0,
          },
          tasks: [],
          badges: [],
          xpProgress: {
            current: 0,
            total: 1000,
            tier: 'Tier 1',
            nextTier: 'Tier 2',
            progressPercentage: 0,
          },
          heatmapData: [],
        },
      },
    }).as('getEmptySkillData');

    cy.visit('/skills/design');
    cy.wait('@getEmptySkillData');

    // Check empty state
    cy.contains('No tasks completed yet').should('be.visible');
    cy.contains('Start your first task to see your progress here!').should(
      'be.visible'
    );
  });

  it('should handle loading state', () => {
    // Mock slow response
    cy.intercept('GET', '/api/arena/user-progress*', (req) => {
      req.reply({
        delay: 1000,
        statusCode: 200,
        body: { success: true, data: {} },
      });
    }).as('getSlowSkillData');

    cy.visit('/skills/design');

    // Check loading state
    cy.contains('Loading skill dashboard...').should('be.visible');
  });

  it('should handle error state', () => {
    // Mock error response
    cy.intercept('GET', '/api/arena/user-progress*', {
      statusCode: 500,
      body: { success: false, message: 'Server error' },
    }).as('getErrorSkillData');

    cy.visit('/skills/design');
    cy.wait('@getErrorSkillData');

    // Check error state
    cy.contains('Error Loading Dashboard').should('be.visible');
    cy.contains('Try Again').should('be.visible');
  });

  it('should redirect to default skill when no slug provided', () => {
    cy.visit('/skills');

    // Should redirect to design skill
    cy.url().should('include', '/skills/design');
  });

  it('should handle invalid skill slug', () => {
    // Mock not found response
    cy.intercept('GET', '/api/arena/user-progress*', {
      statusCode: 404,
      body: { success: false, message: 'Skill not found' },
    }).as('getNotFoundSkillData');

    cy.visit('/skills/invalid-skill');
    cy.wait('@getNotFoundSkillData');

    // Check not found state
    cy.contains('Skill Not Found').should('be.visible');
  });

  it('should be keyboard accessible', () => {
    cy.visit('/skills/design');
    cy.wait('@getSkillData');

    // Test tab navigation
    cy.get('body').tab();
    cy.focused().should('exist');

    // Test heatmap keyboard interaction
    cy.get('[data-testid="activity-heatmap"]')
      .find('div[role="button"]')
      .first()
      .focus();
    cy.get('[data-testid="activity-heatmap"]')
      .find('div[role="button"]')
      .first()
      .should('have.focus');
  });

  it('should have proper ARIA labels', () => {
    cy.visit('/skills/design');
    cy.wait('@getSkillData');

    // Check ARIA labels
    cy.get('[data-testid="xp-progress-bar"]')
      .should('have.attr', 'aria-label')
      .and('include', 'XP Progress: 90%');

    cy.get('[data-testid="activity-heatmap"]')
      .find('div[role="button"]')
      .first()
      .should('have.attr', 'aria-label');
  });

  it('should display different skill colors correctly', () => {
    // Test with different skill colors
    const skills = [
      { slug: 'web', color: 'emerald-500' },
      { slug: 'ai', color: 'violet-500' },
      { slug: 'writing', color: 'amber-500' },
    ];

    skills.forEach((skill) => {
      cy.intercept('GET', `/api/arena/user-progress*`, {
        statusCode: 200,
        body: {
          success: true,
          data: {
            skill: {
              slug: skill.slug,
              name: skill.slug.charAt(0).toUpperCase() + skill.slug.slice(1),
              icon: '🎯',
              tagline: 'Test tagline',
              color: skill.color,
              description: 'Test description',
            },
            stats: {
              totalTasks: 1,
              averagePoints: 100,
              totalXP: 100,
              completionRate: 100,
              averageScore: 80,
              bestScore: 80,
              lastActivity: '2024-01-15T10:30:00Z',
              streakDays: 1,
            },
            tasks: [],
            badges: [],
            xpProgress: {
              current: 100,
              total: 1000,
              tier: 'Tier 1',
              nextTier: 'Tier 2',
              progressPercentage: 10,
            },
            heatmapData: [],
          },
        },
      }).as(`get${skill.slug}SkillData`);

      cy.visit(`/skills/${skill.slug}`);
      cy.wait(`@get${skill.slug}SkillData`);

      // Check if color classes are applied
      cy.get(`.bg-${skill.color.replace('-500', '')}-500`).should('exist');
    });
  });

  it('should allow navigation between skill areas in demo', () => {
    cy.visit('/skills-demo');
    cy.wait('@getSkillData');

    // Check if navigation buttons exist
    cy.get('[data-testid="skill-nav-design"]').should('be.visible');
    cy.get('[data-testid="skill-nav-web"]').should('be.visible');
    cy.get('[data-testid="skill-nav-ai"]').should('be.visible');
    cy.get('[data-testid="skill-nav-writing"]').should('be.visible');

    // Click on different skill
    cy.get('[data-testid="skill-nav-web"]').click();
    cy.get('[data-testid="skill-name"]').should('contain', 'Web Development');
  });
});
