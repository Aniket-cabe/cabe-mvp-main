-- Create tables for Cabe Arena application
-- Run this in Supabase SQL Editor

-- 1. Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  skill_area text,
  created_at timestamptz DEFAULT now()
);

-- 2. Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 3. Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  score integer,
  submitted_at timestamptz DEFAULT now()
);

-- Add some indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_skill_area ON tasks(skill_area);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_task_id ON submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Insert sample data for testing
INSERT INTO users (email, points) VALUES 
  ('test@example.com', 100),
  ('user@example.com', 50)
ON CONFLICT (email) DO NOTHING;

INSERT INTO tasks (title, description, skill_area) VALUES 
  ('Build a React Component', 'Create a reusable button component with TypeScript', 'frontend'),
  ('API Integration', 'Connect frontend to backend API endpoints', 'backend'),
  ('Database Design', 'Design schema for user management system', 'database')
ON CONFLICT DO NOTHING;

-- Verify tables were created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('tasks', 'users', 'submissions')
ORDER BY table_name, ordinal_position; 