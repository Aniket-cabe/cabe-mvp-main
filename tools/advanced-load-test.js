#!/usr/bin/env node

/**
 * CaBE Arena Advanced Load Testing Script
 * Comprehensive performance testing for deployment readiness
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Advanced configuration
const CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
  scenarios: {
    light: { users: 25, duration: 30, rampUp: 10 },
    medium: { users: 50, duration: 60, rampUp: 20 },
    heavy: { users: 100, duration: 120, rampUp: 30 },
    stress: { users: 200, duration: 180, rampUp: 60 }
  },
  endpoints: [
    { path: '/health', weight: 10 },
    { path: '/api/status', weight: 5 },
    { path: '/api/arena/tasks', weight: 30 },
    { path: '/api/points/leaderboard', weight: 20 },
    { path: '/api/auth/status', weight: 5 },
    { path: '/api/tasks', weight: 15 },
    { path: '/api/submissions', weight: 10 },
    { path: '/api/users/profile', weight: 5 }
  ],
  testFiles: [
    'test-proof.png',
    'test-document.pdf',
    'test-screenshot.jpg'
  ]
};

// Enhanced test results
const results = {
  scenarios: {},
  global: {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    responseTimes: [],
    errors: [],
    startTime: Date.now(),
    endTime: null,
    throughput: [],
    concurrentUsers: []
  }
};

// Helper function to make HTTP request with retry
function makeRequest(url, options = {}, retries = 3) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: 'GET',
      timeout: 15000,
      headers: {
        'User-Agent': 'CaBE-Arena-LoadTest/1.0',
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        results.global.responseTimes.push(responseTime);
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          results.global.successfulRequests++;
        } else {
          results.global.failedRequests++;
          results.global.errors.push({
            url,
            statusCode: res.statusCode,
            responseTime,
            timestamp: new Date().toISOString()
          });
        }
        
        results.global.totalRequests++;
        resolve({ statusCode: res.statusCode, responseTime, data, headers: res.headers });
      });
    });
    
    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      results.global.failedRequests++;
      results.global.totalRequests++;
      results.global.errors.push({
        url,
        error: error.message,
        responseTime,
        timestamp: new Date().toISOString()
      });
      
      if (retries > 0) {
        setTimeout(() => {
          makeRequest(url, options, retries - 1).then(resolve).catch(reject);
        }, 1000);
      } else {
        reject(error);
      }
    });
    
    req.on('timeout', () => {
      req.destroy();
      const responseTime = Date.now() - startTime;
      results.global.failedRequests++;
      results.global.totalRequests++;
      results.global.errors.push({
        url,
        error: 'Request timeout',
        responseTime,
        timestamp: new Date().toISOString()
      });
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Simulate realistic user behavior
async function simulateUser(userId, scenario) {
  const userStartTime = Date.now();
  const userResults = {
    userId,
    requests: 0,
    errors: 0,
    responseTimes: []
  };
  
  console.log(`👤 User ${userId} starting scenario: ${scenario.name}`);
  
  // Simulate user session
  while (Date.now() - userStartTime < scenario.duration * 1000) {
    try {
      // Select endpoint based on weights
      const totalWeight = CONFIG.endpoints.reduce((sum, ep) => sum + ep.weight, 0);
      let random = Math.random() * totalWeight;
      let selectedEndpoint = CONFIG.endpoints[0];
      
      for (const endpoint of CONFIG.endpoints) {
        random -= endpoint.weight;
        if (random <= 0) {
          selectedEndpoint = endpoint;
          break;
        }
      }
      
      const url = `${CONFIG.baseUrl}${selectedEndpoint.path}`;
      const response = await makeRequest(url);
      
      userResults.requests++;
      userResults.responseTimes.push(response.responseTime);
      
      // Simulate user think time
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
      
    } catch (error) {
      userResults.errors++;
      console.error(`❌ User ${userId} request failed:`, error.message);
    }
  }
  
  console.log(`✅ User ${userId} completed: ${userResults.requests} requests, ${userResults.errors} errors`);
  return userResults;
}

// Run load test scenario
async function runScenario(scenarioName, config) {
  console.log(`\n🚀 Starting ${scenarioName} scenario...`);
  console.log(`📊 Configuration:`);
  console.log(`   - Users: ${config.users}`);
  console.log(`   - Duration: ${config.duration}s`);
  console.log(`   - Ramp-up: ${config.rampUp}s`);
  console.log(`   - Base URL: ${CONFIG.baseUrl}`);
  
  const scenarioStartTime = Date.now();
  const userPromises = [];
  
  // Ramp up users gradually
  const rampUpInterval = config.rampUp * 1000 / config.users;
  
  for (let i = 0; i < config.users; i++) {
    const userPromise = new Promise(resolve => {
      setTimeout(async () => {
        const userResult = await simulateUser(i + 1, config);
        resolve(userResult);
      }, i * rampUpInterval);
    });
    userPromises.push(userPromise);
  }
  
  // Wait for all users to complete
  const userResults = await Promise.all(userPromises);
  const scenarioEndTime = Date.now();
  
  // Calculate scenario statistics
  const scenarioStats = calculateScenarioStats(userResults, scenarioStartTime, scenarioEndTime);
  
  results.scenarios[scenarioName] = {
    config,
    userResults,
    statistics: scenarioStats,
    startTime: scenarioStartTime,
    endTime: scenarioEndTime
  };
  
  return scenarioStats;
}

// Calculate scenario statistics
function calculateScenarioStats(userResults, startTime, endTime) {
  const allResponseTimes = userResults.flatMap(ur => ur.responseTimes);
  const totalRequests = userResults.reduce((sum, ur) => sum + ur.requests, 0);
  const totalErrors = userResults.reduce((sum, ur) => sum + ur.errors, 0);
  
  const sortedTimes = allResponseTimes.sort((a, b) => a - b);
  const avgResponseTime = allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length;
  const medianResponseTime = sortedTimes[Math.floor(sortedTimes.length / 2)];
  const p95ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
  const p99ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
  
  const duration = (endTime - startTime) / 1000;
  const requestsPerSecond = totalRequests / duration;
  const successRate = ((totalRequests - totalErrors) / totalRequests * 100);
  
  return {
    totalRequests,
    totalErrors,
    successRate: successRate.toFixed(2) + '%',
    avgResponseTime: avgResponseTime.toFixed(2) + 'ms',
    medianResponseTime: medianResponseTime + 'ms',
    p95ResponseTime: p95ResponseTime + 'ms',
    p99ResponseTime: p99ResponseTime + 'ms',
    minResponseTime: sortedTimes[0] + 'ms',
    maxResponseTime: sortedTimes[sortedTimes.length - 1] + 'ms',
    requestsPerSecond: requestsPerSecond.toFixed(2),
    duration: duration.toFixed(2) + 's',
    concurrentUsers: userResults.length
  };
}

// Generate comprehensive report
function generateReport() {
  results.global.endTime = Date.now();
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 CABE ARENA LOAD TEST REPORT');
  console.log('='.repeat(80));
  
  // Global statistics
  const globalStats = calculateScenarioStats(
    Object.values(results.scenarios).map(s => s.userResults).flat(),
    results.global.startTime,
    results.global.endTime
  );
  
  console.log('\n🌍 GLOBAL STATISTICS:');
  console.log(`Total Requests: ${globalStats.totalRequests}`);
  console.log(`Total Errors: ${globalStats.totalErrors}`);
  console.log(`Success Rate: ${globalStats.successRate}`);
  console.log(`Average Response Time: ${globalStats.avgResponseTime}`);
  console.log(`95th Percentile: ${globalStats.p95ResponseTime}`);
  console.log(`99th Percentile: ${globalStats.p99ResponseTime}`);
  console.log(`Requests per Second: ${globalStats.requestsPerSecond}`);
  console.log(`Total Duration: ${globalStats.duration}`);
  
  // Scenario breakdown
  console.log('\n📈 SCENARIO BREAKDOWN:');
  Object.entries(results.scenarios).forEach(([name, scenario]) => {
    console.log(`\n${name.toUpperCase()}:`);
    console.log(`  Users: ${scenario.statistics.concurrentUsers}`);
    console.log(`  Requests: ${scenario.statistics.totalRequests}`);
    console.log(`  Success Rate: ${scenario.statistics.successRate}`);
    console.log(`  Avg Response Time: ${scenario.statistics.avgResponseTime}`);
    console.log(`  RPS: ${scenario.statistics.requestsPerSecond}`);
  });
  
  // Performance criteria
  console.log('\n🎯 PERFORMANCE CRITERIA:');
  const criteria = {
    avgResponseTime: parseFloat(globalStats.avgResponseTime) < 500 ? '✅ PASS' : '❌ FAIL',
    successRate: parseFloat(globalStats.successRate) > 95 ? '✅ PASS' : '❌ FAIL',
    requestsPerSecond: parseFloat(globalStats.requestsPerSecond) > 10 ? '✅ PASS' : '❌ FAIL',
    p95ResponseTime: parseFloat(globalStats.p95ResponseTime) < 1000 ? '✅ PASS' : '❌ FAIL'
  };
  
  console.log(`Average Response Time < 500ms: ${criteria.avgResponseTime} (${globalStats.avgResponseTime})`);
  console.log(`Success Rate > 95%: ${criteria.successRate} (${globalStats.successRate})`);
  console.log(`Requests per Second > 10: ${criteria.requestsPerSecond} (${globalStats.requestsPerSecond})`);
  console.log(`95th Percentile < 1000ms: ${criteria.p95ResponseTime} (${globalStats.p95ResponseTime})`);
  
  // Overall result
  const allPassed = Object.values(criteria).every(c => c.includes('PASS'));
  console.log('\n' + '='.repeat(80));
  console.log(allPassed ? '🎉 ALL LOAD TESTS PASSED' : '❌ SOME LOAD TESTS FAILED');
  console.log('='.repeat(80));
  
  // Save detailed report
  const reportPath = path.join(__dirname, 'load-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  return allPassed;
}

// Main load test function
async function runAdvancedLoadTest() {
  console.log('🚀 Starting CaBE Arena Advanced Load Test...');
  console.log(`📊 Configuration:`);
  console.log(`   - Base URL: ${CONFIG.baseUrl}`);
  console.log(`   - Scenarios: ${Object.keys(CONFIG.scenarios).join(', ')}`);
  console.log(`   - Endpoints: ${CONFIG.endpoints.length} configured`);
  
  try {
    // Run all scenarios
    for (const [name, config] of Object.entries(CONFIG.scenarios)) {
      await runScenario(name, config);
      
      // Brief pause between scenarios
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Generate comprehensive report
    const success = generateReport();
    
    return success;
    
  } catch (error) {
    console.error('❌ Advanced load test failed:', error);
    return false;
  }
}

// Run the advanced load test
if (require.main === module) {
  runAdvancedLoadTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Advanced load test failed:', error);
      process.exit(1);
    });
}

module.exports = { runAdvancedLoadTest, CONFIG };
