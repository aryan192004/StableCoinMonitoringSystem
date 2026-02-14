# Test script to verify ML deviation integration
# Tests the complete data flow: ML Service -> TS API -> Frontend

Write-Host "`n=== Testing ML-Enhanced Deviation Metrics ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Python ML Service
Write-Host "Test 1: Python ML Service (Port 8001)" -ForegroundColor Yellow
try {
    $mlResponse = Invoke-WebRequest -Uri "http://localhost:8001/ml/peg-deviation/usdt?period=7" -UseBasicParsing
    $mlData = $mlResponse.Content | ConvertFrom-Json
    
    Write-Host "  ✓ ML Service responding" -ForegroundColor Green
    Write-Host "    - Data points: $($mlData.data_points)"
    Write-Host "    - Max Deviation: $($mlData.metrics.maxDeviation)%"
    Write-Host "    - Avg Deviation: $($mlData.metrics.averageDeviation)%"
    Write-Host "    - Stability Score: $($mlData.metrics.stability)"
    
    if ($mlData.metrics.maxDeviation -gt 0 -and $mlData.metrics.averageDeviation -gt 0) {
        Write-Host "  ✓ Deviation values are non-zero" -ForegroundColor Green
    } 
    else {
        Write-Host "  ✗ WARNING: Deviation values are zero!" -ForegroundColor Red
    }
} 
catch {
    Write-Host "  ✗ ML Service failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: TypeScript API Backend
Write-Host "Test 2: TypeScript API Backend (Port 8000)" -ForegroundColor Yellow
try {
    $apiResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/stablecoins/usdt/peg-history?period=7d" -UseBasicParsing
    $apiData = $apiResponse.Content | ConvertFrom-Json
    
    Write-Host "  ✓ API Backend responding" -ForegroundColor Green
    Write-Host "    - Source: $($apiData.source)"
    Write-Host "    - Data points: $($apiData.data.Count)"
    Write-Host "    - Max Deviation: $($apiData.metrics.maxDeviation)%"
    Write-Host "    - Avg Deviation: $($apiData.metrics.averageDeviation)%"
    
    # Check if using ML service
    if ($apiData.source -eq "ml_service") {
        Write-Host "  ✓ Using ML service (not fallback)" -ForegroundColor Green
    } 
    else {
        Write-Host "  ⚠ Using fallback ($($apiData.source))" -ForegroundColor Yellow
    }
    
    # Check deviation field
    if ($apiData.data[0].deviation -ne $null) {
        Write-Host "  ✓ Data has 'deviation' field" -ForegroundColor Green
    } 
    else {
        Write-Host "  ✗ Data missing 'deviation' field!" -ForegroundColor Red
    }
    
    # Check non-zero values
    if ($apiData.metrics.maxDeviation -gt 0 -and $apiData.metrics.averageDeviation -gt 0) {
        Write-Host "  ✓ Deviation metrics are non-zero" -ForegroundColor Green
    } 
    else {
        Write-Host "  ✗ WARNING: Deviation metrics are zero!" -ForegroundColor Red
    }
} 
catch {
    Write-Host "  ✗ API Backend failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Cache Stats
Write-Host "Test 3: ML Cache Statistics" -ForegroundColor Yellow
try {
    $cacheResponse = Invoke-WebRequest -Uri "http://localhost:8001/ml/cache/stats" -UseBasicParsing
    $cacheData = $cacheResponse.Content | ConvertFrom-Json
    
    Write-Host "  ✓ Cache responding" -ForegroundColor Green
    Write-Host "    - Cached entries: $($cacheData.entries)"
    Write-Host "    - TTL: $($cacheData.ttl_seconds) seconds"
    Write-Host "    - Keys: $($cacheData.keys -join ', ')"
} 
catch {
    Write-Host "  ✗ Cache stats failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "If all tests passed, the UI should now show non-zero Max/Avg Deviation values." -ForegroundColor White
Write-Host "Navigate to: http://localhost:3000/dashboard/stablecoins/usdt" -ForegroundColor White
Write-Host ""
