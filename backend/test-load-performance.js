/**
 * Load Testing Script for CaBE Arena
 * 
 * Simulates 100 concurrent users to test system performance
 * under load for all four skill categories.
 */

import axios from 'axios';

// Configuration
const API_BASE_URL = 'http://localhost:3001';
const CONCURRENT_USERS = 100;
const TEST_DURATION_MS = 30000; // 30 seconds
const REQUESTS_PER_USER = 10;

// Test scenarios
const testScenarios = [
  {
    name: 'Task Listing',
    method: 'GET',
    url: '/api/tasks',
    params: { limit: 20 },
  },
  {
    name: 'Task Filtering - Full-Stack',
    method: 'GET',
    url: '/api/tasks',
    params: { skill: 'fullstack-dev', limit: 10 },
  },
  {
    name: 'Task Filtering - Cloud DevOps',
    method: 'GET',
    url: '/api/tasks',
    params: { skill: 'cloud-devops', limit: 10 },
  },
  {
    name: 'Task Filtering - Data Analytics',
    method: 'GET',
    url: '/api/tasks',
    params: { skill: 'data-analytics', limit: 10 },
  },
  {
    name: 'Task Filtering - AI/ML',
    method: 'GET',
    url: '/api/tasks',
    params: { skill: 'ai-ml', limit: 10 },
  },
  {
    name: 'Health Check',
    method: 'GET',
    url: '/health',
  },
  {
    name: 'API Status',
    method: 'GET',
    url: '/api/status',
  },
];

// Performance metrics
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  errors: [],
  startTime: null,
  endTime: null,
};

