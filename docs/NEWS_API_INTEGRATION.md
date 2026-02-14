# Stablecoin News Integration with VADER Sentiment & Risk Scoring

## Overview

The Market Updates section now displays **live stablecoin news** from NewsAPI with **AI-powered sentiment analysis** using VADER (Valence Aware Dictionary and sEntiment Reasoner) and automatic **risk scoring** for stablecoin stability.

## Features

✅ **Live News Fetching** - Pulls real-time stablecoin news from NewsAPI  
✅ **VADER Sentiment Analysis** - Scores each article's sentiment (positive/negative/neutral)  
✅ **Risk Scoring (0-100)** - Calculates stability risk based on sentiment  
✅ **Smart Caching** - 15-minute cache to avoid rate limits  
✅ **Graceful Fallback** - Works without API key (shows placeholder)

## Setup Instructions

### 1. Get a NewsAPI Key

1. Visit [https://newsapi.org/register](https://newsapi.org/register)
2. Create a free account (free tier: 100 requests/day)
3. Copy your API key

### 2. Configure Environment

Add your API key to `apps/backend/.env`:

```env
NEWSAPI_KEY=your_actual_api_key_here
```

### 3. Restart Backend

```powershell
cd apps/backend
pnpm dev:api
```

## How Risk Scoring Works

The system calculates a **Risk Score (0-100)** for each news article based on VADER sentiment analysis:

### Risk Formula

```typescript
// VADER compound score ranges from -1 (most negative) to +1 (most positive)

if (compound >= 0.05) {
  // Positive sentiment = Low Risk (0-20)
  riskScore = 0-20
} else if (compound <= -0.05) {
  // Negative sentiment = High Risk (50-100)
  riskScore = 50-100
} else {
  // Neutral sentiment = Moderate Risk (20-50)
  riskScore = 20-50
}
```

### Risk Levels

| Risk Score | Level | Badge Color | Meaning |
|------------|-------|-------------|---------|
| 0-29 | **Low Risk** | 🟢 Green | Positive news, stable outlook |
| 30-59 | **Moderate** | 🟡 Yellow | Neutral/mixed sentiment |
| 60-100 | **High Risk** | 🔴 Red | Negative news, potential instability |

## API Endpoints

### Get News
```http
GET /api/news?query=stablecoin&limit=20
```

**Query Parameters:**
- `query` (optional): Search keywords (default: "stablecoin OR USDT OR USDC OR DAI OR tether")
- `limit` (optional): Number of articles (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "articles": [
    {
      "title": "USDC Maintains Peg Stability Amid Market Volatility",
      "description": "Circle's USDC stablecoin continues...",
      "url": "https://...",
      "source": "CoinDesk",
      "publishedAt": "2026-02-14T10:30:00Z",
      "sentiment": {
        "score": 65.4,
        "compound": 0.654,
        "positive": 0.45,
        "negative": 0.05,
        "neutral": 0.50,
        "label": "positive"
      },
      "riskScore": 12,
      "urlToImage": "https://...",
      "author": "John Doe"
    }
  ]
}
```

### Get Trending News
```http
GET /api/news/trending?limit=10
```

### Get Coin-Specific News
```http
GET /api/news/coin?coins=USDC,USDT,DAI&limit=10
```

### Clear Cache (Dev Only)
```http
POST /api/news/refresh
```

## Frontend Display

### Dashboard - Market Updates Page

Navigate to: `/dashboard/updates`

**Features:**
- 📰 **Featured Story** - Top article with largest impact
- 📊 **Risk Badges** - Color-coded risk scores beside each headline
- 🎯 **Sentiment Indicators** - 📈 Positive, 📉 Negative, ➖ Neutral
- 🔄 **Auto-Refresh** - Updates every 15 minutes
- 📱 **Responsive Design** - Works on all screen sizes

### Example Display

```
┌─────────────────────────────────────────────────────┐
│ USDC Maintains Peg Stability                       │
│ [📈 positive] [Risk: 12]                           │
│                                                     │
│ Circle's USDC stablecoin continues to show...      │
│                                                     │
│ CoinDesk • 2h ago • Low Risk • Read article →      │
└─────────────────────────────────────────────────────┘
```

## Testing

### Test Backend Endpoint

```powershell
# Test news endpoint
curl http://localhost:8000/api/news?limit=5 | jq

# Test trending news
curl http://localhost:8000/api/news/trending?limit=3 | jq

# Clear cache
curl -X POST http://localhost:8000/api/news/refresh
```

### Test Without API Key

The system will return fallback data with instructions to set up NewsAPI:

```json
{
  "title": "News API Currently Unavailable",
  "description": "Please add a valid NEWSAPI_KEY to your .env file...",
  "riskScore": 50
}
```

## Architecture

```
┌──────────────┐      ┌───────────────┐      ┌──────────────┐
│   Frontend   │─────▶│  Backend API  │─────▶│   NewsAPI    │
│  Dashboard   │      │  /api/news    │      │ newsapi.org  │
└──────────────┘      └───────────────┘      └──────────────┘
       │                      │
       │                      ▼
       │              ┌───────────────┐
       │              │ VADER Sentiment│
       │              │   Analysis    │
       │              └───────────────┘
       │                      │
       │                      ▼
       │              ┌───────────────┐
       │              │ Risk Score    │
       │              │  Calculator   │
       │              └───────────────┘
       │                      │
       └──────────────────────┘
              Enriched Data
```

## Rate Limits & Caching

### NewsAPI Free Tier
- **100 requests/day**
- **Articles from last 30 days**
- **English language only**

### Built-in Caching
- **TTL**: 15 minutes (900 seconds)
- **Storage**: In-memory (node-cache)
- **Strategy**: Cache-first, then fetch

### Optimization Tips

1. **Reduce Frontend Refresh Interval** - Default is 15 minutes, can increase to 30+
2. **Use Trending Endpoint** - Pre-filtered results consume fewer API calls
3. **Batch Queries** - Combine multiple coin searches into one query
4. **Monitor Usage** - Check NewsAPI dashboard for remaining quota

## Upgrade to Paid Plan

For production deployments, consider upgrading:

| Plan | Price | Requests/day | History |
|------|-------|--------------|---------|
| Free | $0 | 100 | 30 days |
| Developer | $449/mo | 250,000 | 6 months |
| Business | $899/mo | 500,000 | 12 months |

Visit: [https://newsapi.org/pricing](https://newsapi.org/pricing)

## Troubleshooting

### "No API key specified" Error

**Solution:** Add `NEWSAPI_KEY` to `apps/backend/.env` and restart backend

```bash
cd apps/backend
pnpm dev:api
```

### "Failed to fetch news" in Frontend

**Check:**
1. Backend is running on port 8000
2. CORS is configured correctly
3. Check browser console for errors
4. Verify API key is valid at newsapi.org

### Rate Limit Exceeded

**Solutions:**
1. Increase cache TTL in `newsService.js` (default: 900s)
2. Reduce frontend refresh interval
3. Upgrade NewsAPI plan
4. Use `/trending` endpoint for general updates

### Cache Not Clearing

```powershell
# Manual cache clear
curl -X POST http://localhost:8000/api/news/refresh

# Or restart backend
cd apps/backend
pnpm dev:api
```

## Development Notes

### Files Modified

**Backend:**
- ✅ `apps/backend/api/routes/news.ts` - New route with risk scoring
- ✅ `apps/backend/api/server.ts` - Wired news route
- ✅ `apps/backend/.env` - Added NEWSAPI_KEY placeholder
- ✅ `apps/backend/tsconfig.json` - Removed rootDir constraint

**Frontend:**
- ✅ `apps/frontend/hooks/useData.ts` - Added riskScore to NewsArticle interface
- ✅ `apps/frontend/app/dashboard/updates/page.tsx` - Display risk badges

**Dependencies (Already Installed):**
- `newsapi@2.4.1` - NewsAPI client
- `vader-sentiment@1.1.3` - Sentiment analysis
- `node-cache@5.1.2` - Caching layer

### Risk Score Algorithm Deep Dive

The risk score provides a **single numeric indicator** (0-100) that financial analysts can use to quickly assess news impact on stablecoin stability:

**Negative News (High Risk):** Articles with negative sentiment (compound < -0.05) indicate potential threats:
- Regulatory actions
- Depegging events
- Reserve issues
- Security breaches
→ Risk Score: 50-100

**Neutral News (Moderate Risk):** Mixed or informational content without clear positive/negative stance:
- Market reports
- Technical updates
- General announcements
→ Risk Score: 20-50

**Positive News (Low Risk):** Articles with positive sentiment (compound > 0.05) indicate stability:
- Successful audits
- Partnership announcements
- Growth metrics
- Regulatory approvals
→ Risk Score: 0-20

## Future Enhancements

Potential improvements for future versions:

1. **Historical Risk Tracking** - Store and chart risk scores over time
2. **Multi-Language Support** - Translate non-English news
3. **RSS Fallback** - Alternative sources when NewsAPI unavailable
4. **Custom Sentiment Models** - Fine-tuned for crypto terminology
5. **Alert System** - Push notifications for high-risk news
6. **Entity Recognition** - Tag specific stablecoins in articles
7. **Source Reliability Scoring** - Weight by news source credibility

## License

Same as parent project license.

## Support

For issues or questions:
- Open GitHub issue
- Check backend logs: `apps/backend/logs/`
- NewsAPI support: https://newsapi.org/docs

---

**Last Updated:** February 14, 2026  
**Version:** 1.0.0  
**Sentiment Engine:** VADER 1.1.3  
**News Provider:** NewsAPI v2
