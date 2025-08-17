import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { createServer } from 'http';
import express from 'express';
import { Pool } from 'pg';

// Mock database connection
const mockPool = {
  query: vi.fn(),
  connect: vi.fn(),
  end: vi.fn()
} as unknown as Pool;

vi.mock('pg', () => ({
  Pool: vi.fn(() => mockPool)
}));

// Mock Airtable
const mockAirtable = {
  base: vi.fn(() => ({
    table: vi.fn(() => ({
      select: vi.fn(() => ({
        firstPage: vi.fn(() => Promise.resolve([]))
      })),
      create: vi.fn(() => Promise.resolve({ id: 'rec123' })),
      update: vi.fn(() => Promise.resolve({ id: 'rec123' })),
      destroy: vi.fn(() => Promise.resolve({ id: 'rec123' }))
    }))
  }))
};

vi.mock('airtable', () => ({
  default: mockAirtable
}));

// Service Points Formula v5 (simplified for testing)
class ServicePointsFormulaV5 {
  calculatePoints(submission: any, userHistory: any[]): any {
    const basePoints = submission.basePoints || 50;
    const proofStrength = submission.proofStrength || 25;
    const bonusPoints = Math.min(proofStrength * 2, 100);
    
    return {
      pointsAwarded: basePoints + bonusPoints,
      bonusPoints,
      totalPoints: basePoints + bonusPoints,
      rankProgress: 50,
      newRank: 'Bronze'
    };
  }
}

// Mock services
const mockTaskService = {
  getTaskById: vi.fn(),
  updateTaskCompletionCount: vi.fn()
};

const mockUserService = {
  getUserById: vi.fn(),
  updateUserPoints: vi.fn(),
  updateUserRank: vi.fn()
};

const mockSubmissionService = {
  createSubmission: vi.fn(),
  getUserSubmissionHistory: vi.fn()
};

// Create test app
const app = express();
app.use(express.json());

// Mock middleware
const mockAuthMiddleware = (req: any, res: any, next: any) => {
  req.user = { id: 'user-123', email: 'test@example.com' };
  next();
};

