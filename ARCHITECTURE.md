# Stablecoin Risk & Liquidity Monitoring System - Architecture

## 🎯 System Overview

AI-powered real-time risk assessment system that monitors stablecoin peg stability, liquidity depth, and predicts depeg probability using multi-exchange data aggregation and machine learning.

---

## 📊 API Endpoint Mapping

### 1. **Peg Deviation Calculation**

```
CoinAPI: GET /v1/exchangerate/:asset_id_base/:asset_id_quote
- USDT/USD, USDC/USD, DAI/USD, BUSD/USD
- Frequency: Every 10 seconds
- Formula: (current_price - 1.0) / 1.0 * 100
```

### 2. **Multi-Exchange Price Comparison**

```
CoinAPI: GET /v1/symbols/map/:exchange_id
- Map symbols across BINANCE, COINBASE, KRAKEN
- Get normalized symbol IDs

CoinAPI: GET /v1/exchangerate/:asset_id_base/:asset_id_quote
- Fetch prices from all 3 exchanges simultaneously
- Calculate cross-exchange spread
```

### 3. **Order Book Liquidity Depth**

```
CoinAPI: GET /v1/orderbooks/:symbol_id/depth/current
Binance: GET /api/v3/depth?symbol=USDTUSDC&limit=100

- Sum bid/ask volumes at multiple price levels
- Calculate depth at 0.1%, 0.5%, 1% from mid-price
```

### 4. **Bid/Ask Imbalance**

```
CoinAPI: GET /v1/orderbooks/:symbol_id/current

Formula:
imbalance = (Σ bid_volumes - Σ ask_volumes) / (Σ bid_volumes + Σ ask_volumes)
Range: [-1, +1] where -1 = all sells, +1 = all buys
```

### 5. **Spread Calculation**

```
From order book data:
spread = (best_ask - best_bid) / mid_price * 100
```

### 6. **Volatility Computation**

```
CoinAPI: GET /v1/ohlcv/:symbol_id/history?period_id=1MIN&limit=1440

volatility = σ(prices[-24h]) / μ(prices[-24h])
rolling_volatility = std(prices, window=60min)
```

### 7. **Volume Spike Detection**

```
CoinAPI: GET /v1/ohlcv/:symbol_id/history

volume_zscore = (current_volume - μ_24h) / σ_24h
anomaly = volume_zscore > 3.0 (3-sigma threshold)
```

---

## 🧮 Feature Engineering Formulas

### Core Features (7 features)

#### 1. Peg Deviation %

```python
peg_deviation = ((current_price - 1.0) / 1.0) * 100
# Range: typically [-2%, +2%], crisis > 5%
```

#### 2. Deviation Duration (minutes)

```python
deviation_duration = minutes_since(abs(peg_deviation) > 0.5%)
# Exponential decay: longer duration = higher risk
```

#### 3. Volatility Score (Rolling Std)

```python
prices_24h = get_ohlcv_history(period='1MIN', limit=1440)
volatility = np.std(prices_24h) / np.mean(prices_24h)
# Normalized: 0.001 = low, 0.02 = high
```

#### 4. Liquidity Depth Score

```python
bid_depth = sum(orderbook['bids'][:10]['volume'])
ask_depth = sum(orderbook['asks'][:10]['volume'])
total_depth = bid_depth + ask_depth

# Normalize by market cap
liquidity_score = total_depth / (market_cap * 0.01)
# 1.0 = healthy, 0.3 = stressed, <0.1 = critical
```

#### 5. Order Book Imbalance

```python
bid_volume = sum(orderbook['bids']['volume'])
ask_volume = sum(orderbook['asks']['volume'])

imbalance = (bid_volume - ask_volume) / (bid_volume + ask_volume)
# -1 to +1: negative = sell pressure, positive = buy pressure
```

#### 6. Cross-Exchange Spread

