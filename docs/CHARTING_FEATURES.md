# Stablecoin Charting & Comparison Features - Implementation Summary

## Overview

This document describes the newly implemented charting and comparison features for stablecoin monitoring, including API integrations with CoinGecko and Binance.

## Features Implemented

### 1. Stablecoin Price & Peg Deviation Charts

**Location:** `/dashboard/stablecoins/[id]`

**Features:**

- Real-time price history charts with multiple time periods (7D, 30D, 90D)
- Peg deviation visualization showing percentage deviation from $1 peg
- Dual-axis charting: price on left axis, deviation on right axis
- Interactive tooltips with precise values
- Statistical summaries: max deviation, average deviation, data points count

**Components:**

- `PriceChart.tsx` - Reusable chart component using Chart.js
- Dynamic data fetching from backend API

**API Endpoints:**

- `GET /api/stablecoins/:id/peg-history?period=7d` - Fetch historical price and peg deviation data

### 2. Peg Deviation Comparison

**Location:** `/dashboard/compare`

**Features:**

- Multi-stablecoin selection (USDT, USDC, DAI, BUSD, FRAX)
- Time period selection (7 days, 30 days, 90 days)
- Side-by-side comparison table with key metrics:
  - Current price
  - Current deviation
  - Maximum deviation (peak)
  - Average deviation
  - Risk level (Low/Medium/High)
- Multi-line comparison charts:
  - Price comparison chart
  - Peg deviation comparison chart
- Color-coded lines for each stablecoin
- Real-time data refresh

**Components:**

- `ComparisonChart.tsx` - Multi-line chart component for comparing multiple datasets
- `page.tsx` in `/dashboard/compare` - Full comparison UI

**API Endpoints:**

- `GET /api/risk/compare?coins=USDT,USDC,DAI&days=7` - Compare multiple stablecoins

---

## Backend Implementation

### 1. CoinGecko API Integration

**File:** `apps/backend/services/api_clients.py`

**New Class: `CoinGeckoClient`**

- `get_market_chart(coin_id, vs_currency, days)` - Fetch historical price, market cap, and volume data
- `get_price(coin_ids, vs_currencies)` - Get current prices for multiple coins
- Synthetic data generation for fallback when API is unavailable
- Automatic error handling and rate limiting support

**Stablecoin ID Mapping:**

```python
COINGECKO_ID_MAP = {
    "USDT": "tether",
    "USDC": "usd-coin",
    "DAI": "dai",
    "BUSD": "binance-usd",
    "FRAX": "frax",
    "TUSD": "true-usd",
}
```

### 2. Binance API Enhancement

**File:** `apps/backend/services/api_clients.py`

**New Method in `BinanceClient`:**

- `get_ticker_price(symbol)` - Direct price fetch from Binance `/api/v3/ticker/price` endpoint
- Complements existing `get_ticker_24h()` method
- Used for real-time price validation and cross-exchange comparison

### 3. Market Data Service (FastAPI)

**Files:**

- `apps/backend/services/market_data/router.py` - New FastAPI router
- `apps/backend/services/main.py` - Updated to include market data routes

**New Endpoints:**

1. **`GET /api/market-data/market-chart`**
   - Parameters: `coin_id`, `vs_currency`, `days`
   - Returns: Historical price, market cap, and volume arrays
   - Source: CoinGecko API

2. **`GET /api/market-data/price`**
   - Parameters: `coin_ids` (comma-separated), `vs_currencies`
   - Returns: Current prices for multiple coins
   - Source: CoinGecko API

3. **`GET /api/market-data/binance/ticker`**
   - Parameters: `symbol` (e.g., USDTUSDC)
   - Returns: Current price from Binance
   - Source: Binance API

4. **`GET /api/market-data/binance/ticker-24h`**
   - Parameters: `symbol`
   - Returns: 24h ticker statistics (price, volume, high, low)
   - Source: Binance API

5. **`GET /api/market-data/compare-peg-deviation`**
   - Parameters: `symbols` (comma-separated), `days`
   - Returns: Comprehensive comparison data with deviation statistics
   - Calculates: current, max, and average deviations for each stablecoin

### 4. Express API Updates

**File:** `apps/backend/api/routes/stablecoin.ts`

**Updated Endpoints:**

- `GET /api/stablecoins/:id/peg-history` - Now fetches real data from Python backend
  - Supports multiple time periods: 1h, 24h, 7d, 30d, 90d, 180d, 1y
  - Transforms CoinGecko data to internal PriceDataPoint format
  - Calculates peg deviation percentage
  - Falls back to mock data if backend unavailable

**File:** `apps/backend/api/routes/risk.ts`

**Updated Endpoints:**

- `GET /api/risk/compare` - Enhanced with real peg deviation comparison
  - Fetches data from Python market data service
  - Calculates risk scores based on deviation metrics
  - Ranks stablecoins by risk and stability

---

