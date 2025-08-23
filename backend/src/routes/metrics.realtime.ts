import express, { Router } from 'express';
import { z } from 'zod';
import { executeWithRetry } from '../../db';
import logger from '../utils/logger';

const router = Router();

// Zod schemas for validation
const realtimeMetricsSchema = z.object({
  from: z.string().datetime('Invalid from date format'),
  to: z.string().datetime('Invalid to date format'),
  skill: z.string().optional(),
  type: z.enum(['arena', 'learning', 'gigs']).optional(),
});

// Known skill values for validation
const VALID_SKILLS = [
  'javascript',
  'python',
  'react',
  'nodejs',
  'typescript',
  'java',
  'csharp',
  'php',
  'ruby',
  'go',
  'rust',
  'swift',
  'kotlin',
  'scala',
  'dart',
  'flutter',
  'vue',
  'angular',
  'nextjs',
  'nuxt',
  'svelte',
  'solid',
  'astro',
  'remix',
  'express',
  'fastapi',
  'django',
  'spring',
  'laravel',
  'rails',
  'docker',
  'kubernetes',
  'aws',
  'azure',
  'gcp',
  'firebase',
  'mongodb',
  'postgresql',
  'mysql',
  'redis',
  'elasticsearch',
  'graphql',
  'rest',
  'websocket',
  'grpc',
  'microservices',
  'testing',
  'ci-cd',
  'devops',
  'security',
  'performance',
  'accessibility',
  'seo',
  'mobile',
  'desktop',
  'ai-ml',
];

// Enhanced validation with custom error messages
const enhancedRealtimeMetricsSchema = realtimeMetricsSchema
  .refine(
    (data) => {
      const fromDate = new Date(data.from);
      const toDate = new Date(data.to);
      return fromDate < toDate;
    },
    {
      message: 'From date must be before to date',
      path: ['from'],
    }
  )
  .refine(
    (data) => {
      if (!data.skill) return true;
      return VALID_SKILLS.includes(data.skill.toLowerCase());
    },
    {
      message: 'Invalid skill value',
      path: ['skill'],
    }
  );

/**
 * GET /api/metrics/realtime
 * Get real-time analytics data with filtering
 */
