'use client';

import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';

export default function UpdatesPage() {
  const updates = [
    {
      title: 'New De-Peg Detection Model Deployed',
      description:
        'Our AI model now detects early-stage stablecoin de-pegging patterns using on-chain liquidity anomalies.',
      date: 'Today',
      type: 'feature',
    },
    {
      title: 'USDC Liquidity Stress Advisory',
      description:
        'Temporary liquidity tightening observed across multiple exchanges. Monitoring recommended.',
      date: 'Yesterday',
      type: 'risk',
    },
    {
      title: 'API Performance Improvements',
      description:
        'Reduced latency by 35% for real-time risk scoring endpoints.',
      date: '2 days ago',
      type: 'system',
    },
    {
      title: 'New Exchange Coverage Added',
      description:
        'Kraken and Bybit order book depth now integrated into liquidity monitoring.',
      date: '3 days ago',
      type: 'feature',
    },
  ];

  const systemStatus = [
    { name: 'Risk Engine', status: 'Operational' },
    { name: 'Liquidity Monitor', status: 'Operational' },
    { name: 'API Services', status: 'Operational' },
    { name: 'Alert System', status: 'Degraded' },
  ];

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'risk':
        return 'danger';
      case 'system':
        return 'warning';
      default:
        return 'success';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Platform Updates</h1>
            <p className="text-textSecondary">
              Latest product improvements, advisories, and system status
            </p>
          </div>
          <Badge variant="success">All Systems Monitoring</Badge>
        </div>

        {/* Featured Update */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 Featured Update</CardTitle>
          </CardHeader>
          <CardBody>
            <h3 className="text-lg font-semibold text-textPrimary mb-2">
              AI-Powered Reserve Anomaly Detection
            </h3>
            <p className="text-textSecondary mb-4">
              Our new anomaly detection system flags reserve inconsistencies
              across attestations and on-chain data in real time.
            </p>
            <Badge variant="success">New Feature</Badge>
          </CardBody>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid md:grid-cols-2 gap-4">
              {systemStatus.map((service, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface"
                >
                  <span className="text-textPrimary font-medium">
                    {service.name}
                  </span>
                  <Badge
                    variant={
                      service.status === 'Operational'
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {service.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Updates Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {updates.map((update, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border bg-surface hover:shadow-card transition-shadow"
                >
                  <div
                    className={`w-2 h-2 mt-2 rounded-full ${
                      update.type === 'risk'
                        ? 'bg-danger'
                        : update.type === 'system'
                        ? 'bg-warning'
                        : 'bg-success'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-textPrimary">
                        {update.title}
                      </h4>
                      <Badge variant={getBadgeVariant(update.type)}>
                        {update.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-textSecondary">
                      {update.description}
                    </p>
                  </div>
                  <span className="text-xs text-textTertiary whitespace-nowrap">
                    {update.date}
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
