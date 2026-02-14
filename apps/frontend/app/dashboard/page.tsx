'use client';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui';
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
import { useStablecoins } from '@/hooks/useData';
import { formatCurrency, formatCompactNumber, formatPercentage } from '@/utils/formatters';

export default function DashboardPage() {
  const router = useRouter();
  const { stablecoins, isLoading } = useStablecoins();
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


  // Format helper for displaying values
  const formatPegDeviation = (deviation: number) => {
    const sign = deviation >= 0 ? '+' : '';
    return `${sign}${deviation.toFixed(2)}%`;
  };

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

        {/* === Risk Intelligence Summary === */}
<div className="grid lg:grid-cols-3 gap-6">
  
  {/* Risk Categories */}
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
              <span
                className={`text-sm font-semibold ${
                  risk.color === 'success'
                    ? 'text-success'
                    : 'text-warning'
                }`}
              >
                {risk.score.toFixed(2)}
              </span>
            </div>

            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  risk.color === 'success'
                    ? 'bg-success'
                    : 'bg-warning'
                } transition-all`}
                style={{ width: `${risk.score * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </CardBody>
  </Card>

  {/* Stability Metrics */}
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
            <span
              className={`text-sm font-semibold ${
                item.good ? 'text-success' : 'text-danger'
              }`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </CardBody>
  </Card>

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
              {isLoading ? (
                <TableRow hover={false}>
                  <TableCell colSpan={7} className="text-center py-8 text-textSecondary">
                    Loading stablecoins data...
                  </TableCell>
                </TableRow>
              ) : !stablecoins || stablecoins.length === 0 ? (
                <TableRow hover={false}>
                  <TableCell colSpan={7} className="text-center py-8 text-textSecondary">
                    No stablecoins data available
                  </TableCell>
                </TableRow>
              ) : (
                stablecoins.map((coin, index) => (
                  <TableRow 
                    key={coin.id || index} 
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
                    <TableCell className="font-medium">
                      {formatCurrency(coin.price || 0, 4)}
                    </TableCell>
                    <TableCell>
                      ${formatCompactNumber(coin.marketCap || 0)}
                    </TableCell>
                    <TableCell>
                      ${formatCompactNumber(coin.volume24h || 0)}
                    </TableCell>
                    <TableCell>
                      <span className={Math.abs(coin.pegDeviation || 0) > 0.5 ? 'text-danger' : Math.abs(coin.pegDeviation || 0) > 0.2 ? 'text-warning' : 'text-success'}>
                        {formatPegDeviation(coin.pegDeviation || 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-textPrimary font-medium">{(coin.riskScore || 0).toFixed(2)}</span>
                        <RiskBadge score={coin.riskScore || 0} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={(coin.change24h || 0) >= 0 ? 'text-success' : 'text-danger'}>
                        {formatPercentage(coin.change24h || 0, 2)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