router.get('/realtime', async (req, res) => {
  try {
    // Validate query parameters
    const validationResult = enhancedRealtimeMetricsSchema.safeParse(req.query);

    if (!validationResult.success) {
      logger.warn(
        '❌ Invalid realtime metrics request:',
        validationResult.error.errors
      );
      return res.status(400).json({
        error: 'Invalid request parameters',
        details: validationResult.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    const { from, to, skill, type } = validationResult.data;

    // Build dynamic query conditions
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Date range condition
    conditions.push(
      `created_at >= $${paramIndex++} AND created_at <= $${paramIndex++}`
    );
    params.push(from, to);

    // Skill filter
    if (skill) {
      conditions.push(`LOWER(skill) = $${paramIndex++}`);
      params.push(skill.toLowerCase());
    }

    // Type filter
    if (type) {
      conditions.push(`task_type = $${paramIndex++}`);
      params.push(type);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get submission rate data (grouped by hour)
    const submissionRateData = await executeWithRetry(async (client) => {
      const { data, error } = await client.rpc('get_submission_rate_realtime', {
        from_date: from,
        to_date: to,
        skill_filter: skill || null,
        type_filter: type || null,
      });

      if (error) throw error;
      return data || [];
    });

    // Get active users data (grouped by hour)
    const activeUsersData = await executeWithRetry(async (client) => {
      const { data, error } = await client.rpc('get_active_users_realtime', {
        from_date: from,
        to_date: to,
        skill_filter: skill || null,
        type_filter: type || null,
      });

      if (error) throw error;
      return data || [];
    });

    // Get additional metrics
    const additionalMetrics = await executeWithRetry(async (client) => {
      const { data, error } = await client.rpc(
        'get_additional_metrics_realtime',
        {
          from_date: from,
          to_date: to,
          skill_filter: skill || null,
          type_filter: type || null,
        }
      );

      if (error) throw error;
      return data || {};
    });

    // Format response
    const response = {
      submissionRate: submissionRateData.map((item: any) => ({
        timestamp: item.hour,
        count: parseInt(item.submission_count),
        averageScore: parseFloat(item.avg_score || 0).toFixed(2),
      })),
      activeUsers: activeUsersData.map((item: any) => ({
        timestamp: item.hour,
        count: parseInt(item.active_users),
        uniqueUsers: parseInt(item.unique_users),
      })),
      summary: {
        totalSubmissions: additionalMetrics.total_submissions || 0,
        totalUsers: additionalMetrics.total_users || 0,
        averageScore: parseFloat(additionalMetrics.avg_score || 0).toFixed(2),
        topSkill: additionalMetrics.top_skill || null,
        mostActiveHour: additionalMetrics.most_active_hour || null,
      },
      filters: {
        from,
        to,
        skill: skill || null,
        type: type || null,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        timeRange: `${from} to ${to}`,
        dataPoints: submissionRateData.length,
      },
    };

    logger.info(
      `✅ Real-time metrics retrieved successfully for range: ${from} to ${to}`
    );

    res.json(response);
  } catch (error) {
    logger.error('❌ Error fetching real-time metrics:', error);
    res.status(500).json({
      error: 'Failed to fetch real-time metrics',
      message: 'Please try again later',
    });
  }
});

/**
 * GET /api/metrics/realtime/skills
 * Get available skills for filtering
 */
router.get('/realtime/skills', async (req, res) => {
  try {
    const skills = await executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('tasks')
        .select('skill')
        .not('skill', 'is', null)
        .order('skill');

      if (error) throw error;
      return data;
    });

    // Get unique skills and their counts
    const skillCounts = skills.reduce((acc: any, task: any) => {
      const skill = task.skill?.toLowerCase();
      if (skill) {
        acc[skill] = (acc[skill] || 0) + 1;
      }
      return acc;
    }, {});

    const availableSkills = Object.entries(skillCounts)
      .map(([skill, count]) => ({
        value: skill,
        label: skill.charAt(0).toUpperCase() + skill.slice(1),
        count: count as number,
      }))
      .sort((a, b) => (b.count as number) - (a.count as number));

    res.json({
      skills: availableSkills,
      total: availableSkills.length,
    });
  } catch (error) {
    logger.error('❌ Error fetching available skills:', error);
    res.status(500).json({
      error: 'Failed to fetch available skills',
    });
  }
});

/**
 * GET /api/metrics/realtime/types
 * Get available task types for filtering
 */
router.get('/realtime/types', async (req, res) => {
  try {
    const types = await executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('tasks')
        .select('task_type')
        .not('task_type', 'is', null)
        .order('task_type');

      if (error) throw error;
      return data;
    });

    // Get unique types and their counts
    const typeCounts = types.reduce((acc: any, task: any) => {
      const type = task.task_type;
      if (type) {
        acc[type] = (acc[type] || 0) + 1;
      }
      return acc;
    }, {});

    const availableTypes = Object.entries(typeCounts)
      .map(([type, count]) => ({
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        count: count as number,
      }))
      .sort((a, b) => (b.count as number) - (a.count as number));

    res.json({
      types: availableTypes,
      total: availableTypes.length,
    });
  } catch (error) {
    logger.error('❌ Error fetching available types:', error);
    res.status(500).json({
      error: 'Failed to fetch available types',
    });
  }
});

/**
 * GET /api/metrics/realtime/health
 * Health check for real-time metrics
 */
router.get('/realtime/health', async (req, res) => {
  try {
    // Test database connection
    const testQuery = await executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('submissions')
        .select('id')
        .limit(1);

      if (error) throw error;
      return data;
    });

    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  } catch (error) {
    logger.error('❌ Real-time metrics health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: 'Service unavailable',
    });
  }
});

export default router;