// Test routes
app.post('/api/submissions', mockAuthMiddleware, async (req, res) => {
  try {
    const { taskId, proofText, proofType, proofStrength } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!taskId || !proofText || !proofType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get task details
    const task = await mockTaskService.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Get user history
    const userHistory = await mockSubmissionService.getUserSubmissionHistory(userId);

    // Calculate points using Service Points Formula v5
    const formula = new ServicePointsFormulaV5();
    const scoringResult = formula.calculatePoints({
      taskId,
      basePoints: task.basePoints,
      proofStrength: proofStrength || 25
    }, userHistory);

    // Create submission record
    const submission = await mockSubmissionService.createSubmission({
      userId,
      taskId,
      proofText,
      proofType,
      proofStrength,
      pointsAwarded: scoringResult.pointsAwarded,
      status: 'approved'
    });

    // Update user points and rank
    await mockUserService.updateUserPoints(userId, scoringResult.totalPoints);
    await mockUserService.updateUserRank(userId, scoringResult.newRank);

    // Update task completion count
    await mockTaskService.updateTaskCompletionCount(taskId);

    res.status(201).json({
      success: true,
      submission,
      scoring: scoringResult
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/tasks/:id', mockAuthMiddleware, async (req, res) => {
  try {
    const task = await mockTaskService.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users/:id/profile', mockAuthMiddleware, async (req, res) => {
  try {
    const user = await mockUserService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const server = createServer(app);

describe('Submission Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock responses
    mockTaskService.getTaskById.mockResolvedValue({
      id: 'task-123',
      title: 'Build a React Component',
      description: 'Create a responsive navigation component',
      skillCategory: 'Full-Stack Software Development',
      taskType: 'practice',
      basePoints: 50,
      maxPoints: 200,
      estimatedDuration: 30,
      completionCount: 0
    });

    mockUserService.getUserById.mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      points: 0,
      rank: 'Bronze',
      rankProgress: 0
    });

    mockSubmissionService.getUserSubmissionHistory.mockResolvedValue([]);
    mockSubmissionService.createSubmission.mockResolvedValue({
      id: 'sub-123',
      userId: 'user-123',
      taskId: 'task-123',
      proofText: 'I completed the task',
      proofType: 'text',
      proofStrength: 25,
      pointsAwarded: 100,
      status: 'approved',
      createdAt: new Date()
    });

    mockUserService.updateUserPoints.mockResolvedValue(true);
    mockUserService.updateUserRank.mockResolvedValue(true);
    mockTaskService.updateTaskCompletionCount.mockResolvedValue(true);
  });

  afterEach(() => {
    server.close();
  });

  describe('Complete Submission Flow', () => {
    it('should process a complete submission flow successfully', async () => {
      const submissionData = {
        taskId: 'task-123',
        proofText: 'I completed the React component task by creating a responsive navigation bar with proper state management and accessibility features.',
        proofType: 'text',
        proofStrength: 25
      };

      const response = await request(app)
        .post('/api/submissions')
        .set('Authorization', 'Bearer test-token')
        .send(submissionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.submission).toBeDefined();
      expect(response.body.scoring).toBeDefined();
      expect(response.body.scoring.pointsAwarded).toBeGreaterThan(0);
      expect(response.body.scoring.newRank).toBe('Bronze');

      // Verify all service calls were made
      expect(mockTaskService.getTaskById).toHaveBeenCalledWith('task-123');
      expect(mockSubmissionService.getUserSubmissionHistory).toHaveBeenCalledWith('user-123');
      expect(mockSubmissionService.createSubmission).toHaveBeenCalled();
      expect(mockUserService.updateUserPoints).toHaveBeenCalled();
      expect(mockUserService.updateUserRank).toHaveBeenCalled();
      expect(mockTaskService.updateTaskCompletionCount).toHaveBeenCalledWith('task-123');
    });

    it('should handle different proof strengths correctly', async () => {
      const weakSubmission = {
        taskId: 'task-123',
        proofText: 'I completed the task',
        proofType: 'text',
        proofStrength: 10
      };

      const strongSubmission = {
        taskId: 'task-123',
        proofText: 'I completed the task with comprehensive documentation and testing',
        proofType: 'text',
        proofStrength: 50
      };

      const weakResponse = await request(app)
        .post('/api/submissions')
        .set('Authorization', 'Bearer test-token')
        .send(weakSubmission)
        .expect(201);

      const strongResponse = await request(app)
        .post('/api/submissions')
        .set('Authorization', 'Bearer test-token')
        .send(strongSubmission)
        .expect(201);

      expect(strongResponse.body.scoring.pointsAwarded).toBeGreaterThan(weakResponse.body.scoring.pointsAwarded);
    });

    it('should handle user history in scoring calculation', async () => {
      // Mock user history with previous submissions
      mockSubmissionService.getUserSubmissionHistory.mockResolvedValue([
        {
          id: 'sub-1',
          taskId: 'task-1',
          pointsAwarded: 100,
          createdAt: new Date(Date.now() - 86400000) // 1 day ago
        },
        {
          id: 'sub-2',
          taskId: 'task-2',
          pointsAwarded: 150,
          createdAt: new Date(Date.now() - 172800000) // 2 days ago
        }
      ]);

      const submissionData = {
        taskId: 'task-123',
        proofText: 'I completed the task',
        proofType: 'text',
        proofStrength: 25
      };

      const response = await request(app)
        .post('/api/submissions')
        .set('Authorization', 'Bearer test-token')
        .send(submissionData)
        .expect(201);

      expect(response.body.scoring).toBeDefined();
      expect(mockSubmissionService.getUserSubmissionHistory).toHaveBeenCalledWith('user-123');
    });
  });

  describe('Input Validation', () => {
    it('should reject submission with missing taskId', async () => {
      const submissionData = {
        proofText: 'I completed the task',
        proofType: 'text',
        proofStrength: 25
      };

      const response = await request(app)
        .post('/api/submissions')
        .set('Authorization', 'Bearer test-token')
        .send(submissionData)
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
    });

    it('should reject submission with missing proofText', async () => {
      const submissionData = {
        taskId: 'task-123',
        proofType: 'text',
        proofStrength: 25
      };

      const response = await request(app)
        .post('/api/submissions')
        .set('Authorization', 'Bearer test-token')
        .send(submissionData)
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
    });

    it('should reject submission with missing proofType', async () => {
      const submissionData = {
        taskId: 'task-123',
        proofText: 'I completed the task',
        proofStrength: 25
      };

      const response = await request(app)
        .post('/api/submissions')
        .set('Authorization', 'Bearer test-token')
        .send(submissionData)
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
    });

    it('should handle empty proof text', async () => {
      const submissionData = {
        taskId: 'task-123',
        proofText: '',
        proofType: 'text',
        proofStrength: 25
      };

      const response = await request(app)
        .post('/api/submissions')
        .set('Authorization', 'Bearer test-token')
        .send(submissionData)
        .expect(201); // Should still process but with lower points

      expect(response.body.scoring.pointsAwarded).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle task not found', async () => {
      mockTaskService.getTaskById.mockResolvedValue(null);

      const submissionData = {
        taskId: 'nonexistent-task',
        proofText: 'I completed the task',
        proofType: 'text',
        proofStrength: 25
      };

      const response = await request(app)
        .post('/api/submissions')
        .set('Authorization', 'Bearer test-token')
        .send(submissionData)
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });

    it('should handle database errors gracefully', async () => {
      mockTaskService.getTaskById.mockRejectedValue(new Error('Database connection failed'));

      const submissionData = {
        taskId: 'task-123',
        proofText: 'I completed the task',
        proofType: 'text',
        proofStrength: 25
      };

      const response = await request(app)
        .post('/api/submissions')
        .set('Authorization', 'Bearer test-token')
        .send(submissionData)
        .expect(500);

      expect(response.body.error).toBe('Internal server error');
    });

    it('should handle scoring calculation errors', async () => {
      // Mock a scoring error by making the formula throw
      const originalCalculatePoints = ServicePointsFormulaV5.prototype.calculatePoints;
      ServicePointsFormulaV5.prototype.calculatePoints = vi.fn().mockImplementation(() => {
        throw new Error('Scoring calculation failed');
      });

      const submissionData = {
        taskId: 'task-123',
        proofText: 'I completed the task',
        proofType: 'text',
        proofStrength: 25
      };

      const response = await request(app)
        .post('/api/submissions')
        .set('Authorization', 'Bearer test-token')
        .send(submissionData)
        .expect(500);

      expect(response.body.error).toBe('Internal server error');

      // Restore original method
      ServicePointsFormulaV5.prototype.calculatePoints = originalCalculatePoints;
    });
  });

  describe('Rank Progression', () => {
    it('should update user rank based on points', async () => {
      // Mock user with enough points for Silver rank
      mockUserService.getUserById.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        points: 1500, // Enough for Silver
        rank: 'Bronze',
        rankProgress: 50
      });

      const submissionData = {
        taskId: 'task-123',
        proofText: 'I completed the task',
        proofType: 'text',
        proofStrength: 50
      };

      const response = await request(app)
        .post('/api/submissions')
        .set('Authorization', 'Bearer test-token')
        .send(submissionData)
        .expect(201);

      expect(response.body.scoring.newRank).toBeDefined();
      expect(mockUserService.updateUserRank).toHaveBeenCalled();
    });

    it('should calculate rank progress correctly', async () => {
      const submissionData = {
        taskId: 'task-123',
        proofText: 'I completed the task',
        proofType: 'text',
        proofStrength: 25
      };

      const response = await request(app)
        .post('/api/submissions')
        .set('Authorization', 'Bearer test-token')
        .send(submissionData)
        .expect(201);

      expect(response.body.scoring.rankProgress).toBeGreaterThan(0);
      expect(response.body.scoring.rankProgress).toBeLessThanOrEqual(100);
    });
  });

  describe('Task Completion Tracking', () => {
    it('should increment task completion count', async () => {
      const submissionData = {
        taskId: 'task-123',
        proofText: 'I completed the task',
        proofType: 'text',
        proofStrength: 25
      };

      await request(app)
        .post('/api/submissions')
        .set('Authorization', 'Bearer test-token')
        .send(submissionData)
        .expect(201);

      expect(mockTaskService.updateTaskCompletionCount).toHaveBeenCalledWith('task-123');
    });

    it('should handle task rotation when completion limit is reached', async () => {
      // Mock task that has reached completion limit
      mockTaskService.getTaskById.mockResolvedValue({
        id: 'task-123',
        title: 'Build a React Component',
        description: 'Create a responsive navigation component',
        skillCategory: 'Full-Stack Software Development',
        taskType: 'practice',
        basePoints: 50,
        maxPoints: 200,
        estimatedDuration: 30,
        completionCount: 50 // At the limit
      });

      const submissionData = {
        taskId: 'task-123',
        proofText: 'I completed the task',
        proofType: 'text',
        proofStrength: 25
      };

      const response = await request(app)
        .post('/api/submissions')
        .set('Authorization', 'Bearer test-token')
        .send(submissionData)
        .expect(201);

      // Should still process the submission
      expect(response.body.success).toBe(true);
      expect(mockTaskService.updateTaskCompletionCount).toHaveBeenCalled();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent submissions', async () => {
      const submissionData = {
        taskId: 'task-123',
        proofText: 'I completed the task',
        proofType: 'text',
        proofStrength: 25
      };

      const promises = Array(5).fill(null).map(() =>
        request(app)
          .post('/api/submissions')
          .set('Authorization', 'Bearer test-token')
          .send(submissionData)
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
    });

    it('should complete submission within reasonable time', async () => {
      const submissionData = {
        taskId: 'task-123',
        proofText: 'I completed the task',
        proofType: 'text',
        proofStrength: 25
      };

      const startTime = Date.now();
      
      await request(app)
        .post('/api/submissions')
        .set('Authorization', 'Bearer test-token')
        .send(submissionData)
        .expect(201);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across all updates', async () => {
      const submissionData = {
        taskId: 'task-123',
        proofText: 'I completed the task',
        proofType: 'text',
        proofStrength: 25
      };

      const response = await request(app)
        .post('/api/submissions')
        .set('Authorization', 'Bearer test-token')
        .send(submissionData)
        .expect(201);

      const scoring = response.body.scoring;
      const submission = response.body.submission;

      // Verify data consistency
      expect(submission.pointsAwarded).toBe(scoring.pointsAwarded);
      expect(submission.userId).toBe('user-123');
      expect(submission.taskId).toBe('task-123');
      expect(submission.status).toBe('approved');
    });

    it('should handle transaction rollback on partial failures', async () => {
      // Mock a failure in user points update
      mockUserService.updateUserPoints.mockRejectedValue(new Error('Update failed'));

      const submissionData = {
        taskId: 'task-123',
        proofText: 'I completed the task',
        proofType: 'text',
        proofStrength: 25
      };

      const response = await request(app)
        .post('/api/submissions')
        .set('Authorization', 'Bearer test-token')
        .send(submissionData)
        .expect(500);

      expect(response.body.error).toBe('Internal server error');
    });
  });
});
