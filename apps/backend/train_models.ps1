# Train All ML Models
# PowerShell script to train XGBoost, LSTM, and Isolation Forest models

Write-Host "================================" -ForegroundColor Cyan
Write-Host "ML Models Training Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
Set-Location "$PSScriptRoot\.."

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "✗ Python not found. Please install Python 3.8+." -ForegroundColor Red
    exit 1
}

# Check if required packages are installed
Write-Host ""
Write-Host "Checking Python dependencies..." -ForegroundColor Yellow

$packages = @("numpy", "pandas", "scikit-learn", "xgboost", "torch", "joblib")
$missingPackages = @()

foreach ($package in $packages) {
    $installed = python -c "import $package" 2>&1
    if ($LASTEXITCODE -ne 0) {
        $missingPackages += $package
        Write-Host "✗ $package not installed" -ForegroundColor Red
    } else {
        Write-Host "✓ $package installed" -ForegroundColor Green
    }
}

# Install missing packages if needed
if ($missingPackages.Count -gt 0) {
    Write-Host ""
    Write-Host "Installing missing packages..." -ForegroundColor Yellow
    
    foreach ($package in $missingPackages) {
        Write-Host "Installing $package..." -ForegroundColor Cyan
        pip install $package
    }
}

# Run training script
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Starting Model Training" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

python scripts/train_all_models.py

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host "✓ Training Completed Successfully!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
}
else {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Red
    Write-Host "✗ Training Failed" -ForegroundColor Red
    Write-Host "================================" -ForegroundColor Red
    exit 1
}