```python
prices = {
    'binance': get_price('BINANCE', 'USDT/USD'),
    'coinbase': get_price('COINBASE', 'USDT/USD'),
    'kraken': get_price('KRAKEN', 'USDT/USD')
}

max_price = max(prices.values())
min_price = min(prices.values())
spread = (max_price - min_price) / min_price * 100
# <0.1% = healthy, >0.5% = arbitrage opportunity/stress
```

#### 7. Volume Anomaly Score

```python
volume_24h = get_volumes_last_24h()
current_volume = get_current_hourly_volume()

mean_volume = np.mean(volume_24h)
std_volume = np.std(volume_24h)

volume_zscore = (current_volume - mean_volume) / std_volume
anomaly_detected = volume_zscore > 3.0  # 3-sigma threshold
```

---

## 🤖 ML Risk Scoring Model

### Model Selection: **XGBoost** ✅

**Why XGBoost over Logistic Regression/Random Forest:**

- ✅ Handles non-linear feature interactions (e.g., low liquidity + high volatility)
- ✅ Feature importance for explainability (critical for demo)
- ✅ Robust to imbalanced data (few depeg events)
- ✅ Fast inference (<10ms)
- ✅ Great for hackathon demos (impressive + practical)

### Training Labels

```python
def create_labels(historical_data):
    """
    Label = 1 if depeg > 2% within next 6 hours
    Label = 0 otherwise
    """
    labels = []
    for i, row in historical_data.iterrows():
        future_prices = historical_data.iloc[i:i+360]['price']  # 6h = 360 min
        max_deviation = max(abs(future_prices - 1.0))

        label = 1 if max_deviation > 0.02 else 0
        labels.append(label)

    return labels
```

### Simulating Depeg Events for Demo

#### Strategy 1: Historical Data Injection

```python
known_depegs = [
    {'date': '2022-05-09', 'asset': 'UST', 'magnitude': 0.95},  # Terra collapse
    {'date': '2023-03-11', 'asset': 'USDC', 'magnitude': 0.88}, # SVB crisis
]

# Use these as positive samples
```

#### Strategy 2: Synthetic Stress Scenarios

```python
def generate_stress_scenario():
    return {
        'peg_deviation': np.random.uniform(0.02, 0.10),  # 2-10%
        'liquidity_score': np.random.uniform(0.1, 0.3),  # Low liquidity
        'volatility': np.random.uniform(0.05, 0.20),     # High volatility
        'imbalance': np.random.uniform(-0.8, -0.5),      # Strong sell pressure
        'cross_exchange_spread': np.random.uniform(0.005, 0.02),
        'volume_anomaly_score': np.random.uniform(3.5, 8.0),
        'label': 1  # High risk
    }
```

### Risk Score Calculation

```python
def calculate_risk_score(features, model):
    """
    Input: 7 engineered features
    Output: Risk score [0-100] and risk level
    """
    # XGBoost probability output
    depeg_probability = model.predict_proba(features)[0][1]

    # Convert to 0-100 scale
    risk_score = int(depeg_probability * 100)

    # Risk levels
    if risk_score < 30:
        risk_level = "Low"
    elif risk_score < 60:
        risk_level = "Medium"
    elif risk_score < 80:
        risk_level = "High"
    else:
        risk_level = "Critical"

    return risk_score, risk_level, depeg_probability
```

---

## 🏗️ Backend Architecture

### Layer 1: Data Ingestion

```
┌─────────────────────────────────────────────────────┐
│           External API Clients                      │
│  - CoinAPIClient (primary)                          │
│  - BinanceClient (backup/validation)                │
│  - Rate limiting: 100 req/sec                       │
│  - Caching: Redis (5-second TTL)                    │
└─────────────────────────────────────────────────────┘
```

### Layer 2: Data Aggregation

