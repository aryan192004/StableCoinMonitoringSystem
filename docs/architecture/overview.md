# Architecture Overview

## System Architecture

The Stablecoin Monitoring Platform follows a modern, scalable monorepo architecture.

```
┌─────────────┐
│   Frontend  │ (Next.js/React)
│  Port 3000  │
└──────┬──────┘
       │ HTTP/WebSocket
       ▼
┌─────────────────────────┐
│   Backend API Layer     │ (Node.js/Express)
│      Port 8000          │
├─────────────────────────┤
│   - REST API            │
│   - WebSocket Server    │
│   - Cron Jobs           │
│   - Redis Cache         │
└──────┬──────────────────┘
       │ HTTP
       ▼
┌─────────────────────────┐
│   FastAPI Services      │ (Python)
│      Port 8001          │
├─────────────────────────┤
│   - Risk Engine         │
│   - Liquidity Monitor   │
│   - Heavy Compute       │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐     ┌─────────────┐
│   PostgreSQL            │     │   Redis     │
│      Port 5432          │     │   Port 6379 │
└─────────────────────────┘     └─────────────┘
       │
       ▼
┌─────────────────────────┐
│   External APIs         │
├─────────────────────────┤
│   - Exchange APIs       │
│   - Blockchain RPCs     │
│   - Reserve Sources     │
└─────────────────────────┘
```

## Components

### Frontend (Next.js)

- **Technology**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js, TradingView Lightweight Charts
- **State**: SWR for data fetching, Zustand for app state
- **Real-time**: WebSocket client (Socket.IO)

**Key Features**:
- Server-side rendering for SEO
- Real-time price updates via WebSocket
- Optimized chart rendering
- Responsive design

### Backend API (Node.js)

- **Technology**: Express.js, TypeScript
- **Database**: Prisma ORM → PostgreSQL
- **Caching**: Redis (via ioredis)
- **WebSocket**: Socket.IO
- **Scheduling**: node-cron for data polling

**Responsibilities**:
- REST API endpoints
- WebSocket connections for real-time updates
- Data aggregation from external sources
- Alert management
- Caching frequently accessed data

### FastAPI Services (Python)

- **Technology**: FastAPI, Python 3.10+
- **Libraries**: Pandas, NumPy for calculations

**Responsibilities**:
- Risk score calculations (compute-intensive)
- Liquidity analysis
- Statistical operations
- ML-ready architecture (future enhancement)

### Database (PostgreSQL)

- **Tables**:
  - `stablecoins` - Core coin data
  - `market_data` - Time-series price/volume data
  - `liquidity_metrics` - Liquidity measurements
  - `reserves` - Reserve composition snapshots
  - `risk_assessments` - Calculated risk scores
  - `users` - User accounts
  - `alerts` - Alert configurations

### Cache (Redis)

- **Usage**:
  - API response caching (TTL: 10-30s)
  - Session storage
  - Rate limiting
  - Real-time data buffering

## Data Flow

### 1. Price Data Collection

```
External APIs → Backend (Cron) → PostgreSQL
                    ↓
              Redis Cache → Frontend (WebSocket)
```

### 2. Risk Calculation

```
Backend → FastAPI Risk Engine → Calculate Score → Store in DB
                                      ↓
                               Return to Backend → Cache → Frontend
```

### 3. User Alerts

```
User Creates Alert → Backend → Store in DB
                                   ↓
Cron Job Checks Conditions → Trigger Alert → Send Notification
```

## Security Architecture

### Authentication

- JWT tokens for user authentication
- Refresh tokens for session management
- Password hashing with bcrypt

### API Security

- Helmet.js for HTTP headers
- CORS configuration
- Rate limiting (Express rate limit)
- Input validation (Joi)

### Database Security

- Parameterized queries (Prisma)
- Connection pooling
- SSL/TLS for connections

## Scalability Considerations

### Horizontal Scaling

- Stateless API servers (load balancer ready)
- Redis for shared state
- Database connection pooling

### Caching Strategy

- L1: Frontend (SWR cache)
- L2: Redis (Backend cache)
- L3: Database

### Performance Optimizations

- Database indexing on frequently queried fields
- Pagination for large datasets
- Lazy loading for charts
- WebSocket for real-time updates (reduces polling)

## Monitoring & Observability

### Logging

- Winston for structured logging
- Log levels: error, warn, info, debug
- Centralized log aggregation (future: ELK stack)

### Metrics

- Application metrics (latency, throughput)
- Database metrics (query performance)
- Cache hit/miss rates

### Health Checks

- `/api/health` endpoint
- Database connectivity checks
- Redis connectivity checks

## Deployment Architecture

### Development

- Docker Compose for local development
- Hot reload for all services
- Volumes for source code mounting

### Production

- Kubernetes for orchestration
- Azure Container Apps / AKS
- Managed PostgreSQL (Azure Database)
- Managed Redis (Azure Cache)
- CI/CD via GitHub Actions

## Future Enhancements

1. **Microservices Split**
   - Alert service
   - Data ingestion service
   - Analytics service

2. **Advanced Features**
   - Machine learning for anomaly detection
   - GraphQL API
   - Mobile apps (React Native)

3. **Infrastructure**
   - CDN for static assets
   - Multi-region deployment
   - Read replicas for database
