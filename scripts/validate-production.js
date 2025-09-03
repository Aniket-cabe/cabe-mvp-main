#!/usr/bin/env node

/**
 * Production Validation Script
 * Validates that the CaBE Arena project is ready for production deployment
 * Enhanced for Render + Vercel compatibility
 */

const fs = require('fs');
const path = require('path');

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

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`)
};

class ProductionValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.successes = [];
  }

  addError(message) {
    this.errors.push(message);
  }

  addWarning(message) {
    this.warnings.push(message);
  }

  addSuccess(message) {
    this.successes.push(message);
  }

  checkFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
      this.addSuccess(`${description}: ${filePath}`);
      return true;
    } else {
      this.addError(`${description}: ${filePath} (missing)`);
      return false;
    }
  }

  checkPackageJson() {
    log.header('Checking Package.json Files');

    // Root package.json
    const rootPackagePath = 'package.json';
    if (this.checkFileExists(rootPackagePath, 'Root package.json')) {
      try {
        const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
        
        // Check Node.js engine version
        if (rootPackage.engines && rootPackage.engines.node) {
          const nodeVersion = rootPackage.engines.node;
          if (nodeVersion.includes('>=18') && nodeVersion.includes('<23')) {
            this.addSuccess(`Node.js engine version: ${nodeVersion}`);
          } else {
            this.addWarning(`Node.js engine version should be >=18 <23, found: ${nodeVersion}`);
          }
        } else {
          this.addError('Node.js engine version not specified in root package.json');
        }

        // Check workspaces
        if (rootPackage.workspaces && Array.isArray(rootPackage.workspaces)) {
          this.addSuccess(`Workspaces configured: ${rootPackage.workspaces.join(', ')}`);
        } else {
          this.addError('Workspaces not configured in root package.json');
        }

        // Check deployment scripts
        if (rootPackage.scripts) {
          if (rootPackage.scripts['deploy:render']) {
            this.addSuccess('Render deployment script configured');
          } else {
            this.addWarning('Render deployment script not found');
          }
          if (rootPackage.scripts['deploy:vercel']) {
            this.addSuccess('Vercel deployment script configured');
          } else {
            this.addWarning('Vercel deployment script not found');
          }
        }
      } catch (error) {
        this.addError(`Failed to parse root package.json: ${error.message}`);
      }
    }

    // Backend package.json
    const backendPackagePath = 'backend/package.json';
    if (this.checkFileExists(backendPackagePath, 'Backend package.json')) {
      try {
        const backendPackage = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
        
        // Check backend name
        if (backendPackage.name === '@cabe-arena/backend') {
          this.addSuccess('Backend package name is correct');
        } else {
          this.addError(`Backend package name should be '@cabe-arena/backend', found: ${backendPackage.name}`);
        }

        // Check start script
        if (backendPackage.scripts && backendPackage.scripts.start === 'node dist/index.js') {
          this.addSuccess('Backend start script is correct');
        } else {
          this.addError('Backend start script should be "node dist/index.js"');
        }

        // Check Node.js engine version
        if (backendPackage.engines && backendPackage.engines.node) {
          const nodeVersion = backendPackage.engines.node;
          if (nodeVersion.includes('>=18') && nodeVersion.includes('<23')) {
            this.addSuccess(`Backend Node.js engine version: ${nodeVersion}`);
          } else {
            this.addWarning(`Backend Node.js engine version should be >=18 <23, found: ${nodeVersion}`);
          }
        }

        // Check Render scripts
        if (backendPackage.scripts) {
          if (backendPackage.scripts['render-build']) {
            this.addSuccess('Backend Render build script configured');
          } else {
            this.addWarning('Backend Render build script not found');
          }
        }
      } catch (error) {
        this.addError(`Failed to parse backend package.json: ${error.message}`);
      }
    }

    // Frontend package.json
    const frontendPackagePath = 'frontend/package.json';
    if (this.checkFileExists(frontendPackagePath, 'Frontend package.json')) {
      try {
        const frontendPackage = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
        
        // Check frontend name
        if (frontendPackage.name === '@cabe-arena/frontend') {
          this.addSuccess('Frontend package name is correct');
        } else {
          this.addError(`Frontend package name should be '@cabe-arena/frontend', found: ${frontendPackage.name}`);
        }

        // Check build script
        if (frontendPackage.scripts && frontendPackage.scripts.build) {
          this.addSuccess('Frontend build script is configured');
        } else {
          this.addError('Frontend build script is missing');
        }

        // Check Node.js engine version
        if (frontendPackage.engines && frontendPackage.engines.node) {
          const nodeVersion = frontendPackage.engines.node;
          if (nodeVersion.includes('>=18') && nodeVersion.includes('<23')) {
            this.addSuccess(`Frontend Node.js engine version: ${nodeVersion}`);
          } else {
            this.addWarning(`Frontend Node.js engine version should be >=18 <23, found: ${nodeVersion}`);
          }
        }

        // Check Vercel scripts
        if (frontendPackage.scripts) {
          if (frontendPackage.scripts['vercel-build']) {
            this.addSuccess('Frontend Vercel build script configured');
          } else {
            this.addWarning('Frontend Vercel build script not found');
          }
        }
      } catch (error) {
        this.addError(`Failed to parse frontend package.json: ${error.message}`);
      }
    }
  }

  checkEnvironmentFiles() {
    log.header('Checking Environment Files');

    // Check environment example files
    this.checkFileExists('env.example', 'Root environment example');
    this.checkFileExists('backend/env.example', 'Backend environment example');
    this.checkFileExists('frontend/env.example', 'Frontend environment example');

    // Check for actual .env files (warn if they exist in repo)
    if (fs.existsSync('.env')) {
      this.addWarning('Root .env file found - should not be committed to repository');
    }
    if (fs.existsSync('backend/.env')) {
      this.addWarning('Backend .env file found - should not be committed to repository');
    }
    if (fs.existsSync('frontend/.env')) {
      this.addWarning('Frontend .env file found - should not be committed to repository');
    }
  }

  checkDeploymentFiles() {
    log.header('Checking Deployment Files');

    // Check Render configuration
    this.checkFileExists('render.yaml', 'Render deployment configuration');

    // Check Vercel configuration
    this.checkFileExists('frontend/vercel.json', 'Vercel deployment configuration');

    // Check Docker files
    this.checkFileExists('Dockerfile', 'Dockerfile');
    this.checkFileExists('docker-compose.yml', 'Docker Compose (development)');
    this.checkFileExists('docker-compose.prod.yml', 'Docker Compose (production)');

    // Check deployment documentation
    this.checkFileExists('DEPLOYMENT.md', 'Deployment documentation');
  }

  checkBackendConfiguration() {
    log.header('Checking Backend Configuration');

    // Check TypeScript configuration
    this.checkFileExists('backend/tsconfig.json', 'Backend TypeScript config');
    this.checkFileExists('backend/tsup.config.ts', 'Backend build configuration');

    // Check source files
    this.checkFileExists('backend/src/index.ts', 'Backend entry point');
    this.checkFileExists('backend/src/app.ts', 'Backend app configuration');
    this.checkFileExists('backend/src/config/env.ts', 'Backend environment config');
    this.checkFileExists('backend/src/config/database.ts', 'Backend database config');

    // Check for maxPoolSize usage (not poolSize)
    const databaseFile = 'backend/src/config/database.ts';
    if (fs.existsSync(databaseFile)) {
      const content = fs.readFileSync(databaseFile, 'utf8');
      if (content.includes('maxPoolSize')) {
        this.addSuccess('Database configuration uses maxPoolSize (MongoDB v5+ compatible)');
      } else if (content.includes('poolSize')) {
        this.addError('Database configuration uses deprecated poolSize - should use maxPoolSize');
      }
    }

    // Check for proper server binding
    const indexFile = 'backend/src/index.ts';
    if (fs.existsSync(indexFile)) {
      const content = fs.readFileSync(indexFile, 'utf8');
      if (content.includes("'0.0.0.0'")) {
        this.addSuccess('Backend server binds to 0.0.0.0 (production ready)');
      } else {
        this.addWarning('Backend server should bind to 0.0.0.0 for production');
      }
    }

    // Check for Render optimizations
    const databaseConfigFile = 'backend/src/config/database.ts';
    if (fs.existsSync(databaseConfigFile)) {
      const content = fs.readFileSync(databaseConfigFile, 'utf8');
      if (content.includes('isRender')) {
        this.addSuccess('Backend includes Render-specific optimizations');
      } else {
        this.addWarning('Backend missing Render-specific optimizations');
      }
    }
  }

  checkFrontendConfiguration() {
    log.header('Checking Frontend Configuration');

    // Check TypeScript configuration
    this.checkFileExists('frontend/tsconfig.json', 'Frontend TypeScript config');
    this.checkFileExists('frontend/vite.config.ts', 'Vite configuration');

    // Check environment variable types
    const viteEnvFile = 'frontend/src/vite-env.d.ts';
    if (this.checkFileExists(viteEnvFile, 'Vite environment types')) {
      const content = fs.readFileSync(viteEnvFile, 'utf8');
      if (content.includes('VITE_')) {
        this.addSuccess('Frontend environment variables properly prefixed with VITE_');
      } else {
        this.addWarning('Frontend environment variables should be prefixed with VITE_');
      }
    }

    // Check build output
    this.checkFileExists('frontend/dist', 'Frontend build output directory');

    // Check Vite configuration for Vercel optimizations
    const viteConfigFile = 'frontend/vite.config.ts';
    if (fs.existsSync(viteConfigFile)) {
      const content = fs.readFileSync(viteConfigFile, 'utf8');
      if (content.includes('manualChunks')) {
        this.addSuccess('Vite configured with manual chunks for optimization');
      } else {
        this.addWarning('Vite missing manual chunks configuration');
      }
      if (content.includes('terser')) {
        this.addSuccess('Vite configured with Terser minification');
      } else {
        this.addWarning('Vite missing Terser minification');
      }
    }
  }

  checkSharedConfiguration() {
    log.header('Checking Shared Configuration');

    // Check shared packages
    this.checkFileExists('shared/eslint-config/package.json', 'ESLint config package');
    this.checkFileExists('shared/ts-config-base/package.json', 'TypeScript config package');

    // Check shared package names
    const eslintPackagePath = 'shared/eslint-config/package.json';
    if (fs.existsSync(eslintPackagePath)) {
      try {
        const eslintPackage = JSON.parse(fs.readFileSync(eslintPackagePath, 'utf8'));
        if (eslintPackage.name === '@cabe-arena/eslint-config') {
          this.addSuccess('ESLint config package name is correct');
        } else {
          this.addError(`ESLint config package name should be '@cabe-arena/eslint-config', found: ${eslintPackage.name}`);
        }
      } catch (error) {
        this.addError(`Failed to parse ESLint config package.json: ${error.message}`);
      }
    }

    const tsPackagePath = 'shared/ts-config-base/package.json';
    if (fs.existsSync(tsPackagePath)) {
      try {
        const tsPackage = JSON.parse(fs.readFileSync(tsPackagePath, 'utf8'));
        if (tsPackage.name === '@cabe-arena/ts-config-base') {
          this.addSuccess('TypeScript config package name is correct');
        } else {
          this.addError(`TypeScript config package name should be '@cabe-arena/ts-config-base', found: ${tsPackage.name}`);
        }
      } catch (error) {
        this.addError(`Failed to parse TypeScript config package.json: ${error.message}`);
      }
    }
  }

  checkSecurityConfiguration() {
    log.header('Checking Security Configuration');

    // Check for security middleware
    const securityFile = 'backend/src/middleware/security.ts';
    if (this.checkFileExists(securityFile, 'Security middleware')) {
      const content = fs.readFileSync(securityFile, 'utf8');
      
      if (content.includes('helmet')) {
        this.addSuccess('Helmet security headers configured');
      } else {
        this.addWarning('Helmet security headers not found');
      }

      if (content.includes('cors')) {
        this.addSuccess('CORS configuration found');
      } else {
        this.addWarning('CORS configuration not found');
      }

      if (content.includes('rateLimit')) {
        this.addSuccess('Rate limiting configured');
      } else {
        this.addWarning('Rate limiting not configured');
      }

      // Check for Vercel domain support in CORS
      if (content.includes('vercel.app')) {
        this.addSuccess('CORS configured for Vercel domains');
      } else {
        this.addWarning('CORS missing Vercel domain support');
      }

      // Check for Render domain support in CORS
      if (content.includes('onrender.com')) {
        this.addSuccess('CORS configured for Render domains');
      } else {
        this.addWarning('CORS missing Render domain support');
      }
    }

    // Check for environment variable validation
    const envFile = 'backend/src/config/env.ts';
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf8');
      if (content.includes('zod') && content.includes('safeParse')) {
        this.addSuccess('Environment variables validated with Zod');
      } else {
        this.addWarning('Environment variables should be validated with Zod');
      }
    }
  }

  checkRenderVercelIntegration() {
    log.header('Checking Render + Vercel Integration');

    // Check Render configuration
    const renderFile = 'render.yaml';
    if (fs.existsSync(renderFile)) {
      const content = fs.readFileSync(renderFile, 'utf8');
      if (content.includes('cabe-arena-backend')) {
        this.addSuccess('Render backend service configured');
      } else {
        this.addWarning('Render backend service not configured');
      }
      if (content.includes('cabe-arena-frontend')) {
        this.addSuccess('Render frontend service configured');
      } else {
        this.addWarning('Render frontend service not configured');
      }
      if (content.includes('cabe-arena-db')) {
        this.addSuccess('Render database service configured');
      } else {
        this.addWarning('Render database service not configured');
      }
    }

    // Check Vercel configuration
    const vercelFile = 'frontend/vercel.json';
    if (fs.existsSync(vercelFile)) {
      const content = fs.readFileSync(vercelFile, 'utf8');
      if (content.includes('onrender.com')) {
        this.addSuccess('Vercel configured to proxy to Render backend');
      } else {
        this.addWarning('Vercel missing Render backend proxy configuration');
      }
      if (content.includes('Cache-Control')) {
        this.addSuccess('Vercel configured with caching headers');
      } else {
        this.addWarning('Vercel missing caching headers');
      }
    }
  }

  runValidation() {
    log.header('🚀 CaBE Arena Production Validation (Render + Vercel)');
    log.info('Validating project for production deployment...\n');

    this.checkPackageJson();
    this.checkEnvironmentFiles();
    this.checkDeploymentFiles();
    this.checkBackendConfiguration();
    this.checkFrontendConfiguration();
    this.checkSharedConfiguration();
    this.checkSecurityConfiguration();
    this.checkRenderVercelIntegration();

    // Print results
    log.header('📊 Validation Results');

    if (this.successes.length > 0) {
      log.info(`\n${colors.green}Successes (${this.successes.length}):${colors.reset}`);
      this.successes.forEach(success => log.success(success));
    }

    if (this.warnings.length > 0) {
      log.info(`\n${colors.yellow}Warnings (${this.warnings.length}):${colors.reset}`);
      this.warnings.forEach(warning => log.warning(warning));
    }

    if (this.errors.length > 0) {
      log.info(`\n${colors.red}Errors (${this.errors.length}):${colors.reset}`);
      this.errors.forEach(error => log.error(error));
    }

    // Summary
    log.header('📋 Summary');
    log.info(`Total checks: ${this.successes.length + this.warnings.length + this.errors.length}`);
    log.success(`Passed: ${this.successes.length}`);
    log.warning(`Warnings: ${this.warnings.length}`);
    log.error(`Errors: ${this.errors.length}`);

    if (this.errors.length === 0) {
      log.success('\n🎉 Production validation passed! Your project is ready for Render + Vercel deployment.');
      process.exit(0);
    } else {
      log.error('\n❌ Production validation failed. Please fix the errors above before deploying.');
      process.exit(1);
    }
  }
}

// Run validation
const validator = new ProductionValidator();
validator.runValidation();
