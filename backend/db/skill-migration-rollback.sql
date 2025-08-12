-- ============================================================================
-- CABE ARENA SKILL MIGRATION ROLLBACK SCRIPT
-- ============================================================================
-- This script reverts the database from new skill names back to old skill names
-- WARNING: Only use if you need to rollback the migration

-- ============================================================================
-- STEP 1: REMOVE CHECK CONSTRAINTS
-- ============================================================================

-- Drop check constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_primary_skill_check;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_skill_category_check;
ALTER TABLE leaderboard DROP CONSTRAINT IF EXISTS leaderboard_skill_category_check;
ALTER TABLE point_decay_history DROP CONSTRAINT IF EXISTS point_decay_history_skill_category_check;
ALTER TABLE task_templates DROP CONSTRAINT IF EXISTS task_templates_skill_category_check;

-- ============================================================================
-- STEP 2: REVERT DATA BACK TO OLD SKILL NAMES
-- ============================================================================

-- Revert users table - primary_skill
UPDATE users 
SET primary_skill = CASE 
    WHEN primary_skill = 'Full-Stack Software Development' THEN 'Web Development'
    WHEN primary_skill = 'Cloud Computing & DevOps' THEN 'Design'
    WHEN primary_skill = 'Data Science & Analytics' THEN 'Content Writing'
    WHEN primary_skill = 'AI / Machine Learning' THEN 'AI/Data Science'
    ELSE primary_skill
END
WHERE primary_skill IN ('Full-Stack Software Development', 'Cloud Computing & DevOps', 'Data Science & Analytics', 'AI / Machine Learning');

-- Revert users table - secondary_skills array
UPDATE users 
SET secondary_skills = ARRAY(
    SELECT CASE 
        WHEN skill = 'Full-Stack Software Development' THEN 'Web Development'
        WHEN skill = 'Cloud Computing & DevOps' THEN 'Design'
        WHEN skill = 'Data Science & Analytics' THEN 'Content Writing'
        WHEN skill = 'AI / Machine Learning' THEN 'AI/Data Science'
        ELSE skill
    END
    FROM unnest(secondary_skills) AS skill
)
WHERE secondary_skills && ARRAY['Full-Stack Software Development', 'Cloud Computing & DevOps', 'Data Science & Analytics', 'AI / Machine Learning'];

-- Revert tasks table - skill_category
UPDATE tasks 
SET skill_category = CASE 
    WHEN skill_category = 'Full-Stack Software Development' THEN 'Web Development'
    WHEN skill_category = 'Cloud Computing & DevOps' THEN 'Design'
    WHEN skill_category = 'Data Science & Analytics' THEN 'Content Writing'
    WHEN skill_category = 'AI / Machine Learning' THEN 'AI/Data Science'
    ELSE skill_category
END
WHERE skill_category IN ('Full-Stack Software Development', 'Cloud Computing & DevOps', 'Data Science & Analytics', 'AI / Machine Learning');

-- Revert leaderboard table - skill_category
UPDATE leaderboard 
SET skill_category = CASE 
    WHEN skill_category = 'Full-Stack Software Development' THEN 'Web Development'
    WHEN skill_category = 'Cloud Computing & DevOps' THEN 'Design'
    WHEN skill_category = 'Data Science & Analytics' THEN 'Content Writing'
    WHEN skill_category = 'AI / Machine Learning' THEN 'AI/Data Science'
    ELSE skill_category
END
WHERE skill_category IN ('Full-Stack Software Development', 'Cloud Computing & DevOps', 'Data Science & Analytics', 'AI / Machine Learning');

-- Revert point_decay_history table - skill_category
UPDATE point_decay_history 
SET skill_category = CASE 
    WHEN skill_category = 'Full-Stack Software Development' THEN 'Web Development'
    WHEN skill_category = 'Cloud Computing & DevOps' THEN 'Design'
    WHEN skill_category = 'Data Science & Analytics' THEN 'Content Writing'
    WHEN skill_category = 'AI / Machine Learning' THEN 'AI/Data Science'
    ELSE skill_category
END
WHERE skill_category IN ('Full-Stack Software Development', 'Cloud Computing & DevOps', 'Data Science & Analytics', 'AI / Machine Learning');

-- Revert task_templates table - skill_category
UPDATE task_templates 
SET skill_category = CASE 
    WHEN skill_category = 'Full-Stack Software Development' THEN 'Web Development'
    WHEN skill_category = 'Cloud Computing & DevOps' THEN 'Design'
    WHEN skill_category = 'Data Science & Analytics' THEN 'Content Writing'
    WHEN skill_category = 'AI / Machine Learning' THEN 'AI/Data Science'
    ELSE skill_category
END
WHERE skill_category IN ('Full-Stack Software Development', 'Cloud Computing & DevOps', 'Data Science & Analytics', 'AI / Machine Learning');

-- ============================================================================
-- STEP 3: REVERT SEED DATA
-- ============================================================================

-- Revert sample users
UPDATE users 
SET primary_skill = 'Web Development'
WHERE email = 'test@example.com' AND primary_skill = 'Full-Stack Software Development';

UPDATE users 
SET primary_skill = 'Design'
WHERE email = 'user@example.com' AND primary_skill = 'Cloud Computing & DevOps';

-- Revert sample tasks
UPDATE tasks 
SET skill_category = 'Web Development'
WHERE title = 'Build a React Component' AND skill_category = 'Full-Stack Software Development';

UPDATE tasks 
SET skill_category = 'Web Development'
WHERE title = 'API Integration Project' AND skill_category = 'Full-Stack Software Development';

UPDATE tasks 
SET skill_category = 'AI/Data Science'
WHERE title = 'Database Design Challenge' AND skill_category = 'AI / Machine Learning';

-- Revert sample task templates
UPDATE task_templates 
SET skill_category = 'Web Development'
WHERE name = 'React Component Template' AND skill_category = 'Full-Stack Software Development';

UPDATE task_templates 
SET skill_category = 'Web Development'
WHERE name = 'API Integration Template' AND skill_category = 'Full-Stack Software Development';

-- ============================================================================
-- STEP 4: VERIFICATION
-- ============================================================================

-- Verify rollback was successful
SELECT DISTINCT skill_category FROM tasks ORDER BY skill_category;
SELECT DISTINCT primary_skill FROM users ORDER BY primary_skill;
SELECT DISTINCT skill_category FROM task_templates ORDER BY skill_category;

-- ============================================================================
-- ROLLBACK COMPLETE
-- ============================================================================

RAISE NOTICE 'Rollback completed: All skill names reverted to old format';
