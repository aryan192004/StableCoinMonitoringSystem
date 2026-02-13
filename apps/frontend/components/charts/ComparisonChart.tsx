'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export interface ComparisonDataPoint {
  timestamp: number;
  value: number;
}

export interface StablecoinComparison {
  symbol: string;
  data: ComparisonDataPoint[];
  color?: string;
}

interface ComparisonChartProps {
  stablecoins: StablecoinComparison[];
  title?: string;
  yAxisLabel?: string;
  height?: number;
  formatValue?: (value: number) => string;
}

const DEFAULT_COLORS = [
  'rgb(59, 130, 246)',   // Blue
  'rgb(34, 197, 94)',    // Green
  'rgb(251, 146, 60)',   // Orange
  'rgb(168, 85, 247)',   // Purple
  'rgb(236, 72, 153)',   // Pink
  'rgb(14, 165, 233)',   // Cyan
];

export function ComparisonChart({
  stablecoins,
  title = 'Comparison',
  yAxisLabel = 'Value',
  height = 400,
  formatValue = (value: number) => value.toFixed(4),
}: ComparisonChartProps) {
  const chartRef = useRef<any>(null);

  // Get all unique timestamps and sort them
  const allTimestamps = Array.from(
    new Set(stablecoins.flatMap((coin) => coin.data.map((d) => d.timestamp)))
  ).sort((a, b) => a - b);

  const chartData = {
    labels: allTimestamps.map((timestamp) => format(new Date(timestamp), 'MMM dd HH:mm')),
    datasets: stablecoins.map((coin, index) => ({
      label: coin.symbol,
      data: allTimestamps.map((timestamp) => {
        const dataPoint = coin.data.find((d) => d.timestamp === timestamp);
        return dataPoint ? dataPoint.value : null;
      }),
      borderColor: coin.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      backgroundColor: coin.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: 2,
      spanGaps: true,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatValue(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        title: {
          display: true,
          text: yAxisLabel,
        },
        ticks: {
          callback: function (value: any) {
            return formatValue(value);
          },
        },
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
