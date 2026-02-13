'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardBody, KPICard } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';
import { PriceChart, PriceDataPoint } from '@/components/charts';
import axios from 'axios';

const TIME_PERIODS = [
  { value: '7d', label: '7D', days: 7 },
  { value: '30d', label: '30D', days: 30 },
  { value: '90d', label: '90D', days: 90 },
];

export default function StablecoinDetailPage() {
  const params = useParams();
  const stablecoinId = params?.id as string || 'usdt';

  const [timePeriod, setTimePeriod] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState<PriceDataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPegHistory();
  }, [stablecoinId, timePeriod]);

  const fetchPegHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:3001/api/stablecoins/${stablecoinId}/peg-history`, {
        params: { period: timePeriod },
      });

      const data = response.data.data || [];
      setHistoryData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch history data');
      console.error('Error fetching peg history:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentPrice = historyData.length > 0 ? historyData[historyData.length - 1].price : null;
  const currentDeviation = historyData.length > 0 ? historyData[historyData.length - 1].deviation || 0 : 0;

  const metrics = [
    {
      label: 'Current Price',
      value: currentPrice ? `$${currentPrice.toFixed(4)}` : 'Loading...',
      change: undefined,
      trend: 'neutral' as const,
    },
    {
      label: 'Peg Deviation',
      value: historyData.length > 0 ? `${currentDeviation.toFixed(3)}%` : 'Loading...',
      change: undefined,
      trend:
        historyData.length > 0
          ? Math.abs(currentDeviation) < 0.5
            ? ('up' as const)
            : ('down' as const)
          : ('neutral' as const),
    },
    { label: '24h Volume', value: '-', change: undefined, trend: 'neutral' as const },
    { label: 'Market Cap', value: '-', change: undefined, trend: 'neutral' as const },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-2xl shadow-soft">
              {stablecoinId.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1>
                  {stablecoinId === 'usdt'
                    ? 'Tether'
                    : stablecoinId === 'usdc'
                    ? 'USD Coin'
                    : stablecoinId === 'dai'
                    ? 'Dai'
                    : stablecoinId.toUpperCase()}{' '}
                  ({stablecoinId.toUpperCase()})
                </h1>
                <Badge
                  variant={
                    historyData.length > 0 && Math.abs(currentDeviation) < 0.5 ? 'success' : 'neutral'
                  }
                >
                  {historyData.length > 0 && Math.abs(currentDeviation) < 0.5 ? 'Stable' : 'Monitor'}
                </Badge>
              </div>
              <p className="text-textSecondary">
                {stablecoinId === 'usdt'
                  ? 'Fiat-backed stablecoin issued by Tether Limited'
                  : stablecoinId === 'usdc'
                  ? 'Fiat-backed stablecoin issued by Circle'
                  : stablecoinId === 'dai'
                  ? 'Decentralized stablecoin by MakerDAO'
                  : 'Stablecoin pegged to USD'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">Export Data</Button>
            <Button variant="primary">Set Alert</Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <KPICard
              key={index}
              title={metric.label}
              value={metric.value}
              change={metric.change}
              trend={metric.trend}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Price and Deviation Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Price & Peg Deviation History</CardTitle>
              <div className="flex items-center gap-2">
                {TIME_PERIODS.map((period) => (
                  <button
                    key={period.value}
                    onClick={() => setTimePeriod(period.value)}
                    disabled={loading}
                    className={`px-3 py-1 text-sm rounded-lg transition-all ${
                      timePeriod === period.value
                        ? 'bg-primary text-white'
                        : 'text-textSecondary hover:bg-gray-100'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-gray-500">Loading chart data...</div>
              </div>
            ) : historyData.length > 0 ? (
              <PriceChart data={historyData} showDeviation={true} height={320} />
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-gray-500">No data available</div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Statistics Summary */}
        {historyData.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardBody>
                <div className="space-y-2">
                  <p className="text-sm text-textSecondary">Max Deviation</p>
                  <p className="text-2xl font-bold">
                    {Math.max(...historyData.map((d) => Math.abs(d.deviation || 0))).toFixed(3)}%
                  </p>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="space-y-2">
                  <p className="text-sm text-textSecondary">Average Deviation</p>
                  <p className="text-2xl font-bold">
                    {(
                      historyData.reduce((sum, d) => sum + Math.abs(d.deviation || 0), 0) /
                      historyData.length
                    ).toFixed(3)}
                    %
                  </p>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="space-y-2">
                  <p className="text-sm text-textSecondary">Data Points</p>
                  <p className="text-2xl font-bold">{historyData.length}</p>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
