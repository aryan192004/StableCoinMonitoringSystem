import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { CapitalFlowsService } from '../services/capitalFlowsService';
import { CapitalFlowFilters } from '@stablecoin/types';

const router: Router = Router();
const capitalFlowsService = new CapitalFlowsService();

// Rate limiting for capital flows endpoints
const capitalFlowsRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
    timestamp: new Date(),
  },
});

/**
 * GET /api/capital-flows
 * Get recent capital flow events with optional filters
 */
router.get('/', capitalFlowsRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters: CapitalFlowFilters = {};

    // Parse query parameters
    if (req.query.stablecoin) {
      const stablecoins = Array.isArray(req.query.stablecoin) 
        ? req.query.stablecoin as string[]
        : [req.query.stablecoin as string];
      filters.stablecoin = stablecoins.filter(s => s && s.length > 0);
    }

    if (req.query.types) {
      const types = Array.isArray(req.query.types) 
        ? req.query.types as string[]
        : [req.query.types as string];
      const validTypes = ['mint', 'burn', 'whale_transfer', 'exchange_inflow', 'exchange_outflow'];
      filters.types = types.filter(t => validTypes.includes(t)) as any[];
    }

    if (req.query.minAmount) {
      const minAmount = parseFloat(req.query.minAmount as string);
      if (!isNaN(minAmount) && minAmount > 0) {
        filters.minAmount = minAmount;
      }
    }

    if (req.query.impact) {
      const impacts = Array.isArray(req.query.impact) 
        ? req.query.impact as string[]
        : [req.query.impact as string];
      const validImpacts = ['low', 'medium', 'high'];
      filters.impact = impacts.filter(i => validImpacts.includes(i)) as any[];
    }

    if (req.query.timeRange) {
      const validRanges = ['1h', '24h', '7d', '30d'];
      if (validRanges.includes(req.query.timeRange as string)) {
        filters.timeRange = req.query.timeRange as any;
      }
    }

    if (req.query.exchanges) {
      const exchanges = Array.isArray(req.query.exchanges) 
        ? req.query.exchanges as string[]
        : [req.query.exchanges as string];
      filters.exchanges = exchanges.filter(e => e && e.length > 0);
    }

    const capitalFlows = await capitalFlowsService.getRecentCapitalFlows(filters);

    res.json({
      success: true,
      data: capitalFlows,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Capital flows fetch error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'CAPITAL_FLOWS_FETCH_ERROR',
        message: 'Failed to fetch capital flow events',
      },
      timestamp: new Date(),
    });
  }
});

/**
 * GET /api/capital-flows/summary
 * Get capital flows summary for dashboard highlights
 */
router.get('/summary', capitalFlowsRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await capitalFlowsService.getCapitalFlowSummary();

    res.json({
      success: true,
      data: summary,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Capital flows summary error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'CAPITAL_FLOWS_SUMMARY_ERROR',
        message: 'Failed to fetch capital flows summary',
      },
      timestamp: new Date(),
    });
  }
});

/**
 * GET /api/capital-flows/metrics/:stablecoin
 * Get detailed metrics for a specific stablecoin
 */
router.get('/metrics/:stablecoin', capitalFlowsRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stablecoin } = req.params;

    // Validate stablecoin parameter
    const validStablecoins = ['USDT', 'USDC', 'DAI', 'BUSD'];
    if (!validStablecoins.includes(stablecoin.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STABLECOIN',
          message: `Invalid stablecoin. Must be one of: ${validStablecoins.join(', ')}`,
        },
        timestamp: new Date(),
      });
    }

    const metrics = await capitalFlowsService.getCapitalFlowMetrics(stablecoin.toUpperCase());

    res.json({
      success: true,
      data: metrics,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Capital flows metrics error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'CAPITAL_FLOWS_METRICS_ERROR',
        message: 'Failed to fetch capital flows metrics',
      },
      timestamp: new Date(),
    });
  }
});

/**
 * GET /api/capital-flows/events/live
 * Get live capital flow events (WebSocket alternative using polling)
 */
router.get('/events/live', capitalFlowsRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get very recent events (last hour)
    const liveEvents = await capitalFlowsService.getRecentCapitalFlows({
      timeRange: '1h',
      minAmount: 50000 // Only significant transactions
    });

    // Filter to only high-impact events for live monitoring
    const highImpactEvents = liveEvents.filter(event => 
      event.impact === 'high' || event.amount >= 10000000
    );

    res.json({
      success: true,
      data: highImpactEvents,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Live capital flows error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'LIVE_CAPITAL_FLOWS_ERROR',
        message: 'Failed to fetch live capital flow events',
      },
      timestamp: new Date(),
    });
  }
});

/**
 * GET /api/capital-flows/analytics
 * Get capital flows analytics and trends
 */
router.get('/analytics', capitalFlowsRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const timeRange = (req.query.timeRange as string) || '24h';
    const validRanges = ['1h', '24h', '7d', '30d'];
    
    if (!validRanges.includes(timeRange)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TIME_RANGE',
          message: `Invalid time range. Must be one of: ${validRanges.join(', ')}`,
        },
        timestamp: new Date(),
      });
    }

    // Get events for analytics
    const events = await capitalFlowsService.getRecentCapitalFlows({ timeRange: timeRange as any });
    
    // Calculate analytics
    const analytics = {
      totalEvents: events.length,
      totalVolume: events.reduce((sum, e) => sum + e.amount, 0),
      averageTransactionSize: events.length > 0 ? events.reduce((sum, e) => sum + e.amount, 0) / events.length : 0,
      
      // By type
      eventsByType: {
        mint: events.filter(e => e.type === 'mint').length,
        burn: events.filter(e => e.type === 'burn').length,
        whale_transfer: events.filter(e => e.type === 'whale_transfer').length,
        exchange_inflow: events.filter(e => e.type === 'exchange_inflow').length,
        exchange_outflow: events.filter(e => e.type === 'exchange_outflow').length,
      },
      
      // By impact
      eventsByImpact: {
        high: events.filter(e => e.impact === 'high').length,
        medium: events.filter(e => e.impact === 'medium').length,
        low: events.filter(e => e.impact === 'low').length,
      },
      
      // By stablecoin
      eventsByStablecoin: events.reduce((acc, event) => {
        acc[event.stablecoin] = (acc[event.stablecoin] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      // Volume by stablecoin
      volumeByStablecoin: events.reduce((acc, event) => {
        acc[event.stablecoin] = (acc[event.stablecoin] || 0) + event.amount;
        return acc;
      }, {} as Record<string, number>),
    };

    res.json({
      success: true,
      data: analytics,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Capital flows analytics error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'CAPITAL_FLOWS_ANALYTICS_ERROR',
        message: 'Failed to fetch capital flows analytics',
      },
      timestamp: new Date(),
    });
  }
});

export default router;