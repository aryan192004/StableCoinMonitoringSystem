import { Router, Request, Response, NextFunction } from 'express';
import { PortfolioService } from '../services/portfolioService';

const router = Router();
const portfolioService = new PortfolioService();

/**
 * GET /api/portfolio/:address
 * Get portfolio analysis for a wallet address
 */
router.get('/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;

    // Validate Ethereum address format
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ADDRESS',
          message: 'Invalid Ethereum address format',
        },
        timestamp: new Date(),
      });
    }

    const portfolio = await portfolioService.getPortfolio(address);

    res.json({
      success: true,
      data: portfolio,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'PORTFOLIO_FETCH_ERROR',
        message: 'Failed to fetch portfolio data',
      },
      timestamp: new Date(),
    });
  }
});

/**
 * GET /api/portfolio/:address/tokens
 * Get token balances only (lighter endpoint)
 */
router.get('/:address/tokens', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ADDRESS',
          message: 'Invalid Ethereum address format',
        },
        timestamp: new Date(),
      });
    }

    const portfolio = await portfolioService.getPortfolio(address);

    res.json({
      success: true,
      data: {
        ethBalance: portfolio.ethBalance,
        tokenBalances: portfolio.tokenBalances,
        totalValue: portfolio.totalValueUsd,
        lastUpdated: portfolio.lastUpdated,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Token balances fetch error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'TOKENS_FETCH_ERROR',
        message: 'Failed to fetch token balances',
      },
      timestamp: new Date(),
    });
  }
});

/**
 * GET /api/portfolio/:address/risk
 * Get risk analysis only
 */
router.get('/:address/risk', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ADDRESS',
          message: 'Invalid Ethereum address format',
        },
        timestamp: new Date(),
      });
    }

    const portfolio = await portfolioService.getPortfolio(address);

    // Prepare risk metrics for ML integration
    const riskMetrics = {
      overallScore: portfolio.riskScore,
      riskLevel: portfolio.riskScore < 30 ? 'low' as const : 
                 portfolio.riskScore < 70 ? 'medium' as const : 'high' as const,
      factors: {
        diversification: Math.max(0, 100 - portfolio.allocations.length * 12),
        stablecoinConcentration: Math.min(100, portfolio.stablecoinExposure),
        volatility: Math.min(100, portfolio.allocations[0]?.percentage || 0),
        liquidityRisk: portfolio.tokenBalances.length < 3 ? 75 : 25,
      },
      recommendations: generateRecommendations(portfolio),
      lastCalculated: new Date(),
    };

    res.json({
      success: true,
      data: riskMetrics,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Risk analysis error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'RISK_ANALYSIS_ERROR',
        message: 'Failed to calculate risk metrics',
      },
      timestamp: new Date(),
    });
  }
});

// Helper function for risk recommendations
function generateRecommendations(portfolio: any): string[] {
  const recommendations: string[] = [];
  
  if (portfolio.allocations.length < 3) {
    recommendations.push('Consider diversifying across more assets to reduce concentration risk');
  }
  
  if (portfolio.allocations[0]?.percentage > 70) {
    recommendations.push('High concentration in single asset detected - consider rebalancing');
  }
  
  if (portfolio.stablecoinExposure < 10) {
    recommendations.push('Low stablecoin exposure may increase volatility during market downturns');
  }
  
  if (portfolio.stablecoinExposure > 80) {
    recommendations.push('High stablecoin exposure may limit growth potential');
  }
  
  return recommendations;
}

export default router;