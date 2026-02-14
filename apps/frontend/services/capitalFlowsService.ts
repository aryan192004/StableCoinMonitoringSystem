import { 
  CapitalFlowEvent,
  CapitalFlowSummary,
  CapitalFlowMetrics,
  CapitalFlowFilters 
} from '@stablecoin/types';
import { apiClient } from '@/utils/api';

export class CapitalFlowsService {
  /**
   * Fetch recent capital flow events
   */
  static async fetchCapitalFlows(filters?: CapitalFlowFilters): Promise<CapitalFlowEvent[]> {
    const params = new URLSearchParams();
    
    if (filters?.stablecoin) {
      filters.stablecoin.forEach(coin => params.append('stablecoin', coin));
    }
    
    if (filters?.types) {
      filters.types.forEach(type => params.append('types', type));
    }
    
    if (filters?.minAmount) {
      params.append('minAmount', filters.minAmount.toString());
    }
    
    if (filters?.impact) {
      filters.impact.forEach(impact => params.append('impact', impact));
    }
    
    if (filters?.timeRange) {
      params.append('timeRange', filters.timeRange);
    }
    
    if (filters?.exchanges) {
      filters.exchanges.forEach(exchange => params.append('exchanges', exchange));
    }

    const queryString = params.toString();
    const url = `/capital-flows${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to fetch capital flows');
    }
    
    // Parse dates from string to Date objects
    return response.data.data.map((event: any) => ({
      ...event,
      timestamp: new Date(event.timestamp)
    }));
  }

  /**
   * Fetch capital flows summary for dashboard highlights
   */
  static async fetchCapitalFlowSummary(): Promise<CapitalFlowSummary> {
    const response = await apiClient.get('/capital-flows/summary');
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to fetch capital flows summary');
    }
    
    const summary = response.data.data;
    
    // Parse dates
    return {
      ...summary,
      lastUpdated: new Date(summary.lastUpdated),
      largestTransaction24h: {
        ...summary.largestTransaction24h,
        timestamp: new Date(summary.largestTransaction24h.timestamp)
      }
    };
  }

  /**
   * Fetch capital flow metrics for a specific stablecoin
   */
  static async fetchCapitalFlowMetrics(stablecoin: string): Promise<CapitalFlowMetrics> {
    const response = await apiClient.get(`/capital-flows/metrics/${stablecoin}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to fetch capital flow metrics');
    }
    
    const metrics = response.data.data;
    
