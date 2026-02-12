#!/bin/bash

# Deployment script
# Usage: ./scripts/deploy.sh [environment]
# Example: ./scripts/deploy.sh prod

set -e

ENVIRONMENT=${1:-dev}

echo "🚀 Deploying to $ENVIRONMENT..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Build
echo -e "${BLUE}Building application...${NC}"
./scripts/build.sh

# Docker build
echo -e "${BLUE}Building Docker images...${NC}"
docker build -f infra/docker/Dockerfile.frontend -t stablecoin-frontend:latest .
docker build -f infra/docker/Dockerfile.backend -t stablecoin-backend:latest .
docker build -f infra/docker/Dockerfile.fastapi -t stablecoin-fastapi:latest .
echo -e "${GREEN}✓ Docker images built${NC}"
echo ""

# Tag for environment
echo -e "${BLUE}Tagging images for $ENVIRONMENT...${NC}"
docker tag stablecoin-frontend:latest stablecoin-frontend:$ENVIRONMENT
docker tag stablecoin-backend:latest stablecoin-backend:$ENVIRONMENT
docker tag stablecoin-fastapi:latest stablecoin-fastapi:$ENVIRONMENT
echo -e "${GREEN}✓ Images tagged${NC}"
echo ""

# Push to registry (configure your registry)
# echo -e "${BLUE}Pushing to container registry...${NC}"
# docker push your-registry.azurecr.io/stablecoin-frontend:$ENVIRONMENT
# docker push your-registry.azurecr.io/stablecoin-backend:$ENVIRONMENT
# docker push your-registry.azurecr.io/stablecoin-fastapi:$ENVIRONMENT

# Deploy to Kubernetes (if applicable)
# kubectl apply -f infra/k8s/

echo -e "${GREEN}✅ Deployment to $ENVIRONMENT completed!${NC}"
