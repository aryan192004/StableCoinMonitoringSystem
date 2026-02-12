# Setup script for local development
# Usage: .\scripts\setup.ps1

Write-Host "🚀 Setting up Stablecoin Monitoring Platform..." -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Blue

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  Node.js not found. Please install Node.js 18+" -ForegroundColor Yellow
    exit 1
}
$nodeVersion = node -v
Write-Host "✓ Node.js $nodeVersion" -ForegroundColor Green

# Check pnpm
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  pnpm not found. Installing..." -ForegroundColor Yellow
    npm install -g pnpm
}
$pnpmVersion = pnpm -v
Write-Host "✓ pnpm $pnpmVersion" -ForegroundColor Green

# Check Python
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  Python not found. Please install Python 3.10+" -ForegroundColor Yellow
    exit 1
}
$pythonVersion = python --version
Write-Host "✓ $pythonVersion" -ForegroundColor Green

# Check Docker
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $dockerVersion = docker --version
    Write-Host "✓ $dockerVersion" -ForegroundColor Green
} else {
    Write-Host "⚠️  Docker not found. Some features may not work." -ForegroundColor Yellow
}

Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
pnpm install
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Setup environment
Write-Host "⚙️  Setting up environment..." -ForegroundColor Blue
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "⚠️  Created .env file. Please configure it with your settings." -ForegroundColor Yellow
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
}
Write-Host ""

# Setup database
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "🐘 Starting PostgreSQL and Redis..." -ForegroundColor Blue
    Set-Location infra/docker
    docker-compose up -d postgres redis
    Set-Location ../..
    
    Write-Host "Waiting for PostgreSQL to be ready..."
    Start-Sleep -Seconds 5
    
    Write-Host "✓ Database services started" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "🔄 Running database migrations..." -ForegroundColor Blue
    Write-Host "⚠️  Manual migration required. See infra/database/README.md" -ForegroundColor Yellow
}
Write-Host ""

# Build packages
Write-Host "🔨 Building packages..." -ForegroundColor Blue
pnpm run build
Write-Host "✓ Build completed" -ForegroundColor Green
Write-Host ""

Write-Host "✅ Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Blue
Write-Host "1. Configure .env file with your API keys"
Write-Host "2. Run migrations: pnpm --filter @stablecoin/backend migrate"
Write-Host "3. Start development: pnpm run dev"
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Blue
Write-Host "  pnpm run dev         - Start all services"
Write-Host "  pnpm run build       - Build all packages"
Write-Host "  pnpm run test        - Run tests"
Write-Host "  docker-compose up -d - Start Docker services"
