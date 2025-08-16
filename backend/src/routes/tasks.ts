import express from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase-admin';
import { calculateTaskPoints, Task } from '../lib/points';
import { getDetailedScore } from '../utils/ai-score-utils';
import { authenticateToken, requireEmailVerification, requireAdmin } from '../middleware/auth';
import logger from '../utils/logger';
import { getSkillGatedTasks, SKILL_CATEGORIES } from '../services/task-forge.service';
import { performSubmissionIntegrityCheck } from '../services/submission-integrity.service';

const router = express.Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const taskQuerySchema = z.object({
  skill: z.string().optional(),
  type: z.enum(['practice', 'mini_project']).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).optional(),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(50)).optional(),
  offset: z.string().transform(val => parseInt(val)).pipe(z.number().min(0)).optional(),
});

const submissionSchema = z.object({
  task_id: z.string().uuid('Invalid task ID'),
  proof_type: z.enum(['image', 'file', 'link', 'text']),
  proof_url: z.string().url().optional(),
  proof_text: z.string().min(10, 'Proof text must be at least 10 characters').optional(),
  confirmation: z.boolean().refine(val => val === true, 'You must confirm this is your own work'),
});

const taskUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  skill_category: z.string().min(1).optional(),
  task_type: z.enum(['practice', 'mini_project']).optional(),
  base_points: z.number().min(0).optional(),
  max_points: z.number().min(0).optional(),
  estimated_duration: z.number().min(1).optional(),
  duration_factor: z.number().min(0).max(1).optional(),
  skill_factor: z.number().min(0).max(1).optional(),
  complexity_factor: z.number().min(0).max(1).optional(),
  visibility_factor: z.number().min(0).max(1).optional(),
  prestige_factor: z.number().min(0).max(1).optional(),
  autonomy_factor: z.number().min(0).max(1).optional(),
  difficulty_level: z.enum(['easy', 'medium', 'hard', 'expert']).optional(),
  is_active: z.boolean().optional(),
});

// ============================================================================
// TASK MANAGEMENT ROUTES
// ============================================================================

