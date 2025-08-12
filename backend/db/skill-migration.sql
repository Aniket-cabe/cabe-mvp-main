-- ============================================================================
-- CABE ARENA SKILL MIGRATION SCRIPT
-- ============================================================================
-- This script migrates the database from old skill names to new skill names
-- Run this in Supabase SQL Editor

-- ============================================================================
-- STEP 1: CREATE ENUM TYPES FOR NEW SKILLS
-- ============================================================================

-- Create enum for new skill categories
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

-- ============================================================================
-- STEP 2: UPDATE EXISTING DATA - REMAP OLD SKILLS TO NEW SKILLS
-- ============================================================================

-- Update users table - primary_skill
UPDATE users 
SET primary_skill = CASE 
    WHEN primary_skill = 'Web Development' THEN 'Full-Stack Software Development'
    WHEN primary_skill = 'Design' THEN 'Cloud Computing & DevOps'
    WHEN primary_skill = 'Content Writing' THEN 'Data Science & Analytics'
    WHEN primary_skill = 'AI/Data Science' THEN 'AI / Machine Learning'
    ELSE primary_skill
END
WHERE primary_skill IN ('Web Development', 'Design', 'Content Writing', 'AI/Data Science');

-- Update users table - secondary_skills array
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

-- Update tasks table - skill_category
UPDATE tasks 
SET skill_category = CASE 
    WHEN skill_category = 'Web Development' THEN 'Full-Stack Software Development'
    WHEN skill_category = 'Design' THEN 'Cloud Computing & DevOps'
    WHEN skill_category = 'Content Writing' THEN 'Data Science & Analytics'
    WHEN skill_category = 'AI/Data Science' THEN 'AI / Machine Learning'
    ELSE skill_category
END
WHERE skill_category IN ('Web Development', 'Design', 'Content Writing', 'AI/Data Science');

-- Update leaderboard table - skill_category
UPDATE leaderboard 
SET skill_category = CASE 
    WHEN skill_category = 'Web Development' THEN 'Full-Stack Software Development'
    WHEN skill_category = 'Design' THEN 'Cloud Computing & DevOps'
    WHEN skill_category = 'Content Writing' THEN 'Data Science & Analytics'
    WHEN skill_category = 'AI/Data Science' THEN 'AI / Machine Learning'
    ELSE skill_category
END
WHERE skill_category IN ('Web Development', 'Design', 'Content Writing', 'AI/Data Science');

-- Update point_decay_history table - skill_category
UPDATE point_decay_history 
SET skill_category = CASE 
    WHEN skill_category = 'Web Development' THEN 'Full-Stack Software Development'
    WHEN skill_category = 'Design' THEN 'Cloud Computing & DevOps'
    WHEN skill_category = 'Content Writing' THEN 'Data Science & Analytics'
    WHEN skill_category = 'AI/Data Science' THEN 'AI / Machine Learning'
    ELSE skill_category
END
WHERE skill_category IN ('Web Development', 'Design', 'Content Writing', 'AI/Data Science');

-- Update task_templates table - skill_category
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
-- STEP 3: ADD CHECK CONSTRAINTS FOR NEW SKILLS
-- ============================================================================

-- Drop existing check constraints if they exist
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_primary_skill_check;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_skill_category_check;
ALTER TABLE leaderboard DROP CONSTRAINT IF EXISTS leaderboard_skill_category_check;
ALTER TABLE point_decay_history DROP CONSTRAINT IF EXISTS point_decay_history_skill_category_check;
ALTER TABLE task_templates DROP CONSTRAINT IF EXISTS task_templates_skill_category_check;

-- Add new check constraints for skill categories
ALTER TABLE users 
ADD CONSTRAINT users_primary_skill_check 
CHECK (primary_skill IN (
    'Full-Stack Software Development',
    'Cloud Computing & DevOps',
    'Data Science & Analytics',
    'AI / Machine Learning'
));

ALTER TABLE tasks 
ADD CONSTRAINT tasks_skill_category_check 
CHECK (skill_category IN (
    'Full-Stack Software Development',
    'Cloud Computing & DevOps',
    'Data Science & Analytics',
    'AI / Machine Learning'
));

ALTER TABLE leaderboard 
ADD CONSTRAINT leaderboard_skill_category_check 
CHECK (skill_category IN (
    'Full-Stack Software Development',
    'Cloud Computing & DevOps',
    'Data Science & Analytics',
    'AI / Machine Learning'
));

ALTER TABLE point_decay_history 
ADD CONSTRAINT point_decay_history_skill_category_check 
CHECK (skill_category IN (
    'Full-Stack Software Development',
    'Cloud Computing & DevOps',
    'Data Science & Analytics',
    'AI / Machine Learning'
));

