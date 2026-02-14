import { Router, Request, Response, NextFunction } from 'express';
import { AlertService } from '../services/alertService';

const router: Router = Router();

/**
 * GET /api/alerts
 * Get all alerts (optionally filter by stablecoinId)
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stablecoinId, enabled } = req.query;
    
    const filter: any = {};
    if (stablecoinId) filter.stablecoinId = stablecoinId;
    if (enabled !== undefined) filter.enabled = enabled === 'true';

    const alerts = await AlertService.listAlerts(filter);
    res.json(alerts);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/alerts
 * Create a new alert
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stablecoinId, name, type, condition, threshold, channels, enabled } = req.body;

    const alert = await AlertService.createAlert({
      stablecoinId,
      name: name || `${stablecoinId} ${type} Alert`,
      type,
      condition,
      threshold: parseFloat(threshold),
      channels: channels || ['email'],
      enabled: enabled !== undefined ? enabled : true,
    });

    res.status(201).json(alert);
  } catch (error: any) {
    if (error.message.includes('required fields') || error.message.includes('valid number')) {
      res.status(400).json({ error: error.message });
    } else {
      next(error);
    }
  }
});

/**
 * PATCH /api/alerts/:id
 * Update an existing alert
 */
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If threshold is provided, parse it
    if (updates.threshold !== undefined) {
      updates.threshold = parseFloat(updates.threshold);
    }

    const alert = await AlertService.updateAlert(id, updates);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json(alert);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/alerts/:id
 * Delete an alert
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const deleted = await AlertService.deleteAlert(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
