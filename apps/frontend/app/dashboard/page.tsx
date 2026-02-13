'use client';

import { useRouter } from 'next/navigation';
import {
  BanknotesIcon,
  ChartBarIcon,
  CircleStackIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';


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
  const router = useRouter();
  const kpiData = [
  {
    title: 'Total Market Cap',
    value: '$150.2B',
    change: 2.4,
    trend: 'up' as const,
    icon: BanknotesIcon,
    subtitle: 'Across all stablecoins',
  },
  {
    title: 'Average Risk Score',
    value: '0.24',
    change: -3.2,
    trend: 'down' as const,
    icon: ChartBarIcon,
    subtitle: 'Lower is better',
  },
  {
    title: 'Active Stablecoins',
    value: '15',
    trend: 'neutral' as const,
    icon: CircleStackIcon,
    subtitle: 'Being monitored',
  },
  {
    title: 'Liquidity Depth',
    value: '$8.4B',
    change: 1.8,
    trend: 'up' as const,
    icon: BeakerIcon,
    subtitle: 'Combined order books',
  },
];


  const stablecoins = [
    { 
      name: 'Tether', 
      symbol: 'USDT', 
      price: '$1.0001', 
      marketCap: '$95.4B', 
      volume: '$42.3B', 
      pegDeviation: '+0.01%',
      riskScore: 0.32,
      change24h: 0.2,
    },
    { 
      name: 'USD Coin', 
      symbol: 'USDC', 
      price: '$0.9999', 
      marketCap: '$28.7B', 
      volume: '$8.1B', 
      pegDeviation: '-0.01%',
      riskScore: 0.18,
      change24h: -0.1,
    },
    { 
      name: 'DAI', 
      symbol: 'DAI', 
      price: '$1.0003', 
      marketCap: '$5.2B', 
      volume: '$412M', 
      pegDeviation: '+0.03%',
      riskScore: 0.24,
      change24h: 1.4,
    },
    { 
      name: 'TrueUSD', 
      symbol: 'TUSD', 
      price: '$0.9998', 
      marketCap: '$2.8B', 
      volume: '$124M', 
      pegDeviation: '-0.02%',
      riskScore: 0.28,
      change24h: -0.5,
    },
    { 
      name: 'Binance USD', 
      symbol: 'BUSD', 
      price: '$1.0000', 
      marketCap: '$4.1B', 
      volume: '$1.2B', 
      pegDeviation: '0.00%',
      riskScore: 0.22,
      change24h: 0.0,
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
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon;

            return (
              <KPICard
                key={index}
                title={kpi.title}
                value={kpi.value}
                change={kpi.change}
                trend={kpi.trend}
                icon={<Icon className="w-6 h-6" />}
                subtitle={kpi.subtitle}
              />
            );
          })}
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
                <TableRow 
                  key={index} 
                  onClick={() => router.push(`/dashboard/stablecoins/${coin.symbol.toLowerCase()}`)}

                >
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
                      {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
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
