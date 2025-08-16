import { supabaseAdmin } from '../lib/supabase-admin';
import logger from '../utils/logger';

// Achievement types
export enum AchievementType {
  MILESTONE = 'milestone',
  STREAK = 'streak',
  CROSS_SKILL = 'cross_skill',
  SPECIAL = 'special',
  RANK = 'rank',
}

// Achievement categories
export enum AchievementCategory {
  TASK_COMPLETION = 'task_completion',
  POINTS_EARNED = 'points_earned',
  SKILL_MASTERY = 'skill_mastery',
  CONSISTENCY = 'consistency',
  SOCIAL = 'social',
  RANK_PROGRESSION = 'rank_progression',
}

// Achievement interface
export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: AchievementType;
  category: AchievementCategory;
  icon: string;
  points_reward: number;
  criteria: AchievementCriteria;
  is_hidden: boolean;
  created_at: string;
}

// Achievement criteria interface
export interface AchievementCriteria {
  type: string;
  value: number;
  timeframe?: string; // e.g., '7d', '30d', 'all_time'
  skill_areas?: string[];
  conditions?: Record<string, any>;
}

// User achievement interface
export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  progress: number;
  is_completed: boolean;
  metadata?: Record<string, any>;
}

// Achievement progress interface
export interface AchievementProgress {
  achievement: Achievement;
  progress: number;
  is_completed: boolean;
  earned_at?: string;
  next_milestone?: number;
}

