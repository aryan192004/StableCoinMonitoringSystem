/**
 * Stablecoin entity
 */
export interface Stablecoin {
  id: string;
  name: string;
  symbol: string;
  logoUrl?: string;
  website?: string;
  whitepaper?: string;
  blockchain: string[];
  issuer: string;
  type: 'fiat-backed' | 'crypto-backed' | 'algorithmic' | 'hybrid';
  launchDate: Date;
  isActive: boolean;
}

/**
 * Stablecoin market data
 */
export interface StablecoinMarketData {
  stablecoinId: string;
  price: number;
  pegDeviation: number;
  volume24h: number;
  volume7d: number;
  marketCap: number;
  circulatingSupply: number;
  holders: number;
  lastUpdated: Date;
}

/**
 * Historical price data point
 */
export interface PriceDataPoint {
  timestamp: Date;
  price: number;
  volume: number;
  deviation: number;
}

/**
 * Exchange price data
 */
export interface ExchangePrice {
  exchange: string;
  price: number;
  volume24h: number;
  lastUpdated: Date;
}

/**
 * Liquidity metrics
 */
export interface LiquidityMetrics {
  stablecoinId: string;
  totalLiquidity: number;
  orderBookDepth: {
    bids: number;
    asks: number;
  };
  bidAskSpread: number;
  dexLiquidity: number;
  cexLiquidity: number;
  liquidityScore: number;
  timestamp: Date;
}

/**
 * Reserve composition
 */
export interface ReserveComposition {
  stablecoinId: string;
  cash: number;
  treasuryBills: number;
  commercialPaper: number;
  corporateBonds: number;
  cryptoBacked: number;
  other: number;
  totalReserves: number;
  lastAudited: Date;
  auditor?: string;
  transparencyScore: number;
}

/**
 * Risk assessment
 */
export interface RiskAssessment {
  stablecoinId: string;
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: {
    pegStability: number;
    liquidity: number;
    volumeVolatility: number;
    reserveTransparency: number;
  };
  warnings: string[];
  calculatedAt: Date;
}

/**
 * Alert configuration
 */
export interface Alert {
  id: string;
  userId: string;
  stablecoinId: string;
  name: string;
  type: 'peg_deviation' | 'liquidity_drop' | 'volume_spike' | 'market_cap_change' | 'reserve_change';
  condition: 'above' | 'below' | 'equals';
  threshold: number;
  enabled: boolean;
  channels: AlertChannel[];
  createdAt: Date;
  lastTriggered?: Date;
}

export type AlertChannel = 'email' | 'telegram' | 'push' | 'webhook';

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: Date;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Wallet Connection Types
 */
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
}

export interface WalletActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

/**
 * Token and Portfolio Types
 */
export interface TokenBalance {
  tokenAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  formattedBalance: string;
  priceUsd?: number;
  valueUsd?: number;
  logoUrl?: string;
  isStablecoin?: boolean;
}

export interface PortfolioSummary {
  totalValueUsd: number;
  ethBalance: TokenBalance;
  tokenBalances: TokenBalance[];
  allocations: TokenAllocation[];
  stablecoinExposure: number;
  riskScore: number;
  lastUpdated: Date;
}

export interface TokenAllocation {
  symbol: string;
  percentage: number;
  valueUsd: number;
  color: string;
}

export interface PortfolioRiskMetrics {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: {
    diversification: number;
    stablecoinConcentration: number;
    volatility: number;
    liquidityRisk: number;
  };
  recommendations: string[];
}
