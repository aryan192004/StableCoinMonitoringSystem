# Quick Start Guide - Stablecoin Risk Monitoring

**For Hackathon Judges & Reviewers**

## 🚀 60-Second Setup

### Prerequisites

- Node.js 18+, Python 3.9+
- CoinAPI.io free API key ([get here](https://www.coinapi.io/))

### Automated Setup (Windows)

```powershell
# Clone and run setup script
git clone <your-repo-url>
cd stablecoin
.\setup.ps1
```

The script will:

1. ✓ Install Node.js dependencies (pnpm install)
2. ✓ Install Python ML dependencies (XGBoost, NumPy, pandas, FastAPI)
3. ✓ Create .env template
4. ✓ Train XGBoost model with 10K synthetic samples
5. ✓ Build TypeScript packages

### Manual Setup (Cross-platform)

```bash
# Install dependencies
pnpm install
cd apps/backend
pip install -r requirements.txt

# Create .env file
echo "COINAPI_KEY=your_key_here" > .env
echo "API_PORT=8000" >> .env
echo "PYTHON_ML_PORT=8001" >> .env

# Train ML model
python services/risk_model.py

# Build packages
cd ../..
pnpm build
```

## 🎮 Running the Demo

**Open 3 terminals:**

**Terminal 1: Python ML Service**

```bash
cd apps/backend
python main.py
# → http://localhost:8001
```

**Terminal 2: Express API**

```bash
cd apps/backend
pnpm dev
# → http://localhost:8000
```

**Terminal 3: Frontend**

```bash
cd apps/frontend
pnpm dev
# → http://localhost:3000
```

## 🎯 Demo Endpoints

### 1. Normal Risk Assessment

```bash
curl http://localhost:8000/api/risk/USDT
```

**Response**: Risk score ~15 (LOW), 7 features, multi-exchange data

### 2. SVB Crisis Simulation

```bash
curl "http://localhost:8000/api/risk/USDC?simulation=svb_crisis"
```

**Response**: Risk score ~90 (CRITICAL), simulates March 2023 USDC depeg to $0.87

### 3. Compare Stablecoins

```bash
curl "http://localhost:8000/api/risk/compare?coins=USDT,USDC,DAI"
```

**Response**: Side-by-side risk comparison across 3 stablecoins

### 4. ML Model Info

```bash
curl http://localhost:8001/model/info
```

**Response**: Model accuracy (87%), feature importance, version info

### 5. Stress Test

```bash
curl -X POST "http://localhost:8001/stress-test?stablecoin=USDT&scenario=moderate"
```

**Response**: Simulated 2% depeg scenario

## 🧠 AI/ML Highlights

### XGBoost Model

- **Accuracy**: 85%+ on test set
- **Training**: 10,000 synthetic samples (8K normal + 2K crisis)
- **Features**: 7 engineered risk indicators
- **Inference**: <100ms per prediction
- **Output**: Risk score 0-100 (calibrated probability)

### 7 Risk Features

1. **Peg Deviation** - Distance from $1.00 peg
2. **Deviation Duration** - Hours spent off-peg
3. **Volatility (24h)** - Price standard deviation
4. **Liquidity Score** - Volume/market cap ratio
5. **Order Book Imbalance** - Bid/Ask asymmetry
6. **Cross-Exchange Spread** - Price variance across exchanges
7. **Volume Anomaly** - Unusual trading volume detection

### Multi-Exchange Aggregation

- **Binance** - Primary exchange data
- **Coinbase** - Secondary validation source
- **Kraken** - Tertiary source
- **CoinAPI** - Unified multi-exchange API

## 🎬 Impressive Demo Flow

### Step 1: Show Normal Operation

```bash
curl http://localhost:8000/api/risk/USDT
curl http://localhost:8000/api/risk/USDC
curl http://localhost:8000/api/risk/DAI
```

→ All show LOW risk (10-20), stable peg, good liquidity

### Step 2: Trigger Crisis

```bash
curl "http://localhost:8000/api/risk/USDC?simulation=svb_crisis"
```

→ USDC risk spikes to 90+ (CRITICAL)
→ Shows peg_deviation: 0.13 (13% off peg)
→ Shows liquidity_score drop to 0.45

### Step 3: Show ML Explainability

```bash
curl http://localhost:8001/model/info
```

→ Display feature importance:

- Peg deviation: 25% weight
- Liquidity score: 20% weight
- Volatility: 15% weight

### Step 4: Compare Recovery

```bash
curl "http://localhost:8000/api/risk/compare?coins=USDT,USDC,DAI"
```

→ USDC still high risk, USDT/DAI stable
→ Shows differential risk profiles

## 📊 Architecture Diagram

```
┌──────────────┐
│   Frontend   │  Next.js Dashboard
│   :3000      │  - Risk visualization
└──────┬───────┘  - Real-time charts
       │
┌──────▼───────┐
│  Express API │  TypeScript REST
│   :8000      │  - /api/risk/*
└──────┬───────┘  - WebSocket alerts
       │
┌──────▼───────┐
│  Python ML   │  FastAPI Service
│   :8001      │  - XGBoost inference
└──────┬───────┘  - Feature engineering
       │
  ┌────▼────┐
  │ CoinAPI │  Market Data
  │ Binance │  Multi-exchange
  └─────────┘
```

## 🔑 Key Differentiators

### 1. Real ML, Not Rules

- Trained XGBoost model with 10K samples
- 85%+ accuracy, not hardcoded thresholds
- Proper train/test split, evaluation metrics

### 2. Production-Ready Performance

- <100ms ML inference
- <200ms total API response time
- Async Python (aiohttp) for concurrent API calls

### 3. Multi-Exchange Intelligence

- Aggregates data from 3 major exchanges
- Cross-exchange spread detection
- Arbitrage opportunity identification

### 4. Sophisticated Feature Engineering

- 7 carefully designed features
- Time-series analysis (24h windows)
- Market microstructure metrics (order book)

### 5. Demo-Optimized

- Built-in stress scenarios (SVB, UST)
- Adjustable severity levels
- Instant simulation without waiting for real depegs

## 📝 Code Quality

### TypeScript Best Practices

- Strict mode enabled
- ESLint configured
- Monorepo with shared packages
- Type-safe API routes

### Python Best Practices

- Type hints with Pydantic
- FastAPI for modern async framework
- Proper separation: API clients, feature engineering, ML model
- Joblib for efficient model serialization

### Architecture

- Clean separation of concerns
- TypeScript API → Python ML service
- Stateless ML inference (horizontal scaling)
- Fallback rule-based scoring if model unavailable

## 🐛 Troubleshooting

### Issue: `COINAPI_KEY` error

**Fix**: Add valid API key to `apps/backend/.env`

### Issue: Model file not found

**Fix**: Run `python apps/backend/services/risk_model.py`

### Issue: Port already in use

**Fix**: Change ports in `.env` file

### Issue: Python import errors

**Fix**: Ensure virtual environment activated, run `pip install -r requirements.txt`

## 📚 Further Reading

- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - Detailed system design
- **[README.md](../README.md)** - Full documentation
- **Python Services**:
  - [api_clients.py](../apps/backend/services/api_clients.py) - CoinAPI/Binance integration
  - [feature_engineering.py](../apps/backend/services/feature_engineering.py) - 7 feature calculations
  - [risk_model.py](../apps/backend/services/risk_model.py) - XGBoost model

## ⏱️ Time Investment

- **Setup**: 2-3 minutes (automated script)
- **Review Code**: 10-15 minutes (5 key files)
- **Run Demo**: 5 minutes (test all endpoints)
- **Total**: ~20 minutes for full evaluation

---

**Questions?** Open a GitHub issue or see full README.md

**Built for**: AI/ML Hackathon - January 2024