// Achievement definitions
const ACHIEVEMENTS: Achievement[] = [
  // ============================================================================
  // MILESTONE ACHIEVEMENTS
  // ============================================================================
  {
    id: 'first_task',
    name: 'First Steps',
    description: 'Complete your first task',
    type: AchievementType.MILESTONE,
    category: AchievementCategory.TASK_COMPLETION,
    icon: '🎯',
    points_reward: 50,
    criteria: { type: 'tasks_completed', value: 1 },
    is_hidden: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'task_master_10',
    name: 'Task Master',
    description: 'Complete 10 tasks',
    type: AchievementType.MILESTONE,
    category: AchievementCategory.TASK_COMPLETION,
    icon: '🏆',
    points_reward: 100,
    criteria: { type: 'tasks_completed', value: 10 },
    is_hidden: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'task_master_50',
    name: 'Task Champion',
    description: 'Complete 50 tasks',
    type: AchievementType.MILESTONE,
    category: AchievementCategory.TASK_COMPLETION,
    icon: '👑',
    points_reward: 250,
    criteria: { type: 'tasks_completed', value: 50 },
    is_hidden: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'task_master_100',
    name: 'Task Legend',
    description: 'Complete 100 tasks',
    type: AchievementType.MILESTONE,
    category: AchievementCategory.TASK_COMPLETION,
    icon: '🌟',
    points_reward: 500,
    criteria: { type: 'tasks_completed', value: 100 },
    is_hidden: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'points_1000',
    name: 'Point Collector',
    description: 'Earn 1,000 points',
    type: AchievementType.MILESTONE,
    category: AchievementCategory.POINTS_EARNED,
    icon: '💰',
    points_reward: 100,
    criteria: { type: 'total_points', value: 1000 },
    is_hidden: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'points_5000',
    name: 'Point Accumulator',
    description: 'Earn 5,000 points',
    type: AchievementType.MILESTONE,
    category: AchievementCategory.POINTS_EARNED,
    icon: '💎',
    points_reward: 250,
    criteria: { type: 'total_points', value: 5000 },
    is_hidden: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'points_10000',
    name: 'Point Millionaire',
    description: 'Earn 10,000 points',
    type: AchievementType.MILESTONE,
    category: AchievementCategory.POINTS_EARNED,
    icon: '💎💎',
    points_reward: 500,
    criteria: { type: 'total_points', value: 10000 },
    is_hidden: false,
    created_at: new Date().toISOString(),
  },

  // ============================================================================
  // STREAK ACHIEVEMENTS
  // ============================================================================
  {
    id: 'streak_3',
    name: 'Getting Started',
    description: 'Complete tasks 3 days in a row',
    type: AchievementType.STREAK,
    category: AchievementCategory.CONSISTENCY,
    icon: '🔥',
    points_reward: 75,
    criteria: { type: 'consecutive_days', value: 3, timeframe: '7d' },
    is_hidden: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Complete tasks 7 days in a row',
    type: AchievementType.STREAK,
    category: AchievementCategory.CONSISTENCY,
    icon: '🔥🔥',
    points_reward: 150,
    criteria: { type: 'consecutive_days', value: 7, timeframe: '14d' },
    is_hidden: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'streak_14',
    name: 'Fortnight Fighter',
    description: 'Complete tasks 14 days in a row',
    type: AchievementType.STREAK,
    category: AchievementCategory.CONSISTENCY,
    icon: '🔥🔥🔥',
    points_reward: 300,
    criteria: { type: 'consecutive_days', value: 14, timeframe: '21d' },
    is_hidden: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Complete tasks 30 days in a row',
    type: AchievementType.STREAK,
    category: AchievementCategory.CONSISTENCY,
    icon: '🔥🔥🔥🔥',
    points_reward: 600,
    criteria: { type: 'consecutive_days', value: 30, timeframe: '35d' },
    is_hidden: false,
    created_at: new Date().toISOString(),
  },

  // ============================================================================
  // CROSS-SKILL ACHIEVEMENTS
  // ============================================================================
  {
    id: 'cross_skill_2',
    name: 'Versatile Learner',
    description: 'Complete tasks in 2 different skill areas',
    type: AchievementType.CROSS_SKILL,
    category: AchievementCategory.SKILL_MASTERY,
    icon: '🎨💻',
    points_reward: 100,
    criteria: { type: 'unique_skill_areas', value: 2 },
    is_hidden: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cross_skill_3',
    name: 'Multi-Skill Master',
    description: 'Complete tasks in 3 different skill areas',
    type: AchievementType.CROSS_SKILL,
    category: AchievementCategory.SKILL_MASTERY,
    icon: '🎨💻✍️',
    points_reward: 200,
    criteria: { type: 'unique_skill_areas', value: 3 },
    is_hidden: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cross_skill_4',
    name: 'Renaissance Person',
    description: 'Complete tasks in all 4 skill areas',
    type: AchievementType.CROSS_SKILL,
    category: AchievementCategory.SKILL_MASTERY,
    icon: '🎨💻✍️🤖',
    points_reward: 400,
    criteria: { type: 'unique_skill_areas', value: 4 },
    is_hidden: false,
    created_at: new Date().toISOString(),
  },

  // ============================================================================
  // RANK ACHIEVEMENTS
  // ============================================================================
  {
    id: 'rank_silver',
    name: 'Silver Surfer',
    description: 'Reach Silver rank',
    type: AchievementType.RANK,
    category: AchievementCategory.RANK_PROGRESSION,
    icon: '🥈',
    points_reward: 200,
    criteria: { type: 'rank_reached', value: 1000, conditions: { rank: 'Silver' } },
    is_hidden: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'rank_gold',
    name: 'Golden Touch',
    description: 'Reach Gold rank',
    type: AchievementType.RANK,
    category: AchievementCategory.RANK_PROGRESSION,
    icon: '🥇',
    points_reward: 400,
    criteria: { type: 'rank_reached', value: 5000, conditions: { rank: 'Gold' } },
    is_hidden: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'rank_platinum',
    name: 'Platinum Elite',
    description: 'Reach Platinum rank',
    type: AchievementType.RANK,
    category: AchievementCategory.RANK_PROGRESSION,
    icon: '💎',
    points_reward: 800,
    criteria: { type: 'rank_reached', value: 10000, conditions: { rank: 'Platinum' } },
    is_hidden: false,
    created_at: new Date().toISOString(),
  },

  // ============================================================================
  // SPECIAL ACHIEVEMENTS
  // ============================================================================
  {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Get a perfect score (100/100) on any task',
    type: AchievementType.SPECIAL,
    category: AchievementCategory.TASK_COMPLETION,
    icon: '💯',
    points_reward: 150,
    criteria: { type: 'perfect_score', value: 1 },
    is_hidden: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete 5 tasks in a single day',
    type: AchievementType.SPECIAL,
    category: AchievementCategory.TASK_COMPLETION,
    icon: '⚡',
    points_reward: 200,
    criteria: { type: 'tasks_in_day', value: 5, timeframe: '1d' },
    is_hidden: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a task before 8 AM',
    type: AchievementType.SPECIAL,
    category: AchievementCategory.CONSISTENCY,
    icon: '🌅',
    points_reward: 75,
    criteria: { type: 'early_task', value: 1 },
    is_hidden: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a task after 10 PM',
    type: AchievementType.SPECIAL,
    category: AchievementCategory.CONSISTENCY,
    icon: '🦉',
    points_reward: 75,
    criteria: { type: 'late_task', value: 1 },
    is_hidden: false,
    created_at: new Date().toISOString(),
  },
];

