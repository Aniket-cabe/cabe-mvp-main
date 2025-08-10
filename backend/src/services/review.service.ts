import { z } from 'zod';
import { executeWithRetry } from '../../db';
import logger from '../utils/logger';

export const reviewCommentSchema = z.object({
  submissionId: z.string().uuid(),
  reviewerId: z.string().uuid(),
  lineNumber: z.number().min(1),
  content: z.string().min(1).max(1000),
  parentCommentId: z.string().uuid().optional(),
});

export const reviewAssignmentSchema = z.object({
  submissionId: z.string().uuid(),
  reviewerIds: z.array(z.string().uuid()).min(1).max(5),
  dueDate: z.date().optional(),
});

interface ReviewComment {
  commentId: string;
  submissionId: string;
  reviewerId: string;
  reviewerName: string;
  lineNumber: number;
  content: string;
  parentCommentId?: string;
  timestamp: Date;
  replies: ReviewComment[];
}

interface ReviewAssignment {
  assignmentId: string;
  submissionId: string;
  reviewerId: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedAt: Date;
  dueDate?: Date;
  completedAt?: Date;
}

class ReviewService {
  async createReviewComment(
    data: z.infer<typeof reviewCommentSchema>
  ): Promise<ReviewComment> {
    try {
      const validatedData = reviewCommentSchema.parse(data);

      const comment = await executeWithRetry(async (client) => {
        const { data: commentData, error } = await client
          .from('review_comments')
          .insert({
            submission_id: validatedData.submissionId,
            reviewer_id: validatedData.reviewerId,
            line_number: validatedData.lineNumber,
            content: validatedData.content,
            parent_comment_id: validatedData.parentCommentId,
            timestamp: new Date(),
          })
          .select(
            `
            comment_id,
            submission_id,
            reviewer_id,
            line_number,
            content,
            parent_comment_id,
            timestamp,
            users!reviewer_id(username)
          `
          )
          .single();

        if (error) throw error;
        return commentData;
      });

      return {
        commentId: comment.comment_id,
        submissionId: comment.submission_id,
        reviewerId: comment.reviewer_id,
        reviewerName: comment.users?.username || 'Unknown',
        lineNumber: comment.line_number,
        content: comment.content,
        parentCommentId: comment.parent_comment_id,
        timestamp: new Date(comment.timestamp),
        replies: [],
      };
    } catch (error) {
      logger.error('Failed to create review comment:', error);
      throw new Error('Failed to create review comment');
    }
  }

  async assignReviewers(
    data: z.infer<typeof reviewAssignmentSchema>
  ): Promise<ReviewAssignment[]> {
    try {
      const validatedData = reviewAssignmentSchema.parse(data);

      const assignments = await executeWithRetry(async (client) => {
        const assignmentsData = validatedData.reviewerIds.map((reviewerId) => ({
          submission_id: validatedData.submissionId,
          reviewer_id: reviewerId,
          status: 'pending',
          assigned_at: new Date(),
          due_date: validatedData.dueDate,
        }));

        const { data, error } = await client
          .from('review_assignments')
          .insert(assignmentsData)
          .select('*');

        if (error) throw error;
        return data;
      });

      return assignments.map((assignment) => ({
        assignmentId: assignment.assignment_id,
        submissionId: assignment.submission_id,
        reviewerId: assignment.reviewer_id,
        status: assignment.status,
        assignedAt: new Date(assignment.assigned_at),
        dueDate: assignment.due_date
          ? new Date(assignment.due_date)
          : undefined,
        completedAt: assignment.completed_at
          ? new Date(assignment.completed_at)
          : undefined,
      }));
    } catch (error) {
      logger.error('Failed to assign reviewers:', error);
      throw new Error('Failed to assign reviewers');
    }
  }

