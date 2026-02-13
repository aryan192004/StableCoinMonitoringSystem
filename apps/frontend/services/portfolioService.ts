import { 
  PortfolioSummary, 
  TokenBalance, 
  PortfolioRiskMetrics, 
  TokenAllocation 
} from '@stablecoin/types';
import { apiClient } from '@/utils/api';

export class PortfolioAnalysisService {
  /**
   * Fetch portfolio data from the backend
   */
  static async fetchPortfolio(address: string): Promise<PortfolioSummary> {
    const response = await apiClient.get(`/portfolio/${address}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to fetch portfolio');
    }
    
    return response.data.data;
  }

  /**
   * Fetch token balances only (lighter request)
   */
  static async fetchTokenBalances(address: string): Promise<{
    ethBalance: TokenBalance;
    tokenBalances: TokenBalance[];
    totalValue: number;
    lastUpdated: Date;
  }> {
    const response = await apiClient.get(`/portfolio/${address}/tokens`);
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to fetch token balances');
    }
    
    return response.data.data;
  }

  /**
   * Fetch risk analysis
   */
  static async fetchRiskAnalysis(address: string): Promise<PortfolioRiskMetrics> {
    const response = await apiClient.get(`/portfolio/${address}/risk`);
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to fetch risk analysis');
    }
    
    return response.data.data;
  }

  /**
   * Format large numbers for display
   */
  static formatValue(value: number): string {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  }

  /**
   * Format percentage for display
   */
  static formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  /**
   * Format token balance for display
   */
  static formatTokenBalance(balance: string, decimals: number, maxDecimals: number = 4): string {
    const num = parseFloat(balance) / Math.pow(10, decimals);
    
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    
    return num.toFixed(Math.min(maxDecimals, decimals));
  }

  /**
   * Get risk level color
   */
  static getRiskColor(score: number): string {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Get risk level badge variant
   */
  static getRiskBadgeVariant(score: number): 'success' | 'warning' | 'danger' {
    if (score < 30) return 'success';
    if (score < 70) return 'warning';
    return 'danger';
  }

  /**
   * Calculate portfolio diversity score
   */
  static calculateDiversityScore(allocations: TokenAllocation[]): number {
    if (allocations.length === 0) return 0;
    
    // Herfindahl-Hirschman Index for concentration
    const hhi = allocations.reduce((sum, allocation) => {
      const share = allocation.percentage / 100;
      return sum + (share * share);
    }, 0);
    
    // Convert to diversity score (0-100, higher is more diverse)
    const maxHHI = 1; // Maximum concentration (100% in one asset)
    const minHHI = 1 / allocations.length; // Perfect diversification
    
    return Math.max(0, Math.min(100, ((maxHHI - hhi) / (maxHHI - minHHI)) * 100));
  }

  /**
   * Generate portfolio insights
   */
  static generateInsights(portfolio: PortfolioSummary): string[] {
    const insights: string[] = [];
    
    // Value insights
    if (portfolio.totalValueUsd > 100000) {
      insights.push('🏆 High-value portfolio detected');
    } else if (portfolio.totalValueUsd < 1000) {
      insights.push('🌱 Early stage portfolio');
    }

    // Stablecoin exposure insights
    if (portfolio.stablecoinExposure > 80) {
      insights.push('🏛️ High stablecoin exposure provides stability but limits growth potential');
    } else if (portfolio.stablecoinExposure < 10) {
      insights.push('⚡ Low stablecoin exposure increases volatility risk');
    } else {
      insights.push('⚖️ Balanced stablecoin exposure detected');
    }

    // Diversification insights
    const uniqueTokens = portfolio.tokenBalances.length + 1; // +1 for ETH
    if (uniqueTokens < 3) {
      insights.push('📊 Consider diversifying across more assets');
    } else if (uniqueTokens > 10) {
      insights.push('🎯 Highly diversified portfolio - consider consolidation');
    }

    // Top holding insights
    const topAllocation = portfolio.allocations[0];
    if (topAllocation && topAllocation.percentage > 70) {
      insights.push(`⚠️ High concentration in ${topAllocation.symbol} (${topAllocation.percentage.toFixed(1)}%)`);
    }

    return insights;
  }

  /**
   * Get allocation chart data for Chart.js
   */
  static getAllocationChartData(allocations: TokenAllocation[]) {
    return {
      labels: allocations.map(a => a.symbol),
      datasets: [{
        data: allocations.map(a => a.percentage),
        backgroundColor: allocations.map(a => a.color),
        borderWidth: 0,
      }],
    };
  }

  /**
   * Get chart options for pie chart
   */
  static getChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right' as const,
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const value = context.parsed;
              return `${context.label}: ${value.toFixed(1)}%`;
            },
          },
        },
      },
    };
  }

  /**
   * Validate Ethereum address
   */
  static isValidEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Shorten address for display
   */
  static shortenAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Get network name from chain ID
   */
  static getNetworkName(chainId: number): string {
    const networks: Record<number, string> = {
      1: 'Ethereum Mainnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon',
      56: 'BSC',
      43114: 'Avalanche',
      250: 'Fantom',
      42161: 'Arbitrum One',
      10: 'Optimism',
    };
    
    return networks[chainId] || `Chain ${chainId}`;
  }

  /**
   * Check if network is supported
   */
  static isSupportedNetwork(chainId: number): boolean {
    // Currently only support Ethereum Mainnet
    return chainId === 1;
  }
}