class AchievementService {
  /**
   * Initialize achievements in database
   */
  async initializeAchievements(): Promise<void> {
    try {
      logger.info('🎯 Initializing achievements...');

      for (const achievement of ACHIEVEMENTS) {
        const { error } = await supabaseAdmin
          .from('achievements')
          .upsert(achievement, { onConflict: 'id' });

        if (error) {
          logger.error('❌ Failed to initialize achievement:', { id: achievement.id, error });
        }
      }

      logger.info('✅ Achievements initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize achievements:', error);
    }
  }

  /**
   * Check and award achievements for a user
   */
  async checkUserAchievements(userId: string): Promise<{
    newAchievements: Achievement[];
    totalPointsAwarded: number;
  }> {
    try {
      const newAchievements: Achievement[] = [];
      let totalPointsAwarded = 0;

      // Get user's current stats
      const userStats = await this.getUserStats(userId);
      const existingAchievements = await this.getUserAchievements(userId);

      // Check each achievement
      for (const achievement of ACHIEVEMENTS) {
        // Skip if already earned
        if (existingAchievements.some(ua => ua.achievement_id === achievement.id)) {
          continue;
        }

        // Check if achievement criteria is met
        const isEarned = await this.checkAchievementCriteria(achievement, userStats);
        
        if (isEarned) {
          // Award achievement
          await this.awardAchievement(userId, achievement.id);
          newAchievements.push(achievement);
          totalPointsAwarded += achievement.points_reward;

          logger.info('🏆 Achievement awarded:', {
            userId,
            achievementId: achievement.id,
            achievementName: achievement.name,
            pointsReward: achievement.points_reward,
          });
        }
      }

      return { newAchievements, totalPointsAwarded };
    } catch (error) {
      logger.error('❌ Failed to check user achievements:', error);
      return { newAchievements: [], totalPointsAwarded: 0 };
    }
  }

  /**
   * Check if achievement criteria is met
   */
  private async checkAchievementCriteria(
    achievement: Achievement,
    userStats: any
  ): Promise<boolean> {
    const { criteria } = achievement;

    switch (criteria.type) {
      case 'tasks_completed':
        return userStats.totalTasksCompleted >= criteria.value;

      case 'total_points':
        return userStats.totalPoints >= criteria.value;

      case 'consecutive_days':
        return userStats.maxConsecutiveDays >= criteria.value;

      case 'unique_skill_areas':
        return userStats.uniqueSkillAreas >= criteria.value;

      case 'rank_reached':
        return userStats.currentRank === criteria.conditions?.rank;

      case 'perfect_score':
        return userStats.perfectScores >= criteria.value;

      case 'tasks_in_day':
        return userStats.maxTasksInDay >= criteria.value;

      case 'early_task':
        return userStats.earlyTasks >= criteria.value;

      case 'late_task':
        return userStats.lateTasks >= criteria.value;

      default:
        return false;
    }
  }

  /**
   * Award achievement to user
   */
  private async awardAchievement(userId: string, achievementId: string): Promise<void> {
    try {
      // Add user achievement record
      await supabaseAdmin
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          earned_at: new Date().toISOString(),
          progress: 100,
          is_completed: true,
        });

      // Get achievement details
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
      if (!achievement) return;

      // Award points to user
      await supabaseAdmin
        .from('users')
        .update({
          total_points: supabaseAdmin.rpc('increment', {
            amount: achievement.points_reward,
          }),
        })
        .eq('id', userId);

