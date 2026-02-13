import { AlertModel, IAlert } from '../models/alert';

export interface CreateAlertPayload {
  stablecoinId: string;
  name: string;
  type: 'peg_deviation' | 'liquidity_drop' | 'volume_spike' | 'market_cap_change' | 'reserve_change';
  condition: 'above' | 'below' | 'equals';
  threshold: number;
  channels?: ('email' | 'telegram' | 'push' | 'webhook')[];
  enabled?: boolean;
}

export class AlertService {
  /**
   * Create a new alert
   */
  static async createAlert(payload: CreateAlertPayload): Promise<IAlert> {
    // Validate required fields
    if (!payload.stablecoinId || !payload.name || !payload.type || !payload.condition || payload.threshold == null) {
      throw new Error('Missing required fields: stablecoinId, name, type, condition, threshold');
    }

    // Validate threshold is a number
    if (typeof payload.threshold !== 'number' || isNaN(payload.threshold)) {
      throw new Error('Threshold must be a valid number');
    }

    const alert = new AlertModel({
      stablecoinId: payload.stablecoinId,
      name: payload.name,
      type: payload.type,
      condition: payload.condition,
      threshold: payload.threshold,
      channels: payload.channels || ['email'],
      enabled: payload.enabled !== undefined ? payload.enabled : true,
      triggerCount: 0,
    });

    return await alert.save();
  }

  /**
   * List alerts with optional filters
   */
  static async listAlerts(filter?: { stablecoinId?: string; enabled?: boolean }): Promise<IAlert[]> {
    const query: any = {};
    
    if (filter?.stablecoinId) {
      query.stablecoinId = filter.stablecoinId;
    }
    
    if (filter?.enabled !== undefined) {
      query.enabled = filter.enabled;
    }

    return await AlertModel.find(query).sort({ createdAt: -1 }).exec();
  }

  /**
   * Get alert by ID
   */
  static async getAlertById(id: string): Promise<IAlert | null> {
    return await AlertModel.findById(id).exec();
  }

  /**
   * Update alert
   */
  static async updateAlert(id: string, updates: Partial<CreateAlertPayload>): Promise<IAlert | null> {
    return await AlertModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  /**
   * Delete alert
   */
  static async deleteAlert(id: string): Promise<boolean> {
    const result = await AlertModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  /**
   * Toggle alert enabled status
   */
  static async toggleAlert(id: string, enabled: boolean): Promise<IAlert | null> {
    return await AlertModel.findByIdAndUpdate(id, { enabled }, { new: true }).exec();
  }
}
