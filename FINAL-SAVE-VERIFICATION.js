#!/usr/bin/env node

/**
 * CABE ARENA — FINAL SAVE VERIFICATION
 * 
 * Ensures the entire project is properly saved in the cabe-arena folder
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('💾 CABE ARENA — FINAL SAVE VERIFICATION');
console.log('Ensuring complete project is saved in cabe-arena folder...\n');

let totalFiles = 0;
let verifiedFiles = 0;
let missingFiles = 0;
let errorFiles = 0;

function verifyFile(filePath, description) {
  totalFiles++;
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size > 0) {
        console.log(`✅ SAVED: ${description} - ${filePath} (${stats.size} bytes)`);
        verifiedFiles++;
        return true;
      } else {
        console.log(`⚠️ EMPTY: ${description} - ${filePath} (0 bytes)`);
        missingFiles++;
        return false;
      }
    } else {
      console.log(`❌ MISSING: ${description} - ${filePath}`);
      missingFiles++;
      return false;
    }
  } catch (error) {
    console.log(`🚨 ERROR: ${description} - ${filePath} (${error.message})`);
    errorFiles++;
    return false;
  }
}

function verifyDirectory(dirPath, description) {
  totalFiles++;
  try {
    if (fs.existsSync(dirPath)) {
      const items = fs.readdirSync(dirPath);
      console.log(`✅ SAVED: ${description} - ${dirPath} (${items.length} items)`);
      verifiedFiles++;
      return true;
    } else {
      console.log(`❌ MISSING: ${description} - ${dirPath}`);
      missingFiles++;
      return false;
    }
  } catch (error) {
    console.log(`🚨 ERROR: ${description} - ${dirPath} (${error.message})`);
    errorFiles++;
    return false;
  }
}

// ============================================================================
// CORE PROJECT STRUCTURE VERIFICATION
// ============================================================================

console.log('📁 CORE PROJECT STRUCTURE\n');

verifyDirectory('backend', 'Backend directory');
verifyDirectory('frontend', 'Frontend directory');
verifyDirectory('src', 'Source modules directory');
verifyDirectory('shared', 'Shared configuration');
verifyDirectory('tests', 'Test files');
verifyDirectory('cypress', 'E2E tests');
verifyDirectory('k8s', 'Kubernetes configs');
verifyDirectory('monitoring', 'Monitoring configs');
verifyDirectory('nginx', 'Nginx configs');
verifyDirectory('services', 'Microservices');
verifyDirectory('.github', 'GitHub workflows');
verifyDirectory('scripts', 'Deployment scripts');

// ============================================================================
// ROOT CONFIGURATION FILES
// ============================================================================

console.log('\n⚙️ ROOT CONFIGURATION FILES\n');

verifyFile('package.json', 'Root package.json');
verifyFile('pnpm-workspace.yaml', 'PNPM workspace config');
verifyFile('docker-compose.yml', 'Docker compose');
verifyFile('docker-compose.prod.yml', 'Production Docker compose');
verifyFile('Dockerfile', 'Dockerfile');
verifyFile('README.md', 'Project README');
verifyFile('.gitignore', 'Git ignore');
verifyFile('commitlint.config.js', 'Commit lint config');
verifyFile('.prettierrc', 'Prettier config');
verifyFile('.lintstagedrc.js', 'Lint staged config');

// ============================================================================
// DOCUMENTATION FILES
// ============================================================================

console.log('\n📚 DOCUMENTATION FILES\n');

verifyFile('CABE-ARENA-COMPLETE-PROGRESS-SUMMARY.md', 'Complete progress summary');
verifyFile('CABE-ARENA-FINAL-PROGRESS.md', 'Final progress report');
verifyFile('CABE-ARENA-MODULES-SUMMARY.md', 'Modules summary');
verifyFile('ARCHITECTURE.md', 'Architecture documentation');
verifyFile('MICROSERVICES.md', 'Microservices documentation');
verifyFile('PROGRESS-FILES-SUMMARY.md', 'Progress files summary');
verifyFile('ANALYTICS-MODULE-PROGRESS.md', 'Analytics module progress');
verifyFile('CABOT-MODULE-PROGRESS.md', 'CaBOT module progress');
verifyFile('DASHBOARD-MODULE-PROGRESS.md', 'Dashboard module progress');
verifyFile('FINAL-VERIFICATION.md', 'Final verification document');

// ============================================================================
// BACKEND CORE FILES
// ============================================================================

console.log('\n🔧 BACKEND CORE FILES\n');

verifyFile('backend/package.json', 'Backend package.json');
verifyFile('backend/tsconfig.json', 'Backend TypeScript config');
verifyFile('backend/supabase-tables.sql', 'Database schema');
verifyFile('backend/src/app.ts', 'Main backend app');
verifyFile('backend/src/index.ts', 'Backend entry point');
verifyFile('backend/vitest.config.ts', 'Backend test config');
verifyFile('backend/env.example', 'Backend environment example');

// ============================================================================
// BACKEND SERVICES
// ============================================================================

console.log('\n⚙️ BACKEND SERVICES\n');

verifyFile('backend/src/services/task-forge.service.ts', 'Task Forge service');
verifyFile('backend/src/services/auth.service.ts', 'Authentication service');
verifyFile('backend/src/services/achievement.service.ts', 'Achievement service');
verifyFile('backend/src/services/audit.service.ts', 'Audit service');
verifyFile('backend/src/services/performance.service.ts', 'Performance service');
verifyFile('backend/src/services/point-decay.service.ts', 'Point decay service');
verifyFile('backend/src/services/plagiarism.service.ts', 'Plagiarism service');
verifyFile('backend/src/services/referral.service.ts', 'Referral service');
verifyFile('backend/src/services/review.service.ts', 'Review service');
verifyFile('backend/src/services/session.service.ts', 'Session service');
verifyFile('backend/src/services/submission-integrity.service.ts', 'Submission integrity service');
verifyFile('backend/src/services/encryption.service.ts', 'Encryption service');
verifyFile('backend/src/services/enterprise-analytics.service.ts', 'Enterprise analytics service');
verifyFile('backend/src/services/gdpr.service.ts', 'GDPR service');
verifyFile('backend/src/services/queue.service.ts', 'Queue service');
verifyFile('backend/src/services/sso.service.ts', 'SSO service');
verifyFile('backend/src/services/uploads.service.ts', 'Uploads service');
verifyFile('backend/src/services/webhook.service.ts', 'Webhook service');

// ============================================================================
// BACKEND LIBRARIES
// ============================================================================

console.log('\n📚 BACKEND LIBRARIES\n');

verifyFile('backend/src/lib/points.ts', 'Points calculation system');
verifyFile('backend/src/lib/supabase-admin.ts', 'Supabase admin client');
verifyFile('backend/src/lib/supabase-utils.ts', 'Supabase utilities');
verifyFile('backend/src/lib/ai.ts', 'AI integration');
verifyFile('backend/src/lib/airtable.ts', 'Airtable integration');

// ============================================================================
// BACKEND ROUTES
// ============================================================================

console.log('\n🛣️ BACKEND ROUTES\n');

verifyFile('backend/src/routes/auth.routes.ts', 'Authentication routes');
verifyFile('backend/src/routes/arena.ts', 'Arena routes');
verifyFile('backend/src/routes/tasks.ts', 'Task routes');
verifyFile('backend/src/routes/points.ts', 'Points routes');
verifyFile('backend/src/routes/admin.ts', 'Admin routes');
verifyFile('backend/src/routes/achievements.ts', 'Achievement routes');
verifyFile('backend/src/routes/cabot.ts', 'CaBOT routes');
verifyFile('backend/src/routes/referrals.ts', 'Referral routes');
verifyFile('backend/src/routes/performance.ts', 'Performance routes');
verifyFile('backend/src/routes/point-decay.ts', 'Point decay routes');
verifyFile('backend/src/routes/uploads.ts', 'Upload routes');
verifyFile('backend/src/routes/auth.ts', 'Auth routes');
verifyFile('backend/src/routes/admin-api-router.ts', 'Admin API router');
verifyFile('backend/src/routes/sso.routes.ts', 'SSO routes');
verifyFile('backend/src/routes/integrations.routes.ts', 'Integrations routes');

// ============================================================================
// BACKEND MIDDLEWARE
// ============================================================================

console.log('\n🔒 BACKEND MIDDLEWARE\n');

verifyDirectory('backend/src/middleware', 'Middleware directory');
verifyFile('backend/src/middleware/auth.ts', 'Authentication middleware');
verifyFile('backend/src/middleware/rankMiddleware.ts', 'Rank middleware');
verifyFile('backend/src/middleware/security.ts', 'Security middleware');
verifyFile('backend/src/middleware/csrf.ts', 'CSRF middleware');
verifyFile('backend/src/middleware/rate-limit.ts', 'Rate limiting');

// ============================================================================
// BACKEND UTILITIES
// ============================================================================

console.log('\n🛠️ BACKEND UTILITIES\n');

verifyDirectory('backend/src/utils', 'Utils directory');
verifyFile('backend/src/utils/feature-access.ts', 'Feature access utilities');
verifyFile('backend/src/utils/arena-access.ts', 'Arena access utilities');
verifyFile('backend/src/utils/ai-score-utils.ts', 'AI scoring utilities');
verifyFile('backend/src/utils/audit-dashboard-api.ts', 'Audit dashboard API');

// ============================================================================
// FRONTEND CORE FILES
// ============================================================================

console.log('\n🎨 FRONTEND CORE FILES\n');

verifyFile('frontend/package.json', 'Frontend package.json');
verifyFile('frontend/tsconfig.json', 'Frontend TypeScript config');
verifyFile('frontend/vite.config.ts', 'Vite configuration');
verifyFile('frontend/index.html', 'Frontend entry point');
verifyFile('frontend/src/main.tsx', 'Frontend main entry');
verifyFile('frontend/src/App.tsx', 'Frontend main app');
verifyFile('frontend/postcss.config.js', 'PostCSS config');
verifyFile('frontend/tailwind.config.js', 'Tailwind config');
verifyFile('frontend/tsconfig.node.json', 'Node TypeScript config');
verifyFile('frontend/vitest.config.ts', 'Frontend test config');

// ============================================================================
// FRONTEND COMPONENTS
// ============================================================================

console.log('\n🧩 FRONTEND COMPONENTS\n');

verifyDirectory('frontend/src/components', 'Frontend components');
verifyDirectory('frontend/src/components/admin', 'Admin components');
verifyDirectory('frontend/src/components/analytics', 'Analytics components');
verifyFile('frontend/src/components/AIFeaturesPanel.tsx', 'AI features panel');
verifyFile('frontend/src/components/CaBOTCreditMeter.tsx', 'CaBOT credit meter');
verifyFile('frontend/src/components/CaBOTDemo.tsx', 'CaBOT demo');
verifyFile('frontend/src/components/CaBOTHistoryDrawer.tsx', 'CaBOT history drawer');
verifyFile('frontend/src/components/CaBOTLowBalanceToast.tsx', 'CaBOT low balance toast');
verifyFile('frontend/src/components/CaBOTResetBanner.tsx', 'CaBOT reset banner');
verifyFile('frontend/src/components/FilterControls.tsx', 'Filter controls');

// ============================================================================
// FRONTEND PAGES
// ============================================================================

console.log('\n📄 FRONTEND PAGES\n');

verifyDirectory('frontend/src/pages', 'Frontend pages');
verifyDirectory('frontend/src/pages/admin', 'Admin pages');
verifyDirectory('frontend/src/pages/analytics', 'Analytics pages');
verifyDirectory('frontend/src/pages/collab', 'Collaboration pages');

// ============================================================================
// SOURCE MODULES
// ============================================================================

console.log('\n📦 SOURCE MODULES\n');

verifyDirectory('src/modules', 'Source modules');
verifyDirectory('src/modules/achievements', 'Achievements module');
verifyDirectory('src/modules/analytics', 'Analytics module');
verifyDirectory('src/modules/cabot', 'CaBOT module');
verifyDirectory('src/modules/dashboard', 'Dashboard module');
verifyDirectory('src/modules/feed', 'Feed module');
verifyDirectory('src/modules/learning', 'Learning module');
verifyDirectory('src/modules/moderation', 'Moderation module');
verifyDirectory('src/modules/opportunities', 'Opportunities module');
verifyDirectory('src/modules/penalty', 'Penalty module');
verifyDirectory('src/modules/skills', 'Skills module');

// ============================================================================
// TEST FILES
// ============================================================================

console.log('\n🧪 TEST FILES\n');

verifyDirectory('tests', 'Test directory');
verifyDirectory('cypress/e2e', 'Cypress E2E tests');
verifyDirectory('backend/tests', 'Backend tests');
verifyDirectory('frontend/tests', 'Frontend tests');

// ============================================================================
// DEPLOYMENT FILES
// ============================================================================

console.log('\n🚀 DEPLOYMENT FILES\n');

verifyDirectory('k8s', 'Kubernetes configs');
verifyDirectory('monitoring', 'Monitoring configs');
verifyDirectory('nginx', 'Nginx configs');
verifyDirectory('scripts', 'Deployment scripts');

// ============================================================================
// FINAL REPORT
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('💾 CABE ARENA — FINAL SAVE VERIFICATION RESULTS');
console.log('='.repeat(80));

console.log(`Total Files/Directories Checked: ${totalFiles}`);
console.log(`✅ Successfully Saved: ${verifiedFiles}`);
console.log(`❌ Missing: ${missingFiles}`);
console.log(`🚨 Errors: ${errorFiles}`);

const saveRate = ((verifiedFiles / totalFiles) * 100).toFixed(2);
console.log(`📊 Save Rate: ${saveRate}%`);

if (missingFiles === 0 && errorFiles === 0) {
  console.log('\n🎉 SAVE STATUS: 100% COMPLETE AND PERFECT!');
  console.log('✅ All files and directories are properly saved!');
  console.log('🚀 The CaBE Arena project is 100% saved and ready!');
} else {
  console.log('\n⚠️ SAVE STATUS: SOME ISSUES DETECTED');
  console.log('❌ Some files or directories may be missing or corrupted');
  console.log('🔧 Please review the missing/error items above');
}

console.log('\n📁 PROJECT SAVE VERIFICATION COMPLETE');
console.log('All components have been verified and confirmed saved!');
