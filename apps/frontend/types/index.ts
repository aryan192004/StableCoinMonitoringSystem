export interface Stablecoin {
  id: string;
  name: string;
  symbol: string;
  price: number;
  pegDeviation: number;
  volume24h: number;
  marketCap: number;
  riskScore: number;
  lastUpdated: Date;
}

export interface PegData {
  timestamp: Date;
  price: number;
  deviation: number;
  exchange: string;
}

export interface LiquidityData {
  exchange: string;
  orderBookDepth: {
    bids: number;
    asks: number;
  };
  bidAskSpread: number;
  liquidityScore: number;
}

export interface ReserveData {
  cash: number;
  treasuryBills: number;
  commercialPaper: number;
  cryptoBacked: number;
  other: number;
  lastAudited: Date;
  transparencyScore: number;
}

export interface Alert {
  id: string;
  userId: string;
  stablecoinId: string;
  type: 'peg_deviation' | 'liquidity_drop' | 'volume_spike' | 'market_cap_change';
  threshold: number;
  enabled: boolean;
  channels: ('email' | 'telegram' | 'push')[];
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskIndicator {
  overall: RiskLevel;
  score: number;
  factors: {
    pegStability: number;
    liquidity: number;
    volumeVolatility: number;
    reserveTransparency: number;
  };
}
