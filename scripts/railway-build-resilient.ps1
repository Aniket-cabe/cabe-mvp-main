# Railway Resilient Build Script for CaBE Arena (PowerShell)
# Handles network issues and provides fallbacks

param(
    [switch]$SkipInstall
)

Write-Host "Starting Railway resilient build process..." -ForegroundColor Green

# Configure registries for better network handling
Write-Host "Configuring package registries..." -ForegroundColor Yellow
try {
    yarn config set registry https://registry.npmjs.org/ | Out-Null
    Write-Host "Yarn registry configured" -ForegroundColor Green
} catch {
    Write-Host "Yarn registry config failed" -ForegroundColor Yellow
}

try {
    npm config set registry https://registry.npmjs.org/ | Out-Null
    Write-Host "NPM registry configured" -ForegroundColor Green
} catch {
    Write-Host "NPM registry config failed" -ForegroundColor Yellow
}

# Install dependencies if not skipped
if (-not $SkipInstall) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    
    # Try yarn install first, fallback to npm
    try {
        yarn install --network-timeout 300000 --network-concurrency 1
        Write-Host "Yarn install successful" -ForegroundColor Green
    } catch {
        Write-Host "Yarn install failed, trying npm..." -ForegroundColor Yellow
        try {
            npm install
            Write-Host "NPM install successful" -ForegroundColor Green
        } catch {
            Write-Host "Both package managers failed" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "Skipping dependency installation" -ForegroundColor Yellow
}

# Build backend
Write-Host "Building backend..." -ForegroundColor Yellow
try {
    yarn build:backend
    Write-Host "Backend build successful" -ForegroundColor Green
} catch {
    Write-Host "Yarn backend build failed, trying npm..." -ForegroundColor Yellow
    try {
        npm run build:backend
        Write-Host "Backend build successful (npm)" -ForegroundColor Green
    } catch {
        Write-Host "Backend build failed" -ForegroundColor Red
        exit 1
    }
}

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
try {
    yarn build:frontend
    Write-Host "Frontend build successful" -ForegroundColor Green
} catch {
    Write-Host "Yarn frontend build failed, trying npm..." -ForegroundColor Yellow
    try {
        npm run build:frontend
        Write-Host "Frontend build successful (npm)" -ForegroundColor Green
    } catch {
        Write-Host "Frontend build failed" -ForegroundColor Red
        exit 1
    }
}

# Verify builds
Write-Host "Verifying builds..." -ForegroundColor Yellow
if (-not (Test-Path "backend/dist/index.js")) {
    Write-Host "Backend build output not found" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "frontend/dist/index.html")) {
    Write-Host "Frontend build output not found" -ForegroundColor Red
    exit 1
}

Write-Host "All builds completed successfully!" -ForegroundColor Green
Write-Host "Build outputs:" -ForegroundColor Cyan
Write-Host "  Backend: backend/dist/" -ForegroundColor White
Write-Host "  Frontend: frontend/dist/" -ForegroundColor White
