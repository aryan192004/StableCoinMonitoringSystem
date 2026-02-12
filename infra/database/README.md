# Database Infrastructure

PostgreSQL database setup, migrations, and seed data.

## Structure

- `migrations/` - Database schema migrations
- `seeds/` - Initial seed data for development
- `schemas/` - SQL schema definitions

## Setup

### Local PostgreSQL

```bash
# Start PostgreSQL with Docker
docker run --name stablecoin-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=stablecoin_db \
  -p 5432:5432 \
  -d postgres:15

# Or use docker-compose from infra/docker/
cd ../docker
docker-compose up -d postgres
```

### Run Migrations

```bash
# From project root
pnpm --filter @stablecoin/backend migrate

# Or manually with psql
psql -U postgres -h localhost -d stablecoin_db -f migrations/001_initial_schema.sql
```

### Seed Data

```bash
# Load seed data
psql -U postgres -h localhost -d stablecoin_db -f seeds/001_seed_stablecoins.sql
```

## Schema Overview

### Tables

- **stablecoins** - Core stablecoin information
- **market_data** - Price and market metrics (time-series)
- **liquidity_metrics** - Liquidity measurements (time-series)
- **reserves** - Reserve composition snapshots
- **risk_assessments** - Risk calculations (time-series)
- **users** - User accounts
- **alerts** - User alert configurations

## Backup & Restore

```bash
# Backup
pg_dump -U postgres stablecoin_db > backup.sql

# Restore
psql -U postgres -d stablecoin_db < backup.sql
```
