#!/bin/bash

# Setup script for local development
# Usage: ./scripts/setup.sh

set -e

echo "🚀 Setting up Stablecoin Monitoring Platform..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}⚠️  Node.js 18+ required. Current version: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm not found. Installing...${NC}"
    npm install -g pnpm
fi
echo -e "${GREEN}✓ pnpm $(pnpm -v)${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Python 3 not found. Please install Python 3.10+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python $(python3 --version)${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found. Some features may not work.${NC}"
else
    echo -e "${GREEN}✓ Docker $(docker --version | cut -d' ' -f3)${NC}"
fi

echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
pnpm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Setup environment
echo -e "${BLUE}⚙️  Setting up environment...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Created .env file. Please configure it with your settings.${NC}"
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi
echo ""

# Setup database (with Docker)
if command -v docker &> /dev/null; then
    echo -e "${BLUE}🐘 Starting PostgreSQL and Redis...${NC}"
    cd infra/docker
    docker-compose up -d postgres redis
    cd ../..
    
    # Wait for PostgreSQL to be ready
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5
    
    echo -e "${GREEN}✓ Database services started${NC}"
    echo ""
    
    # Run migrations
    echo -e "${BLUE}🔄 Running database migrations...${NC}"
    # Uncomment when Prisma schema is ready:
    # pnpm --filter @stablecoin/backend prisma:generate
    # pnpm --filter @stablecoin/backend migrate
    echo -e "${YELLOW}⚠️  Manual migration required. See infra/database/README.md${NC}"
fi
echo ""

# Build packages
echo -e "${BLUE}🔨 Building packages...${NC}"
pnpm run build
echo -e "${GREEN}✓ Build completed${NC}"
echo ""

echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Configure .env file with your API keys"
echo "2. Run migrations: pnpm --filter @stablecoin/backend migrate"
echo "3. Start development: pnpm run dev"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  pnpm run dev         - Start all services"
echo "  pnpm run build       - Build all packages"
echo "  pnpm run test        - Run tests"
echo "  docker-compose up -d - Start Docker services"
