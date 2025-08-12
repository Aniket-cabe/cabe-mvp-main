-- CaBE Arena MVP - Complete Database Schema
-- Run this in Supabase SQL Editor

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- 1. Users table with complete profile and rank system
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  username VARCHAR(100) UNIQUE,
  avatar_url TEXT,
  primary_skill VARCHAR(100) NOT NULL,
  secondary_skills VARCHAR(100)[] DEFAULT '{}',
  total_points INTEGER DEFAULT 0,
  rank VARCHAR(50) DEFAULT 'Bronze',
  rank_level VARCHAR(50) DEFAULT 'Bronze',
  cabot_credits INTEGER DEFAULT 25,
  last_credit_refill TIMESTAMPTZ DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  referral_code VARCHAR(20) UNIQUE,
  referred_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  email_verified_at TIMESTAMPTZ,
  profile_completed_at TIMESTAMPTZ
);

-- 2. Tasks table with Service Points Formula v5 factors
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  skill_category VARCHAR(100) NOT NULL,
  task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('practice', 'mini_project')),
  base_points INTEGER NOT NULL,
  max_points INTEGER NOT NULL,
  estimated_duration INTEGER, -- in minutes
  -- Service Points Formula v5 factors (0.0 to 1.0)
  duration_factor DECIMAL(3,2) NOT NULL CHECK (duration_factor >= 0.0 AND duration_factor <= 1.0),
  skill_factor DECIMAL(3,2) NOT NULL CHECK (skill_factor >= 0.0 AND skill_factor <= 1.0),
  complexity_factor DECIMAL(3,2) NOT NULL CHECK (complexity_factor >= 0.0 AND complexity_factor <= 1.0),
  visibility_factor DECIMAL(3,2) NOT NULL CHECK (visibility_factor >= 0.0 AND visibility_factor <= 1.0),
  prestige_factor DECIMAL(3,2) NOT NULL CHECK (prestige_factor >= 0.0 AND prestige_factor <= 1.0),
  autonomy_factor DECIMAL(3,2) NOT NULL CHECK (autonomy_factor >= 0.0 AND autonomy_factor <= 1.0),
  -- Task management
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  completion_count INTEGER DEFAULT 0,
  max_completions INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  template_id VARCHAR(100), -- For task forge system
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'expert'))
);

-- 3. Submissions table with proof system
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  proof_type VARCHAR(50) NOT NULL CHECK (proof_type IN ('image', 'file', 'link', 'text')),
  proof_url TEXT,
  proof_text TEXT,
  proof_strength INTEGER DEFAULT 0 CHECK (proof_strength IN (0, 10, 25, 50)),
  points_awarded INTEGER,
  score INTEGER, -- AI scoring result (0-100)
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'scored')),
  feedback TEXT,
  points_breakdown JSONB, -- Service Points Formula v5 breakdown
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer_id UUID REFERENCES users(id),
  auto_scored BOOLEAN DEFAULT FALSE,
  flagged_for_review BOOLEAN DEFAULT FALSE,
  appeal_submitted BOOLEAN DEFAULT FALSE,
  appeal_reason TEXT
);

-- 4. Points history table for audit trail
CREATE TABLE IF NOT EXISTS points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  points_change INTEGER NOT NULL,
  reason VARCHAR(255) NOT NULL,
  previous_total INTEGER NOT NULL,
  new_total INTEGER NOT NULL,
  admin_id UUID REFERENCES users(id), -- For manual adjustments
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- GAMIFICATION TABLES
-- ============================================================================

-- 5. Achievements and badges
CREATE TABLE IF NOT EXISTS achievements (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('milestone', 'streak', 'cross_skill', 'special', 'rank')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('task_completion', 'points_earned', 'skill_mastery', 'consistency', 'social', 'rank_progression')),
  icon VARCHAR(10) NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 0,
  criteria JSONB NOT NULL,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  is_completed BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  UNIQUE(user_id, achievement_id)
);

-- 7. Leaderboard
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  rank_position INTEGER,
  skill_category VARCHAR(100),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_category)
);

