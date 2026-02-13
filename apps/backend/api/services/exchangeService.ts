import axios from 'axios';

// Binance API configuration
const BINANCE_BASE_URL = 'https://api.binance.com/api/v3';
const CACHE_TTL = 10000; // 10 seconds cache for orderbook data

// Map stablecoin symbols to Binance trading pairs (vs USDT as quote)
const BINANCE_PAIRS: Record<string, string> = {
  usdt: 'USDCUSDT', // USDT vs USDC (stablecoin pair for USDT liquidity)
  usdc: 'USDCUSDT',
  busd: 'BUSDUSDT',
  dai: 'DAIUSDT',
  tusd: 'TUSDUSDT',
  frax: 'USDCUSDT', // Fallback to USDC/USDT pair
};

interface CachedData<T> {
  data: T;
  timestamp: number;
}

interface OrderbookLevel {
  price: number;
  quantity: number;
  total: number; // price * quantity
}

interface OrderbookData {
  symbol: string;
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  bidAskSpread: number;
  bidAskSpreadPercent: number;
  topBid: number;
  topAsk: number;
  lastUpdated: number;
}

interface LiquidityMetrics {
  symbol: string;
  bidLiquidity: number; // Total USD value in bid orders
  askLiquidity: number; // Total USD value in ask orders
  totalLiquidity: number;
  bidAskSpread: number;
  spreadPercent: number;
  depth1Percent: number; // Liquidity within 1% of mid price
  depth5Percent: number; // Liquidity within 5% of mid price
  marketQuality: number; // Overall market quality score (0-100)
}

interface VolumeData {
  symbol: string;
  volume24h: number;
  quoteVolume24h: number;
  trades24h: number;
  lastPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
}

// In-memory cache
const cache = new Map<string, CachedData<any>>();

function getCacheKey(prefix: string, params: any): string {
  return `${prefix}_${JSON.stringify(params)}`;
}

function getFromCache<T>(key: string, customTTL?: number): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const ttl = customTTL || CACHE_TTL;
  const age = Date.now() - cached.timestamp;
  if (age > ttl) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Get orderbook depth from Binance
 */
export async function getOrderbook(
  symbol: string,
  limit: number = 100
): Promise<OrderbookData> {
  const pair = BINANCE_PAIRS[symbol.toLowerCase()];
  if (!pair) {
    throw new Error(`Unsupported stablecoin for Binance: ${symbol}`);
  }

  const cacheKey = getCacheKey('orderbook', { symbol, limit });
  const cached = getFromCache<OrderbookData>(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`${BINANCE_BASE_URL}/depth`, {
      params: {
        symbol: pair,
        limit: limit,
      },
      timeout: 5000,
    });

    const bids: OrderbookLevel[] = response.data.bids.map(
      ([price, quantity]: [string, string]) => {
        const p = parseFloat(price);
        const q = parseFloat(quantity);
        return { price: p, quantity: q, total: p * q };
      }
    );

    const asks: OrderbookLevel[] = response.data.asks.map(
      ([price, quantity]: [string, string]) => {
        const p = parseFloat(price);
        const q = parseFloat(quantity);
        return { price: p, quantity: q, total: p * q };
      }
    );

    const topBid = bids.length > 0 ? bids[0].price : 0;
    const topAsk = asks.length > 0 ? asks[0].price : 0;
    const bidAskSpread = topAsk - topBid;
    const midPrice = (topBid + topAsk) / 2;
    const bidAskSpreadPercent = midPrice > 0 ? (bidAskSpread / midPrice) * 100 : 0;

    const orderbookData: OrderbookData = {
      symbol: pair,
      bids,
      asks,
      bidAskSpread,
      bidAskSpreadPercent,
      topBid,
      topAsk,
      lastUpdated: Date.now(),
    };

    setCache(cacheKey, orderbookData);
    return orderbookData;
  } catch (error: any) {
    console.error(`Error fetching orderbook for ${symbol}:`, error.message);
    throw new Error(`Failed to fetch orderbook: ${error.message}`);
  }
}

/**
 * Calculate liquidity metrics from orderbook
 */
