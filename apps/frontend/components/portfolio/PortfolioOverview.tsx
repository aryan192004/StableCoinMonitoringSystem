'use client';

import { PortfolioSummary } from '@stablecoin/types';
import { PortfolioAnalysisService } from '@/services/portfolioService';
import { Card, CardHeader, CardTitle, CardBody, Badge, KPICard } from '@/components/ui';

interface PortfolioOverviewProps {
  portfolio: PortfolioSummary;
}

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ portfolio }) => {
  const insights = PortfolioAnalysisService.generateInsights(portfolio);
  const riskBadgeVariant = PortfolioAnalysisService.getRiskBadgeVariant(portfolio.riskScore);
  const riskColor = PortfolioAnalysisService.getRiskColor(portfolio.riskScore);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Value"
          value={PortfolioAnalysisService.formatValue(portfolio.totalValueUsd)}
          subtitle="USD"
          trend={{
            value: 0,
            label: 'Last 24h'
          }}
        />
        <KPICard
          title="Assets Count"
          value={(portfolio.tokenBalances.length + 1).toString()}
          subtitle="Tokens"
        />
        <KPICard
          title="Stablecoin Exposure"
          value={PortfolioAnalysisService.formatPercentage(portfolio.stablecoinExposure)}
          subtitle="Of portfolio"
        />
        <KPICard
          title="Risk Score"
          value={portfolio.riskScore.toString()}
          subtitle="/100"
          className={riskColor}
          badge={
            <Badge variant={riskBadgeVariant}>
              {portfolio.riskScore < 30 ? 'Low Risk' : 
               portfolio.riskScore < 70 ? 'Medium Risk' : 'High Risk'}
            </Badge>
          }
        />
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Insights</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800"
                >
                  <span className="text-sm text-textSecondary">{insight}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};