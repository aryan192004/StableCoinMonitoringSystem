'use client';

import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';
import { useCapitalFlowsDashboard, useRealTimeCapitalFlows } from '@/hooks/useCapitalFlows';
import { CapitalFlowsService } from '@/services/capitalFlowsService';
import { useState, useMemo } from 'react';
import { CapitalFlowFilters } from '@stablecoin/types';

export default function CapitalFlowsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [filters, setFilters] = useState<CapitalFlowFilters>({ timeRange: '24h' });

  // Fetch dashboard data
  const { summary, recentFlows, analytics, isLoading, error } = useCapitalFlowsDashboard();
  
  // Fetch real-time flows
  const { flows: allFlows, isLoading: flowsLoading } = useRealTimeCapitalFlows(filters);

  // Generate highlights from summary data
  const highlights = useMemo(() => {
    if (!summary) {
      return [
        { label: 'Total Minted (24h)', value: '$0', trend: 'neutral' },
        { label: 'Total Burned (24h)', value: '$0', trend: 'neutral' },
        { label: 'Net Exchange Flow', value: '$0', trend: 'neutral' },
      ];
    }

    const netFlow = summary.totalMints24h - summary.totalBurns24h;
    
    return [
      { 
        label: 'Total Minted (24h)', 
        value: CapitalFlowsService.formatAmount(summary.totalMints24h), 
        trend: summary.totalMints24h > 0 ? 'up' : 'neutral' 
      },
      { 
        label: 'Total Burned (24h)', 
        value: CapitalFlowsService.formatAmount(summary.totalBurns24h), 
        trend: summary.totalBurns24h > 0 ? 'down' : 'neutral' 
      },
      { 
        label: 'Net Exchange Flow', 
        value: CapitalFlowsService.formatAmount(Math.abs(summary.netExchangeInflow24h)), 
        trend: summary.netExchangeInflow24h > 0 ? 'up' : summary.netExchangeInflow24h < 0 ? 'down' : 'neutral' 
      },
    ];
  }, [summary]);

  const displayFlows = allFlows?.slice(0, 10) || recentFlows?.slice(0, 10) || [];

  const handleTimeRangeChange = (timeRange: '1h' | '24h' | '7d' | '30d') => {
    setSelectedTimeRange(timeRange);
    setFilters({ ...filters, timeRange });
  };

  const handleFilterByImpact = (impact: 'high' | 'medium' | 'low') => {
    const currentImpact = filters.impact || [];
    const newImpact = currentImpact.includes(impact) 
      ? currentImpact.filter(i => i !== impact)
      : [...currentImpact, impact];
    
    setFilters({ 
      ...filters, 
      impact: newImpact.length > 0 ? newImpact : undefined 
    });
  };

  const handleFilterByType = (type: string) => {
    const currentTypes = filters.types || [];
    const newTypes = currentTypes.includes(type as any) 
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type as any];
    
    setFilters({ 
      ...filters, 
      types: newTypes.length > 0 ? newTypes : undefined 
    });
  };

  const clearFilters = () => {
    setFilters({ timeRange: selectedTimeRange });
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2">Capital Flows</h1>
              <p className="text-textSecondary">
                Monitor mint, burn, and large transactions influencing stablecoin markets.
              </p>
            </div>
            <Badge variant="danger">Connection Error</Badge>
          </div>
          
          <Card>
            <CardBody>
              <div className="text-center py-8">
                <p className="text-textSecondary mb-4">Failed to load capital flows data</p>
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

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
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Badge variant="warning">Loading...</Badge>
            ) : (
              <Badge variant="success">Live Monitoring</Badge>
            )}
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
            <Button
              key={range}
              variant={selectedTimeRange === range ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleTimeRangeChange(range)}
            >
              {range.toUpperCase()}
            </Button>
          ))}
        </div>

        {/* Highlight Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {highlights.map((item, i) => (
            <Card key={i} className={isLoading ? 'animate-pulse' : ''}>
              <CardBody>
                <p className="text-sm text-textSecondary mb-1">{item.label}</p>
                <h3 className="text-2xl font-semibold text-textPrimary">
                  {item.value}
                </h3>
                {item.trend !== 'neutral' && (
                  <div className={`text-sm mt-1 ${
                    item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.trend === 'up' ? '↗' : '↘'} 24h
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="text-sm font-medium">Impact Level:</div>
              {(['high', 'medium', 'low'] as const).map((impact) => (
                <Button
                  key={impact}
                  variant={filters.impact?.includes(impact) ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleFilterByImpact(impact)}
                >
                  {impact.charAt(0).toUpperCase() + impact.slice(1)}
                </Button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="text-sm font-medium">Event Type:</div>
              {(['mint', 'burn', 'whale_transfer', 'exchange_inflow', 'exchange_outflow'] as const).map((type) => (
                <Button
                  key={type}
                  variant={filters.types?.includes(type) ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleFilterByType(type)}
                >
                  {CapitalFlowsService.getFlowTypeDisplay(type)}
                </Button>
              ))}
            </div>
            
            {(filters.impact?.length || filters.types?.length) ? (
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : null}
          </CardBody>
        </Card>

        {/* Recent Flows */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Market-Moving Flows</CardTitle>
              {summary && (
                <div className="text-sm text-textSecondary">
                  {summary.marketImpactEvents} high-impact events today
                </div>
              )}
            </div>
          </CardHeader>
          <CardBody>
            {flowsLoading || isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : displayFlows.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-textSecondary mb-4">
                  No capital flow events found for the selected criteria
                </p>
                <Button onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {displayFlows.map((flow) => (
                  <div
                    key={flow.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface hover:shadow-card transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-textPrimary">
                          {CapitalFlowsService.getFlowTypeIcon(flow.type)} {CapitalFlowsService.getFlowTypeDisplay(flow.type)}
                        </span>
                        <Badge variant={CapitalFlowsService.getImpactBadgeVariant(flow.impact)}>
                          {flow.impact.charAt(0).toUpperCase() + flow.impact.slice(1)} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-textSecondary">
                        {flow.stablecoin} • {flow.description}
                      </p>
                      {flow.txHash && (
                        <p className="text-xs text-textTertiary mt-1">
                          Tx: {flow.txHash.slice(0, 10)}...{flow.txHash.slice(-8)}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-textPrimary mb-1">
                        {flow.amountFormatted}
                      </div>
                      <span className="text-xs text-textTertiary">
                        {CapitalFlowsService.formatTimeAgo(flow.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Analytics Summary */}
        {analytics && (
          <Card>
            <CardHeader>
              <CardTitle>Analytics Summary ({selectedTimeRange})</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-textSecondary">Total Events</p>
                  <p className="text-lg font-semibold">{analytics.totalEvents}</p>
                </div>
                <div>
                  <p className="text-sm text-textSecondary">Total Volume</p>
                  <p className="text-lg font-semibold">{CapitalFlowsService.formatAmount(analytics.totalVolume)}</p>
                </div>
                <div>
                  <p className="text-sm text-textSecondary">Avg Transaction</p>
                  <p className="text-lg font-semibold">{CapitalFlowsService.formatAmount(analytics.averageTransactionSize)}</p>
                </div>
                <div>
                  <p className="text-sm text-textSecondary">High Impact Events</p>
                  <p className="text-lg font-semibold">{analytics.eventsByImpact.high || 0}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

      </div>
    </DashboardLayout>
  );
}
