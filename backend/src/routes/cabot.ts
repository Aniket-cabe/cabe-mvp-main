import express from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase-admin';
import { authenticateToken, requireEmailVerification } from '../middleware/auth';
import logger from '../utils/logger';

const router = express.Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const cabotQuerySchema = z.object({
  query: z.string().min(1, 'Query is required').max(500, 'Query too long'),
  action_type: z.enum(['guidance', 'recommendation', 'help', 'progress']).optional(),
});

const creditRefillSchema = z.object({
  refill_type: z.enum(['weekly', 'bonus', 'purchase']),
  reason: z.string().optional(),
});

// ============================================================================
// CaBOT SYSTEM CONSTANTS
// ============================================================================

const CABOT_CONFIG = {
  INITIAL_CREDITS: 25,
  WEEKLY_REFILL: 5,
  CREDIT_COSTS: {
    guidance: 1,
    recommendation: 2,
    help: 1,
    progress: 1,
  },
  MAX_CREDITS: 100,
  REFILL_INTERVAL_HOURS: 168, // 7 days
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if user is eligible for weekly credit refill
 */
async function checkWeeklyRefillEligibility(userId: string): Promise<{
  eligible: boolean;
  nextRefill: Date;
  hoursUntilRefill: number;
}> {
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('cabot_credits, last_credit_refill')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    throw new Error('User not found');
  }

  const lastRefill = new Date(user.last_credit_refill || 0);
  const now = new Date();
  const hoursSinceLastRefill = (now.getTime() - lastRefill.getTime()) / (1000 * 60 * 60);
  
  const eligible = hoursSinceLastRefill >= CABOT_CONFIG.REFILL_INTERVAL_HOURS;
  const nextRefill = new Date(lastRefill.getTime() + (CABOT_CONFIG.REFILL_INTERVAL_HOURS * 60 * 60 * 1000));
  const hoursUntilRefill = Math.max(0, CABOT_CONFIG.REFILL_INTERVAL_HOURS - hoursSinceLastRefill);

  return { eligible, nextRefill, hoursUntilRefill };
}

/**
 * Process weekly credit refill
 */
async function processWeeklyRefill(userId: string): Promise<{
  creditsAdded: number;
  newTotal: number;
  nextRefill: Date;
}> {
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('cabot_credits, last_credit_refill')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    throw new Error('User not found');
  }

  const currentCredits = user.cabot_credits || 0;
  const creditsToAdd = Math.min(
    CABOT_CONFIG.WEEKLY_REFILL,
    CABOT_CONFIG.MAX_CREDITS - currentCredits
  );
  const newTotal = currentCredits + creditsToAdd;
  const nextRefill = new Date(Date.now() + (CABOT_CONFIG.REFILL_INTERVAL_HOURS * 60 * 60 * 1000));

  // Update user credits
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({
      cabot_credits: newTotal,
      last_credit_refill: new Date().toISOString(),
    })
    .eq('id', userId);

  if (updateError) {
    throw new Error('Failed to update user credits');
  }

  // Log credit refill
  if (creditsToAdd > 0) {
    await supabaseAdmin
      .from('cabot_credit_refills')
      .insert({
        user_id: userId,
        credits_added: creditsToAdd,
        refill_type: 'weekly',
        reason: 'Weekly credit refill',
      });
  }

  return { creditsAdded: creditsToAdd, newTotal, nextRefill };
}

/**
 * Use CaBOT credits
 */
async function useCabotCredits(userId: string, actionType: string, queryText: string): Promise<{
  success: boolean;
  creditsUsed: number;
  remainingCredits: number;
  response: string;
}> {
  const creditsCost = CABOT_CONFIG.CREDIT_COSTS[actionType as keyof typeof CABOT_CONFIG.CREDIT_COSTS] || 1;

  // Get user's current credits
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('cabot_credits')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    throw new Error('User not found');
  }

  const currentCredits = user.cabot_credits || 0;

  if (currentCredits < creditsCost) {
    return {
      success: false,
      creditsUsed: 0,
      remainingCredits: currentCredits,
      response: 'Insufficient credits. Please wait for your weekly refill or contact support.',
    };
  }

  // Deduct credits
  const newCredits = currentCredits - creditsCost;
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ cabot_credits: newCredits })
    .eq('id', userId);

  if (updateError) {
    throw new Error('Failed to update user credits');
  }

  // Log usage
  await supabaseAdmin
    .from('cabot_usage')
    .insert({
      user_id: userId,
      action_type: actionType,
      credits_used: creditsCost,
      query_text: queryText,
      response_length: 0, // Will be updated after generating response
    });

  // Generate AI response (placeholder for now)
  const response = generateCabotResponse(actionType, queryText);

  // Update response length
  await supabaseAdmin
    .from('cabot_usage')
    .update({ response_length: response.length })
    .eq('user_id', userId)
    .eq('action_type', actionType)
    .eq('query_text', queryText)
    .order('created_at', { ascending: false })
    .limit(1);

  return {
    success: true,
    creditsUsed: creditsCost,
    remainingCredits: newCredits,
    response,
  };
}

