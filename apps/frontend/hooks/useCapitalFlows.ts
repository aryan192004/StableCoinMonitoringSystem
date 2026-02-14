'use client';

import useSWR from 'swr';
import { 
  CapitalFlowEvent, 
  CapitalFlowSummary, 
  CapitalFlowMetrics, 
  CapitalFlowFilters 
} from '@stablecoin/types';
import { CapitalFlowsService } from '@/services/capitalFlowsService';
import { useMemo } from 'react';

/**
 * Hook for fetching capital flow events with optional filters
 */
export const useCapitalFlows = (filters?: CapitalFlowFilters, refreshInterval?: number) => {
  // Create a stable key for SWR
  const swrKey = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) {
      return ['capital-flows'];
    }
    
    return ['capital-flows', JSON.stringify(filters)];
  }, [filters]);

  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    () => CapitalFlowsService.fetchCapitalFlows(filters),
    {
      refreshInterval: refreshInterval || 30000, // 30s default
      revalidateOnFocus: false,
      dedupingInterval: 15000,
      onError: (err) => {
        console.error('Capital flows fetch error:', err);
      },
    }
  );

  return {
    capitalFlows: data as CapitalFlowEvent[] | undefined,
    isLoading,
    error,
    refetch: mutate,
  };
};

/**
 * Hook for fetching capital flows summary (dashboard highlights)
 */
export const useCapitalFlowSummary = (refreshInterval?: number) => {
  const { data, error, isLoading, mutate } = useSWR(
    ['capital-flows-summary'],
    () => CapitalFlowsService.fetchCapitalFlowSummary(),
    {
      refreshInterval: refreshInterval || 60000, // 1 minute default
      revalidateOnFocus: true,
      dedupingInterval: 30000,
      onError: (err) => {
        console.error('Capital flows summary fetch error:', err);
      },
    }
  );

  return {
    summary: data as CapitalFlowSummary | undefined,
    isLoading,
    error,
    refetch: mutate,
  };
};

/**
 * Hook for fetching capital flow metrics for a specific stablecoin
 */
export const useCapitalFlowMetrics = (stablecoin: string | null, refreshInterval?: number) => {
  const { data, error, isLoading, mutate } = useSWR(
    stablecoin ? ['capital-flows-metrics', stablecoin] : null,
    () => stablecoin ? CapitalFlowsService.fetchCapitalFlowMetrics(stablecoin) : null,
    {
      refreshInterval: refreshInterval || 45000, // 45s default
      revalidateOnFocus: false,
      dedupingInterval: 20000,
      onError: (err) => {
        console.error('Capital flows metrics fetch error:', err);
      },
    }
  );

  return {
    metrics: data as CapitalFlowMetrics | undefined,
    isLoading,
    error,
    refetch: mutate,
  };
};

/**
 * Hook for fetching live capital flows (high-impact events)
 */
export const useLiveCapitalFlows = (refreshInterval?: number) => {
  const { data, error, isLoading, mutate } = useSWR(
    ['capital-flows-live'],
    () => CapitalFlowsService.fetchLiveCapitalFlows(),
    {
      refreshInterval: refreshInterval || 15000, // 15s for live data
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      onError: (err) => {
        console.error('Live capital flows fetch error:', err);
      },
    }
  );

  return {
    liveFlows: data as CapitalFlowEvent[] | undefined,
    isLoading,
    error,
    refetch: mutate,
  };
};

/**
 * Hook for fetching capital flows analytics
 */
export const useCapitalFlowAnalytics = (timeRange: '1h' | '24h' | '7d' | '30d' = '24h', refreshInterval?: number) => {
  const { data, error, isLoading, mutate } = useSWR(
    ['capital-flows-analytics', timeRange],
    () => CapitalFlowsService.fetchCapitalFlowAnalytics(timeRange),
    {
      refreshInterval: refreshInterval || 120000, // 2 minutes default
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      onError: (err) => {
        console.error('Capital flows analytics fetch error:', err);
      },
    }
  );

  return {
    analytics: data,
    isLoading,
    error,
    refetch: mutate,
  };
};

