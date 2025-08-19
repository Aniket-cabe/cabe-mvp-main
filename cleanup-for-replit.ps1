# Cabe Arena - Replit Cleanup Script
# Removes unnecessary files to get under 500MB limit

Write-Host "🧹 Starting Cabe Arena Repository Cleanup for Replit..." -ForegroundColor Green

# 1. Remove redundant documentation files
Write-Host "📄 Removing redundant documentation files..." -ForegroundColor Yellow
$docsToRemove = @(
    "COMPREHENSIVE-TESTING-SUITE-SAVED.md",
    "FINAL-YARN-REMOVAL-SUMMARY.md", 
    "FINAL-REPLIT-ASSESSMENT.md",
    "REPLIT_DEPLOYMENT_GUIDE.md",
    "REPLIT_COMPATIBILITY_CONVERSION_COMPLETE.md",
    "YARN_TO_NPM_CONVERSION_COMPLETE.md",
    "REPLIT_CONVERSION_SUMMARY.md",
    "FINAL_REPORT.md",
    "TESTING-SUITE-SUMMARY.md",
    "TESTING-SUITE-README.md",
    "FINAL-SAVE-SUMMARY.md",
    "FINAL-100-PERCENT-READINESS-REPORT.md",
    "COMPREHENSIVE-DEPLOYMENT-AUDIT-REPORT.md",
    "FINAL-DEPLOYMENT-SUMMARY.md",
    "PRODUCTION-READINESS-SUMMARY.md",
    "AUDIT_REPORT.md",
    "GITHUB-README.md",
    "CABE-ARENA-COMPLETE-PROGRESS-SUMMARY.md",
    "PROGRESS-FILES-SUMMARY.md",
    "MICROSERVICES.md",
    "DASHBOARD-MODULE-PROGRESS.md",
    "CABOT-MODULE-PROGRESS.md",
    "CABE-ARENA-MODULES-SUMMARY.md",
    "CABE-ARENA-FINAL-PROGRESS.md",
    "ARCHITECTURE.md",
    "ANALYTICS-MODULE-PROGRESS.md",
    "REPLIT_COMPAT_CHECKLIST.md",
    "RENDER_REDIS_SETUP.md",
    "DEPLOYMENT.md",
    "FINAL-SAVE-VERIFICATION.md",
    "FINAL-VERIFICATION.md",
    "PROJECT-COMPLETION-SUMMARY.md",
    "INVENTORY.md"
)

foreach ($doc in $docsToRemove) {
    if (Test-Path $doc) {
        Remove-Item $doc -Force
        Write-Host "  ✅ Removed: $doc" -ForegroundColor Green
    }
}

# 2. Remove build artifacts
Write-Host "🔨 Removing build artifacts..." -ForegroundColor Yellow
if (Test-Path "backend/dist") {
    Remove-Item "backend/dist" -Recurse -Force
    Write-Host "  ✅ Removed: backend/dist" -ForegroundColor Green
}

if (Test-Path "frontend/dist") {
    Remove-Item "frontend/dist" -Recurse -Force
    Write-Host "  ✅ Removed: frontend/dist" -ForegroundColor Green
}

# 3. Remove test coverage and reports
Write-Host "📊 Removing test coverage and reports..." -ForegroundColor Yellow
$coverageDirs = @(
    ".nyc_output",
    "coverage",
    "cabe-arena-audit-reports"
)

foreach ($dir in $coverageDirs) {
    if (Test-Path $dir) {
        Remove-Item $dir -Recurse -Force
        Write-Host "  ✅ Removed: $dir" -ForegroundColor Green
    }
}

# 4. Remove large JavaScript files (audit reports)
Write-Host "📝 Removing large audit JavaScript files..." -ForegroundColor Yellow
$jsFilesToRemove = @(
    "COMPREHENSIVE-FINAL-AUDIT.js",
    "COMPREHENSIVE-SYSTEM-CHECK.js",
    "FINAL-SAVE-VERIFICATION.js"
)

foreach ($file in $jsFilesToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✅ Removed: $file" -ForegroundColor Green
    }
}

# 5. Remove temporary and log files
Write-Host "🗑️ Removing temporary and log files..." -ForegroundColor Yellow
Get-ChildItem -Recurse -File | Where-Object {$_.Name -like "*.log" -or $_.Name -like "*.temp" -or $_.Name -like "*.tmp"} | Remove-Item -Force

# 6. Remove backup files
Write-Host "💾 Removing backup files..." -ForegroundColor Yellow
if (Test-Path ".backup_locks") {
    Remove-Item ".backup_locks" -Recurse -Force
    Write-Host "  ✅ Removed: .backup_locks" -ForegroundColor Green
}

# 7. Remove unnecessary directories
Write-Host "📁 Removing unnecessary directories..." -ForegroundColor Yellow
$dirsToRemove = @(
    "tools",
    "monitoring",
    "k8s",
    "nginx",
    "services",
    "src",
    ".deliverables"
)

foreach ($dir in $dirsToRemove) {
    if (Test-Path $dir) {
        Remove-Item $dir -Recurse -Force
        Write-Host "  ✅ Removed: $dir" -ForegroundColor Green
    }
}

# 8. Remove unnecessary files
Write-Host "📄 Removing unnecessary files..." -ForegroundColor Yellow
$filesToRemove = @(
    "tatus",
    "criptsvalidate-production.sh",
    "quick_fixes.sh",
    "audit_report.json",
    "replit-compat-summary.json",
    "enterprise_scaling_changes.log",
    "future_feature_updates.log"
)

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✅ Removed: $file" -ForegroundColor Green
    }
}

# 9. Clean Git history
Write-Host "🧹 Cleaning Git history..." -ForegroundColor Yellow
git gc --aggressive --prune=now

# 10. Calculate new size
Write-Host "📏 Calculating new repository size..." -ForegroundColor Yellow
$newSize = Get-ChildItem -Recurse -File | Where-Object {$_.FullName -notlike "*node_modules*"} | Measure-Object -Property Length -Sum | Select-Object @{Name="Size(MB)";Expression={[math]::Round($_.Sum/1MB,2)}}

Write-Host "🎉 Cleanup Complete!" -ForegroundColor Green
Write-Host "📊 New repository size: $($newSize.'Size(MB)') MB" -ForegroundColor Cyan

if ($newSize.'Size(MB)' -lt 500) {
    Write-Host "✅ SUCCESS: Repository is now under 500MB limit!" -ForegroundColor Green
} else {
    Write-Host "⚠️ WARNING: Repository still over 500MB limit" -ForegroundColor Yellow
}

Write-Host "🚀 Ready for Replit deployment!" -ForegroundColor Green
