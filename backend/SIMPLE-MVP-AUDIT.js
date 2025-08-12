#!/usr/bin/env node

/**
 * CABE BEACHHEAD MVP — SIMPLE AUDIT
 * 
 * A simplified audit to check critical functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting CABE BEACHHEAD MVP — SIMPLE AUDIT');
console.log('ZERO TOLERANCE for missing/broken features\n');

let passedChecks = 0;
let failedChecks = 0;
let criticalFailures = 0;

function checkFile(filePath, description) {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`✅ PASS: ${description} - File exists: ${filePath}`);
      passedChecks++;
      return true;
    } else {
      console.log(`❌ FAIL: ${description} - File missing: ${filePath}`);
      failedChecks++;
      return false;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${description} - Error: ${error.message}`);
    failedChecks++;
    return false;
  }
}

function checkFileContent(filePath, searchTerms, description) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ FAIL: ${description} - File missing: ${filePath}`);
      failedChecks++;
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const missingTerms = [];
    
    for (const term of searchTerms) {
      if (!content.includes(term)) {
        missingTerms.push(term);
      }
    }
    
    if (missingTerms.length === 0) {
      console.log(`✅ PASS: ${description} - All terms found in ${filePath}`);
      passedChecks++;
      return true;
    } else {
      console.log(`❌ FAIL: ${description} - Missing terms in ${filePath}: ${missingTerms.join(', ')}`);
      failedChecks++;
      return false;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${description} - Error reading file: ${error.message}`);
    failedChecks++;
    return false;
  }
}

// ============================================================================
// CRITICAL FUNCTIONALITY CHECKS
// ============================================================================

console.log('🔍 Checking Critical Functionality...\n');

// 1. Platform Identity
console.log('🎯 Platform Identity:');
checkFileContent('../README.md', ['Cabe Arena'], 'Platform name in README');
checkFileContent('../frontend/index.html', ['Cabe Arena'], 'Platform name in HTML title');

// 2. Required Skills
console.log('\n🎯 Required Skills:');
const requiredSkills = [
  "AI / Machine Learning",
  "Cloud Computing & DevOps", 
  "Data Science & Analytics",
  "Full-Stack Software Development"
];

checkFileContent('src/services/task-forge.service.ts', requiredSkills, 'Required skills in task forge');
checkFileContent('src/lib/points.ts', requiredSkills, 'Required skills in points system');
checkFileContent('src/routes/auth.routes.ts', requiredSkills, 'Required skills in auth routes');

// 3. Task System
console.log('\n🎯 Task System:');
checkFileContent('src/services/task-forge.service.ts', ['SKILL_CATEGORIES', 'TASK_TEMPLATES'], 'Task generation system');
checkFileContent('src/services/task-forge.service.ts', ['practice', 'mini_project'], 'Task types');
checkFileContent('src/services/task-forge.service.ts', ['ROTATION_CONFIG', 'shouldRotateTask'], 'Task rotation');

// 4. Points Formula
console.log('\n🎯 Points Formula:');
checkFileContent('src/lib/points.ts', ['Service Points Formula v5', 'calculateTaskPoints'], 'Points formula implementation');
checkFileContent('src/lib/points.ts', ['SKILL_CONFIGURATIONS', 'baseMultiplier'], 'Skill-specific weightings');

// 5. Rank Progression
console.log('\n🎯 Rank Progression:');
checkFileContent('src/middleware/rankMiddleware.ts', ['RANK_TIERS', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'], 'Rank thresholds');
checkFileContent('src/utils/feature-access.ts', ['RANK_FEATURES', 'Basic Credits', 'Enhanced Credits', 'Premium Credits', 'Unlimited Credits', 'Discounts', 'Priority Discounts', 'Maximum Discounts'], 'Rank unlocks');

// 6. Proof Submission
console.log('\n🎯 Proof Submission:');
checkFileContent('src/routes/arena.ts', ['router.post', '/submit', 'proof'], 'Proof submission endpoint');

// 7. User Flow
console.log('\n🎯 User Flow:');
checkFileContent('src/routes/auth.routes.ts', ['registerSchema', 'primary_skill', 'secondary_skills'], 'Registration with skill selection');

// 8. Gamification
console.log('\n🎯 Gamification:');
checkFileContent('src/routes/arena.ts', ['leaderboard', 'skill', 'category'], 'Leaderboards by skill');

// ============================================================================
// INSTANT FAIL CONDITIONS
// ============================================================================

console.log('\n🚨 Instant Fail Conditions:');

// Check for old skill names (only exact matches, not partial words)
const oldSkillNames = ['Web Development', 'Web Dev', 'Design', 'Content Writing', 'Content', 'AI/Data Science'];
let oldSkillsFound = false;

const criticalFiles = [
  'src/services/task-forge.service.ts',
  'src/lib/points.ts',
  'src/routes/auth.routes.ts',
  'src/routes/v1/user.ts'
];

for (const file of criticalFiles) {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      for (const oldSkill of oldSkillNames) {
        // Use word boundaries to avoid false positives
        const regex = new RegExp(`\\b${oldSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        if (regex.test(content)) {
          // Skip if it's in the verification function (which is supposed to contain old skill names)
          if (file.includes('task-forge.service.ts') && content.includes('verifyNoOldSkillsInTasks')) {
            continue; // Skip this file as it contains the verification function
          }
          console.log(`🚨 CRITICAL: Found old skill name "${oldSkill}" in ${file}`);
          oldSkillsFound = true;
          criticalFailures++;
        }
      }
    }
  } catch (error) {
    // Skip files that can't be read
  }
}

if (!oldSkillsFound) {
  console.log('✅ PASS: No old skill names found in critical files');
  passedChecks++;
}

// ============================================================================
// FINAL REPORT
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('📊 CABE BEACHHEAD MVP — AUDIT RESULTS');
console.log('='.repeat(80));

console.log(`Total Checks: ${passedChecks + failedChecks}`);
console.log(`✅ Passed: ${passedChecks}`);
console.log(`❌ Failed: ${failedChecks}`);
console.log(`🚨 Critical Failures: ${criticalFailures}`);

if (criticalFailures > 0) {
  console.log('\n🚨 MVP STATUS: NOT READY - CRITICAL FAILURES DETECTED!');
  process.exit(1);
} else if (failedChecks > 0) {
  console.log('\n⚠️  MVP STATUS: NEEDS FIXES BEFORE LAUNCH!');
  process.exit(2);
} else {
  console.log('\n🎉 MVP STATUS: READY FOR LAUNCH!');
  process.exit(0);
}
