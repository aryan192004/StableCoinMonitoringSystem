'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { useStablecoins } from '@/hooks/useData';
import { Card } from '@/components/ui';

export default function StablecoinsPage() {
  const router = useRouter();
  const { stablecoins, isLoading } = useStablecoins();
  const [selectedCoin, setSelectedCoin] = useState<string>('');

  // Navigate to selected coin's detail page
  const handleCoinChange = (coinId: string) => {
    setSelectedCoin(coinId);
    router.push(`/dashboard/stablecoins/${coinId}`);
  };

  // No auto-redirect: user picks coin from dropdown to navigate

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Coin Selector */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Stablecoins</h1>
            <p className="text-textSecondary">Select a stablecoin to view detailed analytics</p>
          </div>
          <div className="min-w-[240px]">
            <label htmlFor="coin-selector" className="block text-sm font-medium text-textSecondary mb-2">
              Select Stablecoin
            </label>
            {isLoading ? (
              <div className="h-10 bg-gray-200 animate-pulse rounded-lg" />
            ) : (
              <select
                id="coin-selector"
                value={selectedCoin}
                onChange={(e) => handleCoinChange(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer hover:border-primary"
              >
                <option value="">Choose a coin...</option>
                {stablecoins?.map((coin) => {
                  const coinId = coin.id || coin.symbol?.toLowerCase() || '';
                  const displayName = coin.name || coin.symbol || coinId.toUpperCase();
                  const displaySymbol = coin.symbol || coinId.toUpperCase();
                  return (
                    <option key={coinId} value={coinId}>
                      {displayName} ({displaySymbol})
                    </option>
                  );
                })}
              </select>
            )}
          </div>
        </div>

        {/* Loading State */}
        <Card>
          <div className="flex items-center justify-center h-64">
            <div className="text-textSecondary">
              {isLoading ? 'Loading stablecoins...' : 'Select a stablecoin from the dropdown above'}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
