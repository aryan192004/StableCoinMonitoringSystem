'use client';

import { useEffect } from 'react';
import { useWalletStore } from '@/store/walletStore';

export const useWallet = () => {
  const store = useWalletStore();

  // Auto-reconnect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (typeof window === 'undefined' || !window.ethereum) {
        return;
      }

      try {
        const { BrowserProvider } = await import('ethers');
        const provider = new BrowserProvider(window.ethereum);
        
        // Check if already connected
        const accounts = await provider.send('eth_accounts', []);
        if (accounts && accounts.length > 0) {
          // Silently reconnect
          await store.connect();
        }
      } catch (error) {
        console.warn('Auto-connect failed:', error);
      }
    };

    autoConnect();
  }, [store.connect]);

  return {
    // State
    isConnected: store.isConnected,
    address: store.address,
    balance: store.balance,
    chainId: store.chainId,
    isConnecting: store.isConnecting,
    error: store.error,
    
    // Computed values
    isEthereumMainnet: store.chainId === 1,
    shortAddress: store.address 
      ? `${store.address.slice(0, 6)}...${store.address.slice(-4)}`
      : null,
    
    // Actions
    connect: store.connect,
    disconnect: store.disconnect,
    switchNetwork: store.switchNetwork,
  };
};