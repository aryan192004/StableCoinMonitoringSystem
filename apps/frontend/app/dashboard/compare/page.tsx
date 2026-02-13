'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui';
import { Button } from '@/components/ui';
import { ComparisonChart, StablecoinComparison } from '@/components/charts';
import axios from 'axios';

interface StablecoinData {
  symbol: string;
  current_price: number;
  current_deviation: number;
  max_deviation: number;
  avg_deviation: number;
  risk_score: number;
  risk_level: string;
  price_history?: [number, number][];
  deviation_history?: [number, number][];
}

const STABLECOIN_OPTIONS = [
  { symbol: 'USDT', name: 'Tether', color: 'rgb(34, 197, 94)' },
  { symbol: 'USDC', name: 'USD Coin', color: 'rgb(59, 130, 246)' },
  { symbol: 'DAI', name: 'Dai', color: 'rgb(251, 146, 60)' },
  { symbol: 'BUSD', name: 'Binance USD', color: 'rgb(251, 191, 36)' },
  { symbol: 'FRAX', name: 'Frax', color: 'rgb(168, 85, 247)' },
];

const TIME_PERIODS = [
  { value: '7', label: '7 Days' },
  { value: '30', label: '30 Days' },
  { value: '90', label: '90 Days' },
];

export default function ComparePage() {
  const [selectedCoins, setSelectedCoins] = useState<string[]>(['USDT', 'USDC', 'DAI']);
  const [timePeriod, setTimePeriod] = useState('7');
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState<StablecoinData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComparisonData();
  }, [selectedCoins, timePeriod]);

  const fetchComparisonData = async () => {
    if (selectedCoins.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:3001/api/risk/compare', {
        params: {
          coins: selectedCoins.join(','),
          days: timePeriod,
        },
      });

      setComparisonData(response.data.stablecoins || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch comparison data');
      console.error('Error fetching comparison data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCoin = (symbol: string) => {
    setSelectedCoins((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  // Prepare chart data
  const priceChartData: StablecoinComparison[] = comparisonData
    .filter((coin) => coin.price_history && coin.price_history.length > 0)
    .map((coin) => {
      const coinOption = STABLECOIN_OPTIONS.find((opt) => opt.symbol === coin.symbol);
      return {
        symbol: coin.symbol,
        color: coinOption?.color,
        data: (coin.price_history || []).map(([timestamp, price]) => ({
          timestamp,
          value: price,
        })),
      };
    });

  const deviationChartData: StablecoinComparison[] = comparisonData
    .filter((coin) => coin.deviation_history && coin.deviation_history.length > 0)
    .map((coin) => {
      const coinOption = STABLECOIN_OPTIONS.find((opt) => opt.symbol === coin.symbol);
      return {
        symbol: coin.symbol,
        color: coinOption?.color,
        data: (coin.deviation_history || []).map(([timestamp, deviation]) => ({
          timestamp,
          value: deviation,
        })),
      };
    });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Peg Deviation Comparison</h1>
          <p className="text-textSecondary mt-2">
            Compare peg deviations across multiple stablecoins to identify stability trends
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Select Stablecoins & Time Period</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {/* Stablecoin Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Stablecoins</label>
                <div className="flex flex-wrap gap-2">
                  {STABLECOIN_OPTIONS.map((option) => (
                    <button
                      key={option.symbol}
                      onClick={() => toggleCoin(option.symbol)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedCoins.includes(option.symbol)
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-primary'
                      }`}
                    >
                      {option.name} ({option.symbol})
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Period Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Time Period</label>
                <div className="flex gap-2">
                  {TIME_PERIODS.map((period) => (
                    <button
                      key={period.value}
                      onClick={() => setTimePeriod(period.value)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        timePeriod === period.value
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Refresh Button */}
              <div>
                <Button onClick={fetchComparisonData} disabled={loading}>
                  {loading ? 'Loading...' : 'Refresh Data'}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle>Comparison Summary</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Stablecoin</th>
                    <th className="text-right py-3 px-4">Current Price</th>
                    <th className="text-right py-3 px-4">Current Deviation</th>
                    <th className="text-right py-3 px-4">Max Deviation</th>
                    <th className="text-right py-3 px-4">Avg Deviation</th>
                    <th className="text-right py-3 px-4">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((coin) => (
                    <tr key={coin.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{coin.symbol}</td>
                      <td className="text-right py-3 px-4">${coin.current_price?.toFixed(4) || 'N/A'}</td>
                      <td
                        className={`text-right py-3 px-4 font-medium ${
                          Math.abs(coin.current_deviation || 0) < 0.5
                            ? 'text-green-600'
                            : Math.abs(coin.current_deviation || 0) < 1
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {coin.current_deviation?.toFixed(3) || 'N/A'}%
                      </td>
                      <td
                        className={`text-right py-3 px-4 font-medium ${
                          Math.abs(coin.max_deviation || 0) < 1
                            ? 'text-green-600'
                            : Math.abs(coin.max_deviation || 0) < 3
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {coin.max_deviation?.toFixed(3) || 'N/A'}%
                      </td>
                      <td className="text-right py-3 px-4">{coin.avg_deviation?.toFixed(3) || 'N/A'}%</td>
                      <td className="text-right py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            coin.risk_level === 'Low'
                              ? 'bg-green-100 text-green-700'
                              : coin.risk_level === 'Medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {coin.risk_level || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {comparisonData.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  Select stablecoins to compare
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Price Comparison Chart */}
        {priceChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Price Comparison</CardTitle>
            </CardHeader>
            <CardBody>
              <ComparisonChart
                stablecoins={priceChartData}
                title="Price Comparison"
                yAxisLabel="Price (USD)"
                height={400}
                formatValue={(value) => '$' + value.toFixed(4)}
              />
            </CardBody>
          </Card>
        )}

        {/* Peg Deviation Chart */}
        {deviationChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Peg Deviation Comparison</CardTitle>
            </CardHeader>
            <CardBody>
              <ComparisonChart
                stablecoins={deviationChartData}
                title="Peg Deviation"
                yAxisLabel="Deviation from $1 Peg (%)"
                height={400}
                formatValue={(value) => value.toFixed(3) + '%'}
              />
            </CardBody>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
