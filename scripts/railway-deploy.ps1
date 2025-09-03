# Railway Deployment Script for Cabe Arena (PowerShell)
# This script automates the Railway deployment process

param(
    [switch]$SkipBuild,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host "Starting Railway deployment for Cabe Arena..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json") -or -not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if (-not $SkipBuild) {
    # Build backend
    Write-Host "Building backend..." -ForegroundColor Yellow
    Set-Location backend
    npm run build
    Set-Location ..
    
    # Build frontend
    Write-Host "Building frontend..." -ForegroundColor Yellow
    Set-Location frontend
    npm run build
    Set-Location ..
    
    # Verify builds
    Write-Host "Verifying builds..." -ForegroundColor Yellow
    if (-not (Test-Path "backend/dist")) {
        Write-Host "Backend build failed - dist directory not found" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Test-Path "frontend/dist")) {
        Write-Host "Frontend build failed - dist directory not found" -ForegroundColor Red
        exit 1
    }
    
            Write-Host "All builds completed successfully!" -ForegroundColor Green
}

# Check for Railway CLI
try {
    $railwayVersion = railway --version 2>$null
    if ($railwayVersion) {
        Write-Host "Railway CLI detected" -ForegroundColor Green
        Write-Host "Current Railway status:" -ForegroundColor Yellow
        try {
            railway status
        } catch {
            Write-Host "No active Railway project" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "Railway CLI not found. Install with: npm install -g @railway/cli" -ForegroundColor Yellow
    Write-Host "Or deploy manually through Railway dashboard" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Railway deployment preparation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Push these changes to your GitHub repository" -ForegroundColor White
Write-Host "2. Connect your repo to Railway (if not already done)" -ForegroundColor White
Write-Host "3. Set environment variables in Railway dashboard" -ForegroundColor White
Write-Host "4. Deploy your services" -ForegroundColor White
Write-Host ""
Write-Host "See RAILWAY-DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
