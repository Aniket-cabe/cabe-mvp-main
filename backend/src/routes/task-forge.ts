/**
 * CaBE Arena Task Forge API Routes
 * 
 * Handles automated task generation, template management, and task rotation.
 */

import express from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase-admin';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import logger from '../utils/logger';
import {
  generateTaskFromTemplate,
  generateTasksForAllCategories,
  rotateExpiredTasks,
  initializeTaskTemplates,
  SKILL_CATEGORIES,
  TASK_TYPES,
} from '../services/task-forge.service';

const router = express.Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const templateGenerationSchema = z.object({
  template_id: z.string().uuid('Invalid template ID'),
});

const bulkGenerationSchema = z.object({
  skill_categories: z.array(z.string()).optional(),
  task_types: z.array(z.enum(['practice', 'mini_project'])).optional(),
  count_per_template: z.number().min(1).max(10).optional(),
});

const taskRotationSchema = z.object({
  force: z.boolean().optional(),
  dry_run: z.boolean().optional(),
});

// ============================================================================
// TEMPLATE MANAGEMENT ROUTES
// ============================================================================

// GET /api/task-forge/templates - Get all task templates
router.get('/templates', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0, skill_category, task_type } = req.query;

    logger.info('📋 Fetching task templates', {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      skill_category,
      task_type,
    });

    // Build query
    let query = supabaseAdmin
      .from('task_templates')
      .select('*')
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (skill_category) {
      query = query.eq('skill_category', skill_category);
    }
    if (task_type) {
      query = query.eq('task_type', task_type);
    }

    const { data: templates, error: templatesError } = await query;

    if (templatesError) {
      logger.error('❌ Failed to fetch templates:', { error: templatesError.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch templates',
        timestamp: new Date().toISOString(),
      });
    }

    // Get total count
    const { count: totalCount } = await supabaseAdmin
      .from('task_templates')
      .select('id', { count: 'exact' });

    logger.info('✅ Task templates fetched successfully', {
      count: templates?.length || 0,
      totalCount,
    });

    res.json({
      success: true,
      data: {
        templates: templates || [],
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
    logger.error('❌ Fetch templates error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/task-forge/templates/initialize - Initialize default templates
router.post('/templates/initialize', authenticateToken, requireAdmin, async (req, res) => {
  try {
    logger.info('🚀 Initializing task templates');

    const result = await initializeTaskTemplates();

    if (!result.success) {
      logger.error('❌ Template initialization failed:', { errors: result.errors });
      return res.status(500).json({
        success: false,
        error: 'Failed to initialize templates',
        details: result.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Task templates initialized successfully', {
      created: result.created,
      errors: result.errors.length,
    });

    res.json({
      success: true,
      message: 'Task templates initialized successfully',
      data: {
        created: result.created,
        errors: result.errors,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Template initialization error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================================
// TASK GENERATION ROUTES
// ============================================================================

// POST /api/task-forge/generate - Generate task from template
router.post('/generate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validatedData = templateGenerationSchema.parse(req.body);
    const { template_id } = validatedData;

    logger.info('🎯 Generating task from template', { templateId: template_id });

    const result = await generateTaskFromTemplate(template_id);

    if (!result.success) {
      logger.error('❌ Task generation failed:', { error: result.error });
      return res.status(400).json({
        success: false,
        error: 'Failed to generate task',
        details: result.error,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Task generated successfully', {
      taskId: result.task?.id,
      templateId: template_id,
    });

    res.json({
      success: true,
      message: 'Task generated successfully',
      data: {
        task: result.task,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Task generation validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Task generation error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/task-forge/generate/bulk - Generate tasks for all categories
router.post('/generate/bulk', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validatedData = bulkGenerationSchema.parse(req.body);
    const { skill_categories, task_types, count_per_template = 1 } = validatedData;

    logger.info('🎯 Bulk task generation requested', {
      skillCategories: skill_categories,
      taskTypes: task_types,
      countPerTemplate: count_per_template,
    });

    const result = await generateTasksForAllCategories();

    if (!result.success) {
      logger.error('❌ Bulk task generation failed:', { errors: result.errors });
      return res.status(500).json({
        success: false,
        error: 'Failed to generate tasks',
        details: result.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Bulk task generation completed', {
      generated: result.generated,
      errors: result.errors.length,
    });

    res.json({
      success: true,
      message: 'Bulk task generation completed',
      data: {
        generated: result.generated,
        errors: result.errors,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Bulk generation validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Bulk task generation error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================================
// TASK ROTATION ROUTES
// ============================================================================

// POST /api/task-forge/rotate - Rotate expired tasks
router.post('/rotate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validatedData = taskRotationSchema.parse(req.body);
    const { force = false, dry_run = false } = validatedData;

    logger.info('🔄 Task rotation requested', { force, dryRun: dry_run });

    if (dry_run) {
      // Get expired tasks without actually rotating them
      const now = new Date().toISOString();
      const { data: expiredTasks, error: expiredError } = await supabaseAdmin
        .from('tasks')
        .select('id, title, completion_count, max_completions, expires_at')
        .or(`expires_at.lt.${now},and(completion_count.gte.max_completions,is_active.eq.true)`);

      if (expiredError) {
        throw new Error('Failed to fetch expired tasks');
      }

      logger.info('✅ Dry run completed', {
        expiredCount: expiredTasks?.length || 0,
      });

      return res.json({
        success: true,
        message: 'Dry run completed',
        data: {
          expired: expiredTasks?.length || 0,
          tasks: expiredTasks || [],
          dryRun: true,
        },
        timestamp: new Date().toISOString(),
      });
    }

    const result = await rotateExpiredTasks();

    if (!result.success) {
      logger.error('❌ Task rotation failed:', { error: result.error });
      return res.status(500).json({
        success: false,
        error: 'Failed to rotate tasks',
        details: result.error,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ Task rotation completed', {
      expired: result.expired,
    });

    res.json({
      success: true,
      message: 'Task rotation completed',
      data: {
        expired: result.expired,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Task rotation validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Task rotation error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================================
// STATISTICS ROUTES
// ============================================================================

// GET /api/task-forge/stats - Get task forge statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    logger.info('📊 Fetching task forge statistics');

    // Get template statistics
    const { data: templateStats, error: templateError } = await supabaseAdmin
      .from('task_templates')
      .select('skill_category, task_type, is_active');

    if (templateError) {
      throw new Error('Failed to fetch template statistics');
    }

    // Get generated task statistics
    const { data: generatedStats, error: generatedError } = await supabaseAdmin
      .from('generated_tasks')
      .select('created_at');

    if (generatedError) {
      throw new Error('Failed to fetch generated task statistics');
    }

    // Get active task statistics
    const { data: activeTasks, error: activeError } = await supabaseAdmin
      .from('tasks')
      .select('skill_category, task_type, is_active, expires_at')
      .eq('is_active', true);

    if (activeError) {
      throw new Error('Failed to fetch active task statistics');
    }

    // Calculate statistics
    const templateCounts = templateStats?.reduce((acc, template) => {
      const key = `${template.skill_category}_${template.task_type}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const generatedToday = generatedStats?.filter(
      task => new Date(task.created_at).toDateString() === new Date().toDateString()
    ).length || 0;

    const expiringSoon = activeTasks?.filter(
      task => task.expires_at && new Date(task.expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ).length || 0;

    const skillCategoryStats = Object.keys(SKILL_CATEGORIES).map(category => ({
      category,
      activeTasks: activeTasks?.filter(task => task.skill_category === category).length || 0,
      templates: templateStats?.filter(template => template.skill_category === category).length || 0,
    }));

    logger.info('✅ Task forge statistics fetched successfully');

    res.json({
      success: true,
      data: {
        templates: {
          total: templateStats?.length || 0,
          byCategory: templateCounts,
          active: templateStats?.filter(t => t.is_active).length || 0,
        },
        generated: {
          total: generatedStats?.length || 0,
          today: generatedToday,
        },
        active: {
          total: activeTasks?.length || 0,
          expiringSoon,
          bySkillCategory: skillCategoryStats,
        },
        skillCategories: Object.keys(SKILL_CATEGORIES),
        taskTypes: Object.keys(TASK_TYPES),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Task forge statistics error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================================
// CONFIGURATION ROUTES
// ============================================================================

// GET /api/task-forge/config - Get task forge configuration
router.get('/config', authenticateToken, requireAdmin, async (req, res) => {
  try {
    logger.info('⚙️ Fetching task forge configuration');

    res.json({
      success: true,
      data: {
        skillCategories: SKILL_CATEGORIES,
        taskTypes: TASK_TYPES,
        placeholders: {
          component_type: ['Button', 'Modal', 'Card', 'Form', 'Navigation', 'Sidebar', 'Footer', 'Header'],
          features: ['responsive design', 'accessibility', 'animations', 'state management', 'error handling'],
          platform: ['GitHub', 'Twitter', 'Stripe', 'Google Maps', 'Firebase', 'AWS', 'Heroku'],
          functionality: ['user authentication', 'data visualization', 'real-time updates', 'file upload', 'search'],
          design_type: ['landing page', 'mobile app', 'dashboard', 'e-commerce', 'portfolio', 'blog'],
          style: ['minimalist', 'modern', 'vintage', 'corporate', 'playful', 'elegant'],
          color_scheme: ['monochrome', 'complementary', 'analogous', 'triadic', 'split-complementary'],
          content_type: ['blog post', 'product description', 'email campaign', 'social media post', 'technical guide'],
          topic: ['artificial intelligence', 'sustainable living', 'remote work', 'digital marketing', 'health tech'],
          tone: ['professional', 'casual', 'enthusiastic', 'educational', 'persuasive'],
          model_type: ['classification', 'regression', 'clustering', 'recommendation', 'natural language processing'],
          dataset: ['customer behavior', 'sales data', 'social media', 'weather data', 'financial data'],
          tool: ['Python', 'TensorFlow', 'PyTorch', 'scikit-learn', 'pandas', 'numpy'],
          algorithm: ['random forest', 'neural network', 'support vector machine', 'k-means', 'linear regression'],
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ Task forge config error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
