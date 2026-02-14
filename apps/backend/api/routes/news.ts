import { Router, Request, Response } from 'express';

const router: Router = Router();

// Attempt to import the compiled news service, with fallback if it fails
let newsService: any;
try {
  newsService = require('../../dist/api/services/newsService');
} catch (error) {
  console.error('Failed to load newsService:', error);
  newsService = null;
}

// Fallback news data when API is unavailable
function getFallbackNews() {
  return [
    {
      title: 'News API Currently Unavailable',
      description: 'Unable to fetch live news. Please add a valid NEWSAPI_KEY to your .env file. Get a free key from https://newsapi.org/register',
      url: 'https://newsapi.org/register',
      source: 'System',
      publishedAt: new Date().toISOString(),
      sentiment: {
        score: 0,
        compound: 0,
        positive: 0,
        negative: 0,
        neutral: 1,
        label: 'neutral' as const,
      },
      riskScore: 50,
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
