'use client';

import useSWR from 'swr';
import { PortfolioSummary, PortfolioRiskMetrics } from '@stablecoin/types';
import { PortfolioAnalysisService } from '@/services/portfolioService';

/**
 * Hook for fetching complete portfolio data
 */
export const usePortfolio = (address: string | null, refreshInterval?: number) => {
  const { data, error, isLoading, mutate } = useSWR(
    address ? ['portfolio', address] : null,
    () => address ? PortfolioAnalysisService.fetchPortfolio(address) : null,
    {
      refreshInterval: refreshInterval || 30000, // 30s default
      revalidateOnFocus: false,
      dedupingInterval: 10000,
      onError: (err) => {
        console.error('Portfolio fetch error:', err);
      },
    }
  );

  return {
    portfolio: data as PortfolioSummary | undefined,
    isLoading,
    error,
    refetch: mutate,
  };
};

/**
 * Hook for fetching token balances only (lighter)
 */
export const useTokenBalances = (address: string | null, refreshInterval?: number) => {
  const { data, error, isLoading, mutate } = useSWR(
    address ? ['portfolio-tokens', address] : null,
    () => address ? PortfolioAnalysisService.fetchTokenBalances(address) : null,
    {
      refreshInterval: refreshInterval || 20000, // 20s for faster updates
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  return {
    balances: data,
    isLoading,
    error,
    refetch: mutate,
  };
};

/**
 * Hook for fetching risk analysis
 */
export const usePortfolioRisk = (address: string | null, refreshInterval?: number) => {
  const { data, error, isLoading, mutate } = useSWR(
    address ? ['portfolio-risk', address] : null,
    () => address ? PortfolioAnalysisService.fetchRiskAnalysis(address) : null,
    {
      refreshInterval: refreshInterval || 60000, // 1 minute for risk analysis
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    riskMetrics: data as PortfolioRiskMetrics | undefined,
    isLoading,
    error,
    refetch: mutate,
  };
};