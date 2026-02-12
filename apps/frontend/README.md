# Frontend Application

Next.js-based web application for the Stablecoin Monitoring Platform.

## Features

- **Dashboard**: Overview of all stablecoins with sortable columns
- **Peg Deviation Tracker**: Real-time price monitoring with charts
- **Liquidity View**: Order book depth and DEX analytics
- **Reserve Transparency**: Asset composition breakdown
- **Alerts**: Customizable notification system

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Chart.js & TradingView Lightweight Charts
- SWR for data fetching
- Socket.IO for real-time updates

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev

# Build for production
pnpm run build

# Run tests
pnpm run test
```

## Project Structure

```
frontend/
├── app/              # Next.js app router pages
├── components/       # React components
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── types/           # TypeScript types
├── styles/          # Global styles
└── public/          # Static assets
```

## Environment Variables

See `.env.example` in the root directory for required environment variables.
