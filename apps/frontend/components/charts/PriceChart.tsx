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
  Filler,
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
  Legend,
  Filler
);

export interface PriceDataPoint {
  timestamp: Date | string;
  price: number;
  deviation?: number;
  volume?: number;
  marketCap?: number;
}

interface PriceChartProps {
  data: PriceDataPoint[];
  title?: string;
  showDeviation?: boolean;
  height?: number;
}

export function PriceChart({ data, title = 'Price History', showDeviation = false, height = 300 }: PriceChartProps) {
  const chartRef = useRef<any>(null);

  // Format data for Chart.js
  const chartData = {
    labels: data.map((point) => {
      const date = typeof point.timestamp === 'string' ? new Date(point.timestamp) : point.timestamp;
      return format(date, 'MMM dd HH:mm');
    }),
    datasets: [
      {
        label: 'Price (USD)',
        data: data.map((point) => point.price),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
      ...(showDeviation
        ? [
            {
              label: 'Deviation (%)',
              data: data.map((point) => 1 + (point.deviation || 0) / 100),
              borderColor: 'rgb(239, 68, 68)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              fill: false,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 4,
              borderWidth: 2,
              yAxisID: 'y1',
            },
          ]
        : []),
    ],
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
              if (context.dataset.label === 'Deviation (%)') {
                label += ((context.parsed.y - 1) * 100).toFixed(3) + '%';
              } else {
                label += '$' + context.parsed.y.toFixed(4);
              }
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
        position: 'left' as const,
        title: {
          display: true,
          text: 'Price (USD)',
        },
        ticks: {
          callback: function (value: any) {
            return '$' + value.toFixed(4);
          },
        },
      },
      ...(showDeviation
        ? {
            y1: {
              type: 'linear' as const,
              display: true,
              position: 'right' as const,
              title: {
                display: true,
                text: 'Deviation (%)',
              },
              grid: {
                drawOnChartArea: false,
              },
              ticks: {
                callback: function (value: any) {
                  return ((value - 1) * 100).toFixed(2) + '%';
                },
              },
            },
          }
        : {}),
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
