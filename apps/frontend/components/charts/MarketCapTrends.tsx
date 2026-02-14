/**
 * Market Cap Trends Component
 * Displays real-time market cap trends from DefiLlama
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui';
import { getMarketCapTrends, MarketCapTrendsResponse, formatMarketCap } from '@/utils/defillamaApi';

interface MarketCapTrendsProps {
  limit?: number;
  days?: number;
}

export function MarketCapTrends({ limit = 5, days = 30 }: MarketCapTrendsProps) {
  const [data, setData] = useState<MarketCapTrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(days);

  useEffect(() => {
    fetchTrends();
  }, [selectedPeriod, limit]);

  async function fetchTrends() {
    try {
      setLoading(true);
      setError(null);
      const response = await getMarketCapTrends(limit, selectedPeriod);
      setData(response);
    } catch (err: any) {
      console.error('Error fetching market cap trends:', err);
      setError(err.message || 'Failed to load market cap trends');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Cap Trends</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-textSecondary">Loading market data...</div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Cap Trends</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-center h-64">
            <div className="text-danger">
              <p className="font-semibold mb-2">Error loading data</p>
              <p className="text-sm text-textSecondary">{error}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!data || data.trends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Cap Trends</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-center h-64">
            <div className="text-textSecondary">No data available</div>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Calculate max value for normalization
  const maxValue = Math.max(
    ...data.trends.flatMap(trend => 
      trend.data.map(d => d.marketCap)
    )
  );

  // Get colors for each stablecoin
  const colors = [
    'bg-primary',
    'bg-success',
    'bg-warning',
    'bg-danger',
    'bg-info',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];

  // Sample data points for visualization (take every Nth point for cleaner display)
  const samplingRate = Math.ceil(selectedPeriod / 30); // Show ~30 bars
  const sampledIndices: number[] = [];
  const maxDataLength = Math.max(...data.trends.map(t => t.data.length));
  
  for (let i = 0; i < maxDataLength; i += samplingRate) {
    sampledIndices.push(i);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Cap Trends ({selectedPeriod} Days)</CardTitle>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedPeriod(30)}
            className={`px-3 py-1 text-sm rounded-lg ${
              selectedPeriod === 30 ? 'bg-primary text-white' : 'text-textSecondary hover:bg-gray-100'
            }`}
          >
            30D
          </button>
          <button
            onClick={() => setSelectedPeriod(90)}
            className={`px-3 py-1 text-sm rounded-lg ${
              selectedPeriod === 90 ? 'bg-primary text-white' : 'text-textSecondary hover:bg-gray-100'
            }`}
          >
            90D
          </button>
          <button
            onClick={() => setSelectedPeriod(180)}
            className={`px-3 py-1 text-sm rounded-lg ${
              selectedPeriod === 180 ? 'bg-primary text-white' : 'text-textSecondary hover:bg-gray-100'
            }`}
          >
            180D
          </button>
          <button
            onClick={() => setSelectedPeriod(365)}
            className={`px-3 py-1 text-sm rounded-lg ${
              selectedPeriod === 365 ? 'bg-primary text-white' : 'text-textSecondary hover:bg-gray-100'
            }`}
          >
            1Y
          </button>
        </div>
      </CardHeader>
      <CardBody>
        {/* Line Chart Area */}
        <div className="h-64 relative border-l-2 border-b-2 border-gray-200 dark:border-gray-700">
          <svg className="w-full h-full" viewBox="0 0 1000 256" preserveAspectRatio="none">
            {data.trends.map((trend, trendIdx) => {
              const color = colors[trendIdx % colors.length];
              const colorMap: Record<string, string> = {
                'bg-primary': '#06b6d4',
                'bg-success': '#10b981',
                'bg-warning': '#f59e0b',
                'bg-danger': '#ef4444',
                'bg-info': '#3b82f6',
                'bg-purple-500': '#a855f7',
                'bg-pink-500': '#ec4899',
                'bg-indigo-500': '#6366f1',
              };
              const strokeColor = colorMap[color] || '#06b6d4';
              
              const points = trend.data.map((point, idx) => {
                const x = (idx / (trend.data.length - 1)) * 1000;
                const y = 256 - ((point.marketCap / maxValue) * 220); // Leave 36px margin
                return `${x},${y}`;
              }).join(' ');

              return (
                <polyline
                  key={trend.symbol}
                  points={points}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all"
                />
              );
            })}
          </svg>
        </div>

        {/* Legend and Labels */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-textSecondary">
            {selectedPeriod} days ago
          </span>
          <div className="flex items-center gap-4 flex-wrap">
            {data.trends.map((trend, idx) => {
              const color = colors[idx % colors.length];
              const colorMap: Record<string, string> = {
                'bg-primary': '#06b6d4',
                'bg-success': '#10b981',
                'bg-warning': '#f59e0b',
                'bg-danger': '#ef4444',
              };
              const bgColor = colorMap[color] || '#06b6d4';
              
              return (
                <div key={trend.symbol} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: bgColor }} />
                  <span className="text-xs text-textSecondary">{trend.symbol}</span>
                </div>
              );
            })}
          </div>
          <span className="text-xs text-textSecondary">Today</span>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {data.trends.map((trend) => {
            const latestData = trend.data[trend.data.length - 1];
            const firstData = trend.data[0];
            const change = firstData
              ? ((latestData.marketCap - firstData.marketCap) / firstData.marketCap) * 100
              : 0;

            return (
              <div key={trend.symbol} className="text-center">
                <div className="text-sm font-semibold text-textPrimary">{trend.symbol}</div>
                <div className="text-xs text-textSecondary mt-1">
                  {formatMarketCap(latestData?.marketCap || 0)}
                </div>
                <div
                  className={`text-xs font-medium mt-1 ${
                    change > 0 ? 'text-success' : change < 0 ? 'text-danger' : 'text-textSecondary'
                  }`}
                >
                  {change > 0 ? '+' : ''}
                  {change.toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
