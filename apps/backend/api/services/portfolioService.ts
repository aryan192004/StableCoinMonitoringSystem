import axios from 'axios';
import { ethers } from 'ethers';
import { TokenBalance, PortfolioSummary } from '@stablecoin/types';

// ERC20 ABI for balance checking
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

// Popular token addresses on Ethereum Mainnet
const POPULAR_TOKENS = [
  { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
  { symbol: 'USDC', address: '0xA0b86a33E6417cC4C4AE0b59c7f37aF84C1e30f6', decimals: 6 },
  { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
  { symbol: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18 },
  { symbol: 'LINK', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18 },
  { symbol: 'UNI', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18 },
];

const STABLECOIN_SYMBOLS = ['USDT', 'USDC', 'DAI', 'BUSD', 'FRAX', 'TUSD'];

export class PortfolioService {
  private provider: ethers.Provider;
  private coingeckoBaseUrl = 'https://api.coingecko.com/api/v3';

  constructor() {
    // Use Infura or Alchemy for production
    const rpcUrl = process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  /**
   * Get ETH balance for an address
   */
  async getEthBalance(address: string): Promise<TokenBalance> {
    try {
      const balance = await this.provider.getBalance(address);
      const formattedBalance = ethers.formatEther(balance);
      const price = await this.getTokenPrice('ethereum');

      return {
        tokenAddress: '0x0000000000000000000000000000000000000000',
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        balance: balance.toString(),
        formattedBalance,
        priceUsd: price,
        valueUsd: parseFloat(formattedBalance) * price,
        logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
        isStablecoin: false,
      };
    } catch (error) {
      console.error('Error fetching ETH balance:', error);
      throw error;
    }
  }

  /**
   * Get ERC20 token balance for an address
   */
  async getTokenBalance(address: string, tokenAddress: string, tokenInfo: any): Promise<TokenBalance | null> {
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      
      const [balance, decimals, symbol, name] = await Promise.all([
        contract.balanceOf(address),
        contract.decimals(),
        contract.symbol(),
        contract.name(),
      ]);

      if (balance === 0n) {
        return null; // Skip zero balances
      }

      const formattedBalance = ethers.formatUnits(balance, decimals);
      const price = await this.getTokenPrice(tokenInfo.coingeckoId || symbol.toLowerCase());

      return {
        tokenAddress,
        symbol,
        name,
        decimals,
        balance: balance.toString(),
        formattedBalance,
        priceUsd: price,
        valueUsd: parseFloat(formattedBalance) * price,
        logoUrl: tokenInfo.logoUrl,
        isStablecoin: STABLECOIN_SYMBOLS.includes(symbol),
      };
    } catch (error) {
      console.error(`Error fetching token balance for ${tokenAddress}:`, error);
      return null;
    }
  }

  /**
   * Fetch token price from CoinGecko
   */
  async getTokenPrice(tokenId: string): Promise<number> {
    try {
      const response = await axios.get(`${this.coingeckoBaseUrl}/simple/price`, {
        params: {
          ids: tokenId,
          vs_currencies: 'usd',
        },
        timeout: 5000,
      });

      return response.data[tokenId]?.usd || 0;
    } catch (error) {
      console.warn(`Failed to fetch price for ${tokenId}:`, error);
      return 0;
    }
  }

  /**
   * Get token prices in batch
   */
  async getTokenPrices(tokenIds: string[]): Promise<Record<string, number>> {
    try {
      const response = await axios.get(`${this.coingeckoBaseUrl}/simple/price`, {
        params: {
          ids: tokenIds.join(','),
          vs_currencies: 'usd',
        },
        timeout: 10000,
      });

      const prices: Record<string, number> = {};
      for (const tokenId of tokenIds) {
        prices[tokenId] = response.data[tokenId]?.usd || 0;
      }

      return prices;
    } catch (error) {
      console.warn('Failed to fetch token prices:', error);
      return {};
    }
  }

  /**
   * Get complete portfolio for an address
   */
  async getPortfolio(address: string): Promise<PortfolioSummary> {
    try {
      // Get ETH balance
      const ethBalance = await this.getEthBalance(address);

      // Get token balances
      const tokenBalances: TokenBalance[] = [];
      
      for (const token of POPULAR_TOKENS) {
        const balance = await this.getTokenBalance(address, token.address, {
          coingeckoId: this.getCoingeckoId(token.symbol),
          logoUrl: this.getTokenLogoUrl(token.symbol),
        });
        
        if (balance) {
          tokenBalances.push(balance);
        }
      }

      // Calculate total value
      const totalValueUsd = (ethBalance.valueUsd || 0) + tokenBalances.reduce((sum, token) => sum + (token.valueUsd || 0), 0);

      // Calculate allocations
      const allocations = this.calculateAllocations([ethBalance, ...tokenBalances], totalValueUsd);

      // Calculate stablecoin exposure
      const stablecoinValue = tokenBalances
        .filter(token => token.isStablecoin)
        .reduce((sum, token) => sum + (token.valueUsd || 0), 0);
      
      const stablecoinExposure = totalValueUsd > 0 ? (stablecoinValue / totalValueUsd) * 100 : 0;

      // Calculate basic risk score (placeholder for ML integration)
      const riskScore = this.calculateRiskScore(allocations, stablecoinExposure);

      return {
        totalValueUsd,
        ethBalance,
        tokenBalances,
        allocations,
        stablecoinExposure,
        riskScore,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      throw error;
    }
  }

  private calculateAllocations(tokens: TokenBalance[], totalValue: number) {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];

    return tokens
      .filter(token => (token.valueUsd || 0) > 0)
      .map((token, index) => ({
        symbol: token.symbol,
        percentage: totalValue > 0 ? ((token.valueUsd || 0) / totalValue) * 100 : 0,
        valueUsd: token.valueUsd || 0,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.valueUsd - a.valueUsd);
  }

  private calculateRiskScore(allocations: any[], stablecoinExposure: number): number {
    // Basic risk scoring algorithm (prepare for ML integration)
    let score = 0;

    // Concentration risk (0-40 points)
    const maxAllocation = Math.max(...allocations.map(a => a.percentage));
    const concentrationRisk = Math.min(40, maxAllocation * 0.8);
    score += concentrationRisk;

    // Stablecoin exposure (0-30 points)
    const stablecoinRisk = stablecoinExposure > 80 ? 10 : stablecoinExposure < 10 ? 30 : 15;
    score += stablecoinRisk;

    // Diversification (0-30 points) 
    const diversificationRisk = allocations.length < 3 ? 30 : allocations.length > 8 ? 10 : 20;
    score += diversificationRisk;

    return Math.min(100, Math.max(0, score));
  }

  private getCoingeckoId(symbol: string): string {
    const mapping: Record<string, string> = {
      'ETH': 'ethereum',
      'USDT': 'tether',
      'USDC': 'usd-coin',
      'DAI': 'dai',
      'WETH': 'weth',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
    };
    return mapping[symbol] || symbol.toLowerCase();
  }

  private getTokenLogoUrl(symbol: string): string {
    const mapping: Record<string, string> = {
      'ETH': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      'USDT': 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
      'USDC': 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
      'DAI': 'https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png',
      'WETH': 'https://assets.coingecko.com/coins/images/2518/small/weth.png',
      'LINK': 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
      'UNI': 'https://assets.coingecko.com/coins/images/12504/small/uniswap-logo.png',
    };
    return mapping[symbol] || '';
  }
}