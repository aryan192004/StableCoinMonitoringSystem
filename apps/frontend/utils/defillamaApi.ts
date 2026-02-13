/**
 * DefiLlama API Client for Frontend
 * Provides typed functions to fetch stablecoin data from DefiLlama via backend
 */

import apiClient from './api';

const MARKET_API = '/market/defillama';

// Types
export interface StablecoinData {
  id: number | string;
  name: string;
  symbol: string;
  price?: number;
  marketCap: number;
  circulatingSupply: number;
  pegType?: string;
  pegMechanism?: string;
  priceSource?: string;
  chains?: string[];
}

export interface StablecoinHistoryData {
  id: number;
  name: string;
  symbol: string;
  gecko_id?: string;
  pegType?: string;
  pegMechanism?: string;
  priceSource?: string;
  circulating?: any;
  totalCirculating?: any;
  chainCirculating?: any;
}

export interface ChainBreakdown {
  chain: string;
  amount: number;
}

export interface MarketCapTrend {
  id: number;
  symbol: string;
  name: string;
  data: Array<{
    date: number;
    marketCap: number;
  }>;
}

export interface DefiLlamaResponse<T> {
  data: T;
}

export interface TopStablecoinsResponse {
  count: number;
  stablecoins: StablecoinData[];
}

export interface MarketCapTrendsResponse {
  trends: MarketCapTrend[];
  period: string;
  count: number;
}

export interface ChainsResponse {
  symbol: string;
  chains: ChainBreakdown[];
}

/**
 * Get all stablecoins with prices and market data
 */
export async function getAllStablecoins(includePrices: boolean = true): Promise<any> {
  const response = await apiClient.get(`${MARKET_API}/stablecoins`, {
    params: { include_prices: includePrices },
  });
  return response.data;
}

/**
 * Get top stablecoins by market cap
 */
export async function getTopStablecoins(limit: number = 10): Promise<TopStablecoinsResponse> {
  const response = await apiClient.get(`${MARKET_API}/stablecoins/top`, {
    params: { limit },
  });
  return response.data;
}

/**
 * Get stablecoin data by symbol
 */
export async function getStablecoinBySymbol(symbol: string): Promise<StablecoinData> {
  const response = await apiClient.get(`${MARKET_API}/stablecoins/${symbol}`);
  return response.data;
}

/**
 * Get historical data for a specific stablecoin
 */
export async function getStablecoinHistory(symbol: string): Promise<StablecoinHistoryData> {
  const response = await apiClient.get(`${MARKET_API}/stablecoins/${symbol}/history`);
  return response.data;
}

/**
 * Get chain breakdown for a specific stablecoin
 */
export async function getStablecoinChains(symbol: string): Promise<ChainsResponse> {
  const response = await apiClient.get(`${MARKET_API}/stablecoins/${symbol}/chains`);
  return response.data;
}

/**
 * Get historical charts for all stablecoins
 */
export async function getAllStablecoinCharts(): Promise<any> {
  const response = await apiClient.get(`${MARKET_API}/charts/all`);
  return response.data;
}

/**
 * Get market cap trends for top stablecoins
 * Perfect for dashboard analytics and charting
 */
export async function getMarketCapTrends(
  limit: number = 10,
  days: number = 30
): Promise<MarketCapTrendsResponse> {
  const response = await apiClient.get(`${MARKET_API}/analytics/market-cap-trends`, {
    params: { limit, days },
  });
  return response.data;
}

/**
 * Get all DeFi protocols with TVL data
 */
export async function getProtocols(): Promise<any> {
  const response = await apiClient.get(`${MARKET_API}/protocols`);
  return response.data;
}

/**
 * Get detailed information for a specific protocol
 */
export async function getProtocolDetails(protocolSlug: string): Promise<any> {
  const response = await apiClient.get(`${MARKET_API}/protocols/${protocolSlug}`);
  return response.data;
}

/**
 * Health check for DefiLlama API
 */
export async function checkDefiLlamaHealth(): Promise<any> {
  const response = await apiClient.get(`${MARKET_API}/health`);
  return response.data;
}

/**
 * Format market cap for display
 */
export function formatMarketCap(value: number): string {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

/**
 * Extract chart data for a specific stablecoin from history
 */
export function extractChartData(
  history: StablecoinHistoryData,
  dataKey: string = 'peggedUSD'
): Array<{ date: Date; value: number }> {
  const chartData: Array<{ date: Date; value: number }> = [];

  const totalCirculating = history.totalCirculating?.totalCirculatingUSD;
  if (totalCirculating && Array.isArray(totalCirculating)) {
    totalCirculating.forEach((item: any) => {
      if (item.date && item[dataKey] !== undefined) {
        chartData.push({
          date: new Date(item.date * 1000), // Convert Unix timestamp to Date
          value: item[dataKey],
        });
      }
    });
  }

  return chartData;
}

/**
 * Calculate peg deviation percentage
 */
export function calculatePegDeviation(price: number, peg: number = 1.0): number {
  return ((price - peg) / peg) * 100;
}

/**
 * Get risk level based on peg deviation
 */
export function getRiskLevel(deviation: number): 'low' | 'medium' | 'high' {
  const absDeviation = Math.abs(deviation);
  if (absDeviation < 0.5) return 'low';
  if (absDeviation < 2.0) return 'medium';
  return 'high';
}