// Generate random user data
function generateUserData() {
  const skills = ['fullstack-dev', 'cloud-devops', 'data-analytics', 'ai-ml'];
  const randomSkill = skills[Math.floor(Math.random() * skills.length)];
  
  return {
    email: `loadtest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
    password: 'testpass123',
    primary_skill: randomSkill,
    secondary_skills: [skills[(skills.indexOf(randomSkill) + 1) % skills.length]],
  };
}

// Simulate a single user
async function simulateUser(userId) {
  const userData = generateUserData();
  const userMetrics = {
    userId,
    requests: 0,
    successful: 0,
    failed: 0,
    responseTimes: [],
    errors: [],
  };

  try {
    // Register user
    const registerStart = Date.now();
    const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
    const registerTime = Date.now() - registerStart;
    
    userMetrics.responseTimes.push(registerTime);
    userMetrics.requests++;
    
    if (registerResponse.status === 201) {
      userMetrics.successful++;
      const token = registerResponse.data.token;
      
      // Perform multiple requests
      for (let i = 0; i < REQUESTS_PER_USER; i++) {
        const scenario = testScenarios[Math.floor(Math.random() * testScenarios.length)];
        
        try {
          const startTime = Date.now();
          const response = await axios({
            method: scenario.method,
            url: `${API_BASE_URL}${scenario.url}`,
            params: scenario.params,
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000, // 5 second timeout
          });
          const responseTime = Date.now() - startTime;
          
          userMetrics.responseTimes.push(responseTime);
          userMetrics.requests++;
          userMetrics.successful++;
          
          // Add small delay between requests
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          const responseTime = Date.now() - startTime;
          userMetrics.responseTimes.push(responseTime);
          userMetrics.requests++;
          userMetrics.failed++;
          userMetrics.errors.push({
            scenario: scenario.name,
            error: error.message,
            status: error.response?.status,
          });
        }
      }
    } else {
      userMetrics.failed++;
      userMetrics.errors.push({
        scenario: 'User Registration',
        error: 'Registration failed',
        status: registerResponse.status,
      });
    }
  } catch (error) {
    userMetrics.failed++;
    userMetrics.errors.push({
      scenario: 'User Registration',
      error: error.message,
      status: error.response?.status,
    });
  }

  return userMetrics;
}

// Run load test
async function runLoadTest() {
  console.log('🚀 LOAD TESTING CABE ARENA SYSTEM');
  console.log('='.repeat(50));
  console.log(`📊 Configuration:`);
  console.log(`   Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`   Requests per User: ${REQUESTS_PER_USER}`);
  console.log(`   Total Expected Requests: ${CONCURRENT_USERS * REQUESTS_PER_USER}`);
  console.log(`   Test Duration: ${TEST_DURATION_MS / 1000} seconds`);
  console.log();

  metrics.startTime = Date.now();

  // Create user simulation promises
  const userPromises = [];
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    userPromises.push(simulateUser(i + 1));
  }

  console.log(`🔄 Starting ${CONCURRENT_USERS} concurrent user simulations...`);
  console.log();

  // Wait for all users to complete or timeout
  const timeoutPromise = new Promise(resolve => {
    setTimeout(() => {
      resolve('timeout');
    }, TEST_DURATION_MS);
  });

  const results = await Promise.race([
    Promise.all(userPromises),
    timeoutPromise,
  ]);

  metrics.endTime = Date.now();

  if (results === 'timeout') {
    console.log('⏰ Test timed out after 30 seconds');
  } else {
    console.log('✅ All user simulations completed');
  }

  // Aggregate metrics
  results.forEach(userMetrics => {
    if (userMetrics && typeof userMetrics === 'object') {
      metrics.totalRequests += userMetrics.requests;
      metrics.successfulRequests += userMetrics.successful;
      metrics.failedRequests += userMetrics.failed;
      metrics.responseTimes.push(...userMetrics.responseTimes);
      metrics.errors.push(...userMetrics.errors);
    }
  });

  // Calculate performance statistics
  const testDuration = metrics.endTime - metrics.startTime;
  const avgResponseTime = metrics.responseTimes.length > 0 
    ? metrics.responseTimes.reduce((sum, time) => sum + time, 0) / metrics.responseTimes.length 
    : 0;
  const minResponseTime = Math.min(...metrics.responseTimes);
  const maxResponseTime = Math.max(...metrics.responseTimes);
  const successRate = (metrics.successfulRequests / metrics.totalRequests) * 100;
  const requestsPerSecond = metrics.totalRequests / (testDuration / 1000);

  // Sort response times for percentile calculation
  const sortedResponseTimes = [...metrics.responseTimes].sort((a, b) => a - b);
  const p50 = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.5)];
  const p90 = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.9)];
  const p95 = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.95)];
  const p99 = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.99)];

  // Display results
  console.log('📊 LOAD TEST RESULTS');
  console.log('='.repeat(30));
  console.log(`⏱️  Test Duration: ${(testDuration / 1000).toFixed(2)} seconds`);
  console.log(`📈 Total Requests: ${metrics.totalRequests}`);
  console.log(`✅ Successful Requests: ${metrics.successfulRequests}`);
  console.log(`❌ Failed Requests: ${metrics.failedRequests}`);
  console.log(`📊 Success Rate: ${successRate.toFixed(2)}%`);
  console.log(`🚀 Requests/Second: ${requestsPerSecond.toFixed(2)}`);
  console.log();

  console.log('⏱️  RESPONSE TIME STATISTICS');
  console.log('-'.repeat(30));
  console.log(`📊 Average: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`📉 Minimum: ${minResponseTime}ms`);
  console.log(`📈 Maximum: ${maxResponseTime}ms`);
  console.log(`📊 50th Percentile (P50): ${p50}ms`);
  console.log(`📊 90th Percentile (P90): ${p90}ms`);
  console.log(`📊 95th Percentile (P95): ${p95}ms`);
  console.log(`📊 99th Percentile (P99): ${p99}ms`);
  console.log();

  // Error analysis
  if (metrics.errors.length > 0) {
    console.log('❌ ERROR ANALYSIS');
    console.log('-'.repeat(20));
    
    const errorCounts = {};
    metrics.errors.forEach(error => {
      const key = `${error.scenario} - ${error.status || 'Unknown'}`;
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });

    Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([error, count]) => {
        console.log(`   ${error}: ${count} occurrences`);
      });
    console.log();
  }

  // Performance assessment
  console.log('🎯 PERFORMANCE ASSESSMENT');
  console.log('-'.repeat(25));
  
  const assessments = [];
  
  if (successRate >= 95) {
    assessments.push('✅ Excellent success rate (≥95%)');
  } else if (successRate >= 90) {
    assessments.push('⚠️ Good success rate (≥90%)');
  } else {
    assessments.push('❌ Poor success rate (<90%)');
  }

  if (avgResponseTime <= 500) {
    assessments.push('✅ Excellent average response time (≤500ms)');
  } else if (avgResponseTime <= 1000) {
    assessments.push('⚠️ Good average response time (≤1000ms)');
  } else {
    assessments.push('❌ Poor average response time (>1000ms)');
  }

  if (p95 <= 2000) {
    assessments.push('✅ Excellent 95th percentile response time (≤2000ms)');
  } else if (p95 <= 5000) {
    assessments.push('⚠️ Good 95th percentile response time (≤5000ms)');
  } else {
    assessments.push('❌ Poor 95th percentile response time (>5000ms)');
  }

  if (requestsPerSecond >= 50) {
    assessments.push('✅ Excellent throughput (≥50 req/s)');
  } else if (requestsPerSecond >= 20) {
    assessments.push('⚠️ Good throughput (≥20 req/s)');
  } else {
    assessments.push('❌ Poor throughput (<20 req/s)');
  }

  assessments.forEach(assessment => console.log(assessment));

  console.log();
  console.log('🎉 LOAD TESTING COMPLETED!');
  console.log('='.repeat(50));

  return {
    metrics,
    performance: {
      successRate,
      avgResponseTime,
      p95,
      requestsPerSecond,
      testDuration,
    },
    assessments,
  };
}

// Run the load test
runLoadTest().catch(console.error);
