import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { apiClient } from '@/utils/api';
import type { Stablecoin, LiquidityPrediction, AnomalyDetection } from '@/types';

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

/**
 * Hook to fetch stablecoins with auto-refresh
 */
export function useStablecoins(refreshInterval: number = 30000) {
  const { data, error, mutate } = useSWR<Stablecoin[]>(
    '/stablecoins',
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
    }
  );

  return {
    stablecoins: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
}

/**
 * Hook to fetch single stablecoin details
 */
export function useStablecoin(id: string, refreshInterval: number = 10000) {
  const { data, error, mutate } = useSWR<Stablecoin>(
    id ? `/stablecoins/${id}` : null,
    fetcher,
    { refreshInterval }
  );

  return {
    stablecoin: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
}

/**
 * Hook for managing WebSocket connection
 */
export function useWebSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLastMessage(data);
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [url]);

  return {
    socket,
    isConnected,
    lastMessage,
  };
}

/**
 * Hook to fetch liquidity predictions for a stablecoin
 */
export function useLiquidityPrediction(stablecoin: string, refreshInterval: number = 60000) {
  const { data, error, mutate } = useSWR<LiquidityPrediction>(
    stablecoin ? `/liquidity/predict/${stablecoin}` : null,
    fetcher,
    { 
      refreshInterval,
      revalidateOnFocus: false,
    }
  );

  return {
    prediction: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
}

/**
 * Hook to fetch anomaly detection results for a stablecoin
 */
export function useAnomalyDetection(stablecoin: string, refreshInterval: number = 30000) {
  const { data, error, mutate } = useSWR<AnomalyDetection>(
    stablecoin ? `/anomalies/${stablecoin}` : null,
    fetcher,
    { 
      refreshInterval,
      revalidateOnFocus: true,
    }
  );

  return {
    anomaly: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
}
