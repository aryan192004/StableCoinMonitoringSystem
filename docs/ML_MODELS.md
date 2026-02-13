# ML Models Documentation

## Overview

The Stablecoin Risk & Liquidity Monitoring System now includes **three machine learning models**:

1. **XGBoost Risk Scoring Model** - Predicts depeg probability
2. **LSTM Liquidity Prediction Model** - Forecasts liquidity across multiple time horizons
3. **Isolation Forest Anomaly Detection Model** - Detects abnormal market conditions

---

## 1. XGBoost Risk Scoring Model

### Purpose

Predicts the probability of a stablecoin depegging using 7 engineered features.

### Location

- Implementation: `apps/backend/services/risk_model.py`
- Trained model: `apps/backend/models/risk_model_v1.pkl`

### Features (7)

1. **Peg Deviation** - Percentage deviation from $1.00
2. **Deviation Duration** - Minutes since deviation exceeded 0.5%
3. **Volatility** - Rolling coefficient of variation (24h)
4. **Liquidity Score** - Normalized order book depth
5. **Orderbook Imbalance** - Bid/ask volume ratio
6. **Cross-Exchange Spread** - Price difference across exchanges
7. **Volume Anomaly Score** - Z-score of current volume

### Output

```python
{
    "risk_score": 72,           # 0-100 integer
    "risk_level": "High",       # Low/Medium/High/Critical
    "depeg_probability": 0.37,  # 0-1 float
    "confidence": 0.89          # 0-1 float
}
```

### Training

- **Dataset**: 10,000 synthetic samples (15% depeg events)
- **Validation**: 2,000 samples
- **Accuracy**: ~85%
- **Inference Time**: <100ms

### Usage

```python
from services.risk_model import RiskScoringModel

model = RiskScoringModel()
features = np.array([[0.5, 10, 0.01, 0.8, -0.2, 0.003, 2.0]])
score, level, prob, conf = model.predict_risk(features)
```

---

## 2. LSTM Liquidity Prediction Model

### Purpose

Forecasts liquidity depth for multiple time horizons using time series data.

### Location

- Implementation: `apps/backend/services/liquidity_model.py`
- Trained model: `apps/backend/models/liquidity_model.pt`
- Scaler: `apps/backend/models/liquidity_model_scaler.pkl`

### Features (5)

1. **Liquidity Depth** - Top 10 order book levels
2. **Order Book Depth** - Top 50 order book levels
3. **Volume** - Current trading volume
4. **Spread** - Cross-exchange spread
5. **Volatility** - Price volatility

### Architecture

- **Model**: LSTM (2 layers, 64 hidden units)
- **Input**: Sequence of 60 timesteps
- **Output**: 4 predictions (1h, 1d, 1w, 1m)
- **Framework**: PyTorch

### Output

```python
{
    "predictions": {
        "1h": 0.85,    # Liquidity in 1 hour
        "1d": 0.82,    # Liquidity in 1 day
        "1w": 0.78,    # Liquidity in 1 week
        "1m": 0.75     # Liquidity in 1 month
    },
    "confidence": 0.87,
    "timestamp": "2026-02-13T10:30:00Z"
}
```

### Training

- **Dataset**: 5,000 synthetic time series samples
- **Validation**: 1,000 samples
- **Loss**: MSE (Mean Squared Error)
- **Epochs**: 50
- **Inference Time**: <500ms

### Usage

```python
from services.liquidity_model import LiquidityPredictionModel

model = LiquidityPredictionModel()
recent_data = np.random.uniform(0.5, 1.5, (60, 5))  # 60 timesteps, 5 features
result = model.predict(recent_data)
```

---

## 3. Isolation Forest Anomaly Detection Model

### Purpose

Detects abnormal market conditions in real-time using unsupervised learning.

### Location

- Implementation: `apps/backend/services/anomaly_model.py`
- Trained model: `apps/backend/models/anomaly_model.pkl`
- Scaler: `apps/backend/models/anomaly_model_scaler.pkl`

### Features (8)

1. **Liquidity Depth** - Current liquidity level
2. **Liquidity Change %** - Percentage change from previous
3. **Volume Z-Score** - Volume deviation from average
4. **Price Change %** - Price movement
5. **Orderbook Imbalance** - Bid/ask imbalance
6. **Cross-Exchange Spread** - Price spread
7. **Volatility Spike** - Volatility measure
8. **Bid-Ask Spread** - Trading spread

