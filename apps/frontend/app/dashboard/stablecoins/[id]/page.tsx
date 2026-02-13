'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardBody, KPICard } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';
import { PriceChart } from '@/components/charts';
import { 
  useStablecoins,
  useStablecoin, 
  usePegHistory, 
  useLiquidityData, 
  useReserveData,
  useLiquidityPrediction,
  useAnomalyDetection
} from '@/hooks/useData';
import { formatCompactNumber, formatPercentage } from '@/utils/formatters';

const TIME_PERIODS = [
  { value: '7d', label: '7D', days: 7 },
  { value: '30d', label: '30D', days: 30 },
  { value: '90d', label: '90D', days: 90 },
];

export default function StablecoinDetailPage() {
  const params = useParams();
  const stablecoinId = params?.id as string || 'usdt';
  const [timePeriod, setTimePeriod] = useState('7d');
  const router = useRouter();

  // coin list for selector
  const { stablecoins, isLoading: stablecoinsLoading } = useStablecoins();
  const [selectedCoin, setSelectedCoin] = useState<string>('');

  useEffect(() => {
    setSelectedCoin(stablecoinId);
  }, [stablecoinId]);

  // Fetch all data using hooks
  const { stablecoin, isLoading: stablecoinLoading, isError: stablecoinError } = useStablecoin(stablecoinId);
  const { history, isLoading: historyLoading } = usePegHistory(stablecoinId, timePeriod);
  const { liquidity, isLoading: liquidityLoading } = useLiquidityData(stablecoinId);
  const { reserves, isLoading: reservesLoading } = useReserveData(stablecoinId);
  const { prediction } = useLiquidityPrediction(stablecoinId);
  const { anomaly } = useAnomalyDetection(stablecoinId);

  // Calculate metrics from stablecoin data
  const currentPrice = history.length > 0 ? history[history.length - 1].price : stablecoin?.price;
  const currentDeviation = history.length > 0 ? history[history.length - 1].deviation || 0 : stablecoin?.pegDeviation || 0;

  const metrics = [
    {
      label: 'Current Price',
      value: stablecoin ? `$${stablecoin.price.toFixed(4)}` : 'Loading...',
      change: stablecoin?.pegDeviation ? stablecoin.pegDeviation * 100 : undefined,
      trend: stablecoin && Math.abs(stablecoin.pegDeviation) < 0.01 ? 'neutral' as const : 
             stablecoin && stablecoin.pegDeviation > 0 ? 'up' as const : 'down' as const,
    },
    {
      label: 'Market Cap',
      value: stablecoin ? formatCompactNumber(stablecoin.marketCap) : 'Loading...',
      change: undefined,
      trend: 'neutral' as const,
    },
    {
      label: '24h Volume',
      value: stablecoin ? formatCompactNumber(stablecoin.volume24h) : 'Loading...',
      change: undefined,
      trend: 'neutral' as const,
    },
    {
      label: 'Risk Score',
      value: stablecoin ? (stablecoin.riskScore * 100).toFixed(1) + '%' : 'Loading...',
      trend: stablecoin && stablecoin.riskScore < 0.2 ? 'up' as const : 
             stablecoin && stablecoin.riskScore < 0.5 ? 'neutral' as const : 'down' as const,
    },
  ];

  // Prepare liquidity metrics
  const liquidityMetrics = liquidity?.exchanges ? liquidity.exchanges.map((exchange: any) => ({
    exchange: exchange.name || exchange.exchange || 'Unknown',
    depth: formatCompactNumber((exchange.orderBookDepth.bids + exchange.orderBookDepth.asks) / 2),
    spread: formatPercentage(exchange.bidAskSpread * 100, 4),
    status: exchange.bidAskSpread < 0.0001 ? 'Excellent' : 
            exchange.bidAskSpread < 0.001 ? 'Good' : 'Poor'
  })) : [];

  // Prepare reserves data
  const reserveItems = reserves ? [
    { type: 'Cash', percentage: reserves.cash || 0, amount: `${reserves.cash?.toFixed(1) || 0}%`, color: 'bg-green-500' },
    { type: 'Treasury Bills', percentage: reserves.treasuryBills || 0, amount: `${reserves.treasuryBills?.toFixed(1) || 0}%`, color: 'bg-blue-500' },
    { type: 'Commercial Paper', percentage: reserves.commercialPaper || 0, amount: `${reserves.commercialPaper?.toFixed(1) || 0}%`, color: 'bg-yellow-500' },
    { type: 'Crypto Backed', percentage: reserves.cryptoBacked || 0, amount: `${reserves.cryptoBacked?.toFixed(1) || 0}%`, color: 'bg-purple-500' },
    { type: 'Other', percentage: reserves.other || 0, amount: `${reserves.other?.toFixed(1) || 0}%`, color: 'bg-gray-500' },
  ].filter(item => item.percentage > 0) : [];

  // Get stablecoin name and description
  const getStablecoinInfo = (id: string) => {
    const info: { [key: string]: { name: string; description: string } } = {
      'usdt': { name: 'Tether', description: 'Fiat-backed stablecoin issued by Tether Limited' },
      'usdc': { name: 'USD Coin', description: 'Fiat-backed stablecoin issued by Circle' },
      'dai': { name: 'Dai', description: 'Decentralized stablecoin by MakerDAO' },
      'busd': { name: 'Binance USD', description: 'Fiat-backed stablecoin issued by Binance' },
      'usdd': { name: 'USDD', description: 'Decentralized algorithmic stablecoin' },
    };
    return info[id.toLowerCase()] || { name: id.toUpperCase(), description: 'Stablecoin pegged to USD' };
  };

  const stablecoinInfo = getStablecoinInfo(stablecoinId);
  const displayName = stablecoin?.name || stablecoinInfo.name;
  const displaySymbol = stablecoin?.symbol || stablecoinId.toUpperCase();
  const displayDescription = stablecoinInfo.description;

  if (stablecoinLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-textSecondary">Loading stablecoin data...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (stablecoinError) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading stablecoin data. Please try again later.
        </div>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-2xl shadow-soft">
              {displaySymbol.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1>{displayName} ({displaySymbol})</h1>
                <Badge
                  variant={
                    anomaly?.is_anomaly ? 'danger' : 
                    Math.abs(currentDeviation) < 0.5 ? 'success' : 'warning'
                  }
                >
                  {anomaly?.severity || (Math.abs(currentDeviation) < 0.5 ? 'Stable' : 'Monitor')}
                </Badge>
              </div>
              <p className="text-textSecondary">{displayDescription}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push('/dashboard/stablecoins')}>Back</Button>

            {/* Coin selector to quickly switch coins */}
            <div className="min-w-[200px]">
              {stablecoinsLoading ? (
                <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
              ) : (
                <select
                  value={selectedCoin}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedCoin(id);
                    if (id) router.push(`/dashboard/stablecoins/${id}`);
                  }}
                  className="px-3 py-2 bg-surface border border-border rounded-lg text-textPrimary"
                >
                  <option value="">Switch coin...</option>
                  {stablecoins?.map((c: any) => {
                    const id = c.id || c.symbol?.toLowerCase() || '';
                    const label = `${c.name || id.toUpperCase()} (${c.symbol || id.toUpperCase()})`;
                    return <option key={id} value={id}>{label}</option>;
                  })}
                </select>
              )}
            </div>

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

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Price Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Price & Peg Deviation History</CardTitle>
              <div className="flex items-center gap-2">
                {TIME_PERIODS.map((period) => (
                  <button
                    key={period.value}
                    onClick={() => setTimePeriod(period.value)}
                    disabled={historyLoading}
                    className={`px-3 py-1 text-sm rounded-lg transition-all ${
                      timePeriod === period.value
                        ? 'bg-primary text-white'
                        : 'text-textSecondary hover:bg-gray-100'
                    } ${historyLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardBody>
              {historyLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-gray-500">Loading chart data...</div>
                </div>
              ) : history.length > 0 ? (
                <PriceChart data={history} showDeviation={true} height={320} />
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-gray-500">No historical data available</div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Reserve Composition */}
          <Card>
            <CardHeader>
              <CardTitle>Reserve Composition</CardTitle>
              <span className="text-sm text-textSecondary">
                {reserves?.lastAudited 
                  ? `Last audited: ${new Date(reserves.lastAudited).toLocaleDateString()}`
                  : 'Transparency data'}
              </span>
            </CardHeader>
            <CardBody>
              {reservesLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-gray-500">Loading reserve data...</div>
                </div>
              ) : reserveItems.length > 0 ? (
                <div className="space-y-4">
                  {/* Pie Chart Representation */}
                  <div className="flex h-48 gap-1 rounded-lg overflow-hidden">
                    {reserveItems.map((reserve, i) => (
                      <div
                        key={i}
                        className={`${reserve.color} transition-all hover:opacity-80 cursor-pointer`}
                        style={{ width: `${reserve.percentage}%` }}
                        title={`${reserve.type}: ${reserve.percentage.toFixed(1)}%`}
                      />
                    ))}
                  </div>
                  {/* Legend */}
                  <div className="space-y-2">
                    {reserveItems.map((reserve, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-sm ${reserve.color}`} />
                          <span className="text-sm text-textSecondary">{reserve.type}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-textPrimary">{reserve.amount}</span>
                          <span className="text-sm text-textSecondary">{reserve.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {reserves?.transparencyScore && (
                    <div className="pt-2 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-textSecondary">Transparency Score</span>
                        <span className="text-sm font-semibold text-textPrimary">
                          {(reserves.transparencyScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-gray-500">No reserve data available</div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Liquidity Depth */}
        <Card>
          <CardHeader>
            <CardTitle>Liquidity Depth by Exchange</CardTitle>
            <span className="text-sm text-textSecondary">Real-time order book analysis</span>
          </CardHeader>
          <CardBody>
            {liquidityLoading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="text-gray-500">Loading liquidity data...</div>
              </div>
            ) : liquidityMetrics.length > 0 ? (
              <div className="space-y-4">
                {liquidityMetrics.map((metric: any, i: number) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-32 font-medium text-textPrimary">{metric.exchange}</div>
                    <div className="flex-1">
                      <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary-hover transition-all"
                          style={{ 
                            width: `${Math.min(
                              (parseFloat(metric.depth.replace(/[$,BMK]/g, '')) / 100) * 100, 
                              100
                            )}%` 
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-between px-3">
                          <span className="text-sm font-medium text-white drop-shadow">{metric.depth}</span>
                          <span className="text-xs text-textSecondary">{metric.spread} spread</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={
                      metric.status === 'Excellent' ? 'success' : 
                      metric.status === 'Good' ? 'warning' : 'danger'
                    }>
                      {metric.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <div className="text-gray-500">No liquidity data available</div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Statistics Summary */}
        {history.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardBody>
                <div className="space-y-2">
                  <p className="text-sm text-textSecondary">Max Deviation</p>
                  <p className="text-2xl font-bold">
                    {Math.max(...history.map((d: any) => Math.abs(d.deviation || 0))).toFixed(3)}%
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
                      history.reduce((sum: number, d: any) => sum + Math.abs(d.deviation || 0), 0) /
                      history.length
                    ).toFixed(3)}%
                  </p>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="space-y-2">
                  <p className="text-sm text-textSecondary">Data Points</p>
                  <p className="text-2xl font-bold">{history.length}</p>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Additional Predictions and Anomalies */}
        {(prediction || anomaly) && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Liquidity Predictions */}
            {prediction && (
              <Card>
                <CardHeader>
                  <CardTitle>Liquidity Predictions</CardTitle>
                  <span className="text-sm text-textSecondary">
                    ML-powered forecasts
                  </span>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {prediction.predictions && Object.entries(prediction.predictions).map(([period, score]: [string, any]) => (
                      <div key={period} className="flex justify-between items-center">
                        <span className="text-sm text-textSecondary capitalize">{period}:</span>
                        <span className="text-sm font-medium">{formatPercentage(score * 100)}</span>
                      </div>
                    ))}
                    {prediction.confidence && (
                      <div className="pt-2 border-t border-border flex justify-between items-center">
                        <span className="text-sm text-textSecondary">Confidence:</span>
                        <span className="text-sm font-semibold">{formatPercentage(prediction.confidence * 100)}</span>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Anomaly Detection */}
            {anomaly && (
              <Card>
                <CardHeader>
                  <CardTitle>Anomaly Detection</CardTitle>
                  <Badge variant={anomaly.is_anomaly ? 'danger' : 'success'}>
                    {anomaly.severity}
                  </Badge>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-textSecondary">Anomaly Score:</span>
                      <span className="text-sm font-medium">{anomaly.anomaly_score?.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-textSecondary">Status:</span>
                      <Badge variant={anomaly.is_anomaly ? 'danger' : 'success'}>
                        {anomaly.is_anomaly ? 'Anomaly Detected' : 'Normal'}
                      </Badge>
                    </div>
                    {anomaly.alerts && anomaly.alerts.length > 0 && (
                      <div className="pt-2 border-t border-border space-y-1">
                        <span className="text-sm font-medium text-textPrimary">Active Alerts:</span>
                        {anomaly.alerts.map((alert: any, i: number) => (
                          <div key={i} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            {alert.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
