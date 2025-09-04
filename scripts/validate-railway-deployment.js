#!/usr/bin/env node

/**
 * Railway Deployment Validation Script
 * Validates that the monorepo is ready for Railway deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - File not found: ${filePath}`, 'red');
    return false;
  }
}

function checkPackageJsonScripts(packageJsonPath, requiredScripts, description) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const scripts = packageJson.scripts || {};
    
    let allFound = true;
    for (const script of requiredScripts) {
      if (scripts[script]) {
        log(`✅ ${description} - Script '${script}' found`, 'green');
      } else {
        log(`❌ ${description} - Script '${script}' missing`, 'red');
        allFound = false;
      }
    }
    
    return allFound;
  } catch (error) {
    log(`❌ ${description} - Error reading package.json: ${error.message}`, 'red');
    return false;
  }
}

function checkWorkspaceBuild() {
  log('\n🔨 Testing workspace builds...', 'blue');
  
  try {
    // Test backend build
    log('Building backend...', 'yellow');
    execSync('yarn workspace @cabe-arena/backend build', { stdio: 'pipe' });
    log('✅ Backend build successful', 'green');
    
    // Check if dist directory exists
    if (fs.existsSync('backend/dist')) {
      log('✅ Backend dist directory created', 'green');
    } else {
      log('❌ Backend dist directory not found', 'red');
      return false;
    }
    
    // Test frontend build
    log('Building frontend...', 'yellow');
    execSync('yarn workspace @cabe-arena/frontend build', { stdio: 'pipe' });
    log('✅ Frontend build successful', 'green');
    
    // Check if dist directory exists
    if (fs.existsSync('frontend/dist')) {
      log('✅ Frontend dist directory created', 'green');
    } else {
      log('❌ Frontend dist directory not found', 'red');
      return false;
    }
    
    return true;
  } catch (error) {
    log(`❌ Build failed: ${error.message}`, 'red');
    return false;
  }
}

function checkEnvironmentFiles() {
  log('\n📄 Checking environment files...', 'blue');
  
  const envFiles = [
    { path: 'frontend/env.example', description: 'Frontend environment example' },
    { path: 'backend/env.example', description: 'Backend environment example' }
  ];
  
  let allFound = true;
  for (const envFile of envFiles) {
    if (!checkFileExists(envFile.path, envFile.description)) {
      allFound = false;
    }
  }
  
  return allFound;
}

function checkRailwayConfig() {
  log('\n🚂 Checking Railway configuration...', 'blue');
  
  const configFiles = [
    { path: 'nixpacks.toml', description: 'Nixpacks configuration' },
    { path: 'Dockerfile', description: 'Dockerfile for Railway' },
    { path: 'RAILWAY-DEPLOYMENT-PLAYBOOK.md', description: 'Railway deployment playbook' }
  ];
  
  let allFound = true;
  for (const configFile of configFiles) {
    if (!checkFileExists(configFile.path, configFile.description)) {
      allFound = false;
    }
  }
  
  return allFound;
}

function checkPackageJsonStructure() {
  log('\n📦 Checking package.json structure...', 'blue');
  
  // Check root package.json
  const rootPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check workspaces
  if (rootPackageJson.workspaces && Array.isArray(rootPackageJson.workspaces)) {
    log('✅ Root package.json has workspaces configured', 'green');
  } else {
    log('❌ Root package.json missing workspaces configuration', 'red');
    return false;
  }
  
  // Check required scripts
  const requiredRootScripts = [
    'build:frontend',
    'build:backend', 
    'build',
    'start:backend',
    'start:frontend'
  ];
  
  if (!checkPackageJsonScripts('package.json', requiredRootScripts, 'Root package.json')) {
    return false;
  }
  
  // Check backend package.json
  const requiredBackendScripts = ['build', 'start'];
  if (!checkPackageJsonScripts('backend/package.json', requiredBackendScripts, 'Backend package.json')) {
    return false;
  }
  
  // Check frontend package.json
  const requiredFrontendScripts = ['build', 'preview'];
  if (!checkPackageJsonScripts('frontend/package.json', requiredFrontendScripts, 'Frontend package.json')) {
    return false;
  }
  
  return true;
}

function checkYarnLock() {
  log('\n🔒 Checking yarn.lock...', 'blue');
  
  if (fs.existsSync('yarn.lock')) {
    log('✅ yarn.lock exists', 'green');
    
    // Check if yarn.lock is recent (modified within last 7 days)
    const stats = fs.statSync('yarn.lock');
    const daysSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceModified < 7) {
      log('✅ yarn.lock is recent', 'green');
    } else {
      log('⚠️ yarn.lock is older than 7 days - consider running yarn install', 'yellow');
    }
    
    return true;
  } else {
    log('❌ yarn.lock not found', 'red');
    return false;
  }
}

function main() {
  log('🚀 Railway Deployment Validation', 'bold');
  log('================================', 'bold');
  
  let allChecksPassed = true;
  
  // Run all checks
  const checks = [
    { name: 'Package.json Structure', fn: checkPackageJsonStructure },
    { name: 'Yarn Lock', fn: checkYarnLock },
    { name: 'Environment Files', fn: checkEnvironmentFiles },
    { name: 'Railway Configuration', fn: checkRailwayConfig },
    { name: 'Workspace Builds', fn: checkWorkspaceBuild }
  ];
  
  for (const check of checks) {
    log(`\n${'='.repeat(50)}`, 'blue');
    log(`Running: ${check.name}`, 'blue');
    log('='.repeat(50), 'blue');
    
    if (!check.fn()) {
      allChecksPassed = false;
    }
  }
  
  // Final result
  log('\n' + '='.repeat(50), 'bold');
  if (allChecksPassed) {
    log('🎉 All checks passed! Ready for Railway deployment.', 'green');
    log('\nNext steps:', 'blue');
    log('1. Follow the RAILWAY-DEPLOYMENT-PLAYBOOK.md', 'yellow');
    log('2. Create Railway services as documented', 'yellow');
    log('3. Set environment variables', 'yellow');
    log('4. Deploy and test', 'yellow');
  } else {
    log('❌ Some checks failed. Please fix the issues above before deploying.', 'red');
    log('\nCommon fixes:', 'blue');
    log('- Run yarn install to update dependencies', 'yellow');
    log('- Check that all required files exist', 'yellow');
    log('- Verify package.json scripts are correct', 'yellow');
  }
  log('='.repeat(50), 'bold');
  
  process.exit(allChecksPassed ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = {
  checkFileExists,
  checkPackageJsonScripts,
  checkWorkspaceBuild,
  checkEnvironmentFiles,
  checkRailwayConfig,
  checkPackageJsonStructure,
  checkYarnLock
};