### Algorithm

- **Model**: Isolation Forest
- **Contamination**: 0.1 (10% expected anomalies)
- **Estimators**: 100 trees
- **Framework**: scikit-learn

### Output

```python
{
    "anomaly_score": -0.65,        # Lower = more anomalous
    "is_anomaly": true,            # Boolean flag
    "severity": "High",            # Normal/Low/Medium/High
    "alerts": [                    # Detected anomaly types
        {
            "type": "liquidity_drop",
            "severity": "High",
            "message": "Liquidity dropped by 35.0%"
        },
        {
            "type": "volume_spike",
            "severity": "Medium",
            "message": "Volume 4.2σ from average"
        }
    ],
    "confidence": 0.92,
    "timestamp": "2026-02-13T10:30:00Z"
}
```

### Detected Anomaly Types

- **Liquidity Drop** - Sudden decrease in liquidity
- **Low Liquidity** - Below critical threshold
- **Volume Spike** - Abnormal trading volume
- **Whale Activity** - Large trades with price impact
- **Unusual Price Movement** - Significant price changes
- **Orderbook Imbalance** - Strong buy/sell pressure
- **Wide Spread** - Cross-exchange price differences
- **Volatility Spike** - High price volatility
- **Spread Widening** - Bid-ask spread increase

### Training

- **Dataset**: 5,000 "normal" market samples
- **Approach**: Unsupervised (only normal data)
- **Validation**: Tested on synthetic anomalous data
- **Detection Rate**: 80-90% on synthetic anomalies
- **Inference Time**: <200ms

### Usage

```python
from services.anomaly_model import AnomalyDetectionModel

model = AnomalyDetectionModel()
features = np.array([0.15, -0.35, 5.5, 0.045, -0.75, 0.015, 0.08, 0.008])
result = model.detect_anomaly(features)
```

---

## API Endpoints

### Express.js (TypeScript) Routes

#### Liquidity Prediction

```http
GET /api/liquidity/predict/:stablecoin
```

**Response:**

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

#### Anomaly Detection

```http
GET /api/anomalies/:stablecoin
```

**Response:**

```json
{
  "stablecoin": "USDT",
  "anomaly_score": -0.65,
  "is_anomaly": true,
  "severity": "High",
  "alerts": [
    {
      "type": "liquidity_drop",
      "severity": "High",
      "message": "Liquidity dropped by 35.0%"
    }
  ],
  "confidence": 0.92,
  "timestamp": "2026-02-13T10:30:00Z",
  "status": "success"
}
```

### FastAPI (Python) Routes

#### Liquidity Prediction

```http
GET /liquidity/predict/{stablecoin}
```

#### Anomaly Detection

```http
GET /anomalies/{stablecoin}
```

#### Model Status

```http
GET /models/status
```

**Response:**

```json
{
  "risk_model": {
    "type": "XGBoost",
    "version": "v1.0",
    "loaded": true,
    "accuracy": 0.85
  },
  "liquidity_model": {
    "type": "LSTM",
    "version": "v1.0",
    "loaded": true,
    "mae": 0.08
  },
  "anomaly_model": {
    "type": "Isolation Forest",
    "version": "v1.0",
    "loaded": true,
    "precision": 0.82
  }
}
```

---

## Training the Models

### Quick Start

Run the training script:

```powershell
# Windows PowerShell
cd apps/backend
.\train_models.ps1
```

```bash
# Linux/Mac
cd apps/backend
python scripts/train_all_models.py
```

### Manual Training

Train individual models:

```python
# Risk Model
from services.risk_model import train_hackathon_model
model, metrics = train_hackathon_model("models/risk_model_v1.pkl")

# Liquidity Model
from services.liquidity_model import train_liquidity_model
model = train_liquidity_model("models/liquidity_model.pt")

# Anomaly Model
from services.anomaly_model import train_anomaly_model
model = train_anomaly_model("models/anomaly_model.pkl", contamination=0.1)
```

### Dependencies

Install required packages:

```bash
pip install -r requirements.txt
```

**Key dependencies:**