  async getSubmissionComments(submissionId: string): Promise<ReviewComment[]> {
    try {
      const comments = await executeWithRetry(async (client) => {
        const { data, error } = await client
          .from('review_comments')
          .select(
            `
            comment_id,
            submission_id,
            reviewer_id,
            line_number,
            content,
            parent_comment_id,
            timestamp,
            users!reviewer_id(username)
          `
          )
          .eq('submission_id', submissionId)
          .order('timestamp', { ascending: true });

        if (error) throw error;
        return data;
      });

      // Organize comments into hierarchy
      const commentMap = new Map<string, ReviewComment>();
      const rootComments: ReviewComment[] = [];

      comments.forEach((comment) => {
        const reviewComment: ReviewComment = {
          commentId: comment.comment_id,
          submissionId: comment.submission_id,
          reviewerId: comment.reviewer_id,
          reviewerName: comment.users?.username || 'Unknown',
          lineNumber: comment.line_number,
          content: comment.content,
          parentCommentId: comment.parent_comment_id,
          timestamp: new Date(comment.timestamp),
          replies: [],
        };

        commentMap.set(comment.comment_id, reviewComment);

        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies.push(reviewComment);
          }
        } else {
          rootComments.push(reviewComment);
        }
      });

      return rootComments;
    } catch (error) {
      logger.error('Failed to get submission comments:', error);
      throw new Error('Failed to get submission comments');
    }
  }

  async getReviewAssignments(reviewerId: string): Promise<ReviewAssignment[]> {
    try {
      const assignments = await executeWithRetry(async (client) => {
        const { data, error } = await client
          .from('review_assignments')
          .select(
            `
            assignment_id,
            submission_id,
            reviewer_id,
            status,
            assigned_at,
            due_date,
            completed_at,
            submissions!submission_id(title, description)
          `
          )
          .eq('reviewer_id', reviewerId)
          .order('assigned_at', { ascending: false });

        if (error) throw error;
        return data;
      });

      return assignments.map((assignment) => ({
        assignmentId: assignment.assignment_id,
        submissionId: assignment.submission_id,
        reviewerId: assignment.reviewer_id,
        status: assignment.status,
        assignedAt: new Date(assignment.assigned_at),
        dueDate: assignment.due_date
          ? new Date(assignment.due_date)
          : undefined,
        completedAt: assignment.completed_at
          ? new Date(assignment.completed_at)
          : undefined,
      }));
    } catch (error) {
      logger.error('Failed to get review assignments:', error);
      throw new Error('Failed to get review assignments');
    }
  }

  async updateReviewStatus(
    assignmentId: string,
    status: 'pending' | 'in_progress' | 'completed'
  ): Promise<void> {
    try {
      await executeWithRetry(async (client) => {
        const updateData: any = { status };
        if (status === 'completed') {
          updateData.completed_at = new Date();
        }

        const { error } = await client
          .from('review_assignments')
          .update(updateData)
          .eq('assignment_id', assignmentId);

        if (error) throw error;
      });

      logger.info(
        `Review assignment ${assignmentId} status updated to ${status}`
      );
    } catch (error) {
      logger.error('Failed to update review status:', error);
      throw new Error('Failed to update review status');
    }
  }

  async deleteComment(commentId: string, reviewerId: string): Promise<void> {
    try {
      await executeWithRetry(async (client) => {
        const { error } = await client
          .from('review_comments')
          .delete()
          .eq('comment_id', commentId)
          .eq('reviewer_id', reviewerId);

        if (error) throw error;
      });

      logger.info(`Comment ${commentId} deleted by reviewer ${reviewerId}`);
    } catch (error) {
      logger.error('Failed to delete comment:', error);
      throw new Error('Failed to delete comment');
    }
  }

  async getReviewStats(submissionId: string): Promise<{
    totalComments: number;
    completedReviews: number;
    pendingReviews: number;
    averageResponseTime: number;
  }> {
    try {
      const stats = await executeWithRetry(async (client) => {
        const { data, error } = await client.rpc('get_review_stats', {
          submission_id: submissionId,
        });

        if (error) throw error;
        return data;
      });

      return {
        totalComments: stats.total_comments || 0,
        completedReviews: stats.completed_reviews || 0,
        pendingReviews: stats.pending_reviews || 0,
        averageResponseTime: stats.avg_response_time || 0,
      };
    } catch (error) {
      logger.error('Failed to get review stats:', error);
      return {
        totalComments: 0,
        completedReviews: 0,
        pendingReviews: 0,
        averageResponseTime: 0,
      };
    }
  }
}

export const reviewService = new ReviewService();
export default reviewService;
