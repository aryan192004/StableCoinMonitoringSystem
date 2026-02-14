import { Router, Request, Response } from 'express';

const router: Router = Router();

// News service is currently not implemented, using fallback
let newsService: any = null;

// Enhanced fallback news data for demo purposes
function getFallbackNews() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  return [
    {
      title: 'Circle Announces Major USDC Expansion to Three New Blockchains',
      description: 'Circle Internet Financial is expanding USD Coin (USDC) to Solana, Avalanche, and Polygon networks, potentially increasing liquidity and adoption across DeFi protocols.',
      url: 'https://www.circle.com/blog/usdc-expansion-announcement',
      source: 'Circle Official',
      publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      sentiment: {
        score: 0.8,
        compound: 0.7,
        positive: 0.8,
        negative: 0.1,
        neutral: 0.1,
        label: 'positive' as const,
      },
      riskScore: 15,
    },
    {
      title: 'Federal Reserve Releases New Guidance on Stablecoin Regulations',
      description: 'The Federal Reserve has issued updated guidelines for banks dealing with stablecoins, emphasizing the need for proper reserves and regular audits.',
      url: 'https://www.federalreserve.gov/newsevents/pressreleases/stablecoin-guidance',
      source: 'Federal Reserve',
      publishedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      sentiment: {
        score: 0.3,
        compound: 0.2,
        positive: 0.3,
        negative: 0.3,
        neutral: 0.4,
        label: 'neutral' as const,
      },
      riskScore: 35,
    },
    {
      title: 'Tether Mints Additional $1 Billion USDT Amid Market Demand',
      description: 'Tether Treasury has minted an additional 1 billion USDT tokens on the Ethereum blockchain, citing increased institutional demand and market maker inventory needs.',
      url: 'https://tether.to/en/treasury-mint-announcement',
      source: 'Tether',
      publishedAt: yesterday.toISOString(),
      sentiment: {
        score: 0.6,
        compound: 0.5,
        positive: 0.6,
        negative: 0.2,
        neutral: 0.2,
        label: 'positive' as const,
      },
      riskScore: 25,
    },
    {
      title: 'MakerDAO Proposes New Collateral Types for DAI Stability',
      description: 'MakerDAO governance is voting on a proposal to add real-world assets (RWAs) as collateral backing for DAI, including U.S. Treasury bonds and corporate debt.',
      url: 'https://forum.makerdao.com/rwa-collateral-proposal',
      source: 'MakerDAO Forum',
      publishedAt: yesterday.toISOString(),
      sentiment: {
        score: 0.7,
        compound: 0.6,
        positive: 0.7,
        negative: 0.1,
        neutral: 0.2,
        label: 'positive' as const,
      },
      riskScore: 20,
    },
    {
      title: 'Binance BUSD Faces Regulatory Pressure from New York Attorney General',
      description: 'The New York Attorney General\'s office has issued a cease and desist order to Paxos regarding the issuance of Binance USD (BUSD), citing regulatory compliance concerns.',
      url: 'https://ag.ny.gov/press-release/busd-cease-desist-order',
      source: 'NY Attorney General',
      publishedAt: twoDaysAgo.toISOString(),
      sentiment: {
        score: -0.7,
        compound: -0.6,
        positive: 0.1,
        negative: 0.8,
        neutral: 0.1,
        label: 'negative' as const,
      },
      riskScore: 80,
    },
    {
      title: 'DeFi Protocol Aave Integrates GHO Stablecoin with Major DEXs',
      description: 'Aave\'s native stablecoin GHO is now available for trading on Uniswap, Curve, and Balancer, improving liquidity and price stability mechanisms.',
      url: 'https://aave.com/gho-dex-integration',
      source: 'Aave',
      publishedAt: twoDaysAgo.toISOString(),
      sentiment: {
        score: 0.8,
        compound: 0.7,
        positive: 0.8,
        negative: 0.05,
        neutral: 0.15,
        label: 'positive' as const,
      },
      riskScore: 12,
    },
    {
      title: 'PayPal USD (PYUSD) Reaches $1 Billion Market Capitalization',
      description: 'PayPal\'s stablecoin PYUSD has crossed the $1 billion market cap milestone just six months after launch, driven by integration with PayPal\'s payment infrastructure.',
      url: 'https://newsroom.paypal.com/pyusd-milestone-announcement',
      source: 'PayPal',
      publishedAt: threeDaysAgo.toISOString(),
      sentiment: {
        score: 0.9,
        compound: 0.8,
        positive: 0.85,
        negative: 0.05,
        neutral: 0.1,
        label: 'positive' as const,
      },
      riskScore: 10,
    },
    {
      title: 'European Central Bank Publishes Stablecoin Impact Assessment Report',
      description: 'The ECB\'s latest report analyzes the potential impact of private stablecoins on monetary policy transmission and financial stability within the Eurozone.',
      url: 'https://www.ecb.europa.eu/pub/pdf/other/stablecoin-impact-assessment-2024.pdf',
      source: 'European Central Bank',
      publishedAt: threeDaysAgo.toISOString(),
      sentiment: {
        score: 0.2,
        compound: 0.1,
        positive: 0.3,
        negative: 0.2,
        neutral: 0.5,
        label: 'neutral' as const,
      },
      riskScore: 40,
    },
  ];
}

