# Docker Infrastructure

Container configurations for local development and production deployment.

## Quick Start

### Development Environment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- FastAPI Services: http://localhost:8001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Building Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build frontend
docker-compose build backend-api
docker-compose build fastapi-services
```

### Production Build

```bash
# Build production images
docker build -f Dockerfile.frontend -t stablecoin-frontend:latest ../..
docker build -f Dockerfile.backend -t stablecoin-backend:latest ../..
docker build -f Dockerfile.fastapi -t stablecoin-fastapi:latest ../..
```

## Services

### Frontend
- **Image**: node:18-alpine
- **Port**: 3000
- **Build**: Multi-stage with Next.js optimization

### Backend API
- **Image**: node:18-alpine
- **Port**: 8000
- **Features**: Express.js, WebSocket, Prisma

### FastAPI Services
- **Image**: python:3.11-slim
- **Port**: 8001
- **Features**: Risk engine, liquidity monitoring

### PostgreSQL
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Credentials**: postgres/password

### Redis
- **Image**: redis:7-alpine
- **Port**: 6379
- **Usage**: Caching, session storage

## Environment Variables

Set in docker-compose.yml or use .env file:

```env
DATABASE_URL=postgresql://postgres:password@postgres:5432/stablecoin_db
REDIS_URL=redis://redis:6379
NODE_ENV=development
API_PORT=8000
FASTAPI_PORT=8001
```

## Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Inspect specific service
docker inspect stablecoin-postgres
```

## Volumes

Persistent data storage:
- `postgres_data` - Database files
- `redis_data` - Redis persistence

## Troubleshooting

### Reset Database

```bash
docker-compose down -v
docker-compose up -d postgres
```

### View Service Logs

```bash
docker-compose logs -f backend-api
docker-compose logs -f postgres
```

### Rebuild from Scratch

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```
