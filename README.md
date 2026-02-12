# 🪙 Stablecoin Risk & Liquidity Monitoring Platform

A real-time web platform for monitoring stablecoin health, tracking peg deviations, analyzing liquidity depth, and providing transparent risk indicators.

> **🎨 New**: Professional UI redesign with institutional-grade fintech SaaS aesthetic. See [UI Design System](./docs/UI-DESIGN-SYSTEM.md) for details.

## 🎯 Overview

This platform provides comprehensive stablecoin monitoring including:

- **Peg Deviation Tracking** - Real-time monitoring of price deviations from $1.00
- **Liquidity Analytics** - Order book depth and DEX liquidity pool analysis
- **Reserve Transparency** - Asset composition breakdown and historical tracking
- **Risk Indicators** - Rule-based scoring system for stability assessment
- **Alert System** - Customizable notifications via email, Telegram, and web push

## ✨ UI Features

Built with modern fintech SaaS aesthetics for institutional investors:

- **Professional Design**: Clean, Bloomberg Terminal-inspired interface
- **Real-time Dashboards**: Live KPI cards with animated metrics
- **Interactive Charts**: Price history, liquidity depth, reserve composition
- **Smart Tables**: Sortable, clickable stablecoin rankings
- **Intuitive Navigation**: Sidebar with active state highlighting
- **Responsive Layout**: Mobile-first design that scales to desktop
- **Design System**: Inter font, 8px grid, consistent color palette (#3B82F6 primary)

📖 **Documentation**: [UI Design System](./docs/UI-DESIGN-SYSTEM.md) | [Wireframes](./docs/WIREFRAMES.md)

## 🏗️ Architecture

This is a monorepo containing:

- **Frontend**: Next.js/React application with real-time data visualization
- **Backend**: Node.js API layer + FastAPI services for compute-intensive tasks
- **Database**: PostgreSQL for persistent storage
- **Infrastructure**: Docker containers, Kubernetes manifests, and Terraform IaC

## 📦 Project Structure

```
stablecoin/
├── apps/               # Application services
│   ├── frontend/       # Next.js web application
│   └── backend/        # Node.js API + FastAPI services
├── packages/           # Shared libraries
│   ├── ui/             # Shared UI components
│   ├── utils/          # Common utilities
│   ├── types/          # TypeScript type definitions
│   └── config/         # Configuration management
├── infra/              # Infrastructure and deployment
│   ├── database/       # PostgreSQL migrations and schemas
│   ├── docker/         # Container configurations
│   ├── k8s/            # Kubernetes manifests
│   └── terraform/      # Cloud infrastructure as code
├── docs/               # Documentation
└── scripts/            # Utility scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Python >= 3.10
- PostgreSQL >= 14
- Docker (optional, for containerized development)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd stablecoin

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
pnpm run migrate

# Start development servers
pnpm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- FastAPI Services: http://localhost:8001

## 🛠️ Development

### Available Scripts

```bash
pnpm run dev        # Start all services in development mode
pnpm run build      # Build all packages and apps
pnpm run test       # Run all tests
pnpm run lint       # Lint all code
pnpm run setup      # Initial setup and build
```

### Working with Apps

```bash
# Frontend development
cd apps/frontend
pnpm run dev

# Backend development
cd apps/backend
pnpm run dev:api      # Node.js API
pnpm run dev:services # FastAPI services
```

## 📊 Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Charts**: TradingView Lightweight Charts, Chart.js
- **State Management**: React Context + SWR for data fetching
- **Real-time**: WebSocket client

### Backend
- **API Layer**: Node.js with Express.js
- **Services**: FastAPI (Python) for compute-heavy operations
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Job Scheduling**: Node-cron for data polling
- **WebSocket**: Socket.io

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes
- **IaC**: Terraform
- **CI/CD**: GitHub Actions

## 🔗 Data Sources

- Exchange APIs: Binance, Coinbase, Kraken
- DEX APIs: Uniswap, Curve, Balancer
- On-chain data: Ethereum, Solana
- Reserve disclosures: Official issuer reports

## 📈 Risk Scoring Algorithm

The platform uses a rule-based weighted scoring system:

| Metric               | Weight |
|---------------------|--------|
| Peg deviation       | 30%    |
| Liquidity depth     | 25%    |
| Volume volatility   | 20%    |
| Reserve transparency| 25%    |

Risk levels:
- 🟢 **Green** (0-0.3): Stable
- 🟡 **Yellow** (0.3-0.7): Mild risk
- 🔴 **Red** (0.7-1.0): High risk

## 📝 API Documentation

API documentation is available at:
- REST API: http://localhost:8000/docs
- FastAPI Services: http://localhost:8001/docs

## 🧪 Testing

```bash
# Run all tests
pnpm run test

# Run tests with coverage
pnpm run test:coverage

# Run specific test suite
pnpm --filter @stablecoin/frontend test
```

## 🚢 Deployment

### Using Docker Compose (Development)

```bash
docker-compose up -d
```

### Using Kubernetes (Production)

```bash
kubectl apply -f infra/k8s/
```

### Using Terraform (Cloud Infrastructure)

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

## 📚 Documentation

Detailed documentation is available in the [docs/](docs/) directory:

- [API Reference](docs/api/)
- [Architecture Decisions](docs/architecture/)
- [User Guides](docs/user-guides/)

## 🤝 Contributing

Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions, please open a GitHub issue or contact the team.

---

**Status**: 🚧 In Development - MVP Phase 1

**Target Launch**: Q2 2026
