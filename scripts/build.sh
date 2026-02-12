#!/bin/bash

# Build script for all packages and apps
# Usage: ./scripts/build.sh

set -e

echo "🔨 Building Stablecoin Monitoring Platform..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Build packages first (dependencies)
echo -e "${BLUE}📦 Building shared packages...${NC}"
pnpm --filter "@stablecoin/config" build
pnpm --filter "@stablecoin/types" build
pnpm --filter "@stablecoin/utils" build
pnpm --filter "@stablecoin/ui" build
echo -e "${GREEN}✓ Packages built successfully${NC}"
echo ""

# Build frontend
echo -e "${BLUE}🎨 Building frontend...${NC}"
pnpm --filter "@stablecoin/frontend" build
echo -e "${GREEN}✓ Frontend built successfully${NC}"
echo ""

# Build backend
echo -e "${BLUE}⚙️  Building backend...${NC}"
pnpm --filter "@stablecoin/backend" build
echo -e "${GREEN}✓ Backend built successfully${NC}"
echo ""

# Build Python services
echo -e "${BLUE}🐍 Building FastAPI services...${NC}"
cd apps/backend/services
pip install -r requirements.txt --quiet
echo -e "${GREEN}✓ FastAPI services ready${NC}"
echo ""

echo -e "${GREEN}✅ All builds completed successfully!${NC}"
