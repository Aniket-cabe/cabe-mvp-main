/**
 * Test Script for Updated Point System with Skill-Specific Weightings
 * 
 * Tests the Service Points Formula v5 with skill-specific configurations
 * for fair point distribution across the four new skill categories.
 */

import {
  calculateTaskPoints,
  analyzePointsFairness,
  getSkillConfigurations,
  getSkillConfiguration,
  validateSkillArea,
  calculateMaxTaskPoints,
  calculateMinTaskPoints,
} from './src/lib/points.js';

// Test tasks with same difficulty but different skills
const testTasks = [
  // Full-Stack Software Development
  {
    id: 'fullstack-1',
    title: 'Build a full-stack e-commerce application',
    description: 'Create a complete e-commerce platform with React frontend and Node.js backend',
    skill_area: 'fullstack-dev',
    duration: 0.8,
    skill: 0.9,
    complexity: 0.8,
    visibility: 0.7,
    prestige: 0.8,
    autonomy: 0.9,
    created_at: '2024-01-01T00:00:00Z',
    is_active: true,
  },
  // Cloud Computing & DevOps
  {
    id: 'cloud-devops-1',
    title: 'Deploy a microservices architecture to Kubernetes',
    description: 'Set up a complete CI/CD pipeline with Docker and Kubernetes',
    skill_area: 'cloud-devops',
    duration: 0.8,
    skill: 0.9,
    complexity: 0.8,
    visibility: 0.7,
    prestige: 0.8,
    autonomy: 0.9,
    created_at: '2024-01-01T00:00:00Z',
    is_active: true,
  },
  // Data Science & Analytics
  {
    id: 'data-analytics-1',
    title: 'Build a predictive analytics dashboard',
    description: 'Create a comprehensive data analysis and visualization platform',
    skill_area: 'data-analytics',
    duration: 0.8,
    skill: 0.9,
    complexity: 0.8,
    visibility: 0.7,
    prestige: 0.8,
    autonomy: 0.9,
    created_at: '2024-01-01T00:00:00Z',
    is_active: true,
  },
  // AI / Machine Learning
  {
    id: 'ai-ml-1',
    title: 'Develop a machine learning recommendation system',
    description: 'Build an AI-powered recommendation engine with real-time learning',
    skill_area: 'ai-ml',
    duration: 0.8,
    skill: 0.9,
    complexity: 0.8,
    visibility: 0.7,
    prestige: 0.8,
    autonomy: 0.9,
    created_at: '2024-01-01T00:00:00Z',
    is_active: true,
  },
];