## Frontend Implementation

### 1. Chart Components

**Location:** `apps/frontend/components/charts/`

**Files Created:**

- `PriceChart.tsx` - Single stablecoin price and deviation chart
- `ComparisonChart.tsx` - Multi-stablecoin comparison chart
- `index.ts` - Export barrel file

**Features:**

- Built with Chart.js and react-chartjs-2
- Responsive design with configurable heights
- Interactive tooltips with formatted values
- Smooth animations and transitions
- Customizable colors and styling
- Support for dual-axis displays (price and deviation)

### 2. Stablecoin Detail Page

**Location:** `apps/frontend/app/dashboard/stablecoins/[id]/page.tsx`

**Features:**

- Dynamic routing based on stablecoin ID
- Real-time data fetching from backend API
- Time period selector (7D, 30D, 90D)
- KPI cards showing current price, deviation, volume, market cap
- Interactive chart with price and deviation
- Statistical summary cards
- Loading states and error handling

### 3. Comparison Page

**Location:** `apps/frontend/app/dashboard/compare/page.tsx`

**Features:**

- Multi-select stablecoin picker with visual buttons
- Time period selector
- Real-time data refresh button
- Comprehensive comparison table
- Dual charts: price and deviation
- Color-coded risk levels (Low/Medium/High)
- Responsive layout

### 4. Navigation Updates

**File:** `apps/frontend/components/layout/Sidebar.tsx`

**Changes:**

- Added "Compare" navigation item with ⚖️ icon
- Links to `/dashboard/compare` page

**File:** `apps/frontend/app/dashboard/page.tsx`

**Changes:**

- Added "Compare Stablecoins" button in header
- Updated stablecoin table with clickable links to detail pages
- Shows sample data for USDT, USDC, DAI

### 5. Type Definitions

**File:** `apps/frontend/types/index.ts`

**Added Types:**

- `PriceDataPoint` - Historical price data structure with timestamp, price, deviation, volume, marketCap

---

## Data Flow

### Stablecoin Chart Flow:

1. User navigates to `/dashboard/stablecoins/usdt`
2. Frontend component fetches data from Express API: `GET /api/stablecoins/usdt/peg-history?period=7d`
3. Express API calls Python FastAPI: `GET /api/market-data/market-chart?coin_id=tether&days=7`
4. Python service fetches from CoinGecko: `GET /api/v3/coins/tether/market_chart?vs_currency=usd&days=7`
5. Data flows back through the stack, transformed at each level
6. Frontend renders chart with Chart.js

### Comparison Flow:

1. User selects stablecoins (USDT, USDC, DAI) and time period (7d) on `/dashboard/compare`
2. Frontend fetches data from Express API: `GET /api/risk/compare?coins=USDT,USDC,DAI&days=7`
3. Express API calls Python FastAPI: `GET /api/market-data/compare-peg-deviation?symbols=USDT,USDC,DAI&days=7`
4. Python service fetches data for each coin from CoinGecko
5. Python service calculates deviation statistics (current, max, avg)
6. Data flows back with complete comparison metrics
7. Frontend renders comparison table and dual charts

---

## API Integration Details

### CoinGecko API

- **Base URL:** `https://api.coingecko.com/api/v3`
- **Rate Limits:** Free tier - 50 calls/minute
- **No API Key Required** (for free tier)
- **Used For:**
  - Historical price data
  - Market cap and volume data
  - Multi-day time series

### Binance API

- **Base URL:** `https://api.binance.com`
- **Rate Limits:** 1200 requests/minute
- **No API Key Required** (for public endpoints)
- **Used For:**
  - Real-time price validation
  - Cross-exchange comparison
  - Liquidity data (order book depth)

---

## Configuration

### Backend Configuration

**Environment Variables (optional):**

```bash
COINAPI_KEY=your_coinapi_key  # For CoinAPI (existing integration)
FASTAPI_PORT=8001             # Python FastAPI service port
```

### Frontend Configuration

**API Base URLs:**

- Express API: `http://localhost:3001`
- Python FastAPI: `http://localhost:8001` (called from Express)

---

## Usage Examples

### 1. View Stablecoin Chart

Navigate to: `http://localhost:3000/dashboard/stablecoins/usdt`

- Select time period (7D, 30D, 90D)
- View price and deviation chart
- See statistical summaries

### 2. Compare Stablecoins

Navigate to: `http://localhost:3000/dashboard/compare`

- Select stablecoins to compare (USDT, USDC, DAI, BUSD, FRAX)
- Choose time period (7 days, 30 days, 90 days)
- Click "Refresh Data" to update
- View comparison table and charts

### 3. Quick Access

From dashboard: `http://localhost:3000/dashboard`

- Click "Compare Stablecoins" button
- Click on any stablecoin name to view detail page

---

## Testing

### Backend Testing

