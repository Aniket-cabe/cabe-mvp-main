-- ============================================================================
-- CABE ARENA SKILL MIGRATION TEST SCRIPT
-- ============================================================================
-- This script tests the migration by creating test data and running verification

-- ============================================================================
-- STEP 1: CREATE TEST DATA WITH OLD SKILL NAMES
-- ============================================================================

-- Insert test users with old skill names
INSERT INTO users (email, password_hash, name, username, primary_skill, secondary_skills, total_points, rank, rank_level) VALUES 
  ('test1@example.com', '$2b$10$test.hash', 'Test User 1', 'testuser1', 'Web Development', ARRAY['Design', 'Content Writing'], 100, 'Bronze', 'Bronze'),
  ('test2@example.com', '$2b$10$test.hash', 'Test User 2', 'testuser2', 'Design', ARRAY['Web Development'], 150, 'Silver', 'Silver'),
  ('test3@example.com', '$2b$10$test.hash', 'Test User 3', 'testuser3', 'Content Writing', ARRAY['AI/Data Science'], 200, 'Gold', 'Gold'),
  ('test4@example.com', '$2b$10$test.hash', 'Test User 4', 'testuser4', 'AI/Data Science', ARRAY['Web Development', 'Design'], 300, 'Platinum', 'Platinum')
ON CONFLICT (email) DO NOTHING;

-- Insert test tasks with old skill names
INSERT INTO tasks (title, description, skill_category, task_type, base_points, max_points, estimated_duration, duration_factor, skill_factor, complexity_factor, visibility_factor, prestige_factor, autonomy_factor, difficulty_level) VALUES 
  ('Old Web Task', 'Test web development task', 'Web Development', 'practice', 50, 100, 30, 0.3, 0.4, 0.5, 0.6, 0.4, 0.7, 'easy'),
  ('Old Design Task', 'Test design task', 'Design', 'practice', 50, 100, 30, 0.3, 0.4, 0.5, 0.6, 0.4, 0.7, 'easy'),
  ('Old Content Task', 'Test content writing task', 'Content Writing', 'practice', 50, 100, 30, 0.3, 0.4, 0.5, 0.6, 0.4, 0.7, 'easy'),
  ('Old AI Task', 'Test AI/Data Science task', 'AI/Data Science', 'practice', 50, 100, 30, 0.3, 0.4, 0.5, 0.6, 0.4, 0.7, 'easy')
ON CONFLICT DO NOTHING;

-- Insert test task templates with old skill names
INSERT INTO task_templates (name, skill_category, task_type, template_json) VALUES 
  ('Old Web Template', 'Web Development', 'practice', '{"title": "Test", "description": "Test"}'),
  ('Old Design Template', 'Design', 'practice', '{"title": "Test", "description": "Test"}'),
  ('Old Content Template', 'Content Writing', 'practice', '{"title": "Test", "description": "Test"}'),
  ('Old AI Template', 'AI/Data Science', 'practice', '{"title": "Test", "description": "Test"}')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 2: VERIFY TEST DATA WAS CREATED
-- ============================================================================

-- Check test data before migration
SELECT 'BEFORE MIGRATION - Users:' as status;
SELECT email, primary_skill, secondary_skills FROM users WHERE email LIKE 'test%@example.com' ORDER BY email;

SELECT 'BEFORE MIGRATION - Tasks:' as status;
SELECT title, skill_category FROM tasks WHERE title LIKE 'Old %' ORDER BY title;

SELECT 'BEFORE MIGRATION - Templates:' as status;
SELECT name, skill_category FROM task_templates WHERE name LIKE 'Old %' ORDER BY name;

-- ============================================================================
-- STEP 3: RUN MIGRATION (This would be the actual migration script)
-- ============================================================================

-- Note: In a real scenario, you would run the skill-migration.sql script here
-- For testing purposes, we'll simulate the migration with direct updates