```
┌─────────────────────────────────────────────────────┐
│         Multi-Exchange Data Aggregator              │
│  1. Fetch prices from 3 exchanges                   │
│  2. Normalize symbol formats                        │
│  3. Detect outliers                                 │
│  4. Calculate consensus price                       │
└─────────────────────────────────────────────────────┘
```

### Layer 3: Feature Engineering

```
┌─────────────────────────────────────────────────────┐
│        Feature Computation Engine                   │
│  - Compute 7 core features                          │
│  - Rolling window calculations (24h)                │
│  - Feature normalization                            │
│  - Feature versioning (for A/B testing)             │
└─────────────────────────────────────────────────────┘
```

### Layer 4: ML Inference

```
┌─────────────────────────────────────────────────────┐
│          XGBoost Model Inference                    │
│  - Pre-trained model (joblib/pickle)                │
│  - Inference time: <10ms                            │
│  - Model version: v1.0                              │
│  - Fallback: Rule-based scoring                     │
└─────────────────────────────────────────────────────┘
```

### Layer 5: REST API

```
┌─────────────────────────────────────────────────────┐
│            Express.js REST API                      │
│  GET  /api/risk/:stablecoin                         │
│  GET  /api/risk/compare                             │
│  GET  /api/alerts                                   │
│  POST /api/subscribe                                │
└─────────────────────────────────────────────────────┘
```

---

## 📤 API Response Format

### Response Schema

```json
{
  "timestamp": "2026-02-12T10:30:00Z",
  "stablecoin": "USDT",
  "risk_assessment": {
    "risk_score": 72,
    "risk_level": "High",
    "depeg_probability": 0.37,
    "confidence": 0.89
  },
  "market_data": {
    "current_price": 0.988,
    "peg_deviation": -1.2,
    "deviation_duration_minutes": 45,
    "24h_high": 1.0012,
    "24h_low": 0.9865
  },
  "liquidity_metrics": {
    "liquidity_score": 0.43,
    "total_depth_usd": 12500000,
    "bid_ask_imbalance": -0.34,
    "spread_bps": 8.5
  },
  "volatility_metrics": {
    "volatility_24h": 0.018,
    "volume_anomaly": true,
    "volume_zscore": 4.2,
    "volume_24h_usd": 85000000000
  },
  "multi_exchange_data": {
    "cross_exchange_spread": 0.009,
    "exchanges": {
      "binance": {
        "price": 0.9885,
        "volume_24h": 42000000000,
        "last_updated": "2026-02-12T10:29:55Z"
      },
      "coinbase": {
        "price": 0.9874,
        "volume_24h": 28000000000,
        "last_updated": "2026-02-12T10:29:58Z"
      },
      "kraken": {
        "price": 0.9892,
        "volume_24h": 15000000000,
        "last_updated": "2026-02-12T10:29:52Z"
      }
    },
    "price_consensus": 0.9884,
    "arbitrage_opportunity": true
  },
  "feature_breakdown": {
    "peg_deviation_score": 0.85,
    "liquidity_stress_score": 0.72,
    "volatility_score": 0.65,
    "imbalance_score": 0.68,
    "spread_score": 0.55,
    "volume_anomaly_score": 0.9,
    "duration_score": 0.6
  },
  "alerts": [
    {
      "severity": "high",
      "type": "peg_deviation",
      "message": "Price depegged by 1.20% for 45 minutes",
      "triggered_at": "2026-02-12T09:45:00Z"
    },
    {
      "severity": "medium",
      "type": "volume_spike",
      "message": "Volume 4.2σ above 24h average",
      "triggered_at": "2026-02-12T10:15:00Z"
    }
  ],
  "recommendation": {
    "action": "MONITOR_CLOSELY",
    "reason": "High sell pressure with low liquidity indicates elevated risk",
    "suggested_actions": [
      "Reduce exposure to USDT",
      "Monitor cross-exchange spreads for arbitrage",
      "Set alert for deviation > 2%"
    ]
  }
}
```

---