      // Log points history
      await supabaseAdmin
        .from('points_history')
        .insert({
          user_id: userId,
          points_change: achievement.points_reward,
          reason: 'achievement_reward',
          metadata: { achievement_id: achievementId, achievement_name: achievement.name },
        });

    } catch (error) {
      logger.error('❌ Failed to award achievement:', error);
    }
  }

  /**
   * Get user statistics for achievement checking
   */
  private async getUserStats(userId: string): Promise<any> {
    try {
      // Get user's basic info
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('total_points, rank')
        .eq('id', userId)
        .single();

      // Get task completion stats
      const { data: submissions } = await supabaseAdmin
        .from('submissions')
        .select('submitted_at, score, tasks!inner(skill_area)')
        .eq('user_id', userId)
        .eq('status', 'scored');

      if (!submissions) {
        return {
          totalPoints: user?.total_points || 0,
          currentRank: user?.rank || 'Bronze',
          totalTasksCompleted: 0,
          uniqueSkillAreas: 0,
          maxConsecutiveDays: 0,
          perfectScores: 0,
          maxTasksInDay: 0,
          earlyTasks: 0,
          lateTasks: 0,
        };
      }

      // Calculate various stats
      const uniqueSkillAreas = new Set(submissions.map((s: any) => s.tasks.skill_area)).size;
      const perfectScores = submissions.filter(s => s.score === 100).length;

      // Calculate consecutive days
      const submissionDates = submissions
        .map(s => new Date(s.submitted_at).toDateString())
        .sort()
        .filter((date, index, arr) => arr.indexOf(date) === index);

      const maxConsecutiveDays = this.calculateConsecutiveDays(submissionDates);

      // Calculate max tasks in a day
      const tasksPerDay = this.countTasksPerDay(submissions);
      const maxTasksInDay = Math.max(...Object.values(tasksPerDay));

      // Calculate early/late tasks
      const earlyTasks = submissions.filter(s => {
        const hour = new Date(s.submitted_at).getHours();
        return hour < 8;
      }).length;

      const lateTasks = submissions.filter(s => {
        const hour = new Date(s.submitted_at).getHours();
        return hour >= 22;
      }).length;

      return {
        totalPoints: user?.total_points || 0,
        currentRank: user?.rank || 'Bronze',
        totalTasksCompleted: submissions.length,
        uniqueSkillAreas,
        maxConsecutiveDays,
        perfectScores,
        maxTasksInDay,
        earlyTasks,
        lateTasks,
      };
    } catch (error) {
      logger.error('❌ Failed to get user stats:', error);
      return {
        totalPoints: 0,
        currentRank: 'Bronze',
        totalTasksCompleted: 0,
        uniqueSkillAreas: 0,
        maxConsecutiveDays: 0,
        perfectScores: 0,
        maxTasksInDay: 0,
        earlyTasks: 0,
        lateTasks: 0,
      };
    }
  }

  /**
   * Calculate consecutive days from date array
   */
  private calculateConsecutiveDays(dates: string[]): number {
    if (dates.length === 0) return 0;

    let maxConsecutive = 1;
    let currentConsecutive = 1;

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 1;
      }
    }

    return maxConsecutive;
  }

  /**
   * Count tasks per day
   */
  private countTasksPerDay(submissions: any[]): Record<string, number> {
    const tasksPerDay: Record<string, number> = {};

    submissions.forEach(submission => {
      const date = new Date(submission.submitted_at).toDateString();
      tasksPerDay[date] = (tasksPerDay[date] || 0) + 1;
    });

    return tasksPerDay;
  }

  /**
   * Get user's achievements
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        logger.error('❌ Failed to get user achievements:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('❌ Failed to get user achievements:', error);
      return [];
    }
  }

  /**
   * Get achievement progress for a user
   */
  async getAchievementProgress(userId: string): Promise<AchievementProgress[]> {
    try {
      const userStats = await this.getUserStats(userId);
      const userAchievements = await this.getUserAchievements(userId);
      const progress: AchievementProgress[] = [];

      for (const achievement of ACHIEVEMENTS) {
        const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
        const isCompleted = !!userAchievement;
        const progressValue = isCompleted ? 100 : await this.calculateProgress(achievement, userStats);

        progress.push({
          achievement,
          progress: progressValue,
          is_completed: isCompleted,
          earned_at: userAchievement?.earned_at,
          next_milestone: this.getNextMilestone(achievement, userStats),
        });
      }

      return progress;
    } catch (error) {
      logger.error('❌ Failed to get achievement progress:', error);
      return [];
    }
  }

  /**
   * Calculate progress percentage for an achievement
   */
  private async calculateProgress(achievement: Achievement, userStats: any): Promise<number> {
    const { criteria } = achievement;

    switch (criteria.type) {
      case 'tasks_completed':
        return Math.min(100, (userStats.totalTasksCompleted / criteria.value) * 100);

      case 'total_points':
        return Math.min(100, (userStats.totalPoints / criteria.value) * 100);

      case 'consecutive_days':
        return Math.min(100, (userStats.maxConsecutiveDays / criteria.value) * 100);

      case 'unique_skill_areas':
        return Math.min(100, (userStats.uniqueSkillAreas / criteria.value) * 100);

      case 'perfect_score':
        return Math.min(100, (userStats.perfectScores / criteria.value) * 100);

      case 'tasks_in_day':
        return Math.min(100, (userStats.maxTasksInDay / criteria.value) * 100);

      default:
        return 0;
    }
  }

  /**
   * Get next milestone for an achievement
   */
  private getNextMilestone(achievement: Achievement, userStats: any): number | undefined {
    const { criteria } = achievement;

    switch (criteria.type) {
      case 'tasks_completed':
        return userStats.totalTasksCompleted < criteria.value ? criteria.value : undefined;

      case 'total_points':
        return userStats.totalPoints < criteria.value ? criteria.value : undefined;

      case 'consecutive_days':
        return userStats.maxConsecutiveDays < criteria.value ? criteria.value : undefined;

      case 'unique_skill_areas':
        return userStats.uniqueSkillAreas < criteria.value ? criteria.value : undefined;

      default:
        return undefined;
    }
  }

  /**
   * Get all achievements
   */
  async getAllAchievements(): Promise<Achievement[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('❌ Failed to get achievements:', error);
        return ACHIEVEMENTS;
      }

      return data || ACHIEVEMENTS;
    } catch (error) {
      logger.error('❌ Failed to get achievements:', error);
      return ACHIEVEMENTS;
    }
  }

  /**
   * Get achievement statistics
   */
  async getAchievementStats(): Promise<{
    totalAchievements: number;
    totalUsersWithAchievements: number;
    mostEarnedAchievement: string | null;
    averageAchievementsPerUser: number;
  }> {
    try {
      // Get total achievements
      const { count: totalAchievements } = await supabaseAdmin
        .from('achievements')
        .select('*', { count: 'exact', head: true });

      // Get users with achievements
      const { count: totalUsersWithAchievements } = await supabaseAdmin
        .from('user_achievements')
        .select('user_id', { count: 'exact', head: true });

      // Get most earned achievement
      const { data: achievementCounts } = await supabaseAdmin
        .from('user_achievements')
        .select('achievement_id')
        .then(result => {
          if (!result.data) return { data: [] };
          
          const counts: Record<string, number> = {};
          result.data.forEach(ua => {
            counts[ua.achievement_id] = (counts[ua.achievement_id] || 0) + 1;
          });
          
          const mostEarned = Object.entries(counts)
            .sort(([,a], [,b]) => b - a)[0];
          
          return { data: mostEarned ? [mostEarned[0]] : [] };
        });

      // Calculate average
      const totalUsers = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true });

      const averageAchievementsPerUser = totalUsers.count && totalUsersWithAchievements
        ? totalUsersWithAchievements / totalUsers.count
        : 0;

      return {
        totalAchievements: totalAchievements || 0,
        totalUsersWithAchievements: totalUsersWithAchievements || 0,
        mostEarnedAchievement: achievementCounts[0] || null,
        averageAchievementsPerUser,
      };
    } catch (error) {
      logger.error('❌ Failed to get achievement stats:', error);
      return {
        totalAchievements: 0,
        totalUsersWithAchievements: 0,
        mostEarnedAchievement: null,
        averageAchievementsPerUser: 0,
      };
    }
  }
}

// Export singleton instance
export const achievementService = new AchievementService();