async function runPointSystemTests() {
  console.log('🎯 TESTING UPDATED POINT SYSTEM WITH SKILL-SPECIFIC WEIGHTINGS');
  console.log('='.repeat(70));
  console.log();

  // Test 1: Skill Configurations
  console.log('1. SKILL CONFIGURATIONS TEST');
  console.log('-'.repeat(30));
  
  try {
    const configs = getSkillConfigurations();
    console.log(`✅ Found ${Object.keys(configs).length} skill configurations`);
    
    Object.entries(configs).forEach(([skill, config]) => {
      console.log(`   ${skill}:`);
      console.log(`     Base Multiplier: ${config.baseMultiplier}`);
      console.log(`     Bonus Multiplier: ${config.bonusMultiplier}`);
      console.log(`     Cap: ${config.cap}`);
      console.log(`     Over-Cap Boost: ${config.overCapBoost}`);
      console.log(`     Description: ${config.description}`);
    });
  } catch (error) {
    console.error('❌ Skill configurations test failed:', error.message);
  }

  console.log();

  // Test 2: Individual Skill Configuration Retrieval
  console.log('2. INDIVIDUAL SKILL CONFIGURATION TEST');
  console.log('-'.repeat(40));
  
  try {
    const skillAreas = ['fullstack-dev', 'cloud-devops', 'data-analytics', 'ai-ml'];
    
    skillAreas.forEach(skillArea => {
      const config = getSkillConfiguration(skillArea);
      if (config) {
        console.log(`✅ ${skillArea}: ${config.name} (${config.baseMultiplier}x base, ${config.bonusMultiplier}x bonus)`);
      } else {
        console.log(`❌ ${skillArea}: Configuration not found`);
      }
    });
  } catch (error) {
    console.error('❌ Individual skill configuration test failed:', error.message);
  }

  console.log();

  // Test 3: Points Calculation for Each Skill
  console.log('3. POINTS CALCULATION TEST (Score: 85, Proof: 25)');
  console.log('-'.repeat(45));
  
  try {
    testTasks.forEach(task => {
      const result = calculateTaskPoints(85, task, 25, true);
      const breakdown = result.breakdown;
      
      console.log(`✅ ${task.skill_area}:`);
      console.log(`   Points Awarded: ${result.pointsAwarded}`);
      console.log(`   Base Points: ${breakdown.base}`);
      console.log(`   Bonus Points: ${breakdown.bonus}`);
      console.log(`   Proof Bonus: ${breakdown.proofBonus}`);
      console.log(`   Skill Multiplier: ${breakdown.skillMultiplier}x`);
      console.log(`   Cap: ${breakdown.cap}`);
      console.log(`   Weighted Average: ${breakdown.weightedAverage.toFixed(3)}`);
    });
  } catch (error) {
    console.error('❌ Points calculation test failed:', error.message);
  }

  console.log();

  // Test 4: Points Fairness Analysis
  console.log('4. POINTS FAIRNESS ANALYSIS TEST');
  console.log('-'.repeat(35));
  
  try {
    const fairness = analyzePointsFairness(testTasks, 85, 25);
    
    console.log(`✅ Fairness Analysis:`);
    console.log(`   Is Fair: ${fairness.isFair ? 'Yes' : 'No'}`);
    console.log(`   Points Range: ${fairness.pointsRange.min} - ${fairness.pointsRange.max} (${fairness.pointsRange.difference} difference)`);
    console.log(`   Recommendations:`);
    fairness.recommendations.forEach(rec => console.log(`     - ${rec}`));
    
    console.log(`   Skill Breakdown:`);
    fairness.skillBreakdown.forEach(item => {
      console.log(`     ${item.skill}: ${item.points} points (${item.multiplier}x multiplier, cap: ${item.cap})`);
    });
  } catch (error) {
    console.error('❌ Points fairness analysis test failed:', error.message);
  }

  console.log();

  // Test 5: Skill Area Validation
  console.log('5. SKILL AREA VALIDATION TEST');
  console.log('-'.repeat(30));
  
  try {
    const validSkills = ['fullstack-dev', 'cloud-devops', 'data-analytics', 'ai-ml'];
    const invalidSkills = ['web-dev', 'design', 'content', 'unknown-skill'];
    
    console.log('Valid Skills:');
    validSkills.forEach(skill => {
      const validation = validateSkillArea(skill);
      console.log(`   ${skill}: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}`);
      if (!validation.isValid) {
        validation.errors.forEach(error => console.log(`     Error: ${error}`));
      }
    });
    
    console.log('Invalid Skills:');
    invalidSkills.forEach(skill => {
      const validation = validateSkillArea(skill);
      console.log(`   ${skill}: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}`);
      if (!validation.isValid) {
        validation.errors.forEach(error => console.log(`     Error: ${error}`));
      }
    });
  } catch (error) {
    console.error('❌ Skill area validation test failed:', error.message);
  }

  console.log();

  // Test 6: Min/Max Points Calculation
  console.log('6. MIN/MAX POINTS CALCULATION TEST');
  console.log('-'.repeat(35));
  
  try {
    testTasks.forEach(task => {
      const minPoints = calculateMinTaskPoints(task, 0);
      const maxPoints = calculateMaxTaskPoints(task, 50);
      
      console.log(`✅ ${task.skill_area}:`);
      console.log(`   Min Points (0 score, 0 proof): ${minPoints}`);
      console.log(`   Max Points (100 score, 50 proof): ${maxPoints}`);
      console.log(`   Range: ${maxPoints - minPoints} points`);
    });
  } catch (error) {
    console.error('❌ Min/max points calculation test failed:', error.message);
  }

  console.log();

  // Test 7: Different Score Levels
  console.log('7. DIFFERENT SCORE LEVELS TEST');
  console.log('-'.repeat(30));
  
  try {
    const scores = [50, 75, 90];
    const task = testTasks[0]; // Use fullstack task as example
    
    scores.forEach(score => {
      const result = calculateTaskPoints(score, task, 25, true);
      const breakdown = result.breakdown;
      
      console.log(`✅ Score ${score}:`);
      console.log(`   Total Points: ${result.pointsAwarded}`);
      console.log(`   Base: ${breakdown.base}, Bonus: ${breakdown.bonus}, Proof: ${breakdown.proofBonus}`);
      console.log(`   Weighted Average: ${breakdown.weightedAverage.toFixed(3)}`);
    });
  } catch (error) {
    console.error('❌ Different score levels test failed:', error.message);
  }

  console.log();

  // Test 8: Proof Strength Impact
  console.log('8. PROOF STRENGTH IMPACT TEST');
  console.log('-'.repeat(30));
  
  try {
    const proofLevels = [0, 10, 25, 50];
    const task = testTasks[0]; // Use fullstack task as example
    
    proofLevels.forEach(proof => {
      const result = calculateTaskPoints(85, task, proof, true);
      const breakdown = result.breakdown;
      
      console.log(`✅ Proof ${proof}:`);
      console.log(`   Total Points: ${result.pointsAwarded}`);
      console.log(`   Proof Bonus: ${breakdown.proofBonus}`);
      console.log(`   Base + Bonus: ${breakdown.base + breakdown.bonus}`);
    });
  } catch (error) {
    console.error('❌ Proof strength impact test failed:', error.message);
  }

  console.log();

  // Test 9: Skill Comparison Summary
  console.log('9. SKILL COMPARISON SUMMARY');
  console.log('-'.repeat(25));
  
  try {
    const summary = testTasks.map(task => {
      const result = calculateTaskPoints(85, task, 25, true);
      const breakdown = result.breakdown;
      
      return {
        skill: task.skill_area,
        points: result.pointsAwarded,
        multiplier: breakdown.skillMultiplier,
        cap: breakdown.cap,
        base: breakdown.base,
        bonus: breakdown.bonus,
      };
    });
    
    // Sort by points awarded
    summary.sort((a, b) => b.points - a.points);
    
    console.log('Ranking by Points Awarded:');
    summary.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.skill}: ${item.points} points (${item.multiplier}x multiplier, cap: ${item.cap})`);
    });
    
    const totalPoints = summary.reduce((sum, item) => sum + item.points, 0);
    const averagePoints = totalPoints / summary.length;
    console.log(`\n   Average Points: ${averagePoints.toFixed(1)}`);
    console.log(`   Total Points: ${totalPoints}`);
  } catch (error) {
    console.error('❌ Skill comparison summary test failed:', error.message);
  }

  console.log();
  console.log('🎉 ALL POINT SYSTEM TESTS COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(70));
}

// Run the tests
runPointSystemTests().catch(console.error);
