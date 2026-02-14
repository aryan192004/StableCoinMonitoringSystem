import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';

const router: Router = Router();

/**
 * GET /api/risk/:stablecoin
 * Get comprehensive risk assessment for a stablecoin
 * 
 * @param stablecoin - Symbol (USDT, USDC, DAI, BUSD, etc.)
 * @query refresh - Force refresh (bypass cache)
 * 
 * Response Format:
 * {
 *   "timestamp": "2026-02-12T10:30:00Z",
 *   "stablecoin": "USDT",
 *   "risk_assessment": {
 *     "risk_score": 72,
 *     "risk_level": "High",
 *     "depeg_probability": 0.37,
 *     "confidence": 0.89
 *   },
 *   "market_data": {...},
 *   "liquidity_metrics": {...},
 *   "volatility_metrics": {...},
 *   "multi_exchange_data": {...}
 * }
 */
router.get('/:stablecoin', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stablecoin } = req.params;
    const { refresh = 'false', simulate = 'none' } = req.query;

    // Validate stablecoin parameter
    const validStablecoins = ['USDT', 'USDC', 'DAI', 'BUSD', 'FRAX', 'TUSD'];
    if (!validStablecoins.includes(stablecoin.toUpperCase())) {
      return res.status(400).json({
        error: 'Invalid stablecoin',
        message: `Supported stablecoins: ${validStablecoins.join(', ')}`
      });
    }

    // Call Python ML backend for real risk calculation
    try {
      const mlResponse = await axios.post('http://localhost:8001/assess', {
        stablecoin: stablecoin.toUpperCase(),
        exchanges: ['binance', 'coinbase', 'kraken'],
        include_stress_test: simulate !== 'none'
      });
      res.json(mlResponse.data);
    } catch (mlError) {
      // Fallback to mock response if ML backend fails
      const riskData = generateMockRiskResponse(
        stablecoin.toUpperCase(),
        simulate as string
      );
      res.json({ ...riskData, error: 'ML backend unavailable, using mock data.' });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/risk/compare
 * Compare risk across multiple stablecoins
 * 
 * @query coins - Comma-separated list of stablecoins (default: USDT,USDC,DAI)
 * 
 * Response Format:
 * {
 *   "timestamp": "2026-02-12T10:30:00Z",
 *   "stablecoins": [
 *     { "symbol": "USDT", "risk_score": 45, "risk_level": "Medium", ... },
 *     { "symbol": "USDC", "risk_score": 22, "risk_level": "Low", ... }
 *   ],
 *   "rankings": {
 *     "by_risk": ["DAI", "USDC", "USDT"],
 *     "by_liquidity": ["USDT", "USDC", "DAI"]
 *   }
 * }
 */
router.get('/compare', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { coins = 'USDT,USDC,DAI' } = req.query;
    const stablecoinList = (coins as string).split(',').map(c => c.trim().toUpperCase());

    const comparisonData = {
      timestamp: new Date().toISOString(),
      stablecoins: stablecoinList.map(coin => ({
        symbol: coin,
        ...generateMockRiskResponse(coin, 'none').risk_assessment,
        market_cap: coin === 'USDT' ? '$95.4B' : coin === 'USDC' ? '$28.7B' : '$5.2B',
        volume_24h: coin === 'USDT' ? '$42.3B' : coin === 'USDC' ? '$8.1B' : '$412M'
      })),
      rankings: {
        by_risk: stablecoinList.sort((a, b) => 
          generateMockRiskResponse(a, 'none').risk_assessment.risk_score - 
          generateMockRiskResponse(b, 'none').risk_assessment.risk_score
        ),
        by_liquidity: ['USDT', 'USDC', 'DAI'],
        by_volume: ['USDT', 'USDC', 'DAI']
      }
    };

    res.json(comparisonData);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/risk/:stablecoin/history
 * Get historical risk scores for a stablecoin
 * 
 * @param stablecoin - Symbol
 * @query period - Time period (1h, 24h, 7d, 30d)
 * @query interval - Data interval (1m, 5m, 1h)
 */
router.get('/:stablecoin/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stablecoin } = req.params;
    const { period = '24h', interval = '1h' } = req.query;

    // Generate mock historical data
    const dataPoints = period === '1h' ? 60 : period === '24h' ? 24 : 168;
    const history = [];

    for (let i = 0; i < dataPoints; i++) {
      const timestamp = new Date(Date.now() - (dataPoints - i) * 3600000);
      history.push({
        timestamp: timestamp.toISOString(),
        risk_score: 30 + Math.random() * 40,
        peg_deviation: (Math.random() - 0.5) * 2,
        liquidity_score: 0.4 + Math.random() * 0.4,
        volume_24h: 40e9 + Math.random() * 10e9
      });
    }

    res.json({
      stablecoin: stablecoin.toUpperCase(),
      period,
      interval,
      data: history
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/risk/alerts/subscribe
 * Subscribe to risk alerts for a stablecoin
 * 
 * Body:
 * {
 *   "stablecoin": "USDT",
 *   "threshold": 70,
 *   "webhook_url": "https://..."
 * }
 */
router.post('/alerts/subscribe', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stablecoin, threshold = 60, webhook_url, email } = req.body;

    // TODO: Implement alert subscription logic

    res.json({
      success: true,
      subscription: {
        id: `sub_${Date.now()}`,
        stablecoin: stablecoin.toUpperCase(),
        threshold,
        webhook_url,
        email,
        created_at: new Date().toISOString(),
        status: 'active'
      },
      message: 'Alert subscription created successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Helper function to generate mock risk response
 * Includes simulation modes for hackathon demo
 */
function generateMockRiskResponse(stablecoin: string, simulate: string) {
  // Base scenarios
  const scenarios: Record<string, any> = {
    none: {
      risk_score: 35,
      peg_deviation: 0.15,
      liquidity_score: 0.72,
      volume_anomaly: false,
      current_price: 0.9985
    },
    svb_crisis: {
      risk_score: 78,
      peg_deviation: -3.8,
      liquidity_score: 0.28,
      volume_anomaly: true,
      current_price: 0.9620
    },
    ust_collapse: {
      risk_score: 95,
      peg_deviation: -45.0,
      liquidity_score: 0.05,
      volume_anomaly: true,
      current_price: 0.5500
    },
    moderate_stress: {
      risk_score: 62,
      peg_deviation: -1.8,
      liquidity_score: 0.42,
      volume_anomaly: true,
      current_price: 0.9820
    }
  };

  const scenario = scenarios[simulate] || scenarios.none;

  // Determine risk level
  let riskLevel: string;
  if (scenario.risk_score < 30) riskLevel = 'Low';
  else if (scenario.risk_score < 60) riskLevel = 'Medium';
  else if (scenario.risk_score < 80) riskLevel = 'High';
  else riskLevel = 'Critical';

  // Generate multi-exchange data
  const basePrice = scenario.current_price;
  const multiExchangeData = {
    cross_exchange_spread: simulate === 'none' ? 0.002 : 0.012,
    exchanges: {
      binance: {
        price: basePrice * 1.0005,
        volume_24h: 42000000000,
        last_updated: new Date().toISOString()
      },
      coinbase: {
        price: basePrice * 0.9992,
        volume_24h: 28000000000,
        last_updated: new Date().toISOString()
      },
      kraken: {
        price: basePrice * 1.0008,
        volume_24h: 15000000000,
        last_updated: new Date().toISOString()
      }
    },
    price_consensus: basePrice,
    arbitrage_opportunity: simulate !== 'none'
  };

  // Generate alerts
  const alerts = [];
  if (Math.abs(scenario.peg_deviation) > 1.0) {
    alerts.push({
      severity: 'high',
      type: 'peg_deviation',
      message: `Price depegged by ${Math.abs(scenario.peg_deviation).toFixed(2)}% for ${Math.floor(Math.random() * 60)} minutes`,
      triggered_at: new Date(Date.now() - Math.random() * 3600000).toISOString()
    });
  }

  if (scenario.volume_anomaly) {
    alerts.push({
      severity: 'medium',
      type: 'volume_spike',
      message: 'Volume 4.2σ above 24h average',
      triggered_at: new Date(Date.now() - Math.random() * 1800000).toISOString()
    });
  }

  if (scenario.liquidity_score < 0.4) {
    alerts.push({
      severity: 'high',
      type: 'liquidity_stress',
      message: 'Liquidity depth below critical threshold',
      triggered_at: new Date(Date.now() - Math.random() * 900000).toISOString()
    });
  }

  // Full response
  return {
    timestamp: new Date().toISOString(),
    stablecoin,
    risk_assessment: {
      risk_score: scenario.risk_score,
      risk_level: riskLevel,
      depeg_probability: scenario.risk_score / 100 * 0.8,
      confidence: 0.85 + Math.random() * 0.1
    },
    market_data: {
      current_price: scenario.current_price,
      peg_deviation: scenario.peg_deviation,
      deviation_duration_minutes: Math.abs(scenario.peg_deviation) > 0.5 ? Math.floor(Math.random() * 120) : 0,
      '24h_high': scenario.current_price * 1.005,
      '24h_low': scenario.current_price * 0.995
    },
    liquidity_metrics: {
      liquidity_score: scenario.liquidity_score,
      total_depth_usd: scenario.liquidity_score * 20000000,
      bid_ask_imbalance: simulate === 'none' ? 0.05 : -0.45,
      spread_bps: simulate === 'none' ? 3.5 : 12.8
    },
    volatility_metrics: {
      volatility_24h: simulate === 'none' ? 0.008 : 0.035,
      volume_anomaly: scenario.volume_anomaly,
      volume_zscore: scenario.volume_anomaly ? 4.2 : 1.1,
      volume_24h_usd: stablecoin === 'USDT' ? 85000000000 : 28000000000
    },
    multi_exchange_data: multiExchangeData,
    feature_breakdown: {
      peg_deviation_score: Math.min(Math.abs(scenario.peg_deviation) / 5.0, 1.0),
      liquidity_stress_score: 1 - scenario.liquidity_score,
      volatility_score: simulate === 'none' ? 0.35 : 0.72,
      imbalance_score: simulate === 'none' ? 0.15 : 0.65,
      spread_score: simulate === 'none' ? 0.20 : 0.58,
      volume_anomaly_score: scenario.volume_anomaly ? 0.85 : 0.25,
      duration_score: Math.abs(scenario.peg_deviation) > 0.5 ? 0.60 : 0.10
    },
    alerts,
    recommendation: {
      action: riskLevel === 'Critical' ? 'REDUCE_EXPOSURE' : riskLevel === 'High' ? 'MONITOR_CLOSELY' : 'NORMAL_OPERATIONS',
      reason: generateRecommendationReason(scenario, riskLevel),
      suggested_actions: generateSuggestedActions(scenario, riskLevel)
    },
    metadata: {
      simulation_mode: simulate !== 'none' ? simulate : null,
      data_sources: ['CoinAPI', 'Binance'],
      calculation_time_ms: Math.floor(Math.random() * 50) + 20,
      model_version: 'v1.0'
    }
  };
}

function generateRecommendationReason(scenario: any, riskLevel: string): string {
  if (riskLevel === 'Critical') {
    return 'Severe depeg detected with low liquidity and high volatility. Immediate action recommended.';
  } else if (riskLevel === 'High') {
    return 'High sell pressure with low liquidity indicates elevated risk.';
  } else if (riskLevel === 'Medium') {
    return 'Moderate price deviation with normal market conditions.';
  } else {
    return 'Stable peg with healthy liquidity depth.';
  }
}

function generateSuggestedActions(scenario: any, riskLevel: string): string[] {
  if (riskLevel === 'Critical') {
    return [
      'Immediately reduce exposure',
      'Monitor redemption mechanisms',
      'Prepare for potential mass exit',
      'Consider hedging strategies'
    ];
  } else if (riskLevel === 'High') {
    return [
      'Reduce exposure to this stablecoin',
      'Monitor cross-exchange spreads for arbitrage',
      'Set alert for deviation > 2%',
      'Diversify into other stablecoins'
    ];
  } else if (riskLevel === 'Medium') {
    return [
      'Continue monitoring',
      'Review position sizes',
      'Set alerts for threshold breaches'
    ];
  } else {
    return [
      'Normal operations',
      'Maintain current positions',
      'Periodic monitoring recommended'
    ];
  }
}

export default router;
