# Quick Start Guide: ML Models

This guide will help you quickly set up and use the new Liquidity Prediction and Anomaly Detection models.

---

## Step 1: Install Dependencies

### Python Dependencies

```powershell
# Navigate to backend directory
cd apps/backend

# Install Python packages
pip install -r requirements.txt
```

**Key packages installed:**

- `torch` - PyTorch for LSTM
- `scikit-learn` - Isolation Forest
- `xgboost` - Risk scoring
- `numpy`, `pandas` - Data processing

---

## Step 2: Train the Models

### Option A: Automated Training (Recommended)

```powershell
# Windows PowerShell
cd apps/backend
.\train_models.ps1
```

This will:

1. Check Python dependencies
2. Install missing packages
3. Train all three models
4. Save models to `apps/backend/models/`

**Expected output:**

```
================================
ML Models Training Script
================================

✓ Python found: Python 3.11.0
✓ numpy installed
✓ pandas installed
✓ scikit-learn installed
✓ xgboost installed
✓ torch installed
✓ joblib installed

================================
Starting Model Training
================================

Training XGBoost Risk Model...
✅ Risk model training completed!

Training LSTM Liquidity Model...
✅ Liquidity model training completed!

Training Isolation Forest Anomaly Model...
✅ Anomaly model training completed!
```

### Option B: Manual Training

```python
# Train individual models
cd apps/backend

# Risk Model
python -c "from services.risk_model import train_hackathon_model; train_hackathon_model()"

# Liquidity Model
python -c "from services.liquidity_model import train_liquidity_model; train_liquidity_model()"

# Anomaly Model
python -c "from services.anomaly_model import train_anomaly_model; train_anomaly_model()"
```

---

## Step 3: Verify Models

Check that models were created:

```powershell
# List model files
Get-ChildItem apps/backend/models/
```

**Expected files:**

```
risk_model_v1.pkl           (~500 KB)
liquidity_model.pt          (~2 MB)
liquidity_model_scaler.pkl  (~10 KB)
anomaly_model.pkl           (~300 KB)
anomaly_model_scaler.pkl    (~5 KB)
```

---

## Step 4: Test the Models

### Test Python Models Directly

```python
# Navigate to services directory
cd apps/backend/services

# Test Risk Model
python risk_model.py

# Test Liquidity Model
python liquidity_model.py

# Test Anomaly Model
python anomaly_model.py
```

### Test API Endpoints

#### Start FastAPI Service

```powershell
cd apps/backend
python main.py
```

Server starts at: `http://localhost:8001`

#### Test Endpoints

```powershell
# Test liquidity prediction
Invoke-WebRequest http://localhost:8001/liquidity/predict/USDT -UseBasicParsing | Select-Object -ExpandProperty Content

# Test anomaly detection
Invoke-WebRequest http://localhost:8001/anomalies/USDT -UseBasicParsing | Select-Object -ExpandProperty Content

# Check model status
Invoke-WebRequest http://localhost:8001/models/status -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Expected Response (Liquidity Prediction):**

```json
{
  "stablecoin": "USDT",
  "predictions": {
    "1h": 0.85,
    "1d": 0.82,
    "1w": 0.78,
    "1m": 0.75
  },
  "confidence": 0.87,
  "timestamp": "2026-02-13T10:30:00Z",
  "status": "success"
}
```

---

## Step 5: Integrate with Frontend

### Update API Client (if needed)

The frontend already has hooks for the new endpoints. To use them:

```typescript
import { useLiquidityPrediction, useAnomalyDetection } from '@/hooks/useData';

function MyComponent() {
  const { prediction } = useLiquidityPrediction('USDT');
  const { anomaly } = useAnomalyDetection('USDT');

  return (
    <div>
      {prediction && (
        <div>
          <h3>Liquidity Forecast</h3>
          <p>1 Hour: {prediction.predictions['1h']}</p>
          <p>1 Day: {prediction.predictions['1d']}</p>
        </div>
      )}

      {anomaly?.is_anomaly && (
        <div className="alert alert-danger">
          <h3>⚠️ Anomaly Detected</h3>
          <p>Severity: {anomaly.severity}</p>
          {anomaly.alerts.map((alert, i) => (
            <div key={i}>
              <strong>{alert.type}</strong>: {alert.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Step 6: Run Full System

### Start All Services

```powershell
# Terminal 1: Start Express.js backend
cd d:\stablecoin
npm start

# Terminal 2: Start FastAPI Python service
cd apps\backend
python main.py

# Terminal 3: Start Frontend
cd apps\frontend
npm run dev
```

### Access Dashboard

Open browser to: `http://localhost:3000/dashboard`

---

## Common Commands

### Training

```powershell
# Train all models
cd apps/backend
.\train_models.ps1

# Train specific model
python -c "from services.liquidity_model import train_liquidity_model; train_liquidity_model()"
```

### Testing

```powershell
# Test Python models
python services/liquidity_model.py
python services/anomaly_model.py

# Test API
Invoke-WebRequest http://localhost:8001/liquidity/predict/USDT
```

### Development

```powershell
# Install dependencies
pip install -r requirements.txt

# Run FastAPI with auto-reload
uvicorn main:app --reload --port 8001
```

---

## Troubleshooting

### Issue: "Module not found"

```powershell
# Install missing dependencies
pip install torch scikit-learn xgboost
```

### Issue: "Model file not found"

```powershell
# Train models first
cd apps/backend
.\train_models.ps1
```

### Issue: "API returns 500 error"

1. Check if Python service is running:

   ```powershell
   # Check if port 8001 is in use
   netstat -ano | findstr :8001
   ```

2. Check model files exist:

   ```powershell
   Get-ChildItem apps/backend/models/
   ```

3. Check logs in FastAPI terminal

### Issue: "Frontend hook returns undefined"

1. Verify API endpoints:

   ```powershell
   Invoke-WebRequest http://localhost:8001/liquidity/predict/USDT
   ```

2. Check browser console for CORS errors

3. Verify Express.js routes are registered

---

## Next Steps

1. **Customize Models**: Adjust hyperparameters in model files
2. **Add Real Data**: Replace synthetic training data with historical data
3. **Dashboard Integration**: Add liquidity forecast and anomaly alert components
4. **Monitoring**: Set up model performance tracking
5. **Deployment**: Deploy models to production environment

---

## Resources

- **Full Documentation**: [docs/ML_MODELS.md](./ML_MODELS.md)
- **Architecture**: [ARCHITECTURE.md](../ARCHITECTURE.md)
- **API Documentation**: [docs/api/README.md](./api/README.md)

---

**Quick Help:**

- Models not training? Check Python version (requires 3.8+)
- API not responding? Ensure FastAPI is running on port 8001
- Frontend errors? Check that Express.js backend is running

**Need Help?** Open an issue in the repository or check the troubleshooting section above.
