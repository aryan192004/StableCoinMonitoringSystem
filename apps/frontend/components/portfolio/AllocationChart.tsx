'use client';

import { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { TokenAllocation } from '@stablecoin/types';
import { PortfolioAnalysisService } from '@/services/portfolioService';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface AllocationChartProps {
  allocations: TokenAllocation[];
  totalValue: number;
}

export const AllocationChart: React.FC<AllocationChartProps> = ({ 
  allocations, 
  totalValue 
}) => {
  const chartRef = useRef<ChartJS>(null);

  // Clean up chart on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const chartData = PortfolioAnalysisService.getAllocationChartData(allocations);
  const chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
          generateLabels: (chart) => {
            const original = ChartJS.defaults.plugins.legend.labels.generateLabels;
            const labels = original.call(this, chart);
            
            return labels.map((label, index) => ({
              ...label,
              text: `${allocations[index]?.symbol} (${allocations[index]?.percentage.toFixed(1)}%)`,
            }));
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const allocation = allocations[context.dataIndex];
            return [
              `${allocation.symbol}: ${allocation.percentage.toFixed(1)}%`,
              `Value: ${PortfolioAnalysisService.formatValue(allocation.valueUsd)}`,
            ];
          },
        },
      },
    },
  };

  if (allocations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-center h-64 text-textSecondary">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>No assets to display</p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
        <p className="text-sm text-textSecondary">
          Total Portfolio Value: {PortfolioAnalysisService.formatValue(totalValue)}
        </p>
      </CardHeader>
      <CardBody>
        <div className="h-64 relative">
          <Pie
            ref={chartRef}
            data={chartData}
            options={chartOptions}
          />
        </div>
        
        {/* Allocation List */}
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-medium text-textPrimary">Holdings Breakdown</h4>
          {allocations.map((allocation, index) => (
            <div 
              key={allocation.symbol}
              className="flex items-center justify-between py-2 px-3 rounded-md bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: allocation.color }}
                />
                <span className="font-medium text-sm">{allocation.symbol}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {PortfolioAnalysisService.formatValue(allocation.valueUsd)}
                </div>
                <div className="text-xs text-textSecondary">
                  {allocation.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};