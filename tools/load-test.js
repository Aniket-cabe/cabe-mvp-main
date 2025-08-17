#!/usr/bin/env node

/**
 * CaBE Arena Load Testing Script
 * Tests API performance under load for deployment readiness
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
  concurrentUsers: 50,
  requestsPerUser: 10,
  testDuration: 60, // seconds
  endpoints: [
    '/health',
    '/api/status',
    '/api/arena/tasks',
    '/api/points/leaderboard',
    '/api/auth/status'
  ]
};

// Test results
const results = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  errors: [],
  startTime: Date.now(),
  endTime: null
};

// Helper function to make HTTP request
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: 'GET',
      timeout: 10000,
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        results.responseTimes.push(responseTime);
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          results.successfulRequests++;
        } else {
          results.failedRequests++;
          results.errors.push({
            url,
            statusCode: res.statusCode,
            responseTime
          });
        }
        
        results.totalRequests++;
        resolve({ statusCode: res.statusCode, responseTime, data });
      });
    });
    
    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      results.failedRequests++;
      results.totalRequests++;
      results.errors.push({
        url,
        error: error.message,
        responseTime
      });
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      const responseTime = Date.now() - startTime;
      results.failedRequests++;
      results.totalRequests++;
      results.errors.push({
        url,
        error: 'Request timeout',
        responseTime
      });
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Simulate a user making requests
async function simulateUser(userId) {
  console.log(`👤 User ${userId} starting...`);
  
  for (let i = 0; i < CONFIG.requestsPerUser; i++) {
    const endpoint = CONFIG.endpoints[Math.floor(Math.random() * CONFIG.endpoints.length)];
    const url = `${CONFIG.baseUrl}${endpoint}`;
    
    try {
      await makeRequest(url);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000)); // Random delay
    } catch (error) {
      console.error(`❌ User ${userId} request failed:`, error.message);
    }
  }
  
  console.log(`✅ User ${userId} completed`);
}

// Calculate statistics
function calculateStats() {
  const responseTimes = results.responseTimes.sort((a, b) => a - b);
  const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  const medianResponseTime = responseTimes[Math.floor(responseTimes.length / 2)];
  const p95ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.95)];
  const p99ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.99)];
  
  return {
    totalRequests: results.totalRequests,
    successfulRequests: results.successfulRequests,
    failedRequests: results.failedRequests,
    successRate: (results.successfulRequests / results.totalRequests * 100).toFixed(2) + '%',
    avgResponseTime: avgResponseTime.toFixed(2) + 'ms',
    medianResponseTime: medianResponseTime + 'ms',
    p95ResponseTime: p95ResponseTime + 'ms',
    p99ResponseTime: p99ResponseTime + 'ms',
    minResponseTime: responseTimes[0] + 'ms',
    maxResponseTime: responseTimes[responseTimes.length - 1] + 'ms',
    requestsPerSecond: (results.totalRequests / ((results.endTime - results.startTime) / 1000)).toFixed(2),
    testDuration: ((results.endTime - results.startTime) / 1000).toFixed(2) + 's'
  };
}

// Main load test function
async function runLoadTest() {
  console.log('🚀 Starting CaBE Arena Load Test...');
  console.log(`📊 Configuration:`);
  console.log(`   - Base URL: ${CONFIG.baseUrl}`);
  console.log(`   - Concurrent Users: ${CONFIG.concurrentUsers}`);
  console.log(`   - Requests per User: ${CONFIG.requestsPerUser}`);
  console.log(`   - Total Expected Requests: ${CONFIG.concurrentUsers * CONFIG.requestsPerUser}`);
  console.log(`   - Test Duration: ${CONFIG.testDuration}s`);
  console.log('');
  
  // Start concurrent users
  const userPromises = [];
  for (let i = 0; i < CONFIG.concurrentUsers; i++) {
    userPromises.push(simulateUser(i + 1));
  }
  
  // Wait for all users to complete or timeout
  const timeoutPromise = new Promise(resolve => {
    setTimeout(() => {
      console.log('⏰ Test timeout reached');
      resolve();
    }, CONFIG.testDuration * 1000);
  });
  
  await Promise.race([Promise.all(userPromises), timeoutPromise]);
  
  results.endTime = Date.now();
  
  // Calculate and display results
  const stats = calculateStats();
  
  console.log('');
  console.log('📈 Load Test Results:');
  console.log('=====================');
  console.log(`Total Requests: ${stats.totalRequests}`);
  console.log(`Successful: ${stats.successfulRequests}`);
  console.log(`Failed: ${stats.failedRequests}`);
  console.log(`Success Rate: ${stats.successRate}`);
  console.log('');
  console.log('Response Times:');
  console.log(`  Average: ${stats.avgResponseTime}`);
  console.log(`  Median: ${stats.medianResponseTime}`);
  console.log(`  95th Percentile: ${stats.p95ResponseTime}`);
  console.log(`  99th Percentile: ${stats.p99ResponseTime}`);
  console.log(`  Min: ${stats.minResponseTime}`);
  console.log(`  Max: ${stats.maxResponseTime}`);
  console.log('');
  console.log(`Requests per Second: ${stats.requestsPerSecond}`);
  console.log(`Test Duration: ${stats.testDuration}`);
  
  // Performance criteria
  console.log('');
  console.log('🎯 Performance Criteria:');
  console.log('=======================');
  
  const avgTime = parseFloat(stats.avgResponseTime);
  const successRate = parseFloat(stats.successRate);
  const rps = parseFloat(stats.requestsPerSecond);
  
  const criteria = {
    avgResponseTime: avgTime < 500 ? '✅ PASS' : '❌ FAIL',
    successRate: successRate > 95 ? '✅ PASS' : '❌ FAIL',
    requestsPerSecond: rps > 10 ? '✅ PASS' : '❌ FAIL'
  };
  
  console.log(`Average Response Time < 500ms: ${criteria.avgResponseTime} (${avgTime}ms)`);
  console.log(`Success Rate > 95%: ${criteria.successRate} (${successRate}%)`);
  console.log(`Requests per Second > 10: ${criteria.rps} (${rps} rps)`);
  
  // Overall result
  const allPassed = Object.values(criteria).every(c => c.includes('PASS'));
  console.log('');
  console.log(allPassed ? '🎉 LOAD TEST PASSED' : '❌ LOAD TEST FAILED');
  
  if (results.errors.length > 0) {
    console.log('');
    console.log('❌ Errors encountered:');
    results.errors.slice(0, 10).forEach(error => {
      console.log(`  - ${error.url}: ${error.error || error.statusCode}`);
    });
    if (results.errors.length > 10) {
      console.log(`  ... and ${results.errors.length - 10} more errors`);
    }
  }
  
  return allPassed;
}

// Run the load test
if (require.main === module) {
  runLoadTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Load test failed:', error);
      process.exit(1);
    });
}

module.exports = { runLoadTest, CONFIG };
