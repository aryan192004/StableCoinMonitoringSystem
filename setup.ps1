#!/usr/bin/env pwsh
# Setup script for Stablecoin Risk Monitoring System
# Run this after cloning the repository

Write-Host "🪙 Stablecoin Risk Monitoring - Setup Script" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check pnpm
Write-Host "Checking pnpm installation..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "✓ pnpm $pnpmVersion found" -ForegroundColor Green
} catch {
    Write-Host "✗ pnpm not found. Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
    Write-Host "✓ pnpm installed" -ForegroundColor Green
}

# Check Python
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "✓ $pythonVersion found" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.9+ from https://www.python.org/" -ForegroundColor Red
    exit 1
}

# Install Node.js dependencies
Write-Host ""
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node.js dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install Node.js dependencies" -ForegroundColor Red
    exit 1
}

# Install Python dependencies
Write-Host ""
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
Set-Location apps/backend

# Create virtual environment if it doesn't exist
if (!(Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment and install dependencies
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1

Write-Host "Installing Python packages..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Python dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install Python dependencies" -ForegroundColor Red
    deactivate
    Set-Location ../..
    exit 1
}

# Check for .env file
Write-Host ""
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Write-Host "Creating .env file template..." -ForegroundColor Yellow
    @"
# API Keys
COINAPI_KEY=your_coinapi_key_here
BINANCE_API_KEY=your_binance_key_here
BINANCE_API_SECRET=your_binance_secret_here

# Server Configuration
API_PORT=8000
PYTHON_ML_PORT=8001
FRONTEND_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit apps/backend/.env and add your CoinAPI key!" -ForegroundColor Yellow
    Write-Host "   Get free API key at: https://www.coinapi.io/" -ForegroundColor Cyan
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

# Train ML model
Write-Host ""
Write-Host "Training XGBoost ML model..." -ForegroundColor Yellow
Write-Host "(This will generate synthetic training data and create the model file)" -ForegroundColor Gray

# Create models directory if it doesn't exist
if (!(Test-Path "models")) {
    New-Item -ItemType Directory -Path "models" | Out-Null
}

python services/risk_model.py
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ ML model trained successfully" -ForegroundColor Green
    Write-Host "  Saved to: apps/backend/models/risk_model_v1.pkl" -ForegroundColor Gray
} else {
    Write-Host "⚠️  ML model training failed (you can retry later)" -ForegroundColor Yellow
}

deactivate
Set-Location ../..

# Build TypeScript packages
Write-Host ""
Write-Host "Building TypeScript packages..." -ForegroundColor Yellow
pnpm build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build completed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Build had some warnings (okay for development)" -ForegroundColor Yellow
}

# Final instructions
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "✓ Setup Complete!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Add your CoinAPI key to apps/backend/.env" -ForegroundColor White
Write-Host "   Get free key: https://www.coinapi.io/" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the services (in 3 separate terminals):" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 1 - Python ML Service:" -ForegroundColor Cyan
Write-Host "   cd apps/backend" -ForegroundColor Gray
Write-Host "   python main.py" -ForegroundColor Gray
Write-Host ""
Write-Host "   Terminal 2 - Express API:" -ForegroundColor Cyan
Write-Host "   cd apps/backend" -ForegroundColor Gray
Write-Host "   pnpm dev" -ForegroundColor Gray
Write-Host ""
Write-Host "   Terminal 3 - Next.js Frontend:" -ForegroundColor Cyan
Write-Host "   cd apps/frontend" -ForegroundColor Gray
Write-Host "   pnpm dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Access the dashboard:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "For more information, see README.md" -ForegroundColor Gray
Write-Host ""
