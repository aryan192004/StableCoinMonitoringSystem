import mongoose, { Document, Schema } from 'mongoose';

export interface IAlert extends Document {
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

const AlertSchema = new Schema<IAlert>({
  stablecoinId: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['peg_deviation', 'liquidity_drop', 'volume_spike', 'market_cap_change', 'reserve_change'],
  },
  condition: {
    type: String,
    required: true,
    enum: ['above', 'below', 'equals'],
  },
  threshold: {
    type: Number,
    required: true,
  },
  channels: {
    type: [String],
    required: true,
    enum: ['email', 'telegram', 'push', 'webhook'],
    default: ['email'],
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastTriggered: {
    type: Date,
    default: null,
  },
  triggerCount: {
    type: Number,
    default: 0,
  },
});

// Indexes for efficient queries
AlertSchema.index({ stablecoinId: 1, enabled: 1 });
AlertSchema.index({ createdAt: -1 });

export const AlertModel = mongoose.model<IAlert>('Alert', AlertSchema);
