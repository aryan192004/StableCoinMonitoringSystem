'use client';

import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardBody, KPICard } from '@/components/ui';

export default function AnalyticsPage() {
  const metrics = [
    { title: 'Market Stability Index', value: '94.2', change: 1.8, trend: 'up' as const, icon: '📈' },
    { title: 'Systemic Risk Level', value: 'Low', trend: 'neutral' as const, icon: '🛡️' },
    { title: 'Correlation Index', value: '0.73', change: -2.1, trend: 'down' as const, icon: '🔗' },
    { title: 'Volatility Score', value: '0.12', change: -5.3, trend: 'down' as const, icon: '📊' },
  ];

  const correlationData = [
    { coin1: 'USDT', coin2: 'USDC', correlation: 0.89, strength: 'Very High' },
    { coin1: 'USDC', coin2: 'DAI', correlation: 0.76, strength: 'High' },
    { coin1: 'USDT', coin2: 'DAI', correlation: 0.71, strength: 'High' },
    { coin1: 'BUSD', coin2: 'USDC', correlation: 0.82, strength: 'Very High' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="mb-2">Advanced Analytics</h1>
          <p className="text-textSecondary">Deep insights into stablecoin market dynamics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <KPICard
              key={index}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              trend={metric.trend}
              icon={<span className="text-2xl">{metric.icon}</span>}
            />
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Market Composition */}
          <Card>
            <CardHeader>
              <CardTitle>Market Cap Distribution</CardTitle>
              <span className="text-sm text-textSecondary">Current allocation</span>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {[
                  { name: 'USDT', percentage: 63.5, value: '$95.4B', color: 'bg-primary' },
                  { name: 'USDC', percentage: 19.1, value: '$28.7B', color: 'bg-success' },
                  { name: 'DAI', percentage: 3.5, value: '$5.2B', color: 'bg-warning' },
                  { name: 'BUSD', percentage: 2.7, value: '$4.1B', color: 'bg-danger' },
                  { name: 'Others', percentage: 11.2, value: '$16.8B', color: 'bg-gray-400' },
                ].map((coin, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-sm ${coin.color}`} />
                        <span className="text-sm font-medium text-textPrimary">{coin.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-textSecondary">{coin.value}</span>
                        <span className="text-sm font-semibold text-textPrimary">{coin.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${coin.color} transition-all duration-500`}
                        style={{ width: `${coin.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Correlation Matrix */}
          <Card>
            <CardHeader>
              <CardTitle>Price Correlation Matrix</CardTitle>
              <span className="text-sm text-textSecondary">7-day correlation</span>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {correlationData.map((data, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-textPrimary">
                        {data.coin1} ↔ {data.coin2}
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {data.correlation.toFixed(2)}
                      </span>
                    </div>
                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-success to-primary rounded-full transition-all"
                        style={{ width: `${data.correlation * 100}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-textSecondary">
                      {data.strength} correlation
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Historical Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Market Cap Trends (30 Days)</CardTitle>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm rounded-lg bg-primary text-white">30D</button>
              <button className="px-3 py-1 text-sm rounded-lg text-textSecondary hover:bg-gray-100">90D</button>
              <button className="px-3 py-1 text-sm rounded-lg text-textSecondary hover:bg-gray-100">1Y</button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-64 flex items-end gap-1">
              {Array.from({ length: 30 }).map((_, i) => {
                const height = 30 + Math.sin(i / 5) * 20 + Math.random() * 15;
                return (
                  <div key={i} className="flex-1 flex flex-col-reverse gap-0.5">
                    <div 
                      className="bg-primary/30 hover:bg-primary/50 transition-colors cursor-pointer rounded-t"
                      style={{ height: `${height}%` }}
                      title={`Day ${i + 1}: $${(150 + Math.random() * 10).toFixed(1)}B`}
                    />
                    <div 
                      className="bg-success/30 hover:bg-success/50 transition-colors cursor-pointer rounded-t"
                      style={{ height: `${height * 0.6}%` }}
                    />
                    <div 
                      className="bg-warning/30 hover:bg-warning/50 transition-colors cursor-pointer rounded-t"
                      style={{ height: `${height * 0.3}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-textSecondary">30 days ago</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-primary/30" />
                  <span className="text-xs text-textSecondary">Total Market</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-success/30" />
                  <span className="text-xs text-textSecondary">Top 3</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-warning/30" />
                  <span className="text-xs text-textSecondary">Others</span>
                </div>
              </div>
              <span className="text-xs text-textSecondary">Today</span>
            </div>
          </CardBody>
        </Card>

        {/* Risk Breakdown */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Categories</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {[
                  { category: 'Collateral Risk', score: 0.21, color: 'success' },
                  { category: 'Liquidity Risk', score: 0.34, color: 'warning' },
                  { category: 'Regulatory Risk', score: 0.42, color: 'warning' },
                  { category: 'Smart Contract Risk', score: 0.18, color: 'success' },
                ].map((risk, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-textSecondary">{risk.category}</span>
                      <span className={`text-sm font-semibold text-${risk.color}`}>
                        {risk.score.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-${risk.color} transition-all`}
                        style={{ width: `${risk.score * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exchange Concentration</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {[
                  { exchange: 'Binance', share: 42 },
                  { exchange: 'Coinbase', share: 28 },
                  { exchange: 'Kraken', share: 15 },
                  { exchange: 'Others', share: 15 },
                ].map((ex, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-textSecondary">{ex.exchange}</span>
                    <span className="text-sm font-semibold text-textPrimary">{ex.share}%</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stability Metrics</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {[
                  { metric: 'Avg Peg Deviation', value: '0.08%', good: true },
                  { metric: 'Max Deviation (24h)', value: '0.32%', good: true },
                  { metric: 'Recovery Time', value: '4.2min', good: true },
                  { metric: 'Volatility Index', value: '0.12', good: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-textSecondary">{item.metric}</span>
                    <span className={`text-sm font-semibold ${item.good ? 'text-success' : 'text-danger'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
