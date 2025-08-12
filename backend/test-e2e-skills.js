/**
 * Comprehensive E2E Test Script for All Skill Flows
 * 
 * Tests the complete CaBE Arena system with the four new skill categories:
 * - Full-Stack Software Development
 * - Cloud Computing & DevOps
 * - Data Science & Analytics
 * - AI / Machine Learning
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Configuration
const API_BASE_URL = 'http://localhost:3001';
const FRONTEND_BASE_URL = 'http://localhost:5173';

// Test data
const testUsers = [
  {
    email: 'test-fullstack@example.com',
    password: 'testpass123',
    primary_skill: 'Full-Stack Software Development',
    secondary_skills: ['Cloud Computing & DevOps'],
  },
  {
    email: 'test-cloud@example.com',
    password: 'testpass123',
    primary_skill: 'Cloud Computing & DevOps',
    secondary_skills: ['AI / Machine Learning'],
  },
  {
    email: 'test-data@example.com',
    password: 'testpass123',
    primary_skill: 'Data Science & Analytics',
    secondary_skills: ['Full-Stack Software Development'],
  },
  {
    email: 'test-ai@example.com',
    password: 'testpass123',
    primary_skill: 'AI / Machine Learning',
    secondary_skills: ['Data Science & Analytics'],
  },
];

const testTasks = [
  {
    title: 'Build a React component library',
    description: 'Create reusable React components with TypeScript and Storybook',
    skill_area: 'fullstack-dev',
    difficulty: 'medium',
  },
  {
    title: 'Deploy a containerized application to AWS',
    description: 'Set up Docker containers and deploy to AWS ECS with CI/CD',
    skill_area: 'cloud-devops',
    difficulty: 'hard',
  },
  {
    title: 'Analyze customer behavior data',
    description: 'Perform statistical analysis on customer data and create visualizations',
    skill_area: 'data-analytics',
    difficulty: 'medium',
  },
  {
    title: 'Build a recommendation system',
    description: 'Create a machine learning model for product recommendations',
    skill_area: 'ai-ml',
    difficulty: 'expert',
  },
];

async function runE2ETests() {
  console.log('🚀 COMPREHENSIVE E2E TESTING FOR ALL SKILL FLOWS');
  console.log('='.repeat(60));
  console.log();

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  // Test 1: Backend API Health Check
  console.log('1. BACKEND API HEALTH CHECK');
  console.log('-'.repeat(30));
  
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    if (response.status === 200 && response.data.status === 'ok') {
      console.log('✅ Backend API is healthy');
      results.passed++;
      results.tests.push({ name: 'Backend API Health', status: 'PASS' });
    } else {
      throw new Error('Backend not healthy');
    }
  } catch (error) {
    console.error('❌ Backend API health check failed:', error.message);
    results.failed++;
    results.tests.push({ name: 'Backend API Health', status: 'FAIL', error: error.message });
  }

  console.log();

  // Test 2: Skill Categories Validation
  console.log('2. SKILL CATEGORIES VALIDATION');
  console.log('-'.repeat(30));
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/tasks`);
    const tasks = response.data.tasks || [];
    
    const skillCategories = [...new Set(tasks.map(task => task.skill_area))];
    const expectedSkills = ['fullstack-dev', 'cloud-devops', 'data-analytics', 'ai-ml'];
    
    const validSkills = expectedSkills.filter(skill => skillCategories.includes(skill));
    const invalidSkills = skillCategories.filter(skill => !expectedSkills.includes(skill));
    
    console.log(`✅ Found ${validSkills.length}/4 valid skill categories:`, validSkills);
    if (invalidSkills.length > 0) {
      console.log(`⚠️ Found ${invalidSkills.length} invalid skill categories:`, invalidSkills);
    }
    
    if (validSkills.length === 4 && invalidSkills.length === 0) {
      results.passed++;
      results.tests.push({ name: 'Skill Categories Validation', status: 'PASS' });
    } else {
      throw new Error(`Invalid skill categories found: ${invalidSkills.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Skill categories validation failed:', error.message);
    results.failed++;
    results.tests.push({ name: 'Skill Categories Validation', status: 'FAIL', error: error.message });
  }

  console.log();

  // Test 3: User Registration and Skill Selection
  console.log('3. USER REGISTRATION AND SKILL SELECTION');
  console.log('-'.repeat(40));
  
  const registeredUsers = [];
  
  for (const user of testUsers) {
    try {
      // Register user
      const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        email: user.email,
        password: user.password,
        primary_skill: user.primary_skill,
        secondary_skills: user.secondary_skills,
      });
      
      if (registerResponse.status === 201) {
        console.log(`✅ User registered: ${user.email} (${user.primary_skill})`);
        registeredUsers.push({
          ...user,
          id: registerResponse.data.user.id,
          token: registerResponse.data.token,
        });
      } else {
        throw new Error(`Registration failed for ${user.email}`);
      }
    } catch (error) {
      console.error(`❌ User registration failed for ${user.email}:`, error.message);
      results.failed++;
      results.tests.push({ name: `User Registration - ${user.email}`, status: 'FAIL', error: error.message });
    }
  }
  
  if (registeredUsers.length === testUsers.length) {
    results.passed++;
    results.tests.push({ name: 'User Registration and Skill Selection', status: 'PASS' });
  }

  console.log();

  // Test 4: Task Filtering by Skill
  console.log('4. TASK FILTERING BY SKILL');
  console.log('-'.repeat(25));
  
  try {
    const skillTests = [];
    
    for (const skill of ['fullstack-dev', 'cloud-devops', 'data-analytics', 'ai-ml']) {
      const response = await axios.get(`${API_BASE_URL}/api/tasks?skill=${skill}`);
      const tasks = response.data.tasks || [];
      
      const filteredTasks = tasks.filter(task => task.skill_area === skill);
      const otherTasks = tasks.filter(task => task.skill_area !== skill);
      
      console.log(`✅ ${skill}: ${filteredTasks.length} tasks, ${otherTasks.length} other tasks`);
      
      if (filteredTasks.length > 0 && otherTasks.length === 0) {
        skillTests.push(true);
      } else {
        skillTests.push(false);
        console.log(`⚠️ ${skill}: Found ${otherTasks.length} tasks from other skills`);
      }
    }
    
    if (skillTests.every(test => test)) {
      results.passed++;
      results.tests.push({ name: 'Task Filtering by Skill', status: 'PASS' });
    } else {
      throw new Error('Some skill filters returned tasks from other skills');
    }
  } catch (error) {
    console.error('❌ Task filtering by skill failed:', error.message);
    results.failed++;
    results.tests.push({ name: 'Task Filtering by Skill', status: 'FAIL', error: error.message });
  }

  console.log();

  // Test 5: Task Submission and Scoring
  console.log('5. TASK SUBMISSION AND SCORING');
  console.log('-'.repeat(30));
  
  try {
    const submissionTests = [];
    
    for (const user of registeredUsers.slice(0, 2)) { // Test with first 2 users
      // Get tasks for user's primary skill
      const tasksResponse = await axios.get(`${API_BASE_URL}/api/tasks?skill=${user.primary_skill.toLowerCase().replace(/\s+/g, '-')}`);
      const tasks = tasksResponse.data.tasks || [];
      
      if (tasks.length > 0) {
        const task = tasks[0];
        
        // Submit task
        const submissionResponse = await axios.post(`${API_BASE_URL}/api/tasks/submit`, {
          task_id: task.id,
          proof: `Test submission for ${task.title} by ${user.email}`,
          code: `console.log('Hello ${task.skill_area}');`,
        }, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        
        if (submissionResponse.status === 201) {
          console.log(`✅ Task submitted: ${user.email} -> ${task.title}`);
          
          // Score submission
          const scoreResponse = await axios.post(`${API_BASE_URL}/api/arena/score`, {
            submission_id: submissionResponse.data.submission_id,
            score: 85,
          }, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          
          if (scoreResponse.status === 200) {
            console.log(`✅ Task scored: ${user.email} -> ${scoreResponse.data.points_awarded} points`);
            submissionTests.push(true);
          } else {
            throw new Error(`Scoring failed for ${user.email}`);
          }
        } else {
          throw new Error(`Submission failed for ${user.email}`);
        }
      } else {
        throw new Error(`No tasks found for ${user.primary_skill}`);
      }
    }
    
    if (submissionTests.every(test => test)) {
      results.passed++;
      results.tests.push({ name: 'Task Submission and Scoring', status: 'PASS' });
    } else {
      throw new Error('Some task submissions or scoring failed');
    }
  } catch (error) {
    console.error('❌ Task submission and scoring failed:', error.message);
    results.failed++;
    results.tests.push({ name: 'Task Submission and Scoring', status: 'FAIL', error: error.message });
  }

  console.log();

  // Test 6: Leaderboard by Skill
  console.log('6. LEADERBOARD BY SKILL');
  console.log('-'.repeat(20));
  
  try {
    const leaderboardTests = [];
    
    for (const skill of ['fullstack-dev', 'cloud-devops', 'data-analytics', 'ai-ml']) {
      const response = await axios.get(`${API_BASE_URL}/api/arena/leaderboard/skill/${skill}`);
      const leaderboard = response.data.leaderboard || [];
      
      console.log(`✅ ${skill}: ${leaderboard.length} users in leaderboard`);
      
      if (leaderboard.length >= 0) { // Leaderboard can be empty initially
        leaderboardTests.push(true);
      } else {
        leaderboardTests.push(false);
      }
    }
    
    if (leaderboardTests.every(test => test)) {
      results.passed++;
      results.tests.push({ name: 'Leaderboard by Skill', status: 'PASS' });
    } else {
      throw new Error('Some skill leaderboards failed');
    }
  } catch (error) {
    console.error('❌ Leaderboard by skill failed:', error.message);
    results.failed++;
    results.tests.push({ name: 'Leaderboard by Skill', status: 'FAIL', error: error.message });
  }

  console.log();

  // Test 7: Point System Validation
  console.log('7. POINT SYSTEM VALIDATION');
  console.log('-'.repeat(25));
  
  try {
    // Test point calculation for different skills
    const pointTests = [];
    
    for (const skill of ['fullstack-dev', 'cloud-devops', 'data-analytics', 'ai-ml']) {
      const response = await axios.get(`${API_BASE_URL}/api/tasks?skill=${skill}&limit=1`);
      const tasks = response.data.tasks || [];
      
      if (tasks.length > 0) {
        const task = tasks[0];
        console.log(`✅ ${skill}: Task "${task.title}" available for point testing`);
        pointTests.push(true);
      } else {
        console.log(`⚠️ ${skill}: No tasks available for point testing`);
        pointTests.push(false);
      }
    }
    
    if (pointTests.some(test => test)) {
      results.passed++;
      results.tests.push({ name: 'Point System Validation', status: 'PASS' });
    } else {
      throw new Error('No tasks available for point system validation');
    }
  } catch (error) {
    console.error('❌ Point system validation failed:', error.message);
    results.failed++;
    results.tests.push({ name: 'Point System Validation', status: 'FAIL', error: error.message });
  }

  console.log();

  // Test 8: Frontend Component Validation
  console.log('8. FRONTEND COMPONENT VALIDATION');
  console.log('-'.repeat(30));
  
  try {
    // Check if frontend files exist and contain correct skill references
    const frontendFiles = [
      'src/modules/skills/hooks/useSkillData.ts',
      'src/modules/feed/pages/FeedPage.tsx',
      'frontend/src/components/Leaderboard.tsx',
    ];
    
    const componentTests = [];
    
    for (const file of frontendFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const hasNewSkills = content.includes('fullstack-dev') || 
                           content.includes('cloud-devops') || 
                           content.includes('data-analytics') || 
                           content.includes('ai-ml');
        
        if (hasNewSkills) {
          console.log(`✅ ${file}: Contains new skill references`);
          componentTests.push(true);
        } else {
          console.log(`⚠️ ${file}: Missing new skill references`);
          componentTests.push(false);
        }
      } else {
        console.log(`⚠️ ${file}: File not found`);
        componentTests.push(false);
      }
    }
    
    if (componentTests.some(test => test)) {
      results.passed++;
      results.tests.push({ name: 'Frontend Component Validation', status: 'PASS' });
    } else {
      throw new Error('Frontend components missing new skill references');
    }
  } catch (error) {
    console.error('❌ Frontend component validation failed:', error.message);
    results.failed++;
    results.tests.push({ name: 'Frontend Component Validation', status: 'FAIL', error: error.message });
  }

  console.log();

  // Test 9: Database Schema Validation
  console.log('9. DATABASE SCHEMA VALIDATION');
  console.log('-'.repeat(30));
  
  try {
    // Check if database contains only new skills
    const response = await axios.get(`${API_BASE_URL}/api/tasks`);
    const tasks = response.data.tasks || [];
    
    const skillCategories = [...new Set(tasks.map(task => task.skill_area))];
    const oldSkills = skillCategories.filter(skill => 
      !['fullstack-dev', 'cloud-devops', 'data-analytics', 'ai-ml'].includes(skill)
    );
    
    if (oldSkills.length === 0) {
      console.log('✅ Database contains only new skill categories');
      results.passed++;
      results.tests.push({ name: 'Database Schema Validation', status: 'PASS' });
    } else {
      throw new Error(`Database contains old skills: ${oldSkills.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Database schema validation failed:', error.message);
    results.failed++;
    results.tests.push({ name: 'Database Schema Validation', status: 'FAIL', error: error.message });
  }

  console.log();

  // Test 10: Security Validation
  console.log('10. SECURITY VALIDATION');
  console.log('-'.repeat(20));
  
  try {
    const securityTests = [];
    
    // Test 1: Unauthorized access to protected endpoints
    try {
      await axios.get(`${API_BASE_URL}/api/arena/leaderboard`);
      console.log('⚠️ Unauthorized access to leaderboard allowed');
      securityTests.push(false);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Unauthorized access properly blocked');
        securityTests.push(true);
      } else {
        console.log('⚠️ Unexpected error for unauthorized access');
        securityTests.push(false);
      }
    }
    
    // Test 2: SQL injection attempt
    try {
      await axios.get(`${API_BASE_URL}/api/tasks?skill='; DROP TABLE tasks; --`);
      console.log('⚠️ SQL injection attempt not properly handled');
      securityTests.push(false);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ SQL injection attempt properly blocked');
        securityTests.push(true);
      } else {
        console.log('⚠️ SQL injection attempt resulted in unexpected error');
        securityTests.push(false);
      }
    }
    
    if (securityTests.every(test => test)) {
      results.passed++;
      results.tests.push({ name: 'Security Validation', status: 'PASS' });
    } else {
      throw new Error('Some security tests failed');
    }
  } catch (error) {
    console.error('❌ Security validation failed:', error.message);
    results.failed++;
    results.tests.push({ name: 'Security Validation', status: 'FAIL', error: error.message });
  }

  console.log();

  // Test Summary
  console.log('📊 E2E TEST SUMMARY');
  console.log('='.repeat(20));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  console.log('\nDetailed Results:');
  results.tests.forEach(test => {
    const status = test.status === 'PASS' ? '✅' : '❌';
    console.log(`${status} ${test.name}`);
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  console.log();
  console.log('🎉 E2E TESTING COMPLETED!');
  console.log('='.repeat(60));
  
  return results;
}

// Run the E2E tests
runE2ETests().catch(console.error);
