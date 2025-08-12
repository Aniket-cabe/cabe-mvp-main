import { supabaseAdmin } from '../lib/supabase-admin';
import logger from '../utils/logger';

// Referral configuration
const REFERRAL_CONFIG = {
  INVITE_CODE_LENGTH: 8,
  BONUS_POINTS_REFERRER: 200, // Points for referrer when someone signs up
  BONUS_POINTS_REFERRED: 100, // Points for referred user when they complete first task
  BONUS_POINTS_COMPLETION: 100, // Points for referrer when referred user completes task
  MAX_REFERRAL_BONUS_PER_MONTH: 1000, // Maximum bonus points per month for referrer
  UTM_SHARE_BONUS: 10, // Points for sharing with UTM tracking
  MAX_UTM_SHARES_PER_DAY: 5, // Maximum UTM shares per day
} as const;

// Referral interface
export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  invite_code: string;
  status: 'pending' | 'completed' | 'expired';
  referred_at: string;
  completed_at?: string;
  total_bonus_earned: number;
  tasks_completed: number;
  metadata?: Record<string, any>;
}

// UTM Share interface
export interface UTMShare {
  id: string;
  user_id: string;
  platform: string; // 'twitter', 'linkedin', 'facebook', 'email', etc.
  url: string;
  utm_params: Record<string, string>;
  shared_at: string;
  bonus_awarded: number;
  clicks?: number;
  conversions?: number;
}

// Referral stats interface
export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  totalBonusEarned: number;
  monthlyBonusEarned: number;
  pendingReferrals: number;
  conversionRate: number;
  topReferralPlatform: string;
  totalUTMShares: number;
  totalUTMBonusEarned: number;
}