-- 8. Referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
  invite_code VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  referred_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  total_bonus_earned INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  metadata JSONB,
  UNIQUE(referred_id)
);

-- 8.1. UTM shares table
CREATE TABLE IF NOT EXISTS utm_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  utm_params JSONB NOT NULL,
  shared_at TIMESTAMPTZ DEFAULT NOW(),
  bonus_awarded INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0
);

-- ============================================================================
-- CaBOT SYSTEM TABLES
-- ============================================================================

-- 9. CaBOT usage tracking
CREATE TABLE IF NOT EXISTS cabot_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL,
  credits_used INTEGER NOT NULL,
  query_text TEXT,
  response_length INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CaBOT credit refills
CREATE TABLE IF NOT EXISTS cabot_credit_refills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  credits_added INTEGER NOT NULL,
  refill_type VARCHAR(50) NOT NULL CHECK (refill_type IN ('weekly', 'bonus', 'purchase')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TASK FORGE SYSTEM TABLES
-- ============================================================================

-- 11. Task templates
CREATE TABLE IF NOT EXISTS task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  skill_category VARCHAR(100) NOT NULL,
  task_type VARCHAR(50) NOT NULL,
  template_json JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- 12. Generated tasks
CREATE TABLE IF NOT EXISTS generated_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES task_templates(id),
  task_id UUID REFERENCES tasks(id),
  generation_params JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ADMIN & MODERATION TABLES
-- ============================================================================

-- 13. Admin actions audit log
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id),
  action_type VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. User suspensions