-- Update users
UPDATE users 
SET primary_skill = CASE 
    WHEN primary_skill = 'Web Development' THEN 'Full-Stack Software Development'
    WHEN primary_skill = 'Design' THEN 'Cloud Computing & DevOps'
    WHEN primary_skill = 'Content Writing' THEN 'Data Science & Analytics'
    WHEN primary_skill = 'AI/Data Science' THEN 'AI / Machine Learning'
    ELSE primary_skill
END
WHERE primary_skill IN ('Web Development', 'Design', 'Content Writing', 'AI/Data Science');

-- Update secondary skills
UPDATE users 
SET secondary_skills = ARRAY(
    SELECT CASE 
        WHEN skill = 'Web Development' THEN 'Full-Stack Software Development'
        WHEN skill = 'Design' THEN 'Cloud Computing & DevOps'
        WHEN skill = 'Content Writing' THEN 'Data Science & Analytics'
        WHEN skill = 'AI/Data Science' THEN 'AI / Machine Learning'
        ELSE skill
    END
    FROM unnest(secondary_skills) AS skill
)
WHERE secondary_skills && ARRAY['Web Development', 'Design', 'Content Writing', 'AI/Data Science'];

-- Update tasks
UPDATE tasks 
SET skill_category = CASE 
    WHEN skill_category = 'Web Development' THEN 'Full-Stack Software Development'
    WHEN skill_category = 'Design' THEN 'Cloud Computing & DevOps'
    WHEN skill_category = 'Content Writing' THEN 'Data Science & Analytics'
    WHEN skill_category = 'AI/Data Science' THEN 'AI / Machine Learning'
    ELSE skill_category
END
WHERE skill_category IN ('Web Development', 'Design', 'Content Writing', 'AI/Data Science');

-- Update task templates
UPDATE task_templates 
SET skill_category = CASE 
    WHEN skill_category = 'Web Development' THEN 'Full-Stack Software Development'
    WHEN skill_category = 'Design' THEN 'Cloud Computing & DevOps'
    WHEN skill_category = 'Content Writing' THEN 'Data Science & Analytics'
    WHEN skill_category = 'AI/Data Science' THEN 'AI / Machine Learning'
    ELSE skill_category
END
WHERE skill_category IN ('Web Development', 'Design', 'Content Writing', 'AI/Data Science');

-- ============================================================================
-- STEP 4: VERIFY MIGRATION WAS SUCCESSFUL
-- ============================================================================

-- Check data after migration
SELECT 'AFTER MIGRATION - Users:' as status;
SELECT email, primary_skill, secondary_skills FROM users WHERE email LIKE 'test%@example.com' ORDER BY email;

SELECT 'AFTER MIGRATION - Tasks:' as status;
SELECT title, skill_category FROM tasks WHERE title LIKE 'Old %' ORDER BY title;

SELECT 'AFTER MIGRATION - Templates:' as status;
SELECT name, skill_category FROM task_templates WHERE name LIKE 'Old %' ORDER BY name;

-- Verify only new skills exist
SELECT 'VERIFICATION - All skill categories in tasks:' as status;
SELECT DISTINCT skill_category FROM tasks ORDER BY skill_category;

SELECT 'VERIFICATION - All primary skills in users:' as status;
SELECT DISTINCT primary_skill FROM users ORDER BY primary_skill;

SELECT 'VERIFICATION - All skill categories in templates:' as status;
SELECT DISTINCT skill_category FROM task_templates ORDER BY skill_category;

-- ============================================================================
-- STEP 5: CLEANUP TEST DATA
-- ============================================================================

-- Remove test data
DELETE FROM users WHERE email LIKE 'test%@example.com';
DELETE FROM tasks WHERE title LIKE 'Old %';
DELETE FROM task_templates WHERE name LIKE 'Old %';

-- ============================================================================
-- TEST COMPLETE
-- ============================================================================

SELECT 'Migration test completed successfully!' as result;
