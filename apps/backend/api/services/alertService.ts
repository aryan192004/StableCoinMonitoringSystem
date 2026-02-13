import { AlertStore, IAlert } from '../models/alert';

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
    if (!payload.stablecoinId || !payload.name || !payload.type || !payload.condition || payload.threshold == null) {
      throw new Error('Missing required fields: stablecoinId, name, type, condition, threshold');
    }

    if (typeof payload.threshold !== 'number' || isNaN(payload.threshold)) {
      throw new Error('Threshold must be a valid number');
    }

    return AlertStore.create({
      stablecoinId: payload.stablecoinId,
      name: payload.name,
      type: payload.type,
      condition: payload.condition,
      threshold: payload.threshold,
      channels: payload.channels || ['email'],
      enabled: payload.enabled !== undefined ? payload.enabled : true,
    });
  }

  /**
   * List alerts with optional filters
   */
  static async listAlerts(filter?: { stablecoinId?: string; enabled?: boolean }): Promise<IAlert[]> {
    return AlertStore.findAll(filter);
  }

  /**
   * Get alert by ID
   */
  static async getAlertById(id: string): Promise<IAlert | undefined> {
    return AlertStore.findById(id);
  }

  /**
   * Update alert
   */
  static async updateAlert(id: string, updates: Partial<CreateAlertPayload>): Promise<IAlert | null> {
    return AlertStore.update(id, updates);
  }

  /**
   * Delete alert
   */
  static async deleteAlert(id: string): Promise<boolean> {
    return AlertStore.delete(id);
  }

  /**
   * Toggle alert enabled status
   */
  static async toggleAlert(id: string, enabled: boolean): Promise<IAlert | null> {
    return AlertStore.update(id, { enabled });
  }
}
