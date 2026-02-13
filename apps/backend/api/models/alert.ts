// In-memory Alert model (replaces Mongoose)
import { randomUUID } from 'crypto';

export interface IAlert {
  _id: string;
  id: string;
  stablecoinId: string;
  name: string;
  type: 'peg_deviation' | 'liquidity_drop' | 'volume_spike' | 'market_cap_change' | 'reserve_change';
  condition: 'above' | 'below' | 'equals';
  threshold: number;
  channels: ('email' | 'telegram' | 'push' | 'webhook')[];
  enabled: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

// In-memory storage with some seed data
const alerts: IAlert[] = [
  {
    _id: '1',
    id: '1',
    stablecoinId: 'usdt',
    name: 'USDT Peg Alert',
    type: 'peg_deviation',
    condition: 'above',
    threshold: 0.5,
    channels: ['email'],
    enabled: true,
    createdAt: new Date('2026-01-10'),
    triggerCount: 3,
  },
  {
    _id: '2',
    id: '2',
    stablecoinId: 'usdc',
    name: 'USDC Liquidity Drop',
    type: 'liquidity_drop',
    condition: 'below',
    threshold: 1000000,
    channels: ['email', 'telegram'],
    enabled: true,
    createdAt: new Date('2026-01-15'),
    triggerCount: 1,
  },
];

export class AlertStore {
  static findAll(filter?: { stablecoinId?: string; enabled?: boolean }): IAlert[] {
    let result = [...alerts];
    if (filter?.stablecoinId) {
      result = result.filter(a => a.stablecoinId === filter.stablecoinId);
    }
    if (filter?.enabled !== undefined) {
      result = result.filter(a => a.enabled === filter.enabled);
    }
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static findById(id: string): IAlert | undefined {
    return alerts.find(a => a._id === id || a.id === id);
  }

  static create(data: Omit<IAlert, '_id' | 'id' | 'createdAt' | 'triggerCount'>): IAlert {
    const id = randomUUID();
    const alert: IAlert = {
      _id: id,
      id,
      ...data,
      createdAt: new Date(),
      triggerCount: 0,
    };
    alerts.push(alert);
    return alert;
  }

  static update(id: string, updates: Partial<IAlert>): IAlert | null {
    const index = alerts.findIndex(a => a._id === id || a.id === id);
    if (index === -1) return null;
    alerts[index] = { ...alerts[index], ...updates };
    return alerts[index];
  }

  static delete(id: string): boolean {
    const index = alerts.findIndex(a => a._id === id || a.id === id);
    if (index === -1) return false;
    alerts.splice(index, 1);
    return true;
  }
}