export async function getLiquidityMetrics(
  symbol: string
): Promise<LiquidityMetrics> {
  const orderbook = await getOrderbook(symbol, 500); // Get deeper orderbook

  const midPrice = (orderbook.topBid + orderbook.topAsk) / 2;
  
  // Calculate total liquidity
  const bidLiquidity = orderbook.bids.reduce((sum, bid) => sum + bid.total, 0);
  const askLiquidity = orderbook.asks.reduce((sum, ask) => sum + ask.total, 0);
  const totalLiquidity = bidLiquidity + askLiquidity;

  // Calculate liquidity within 1% of mid price
  const priceRange1Percent = midPrice * 0.01;
  const depth1Percent =
    orderbook.bids
      .filter((bid) => midPrice - bid.price <= priceRange1Percent)
      .reduce((sum, bid) => sum + bid.total, 0) +
    orderbook.asks
      .filter((ask) => ask.price - midPrice <= priceRange1Percent)
      .reduce((sum, ask) => sum + ask.total, 0);

  // Calculate liquidity within 5% of mid price
  const priceRange5Percent = midPrice * 0.05;
  const depth5Percent =
    orderbook.bids
      .filter((bid) => midPrice - bid.price <= priceRange5Percent)
      .reduce((sum, bid) => sum + bid.total, 0) +
    orderbook.asks
      .filter((ask) => ask.price - midPrice <= priceRange5Percent)
      .reduce((sum, ask) => sum + ask.total, 0);

  // Calculate market quality score (0-100)
  // Based on: tight spread (40%), high liquidity (40%), balanced book (20%)
  const spreadScore = Math.max(0, 100 - orderbook.bidAskSpreadPercent * 1000);
  const liquidityScore = Math.min(100, (totalLiquidity / 1000000) * 10); // Normalize to millions
  const balanceScore =
    bidLiquidity > 0 && askLiquidity > 0
      ? 100 - Math.abs(bidLiquidity - askLiquidity) / Math.max(bidLiquidity, askLiquidity) * 100
      : 0;
  const marketQuality = spreadScore * 0.4 + liquidityScore * 0.4 + balanceScore * 0.2;

  return {
    symbol: orderbook.symbol,
    bidLiquidity,
    askLiquidity,
    totalLiquidity,
    bidAskSpread: orderbook.bidAskSpread,
    spreadPercent: orderbook.bidAskSpreadPercent,
    depth1Percent,
    depth5Percent,
    marketQuality: Math.round(marketQuality * 100) / 100,
  };
}

/**
 * Get 24-hour trading statistics
 */
export async function get24hStats(symbol: string): Promise<VolumeData> {
  const pair = BINANCE_PAIRS[symbol.toLowerCase()];
  if (!pair) {
    throw new Error(`Unsupported stablecoin for Binance: ${symbol}`);
  }

  const cacheKey = getCacheKey('24h_stats', { symbol });
  const cached = getFromCache<VolumeData>(cacheKey, 60000); // 60s cache for stats
  if (cached) return cached;

  try {
    const response = await axios.get(`${BINANCE_BASE_URL}/ticker/24hr`, {
      params: {
        symbol: pair,
      },
      timeout: 5000,
    });

    const data = response.data;
    const volumeData: VolumeData = {
      symbol: pair,
      volume24h: parseFloat(data.volume),
      quoteVolume24h: parseFloat(data.quoteVolume),
      trades24h: data.count,
      lastPrice: parseFloat(data.lastPrice),
      priceChange24h: parseFloat(data.priceChange),
      priceChangePercent24h: parseFloat(data.priceChangePercent),
    };

    setCache(cacheKey, volumeData);
    return volumeData;
  } catch (error: any) {
    console.error(`Error fetching 24h stats for ${symbol}:`, error.message);
    throw new Error(`Failed to fetch 24h stats: ${error.message}`);
  }
}

/**
 * Get comprehensive exchange data (orderbook + stats)
 */
export async function getExchangeData(symbol: string) {
  try {
    const [orderbook, liquidityMetrics, stats] = await Promise.all([
      getOrderbook(symbol),
      getLiquidityMetrics(symbol),
      get24hStats(symbol),
    ]);

    return {
      symbol,
      orderbook,
      liquidity: liquidityMetrics,
      stats,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    console.error(`Error fetching exchange data for ${symbol}:`, error.message);
    throw error;
  }
}

/**
 * Get liquidity health score (0-100)
 */
export function calculateLiquidityHealth(metrics: LiquidityMetrics): number {
  const { spreadPercent, depth1Percent, totalLiquidity, marketQuality } = metrics;

  // Weight factors:
  // - Tight spread: 30%
  // - Deep orderbook near mid: 30%
  // - Total liquidity: 20%
  // - Market quality: 20%
  
  const spreadHealth = Math.max(0, 100 - spreadPercent * 500); // Lower spread = better
  const depthHealth = Math.min(100, (depth1Percent / 100000) * 100); // More depth = better
  const liquidityHealth = Math.min(100, (totalLiquidity / 10000000) * 100); // Normalize
  
  const overallHealth =
    spreadHealth * 0.3 +
    depthHealth * 0.3 +
    liquidityHealth * 0.2 +
    marketQuality * 0.2;

  return Math.round(overallHealth * 100) / 100;
}

/**
 * Clear cache (useful for testing or manual refresh)
 */
export function clearCache(): void {
  cache.clear();
}
