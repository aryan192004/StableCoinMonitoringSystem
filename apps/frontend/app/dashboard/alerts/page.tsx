'use client';

import { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';

export default function AlertsPage() {
  const [alerts] = useState([
    {
      id: 1,
      stablecoin: 'USDT',
      condition: 'Price deviation > 0.5%',
      status: 'active',
      lastTriggered: '2 hours ago',
      triggerCount: 3,
    },
    {
      id: 2,
      stablecoin: 'USDC',
      condition: 'Liquidity depth < $1B',
      status: 'triggered',
      lastTriggered: '15 minutes ago',
      triggerCount: 1,
    },
    {
      id: 3,
      stablecoin: 'DAI',
      condition: 'Risk score > 0.7',
      status: 'active',
      lastTriggered: 'Never',
      triggerCount: 0,
    },
  ]);

  const formRef = useRef<HTMLDivElement>(null);

  const recentAlerts = [
    {
      stablecoin: 'USDC',
      message: 'Liquidity depth dropped below $1B on Binance',
      severity: 'high',
      time: '15 minutes ago',
    },
    {
      stablecoin: 'USDT',
      message: 'Price deviation exceeded 0.5% threshold',
      severity: 'medium',
      time: '2 hours ago',
    },
    {
      stablecoin: 'BUSD',
      message: 'Trading volume increased by 150%',
      severity: 'low',
      time: '5 hours ago',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Alert Management</h1>
            <p className="text-textSecondary">Configure and monitor custom alert conditions</p>
          </div>
          <Button
  variant="primary"
  onClick={() => {
    // 1. scroll to form
    formRef.current?.scrollIntoView({ behavior: 'smooth' });

    // 2. focus first field after scroll
    setTimeout(() => {
      document.getElementById('alert-stablecoin')?.focus();
    }, 400);
  }}
>
  + Create Alert
</Button>

          </div>

        {/* Alert Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSecondary mb-1">Active Alerts</p>
                <h3 className="text-2xl font-semibold text-textPrimary">12</h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">🔔</span>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSecondary mb-1">Triggered Today</p>
                <h3 className="text-2xl font-semibold text-textPrimary">5</h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSecondary mb-1">Avg Response Time</p>
                <h3 className="text-2xl font-semibold text-textPrimary">2.4m</h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <span className="text-2xl">⏱️</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alert Triggers</CardTitle>
            <button className="text-sm text-primary hover:underline">View All</button>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {recentAlerts.map((alert, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className={`
                    w-2 h-2 rounded-full mt-2
                    ${alert.severity === 'high' ? 'bg-danger' : 
                      alert.severity === 'medium' ? 'bg-warning' : 'bg-success'}
                    animate-pulse
                  `} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-textPrimary">{alert.stablecoin}</span>
                      <Badge variant={
                        alert.severity === 'high' ? 'danger' : 
                        alert.severity === 'medium' ? 'warning' : 'neutral'
                      }>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-textSecondary">{alert.message}</p>
                  </div>
                  <span className="text-xs text-textTertiary whitespace-nowrap">{alert.time}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Alert Configuration Table */}
        <Card>
          <CardHeader>
            <CardTitle>Configured Alerts</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">Filter</Button>
              <Button variant="ghost" size="sm">Sort</Button>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase">
                      Stablecoin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase">
                      Condition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase">
                      Last Triggered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase">
                      Triggers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {alerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                            {alert.stablecoin.charAt(0)}
                          </div>
                          <span className="font-medium text-textPrimary">{alert.stablecoin}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-textSecondary">
                        {alert.condition}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={alert.status === 'triggered' ? 'warning' : 'success'}>
                          {alert.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-textSecondary">
                        {alert.lastTriggered}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-textPrimary">
                        {alert.triggerCount}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="text-primary hover:underline text-sm">Edit</button>
                          <button className="text-danger hover:underline text-sm">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Alert Configuration Form */}
        <div ref={formRef}>
        <Card>
          <CardHeader>
            <CardTitle>Create New Alert</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-2">
                  Select Stablecoin
                </label>
                <select id="alert-stablecoin" className="w-full px-4 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>USDT</option>
                  <option>USDC</option>
                  <option>DAI</option>
                  <option>BUSD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-2">
                  Metric Type
                </label>
                <select className="w-full px-4 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Price Deviation</option>
                  <option>Liquidity Depth</option>
                  <option>Risk Score</option>
                  <option>Trading Volume</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-2">
                  Condition
                </label>
                <select className="w-full px-4 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Greater than</option>
                  <option>Less than</option>
                  <option>Equals</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-2">
                  Threshold Value
                </label>
                <input
                  type="text"
                  placeholder="0.5"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="md:col-span-2">
                <Button variant="primary" className="w-full">
                  Create Alert
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
