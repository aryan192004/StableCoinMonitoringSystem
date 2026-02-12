'use client';

import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';

export default function LiquidityPage() {
  const exchanges = [
    { 
      name: 'Binance', 
      pairs: ['USDT/USD', 'USDC/USD', 'DAI/USD'],
      totalDepth: '$4.2B',
      avgSpread: '0.01%',
      status: 'excellent',
    },
    { 
      name: 'Coinbase', 
      pairs: ['USDC/USD', 'USDT/USD'],
      totalDepth: '$2.8B',
      avgSpread: '0.02%',
      status: 'good',
    },
    { 
      name: 'Kraken', 
      pairs: ['USDT/USD', 'DAI/USD'],
      totalDepth: '$1.4B',
      avgSpread: '0.03%',
      status: 'good',
    },
    { 
      name: 'Uniswap V3', 
      pairs: ['USDC/ETH', 'DAI/ETH', 'USDT/ETH'],
      totalDepth: '$840M',
      avgSpread: '0.05%',
      status: 'fair',
    },
  ];

  const depthData = [
    { price: '$0.9990', bids: '$124M', asks: '$118M', total: '$242M' },
    { price: '$0.9995', bids: '$456M', asks: '$432M', total: '$888M' },
    { price: '$1.0000', bids: '$2.1B', asks: '$2.0B', total: '$4.1B' },
    { price: '$1.0005', bids: '$432M', asks: '$456M', total: '$888M' },
    { price: '$1.0010', bids: '$118M', asks: '$124M', total: '$242M' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Liquidity Monitoring</h1>
            <p className="text-textSecondary">Real-time order book depth across exchanges</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">Download Report</Button>
            <Button variant="primary">Configure Alerts</Button>
          </div>
        </div>

        {/* Exchange Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {exchanges.map((exchange, i) => (
            <Card key={i} hover>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-textPrimary">{exchange.name}</h3>
                    <p className="text-xs text-textSecondary mt-1">{exchange.pairs.length} pairs</p>
                  </div>
                  <Badge 
                    variant={
                      exchange.status === 'excellent' ? 'success' : 
                      exchange.status === 'good' ? 'neutral' : 'warning'
                    }
                  >
                    {exchange.status}
                  </Badge>
                </div>
                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-textSecondary">Total Depth</span>
                    <span className="font-semibold text-textPrimary">{exchange.totalDepth}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-textSecondary">Avg Spread</span>
                    <span className="font-medium text-primary">{exchange.avgSpread}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Book Depth Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Aggregated Order Book Depth</CardTitle>
            <div className="flex items-center gap-2">
              <select className="px-3 py-1.5 text-sm border border-border rounded-lg bg-surface">
                <option>All Stablecoins</option>
                <option>USDT</option>
                <option>USDC</option>
                <option>DAI</option>
              </select>
              <select className="px-3 py-1.5 text-sm border border-border rounded-lg bg-surface">
                <option>All Exchanges</option>
                <option>Binance</option>
                <option>Coinbase</option>
                <option>Kraken</option>
              </select>
            </div>
          </CardHeader>
          <CardBody>
            {/* Depth Chart */}
            <div className="relative h-64 mb-6">
              <div className="absolute inset-0 flex items-end justify-center gap-1">
                {/* Bids (left side) */}
                <div className="flex-1 flex items-end justify-end gap-1">
                  {depthData.slice(0, 2).reverse().map((data, i) => {
                    const height = (parseFloat(data.bids.replace(/[$BM]/g, '')) / 2100) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-success/30 hover:bg-success/50 transition-colors cursor-pointer rounded-t"
                          style={{ height: `${height}%` }}
                          title={`Bids at ${data.price}: ${data.bids}`}
                        />
                      </div>
                    );
                  })}
                </div>
                
                {/* Current price marker */}
                <div className="w-16 flex flex-col items-center justify-end">
                  <div className="w-full bg-primary h-full rounded-t" />
                  <div className="mt-2 text-xs font-bold text-primary">$1.00</div>
                </div>

                {/* Asks (right side) */}
                <div className="flex-1 flex items-end gap-1">
                  {depthData.slice(3).map((data, i) => {
                    const height = (parseFloat(data.asks.replace(/[$BM]/g, '')) / 2100) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-danger/30 hover:bg-danger/50 transition-colors cursor-pointer rounded-t"
                          style={{ height: `${height}%` }}
                          title={`Asks at ${data.price}: ${data.asks}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Depth Table */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-success mb-3">Bid Depth</h4>
                <div className="space-y-2">
                  {depthData.slice(0, 3).reverse().map((data, i) => (
                    <div key={i} className="flex justify-between text-sm bg-success/5 rounded-lg px-3 py-2">
                      <span className="text-textSecondary">{data.price}</span>
                      <span className="font-medium text-textPrimary">{data.bids}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-danger mb-3">Ask Depth</h4>
                <div className="space-y-2">
                  {depthData.slice(2).map((data, i) => (
                    <div key={i} className="flex justify-between text-sm bg-danger/5 rounded-lg px-3 py-2">
                      <span className="text-textSecondary">{data.price}</span>
                      <span className="font-medium text-textPrimary">{data.asks}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* DEX Liquidity Pools */}
        <Card>
          <CardHeader>
            <CardTitle>DEX Liquidity Pools</CardTitle>
            <span className="text-sm text-textSecondary">Decentralized exchange pool tracking</span>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {[
                { pool: 'USDC/ETH', dex: 'Uniswap V3', tvl: '$524M', volume24h: '$142M', apy: '12.4%' },
                { pool: 'DAI/USDC', dex: 'Curve', tvl: '$312M', volume24h: '$84M', apy: '8.2%' },
                { pool: 'USDT/USDC', dex: 'Uniswap V2', tvl: '$218M', volume24h: '$56M', apy: '6.8%' },
              ].map((pool, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {pool.dex.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-textPrimary">{pool.pool}</div>
                      <div className="text-sm text-textSecondary">{pool.dex}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="text-xs text-textSecondary mb-1">TVL</div>
                      <div className="font-semibold text-textPrimary">{pool.tvl}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-textSecondary mb-1">24h Volume</div>
                      <div className="font-medium text-textPrimary">{pool.volume24h}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-textSecondary mb-1">APY</div>
                      <div className="font-semibold text-success">{pool.apy}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