/**
 * Calculate risk score from VADER sentiment
 * Negative sentiment = higher risk
 * Risk score: 0-100 (0 = no risk, 100 = very high risk)
 */
function calculateRiskScore(sentiment: any): number {
  // compound ranges from -1 (most negative) to +1 (most positive)
  // Convert to risk: negative compound = high risk
  const { compound } = sentiment;
  
  if (compound >= 0.05) {
    // Positive sentiment = low risk (0-20)
    return Math.round(Math.max(0, (0.05 - compound) * 100));
  } else if (compound <= -0.05) {
    // Negative sentiment = high risk (50-100)
    return Math.round(Math.min(100, 50 + (Math.abs(compound) * 50)));
  } else {
    // Neutral sentiment = moderate risk (20-50)
    return Math.round(30 + (Math.abs(compound) * 200));
  }
}

/**
 * GET /api/news
 * Fetch stablecoin news with sentiment analysis and risk scoring
 * Query params: query (string), limit (number)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = (req.query.query as string) || 'stablecoin OR USDT OR USDC OR DAI OR tether';
    const limit = parseInt(req.query.limit as string) || 20;

    console.log(`Fetching news: query="${query}", limit=${limit}`);

    let articles;
    if (newsService && newsService.fetchStablecoinNews) {
      try {
        articles = await newsService.fetchStablecoinNews(query, limit);
      } catch (apiError: any) {
        console.error('News API error:', apiError.message);
        articles = getFallbackNews();
      }
    } else {
      articles = getFallbackNews();
    }

    // Add risk score to each article
    const articlesWithRisk = articles.map((article: any) => ({
      ...article,
      riskScore: article.riskScore || calculateRiskScore(article.sentiment),
    }));

    res.json({
      success: true,
      count: articlesWithRisk.length,
      articles: articlesWithRisk,
    });
  } catch (error: any) {
    console.error('Error in /api/news:', error);
    res.status(500).json({
      success: false,
      count: 0,
      articles: [],
      error: error.message || 'Failed to fetch news',
    });
  }
});

/**
 * GET /api/news/trending
 * Fetch trending stablecoin news
 * Query params: limit (number)
 */
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    console.log(`Fetching trending news: limit=${limit}`);

    let articles;
    if (newsService && newsService.fetchTrendingNews) {
      try {
        articles = await newsService.fetchTrendingNews(limit);
      } catch (apiError: any) {
        console.error('Trending news API error:', apiError.message);
        articles = getFallbackNews();
      }
    } else {
      articles = getFallbackNews();
    }

    // Add risk score to each article
    const articlesWithRisk = articles.map((article: any) => ({
      ...article,
      riskScore: article.riskScore || calculateRiskScore(article.sentiment),
    }));

    res.json({
      success: true,
      count: articlesWithRisk.length,
      articles: articlesWithRisk,
    });
  } catch (error: any) {
    console.error('Error in /api/news/trending:', error);
    res.status(500).json({
      success: false,
      count: 0,
      articles: [],
      error: error.message || 'Failed to fetch trending news',
    });
  }
});

/**
 * GET /api/news/coin
 * Fetch news for specific stablecoins
 * Query params: coins (comma-separated string), limit (number)
 */
router.get('/coin', async (req: Request, res: Response) => {
  try {
    const coinsParam = (req.query.coins as string) || 'USDC,USDT,DAI';
    const coins = coinsParam.split(',').map(c => c.trim());
    const limit = parseInt(req.query.limit as string) || 10;

    console.log(`Fetching coin-specific news: coins=${coins.join(',')}, limit=${limit}`);

    let articles;
    if (newsService && newsService.fetchCoinSpecificNews) {
      try {
        articles = await newsService.fetchCoinSpecificNews(coins, limit);
      } catch (apiError: any) {
        console.error('Coin-specific news API error:', apiError.message);
        articles = getFallbackNews();
      }
    } else {
      articles = getFallbackNews();
    }

    // Add risk score to each article
    const articlesWithRisk = articles.map((article: any) => ({
      ...article,
      riskScore: article.riskScore || calculateRiskScore(article.sentiment),
    }));

    res.json({
      success: true,
      count: articlesWithRisk.length,
      articles: articlesWithRisk,
    });
  } catch (error: any) {
    console.error('Error in /api/news/coin:', error);
    res.status(500).json({
      success: false,
      count: 0,
      articles: [],
      error: error.message || 'Failed to fetch coin-specific news',
    });
  }
});

/**
 * POST /api/news/refresh
 * Clear news cache (for testing/development)
 */
router.post('/refresh', (req: Request, res: Response) => {
  try {
    if (newsService && newsService.clearNewsCache) {
      newsService.clearNewsCache();
      res.json({
        success: true,
        message: 'News cache cleared successfully',
      });
    } else {
      res.json({
        success: true,
        message: 'No cache to clear (news service not available)',
      });
    }
  } catch (error: any) {
    console.error('Error clearing news cache:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to clear cache',
    });
  }
});

export default router;
