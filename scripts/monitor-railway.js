#!/usr/bin/env node

/**
 * Railway Deployment Monitor
 * Monitors deployment status and tests health endpoints
 */

const https = require('https');
const http = require('http');

// Configuration - update these with your actual Railway URLs
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

console.log('🔍 Railway Deployment Monitor');
console.log('=============================');
console.log(`Backend: ${BACKEND_URL}`);
console.log(`Frontend: ${FRONTEND_URL}`);
console.log('');

// Test backend health endpoints
async function testBackendHealth() {
  console.log('🧪 Testing Backend Health...');
  
  const endpoints = [
    { path: '/health', name: 'Basic Health' },
    { path: '/api/status', name: 'API Status' },
    { path: '/api/arena', name: 'Arena API' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${BACKEND_URL}${endpoint.path}`);
      console.log(`✅ ${endpoint.name}: ${response.status} - ${response.data?.status || response.data?.message || 'OK'}`);
    } catch (error) {
      console.log(`❌ ${endendpoint.name}: ${error.message}`);
    }
  }
}

// Test frontend accessibility
async function testFrontend() {
  console.log('\n🧪 Testing Frontend...');
  
  try {
    const response = await makeRequest(FRONTEND_URL);
    if (response.status === 200) {
      console.log('✅ Frontend: Accessible');
    } else {
      console.log(`⚠️ Frontend: Status ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Frontend: ${error.message}`);
  }
}

// Make HTTP/HTTPS request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Main monitoring function
async function monitor() {
  try {
    await testBackendHealth();
    await testFrontend();
    
    console.log('\n🎉 Monitoring complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Check Railway dashboard for deployment status');
    console.log('2. Verify environment variables are set correctly');
    console.log('3. Test authentication flow if backend is healthy');
    console.log('4. Check WebSocket connections for real-time features');
    
  } catch (error) {
    console.error('❌ Monitoring failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  monitor();
}

module.exports = { monitor, testBackendHealth, testFrontend };
