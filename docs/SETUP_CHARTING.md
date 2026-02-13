# Quick Setup Guide - Charting & Comparison Features

## Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- pnpm (or npm)

## Step-by-Step Setup

### 1. Install Dependencies

#### Backend (Python FastAPI)

```bash
cd apps/backend/services
pip install -r requirements.txt
```

#### Backend (Express)

```bash
cd apps/backend
npm install
```

#### Frontend

```bash
cd apps/frontend
npm install
```

### 2. Start Services

#### Option A: Start All Services Manually

**Terminal 1 - Python FastAPI:**

```bash
cd apps/backend/services
python main.py
# Server will start on http://localhost:8001
```

**Terminal 2 - Express API:**

```bash
cd apps/backend
npm run dev
# Server will start on http://localhost:3001
```

**Terminal 3 - Frontend:**

```bash
cd apps/frontend
npm run dev
# Server will start on http://localhost:3000
```

#### Option B: Use PowerShell Script (Windows)

```powershell
# From project root
.\scripts\setup.ps1
```

### 3. Access the Application

Open your browser and navigate to:

- **Frontend:** http://localhost:3000
- **Dashboard:** http://localhost:3000/dashboard
- **Compare Page:** http://localhost:3000/dashboard/compare
- **Stablecoin Detail:** http://localhost:3000/dashboard/stablecoins/usdt

### 4. Verify APIs

Test the backend endpoints:

**Python FastAPI:**

```bash
# Check health
curl http://localhost:8001/health

# Test market chart endpoint
curl "http://localhost:8001/api/market-data/market-chart?coin_id=tether&days=7"

# Test comparison endpoint
curl "http://localhost:8001/api/market-data/compare-peg-deviation?symbols=USDT,USDC,DAI&days=7"
```

**Express API:**

```bash
# Check health
curl http://localhost:3001/api/health

# Test peg history
curl "http://localhost:3001/api/stablecoins/usdt/peg-history?period=7d"

# Test comparison
curl "http://localhost:3001/api/risk/compare?coins=USDT,USDC,DAI&days=7"
```

## Features to Test

### 1. Stablecoin Charts

1. Navigate to **Dashboard** → Click on **USDT** in the table
2. Or go directly to: http://localhost:3000/dashboard/stablecoins/usdt
3. Select different time periods: **7D**, **30D**, **90D**
4. Observe price and deviation chart updates
5. Check statistics cards below the chart

### 2. Peg Deviation Comparison

1. Click **Compare** in the sidebar navigation
2. Or go directly to: http://localhost:3000/dashboard/compare
3. Select multiple stablecoins (USDT, USDC, DAI)
4. Choose time period (7 days, 30 days, 90 days)
5. Click **Refresh Data**
6. View:
   - Comparison table with metrics
   - Price comparison chart
   - Peg deviation comparison chart

### 3. Navigation

1. Use sidebar to navigate between pages
2. Click **Compare** to access comparison page
3. Click stablecoin names to view details
4. Use **Compare Stablecoins** button on dashboard

## Troubleshooting

### Backend Services Not Starting

**Python FastAPI Error:**

```bash
# Check if port 8001 is in use
netstat -ano | findstr :8001

# Kill process if needed
taskkill /PID <process_id> /F

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

**Express API Error:**

```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Kill process if needed
taskkill /PID <process_id> /F

# Reinstall dependencies
npm install --force
```

### Frontend Not Loading Charts

**Check Dependencies:**

```bash
cd apps/frontend
npm install chart.js react-chartjs-2 date-fns
```

**Clear Cache:**

```bash
# Delete .next folder and rebuild
rm -rf .next
npm run dev
```

### API Connection Issues

**Check Backend URLs:**

- In `apps/frontend/app/dashboard/stablecoins/[id]/page.tsx`:
  - API URL should be `http://localhost:3001`
- In `apps/frontend/app/dashboard/compare/page.tsx`:
  - API URL should be `http://localhost:3001`
- In `apps/backend/api/routes/stablecoin.ts`:
  - Python API URL should be `http://localhost:8001`

**CORS Issues:**

- Ensure CORS is configured in `apps/backend/services/main.py`
- Frontend URL should be allowed: `http://localhost:3000`

### No Data Displayed

**Using Mock Data:**

- If backend is unavailable, endpoints return mock data
- Check for warning messages in API responses
- Verify both Python and Express backends are running

**CoinGecko API Issues:**

- Rate limit may be reached (50 calls/minute on free tier)
- Wait a minute and try again
- Check CoinGecko API status: https://status.coingecko.com/

## Environment Variables (Optional)

Create `.env` files if needed:

**apps/backend/services/.env:**

```env
FASTAPI_PORT=8001
FRONTEND_URL=http://localhost:3000
```

**apps/backend/.env:**

```env
PORT=3001
PYTHON_API_URL=http://localhost:8001
```

**apps/frontend/.env.local:**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Next Steps

After successful setup:

1. Explore the comparison page to compare multiple stablecoins
2. View individual stablecoin details with charts
3. Try different time periods to see historical data
4. Check the documentation in `docs/CHARTING_FEATURES.md` for detailed information

## Need Help?

- Check logs in terminal windows for error messages
- Review `docs/CHARTING_FEATURES.md` for detailed documentation
- Verify all services are running on correct ports
- Check browser console for frontend errors

## API Endpoints Quick Reference

### Python FastAPI (http://localhost:8001)

- `GET /api/market-data/market-chart` - Historical market data
- `GET /api/market-data/price` - Current prices
- `GET /api/market-data/binance/ticker` - Binance ticker
- `GET /api/market-data/compare-peg-deviation` - Compare deviations

### Express API (http://localhost:3001)

- `GET /api/stablecoins/:id/peg-history` - Historical peg data
- `GET /api/risk/compare` - Compare multiple stablecoins

### Frontend (http://localhost:3000)

- `/dashboard` - Main dashboard
- `/dashboard/compare` - Comparison page
- `/dashboard/stablecoins/:id` - Stablecoin detail page