ALTER TABLE task_templates 
ADD CONSTRAINT task_templates_skill_category_check 
CHECK (skill_category IN (
    'Full-Stack Software Development',
    'Cloud Computing & DevOps',
    'Data Science & Analytics',
    'AI / Machine Learning'
));

-- ============================================================================
-- STEP 4: UPDATE SEED DATA WITH NEW SKILLS
-- ============================================================================

-- Update sample users with new skill names
UPDATE users 
SET primary_skill = 'Full-Stack Software Development'
WHERE email = 'test@example.com' AND primary_skill = 'Web Development';

UPDATE users 
SET primary_skill = 'Cloud Computing & DevOps'
WHERE email = 'user@example.com' AND primary_skill = 'Design';

-- Update sample tasks with new skill names
UPDATE tasks 
SET skill_category = 'Full-Stack Software Development'
WHERE title = 'Build a React Component' AND skill_category = 'Web Development';

UPDATE tasks 
SET skill_category = 'Full-Stack Software Development'
WHERE title = 'API Integration Project' AND skill_category = 'Web Development';

UPDATE tasks 
SET skill_category = 'AI / Machine Learning'
WHERE title = 'Database Design Challenge' AND skill_category = 'AI/Data Science';

-- Update sample task templates with new skill names
UPDATE task_templates 
SET skill_category = 'Full-Stack Software Development'
WHERE name = 'React Component Template' AND skill_category = 'Web Development';

UPDATE task_templates 
SET skill_category = 'Full-Stack Software Development'
WHERE name = 'API Integration Template' AND skill_category = 'Web Development';

-- ============================================================================
-- STEP 5: VERIFICATION QUERIES
-- ============================================================================

-- Verify all skill categories in tasks table
SELECT DISTINCT skill_category FROM tasks ORDER BY skill_category;

-- Verify all primary skills in users table
SELECT DISTINCT primary_skill FROM users ORDER BY primary_skill;

-- Verify all skill categories in leaderboard table
SELECT DISTINCT skill_category FROM leaderboard ORDER BY skill_category;

-- Verify all skill categories in point_decay_history table
SELECT DISTINCT skill_category FROM point_decay_history ORDER BY skill_category;

-- Verify all skill categories in task_templates table
SELECT DISTINCT skill_category FROM task_templates ORDER BY skill_category;

-- Count records by skill category
SELECT 
    'tasks' as table_name,
    skill_category,
    COUNT(*) as record_count
FROM tasks 
GROUP BY skill_category
UNION ALL
SELECT 
    'users' as table_name,
    primary_skill as skill_category,
    COUNT(*) as record_count
FROM users 
GROUP BY primary_skill
UNION ALL
SELECT 
    'leaderboard' as table_name,
    skill_category,
    COUNT(*) as record_count
FROM leaderboard 
GROUP BY skill_category
UNION ALL
SELECT 
    'task_templates' as table_name,
    skill_category,
    COUNT(*) as record_count
FROM task_templates 
GROUP BY skill_category
ORDER BY table_name, skill_category;

-- ============================================================================
-- STEP 6: INDEX VERIFICATION
-- ============================================================================

-- Verify that indexes on skill columns are still valid
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('users', 'tasks', 'leaderboard', 'point_decay_history', 'task_templates')
  AND indexdef LIKE '%skill%'
ORDER BY tablename, indexname;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Final verification: Ensure only 4 new skills exist
DO $$
DECLARE
    task_count INTEGER;
    user_count INTEGER;
    template_count INTEGER;
BEGIN
    -- Check tasks table
    SELECT COUNT(DISTINCT skill_category) INTO task_count
    FROM tasks 
    WHERE skill_category NOT IN (
        'Full-Stack Software Development',
        'Cloud Computing & DevOps',
        'Data Science & Analytics',
        'AI / Machine Learning'
    );
    
    -- Check users table
    SELECT COUNT(DISTINCT primary_skill) INTO user_count
    FROM users 
    WHERE primary_skill NOT IN (
        'Full-Stack Software Development',
        'Cloud Computing & DevOps',
        'Data Science & Analytics',
        'AI / Machine Learning'
    );
    
    -- Check task_templates table
    SELECT COUNT(DISTINCT skill_category) INTO template_count
    FROM task_templates 
    WHERE skill_category NOT IN (
        'Full-Stack Software Development',
        'Cloud Computing & DevOps',
        'Data Science & Analytics',
        'AI / Machine Learning'
    );
    
    IF task_count > 0 OR user_count > 0 OR template_count > 0 THEN
        RAISE EXCEPTION 'Migration failed: Found old skill names in database. Tasks: %, Users: %, Templates: %', 
            task_count, user_count, template_count;
    ELSE
        RAISE NOTICE 'Migration successful: All skill names updated to new format';
    END IF;
END $$;