```bash
# Test Python FastAPI endpoints
curl http://localhost:8001/api/market-data/market-chart?coin_id=tether&days=7
curl http://localhost:8001/api/market-data/compare-peg-deviation?symbols=USDT,USDC,DAI&days=7
curl http://localhost:8001/api/market-data/binance/ticker?symbol=USDTUSDC

# Test Express API endpoints
curl http://localhost:3001/api/stablecoins/usdt/peg-history?period=7d
curl http://localhost:3001/api/risk/compare?coins=USDT,USDC,DAI&days=7
```

### Frontend Testing

1. Start backend services:

   ```bash
   cd apps/backend/services
   python main.py  # FastAPI on port 8001

   cd apps/backend
   npm run dev  # Express on port 3001
   ```

2. Start frontend:

   ```bash
   cd apps/frontend
   npm run dev  # Next.js on port 3000
   ```

3. Navigate to pages and test interactions

---

## Error Handling

### Graceful Degradation

- If CoinGecko API fails, backend generates synthetic data
- If Python backend is unavailable, Express API returns mock data with warning
- Frontend displays error messages without breaking UI
- Loading states prevent user confusion during data fetches

### Error Messages

- API errors are logged to console
- User-friendly error messages displayed in UI
- "Backend unavailable" warnings when using fallback data

---

## Performance Considerations

### Caching

- Consider implementing Redis for caching CoinGecko responses
- Cache duration: 5 minutes for historical data, 30 seconds for current prices

### Rate Limiting

- CoinGecko free tier: 50 calls/minute
- Implement request throttling in production
- Consider premium tier for higher limits

### Optimization

- Chart rendering uses canvas for better performance
- Data points are limited based on time period to reduce payload size
- Lazy loading for chart components

---

## Future Enhancements

1. **Real-time Updates:**
   - WebSocket integration for live price updates
   - Automatic chart refresh without manual button click

2. **Advanced Analytics:**
   - Correlation analysis between stablecoins
   - Volatility indicators
   - Historical stress test scenarios

3. **Export Features:**
   - CSV export for comparison data
   - Chart image export (PNG/SVG)
   - PDF report generation

4. **User Preferences:**
   - Save favorite stablecoin pairs
   - Custom time range selection
   - Chart theme customization

5. **Additional Data Sources:**
   - Integrate more exchanges (Kraken, Coinbase)
   - DeFi protocol data (Uniswap, Curve)
   - On-chain metrics

---

## File Structure

```
stablecoin/
├── apps/
│   ├── backend/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── stablecoin.ts (updated)
│   │   │       └── risk.ts (updated)
│   │   └── services/
│   │       ├── api_clients.py (updated with CoinGecko & Binance)
│   │       ├── main.py (updated with market_data router)
│   │       └── market_data/
│   │           ├── __init__.py (new)
│   │           └── router.py (new)
│   └── frontend/
│       ├── app/
│       │   └── dashboard/
│       │       ├── page.tsx (updated)
│       │       ├── compare/
│       │       │   └── page.tsx (new)
│       │       └── stablecoins/
│       │           └── [id]/
│       │               └── page.tsx (new)
│       ├── components/
│       │   ├── charts/
│       │   │   ├── PriceChart.tsx (new)
│       │   │   ├── ComparisonChart.tsx (new)
│       │   │   └── index.ts (new)
│       │   └── layout/
│       │       └── Sidebar.tsx (updated)
│       └── types/
│           └── index.ts (updated)
└── docs/
    └── CHARTING_FEATURES.md (this file)
```

---

## Dependencies

### Backend (Python)

- `fastapi` - API framework
- `aiohttp` - Async HTTP client for API calls
- `uvicorn` - ASGI server

### Backend (Node.js)

- `express` - API framework
- `axios` - HTTP client

### Frontend

- `next` - React framework
- `chart.js` - Charting library
- `react-chartjs-2` - React wrapper for Chart.js
- `axios` - HTTP client
- `date-fns` - Date formatting

---

## Troubleshooting

### Charts Not Displaying

1. Check that backend services are running (FastAPI and Express)
2. Verify API endpoints are accessible
3. Check browser console for errors
4. Ensure Chart.js is properly registered

### No Data Returned

1. Check CoinGecko API status
2. Verify coin IDs in mapping are correct
3. Check network requests in browser DevTools
4. Review backend logs for errors

### Slow Performance

1. Reduce data points by limiting time range
2. Implement caching layer
3. Optimize chart rendering settings
4. Check network latency

---

## Summary

This implementation provides a comprehensive charting and comparison system for stablecoin monitoring:

- ✅ Real-time price and peg deviation charts with multiple time periods
- ✅ Multi-stablecoin comparison with deviation analysis
- ✅ CoinGecko and Binance API integrations
- ✅ Reusable chart components
- ✅ Responsive UI with error handling
- ✅ Complete data flow from external APIs to frontend visualization

All features are fully integrated and linked throughout the application, accessible via the sidebar navigation and dashboard.