// GET /api/tasks - Get available tasks with filters (skill-gated)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Validate query parameters
    const validatedQuery = taskQuerySchema.parse(req.query);
    const { skill, type, difficulty, limit = 20, offset = 0 } = validatedQuery;

    logger.info('📋 Fetching skill-gated tasks', {
      skill,
      type,
      difficulty,
      limit,
      offset,
      userId: req.user?.id,
    });

    // Use skill-gated task fetching
    const result = await getSkillGatedTasks(req.user!.id, {
      skill,
      type,
      difficulty,
      limit,
      offset,
    });

    if (!result.success) {
      logger.error('❌ Failed to fetch skill-gated tasks:', { error: result.error });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch tasks',
        timestamp: new Date().toISOString(),
      });
    }

    const tasks = result.tasks || [];

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('tasks')
      .select('id', { count: 'exact' })
      .eq('is_active', true);

    if (skill) countQuery = countQuery.eq('skill_category', skill);
    if (type) countQuery = countQuery.eq('task_type', type);
    if (difficulty) countQuery = countQuery.eq('difficulty_level', difficulty);
    countQuery = countQuery.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    const { count: totalCount } = await countQuery;

    // Calculate theoretical max points for each task using Service Points Formula v5
    const tasksWithMaxPoints = tasks?.map(task => {
      const maxPoints = calculateTaskPoints(100, {
        id: task.id,
        title: task.title,
        description: task.description,
        skill_area: task.skill_category,
        duration: task.duration_factor,
        skill: task.skill_factor,
        complexity: task.complexity_factor,
        visibility: task.visibility_factor,
        prestige: task.prestige_factor,
        autonomy: task.autonomy_factor,
        created_at: task.created_at,
        is_active: task.is_active,
      }, 50); // Max proof strength

      return {
        ...task,
        theoretical_max_points: maxPoints.pointsAwarded,
      };
    });

    logger.info('✅ Tasks fetched successfully', {
      count: tasksWithMaxPoints?.length || 0,
      totalCount,
    });

    res.json({
      success: true,
      data: {
        tasks: tasksWithMaxPoints || [],
        pagination: {
          limit,
          offset,
          total: totalCount || 0,
          hasMore: (offset + limit) < (totalCount || 0),
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Task query validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Fetch tasks error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/tasks/:id - Get specific task details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Task ID is required',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('📋 Fetching task details', { taskId: id, userId: req.user?.id });

    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .select(`
        id, title, description, skill_category, task_type, base_points, max_points,
        estimated_duration, duration_factor, skill_factor, complexity_factor,
        visibility_factor, prestige_factor, autonomy_factor, difficulty_level,
        is_active, expires_at, completion_count, max_completions, created_at
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (taskError || !task) {
      logger.warn('❌ Task not found', { taskId: id });
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Check if task is expired
    if (task.expires_at && new Date(task.expires_at) < new Date()) {
      logger.warn('❌ Task expired', { taskId: id });
      return res.status(410).json({
        success: false,
        error: 'Task has expired',
        timestamp: new Date().toISOString(),
      });
    }

    // Calculate theoretical max points
    const maxPoints = calculateTaskPoints(100, {
      id: task.id,
      title: task.title,
      description: task.description,
      skill_area: task.skill_category,
      duration: task.duration_factor,
      skill: task.skill_factor,
      complexity: task.complexity_factor,
      visibility: task.visibility_factor,
      prestige: task.prestige_factor,
      autonomy: task.autonomy_factor,
      created_at: task.created_at,
      is_active: task.is_active,
    }, 50);

    // Check if user has already submitted this task
    let userSubmission = null;
    if (req.user) {
      const { data: submission } = await supabaseAdmin
        .from('submissions')
        .select('id, status, points_awarded, submitted_at')
        .eq('user_id', req.user.id)
        .eq('task_id', id)
        .single();

      userSubmission = submission;
    }

    logger.info('✅ Task details fetched successfully', { taskId: id });

    res.json({
      success: true,
      data: {
        task: {
          ...task,
          theoretical_max_points: maxPoints.pointsAwarded,
        },
        user_submission: userSubmission,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Fetch task details error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================================
// SUBMISSION ROUTES
// ============================================================================

// POST /api/tasks/submit - Submit task proof with integrity checks
router.post('/submit', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    // Validate request body
    const validatedData = submissionSchema.parse(req.body);
    const { task_id, proof_type, proof_url, proof_text, confirmation } = validatedData;

    if (!confirmation) {
      return res.status(400).json({
        success: false,
        error: 'You must confirm this is your own work',
        timestamp: new Date().toISOString(),
      });
    }

    // Perform submission integrity check
    const integrityCheck = await performSubmissionIntegrityCheck({
      proofText: proof_text,
      proofUrl: proof_url,
      userId: req.user!.id,
      taskId: task_id,
    });

    if (!integrityCheck.fileValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'File validation failed',
        details: integrityCheck.fileValidation.errors,
        warnings: integrityCheck.fileValidation.warnings,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('📝 Task submission attempt', {
      taskId: task_id,
      userId: req.user!.id,
      proofType: proof_type,
    });

    // Check if task exists and is active
    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', task_id)
      .eq('is_active', true)
      .single();

    if (taskError || !task) {
      logger.warn('❌ Task not found or inactive', { taskId: task_id });
      return res.status(404).json({
        success: false,
        error: 'Task not found or inactive',
        timestamp: new Date().toISOString(),
      });
    }

    // Check if task is expired
    if (task.expires_at && new Date(task.expires_at) < new Date()) {
      logger.warn('❌ Task expired', { taskId: task_id });
      return res.status(410).json({
        success: false,
        error: 'Task has expired',
        timestamp: new Date().toISOString(),
      });
    }

    // Check if user has already submitted this task
    const { data: existingSubmission } = await supabaseAdmin
      .from('submissions')
      .select('id, status')
      .eq('user_id', req.user!.id)
      .eq('task_id', task_id)
      .single();

    if (existingSubmission) {
      logger.warn('❌ User already submitted this task', {
        taskId: task_id,
        userId: req.user!.id,
        status: existingSubmission.status,
      });
      return res.status(409).json({
        success: false,
        error: 'You have already submitted this task',
        timestamp: new Date().toISOString(),
      });
    }

    // Validate proof based on type
    if (proof_type === 'text' && !proof_text) {
      return res.status(400).json({
        success: false,
        error: 'Proof text is required for text submissions',
        timestamp: new Date().toISOString(),
      });
    }

    if (proof_type === 'link' && !proof_url) {
      return res.status(400).json({
        success: false,
        error: 'Proof URL is required for link submissions',
        timestamp: new Date().toISOString(),
      });
    }

    // Determine proof strength based on type
    let proofStrength = 0;
    if (proof_type === 'text') proofStrength = 10;
    else if (proof_type === 'link') proofStrength = 25;
    else if (proof_type === 'image' || proof_type === 'file') proofStrength = 50;

    // Calculate points using Service Points Formula v5
    const taskForPoints: Task = {
      id: task.id,
      title: task.title,
      description: task.description,
      skill_area: task.skill_category,
      duration: task.estimated_duration / 60, // Convert to hours
      skill: task.difficulty_level === 'easy' ? 0.3 : task.difficulty_level === 'medium' ? 0.6 : 0.9,
      complexity: task.difficulty_level === 'easy' ? 0.2 : task.difficulty_level === 'medium' ? 0.5 : 0.8,
      visibility: 0.5, // Default visibility
      prestige: 0.4, // Default prestige
      autonomy: 0.6, // Default autonomy
      created_at: task.created_at,
      is_active: task.is_active,
    };

    const pointsResult = calculateTaskPoints(proofStrength, taskForPoints);
    const pointsAwarded = pointsResult.pointsAwarded;

    // Create submission with integrity flags and points
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('submissions')
      .insert({
        user_id: req.user!.id,
        task_id,
        proof_type,
        proof_url,
        proof_text,
        proof_strength: proofStrength,
        points_awarded: pointsAwarded,
        status: integrityCheck.reviewRequired ? 'pending' : 'approved',
        flagged_for_review: integrityCheck.reviewRequired,
        points_breakdown: {
          fraud_detection: integrityCheck.fraudDetection,
          integrity_warnings: integrityCheck.integrityWarnings,
          review_required: integrityCheck.reviewRequired,
          points_calculation: pointsResult.breakdown,
        },
      })
      .select('*')
      .single();

    if (submissionError) {
      logger.error('❌ Failed to create submission:', { error: submissionError.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to submit task',
        timestamp: new Date().toISOString(),
      });
    }

    // Update task completion count
    await supabaseAdmin
      .from('tasks')
      .update({ completion_count: task.completion_count + 1 })
      .eq('id', task_id);

    // If submission is automatically approved, update user points
    if (!integrityCheck.reviewRequired) {
      // Update user total points
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('total_points')
        .eq('id', req.user!.id)
        .single();

      if (!userError && user) {
        const newTotalPoints = (user.total_points || 0) + pointsAwarded;
        
        await supabaseAdmin
          .from('users')
          .update({ total_points: newTotalPoints })
          .eq('id', req.user!.id);

        // Log points history
        await supabaseAdmin
          .from('points_history')
          .insert({
            user_id: req.user!.id,
            points_change: pointsAwarded,
            reason: 'task_completion',
            metadata: {
              task_id: task_id,
              task_title: task.title,
              skill_category: task.skill_category,
              proof_type: proof_type,
              proof_strength: proofStrength,
            },
          });

        logger.info('✅ Points awarded to user', {
          userId: req.user!.id,
          taskId: task_id,
          pointsAwarded,
          newTotalPoints,
        });
      }
    }

    logger.info('✅ Task submitted successfully', {
      submissionId: submission.id,
      taskId: task_id,
      userId: req.user!.id,
    });

    res.status(201).json({
      success: true,
      message: 'Task submitted successfully. Your submission will be reviewed.',
      data: {
        submission: {
          id: submission.id,
          status: submission.status,
          submitted_at: submission.submitted_at,
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Submission validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid submission data',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Task submission error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/tasks/my-submissions - Get user's submissions
router.get('/my-submissions', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    const { limit = 20, offset = 0, status } = req.query;

    logger.info('📝 Fetching user submissions', {
      userId: req.user!.id,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      status,
    });

    // Build query
    let query = supabaseAdmin
      .from('submissions')
      .select(`
        id, proof_type, proof_url, proof_text, proof_strength, points_awarded, score,
        status, feedback, submitted_at, reviewed_at, auto_scored, flagged_for_review,
        tasks!inner (
          id, title, description, skill_category, task_type, difficulty_level
        )
      `)
      .eq('user_id', req.user!.id)
      .order('submitted_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: submissions, error: submissionsError } = await query;

    if (submissionsError) {
      logger.error('❌ Failed to fetch submissions:', { error: submissionsError.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch submissions',
        timestamp: new Date().toISOString(),
      });
    }

    // Get total count
    let countQuery = supabaseAdmin
      .from('submissions')
      .select('id', { count: 'exact' })
      .eq('user_id', req.user!.id);

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    const { count: totalCount } = await countQuery;

    logger.info('✅ User submissions fetched successfully', {
      count: submissions?.length || 0,
      totalCount,
      userId: req.user!.id,
    });

    res.json({
      success: true,
      data: {
        submissions: submissions || [],
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total: totalCount || 0,
          hasMore: (parseInt(offset as string) + parseInt(limit as string)) < (totalCount || 0),
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Fetch submissions error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// PUT /api/tasks/:id/proof - Update submission proof
router.put('/:id/proof', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    const { id } = req.params;
    const { proof_type, proof_url, proof_text } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Submission ID is required',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('📝 Updating submission proof', {
      submissionId: id,
      userId: req.user!.id,
    });

    // Check if submission exists and belongs to user
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('submissions')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (submissionError || !submission) {
      logger.warn('❌ Submission not found or access denied', { submissionId: id });
      return res.status(404).json({
        success: false,
        error: 'Submission not found or access denied',
        timestamp: new Date().toISOString(),
      });
    }

    // Check if submission can be updated (only pending submissions)
    if (submission.status !== 'pending') {
      logger.warn('❌ Cannot update non-pending submission', {
        submissionId: id,
        status: submission.status,
      });
      return res.status(400).json({
        success: false,
        error: 'Cannot update submission that has been reviewed',
        timestamp: new Date().toISOString(),
      });
    }

    // Update submission
    const updateData: any = {};
    if (proof_type) updateData.proof_type = proof_type;
    if (proof_url) updateData.proof_url = proof_url;
    if (proof_text) updateData.proof_text = proof_text;

    // Recalculate proof strength
    if (proof_type) {
      let proofStrength = 0;
      if (proof_type === 'text') proofStrength = 10;
      else if (proof_type === 'link') proofStrength = 25;
      else if (proof_type === 'image' || proof_type === 'file') proofStrength = 50;
      updateData.proof_strength = proofStrength;
    }

    const { data: updatedSubmission, error: updateError } = await supabaseAdmin
      .from('submissions')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      logger.error('❌ Failed to update submission:', { error: updateError.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to update submission',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Submission proof updated successfully', { submissionId: id });

    res.json({
      success: true,
      message: 'Submission proof updated successfully',
      data: {
        submission: updatedSubmission,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Update submission error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================================
// ADMIN ROUTES (require admin authentication)
// ============================================================================

// POST /api/tasks - Create new task (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Validate request body
    const validatedData = taskUpdateSchema.parse(req.body);

    logger.info('📝 Creating new task', {
      adminId: req.user!.id,
      taskData: validatedData,
    });

    const { data: newTask, error: createError } = await supabaseAdmin
      .from('tasks')
      .insert({
        ...validatedData,
        created_by: req.user!.id,
      })
      .select('*')
      .single();

    if (createError) {
      logger.error('❌ Failed to create task:', { error: createError.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to create task',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Task created successfully', { taskId: newTask.id });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task: newTask },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Task creation validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid task data',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Create task error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// PUT /api/tasks/:id - Update task (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = taskUpdateSchema.parse(req.body);

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Task ID is required',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('📝 Updating task', {
      taskId: id,
      adminId: req.user!.id,
      updateData: validatedData,
    });

    const { data: updatedTask, error: updateError } = await supabaseAdmin
      .from('tasks')
      .update(validatedData)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      logger.error('❌ Failed to update task:', { error: updateError.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to update task',
        timestamp: new Date().toISOString(),
      });
    }

    if (!updatedTask) {
      logger.warn('❌ Task not found', { taskId: id });
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Task updated successfully', { taskId: id });

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task: updatedTask },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Task update validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid task data',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Update task error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// DELETE /api/tasks/:id - Delete task (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Task ID is required',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('🗑️ Deleting task', {
      taskId: id,
      adminId: req.user!.id,
    });

    // Check if task has submissions
    const { data: submissions } = await supabaseAdmin
      .from('submissions')
      .select('id')
      .eq('task_id', id);

    if (submissions && submissions.length > 0) {
      logger.warn('❌ Cannot delete task with submissions', {
        taskId: id,
        submissionCount: submissions.length,
      });
      return res.status(400).json({
        success: false,
        error: 'Cannot delete task that has submissions',
        timestamp: new Date().toISOString(),
      });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', id);

    if (deleteError) {
      logger.error('❌ Failed to delete task:', { error: deleteError.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to delete task',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Task deleted successfully', { taskId: id });

    res.json({
      success: true,
      message: 'Task deleted successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Delete task error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/tasks/skill-categories - Get available skill categories
router.get('/skill-categories', async (req, res) => {
  try {
    logger.info('📋 Fetching skill categories');

    res.json({
      success: true,
      data: {
        categories: Object.entries(SKILL_CATEGORIES).map(([name, config]) => ({
          name,
          icon: config.icon,
          description: config.description,
          color: config.color,
        })),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Fetch skill categories error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
