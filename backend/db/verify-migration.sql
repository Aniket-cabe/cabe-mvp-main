-- ============================================================================
-- CABE ARENA SKILL MIGRATION VERIFICATION SCRIPT
-- ============================================================================
-- Run this after migration to verify everything is correct

-- ============================================================================
-- VERIFICATION 1: CHECK ALL SKILL CATEGORIES
-- ============================================================================

SELECT '=== VERIFICATION 1: ALL SKILL CATEGORIES ===' as status;

-- Check tasks table
SELECT 'Tasks table skill categories:' as table_name;
SELECT DISTINCT skill_category FROM tasks ORDER BY skill_category;

-- Check users table
SELECT 'Users table primary skills:' as table_name;
SELECT DISTINCT primary_skill FROM users ORDER BY primary_skill;

-- Check leaderboard table
SELECT 'Leaderboard table skill categories:' as table_name;
SELECT DISTINCT skill_category FROM leaderboard ORDER BY skill_category;

-- Check point_decay_history table
SELECT 'Point decay history skill categories:' as table_name;
SELECT DISTINCT skill_category FROM point_decay_history ORDER BY skill_category;

-- Check task_templates table
SELECT 'Task templates skill categories:' as table_name;
SELECT DISTINCT skill_category FROM task_templates ORDER BY skill_category;

-- ============================================================================
-- VERIFICATION 2: COUNT RECORDS BY SKILL
-- ============================================================================

SELECT '=== VERIFICATION 2: RECORD COUNTS BY SKILL ===' as status;

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
    'point_decay_history' as table_name,
    skill_category,
    COUNT(*) as record_count
FROM point_decay_history 
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
-- VERIFICATION 3: CHECK FOR OLD SKILL NAMES
-- ============================================================================

SELECT '=== VERIFICATION 3: CHECK FOR OLD SKILL NAMES ===' as status;

-- Check for old skill names in tasks
SELECT 'Old skill names in tasks:' as check_type;
SELECT COUNT(*) as old_skill_count FROM tasks 
WHERE skill_category IN ('Web Development', 'Design', 'Content Writing', 'AI/Data Science');

-- Check for old skill names in users
SELECT 'Old skill names in users:' as check_type;
SELECT COUNT(*) as old_skill_count FROM users 
WHERE primary_skill IN ('Web Development', 'Design', 'Content Writing', 'AI/Data Science');

-- Check for old skill names in secondary skills
SELECT 'Old skill names in secondary skills:' as check_type;
SELECT COUNT(*) as old_skill_count FROM users 
WHERE secondary_skills && ARRAY['Web Development', 'Design', 'Content Writing', 'AI/Data Science'];

-- Check for old skill names in task templates
SELECT 'Old skill names in task templates:' as check_type;
SELECT COUNT(*) as old_skill_count FROM task_templates 
WHERE skill_category IN ('Web Development', 'Design', 'Content Writing', 'AI/Data Science');

-- ============================================================================
-- VERIFICATION 4: CHECK CONSTRAINTS
-- ============================================================================

SELECT '=== VERIFICATION 4: CHECK CONSTRAINTS ===' as status;

-- Check if constraints exist
SELECT 
    table_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name IN ('users', 'tasks', 'leaderboard', 'point_decay_history', 'task_templates')
  AND constraint_name LIKE '%skill%'
ORDER BY table_name, constraint_name;

-- ============================================================================
-- VERIFICATION 5: CHECK INDEXES
-- ============================================================================

SELECT '=== VERIFICATION 5: CHECK INDEXES ===' as status;

-- Check skill-related indexes
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('users', 'tasks', 'leaderboard', 'point_decay_history', 'task_templates')
  AND indexdef LIKE '%skill%'
ORDER BY tablename, indexname;

-- ============================================================================
-- VERIFICATION 6: FINAL SUMMARY
-- ============================================================================

SELECT '=== VERIFICATION 6: FINAL SUMMARY ===' as status;

-- Count total records in each table
SELECT 
    'Total records by table:' as summary_type;
SELECT 
    'users' as table_name,
    COUNT(*) as total_records
FROM users
UNION ALL
SELECT 
    'tasks' as table_name,
    COUNT(*) as total_records
FROM tasks
UNION ALL
SELECT 
    'leaderboard' as table_name,
    COUNT(*) as total_records
FROM leaderboard
UNION ALL
SELECT 
    'point_decay_history' as table_name,
    COUNT(*) as total_records
FROM point_decay_history
UNION ALL
SELECT 
    'task_templates' as table_name,
    COUNT(*) as total_records
FROM task_templates
ORDER BY table_name;

-- ============================================================================
-- MIGRATION VERIFICATION COMPLETE
-- ============================================================================

SELECT 'Migration verification completed!' as result;
SELECT 'Expected: Only 4 new skill categories should be present' as note;
SELECT 'Expected: No old skill names should be found' as note;
