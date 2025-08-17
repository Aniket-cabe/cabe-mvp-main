# CaBE Arena - Master Test Runner (PowerShell Version)
# This script runs all tests and provides comprehensive reporting

param(
    [switch]$Verbose,
    [switch]$SkipE2E,
    [switch]$SkipPerformance,
    [string]$ReportPath = "test-results"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"
$White = "White"

# Test results tracking
$TestResults = @{
    Total = 0
    Passed = 0
    Failed = 0
    Skipped = 0
    StartTime = Get-Date
    EndTime = $null
    Details = @()
}

# Function to log messages with colors
function Write-TestLog {
    param(
        [string]$Message,
        [string]$Color = $White,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $prefix = switch ($Level) {
        "ERROR" { "[ERROR]" }
        "WARN"  { "[WARN] " }
        "SUCCESS" { "[SUCCESS]" }
        default { "[INFO] " }
    }
    
    Write-Host "$timestamp $prefix $Message" -ForegroundColor $Color
}

# Function to run a test phase
function Invoke-TestPhase {
    param(
        [string]$PhaseName,
        [string]$Command,
        [string]$Description
    )
    
    Write-TestLog "Starting $PhaseName..." $Cyan
    Write-TestLog $Description $White
    
    $TestResults.Total++
    $phaseStart = Get-Date
    
    try {
        $result = Invoke-Expression $Command
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0) {
            Write-TestLog "$PhaseName completed successfully!" $Green "SUCCESS"
            $TestResults.Passed++
            $TestResults.Details += @{
                Phase = $PhaseName
                Status = "PASSED"
                Duration = (Get-Date) - $phaseStart
                ExitCode = $exitCode
            }
        } else {
            Write-TestLog "$PhaseName failed with exit code $exitCode" $Red "ERROR"
            $TestResults.Failed++
            $TestResults.Details += @{
                Phase = $PhaseName
                Status = "FAILED"
                Duration = (Get-Date) - $phaseStart
                ExitCode = $exitCode
            }
        }
    }
    catch {
        Write-TestLog "$PhaseName failed with error: $($_.Exception.Message)" $Red "ERROR"
        $TestResults.Failed++
        $TestResults.Details += @{
            Phase = $PhaseName
            Status = "FAILED"
            Duration = (Get-Date) - $phaseStart
            Error = $_.Exception.Message
        }
    }
    
    Write-Host ""
}

# Function to generate test report
function Write-TestReport {
    $TestResults.EndTime = Get-Date
    $duration = $TestResults.EndTime - $TestResults.StartTime
    
    Write-Host "`n" + "="*80 -ForegroundColor $Blue
    Write-Host "                    CaBE Arena - Test Results Summary" -ForegroundColor $Blue
    Write-Host "="*80 -ForegroundColor $Blue
    
    Write-Host "`nTest Execution Summary:" -ForegroundColor $White
    Write-Host "  Start Time: $($TestResults.StartTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor $White
    Write-Host "  End Time:   $($TestResults.EndTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor $White
    Write-Host "  Duration:   $($duration.ToString('mm\:ss'))" -ForegroundColor $White
    
    Write-Host "`nResults:" -ForegroundColor $White
    Write-Host "  Total Tests:  $($TestResults.Total)" -ForegroundColor $White
    Write-Host "  Passed:       $($TestResults.Passed)" -ForegroundColor $Green
    Write-Host "  Failed:       $($TestResults.Failed)" -ForegroundColor $Red
    Write-Host "  Skipped:      $($TestResults.Skipped)" -ForegroundColor $Yellow
    
    $successRate = if ($TestResults.Total -gt 0) { 
        [math]::Round(($TestResults.Passed / $TestResults.Total) * 100, 2) 
    } else { 0 }
    
    Write-Host "  Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { $Green } elseif ($successRate -ge 70) { $Yellow } else { $Red })
    
    Write-Host "`nDetailed Results:" -ForegroundColor $White
    foreach ($detail in $TestResults.Details) {
        $statusColor = switch ($detail.Status) {
            "PASSED" { $Green }
            "FAILED" { $Red }
            "SKIPPED" { $Yellow }
        }
        
        Write-Host "  $($detail.Phase): $($detail.Status)" -ForegroundColor $statusColor
        if ($detail.Duration) {
            Write-Host "    Duration: $($detail.Duration.ToString('mm\:ss\.fff'))" -ForegroundColor $White
        }
        if ($detail.ExitCode -and $detail.ExitCode -ne 0) {
            Write-Host "    Exit Code: $($detail.ExitCode)" -ForegroundColor $Red
        }
        if ($detail.Error) {
            Write-Host "    Error: $($detail.Error)" -ForegroundColor $Red
        }
    }
    
    # Final verdict
    Write-Host "`nFinal Verdict:" -ForegroundColor $White
    if ($TestResults.Failed -eq 0) {
        Write-Host "  ✅ ALL TESTS PASSED - Ready for deployment!" -ForegroundColor $Green
    } elseif ($TestResults.Failed -le 2) {
        Write-Host "  ⚠️  MINOR ISSUES DETECTED - Review failed tests before deployment" -ForegroundColor $Yellow
    } else {
        Write-Host "  ❌ CRITICAL FAILURES DETECTED - Fix issues before deployment" -ForegroundColor $Red
    }
    
    Write-Host "`n" + "="*80 -ForegroundColor $Blue
}

# Main execution
Write-Host "🚀 CaBE Arena - Comprehensive Test Suite" -ForegroundColor $Cyan
Write-Host "Running on Windows PowerShell" -ForegroundColor $White
Write-Host ""

# Phase 1: Code Quality
Invoke-TestPhase -PhaseName "Code Quality" -Command "npm run format:check" -Description "Checking code formatting with Prettier"
Invoke-TestPhase -PhaseName "Linting" -Command "npm run lint" -Description "Running ESLint checks"
Invoke-TestPhase -PhaseName "Type Check" -Command "npm run type-check" -Description "TypeScript type checking"

# Phase 2: Unit Tests
Invoke-TestPhase -PhaseName "Backend Unit Tests" -Command "npm run test:unit:backend" -Description "Running backend unit tests with Vitest"
Invoke-TestPhase -PhaseName "Frontend Unit Tests" -Command "npm run test:unit:frontend" -Description "Running frontend unit tests with Vitest"

# Phase 3: Integration Tests
Invoke-TestPhase -PhaseName "Backend Integration Tests" -Command "npm run test:integration:backend" -Description "Running backend integration tests"
Invoke-TestPhase -PhaseName "Frontend Integration Tests" -Command "npm run test:integration:frontend" -Description "Running frontend integration tests"

# Phase 4: Security Tests
Invoke-TestPhase -PhaseName "Security Tests" -Command "npm run test:security" -Description "Running security and integrity layer tests"

# Phase 5: Performance Tests
if (-not $SkipPerformance) {
    Invoke-TestPhase -PhaseName "Performance Tests" -Command "npm run test:performance" -Description "Running performance and load tests"
} else {
    Write-TestLog "Skipping Performance Tests (--SkipPerformance flag)" $Yellow "WARN"
    $TestResults.Skipped++
}

# Phase 6: E2E Tests
if (-not $SkipE2E) {
    Invoke-TestPhase -PhaseName "E2E Tests" -Command "npm run test:e2e" -Description "Running end-to-end tests with Cypress"
} else {
    Write-TestLog "Skipping E2E Tests (--SkipE2E flag)" $Yellow "WARN"
    $TestResults.Skipped++
}

# Phase 7: Build Tests
Invoke-TestPhase -PhaseName "Backend Build" -Command "npm run build:backend" -Description "Building backend application"
Invoke-TestPhase -PhaseName "Frontend Build" -Command "npm run build:frontend" -Description "Building frontend application"

# Phase 8: Deployment Validation
Invoke-TestPhase -PhaseName "Deployment Tests" -Command "npm run test:deployment" -Description "Validating deployment configuration"

# Phase 9: Coverage Report
Invoke-TestPhase -PhaseName "Coverage Report" -Command "npm run test:coverage" -Description "Generating test coverage report"

# Phase 10: Smoke Tests
Invoke-TestPhase -PhaseName "Smoke Tests" -Command "npm run test:smoke" -Description "Running smoke tests for critical functionality"

# Generate and display final report
Write-TestReport

# Exit with appropriate code
if ($TestResults.Failed -eq 0) {
    exit 0
} else {
    exit 1
}