/**
 * Generate CaBOT response (placeholder implementation)
 */
function generateCabotResponse(actionType: string, query: string): string {
  // This is a placeholder implementation
  // In production, this would integrate with an AI service like OpenAI
  
  const responses = {
    guidance: [
      "Based on your query, I recommend focusing on building a strong foundation in your primary skill area first.",
      "Consider starting with practice tasks to build confidence before tackling mini-projects.",
      "Your current rank suggests you're ready for more challenging tasks. Try exploring the next difficulty level.",
    ],
    recommendation: [
      "I found a perfect task for you: 'Build a React Component' - it matches your skill level and interests.",
      "Based on your recent activity, you might enjoy the 'API Integration Project' task.",
      "Consider trying a task in a different skill area to broaden your expertise.",
    ],
    help: [
      "To submit a task, click on the task card, upload your proof, and confirm it's your own work.",
      "You can track your progress in the dashboard and see your rank progression.",
      "Points are calculated using our Service Points Formula v5, which considers task difficulty and proof quality.",
    ],
    progress: [
      "You're making great progress! You've completed 5 tasks this month and earned 250 points.",
      "You're 75% of the way to your next rank. Keep up the excellent work!",
      "Your recent submissions show improvement in code quality and documentation.",
    ],
  };

  const responseArray = responses[actionType as keyof typeof responses] || responses.help;
  const randomIndex = Math.floor(Math.random() * responseArray.length);
  
  return responseArray[randomIndex];
}

// ============================================================================
// CaBOT ROUTES
// ============================================================================

