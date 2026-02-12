# API Reference

REST API documentation for the Stablecoin Monitoring Platform.

## Base URL

- Development: `http://localhost:8000/api`
- Production: `https://api.stablecoin-monitor.com/api`

## Authentication

Most endpoints require authentication via JWT token:

```http
Authorization: Bearer <token>
```

## Endpoints

### Stablecoins

#### List All Stablecoins

```http
GET /stablecoins
```

Query Parameters:
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20)
- `sort` (string) - Sort field (price, volume24h, marketCap)
- `order` (string) - Sort order (asc, desc)

Response:
```json
{
  "data": [
    {
      "id": "usdt",
      "name": "Tether",
      "symbol": "USDT",
      "price": 1.0001,
      "pegDeviation": 0.01,
      "volume24h": 45000000000,
      "marketCap": 95000000000,
      "riskScore": 0.15,
      "lastUpdated": "2026-02-12T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### Get Stablecoin Details

```http
GET /stablecoins/:id
```

Response:
```json
{
  "id": "usdt",
  "name": "Tether",
  "symbol": "USDT",
  "price": 1.0001,
  "pegDeviation": 0.01,
  "volume24h": 450000000 00,
  "marketCap": 95000000000,
  "riskScore": 0.15,
  "lastUpdated": "2026-02-12T10:30:00Z"
}
```

#### Get Peg History

```http
GET /stablecoins/:id/peg-history
```

Query Parameters:
- `period` (string) - Time period (1h, 24h, 7d, 30d)
- `interval` (string) - Data interval (1m, 5m, 1h, 1d)

Response:
```json
{
  "stablecoinId": "usdt",
  "period": "24h",
  "data": [
    {
      "timestamp": "2026-02-12T10:00:00Z",
      "price": 1.0001,
      "deviation": 0.01,
      "volume": 450000000
    }
  ]
}
```

### Liquidity

#### Get Liquidity Metrics

```http
GET /stablecoins/:id/liquidity
```

Response:
```json
{
  "stablecoinId": "usdt",
  "totalLiquidity": 100000000,
  "exchanges": [
    {
      "exchange": "Binance",
      "orderBookDepth": {
        "bids": 50000000,
        "asks": 51000000
      },
      "bidAskSpread": 0.0001
    }
  ],
  "liquidityScore": 0.85
}
```

### Reserves

#### Get Reserve Composition

```http
GET /stablecoins/:id/reserves
```

Response:
```json
{
  "stablecoinId": "usdt",
  "reserves": {
    "cash": 15.5,
    "treasuryBills": 65.2,
    "commercialPaper": 12.3,
    "cryptoBacked": 5.0,
    "other": 2.0
  },
  "lastAudited": "2026-01-15T00:00:00Z",
  "transparencyScore": 0.75
}
```

### Alerts

#### Create Alert

```http
POST /alerts
```

Request Body:
```json
{
  "stablecoinId": "usdt",
  "name": "USDT Depeg Alert",
  "type": "peg_deviation",
  "condition": "above",
  "threshold": 0.5,
  "channels": ["email", "telegram"]
}
```

Response:
```json
{
  "id": "alert-123",
  "userId": "user-456",
  "stablecoinId": "usdt",
  "name": "USDT Depeg Alert",
  "type": "peg_deviation",
  "condition": "above",
  "threshold": 0.5,
  "enabled": true,
  "channels": ["email", "telegram"],
  "createdAt": "2026-02-12T10:30:00Z"
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Stablecoin not found"
  }
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

- 100 requests per 15 minutes per IP
- Headers:
  - `X-RateLimit-Limit` - Request limit
  - `X-RateLimit-Remaining` - Remaining requests
  - `X-RateLimit-Reset` - Reset time (Unix timestamp)
