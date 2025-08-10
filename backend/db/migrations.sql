-- CaBE Arena Database Optimization Migrations
-- Run this in Supabase SQL Editor to optimize performance

-- =============================================
-- EXISTING TABLES (if not already created)
-- =============================================

-- Create tasks table if not exists
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  skill_area text,
  created_at timestamptz DEFAULT now()
);

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create submissions table if not exists
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  score integer,
  submitted_at timestamptz DEFAULT now()
);

-- =============================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- =============================================

-- Drop existing basic indexes if they exist
DROP INDEX IF EXISTS idx_tasks_skill_area;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_submissions_user_id;
DROP INDEX IF EXISTS idx_submissions_task_id;
DROP INDEX IF EXISTS idx_submissions_status;

-- Create optimized composite indexes for better query performance

-- 1. Submissions table optimizations
-- Composite index for user submissions with date ordering (most common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_submissions_user_created_at 
ON submissions(user_id, submitted_at DESC);

-- Composite index for status-based queries with date ordering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_submissions_status_created_at 
ON submissions(status, submitted_at DESC);

-- Composite index for task submissions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_submissions_task_created_at 
ON submissions(task_id, submitted_at DESC);

-- Index for score-based queries (for analytics)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_submissions_score 
ON submissions(score) WHERE score IS NOT NULL;

-- Partial index for pending submissions (most queried status)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_submissions_pending 
ON submissions(submitted_at DESC) WHERE status = 'pending';

-- 2. Users table optimizations
-- Index for email lookups (already unique, but explicit)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email 
ON users(email);

-- Index for points-based queries (for leaderboards)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_points 
ON users(points DESC);

-- Composite index for user creation date queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at 
ON users(created_at DESC);

-- 3. Tasks table optimizations
-- Index for skill area filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_skill_area 
ON tasks(skill_area);

-- Composite index for skill area with creation date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_skill_created_at 
ON tasks(skill_area, created_at DESC);

-- Index for title searches (if implementing search)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_title_gin 
ON tasks USING gin(to_tsvector('english', title));

-- =============================================
-- ANALYTICS TABLES (for better performance)
-- =============================================

-- Create analytics summary table for caching
CREATE TABLE IF NOT EXISTS analytics_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  total_submissions integer DEFAULT 0,
  approved_submissions integer DEFAULT 0,
  total_points integer DEFAULT 0,
  last_submission_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for analytics summary
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_summary_user 
ON analytics_summary(user_id);

-- Create task history table for better tracking
CREATE TABLE IF NOT EXISTS task_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  action text NOT NULL, -- 'viewed', 'started', 'completed', 'abandoned'
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes for task history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_task_history_user_created 
ON task_history(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_task_history_task_created 
ON task_history(task_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_task_history_action 
ON task_history(action, created_at DESC);

-- =============================================
-- MATERIALIZED VIEWS (for complex analytics)
-- =============================================

-- Materialized view for user statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS user_stats AS
SELECT 
  u.id,
  u.email,
  u.points,
  COUNT(s.id) as total_submissions,
  COUNT(s.id) FILTER (WHERE s.status = 'approved') as approved_submissions,
  COUNT(s.id) FILTER (WHERE s.status = 'rejected') as rejected_submissions,
  AVG(s.score) FILTER (WHERE s.score IS NOT NULL) as avg_score,
  MAX(s.submitted_at) as last_submission_at,
  u.created_at
FROM users u
LEFT JOIN submissions s ON u.id = s.user_id
GROUP BY u.id, u.email, u.points, u.created_at;

-- Index for materialized view
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_stats_points 
ON user_stats(points DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_stats_submissions 
ON user_stats(total_submissions DESC);

-- Materialized view for task statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS task_stats AS
SELECT 
  t.id,
  t.title,
  t.skill_area,
  COUNT(s.id) as total_submissions,
  COUNT(s.id) FILTER (WHERE s.status = 'approved') as approved_submissions,
  AVG(s.score) FILTER (WHERE s.score IS NOT NULL) as avg_score,
  t.created_at
FROM tasks t
LEFT JOIN submissions s ON t.id = s.task_id
GROUP BY t.id, t.title, t.skill_area, t.created_at;

-- Index for task stats
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_task_stats_skill 
ON task_stats(skill_area);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_task_stats_submissions 
ON task_stats(total_submissions DESC);

-- =============================================
-- FUNCTIONS FOR AUTOMATIC UPDATES
-- =============================================

-- Function to update analytics summary
CREATE OR REPLACE FUNCTION update_analytics_summary()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics_summary (user_id, total_submissions, approved_submissions, total_points, last_submission_at)
  SELECT 
    NEW.user_id,
    COUNT(s.id),
    COUNT(s.id) FILTER (WHERE s.status = 'approved'),
    u.points,
    MAX(s.submitted_at)
  FROM submissions s
  JOIN users u ON s.user_id = u.id
  WHERE s.user_id = NEW.user_id
  GROUP BY u.points
  ON CONFLICT (user_id) DO UPDATE SET
    total_submissions = EXCLUDED.total_submissions,
    approved_submissions = EXCLUDED.approved_submissions,
    total_points = EXCLUDED.total_points,
    last_submission_at = EXCLUDED.last_submission_at,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update analytics summary
DROP TRIGGER IF EXISTS trigger_update_analytics_summary ON submissions;
CREATE TRIGGER trigger_update_analytics_summary
  AFTER INSERT OR UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_summary();

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY task_stats;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SAMPLE DATA (for testing)
-- =============================================

-- Insert sample users if not exists
INSERT INTO users (email, points) VALUES 
  ('test@example.com', 100),
  ('user@example.com', 50),
  ('admin@example.com', 500)
ON CONFLICT (email) DO NOTHING;

-- Insert sample tasks if not exists
INSERT INTO tasks (title, description, skill_area) VALUES 
  ('Build a React Component', 'Create a reusable button component with TypeScript', 'frontend'),
  ('API Integration', 'Connect frontend to backend API endpoints', 'backend'),
  ('Database Design', 'Design schema for user management system', 'database'),
  ('UI/UX Design', 'Create wireframes for mobile app', 'design'),
  ('Machine Learning Model', 'Build a simple classification model', 'ai')
ON CONFLICT DO NOTHING;

-- =============================================
-- PERFORMANCE MONITORING
-- =============================================

-- Create a function to analyze query performance
CREATE OR REPLACE FUNCTION analyze_query_performance()
RETURNS TABLE (
  query_text text,
  execution_time interval,
  rows_returned bigint,
  buffer_hit_ratio numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    query::text,
    mean_exec_time::interval,
    calls,
    (shared_blks_hit::numeric / (shared_blks_hit + shared_blks_read)) * 100
  FROM pg_stat_statements
  WHERE query LIKE '%submissions%' OR query LIKE '%users%' OR query LIKE '%tasks%'
  ORDER BY mean_exec_time DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify all indexes were created
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('submissions', 'users', 'tasks', 'analytics_summary', 'task_history')
ORDER BY tablename, indexname;

-- =============================================
-- PROOFS STORAGE METADATA (uploads)
-- =============================================

-- Table to store user-uploaded proof files metadata
CREATE TABLE IF NOT EXISTS proofs (
  file_id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  upload_url text NOT NULL,
  storage_path text,
  mime_type text NOT NULL,
  file_size integer NOT NULL,
  original_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_proofs_user_created ON proofs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proofs_mime_type ON proofs(mime_type);

-- =============================================
-- AUDIT LOGS IMMUTABILITY (append-only)
-- =============================================

-- Ensure audit_logs table exists
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  action VARCHAR(255),
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Trigger function to prevent UPDATE/DELETE on audit_logs
CREATE OR REPLACE FUNCTION prevent_audit_logs_modify()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only';
END;
$$ LANGUAGE plpgsql;

-- Apply triggers for UPDATE and DELETE
DROP TRIGGER IF EXISTS trg_audit_logs_no_update ON audit_logs;
DROP TRIGGER IF EXISTS trg_audit_logs_no_delete ON audit_logs;
CREATE TRIGGER trg_audit_logs_no_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_logs_modify();
CREATE TRIGGER trg_audit_logs_no_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_logs_modify();