- `xgboost>=2.0.0` - XGBoost model
- `torch>=2.1.0` - PyTorch for LSTM
- `scikit-learn>=1.3.0` - Isolation Forest
- `numpy>=1.24.0` - Numerical computing
- `pandas>=2.0.0` - Data manipulation
- `joblib>=1.3.0` - Model serialization

---

## Frontend Integration

### React Hooks

```typescript
import { useLiquidityPrediction, useAnomalyDetection } from '@/hooks/useData';

function StablecoinDetail({ id }: { id: string }) {
  // Fetch liquidity predictions
  const { prediction, isLoading: predLoading } = useLiquidityPrediction(id);

  // Fetch anomaly detection
  const { anomaly, isLoading: anomLoading } = useAnomalyDetection(id);

  return (
    <div>
      <h2>Liquidity Forecast</h2>
      {prediction && (
        <div>
          <p>1 Hour: {prediction.predictions['1h']}</p>
          <p>1 Day: {prediction.predictions['1d']}</p>
          <p>1 Week: {prediction.predictions['1w']}</p>
          <p>1 Month: {prediction.predictions['1m']}</p>
        </div>
      )}

      <h2>Anomaly Alerts</h2>
      {anomaly?.is_anomaly && (
        <div className="alert alert-danger">
          <p>Severity: {anomaly.severity}</p>
          {anomaly.alerts.map((alert, i) => (
            <p key={i}>{alert.message}</p>
          ))}
        </div>
      )}
    </div>
  );
}
```

### TypeScript Types

All types are defined in `apps/frontend/types/index.ts`:

```typescript
interface LiquidityPrediction {
  stablecoin: string;
  predictions: {
    "1h": number;
    "1d": number;
    "1w": number;
    "1m": number;
  };
  confidence: number;
  timestamp: string;
}

interface AnomalyDetection {
  stablecoin: string;
  anomaly_score: number;
  is_anomaly: boolean;
  severity: "Normal" | "Low" | "Medium" | "High";
  alerts: AnomalyAlert[];
  confidence: number;
  timestamp: string;
}
```

---

## Performance Metrics

| Model            | Training Time | Inference Time | Accuracy/MAE  | Model Size |
| ---------------- | ------------- | -------------- | ------------- | ---------- |
| XGBoost Risk     | ~30s          | <100ms         | 85%           | ~500KB     |
| LSTM Liquidity   | ~5min         | <500ms         | MAE: 0.08     | ~2MB       |
| Isolation Forest | ~10s          | <200ms         | 82% precision | ~300KB     |

---

## Future Enhancements

### Phase 2 Improvements

1. **Real Historical Data**
   - Replace synthetic data with real historical depeg events
   - Train on Terra (UST) collapse data
   - Train on USDC SVB crisis data

2. **Model Retraining Pipeline**
   - Automated retraining on new data
   - A/B testing framework
   - Model versioning and rollback

3. **Advanced Architectures**
   - Graph Neural Networks for cross-asset contagion
   - Transformer models for time series
   - Ensemble methods combining all models

4. **Real-time Streaming**
   - WebSocket inference
   - Live dashboard updates
   - Streaming feature computation

5. **Explainability**
   - SHAP values for feature importance
   - Local explanations for predictions
   - Audit trails for compliance

---

## Troubleshooting

### Common Issues

**Issue: PyTorch not installed**

```bash
pip install torch>=2.1.0
```

**Issue: Model file not found**

```bash
# Train models first
python scripts/train_all_models.py
```

**Issue: API endpoint returns 500 error**

- Check if models are loaded in `main.py`
- Verify model files exist in `models/` directory
- Check Python dependencies are installed

**Issue: Frontend hook not working**

- Verify API endpoints are accessible
- Check CORS settings in FastAPI
- Ensure Express.js routes are registered

---

## References

- **XGBoost Documentation**: https://xgboost.readthedocs.io/
- **PyTorch LSTM Tutorial**: https://pytorch.org/tutorials/beginner/nlp/sequence_models_tutorial.html
- **Isolation Forest Paper**: https://cs.nju.edu.cn/zhouzh/zhouzh.files/publication/icdm08b.pdf
- **Stablecoin Risk Analysis**: https://arxiv.org/abs/2201.01070

---

## Contact & Support

For questions or issues:

- Open an issue in the GitHub repository
- Contact the development team
- Check the main README.md for general setup instructions

---

**Last Updated**: February 13, 2026
**Version**: 1.0.0