## 🔄 Multi-Exchange Comparison Logic

### Step 1: Symbol Mapping

```python
def get_exchange_symbols(stablecoin):
    """
    Map stablecoin to exchange-specific symbols
    """
    mappings = {
        'USDT': {
            'binance': 'USDTUSD',
            'coinbase': 'USDT-USD',
            'kraken': 'USDTZUSD'
        },
        'USDC': {
            'binance': 'USDCUSD',
            'coinbase': 'USDC-USD',
            'kraken': 'USDCZUSD'
        }
    }
    return mappings.get(stablecoin, {})
```

### Step 2: Parallel Price Fetching

```python
async def fetch_multi_exchange_prices(stablecoin):
    """
    Fetch prices from all exchanges concurrently
    """
    symbols = get_exchange_symbols(stablecoin)

    tasks = [
        fetch_binance_price(symbols['binance']),
        fetch_coinbase_price(symbols['coinbase']),
        fetch_kraken_price(symbols['kraken'])
    ]

    results = await asyncio.gather(*tasks, return_exceptions=True)

    return {
        'binance': results[0],
        'coinbase': results[1],
        'kraken': results[2]
    }
```

### Step 3: Outlier Detection

```python
def detect_outlier_prices(prices):
    """
    Remove exchanges with stale or anomalous data
    """
    valid_prices = [p for p in prices.values() if p is not None]

    if len(valid_prices) < 2:
        return prices

    median_price = np.median(valid_prices)

    # Remove prices deviating >5% from median
    filtered = {}
    for exchange, price in prices.items():
        if price and abs(price - median_price) / median_price < 0.05:
            filtered[exchange] = price

    return filtered
```

### Step 4: Consensus Price Calculation

```python
def calculate_consensus_price(prices):
    """
    Volume-weighted average price across exchanges
    """
    volumes = get_exchange_volumes(prices.keys())

    total_volume = sum(volumes.values())
    weighted_price = sum(
        prices[ex] * volumes[ex] / total_volume
        for ex in prices.keys()
    )

    return weighted_price
```

---

## 🎯 Hackathon Demo Strategy

### Phase 1: Live Data (70% weight)

- Real-time monitoring of USDT, USDC, DAI
- Show actual peg deviations (usually 0.1-0.3%)
- Display liquidity depth charts

### Phase 2: Stress Simulation (30% weight)

- Button to "Simulate SVB Crisis"
- Injects synthetic high-risk scenario
- Shows risk score jumping 30→85
- Triggers alerts

### Phase 3: Visual Impact

- Real-time updating dashboard
- Color-coded risk levels (green/yellow/red)
- Historical depeg events timeline
- Multi-exchange price comparison chart

---

## ⚡ Implementation Priorities

1. ✅ **Core API Integration** (4 hours)
   - CoinAPI client
   - Binance fallback client
   - Rate limiting + caching

2. ✅ **Feature Engineering** (3 hours)
   - Implement 7 core features
   - Add rolling window calculations

3. ✅ **ML Model** (2 hours)
   - Train XGBoost on synthetic data
   - Deploy model inference endpoint

4. ✅ **REST API** (2 hours)
   - Express endpoints
   - Response formatting
   - Error handling

5. ✅ **Frontend Integration** (3 hours)
   - Real-time charts
   - Risk score display
   - Alert notifications

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Add COINAPI_KEY, BINANCE_API_KEY

# Train ML model (one-time)
python scripts/train_risk_model.py

# Start backend services
pnpm run dev

# Test risk API
curl http://localhost:8000/api/risk/USDT
```

---

## 📊 Success Metrics for Demo

- **Response Time**: <200ms for risk calculation
- **Accuracy**: 85%+ on synthetic depeg detection
- **Coverage**: Monitor 5+ stablecoins simultaneously
- **Update Frequency**: Real-time (10-second intervals)
- **Wow Factor**: Live multi-exchange arbitrage detection