class ReferralService {
  /**
   * Generate a unique invite code
   */
  async generateInviteCode(userId: string): Promise<string> {
    try {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let inviteCode: string;
      let isUnique = false;

      // Generate until we get a unique code
      while (!isUnique) {
        inviteCode = '';
        for (let i = 0; i < REFERRAL_CONFIG.INVITE_CODE_LENGTH; i++) {
          inviteCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Check if code is unique
        const { data: existingCode } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('referral_code', inviteCode)
          .single();

        if (!existingCode) {
          isUnique = true;
        }
      }

      // Update user's referral code
      await supabaseAdmin
        .from('users')
        .update({ referral_code: inviteCode })
        .eq('id', userId);

      logger.info('✅ Generated invite code:', { userId, inviteCode });

      return inviteCode!;
    } catch (error) {
      logger.error('❌ Failed to generate invite code:', error);
      throw error;
    }
  }

  /**
   * Process referral when new user signs up
   */
  async processReferral(
    referrerId: string,
    referredUserId: string,
    inviteCode: string
  ): Promise<{
    success: boolean;
    bonusAwarded: number;
    referralId: string;
  }> {
    try {
      // Check if referrer exists and is valid
      const { data: referrer } = await supabaseAdmin
        .from('users')
        .select('id, total_points')
        .eq('id', referrerId)
        .single();

      if (!referrer) {
        throw new Error('Referrer not found');
      }

      // Check if referral already exists
      const { data: existingReferral } = await supabaseAdmin
        .from('referrals')
        .select('id')
        .eq('referred_id', referredUserId)
        .single();

      if (existingReferral) {
        throw new Error('User already referred');
      }

      // Create referral record
      const { data: referral, error: referralError } = await supabaseAdmin
        .from('referrals')
        .insert({
          referrer_id: referrerId,
          referred_id: referredUserId,
          invite_code: inviteCode,
          status: 'pending',
          referred_at: new Date().toISOString(),
          total_bonus_earned: 0,
          tasks_completed: 0,
        })
        .select()
        .single();

      if (referralError || !referral) {
        throw new Error('Failed to create referral record');
      }

      // Award bonus points to referrer
      const bonusAwarded = await this.awardReferralBonus(
        referrerId,
        REFERRAL_CONFIG.BONUS_POINTS_REFERRER,
        'referral_signup',
        { referredUserId, referralId: referral.id }
      );

      // Update referral record with bonus
      await supabaseAdmin
        .from('referrals')
        .update({
          total_bonus_earned: bonusAwarded,
        })
        .eq('id', referral.id);

      logger.info('✅ Referral processed successfully:', {
        referrerId,
        referredUserId,
        inviteCode,
        bonusAwarded,
        referralId: referral.id,
      });

      return {
        success: true,
        bonusAwarded,
        referralId: referral.id,
      };
    } catch (error) {
      logger.error('❌ Failed to process referral:', error);
      return {
        success: false,
        bonusAwarded: 0,
        referralId: '',
      };
    }
  }

  /**
   * Award bonus points for referral completion
   */
  async awardCompletionBonus(referredUserId: string): Promise<{
    success: boolean;
    bonusAwarded: number;
  }> {
    try {
      // Find referral record
      const { data: referral } = await supabaseAdmin
        .from('referrals')
        .select('*')
        .eq('referred_id', referredUserId)
        .eq('status', 'pending')
        .single();

      if (!referral) {
        return { success: false, bonusAwarded: 0 };
      }

      // Award bonus to referred user for completing first task
      const referredBonus = await this.awardReferralBonus(
        referredUserId,
        REFERRAL_CONFIG.BONUS_POINTS_REFERRED,
        'referral_completion',
        { referrerId: referral.referrer_id, referralId: referral.id }
      );

      // Award bonus to referrer for referred user's completion
      const referrerBonus = await this.awardReferralBonus(
        referral.referrer_id,
        REFERRAL_CONFIG.BONUS_POINTS_COMPLETION,
        'referred_completion',
        { referredUserId, referralId: referral.id }
      );

      // Update referral record
      await supabaseAdmin
        .from('referrals')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          total_bonus_earned: referral.total_bonus_earned + referrerBonus,
          tasks_completed: referral.tasks_completed + 1,
        })
        .eq('id', referral.id);

      logger.info('✅ Completion bonus awarded:', {
        referredUserId,
        referrerId: referral.referrer_id,
        referredBonus,
        referrerBonus,
        referralId: referral.id,
      });

      return {
        success: true,
        bonusAwarded: referredBonus + referrerBonus,
      };
    } catch (error) {
      logger.error('❌ Failed to award completion bonus:', error);
      return { success: false, bonusAwarded: 0 };
    }
  }

  /**
   * Award referral bonus points with monthly limits
   */
  private async awardReferralBonus(
    userId: string,
    points: number,
    reason: string,
    metadata: Record<string, any>
  ): Promise<number> {
    try {
      // Check monthly bonus limit
      const monthlyBonus = await this.getMonthlyBonusEarned(userId);
      const remainingBonus = Math.max(0, REFERRAL_CONFIG.MAX_REFERRAL_BONUS_PER_MONTH - monthlyBonus);
      const actualBonus = Math.min(points, remainingBonus);

      if (actualBonus <= 0) {
        logger.warn('⚠️ Monthly referral bonus limit reached:', { userId, monthlyBonus });
        return 0;
      }

      // Award points
      await supabaseAdmin
        .from('users')
        .update({
          total_points: supabaseAdmin.rpc('increment', { amount: actualBonus }),
        })
        .eq('id', userId);

      // Log points history
      await supabaseAdmin
        .from('points_history')
        .insert({
          user_id: userId,
          points_change: actualBonus,
          reason,
          metadata,
        });

      logger.info('✅ Referral bonus awarded:', {
        userId,
        points: actualBonus,
        reason,
        monthlyBonus: monthlyBonus + actualBonus,
      });

      return actualBonus;
    } catch (error) {
      logger.error('❌ Failed to award referral bonus:', error);
      return 0;
    }
  }

  /**
   * Get monthly bonus earned by user
   */
  private async getMonthlyBonusEarned(userId: string): Promise<number> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: bonusHistory } = await supabaseAdmin
        .from('points_history')
        .select('points_change')
        .eq('user_id', userId)
        .in('reason', ['referral_signup', 'referred_completion', 'utm_share'])
        .gte('created_at', startOfMonth.toISOString());

      if (!bonusHistory) return 0;

      return bonusHistory.reduce((total, record) => total + record.points_change, 0);
    } catch (error) {
      logger.error('❌ Failed to get monthly bonus earned:', error);
      return 0;
    }
  }

  /**
   * Record UTM-tracked share
   */
  async recordUTMShare(
    userId: string,
    platform: string,
    url: string,
    utmParams: Record<string, string>
  ): Promise<{
    success: boolean;
    bonusAwarded: number;
    shareId: string;
  }> {
    try {
      // Check daily UTM share limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayShares } = await supabaseAdmin
        .from('utm_shares')
        .select('id')
        .eq('user_id', userId)
        .gte('shared_at', today.toISOString());

      if (todayShares && todayShares.length >= REFERRAL_CONFIG.MAX_UTM_SHARES_PER_DAY) {
        logger.warn('⚠️ Daily UTM share limit reached:', { userId, shares: todayShares.length });
        return { success: false, bonusAwarded: 0, shareId: '' };
      }

      // Award UTM share bonus
      const bonusAwarded = await this.awardReferralBonus(
        userId,
        REFERRAL_CONFIG.UTM_SHARE_BONUS,
        'utm_share',
        { platform, url, utmParams }
      );

      // Record UTM share
      const { data: share, error: shareError } = await supabaseAdmin
        .from('utm_shares')
        .insert({
          user_id: userId,
          platform,
          url,
          utm_params: utmParams,
          shared_at: new Date().toISOString(),
          bonus_awarded: bonusAwarded,
        })
        .select()
        .single();

      if (shareError || !share) {
        throw new Error('Failed to record UTM share');
      }

      logger.info('✅ UTM share recorded:', {
        userId,
        platform,
        url,
        bonusAwarded,
        shareId: share.id,
      });

      return {
        success: true,
        bonusAwarded,
        shareId: share.id,
      };
    } catch (error) {
      logger.error('❌ Failed to record UTM share:', error);
      return { success: false, bonusAwarded: 0, shareId: '' };
    }
  }

  /**
   * Get user's referral statistics
   */
  async getUserReferralStats(userId: string): Promise<ReferralStats> {
    try {
      // Get referral counts
      const { data: referrals } = await supabaseAdmin
        .from('referrals')
        .select('status, total_bonus_earned, tasks_completed')
        .eq('referrer_id', userId);

      // Get UTM shares
      const { data: utmShares } = await supabaseAdmin
        .from('utm_shares')
        .select('platform, bonus_awarded')
        .eq('user_id', userId);

      // Calculate stats
      const totalReferrals = referrals?.length || 0;
      const completedReferrals = referrals?.filter(r => r.status === 'completed').length || 0;
      const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0;
      const totalBonusEarned = referrals?.reduce((sum, r) => sum + r.total_bonus_earned, 0) || 0;
      const monthlyBonusEarned = await this.getMonthlyBonusEarned(userId);
      const conversionRate = totalReferrals > 0 ? (completedReferrals / totalReferrals) * 100 : 0;

      // Calculate top referral platform
      const platformCounts: Record<string, number> = {};
      utmShares?.forEach(share => {
        platformCounts[share.platform] = (platformCounts[share.platform] || 0) + 1;
      });
      const topReferralPlatform = Object.entries(platformCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

      const totalUTMShares = utmShares?.length || 0;
      const totalUTMBonusEarned = utmShares?.reduce((sum, s) => sum + s.bonus_awarded, 0) || 0;

      return {
        totalReferrals,
        completedReferrals,
        totalBonusEarned,
        monthlyBonusEarned,
        pendingReferrals,
        conversionRate,
        topReferralPlatform,
        totalUTMShares,
        totalUTMBonusEarned,
      };
    } catch (error) {
      logger.error('❌ Failed to get user referral stats:', error);
      return {
        totalReferrals: 0,
        completedReferrals: 0,
        totalBonusEarned: 0,
        monthlyBonusEarned: 0,
        pendingReferrals: 0,
        conversionRate: 0,
        topReferralPlatform: 'none',
        totalUTMShares: 0,
        totalUTMBonusEarned: 0,
      };
    }
  }

  /**
   * Get user's referral list
   */
  async getUserReferrals(userId: string): Promise<Referral[]> {
    try {
      const { data: referrals, error } = await supabaseAdmin
        .from('referrals')
        .select(`
          *,
          referred_user:users!referrals_referred_id_fkey(
            id,
            email,
            name,
            username,
            created_at
          )
        `)
        .eq('referrer_id', userId)
        .order('referred_at', { ascending: false });

      if (error) {
        logger.error('❌ Failed to get user referrals:', error);
        return [];
      }

      return referrals || [];
    } catch (error) {
      logger.error('❌ Failed to get user referrals:', error);
      return [];
    }
  }

  /**
   * Get user's UTM shares
   */
  async getUserUTMShares(userId: string): Promise<UTMShare[]> {
    try {
      const { data: shares, error } = await supabaseAdmin
        .from('utm_shares')
        .select('*')
        .eq('user_id', userId)
        .order('shared_at', { ascending: false });

      if (error) {
        logger.error('❌ Failed to get user UTM shares:', error);
        return [];
      }

      return shares || [];
    } catch (error) {
      logger.error('❌ Failed to get user UTM shares:', error);
      return [];
    }
  }

  /**
   * Generate referral link with UTM parameters
   */
  generateReferralLink(inviteCode: string, platform?: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const utmParams = new URLSearchParams({
      utm_source: 'referral',
      utm_medium: platform || 'direct',
      utm_campaign: 'invite',
      ref: inviteCode,
    });

    return `${baseUrl}/register?${utmParams.toString()}`;
  }

  /**
   * Validate invite code
   */
  async validateInviteCode(inviteCode: string): Promise<{
    valid: boolean;
    referrerId?: string;
    referrerName?: string;
  }> {
    try {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id, name, username')
        .eq('referral_code', inviteCode)
        .single();

      if (!user) {
        return { valid: false };
      }

      return {
        valid: true,
        referrerId: user.id,
        referrerName: user.name || user.username,
      };
    } catch (error) {
      logger.error('❌ Failed to validate invite code:', error);
      return { valid: false };
    }
  }

  /**
   * Get global referral statistics
   */
  async getGlobalReferralStats(): Promise<{
    totalReferrals: number;
    totalCompletedReferrals: number;
    totalBonusAwarded: number;
    averageConversionRate: number;
    topReferrers: Array<{ userId: string; referrals: number; bonus: number }>;
  }> {
    try {
      // Get all referrals
      const { data: referrals } = await supabaseAdmin
        .from('referrals')
        .select('referrer_id, status, total_bonus_earned');

      if (!referrals) {
        return {
          totalReferrals: 0,
          totalCompletedReferrals: 0,
          totalBonusAwarded: 0,
          averageConversionRate: 0,
          topReferrers: [],
        };
      }

      // Calculate stats
      const totalReferrals = referrals.length;
      const totalCompletedReferrals = referrals.filter(r => r.status === 'completed').length;
      const totalBonusAwarded = referrals.reduce((sum, r) => sum + r.total_bonus_earned, 0);
      const averageConversionRate = totalReferrals > 0 ? (totalCompletedReferrals / totalReferrals) * 100 : 0;

      // Calculate top referrers
      const referrerStats: Record<string, { referrals: number; bonus: number }> = {};
      referrals.forEach(referral => {
        if (!referrerStats[referral.referrer_id]) {
          referrerStats[referral.referrer_id] = { referrals: 0, bonus: 0 };
        }
        referrerStats[referral.referrer_id].referrals++;
        referrerStats[referral.referrer_id].bonus += referral.total_bonus_earned;
      });

      const topReferrers = Object.entries(referrerStats)
        .map(([userId, stats]) => ({ userId, ...stats }))
        .sort((a, b) => b.referrals - a.referrals)
        .slice(0, 10);

      return {
        totalReferrals,
        totalCompletedReferrals,
        totalBonusAwarded,
        averageConversionRate,
        topReferrers,
      };
    } catch (error) {
      logger.error('❌ Failed to get global referral stats:', error);
      return {
        totalReferrals: 0,
        totalCompletedReferrals: 0,
        totalBonusAwarded: 0,
        averageConversionRate: 0,
        topReferrers: [],
      };
    }
  }

  /**
   * Track UTM share click
   */
  async trackUTMShareClick(shareId: string): Promise<void> {
    try {
      await supabaseAdmin
        .from('utm_shares')
        .update({
          clicks: supabaseAdmin.rpc('increment', { amount: 1 }),
        })
        .eq('id', shareId);

      logger.info('✅ UTM share click tracked:', { shareId });
    } catch (error) {
      logger.error('❌ Failed to track UTM share click:', error);
    }
  }

  /**
   * Track UTM share conversion
   */
  async trackUTMShareConversion(shareId: string): Promise<void> {
    try {
      await supabaseAdmin
        .from('utm_shares')
        .update({
          conversions: supabaseAdmin.rpc('increment', { amount: 1 }),
        })
        .eq('id', shareId);

      logger.info('✅ UTM share conversion tracked:', { shareId });
    } catch (error) {
      logger.error('❌ Failed to track UTM share conversion:', error);
    }
  }
}

// Export singleton instance
export const referralService = new ReferralService();
