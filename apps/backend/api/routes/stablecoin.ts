import { Router, Request, Response, NextFunction } from 'express';
import { PriceDataPoint } from '@stablecoin/types';
import * as priceService from '../services/priceService';
import * as exchangeService from '../services/exchangeService';

const router = Router();

/**
 * GET /api/stablecoins
 * Get all stablecoins with current metrics
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const symbols = ['usdt', 'usdc', 'dai', 'busd', 'frax', 'tusd'];
    const pricesData = await priceService.getMultiplePrices(symbols);

    const stablecoins = Object.keys(pricesData).map((symbol) => {
      const data = pricesData[symbol];
      const pegDeviation = ((data.current - 1.0) / 1.0) * 100;
      
      // Simple risk score based on peg deviation and volume
      const riskScore = Math.min(1.0, Math.abs(pegDeviation) * 0.1);

      return {
        id: symbol,
        name: getStablecoinName(symbol),
        symbol: symbol.toUpperCase(),
        price: data.current,
        pegDeviation,
        volume24h: data.volume24h,
        marketCap: data.marketCap,
        riskScore,
        lastUpdated: data.lastUpdated,
      };
    });

    res.json(stablecoins);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stablecoins/:id
 * Get detailed information for a specific stablecoin
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const priceData = await priceService.getCurrentPrice(id);
    const pegDeviation = ((priceData.current - 1.0) / 1.0) * 100;
    const riskScore = Math.min(1.0, Math.abs(pegDeviation) * 0.1);

    const stablecoin = {
      id,
      name: getStablecoinName(id),
      symbol: id.toUpperCase(),
      price: priceData.current,
      pegDeviation,
      volume24h: priceData.volume24h,
      marketCap: priceData.marketCap,
      change24h: priceData.change24h,
      riskScore,
      lastUpdated: priceData.lastUpdated,
    };

    res.json(stablecoin);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stablecoins/:id/peg-history
 * Get historical peg data
 */
router.get('/:id/peg-history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { period = '30' } = req.query;

    // Convert period to days
    const days = parseInt(period as string, 10) || 30;
    
    const historicalData = await priceService.getHistoricalPrices(id, days);
    const pegMetrics = priceService.calculatePegMetrics(historicalData);

    res.json({
      id,
      period: `${days}d`,
      data: historicalData,
      metrics: pegMetrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stablecoins/:id/liquidity
 * Get liquidity data for a stablecoin
 */
router.get('/:id/liquidity', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const exchangeData = await exchangeService.getExchangeData(id);
    const liquidityHealth = exchangeService.calculateLiquidityHealth(
      exchangeData.liquidity
    );

    const liquidity = {
      exchanges: [
        {
          name: 'Binance',
          pair: exchangeData.symbol,
          orderBookDepth: {
            bids: exchangeData.liquidity.bidLiquidity,
            asks: exchangeData.liquidity.askLiquidity,
          },
          bidAskSpread: exchangeData.liquidity.bidAskSpread,
          spreadPercent: exchangeData.liquidity.spreadPercent,
          topBid: exchangeData.orderbook.topBid,
          topAsk: exchangeData.orderbook.topAsk,
        },
      ],
      totalLiquidity: exchangeData.liquidity.totalLiquidity,
      depth1Percent: exchangeData.liquidity.depth1Percent,
      depth5Percent: exchangeData.liquidity.depth5Percent,
      marketQuality: exchangeData.liquidity.marketQuality,
      liquidityHealth,
      stats: exchangeData.stats,
      timestamp: exchangeData.timestamp,
    };

    res.json({ id, liquidity });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stablecoins/:id/reserves
 * Get reserve composition data
 */
router.get('/:id/reserves', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // TODO: Implement actual data fetching logic
    const reserves = {
      cash: 15.5,
      treasuryBills: 65.2,
      commercialPaper: 12.3,
      cryptoBacked: 5.0,
      other: 2.0,
      lastAudited: new Date('2026-01-15'),
      transparencyScore: 0.85,
    };

    res.json({ id, reserves });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/liquidity/predict/:stablecoin
 * Get liquidity predictions for multiple time horizons
 */
router.get('/liquidity/predict/:stablecoin', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stablecoin } = req.params;

    // TODO: Integrate with Python liquidity prediction model
    const predictions = {
      stablecoin: stablecoin.toUpperCase(),
      predictions: {
        '1h': 0.85,
        '1d': 0.82,
        '1w': 0.78,
        '1m': 0.75
      },
      confidence: 0.87,
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    res.json(predictions);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/anomalies/:stablecoin
 * Get anomaly detection results for a stablecoin
 */
router.get('/anomalies/:stablecoin', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stablecoin } = req.params;

    // TODO: Integrate with Python anomaly detection model
    const anomalyResult = {
      stablecoin: stablecoin.toUpperCase(),
      anomaly_score: -0.15,
      is_anomaly: false,
      severity: 'Normal',
      alerts: [],
      confidence: 0.92,
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    res.json(anomalyResult);
  } catch (error) {
    next(error);
  }
});

/**
 * Helper function to get stablecoin full name
 */
function getStablecoinName(symbol: string): string {
  const names: Record<string, string> = {
    usdt: 'Tether',
    usdc: 'USD Coin',
    dai: 'Dai',
    busd: 'Binance USD',
    frax: 'Frax',
    tusd: 'TrueUSD',
    usdd: 'USDD',
    gusd: 'Gemini Dollar',
  };
  return names[symbol.toLowerCase()] || symbol.toUpperCase();
}

export default router;
