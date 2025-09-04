#!/usr/bin/env node

/**
 * Railway Deployment Validation Script
 * Validates that all required environment variables and configurations are set
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function validateEnvironment() {
  log('\n🔍 Validating Railway Deployment Environment...', 'cyan');
  
  const requiredVars = [
    'NODE_ENV',
    'PORT'
  ];
  
  const optionalVars = [
    'DATABASE_URL',
    'MONGO_URL',
    'JWT_SECRET',
    'FRONTEND_URL',
    'CORS_ORIGIN',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'OPENAI_API_KEY'
  ];
  
  let allGood = true;
  
  // Check required variables
  log('\n📋 Required Environment Variables:', 'blue');
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      log(`  ✅ ${varName}: ${process.env[varName]}`, 'green');
    } else {
      log(`  ❌ ${varName}: NOT SET`, 'red');
      allGood = false;
    }
  }
  
  // Check optional variables
  log('\n📋 Optional Environment Variables:', 'blue');
  for (const varName of optionalVars) {
    if (process.env[varName]) {
      const value = varName.includes('SECRET') || varName.includes('KEY') 
        ? '***HIDDEN***' 
        : process.env[varName];
      log(`  ✅ ${varName}: ${value}`, 'green');
    } else {
      log(`  ⚠️  ${varName}: NOT SET`, 'yellow');
    }
  }
  
  return allGood;
}

async function validateHealthChecks() {
  log('\n🏥 Validating Health Checks...', 'cyan');
  
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  try {
    // Test backend health
    log(`\n🔍 Testing backend health: ${backendUrl}/health`, 'blue');
    const backendHealth = await makeRequest(`${backendUrl}/health`);
    
    if (backendHealth.status === 200) {
      log('  ✅ Backend health check passed', 'green');
      try {
        const healthData = JSON.parse(backendHealth.data);
        log(`  📊 Status: ${healthData.status}`, 'blue');
        log(`  🕒 Uptime: ${Math.round(healthData.uptime)}s`, 'blue');
        if (healthData.services) {
          log(`  🗄️  Database: ${healthData.services.database}`, 'blue');
          log(`  🔴 Redis: ${healthData.services.redis}`, 'blue');
        }
      } catch (e) {
        log('  ⚠️  Could not parse health response', 'yellow');
      }
    } else {
      log(`  ❌ Backend health check failed: ${backendHealth.status}`, 'red');
    }
  } catch (error) {
    log(`  ❌ Backend health check error: ${error.message}`, 'red');
  }
  
  try {
    // Test frontend health
    log(`\n🔍 Testing frontend health: ${frontendUrl}/health`, 'blue');
    const frontendHealth = await makeRequest(`${frontendUrl}/health`);
    
    if (frontendHealth.status === 200) {
      log('  ✅ Frontend health check passed', 'green');
    } else {
      log(`  ❌ Frontend health check failed: ${frontendHealth.status}`, 'red');
    }
  } catch (error) {
    log(`  ❌ Frontend health check error: ${error.message}`, 'red');
  }
}

async function validateDatabaseConnection() {
  log('\n🗄️  Validating Database Connection...', 'cyan');
  
  if (process.env.DATABASE_URL) {
    log('  ✅ PostgreSQL DATABASE_URL is configured', 'green');
  } else {
    log('  ⚠️  No PostgreSQL DATABASE_URL configured', 'yellow');
  }
  
  if (process.env.MONGO_URL) {
    log('  ✅ MongoDB MONGO_URL is configured', 'green');
  } else {
    log('  ⚠️  No MongoDB MONGO_URL configured', 'yellow');
  }
  
  if (!process.env.DATABASE_URL && !process.env.MONGO_URL) {
    log('  ⚠️  No database configured - running in database-less mode', 'yellow');
  }
}

async function validateCORSConfiguration() {
  log('\n🌐 Validating CORS Configuration...', 'cyan');
  
  const frontendUrl = process.env.FRONTEND_URL;
  const corsOrigin = process.env.CORS_ORIGIN;
  
  if (frontendUrl && corsOrigin) {
    if (frontendUrl === corsOrigin) {
      log('  ✅ CORS configuration matches frontend URL', 'green');
    } else {
      log('  ⚠️  CORS_ORIGIN does not match FRONTEND_URL', 'yellow');
      log(`    FRONTEND_URL: ${frontendUrl}`, 'blue');
      log(`    CORS_ORIGIN: ${corsOrigin}`, 'blue');
    }
  } else {
    log('  ⚠️  CORS configuration incomplete', 'yellow');
    if (!frontendUrl) log('    FRONTEND_URL not set', 'red');
    if (!corsOrigin) log('    CORS_ORIGIN not set', 'red');
  }
}

async function main() {
  log('🚀 Railway Deployment Validation', 'bright');
  log('================================', 'bright');
  
  const envValid = await validateEnvironment();
  await validateDatabaseConnection();
  await validateCORSConfiguration();
  await validateHealthChecks();
  
  log('\n📊 Validation Summary:', 'cyan');
  if (envValid) {
    log('  ✅ Environment validation passed', 'green');
  } else {
    log('  ❌ Environment validation failed', 'red');
  }
  
  log('\n🎯 Next Steps:', 'cyan');
  log('  1. Check Railway dashboard for deployment status', 'blue');
  log('  2. Verify all environment variables are set correctly', 'blue');
  log('  3. Test API endpoints manually', 'blue');
  log('  4. Check Railway logs for any errors', 'blue');
  
  log('\n✨ Validation complete!', 'green');
  
  if (!envValid) {
    process.exit(1);
  }
}

// Run validation
main().catch(error => {
  log(`\n❌ Validation failed: ${error.message}`, 'red');
  process.exit(1);
});
