# CABE ARENA - Skill Migration Guide

## Overview

This migration updates the CABE Arena database from the old skill names to the new comprehensive skill categories:

### Old Skills → New Skills
- `Web Development` → `Full-Stack Software Development`
- `Design` → `Cloud Computing & DevOps`
- `Content Writing` → `Data Science & Analytics`
- `AI/Data Science` → `AI / Machine Learning`

## Migration Files

### 1. `skill-migration.sql` - Main Migration Script
**Purpose**: Primary migration script that updates all database tables and constraints
**What it does**:
- Updates existing data in all tables
- Adds check constraints for new skill names
- Updates seed data
- Provides verification queries
- Includes final validation

### 2. `skill-migration-rollback.sql` - Rollback Script
**Purpose**: Reverts the migration if needed
**When to use**: Only if you need to rollback to old skill names
**Warning**: This will revert all changes back to old skill names

### 3. `test-migration.sql` - Test Script
**Purpose**: Tests the migration process with sample data
**What it does**:
- Creates test data with old skill names
- Runs migration updates
- Verifies results
- Cleans up test data

## Tables Affected

The migration updates the following tables:

1. **users**
   - `primary_skill` column
   - `secondary_skills` array column

2. **tasks**
   - `skill_category` column

3. **leaderboard**
   - `skill_category` column

4. **point_decay_history**
   - `skill_category` column

5. **task_templates**
   - `skill_category` column

## Migration Steps

### Step 1: Backup Database
```sql
-- Create backup of affected tables
CREATE TABLE users_backup AS SELECT * FROM users;
CREATE TABLE tasks_backup AS SELECT * FROM tasks;
CREATE TABLE leaderboard_backup AS SELECT * FROM leaderboard;
CREATE TABLE point_decay_history_backup AS SELECT * FROM point_decay_history;
CREATE TABLE task_templates_backup AS SELECT * FROM task_templates;
```

### Step 2: Run Migration
```sql
-- Execute the main migration script
\i skill-migration.sql
```

### Step 3: Verify Migration
```sql
-- Check that only new skills exist
SELECT DISTINCT skill_category FROM tasks ORDER BY skill_category;
SELECT DISTINCT primary_skill FROM users ORDER BY primary_skill;
```

### Step 4: Test Application
- Verify frontend and backend work correctly
- Check that all skill-related features function properly
- Test user registration and profile updates

## Verification Queries

### Check All Skill Categories
```sql
-- Tasks table
SELECT DISTINCT skill_category FROM tasks ORDER BY skill_category;

-- Users table
SELECT DISTINCT primary_skill FROM users ORDER BY primary_skill;

-- Leaderboard table
SELECT DISTINCT skill_category FROM leaderboard ORDER BY skill_category;

-- Task templates table
SELECT DISTINCT skill_category FROM task_templates ORDER BY skill_category;
```

### Expected Results
After migration, you should see only these 4 skill categories:
1. `Full-Stack Software Development`
2. `Cloud Computing & DevOps`
3. `Data Science & Analytics`
4. `AI / Machine Learning`

### Count Records by Skill
```sql
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
ORDER BY table_name, skill_category;
```

## Index Verification

The migration preserves all existing indexes on skill columns:

- `idx_users_primary_skill` on `users(primary_skill)`
- `idx_tasks_skill_category` on `tasks(skill_category)`
- `idx_leaderboard_skill_category` on `leaderboard(skill_category)`
- `idx_point_decay_history_skill_category` on `point_decay_history(skill_category)`

## Check Constraints

New check constraints are added to ensure data integrity:

```sql
-- Users table
ALTER TABLE users ADD CONSTRAINT users_primary_skill_check 
CHECK (primary_skill IN (
    'Full-Stack Software Development',
    'Cloud Computing & DevOps',
    'Data Science & Analytics',
    'AI / Machine Learning'
));

-- Tasks table
ALTER TABLE tasks ADD CONSTRAINT tasks_skill_category_check 
CHECK (skill_category IN (
    'Full-Stack Software Development',
    'Cloud Computing & DevOps',
    'Data Science & Analytics',
    'AI / Machine Learning'
));
```

## Rollback Process

If you need to rollback the migration:

1. **Stop the application** to prevent new data
2. **Run the rollback script**:
   ```sql
   \i skill-migration-rollback.sql
   ```
3. **Verify rollback**:
   ```sql
   SELECT DISTINCT skill_category FROM tasks ORDER BY skill_category;
   SELECT DISTINCT primary_skill FROM users ORDER BY primary_skill;
   ```
4. **Restart the application**

## Testing the Migration

### 1. Test with Sample Data
```sql
-- Run the test script
\i test-migration.sql
```

### 2. Manual Testing
```sql
-- Insert test user with old skill
INSERT INTO users (email, password_hash, name, primary_skill) 
VALUES ('test@example.com', '$2b$10$hash', 'Test User', 'Web Development');

-- Run migration
-- Verify skill was updated
SELECT email, primary_skill FROM users WHERE email = 'test@example.com';

-- Clean up
DELETE FROM users WHERE email = 'test@example.com';
```

## Troubleshooting

### Common Issues

1. **Constraint Violation Errors**
   - Ensure all old skill names are properly mapped
   - Check for any data that wasn't updated

2. **Index Issues**
   - Verify indexes are still valid after migration
   - Rebuild indexes if needed: `REINDEX TABLE table_name;`

3. **Application Errors**
   - Check that backend validation schemas match new skill names
   - Verify frontend components use new skill names

### Error Recovery

If the migration fails:

1. **Check the error message** for specific details
2. **Review the backup tables** to understand what changed
3. **Run rollback script** if needed
4. **Fix the issue** and re-run migration

## Post-Migration Checklist

- [ ] All skill categories show only new names
- [ ] Application starts without errors
- [ ] User registration works with new skills
- [ ] Task creation works with new skills
- [ ] Leaderboard displays correctly
- [ ] Analytics and reporting work
- [ ] All indexes are valid
- [ ] Check constraints are enforced

## Support

If you encounter issues during migration:

1. Check the verification queries for data consistency
2. Review the rollback script if you need to revert
3. Test with the provided test script
4. Ensure all application code is updated to use new skill names

## Migration Complete

Once the migration is successful, you should see:
- Only 4 skill categories in all tables
- All check constraints enforcing new skill names
- Application functioning normally with new skills
- No old skill names remaining in the database
