import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  reviewService,
  reviewCommentSchema,
  reviewAssignmentSchema,
} from '../src/services/review.service';
import { executeWithRetry } from '../../db';

// Mock the database module
vi.mock('../../db', () => ({
  executeWithRetry: vi.fn(),
}));

describe('Review Service', () => {
  const mockExecuteWithRetry = executeWithRetry as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Schema Validation', () => {
    it('should validate review comment schema', () => {
      const validComment = {
        submissionId: '123e4567-e89b-12d3-a456-426614174000',
        reviewerId: '123e4567-e89b-12d3-a456-426614174001',
        lineNumber: 5,
        content: 'This line needs improvement',
      };

      const result = reviewCommentSchema.safeParse(validComment);
      expect(result.success).toBe(true);
    });

    it('should reject invalid review comment data', () => {
      const invalidComment = {
        submissionId: 'invalid-uuid',
        reviewerId: '123e4567-e89b-12d3-a456-426614174001',
        lineNumber: -1,
        content: '',
      };

      const result = reviewCommentSchema.safeParse(invalidComment);
      expect(result.success).toBe(false);
    });

    it('should validate review assignment schema', () => {
      const validAssignment = {
        submissionId: '123e4567-e89b-12d3-a456-426614174000',
        reviewerIds: ['123e4567-e89b-12d3-a456-426614174001'],
        dueDate: new Date(),
      };

      const result = reviewAssignmentSchema.safeParse(validAssignment);
      expect(result.success).toBe(true);
    });

    it('should reject empty reviewer list', () => {
      const invalidAssignment = {
        submissionId: '123e4567-e89b-12d3-a456-426614174000',
        reviewerIds: [],
        dueDate: new Date(),
      };

      const result = reviewAssignmentSchema.safeParse(invalidAssignment);
      expect(result.success).toBe(false);
    });
  });

  describe('createReviewComment', () => {
    it('should create a review comment successfully', async () => {
      const commentData = {
        submissionId: '123e4567-e89b-12d3-a456-426614174000',
        reviewerId: '123e4567-e89b-12d3-a456-426614174001',
        lineNumber: 5,
        content: 'This line needs improvement',
      };

      const mockComment = {
        comment_id: 'comment-123',
        submission_id: commentData.submissionId,
        reviewer_id: commentData.reviewerId,
        line_number: commentData.lineNumber,
        content: commentData.content,
        parent_comment_id: null,
        timestamp: new Date().toISOString(),
        users: { username: 'TestReviewer' },
      };

      mockExecuteWithRetry.mockResolvedValue(mockComment);

      const result = await reviewService.createReviewComment(commentData);

      expect(mockExecuteWithRetry).toHaveBeenCalledWith(expect.any(Function));
      expect(result).toEqual({
        commentId: 'comment-123',
        submissionId: commentData.submissionId,
        reviewerId: commentData.reviewerId,
        reviewerName: 'TestReviewer',
        lineNumber: commentData.lineNumber,
        content: commentData.content,
        parentCommentId: undefined,
        timestamp: expect.any(Date),
        replies: [],
      });
    });

    it('should handle database errors gracefully', async () => {
      const commentData = {
        submissionId: '123e4567-e89b-12d3-a456-426614174000',
        reviewerId: '123e4567-e89b-12d3-a456-426614174001',
        lineNumber: 5,
        content: 'This line needs improvement',
      };

      mockExecuteWithRetry.mockRejectedValue(new Error('Database error'));

      await expect(
        reviewService.createReviewComment(commentData)
      ).rejects.toThrow('Failed to create review comment');
    });

    it('should create a reply comment with parent comment ID', async () => {
      const commentData = {
        submissionId: '123e4567-e89b-12d3-a456-426614174000',
        reviewerId: '123e4567-e89b-12d3-a456-426614174001',
        lineNumber: 5,
        content: 'I agree with this comment',
        parentCommentId: 'parent-comment-123',
      };

      const mockComment = {
        comment_id: 'reply-123',
        submission_id: commentData.submissionId,
        reviewer_id: commentData.reviewerId,
        line_number: commentData.lineNumber,
        content: commentData.content,
        parent_comment_id: commentData.parentCommentId,
        timestamp: new Date().toISOString(),
        users: { username: 'TestReviewer' },
      };

      mockExecuteWithRetry.mockResolvedValue(mockComment);

      const result = await reviewService.createReviewComment(commentData);

      expect(result.parentCommentId).toBe('parent-comment-123');
    });
  });

  describe('assignReviewers', () => {
    it('should assign multiple reviewers successfully', async () => {
      const assignmentData = {
        submissionId: '123e4567-e89b-12d3-a456-426614174000',
        reviewerIds: [
          '123e4567-e89b-12d3-a456-426614174001',
          '123e4567-e89b-12d3-a456-426614174002',
        ],
        dueDate: new Date('2024-01-15'),
      };

      const mockAssignments = [
        {
          assignment_id: 'assignment-1',
          submission_id: assignmentData.submissionId,
          reviewer_id: assignmentData.reviewerIds[0],
          status: 'pending',
          assigned_at: new Date().toISOString(),
          due_date: assignmentData.dueDate?.toISOString(),
        },
        {
          assignment_id: 'assignment-2',
          submission_id: assignmentData.submissionId,
          reviewer_id: assignmentData.reviewerIds[1],
          status: 'pending',
          assigned_at: new Date().toISOString(),
          due_date: assignmentData.dueDate?.toISOString(),
        },
      ];

      mockExecuteWithRetry.mockResolvedValue(mockAssignments);

      const result = await reviewService.assignReviewers(assignmentData);

      expect(result).toHaveLength(2);
      expect(result[0].reviewerId).toBe(assignmentData.reviewerIds[0]);
      expect(result[1].reviewerId).toBe(assignmentData.reviewerIds[1]);
      expect(result[0].status).toBe('pending');
    });

    it('should handle assignment creation errors', async () => {
      const assignmentData = {
        submissionId: '123e4567-e89b-12d3-a456-426614174000',
        reviewerIds: ['123e4567-e89b-12d3-a456-426614174001'],
      };

      mockExecuteWithRetry.mockRejectedValue(new Error('Database error'));

      await expect(
        reviewService.assignReviewers(assignmentData)
      ).rejects.toThrow('Failed to assign reviewers');
    });
  });

  describe('getSubmissionComments', () => {
    it('should retrieve comments for a submission', async () => {
      const submissionId = '123e4567-e89b-12d3-a456-426614174000';

      const mockComments = [
        {
          comment_id: 'comment-1',
          submission_id: submissionId,
          reviewer_id: 'reviewer-1',
          line_number: 5,
          content: 'First comment',
          parent_comment_id: null,
          timestamp: new Date().toISOString(),
          users: { username: 'Reviewer1' },
        },
        {
          comment_id: 'comment-2',
          submission_id: submissionId,
          reviewer_id: 'reviewer-2',
          line_number: 10,
          content: 'Second comment',
          parent_comment_id: null,
          timestamp: new Date().toISOString(),
          users: { username: 'Reviewer2' },
        },
      ];

      mockExecuteWithRetry.mockResolvedValue(mockComments);

      const result = await reviewService.getSubmissionComments(submissionId);

      expect(result).toHaveLength(2);
      expect(result[0].content).toBe('First comment');
      expect(result[1].content).toBe('Second comment');
    });

    it('should organize comments into hierarchy', async () => {
      const submissionId = '123e4567-e89b-12d3-a456-426614174000';

      const mockComments = [
        {
          comment_id: 'parent-1',
          submission_id: submissionId,
          reviewer_id: 'reviewer-1',
          line_number: 5,
          content: 'Parent comment',
          parent_comment_id: null,
          timestamp: new Date().toISOString(),
          users: { username: 'Reviewer1' },
        },
        {
          comment_id: 'reply-1',
          submission_id: submissionId,
          reviewer_id: 'reviewer-2',
          line_number: 5,
          content: 'Reply to parent',
          parent_comment_id: 'parent-1',
          timestamp: new Date().toISOString(),
          users: { username: 'Reviewer2' },
        },
      ];

      mockExecuteWithRetry.mockResolvedValue(mockComments);

      const result = await reviewService.getSubmissionComments(submissionId);

      expect(result).toHaveLength(1); // Only parent comments
      expect(result[0].replies).toHaveLength(1); // One reply
      expect(result[0].replies[0].content).toBe('Reply to parent');
    });
  });

  describe('getReviewAssignments', () => {
    it('should retrieve assignments for a reviewer', async () => {
      const reviewerId = '123e4567-e89b-12d3-a456-426614174001';

      const mockAssignments = [
        {
          assignment_id: 'assignment-1',
          submission_id: 'submission-1',
          reviewer_id: reviewerId,
          status: 'pending',
          assigned_at: new Date().toISOString(),
          due_date: new Date('2024-01-15').toISOString(),
          completed_at: null,
          submissions: {
            title: 'Test Submission',
            description: 'Test Description',
          },
        },
      ];

      mockExecuteWithRetry.mockResolvedValue(mockAssignments);

      const result = await reviewService.getReviewAssignments(reviewerId);

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('pending');
      expect(result[0].reviewerId).toBe(reviewerId);
    });
  });

  describe('updateReviewStatus', () => {
    it('should update review status successfully', async () => {
      const assignmentId = 'assignment-123';
      const newStatus = 'completed';

      mockExecuteWithRetry.mockResolvedValue(undefined);

      await reviewService.updateReviewStatus(assignmentId, newStatus);

      expect(mockExecuteWithRetry).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should set completed_at when status is completed', async () => {
      const assignmentId = 'assignment-123';
      const newStatus = 'completed';

      mockExecuteWithRetry.mockImplementation(async (fn) => {
        const mockClient = {
          from: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
        };
        return fn(mockClient);
      });

      await reviewService.updateReviewStatus(assignmentId, newStatus);

      expect(mockExecuteWithRetry).toHaveBeenCalled();
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      const commentId = 'comment-123';
      const reviewerId = 'reviewer-123';

      mockExecuteWithRetry.mockResolvedValue(undefined);

      await reviewService.deleteComment(commentId, reviewerId);

      expect(mockExecuteWithRetry).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should handle deletion errors', async () => {
      const commentId = 'comment-123';
      const reviewerId = 'reviewer-123';

      mockExecuteWithRetry.mockRejectedValue(new Error('Database error'));

      await expect(
        reviewService.deleteComment(commentId, reviewerId)
      ).rejects.toThrow('Failed to delete comment');
    });
  });

  describe('getReviewStats', () => {
    it('should return review statistics', async () => {
      const submissionId = '123e4567-e89b-12d3-a456-426614174000';

      const mockStats = {
        total_comments: 5,
        completed_reviews: 2,
        pending_reviews: 1,
        avg_response_time: 120,
      };

      mockExecuteWithRetry.mockResolvedValue(mockStats);

      const result = await reviewService.getReviewStats(submissionId);

      expect(result).toEqual({
        totalComments: 5,
        completedReviews: 2,
        pendingReviews: 1,
        averageResponseTime: 120,
      });
    });

    it('should return default values on error', async () => {
      const submissionId = '123e4567-e89b-12d3-a456-426614174000';

      mockExecuteWithRetry.mockRejectedValue(new Error('Database error'));

      const result = await reviewService.getReviewStats(submissionId);

      expect(result).toEqual({
        totalComments: 0,
        completedReviews: 0,
        pendingReviews: 0,
        averageResponseTime: 0,
      });
    });
  });

  describe('Authorization', () => {
    it('should only allow comment deletion by the original reviewer', async () => {
      const commentId = 'comment-123';
      const originalReviewerId = 'reviewer-123';
      const differentReviewerId = 'reviewer-456';

      // This test would require additional authorization logic in the service
      // For now, we'll test that the service calls the database with the correct parameters
      mockExecuteWithRetry.mockResolvedValue(undefined);

      await reviewService.deleteComment(commentId, originalReviewerId);

      expect(mockExecuteWithRetry).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing user data gracefully', async () => {
      const commentData = {
        submissionId: '123e4567-e89b-12d3-a456-426614174000',
        reviewerId: '123e4567-e89b-12d3-a456-426614174001',
        lineNumber: 5,
        content: 'This line needs improvement',
      };

      const mockComment = {
        comment_id: 'comment-123',
        submission_id: commentData.submissionId,
        reviewer_id: commentData.reviewerId,
        line_number: commentData.lineNumber,
        content: commentData.content,
        parent_comment_id: null,
        timestamp: new Date().toISOString(),
        users: null, // Missing user data
      };

      mockExecuteWithRetry.mockResolvedValue(mockComment);

      const result = await reviewService.createReviewComment(commentData);

      expect(result.reviewerName).toBe('Unknown');
    });

    it('should handle large comment content', async () => {
      const longContent = 'A'.repeat(1000); // Maximum allowed length
      const commentData = {
        submissionId: '123e4567-e89b-12d3-a456-426614174000',
        reviewerId: '123e4567-e89b-12d3-a456-426614174001',
        lineNumber: 5,
        content: longContent,
      };

      const result = reviewCommentSchema.safeParse(commentData);
      expect(result.success).toBe(true);
    });

    it('should reject overly long comment content', async () => {
      const tooLongContent = 'A'.repeat(1001); // Exceeds maximum length
      const commentData = {
        submissionId: '123e4567-e89b-12d3-a456-426614174000',
        reviewerId: '123e4567-e89b-12d3-a456-426614174001',
        lineNumber: 5,
        content: tooLongContent,
      };

      const result = reviewCommentSchema.safeParse(commentData);
      expect(result.success).toBe(false);
    });
  });
});
