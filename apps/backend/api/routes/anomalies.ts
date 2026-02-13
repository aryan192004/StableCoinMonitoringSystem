import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

/**
 * GET /api/anomalies/:stablecoin
 * Returns anomaly detection result for a stablecoin (mocked)
 */
router.get('/:stablecoin', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stablecoin } = req.params;

    // Mocked anomaly response — replace with real model integration
    let result: any = {
      stablecoin: stablecoin.toUpperCase(),
      anomaly_score: Math.random() * 2 - 1, // -1..1 where lower is more anomalous
      is_anomaly: false,
      severity: 'Normal',
      alerts: [],
      confidence: 0.9,
      timestamp: new Date(),
      modelVersion: 'anomaly-v1',
      status: 'success',
    };

    // Simple deterministic tweak for demo: small chance of anomaly
    if (Math.random() < 0.12) {
      result.is_anomaly = true;
      result.severity = 'High';
      result.alerts = [{ type: 'volume_anomaly', message: 'Large volume spike detected' }];
      result.anomaly_score = -0.7;
      result.confidence = 0.82;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
