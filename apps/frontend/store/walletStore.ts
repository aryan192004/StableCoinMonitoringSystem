import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { WalletState, WalletActions } from '@stablecoin/types';

interface WalletStore extends WalletState, WalletActions {}

export const useWalletStore = create<WalletStore>()(
  devtools((set, get) => ({
    // Initial state
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    isConnecting: false,
    error: null,

    // Actions
    connect: async () => {
      set({ isConnecting: true, error: null });
      
      try {
        if (typeof window === 'undefined' || !window.ethereum) {
          throw new Error('MetaMask is not installed');
        }

        const { BrowserProvider } = await import('ethers');
        const provider = new BrowserProvider(window.ethereum);
        
        // Request account access
        const accounts = await provider.send('eth_requestAccounts', []);
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found');
        }

        const address = accounts[0];
        const signer = await provider.getSigner();
        
        // Get network info
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        
        // Get ETH balance
        const balance = await provider.getBalance(address);
        const formattedBalance = balance ? Number(balance) / 1e18 : 0;

        set({
          isConnected: true,
          address,
          balance: formattedBalance.toFixed(6),
          chainId,
          isConnecting: false,
          error: null,
        });

        // Listen for account changes
        window.ethereum?.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            get().disconnect();
          } else {
            set({ address: accounts[0] });
          }
        });

        // Listen for chain changes
        window.ethereum?.on('chainChanged', (chainId: string) => {
          set({ chainId: parseInt(chainId, 16) });
          window.location.reload(); // Reload to handle network change
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
        set({
          isConnecting: false,
          error: errorMessage,
        });
        throw error;
      }
    },

    disconnect: () => {
      set({
        isConnected: false,
        address: null,
        balance: null,
        chainId: null,
        isConnecting: false,
        error: null,
      });
    },

    switchNetwork: async (targetChainId: number) => {
      try {
        if (!window.ethereum) {
          throw new Error('MetaMask is not installed');
        }

        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        });
      } catch (error) {
        throw error;
      }
    },
  }), {
    name: 'wallet-store',
  })
);

// Type augmentation for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}