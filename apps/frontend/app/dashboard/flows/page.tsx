'use client';

import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';

export default function CapitalFlowsPage() {
  const highlights = [
    { label: 'USDC Minted (24h)', value: '$250M', trend: 'up' },
    { label: 'BUSD Burned (24h)', value: '$80M', trend: 'down' },
    { label: 'Net Exchange Inflow', value: '$120M', trend: 'neutral' },
  ];

  const flows = [
    {
      type: 'Mint',
      asset: 'USDC',
      amount: '$250M',
      impact: 'High',
      time: '10 min ago',
    },
    {
      type: 'Whale Transfer',
      asset: 'USDT',
      amount: '$120M → Binance',
      impact: 'Medium',
      time: '25 min ago',
    },
    {
      type: 'Burn',
      asset: 'BUSD',
      amount: '$80M',
      impact: 'High',
      time: '1 hr ago',
    },
    {
      type: 'Exchange Outflow',
      asset: 'USDT',
      amount: '$60M ← Coinbase',
      impact: 'Low',
      time: '2 hrs ago',
    },
  ];

  const impactVariant = (impact: string) => {
    if (impact === 'High') return 'danger';
    if (impact === 'Medium') return 'warning';
    return 'success';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Capital Flows</h1>
            <p className="text-textSecondary">
              Monitor mint, burn, and large transactions influencing stablecoin markets.
            </p>
          </div>
          <Badge variant="success">Live Monitoring</Badge>
        </div>

        {/* Highlight Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {highlights.map((item, i) => (
            <Card key={i}>
              <CardBody>
                <p className="text-sm text-textSecondary mb-1">{item.label}</p>
                <h3 className="text-2xl font-semibold text-textPrimary">
                  {item.value}
                </h3>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Recent Flows */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Market-Moving Flows</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {flows.map((flow, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface hover:shadow-card transition-shadow"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-textPrimary">
                        {flow.type}
                      </span>
                      <Badge variant={impactVariant(flow.impact)}>
                        {flow.impact} Impact
                      </Badge>
                    </div>
                    <p className="text-sm text-textSecondary">
                      {flow.asset} • {flow.amount}
                    </p>
                  </div>

                  <span className="text-xs text-textTertiary">
                    {flow.time}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

      </div>
    </DashboardLayout>
  );
}
