# Build script for all packages and apps
# Usage: .\scripts\build.ps1

Write-Host "🔨 Building Stablecoin Monitoring Platform..." -ForegroundColor Cyan
Write-Host ""

# Build packages first
Write-Host "📦 Building shared packages..." -ForegroundColor Blue
pnpm --filter "@stablecoin/config" build
pnpm --filter "@stablecoin/types" build
pnpm --filter "@stablecoin/utils" build
pnpm --filter "@stablecoin/ui" build
Write-Host "✓ Packages built successfully" -ForegroundColor Green
Write-Host ""

# Build frontend
Write-Host "🎨 Building frontend..." -ForegroundColor Blue
pnpm --filter "@stablecoin/frontend" build
Write-Host "✓ Frontend built successfully" -ForegroundColor Green
Write-Host ""

# Build backend
Write-Host "⚙️  Building backend..." -ForegroundColor Blue
pnpm --filter "@stablecoin/backend" build
Write-Host "✓ Backend built successfully" -ForegroundColor Green
Write-Host ""

# Build Python services
Write-Host "🐍 Building FastAPI services..." -ForegroundColor Blue
Set-Location apps/backend/services
pip install -r requirements.txt --quiet
Set-Location ../../..
Write-Host "✓ FastAPI services ready" -ForegroundColor Green
Write-Host ""

Write-Host "✅ All builds completed successfully!" -ForegroundColor Green