// GET /api/cabot/status - Get CaBOT status and credit information
router.get('/status', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    logger.info('🤖 Fetching CaBOT status', { userId: req.user!.id });

    // Get user's CaBOT information
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('cabot_credits, last_credit_refill')
      .eq('id', req.user!.id)
      .single();

    if (userError || !user) {
      logger.error('❌ User not found for CaBOT status', { userId: req.user!.id });
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Check weekly refill eligibility
    const refillInfo = await checkWeeklyRefillEligibility(req.user!.id);

    // Get recent usage
    const { data: recentUsage } = await supabaseAdmin
      .from('cabot_usage')
      .select('action_type, credits_used, created_at')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })
      .limit(5);

    logger.info('✅ CaBOT status fetched successfully', {
      userId: req.user!.id,
      credits: user.cabot_credits,
      refillEligible: refillInfo.eligible,
    });

    res.json({
      success: true,
      data: {
        credits: user.cabot_credits || 0,
        maxCredits: CABOT_CONFIG.MAX_CREDITS,
        creditCosts: CABOT_CONFIG.CREDIT_COSTS,
        weeklyRefill: {
          eligible: refillInfo.eligible,
          nextRefill: refillInfo.nextRefill,
          hoursUntilRefill: refillInfo.hoursUntilRefill,
          amount: CABOT_CONFIG.WEEKLY_REFILL,
        },
        recentUsage: recentUsage || [],
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('❌ CaBOT status error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/cabot/query - Ask CaBOT a question
router.post('/query', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    // Validate request body
    const validatedData = cabotQuerySchema.parse(req.body);
    const { query, action_type = 'guidance' } = validatedData;

    logger.info('🤖 CaBOT query received', {
      userId: req.user!.id,
      actionType: action_type,
      queryLength: query.length,
    });

    // Check if user needs weekly refill
    const refillInfo = await checkWeeklyRefillEligibility(req.user!.id);
    if (refillInfo.eligible) {
      await processWeeklyRefill(req.user!.id);
      logger.info('✅ Weekly credit refill processed', { userId: req.user!.id });
    }

    // Use CaBOT credits and get response
    const result = await useCabotCredits(req.user!.id, action_type, query);

    if (!result.success) {
      return res.status(402).json({
        success: false,
        error: 'Insufficient credits',
        data: {
          remainingCredits: result.remainingCredits,
          creditsNeeded: CABOT_CONFIG.CREDIT_COSTS[action_type as keyof typeof CABOT_CONFIG.CREDIT_COSTS] || 1,
        },
        timestamp: new Date().toISOString(),
      });
    }

    logger.info('✅ CaBOT query processed successfully', {
      userId: req.user!.id,
      creditsUsed: result.creditsUsed,
      remainingCredits: result.remainingCredits,
    });

    res.json({
      success: true,
      data: {
        response: result.response,
        creditsUsed: result.creditsUsed,
        remainingCredits: result.remainingCredits,
        actionType,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ CaBOT query validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid query data',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ CaBOT query error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/cabot/refill - Manually trigger credit refill (for testing)
router.post('/refill', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    const validatedData = creditRefillSchema.parse(req.body);
    const { refill_type, reason } = validatedData;

    logger.info('🔄 Manual credit refill requested', {
      userId: req.user!.id,
      refillType: refill_type,
      reason,
    });

    // Get current user data
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('cabot_credits')
      .eq('id', req.user!.id)
      .single();

    if (userError || !user) {
      logger.error('❌ User not found for credit refill', { userId: req.user!.id });
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString(),
      });
    }

    let creditsToAdd = 0;
    let newTotal = user.cabot_credits || 0;

    if (refill_type === 'weekly') {
      // Check if eligible for weekly refill
      const refillInfo = await checkWeeklyRefillEligibility(req.user!.id);
      if (!refillInfo.eligible) {
        return res.status(400).json({
          success: false,
          error: 'Not eligible for weekly refill yet',
          data: {
            hoursUntilRefill: refillInfo.hoursUntilRefill,
            nextRefill: refillInfo.nextRefill,
          },
          timestamp: new Date().toISOString(),
        });
      }

      const refillResult = await processWeeklyRefill(req.user!.id);
      creditsToAdd = refillResult.creditsAdded;
      newTotal = refillResult.newTotal;
    } else {
      // Bonus or purchase refill
      creditsToAdd = refill_type === 'bonus' ? 10 : 25;
      newTotal = Math.min(CABOT_CONFIG.MAX_CREDITS, (user.cabot_credits || 0) + creditsToAdd);

      // Update user credits
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ cabot_credits: newTotal })
        .eq('id', req.user!.id);

      if (updateError) {
        throw new Error('Failed to update user credits');
      }

      // Log credit refill
      await supabaseAdmin
        .from('cabot_credit_refills')
        .insert({
          user_id: req.user!.id,
          credits_added: creditsToAdd,
          refill_type,
          reason: reason || `${refill_type} credit refill`,
        });
    }

    logger.info('✅ Credit refill processed successfully', {
      userId: req.user!.id,
      refillType: refill_type,
      creditsAdded: creditsToAdd,
      newTotal,
    });

    res.json({
      success: true,
      message: 'Credits refilled successfully',
      data: {
        creditsAdded: creditsToAdd,
        newTotal,
        refillType,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('❌ Credit refill validation error:', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid refill data',
        details: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    logger.error('❌ Credit refill error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/cabot/usage - Get CaBOT usage history
router.get('/usage', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    logger.info('📊 Fetching CaBOT usage history', {
      userId: req.user!.id,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    // Get usage history
    const { data: usage, error: usageError } = await supabaseAdmin
      .from('cabot_usage')
      .select('action_type, credits_used, query_text, response_length, created_at')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (usageError) {
      logger.error('❌ Failed to fetch usage history:', { error: usageError.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch usage history',
        timestamp: new Date().toISOString(),
      });
    }

    // Get total count
    const { count: totalCount } = await supabaseAdmin
      .from('cabot_usage')
      .select('id', { count: 'exact' })
      .eq('user_id', req.user!.id);

    // Calculate usage statistics
    const totalCreditsUsed = usage?.reduce((sum, entry) => sum + entry.credits_used, 0) || 0;
    const actionTypeCounts = usage?.reduce((acc, entry) => {
      acc[entry.action_type] = (acc[entry.action_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    logger.info('✅ CaBOT usage history fetched successfully', {
      userId: req.user!.id,
      usageCount: usage?.length || 0,
      totalCount,
    });

    res.json({
      success: true,
      data: {
        usage: usage || [],
        statistics: {
          totalCreditsUsed,
          actionTypeCounts,
          totalQueries: totalCount || 0,
        },
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
    logger.error('❌ CaBOT usage history error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/cabot/refills - Get credit refill history
router.get('/refills', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    logger.info('📊 Fetching credit refill history', {
      userId: req.user!.id,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    // Get refill history
    const { data: refills, error: refillsError } = await supabaseAdmin
      .from('cabot_credit_refills')
      .select('credits_added, refill_type, reason, created_at')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (refillsError) {
      logger.error('❌ Failed to fetch refill history:', { error: refillsError.message });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch refill history',
        timestamp: new Date().toISOString(),
      });
    }

    // Get total count
    const { count: totalCount } = await supabaseAdmin
      .from('cabot_credit_refills')
      .select('id', { count: 'exact' })
      .eq('user_id', req.user!.id);

    // Calculate refill statistics
    const totalCreditsRefilled = refills?.reduce((sum, refill) => sum + refill.credits_added, 0) || 0;
    const refillTypeCounts = refills?.reduce((acc, refill) => {
      acc[refill.refill_type] = (acc[refill.refill_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    logger.info('✅ Credit refill history fetched successfully', {
      userId: req.user!.id,
      refillCount: refills?.length || 0,
      totalCount,
    });

    res.json({
      success: true,
      data: {
        refills: refills || [],
        statistics: {
          totalCreditsRefilled,
          refillTypeCounts,
          totalRefills: totalCount || 0,
        },
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
    logger.error('❌ Credit refill history error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
