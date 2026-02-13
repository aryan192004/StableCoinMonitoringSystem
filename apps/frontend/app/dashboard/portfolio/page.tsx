'use client';

import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui';
import { Button } from '@/components/ui';

export default function PortfolioPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Portfolio</h1>
            <p className="text-textSecondary">
              Monitor your stablecoin exposure and risk distribution.
            </p>
          </div>
        </div>

        {/* Empty State */}
        <Card>
          <CardHeader>
            <CardTitle>Your Portfolio</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              
              {/* Icon Placeholder */}
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl">
                📊
              </div>

              <h3 className="text-lg font-semibold text-textPrimary">
                No Portfolio Data Yet
              </h3>

              <p className="text-sm text-textSecondary max-w-md">
                Connect your wallets or import your holdings to start monitoring
                stablecoin exposure, risk scores, and liquidity insights.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <Button variant="primary">Connect Wallet</Button>
                <Button variant="outline">Import Holdings</Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