/**
 * Hook for multiple stablecoin metrics
 */
export const useCapitalFlowMultipleMetrics = (stablecoins: string[], refreshInterval?: number) => {
  const swrKey = useMemo(() => {
    if (!stablecoins || stablecoins.length === 0) return null;
    return ['capital-flows-multiple-metrics', stablecoins.sort().join(',')];
  }, [stablecoins]);

  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    async () => {
      if (!stablecoins || stablecoins.length === 0) return [];
      
      const promises = stablecoins.map(coin => 
        CapitalFlowsService.fetchCapitalFlowMetrics(coin)
      );
      
      const results = await Promise.allSettled(promises);
      
      return results.map((result, index) => ({
        stablecoin: stablecoins[index],
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null,
      }));
    },
    {
      refreshInterval: refreshInterval || 60000, // 1 minute
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      onError: (err) => {
        console.error('Multiple capital flows metrics fetch error:', err);
      },
    }
  );

  return {
    metricsData: data,
    isLoading,
    error,
    refetch: mutate,
  };
};

/**
 * Hook for filtered capital flows with pagination
 */
export const useFilteredCapitalFlows = (
  filters: CapitalFlowFilters,
  page: number = 1,
  pageSize: number = 20,
  refreshInterval?: number
) => {
  const { capitalFlows, isLoading, error, refetch } = useCapitalFlows(filters, refreshInterval);

  const paginatedData = useMemo(() => {
    if (!capitalFlows) return null;

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = capitalFlows.slice(startIndex, endIndex);

    return {
      items,
      totalItems: capitalFlows.length,
      totalPages: Math.ceil(capitalFlows.length / pageSize),
      currentPage: page,
      pageSize,
      hasNextPage: endIndex < capitalFlows.length,
      hasPrevPage: page > 1,
    };
  }, [capitalFlows, page, pageSize]);

  return {
    paginatedData,
    allFlows: capitalFlows,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook for capital flows with real-time updates
 */
export const useRealTimeCapitalFlows = (filters?: CapitalFlowFilters) => {
  // Use shorter refresh interval for real-time feel
  const { capitalFlows, isLoading, error, refetch } = useCapitalFlows(filters, 10000); // 10s
  
  // Also get live flows for immediate updates
  const { liveFlows, isLoading: isLiveLoading } = useLiveCapitalFlows(5000); // 5s

  // Combine and deduplicate flows
  const combinedFlows = useMemo(() => {
    if (!capitalFlows && !liveFlows) return undefined;
    
    const allFlows = [...(capitalFlows || []), ...(liveFlows || [])];
    
    // Deduplicate by ID and sort by timestamp
    const uniqueFlows = Array.from(
      new Map(allFlows.map(flow => [flow.id, flow])).values()
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return uniqueFlows;
  }, [capitalFlows, liveFlows]);

  return {
    flows: combinedFlows,
    isLoading: isLoading || isLiveLoading,
    error,
    refetch,
  };
};

/**
 * Hook for capital flows dashboard data (combines multiple data sources)
 */
export const useCapitalFlowsDashboard = (refreshInterval?: number) => {
  const { summary, isLoading: summaryLoading, error: summaryError } = useCapitalFlowSummary(refreshInterval);
  const { capitalFlows, isLoading: flowsLoading, error: flowsError } = useCapitalFlows({ timeRange: '24h' }, refreshInterval);
  const { analytics, isLoading: analyticsLoading, error: analyticsError } = useCapitalFlowAnalytics('24h', refreshInterval);

  const isLoading = summaryLoading || flowsLoading || analyticsLoading;
  const error = summaryError || flowsError || analyticsError;

  return {
    summary,
    recentFlows: capitalFlows?.slice(0, 10), // Top 10 recent flows
    analytics,
    isLoading,
    error,
  };
};