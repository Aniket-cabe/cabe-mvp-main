#!/usr/bin/env node

/**
 * Quick Railway Deployment Test Script
 * Tests if services are responding correctly
 */

const https = require('https');
const http = require('http');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: 15000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ 
        status: res.statusCode, 
        data,
        headers: res.headers 
      }));
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testService(name, url) {
  log(`\n🔍 Testing ${name}...`, 'cyan');
  log(`URL: ${url}`, 'blue');
  
  try {
    const response = await makeRequest(url);
    
    if (response.status === 200) {
      log(`  ✅ ${name} is responding (${response.status})`, 'green');
      
      try {
        const data = JSON.parse(response.data);
        log(`  📊 Response: ${JSON.stringify(data, null, 2)}`, 'blue');
      } catch (e) {
        log(`  📄 Response: ${response.data.substring(0, 200)}...`, 'blue');
      }
      
      return true;
    } else {
      log(`  ❌ ${name} returned status ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`  ❌ ${name} error: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('🚀 Railway Deployment Test', 'bright');
  log('==========================', 'bright');
  
  // Get URLs from environment or use defaults
  const backendUrl = process.env.BACKEND_URL || process.argv[2] || 'http://localhost:3000';
  const frontendUrl = process.env.FRONTEND_URL || process.argv[3] || 'http://localhost:3000';
  
  log(`\n📋 Test Configuration:`, 'cyan');
  log(`Backend URL: ${backendUrl}`, 'blue');
  log(`Frontend URL: ${frontendUrl}`, 'blue');
  
  const results = [];
  
  // Test backend
  results.push(await testService('Backend Health', `${backendUrl}/health`));
  results.push(await testService('Backend Ping', `${backendUrl}/health/ping`));
  
  // Test frontend
  results.push(await testService('Frontend Health', `${frontendUrl}/health`));
  results.push(await testService('Frontend Root', `${frontendUrl}/`));
  
  // Summary
  log('\n📊 Test Results:', 'cyan');
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  if (passed === total) {
    log(`  ✅ All tests passed (${passed}/${total})`, 'green');
    log('\n🎉 Deployment is working correctly!', 'green');
  } else {
    log(`  ❌ Some tests failed (${passed}/${total})`, 'red');
    log('\n🚨 Deployment has issues that need to be fixed.', 'red');
  }
  
  log('\n💡 Next Steps:', 'cyan');
  if (passed === total) {
    log('  1. Your deployment is working! 🎉', 'green');
    log('  2. You can now use your application', 'blue');
    log('  3. Monitor the Railway dashboard for any issues', 'blue');
  } else {
    log('  1. Check Railway service logs', 'yellow');
    log('  2. Verify environment variables are set', 'yellow');
    log('  3. Check if services are actually deployed', 'yellow');
    log('  4. Run the validation script: node scripts/validate-railway-deployment.js', 'yellow');
  }
}

// Run tests
main().catch(error => {
  log(`\n❌ Test failed: ${error.message}`, 'red');
  process.exit(1);
});
