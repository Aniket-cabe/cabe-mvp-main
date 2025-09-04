#!/usr/bin/env node

// Frontend health check script for Railway deployment
const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`Frontend health check status: ${res.statusCode}`);
  
  if (res.statusCode === 200) {
    console.log('✅ Frontend health check passed');
    process.exit(0);
  } else {
    console.log('❌ Frontend health check failed');
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.error('❌ Frontend health check error:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Frontend health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();
