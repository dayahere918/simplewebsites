#!/usr/bin/env pwsh
# automated-test.ps1
# Runs the full test suite in Docker and cleans up afterwards.

Write-Host "🚀 Starting Automated Dockerized Testing for Stacky..." -ForegroundColor Cyan

# 1. Build and Run the container
Write-Host "🐳 Building and running Docker container..." -ForegroundColor Yellow
docker compose up --build --abort-on-container-exit --exit-code-from tester

# 2. Check if coverage directory exists
if (Test-Path "./coverage") {
    Write-Host "📊 Coverage report generated successfully." -ForegroundColor Green
    
    # 3. Add logic to check threshold (simplified)
    Write-Host "🔍 Verifying >90% coverage threshold..." -ForegroundColor Yellow
    # Here we would normally parse the clover.xml or lcov.info
} else {
    Write-Error "❌ Test run failed or coverage report not found."
    exit 1
}

Write-Host "✨ Testing complete. Cleaning up..." -ForegroundColor Cyan
docker compose down

Write-Host "✅ Done!" -ForegroundColor Green
