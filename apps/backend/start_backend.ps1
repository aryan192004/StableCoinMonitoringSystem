# PowerShell script to start the full backend (Express API + FastAPI ML service)
# Usage: Run from the backend directory: ./start_backend.ps1

Write-Host "Starting Stablecoin Backend Services..." -ForegroundColor Cyan

# Start FastAPI ML service
Start-Process -NoNewWindow -FilePath "python" -ArgumentList "main.py" -WorkingDirectory $PWD
Write-Host "✓ FastAPI ML service started (port 8001)" -ForegroundColor Green

# Start Express API (TypeScript)
Start-Process -NoNewWindow -FilePath "pnpm" -ArgumentList "dev" -WorkingDirectory $PWD
Write-Host "✓ Express API started (port 8000)" -ForegroundColor Green

Write-Host "Backend services are running!"
Write-Host "- FastAPI: http://localhost:8001"
Write-Host "- Express API: http://localhost:8000"
