# Backend Services

Backend infrastructure for the Stablecoin Monitoring Platform, consisting of:

1. **Node.js API Layer** - RESTful API with Express.js
2. **FastAPI Services** - Python-based compute services for risk calculations

## Architecture

### Node.js API (`/api`)
- Express.js REST API
- WebSocket support with Socket.IO
- Database operations with Prisma
- Redis caching
- Cron jobs for data polling

### FastAPI Services (`/services`)
- Risk score calculation engine
- Liquidity analysis
- Heavy computational tasks

## Tech Stack

- **Node.js** (v18+): API layer
- **Python** (3.10+): Compute services
- **Express.js**: Web framework
- **FastAPI**: Python API framework
- **Prisma**: ORM for PostgreSQL
- **Redis**: Caching layer
- **Socket.IO**: Real-time communication

## Development

### Setup

```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies
cd services
pip install -r requirements.txt

# Generate Prisma client
pnpm run prisma:generate

# Run database migrations
pnpm run migrate
```

### Running

```bash
# Run both services together
pnpm run dev

# Or run separately
pnpm run dev:api       # Node.js API on port 8000
pnpm run dev:services  # FastAPI on port 8001
```

## API Endpoints

### Node.js API (Port 8000)

- `GET /api/health` - Health check
- `GET /api/stablecoins` - List all stablecoins
- `GET /api/stablecoins/:id` - Get stablecoin details
- `GET /api/stablecoins/:id/peg-history` - Historical peg data
- `GET /api/stablecoins/:id/liquidity` - Liquidity metrics
- `GET /api/stablecoins/:id/reserves` - Reserve composition
- `POST /api/alerts` - Create alert
- `GET /api/alerts` - List user alerts

### FastAPI Services (Port 8001)

- `POST /api/risk/calculate` - Calculate risk score
- `POST /api/liquidity/analyze` - Analyze liquidity

## Testing

```bash
# Run tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch
```

## Database

Uses PostgreSQL with Prisma ORM. Schema is defined in `prisma/schema.prisma`.

```bash
# Create migration
pnpm run migrate

# Deploy to production
pnpm run migrate:prod
```

## Environment Variables

See `.env.example` in the root directory.

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `API_PORT` - Node.js API port (default: 8000)
- `FASTAPI_PORT` - FastAPI port (default: 8001)
