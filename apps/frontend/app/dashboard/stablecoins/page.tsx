'use client';

import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardBody, KPICard } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';

export default function StablecoinDetailPage() {
  const metrics = [
    { label: 'Current Price', value: '$1.0001', change: 0.01, trend: 'up' as const },
    { label: 'Market Cap', value: '$95.4B', change: 2.4, trend: 'up' as const },
    { label: '24h Volume', value: '$42.3B', change: -1.2, trend: 'down' as const },
    { label: 'Risk Score', value: '0.32', trend: 'neutral' as const },
  ];

  const liquidityMetrics = [
    { exchange: 'Binance', depth: '$2.4B', spread: '0.01%', status: 'Excellent' },
    { exchange: 'Coinbase', depth: '$1.8B', spread: '0.02%', status: 'Good' },
    { exchange: 'Kraken', depth: '$840M', spread: '0.03%', status: 'Good' },
    { exchange: 'Uniswap V3', depth: '$524M', spread: '0.05%', status: 'Fair' },
  ];

  const reserves = [
    { type: 'Cash', percentage: 45, amount: '$42.9B', color: 'bg-primary' },
    { type: 'Treasury Bills', percentage: 35, amount: '$33.4B', color: 'bg-success' },
    { type: 'Commercial Paper', percentage: 15, amount: '$14.3B', color: 'bg-warning' },
    { type: 'Other', percentage: 5, amount: '$4.8B', color: 'bg-gray-400' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-2xl shadow-soft">
              T
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1>Tether (USDT)</h1>
                <Badge variant="success">Stable</Badge>
              </div>
              <p className="text-textSecondary">Fiat-backed stablecoin issued by Tether Limited</p>
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

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Price Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Price History (7 Days)</CardTitle>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-sm rounded-lg bg-primary text-white">7D</button>
                <button className="px-3 py-1 text-sm rounded-lg text-textSecondary hover:bg-gray-100">30D</button>
                <button className="px-3 py-1 text-sm rounded-lg text-textSecondary hover:bg-gray-100">90D</button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="h-64 flex items-end gap-1">
                {Array.from({ length: 28 }).map((_, i) => {
                  const baseHeight = 50;
                  const variance = Math.random() * 10 - 5;
                  const height = baseHeight + variance;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-primary/30 rounded-t hover:bg-primary/50 transition-colors cursor-pointer"
                      style={{ height: `${height}%` }}
                      title={`Day ${i + 1}: $${(1.0000 + (Math.random() * 0.0010 - 0.0005)).toFixed(4)}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-4 text-xs text-textSecondary">
                <span>7 days ago</span>
                <span className="text-textPrimary font-medium">~$1.0000</span>
                <span>Today</span>
              </div>
            </CardBody>
          </Card>

          {/* Reserve Composition */}
          <Card>
            <CardHeader>
              <CardTitle>Reserve Composition</CardTitle>
              <span className="text-sm text-textSecondary">Last updated: Today</span>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {/* Pie Chart Representation */}
                <div className="flex h-48 gap-1 rounded-lg overflow-hidden">
                  {reserves.map((reserve, i) => (
                    <div
                      key={i}
                      className={`${reserve.color} transition-all hover:opacity-80 cursor-pointer`}
                      style={{ width: `${reserve.percentage}%` }}
                      title={`${reserve.type}: ${reserve.percentage}%`}
                    />
                  ))}
                </div>
                {/* Legend */}
                <div className="space-y-2">
                  {reserves.map((reserve, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-sm ${reserve.color}`} />
                        <span className="text-sm text-textSecondary">{reserve.type}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-textPrimary">{reserve.amount}</span>
                        <span className="text-sm text-textSecondary">{reserve.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
            <div className="space-y-4">
              {liquidityMetrics.map((metric, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-32 font-medium text-textPrimary">{metric.exchange}</div>
                  <div className="flex-1">
                    <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary-hover transition-all"
                        style={{ width: `${(parseFloat(metric.depth.replace(/[$BM]/g, '')) / 2.4) * 100}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-between px-3">
                        <span className="text-sm font-medium text-white drop-shadow">{metric.depth}</span>
                        <span className="text-xs text-textSecondary">{metric.spread} spread</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={metric.status === 'Excellent' ? 'success' : 'neutral'}>
                    {metric.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