CREATE TABLE IF NOT EXISTS user_suspensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES users(id),
  reason TEXT NOT NULL,
  suspension_type VARCHAR(50) NOT NULL CHECK (suspension_type IN ('warning', 'temporary', 'permanent')),
  duration_hours INTEGER, -- NULL for permanent
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Point decay history
CREATE TABLE IF NOT EXISTS point_decay_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_category VARCHAR(100) NOT NULL,
  previous_points INTEGER NOT NULL,
  decay_amount INTEGER NOT NULL,
  new_points INTEGER NOT NULL,
  decay_reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. System settings (for scheduled tasks)
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_rank ON users(rank);
CREATE INDEX IF NOT EXISTS idx_users_points ON users(total_points);
CREATE INDEX IF NOT EXISTS idx_users_primary_skill ON users(primary_skill);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(last_activity);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_skill_category ON tasks(skill_category);
CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_tasks_is_active ON tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_tasks_expires_at ON tasks(expires_at);
CREATE INDEX IF NOT EXISTS idx_tasks_difficulty ON tasks(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_tasks_template_id ON tasks(template_id);

-- Submissions indexes
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_task_id ON submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_submissions_proof_strength ON submissions(proof_strength);
CREATE INDEX IF NOT EXISTS idx_submissions_flagged ON submissions(flagged_for_review);

-- Points history indexes
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_created_at ON points_history(created_at);
CREATE INDEX IF NOT EXISTS idx_points_history_reason ON points_history(reason);

-- Leaderboard indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_points ON leaderboard(points DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_skill_category ON leaderboard(skill_category);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank_position ON leaderboard(rank_position);

-- CaBOT indexes
CREATE INDEX IF NOT EXISTS idx_cabot_usage_user_id ON cabot_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_cabot_usage_created_at ON cabot_usage(created_at);

-- Admin audit indexes
CREATE INDEX IF NOT EXISTS idx_admin_audit_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at ON admin_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_action_type ON admin_audit_log(action_type);

-- Point decay indexes
CREATE INDEX IF NOT EXISTS idx_point_decay_user_id ON point_decay_history(user_id);
CREATE INDEX IF NOT EXISTS idx_point_decay_created_at ON point_decay_history(created_at);
CREATE INDEX IF NOT EXISTS idx_point_decay_skill_category ON point_decay_history(skill_category);

-- System settings indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- Achievement indexes
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(type);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_hidden ON achievements(is_hidden);

-- User achievement indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON user_achievements(is_completed);

-- Referral indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_invite_code ON referrals(invite_code);

-- UTM share indexes
CREATE INDEX IF NOT EXISTS idx_utm_shares_user_id ON utm_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_utm_shares_platform ON utm_shares(platform);
CREATE INDEX IF NOT EXISTS idx_utm_shares_shared_at ON utm_shares(shared_at);

-- ============================================================================
-- SAMPLE DATA INSERTION
-- ============================================================================

-- Insert sample users
INSERT INTO users (email, password_hash, name, username, primary_skill, total_points, rank, rank_level, referral_code) VALUES 
  ('test@example.com', '$2b$10$example.hash', 'Test User', 'testuser', 'Web Development', 100, 'Bronze', 'Bronze', 'TEST001'),
  ('user@example.com', '$2b$10$example.hash', 'Sample User', 'sampleuser', 'Design', 50, 'Bronze', 'Bronze', 'SAMPLE001')
ON CONFLICT (email) DO NOTHING;

-- Insert sample tasks with Service Points Formula v5 factors
INSERT INTO tasks (
  title, 
  description, 
  skill_category, 
  task_type, 
  base_points, 
  max_points, 
  estimated_duration,
  duration_factor,
  skill_factor,
  complexity_factor,
  visibility_factor,
  prestige_factor,
  autonomy_factor,
  difficulty_level
) VALUES 
  (
    'Build a React Component',
    'Create a reusable button component with TypeScript and proper styling',
    'Web Development',
    'practice',
    50,
    100,
    30,
    0.3,
    0.4,
    0.5,
    0.6,
    0.4,
    0.7,
    'easy'
  ),
  (
    'API Integration Project',
    'Connect frontend to backend API endpoints with error handling',
    'Web Development',
    'mini_project',
    200,
    400,
    120,
    0.7,
    0.6,
    0.8,
    0.5,
    0.7,
    0.8,
    'medium'
  ),
  (
    'Database Design Challenge',
    'Design schema for user management system with relationships',
    'AI/Data Science',
    'practice',
    50,
    100,
    45,
    0.4,
    0.5,
    0.6,
    0.3,
    0.5,
    0.6,
    'medium'
  )
ON CONFLICT DO NOTHING;

-- Insert sample achievements
INSERT INTO achievements (name, description, badge_icon, category, points_required, tasks_required) VALUES 
  ('First Steps', 'Complete your first task', 'first-task.svg', 'milestone', 0, 1),
  ('Skill Builder', 'Complete 5 tasks in the same skill area', 'skill-builder.svg', 'skill', 0, 5),
  ('Point Collector', 'Earn 1000 points', 'point-collector.svg', 'points', 1000, 0),
  ('Streak Master', 'Complete tasks for 7 consecutive days', 'streak-master.svg', 'streak', 0, 0)
ON CONFLICT DO NOTHING;

-- Insert sample task templates
INSERT INTO task_templates (name, skill_category, task_type, template_json) VALUES 
  (
    'React Component Template',
    'Web Development',
    'practice',
    '{
      "title": "Build a [component_type] Component",
      "description": "Create a reusable [component_type] component with [features]",
      "placeholders": ["component_type", "features"],
      "duration_factor": 0.3,
      "skill_factor": 0.4,
      "complexity_factor": 0.5,
      "visibility_factor": 0.6,
      "prestige_factor": 0.4,
      "autonomy_factor": 0.7
    }'
  ),
  (
    'API Integration Template',
    'Web Development',
    'mini_project',
    '{
      "title": "[platform] API Integration",
      "description": "Integrate with [platform] API to [functionality]",
      "placeholders": ["platform", "functionality"],
      "duration_factor": 0.7,
      "skill_factor": 0.6,
      "complexity_factor": 0.8,
      "visibility_factor": 0.5,
      "prestige_factor": 0.7,
      "autonomy_factor": 0.8
    }'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Verify tables were created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN (
    'users', 'tasks', 'submissions', 'points_history', 
    'achievements', 'user_achievements', 'leaderboard', 'referrals',
    'cabot_usage', 'cabot_credit_refills', 'task_templates', 
    'generated_tasks', 'admin_audit_log', 'user_suspensions'
    'point_decay_history', 'system_settings'
  )
ORDER BY table_name, ordinal_position; 