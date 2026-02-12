import { config } from 'dotenv';

// Load environment variables
config();

/**
 * Application configuration
 */
export const appConfig = {
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;

/**
 * API configuration
 */
export const apiConfig = {
  port: parseInt(process.env.API_PORT || '8000', 10),
  fastApiPort: parseInt(process.env.FASTAPI_PORT || '8001', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean),
} as const;

/**
 * Database configuration
 */
export const databaseConfig = {
  url: process.env.DATABASE_URL || 'postgresql://localhost:5432/stablecoin_db',
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
} as const;

/**
 * External API keys
 */
export const externalApiConfig = {
  binance: {
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
  },
  coinbase: {
    apiKey: process.env.COINBASE_API_KEY,
    apiSecret: process.env.COINBASE_API_SECRET,
  },
  kraken: {
    apiKey: process.env.KRAKEN_API_KEY,
    apiSecret: process.env.KRAKEN_API_SECRET,
  },
} as const;

/**
 * Blockchain RPC endpoints
 */
export const blockchainConfig = {
  ethereum: {
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
  },
  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  },
} as const;

/**
 * Authentication configuration
 */
export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret',
  jwtExpiry: process.env.JWT_EXPIRY || '24h',
} as const;

/**
 * Notification configuration
 */
export const notificationConfig = {
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
    },
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
  },
} as const;

/**
 * Rate limiting configuration
 */
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
} as const;

/**
 * Monitoring configuration
 */
export const monitoringConfig = {
  logLevel: process.env.LOG_LEVEL || 'info',
  enableMetrics: process.env.ENABLE_METRICS === 'true',
} as const;