    // Parse date
    return {
      ...metrics,
      timestamp: new Date(metrics.timestamp)
    };
  }

  /**
   * Fetch live capital flow events (high-impact only)
   */
  static async fetchLiveCapitalFlows(): Promise<CapitalFlowEvent[]> {
    const response = await apiClient.get('/capital-flows/events/live');
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to fetch live capital flows');
    }
    
    // Parse dates from string to Date objects
    return response.data.data.map((event: any) => ({
      ...event,
      timestamp: new Date(event.timestamp)
    }));
  }

  /**
   * Fetch capital flows analytics
   */
  static async fetchCapitalFlowAnalytics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<{
    totalEvents: number;
    totalVolume: number;
    averageTransactionSize: number;
    eventsByType: Record<string, number>;
    eventsByImpact: Record<string, number>;
    eventsByStablecoin: Record<string, number>;
    volumeByStablecoin: Record<string, number>;
  }> {
    const response = await apiClient.get(`/capital-flows/analytics?timeRange=${timeRange}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to fetch capital flows analytics');
    }
    
    return response.data.data;
  }

  /**
   * Format amount for display
   */
  static formatAmount(amount: number): string {
    if (amount >= 1_000_000_000) {
      return `$${(amount / 1_000_000_000).toFixed(1)}B`;
    } else if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`;
    } else if (amount >= 1_000) {
      return `$${(amount / 1_000).toFixed(1)}K`;
    } else {
      return `$${amount.toLocaleString()}`;
    }
  }

  /**
   * Format time ago
   */
  static formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  }

  /**
   * Get impact color for UI
   */
  static getImpactColor(impact: 'low' | 'medium' | 'high'): string {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }

  /**
   * Get impact badge variant
   */
  static getImpactBadgeVariant(impact: 'low' | 'medium' | 'high'): 'success' | 'warning' | 'danger' {
    switch (impact) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'warning';
    }
  }

  /**
   * Get flow type icon
   */
  static getFlowTypeIcon(type: CapitalFlowEvent['type']): string {
    switch (type) {
      case 'mint':
        return '🏭'; // Factory/mint icon
      case 'burn':
        return '🔥'; // Fire icon
      case 'whale_transfer':
        return '🐋'; // Whale icon
      case 'exchange_inflow':
        return '📈'; // Chart up icon
      case 'exchange_outflow':
        return '📉'; // Chart down icon
      default:
        return '💰'; // Money icon
    }
  }

  /**
   * Get flow type display name
   */
  static getFlowTypeDisplay(type: CapitalFlowEvent['type']): string {
    switch (type) {
      case 'mint':
        return 'Mint';
      case 'burn':
        return 'Burn';
      case 'whale_transfer':
        return 'Whale Transfer';
      case 'exchange_inflow':
        return 'Exchange Inflow';
      case 'exchange_outflow':
        return 'Exchange Outflow';
      default:
        return 'Transaction';
    }
  }

  /**
   * Generate description with enhanced formatting
   */
  static generateEnhancedDescription(event: CapitalFlowEvent): string {
    const amount = this.formatAmount(event.amount);
    const icon = this.getFlowTypeIcon(event.type);
    
    switch (event.type) {
      case 'mint':
        return `${icon} ${amount} ${event.stablecoin} minted`;
      case 'burn':
        return `${icon} ${amount} ${event.stablecoin} burned`;
      case 'exchange_inflow':
        return `${icon} ${amount} ${event.stablecoin} → ${event.exchangeName || 'Exchange'}`;
      case 'exchange_outflow':
        return `${icon} ${amount} ${event.stablecoin} ← ${event.exchangeName || 'Exchange'}`;
      case 'whale_transfer':
        return `${icon} ${amount} ${event.stablecoin} whale transfer`;
      default:
        return `${icon} ${amount} ${event.stablecoin} transaction`;
    }
  }

  /**
   * Calculate trend direction
   */
  static calculateTrend(current: number, previous: number): 'up' | 'down' | 'neutral' {
    if (current > previous * 1.05) return 'up';
    if (current < previous * 0.95) return 'down';
    return 'neutral';
  }

  /**
   * Get trend color
   */
  static getTrendColor(trend: 'up' | 'down' | 'neutral'): string {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * Validate capital flow filters
   */
  static validateFilters(filters: CapitalFlowFilters): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (filters.minAmount !== undefined && (filters.minAmount < 0 || isNaN(filters.minAmount))) {
      errors.push('Minimum amount must be a positive number');
    }

    if (filters.timeRange && !['1h', '24h', '7d', '30d'].includes(filters.timeRange)) {
      errors.push('Time range must be one of: 1h, 24h, 7d, 30d');
    }

    if (filters.types) {
      const validTypes = ['mint', 'burn', 'whale_transfer', 'exchange_inflow', 'exchange_outflow'];
      const invalidTypes = filters.types.filter(type => !validTypes.includes(type));
      if (invalidTypes.length > 0) {
        errors.push(`Invalid types: ${invalidTypes.join(', ')}`);
      }
    }

    if (filters.impact) {
      const validImpacts = ['low', 'medium', 'high'];
      const invalidImpacts = filters.impact.filter(impact => !validImpacts.includes(impact));
      if (invalidImpacts.length > 0) {
        errors.push(`Invalid impact levels: ${invalidImpacts.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}