'use client';

import { DashboardLayout } from '@/components/layout';
import { KPICard } from '@/components/ui';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell
} from '@/components/ui/Table';
import { RiskBadge } from '@/components/ui/Badge';

export default function DashboardPage() {
  const kpiData = [
    {
      title: 'Total Market Cap',
      value: '-',
      change: undefined,
      trend: 'neutral' as const,
      icon: '-',
      subtitle: '-',
    },
    {
      title: 'Average Risk Score',
      value: '-',
      change: undefined,
      trend: 'neutral' as const,
      icon: '-',
      subtitle: '-',
    },
    {
      title: 'Active Stablecoins',
      value: '-',
      trend: 'neutral' as const,
      icon: '-',
      subtitle: '-',
    },
    {
      title: 'Liquidity Depth',
      value: '-',
      change: undefined,
      trend: 'neutral' as const,
      icon: '-',
      subtitle: '-',
    },
  ];

  const stablecoins = [
    { 
      name: '-',
      symbol: '-',
      price: '-',
      marketCap: '-',
      volume: '-',
      pegDeviation: '-',
      riskScore: 0,
      change24h: 0,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Markets Overview</h1>
            <p className="text-textSecondary">Real-time monitoring of all major stablecoins</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-textSecondary">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>Live data</span>
            <span className="text-textTertiary">Updated 2s ago</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => (
            <KPICard
              key={index}
              title={kpi.title}
              value={kpi.value}
              change={kpi.change}
              trend={kpi.trend}
              icon={<span className="text-2xl">{kpi.icon}</span>}
              subtitle={kpi.subtitle}
            />
          ))}
        </div>

        {/* Stablecoins Table */}
        <div className="bg-surface rounded-xl2 shadow-card">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-textPrimary">Stablecoin Rankings</h3>
          </div>
          <Table>
            <TableHead>
              <TableRow hover={false}>
                <TableHeader sortable>Name</TableHeader>
                <TableHeader sortable>Price</TableHeader>
                <TableHeader sortable>Market Cap</TableHeader>
                <TableHeader sortable>24h Volume</TableHeader>
                <TableHeader sortable>Peg Deviation</TableHeader>
                <TableHeader sortable>Risk Score</TableHeader>
                <TableHeader>24h Change</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {stablecoins.map((coin, index) => (
                <TableRow key={index} onClick={() => console.log(`View ${coin.symbol}`)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                        {coin.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-textPrimary">{coin.name}</div>
                        <div className="text-xs text-textSecondary">{coin.symbol}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{coin.price}</TableCell>
                  <TableCell>{coin.marketCap}</TableCell>
                  <TableCell>{coin.volume}</TableCell>
                  <TableCell>
                    <span className={coin.pegDeviation.startsWith('+') ? 'text-warning' : 'text-success'}>
                      {coin.pegDeviation}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-textPrimary font-medium">{coin.riskScore.toFixed(2)}</span>
                      <RiskBadge score={coin.riskScore} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={coin.change24h >= 0 ? 'text-success' : 'text-danger'}>
                      {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
