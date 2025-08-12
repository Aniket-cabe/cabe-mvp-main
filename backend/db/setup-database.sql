-- ============================================================================
-- CABE ARENA DATABASE SETUP SCRIPT
-- ============================================================================
-- This script sets up the complete database schema for CaBE Arena
-- Run this in Supabase SQL Editor for production setup

-- ============================================================================
-- STEP 1: CREATE ENUM TYPES
-- ============================================================================

-- Create enum for skill categories
DO $$ BEGIN
    CREATE TYPE skill_category_enum AS ENUM (
        'Full-Stack Software Development',
        'Cloud Computing & DevOps', 
        'Data Science & Analytics',
        'AI / Machine Learning'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for task types
DO $$ BEGIN
    CREATE TYPE task_type_enum AS ENUM (
        'practice',
        'mini_project'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for user ranks
DO $$ BEGIN
    CREATE TYPE user_rank_enum AS ENUM (
        'Bronze',
        'Silver', 
        'Gold',
        'Platinum'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for submission status
DO $$ BEGIN
    CREATE TYPE submission_status_enum AS ENUM (
        'pending',
        'approved',
        'rejected',
        'under_review'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- STEP 2: CREATE TABLES
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE,
    avatar_url TEXT,
    primary_skill skill_category_enum NOT NULL,
    secondary_skills skill_category_enum[] DEFAULT '{}',
    total_points INTEGER DEFAULT 0,
    rank user_rank_enum DEFAULT 'Bronze',
    cabot_credits INTEGER DEFAULT 25,
    referral_code VARCHAR(20) UNIQUE,
    referred_by UUID REFERENCES users(id),
    is_verified BOOLEAN DEFAULT false,
    is_suspended BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    skill_category skill_category_enum NOT NULL,
    task_type task_type_enum NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL,
    estimated_duration INTEGER NOT NULL, -- in minutes
    base_points INTEGER NOT NULL,
    max_points INTEGER NOT NULL,
    completion_count INTEGER DEFAULT 0,
    max_completions INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task templates table
CREATE TABLE IF NOT EXISTS task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_template TEXT NOT NULL,
    description_template TEXT NOT NULL,
    skill_category skill_category_enum NOT NULL,
    task_type task_type_enum NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL,
    estimated_duration INTEGER NOT NULL,
    base_points INTEGER NOT NULL,
    max_points INTEGER NOT NULL,
    placeholders JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    proof_url TEXT,
    proof_text TEXT,
    status submission_status_enum DEFAULT 'pending',
    points_awarded INTEGER,
    reviewer_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Points history table
CREATE TABLE IF NOT EXISTS points_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points_change INTEGER NOT NULL,
    reason VARCHAR(100) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_category skill_category_enum NOT NULL,
    total_points INTEGER NOT NULL DEFAULT 0,
    rank_position INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, skill_category)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    skill_category skill_category_enum,
    points_required INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_primary_skill ON users(primary_skill);
CREATE INDEX IF NOT EXISTS idx_users_rank ON users(rank);
CREATE INDEX IF NOT EXISTS idx_users_total_points ON users(total_points DESC);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_skill_category ON tasks(skill_category);
CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_tasks_is_active ON tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_tasks_expires_at ON tasks(expires_at);

-- Submissions indexes
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_task_id ON submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);

-- Points history indexes
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_created_at ON points_history(created_at DESC);

-- Leaderboard indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_skill_category ON leaderboard(skill_category);
CREATE INDEX IF NOT EXISTS idx_leaderboard_total_points ON leaderboard(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank_position ON leaderboard(rank_position);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- STEP 4: CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_templates_updated_at BEFORE UPDATE ON task_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leaderboard_updated_at BEFORE UPDATE ON leaderboard FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 5: INSERT SEED DATA
-- ============================================================================

-- Insert default achievements
INSERT INTO achievements (name, description, icon, skill_category, points_required) VALUES
('First Steps', 'Complete your first task', '🎯', NULL, 0),
('Skill Builder', 'Complete 10 tasks in any skill', '🏗️', NULL, 500),
('Expert Level', 'Reach 1000 points in a skill', '⭐', NULL, 1000),
('Master Craftsman', 'Reach 5000 points in a skill', '👑', NULL, 5000),
('Full-Stack Pioneer', 'Complete 50 Full-Stack tasks', '💻', 'Full-Stack Software Development', 2500),
('Cloud Architect', 'Complete 50 Cloud Computing tasks', '☁️', 'Cloud Computing & DevOps', 2500),
('Data Scientist', 'Complete 50 Data Science tasks', '📊', 'Data Science & Analytics', 2500),
('AI Innovator', 'Complete 50 AI/ML tasks', '🤖', 'AI / Machine Learning', 2500)
ON CONFLICT DO NOTHING;

-- Insert sample task templates
INSERT INTO task_templates (title_template, description_template, skill_category, task_type, difficulty_level, estimated_duration, base_points, max_points, placeholders) VALUES
('Build a {component_type} component with {features}', 'Create a reusable {component_type} component that includes {features}. Use modern React patterns and ensure it''s fully responsive and accessible.', 'Full-Stack Software Development', 'practice', 'medium', 30, 50, 100, '{"component_type": ["Button", "Modal", "Card", "Form"], "features": ["responsive design", "accessibility", "animations"]}'),
('Deploy a {infrastructure_type} on {cloud_platform}', 'Set up and configure a {infrastructure_type} on {cloud_platform}. Document the process and include monitoring setup.', 'Cloud Computing & DevOps', 'mini_project', 'hard', 120, 200, 400, '{"infrastructure_type": ["container orchestration", "serverless deployment", "CI/CD pipeline"], "cloud_platform": ["AWS", "Azure", "Google Cloud"]}'),
('Analyze {dataset_type} using {analysis_technique}', 'Perform {analysis_technique} on a {dataset_type} dataset. Create visualizations and present key insights.', 'Data Science & Analytics', 'practice', 'medium', 45, 75, 150, '{"dataset_type": ["sales data", "user behavior", "financial data"], "analysis_technique": ["exploratory data analysis", "statistical analysis", "predictive modeling"]}'),
('Implement {ml_algorithm} for {use_case}', 'Build a machine learning model using {ml_algorithm} to solve {use_case}. Include data preprocessing and model evaluation.', 'AI / Machine Learning', 'mini_project', 'hard', 90, 150, 300, '{"ml_algorithm": ["neural network", "random forest", "gradient boosting"], "use_case": ["image classification", "text sentiment analysis", "recommendation system"]}')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 6: CREATE ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public can view basic user info" ON users FOR SELECT USING (true);

-- Tasks policies
CREATE POLICY "Anyone can view active tasks" ON tasks FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage all tasks" ON tasks FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Submissions policies
CREATE POLICY "Users can view their own submissions" ON submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create submissions" ON submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all submissions" ON submissions FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Points history policies
CREATE POLICY "Users can view their own points history" ON points_history FOR SELECT USING (auth.uid() = user_id);

-- Leaderboard policies
CREATE POLICY "Anyone can view leaderboard" ON leaderboard FOR SELECT USING (true);

-- User achievements policies
CREATE POLICY "Users can view their own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);

-- Audit logs policies
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- STEP 7: VERIFICATION QUERIES
-- ============================================================================

-- Verify tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'tasks', 'submissions', 'points_history', 'leaderboard', 'achievements', 'user_achievements', 'audit_logs');

-- Verify indexes were created
SELECT indexname, tablename FROM pg_indexes WHERE tablename IN ('users', 'tasks', 'submissions', 'points_history', 'leaderboard');

-- Verify seed data was inserted
SELECT COUNT(*) as achievement_count FROM achievements;
SELECT COUNT(*) as template_count FROM task_templates;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ CaBE Arena database setup completed successfully!';
    RAISE NOTICE '📊 Tables created: users, tasks, submissions, points_history, leaderboard, achievements, user_achievements, audit_logs';
    RAISE NOTICE '🔍 Indexes created for optimal performance';
    RAISE NOTICE '🔒 Row Level Security enabled';
    RAISE NOTICE '🌱 Seed data inserted';
    RAISE NOTICE '🚀 Database is ready for production use!';
END $$;
