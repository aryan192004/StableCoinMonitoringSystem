'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardBody, Button, Badge } from '@/components/ui';
import { PortfolioOverview, AllocationChart, TokenTable } from '@/components/portfolio';
import { useWallet } from '@/hooks/useWallet';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PortfolioAnalysisService } from '@/services/portfolioService';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, GlobeAltIcon, LockClosedIcon } from '@heroicons/react/24/outline';



export default function PortfolioPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const {
    isConnected,
    address,
    shortAddress,
    chainId,
    isEthereumMainnet,
    error: walletError,
    connect,
    disconnect,
    switchNetwork,
  } = useWallet();

  const {
    portfolio,
    isLoading: portfolioLoading,
    error: portfolioError,
    refetch: refetchPortfolio,
  } = usePortfolio(isConnected ? address : null);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    disconnect();
  };

  // Check for network compatibility
  const needsNetworkSwitch = isConnected && !isEthereumMainnet;

  // Create empty portfolio when wallet is connected but API fails
  const emptyPortfolio = {
    totalValueUsd: 0,
    ethBalance: {
      tokenAddress: '0x0000000000000000000000000000000000000000',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      balance: '0',
      formattedBalance: '0.000000',
      priceUsd: 0,
      valueUsd: 0,
      logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      isStablecoin: false,
    },
    tokenBalances: [],
    allocations: [],
    stablecoinExposure: 0,
    riskScore: 0,
    lastUpdated: new Date(),
  };

  // Use empty portfolio if wallet is connected but there's an error
  const displayPortfolio = isConnected && portfolioError ? emptyPortfolio : portfolio;

  // Handle network switch
  const handleSwitchToMainnet = async () => {
    try {
      await switchNetwork(1); // Ethereum Mainnet
    } catch (error) {
      console.error('Network switch failed:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Portfolio</h1>
            <p className="text-textSecondary">
              Monitor your stablecoin exposure and risk distribution.
            </p>
          </div>
          
          {/* Wallet Status */}
          {isConnected && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium">{shortAddress}</div>
                <div className="text-xs text-textSecondary">
                  {PortfolioAnalysisService.getNetworkName(chainId || 1)}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          )}
        </div>

        {/* Network Warning */}
        {needsNetworkSwitch && (
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <CardBody>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-yellow-600">⚠️</span>
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Unsupported Network
                    </p>
                    <p className="text-xs text-yellow-600">
                      Please switch to Ethereum Mainnet to view your portfolio
                    </p>
                  </div>
                </div>
                <Button 
                  variant="warning"
                  size="sm"
                  onClick={handleSwitchToMainnet}
                >
                  Switch Network
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Wallet Error */}
        {walletError && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardBody>
              <div className="flex items-center gap-3">
                <span className="text-red-600">❌</span>
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Wallet Connection Error
                  </p>
                  <p className="text-xs text-red-600">{walletError}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Main Content */}
        {!isConnected ? (
          /* Empty State - Not Connected */
          <Card>
            <CardHeader>
              <CardTitle>Your Portfolio</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                
                {/* Icon Placeholder */}
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
  <ChartBarIcon className="w-8 h-8" />
</div>


                <h3 className="text-lg font-semibold text-textPrimary">
                  No Portfolio Data Yet
                </h3>

                <p className="text-sm text-textSecondary max-w-md">
                  Connect your MetaMask wallet to start monitoring stablecoin exposure, 
                  risk scores, and liquidity insights.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <Button 
                    variant="primary"
                    onClick={handleConnectWallet}
                    disabled={isConnecting}
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </Button>
                  <Button variant="outline" disabled>
                    Import Holdings
                  </Button>
                </div>

                <div className="text-xs text-textSecondary mt-4">
                 <div className="space-y-2 text-sm text-muted-foreground">
  <p className="flex items-center gap-2">
    <CheckCircleIcon className="w-5 h-5 text-green-500" />
    MetaMask Required
  </p>

  <p className="flex items-center gap-2">
    <GlobeAltIcon className="w-5 h-5 text-primary" />
    Ethereum Mainnet Only
  </p>

  <p className="flex items-center gap-2">
    <LockClosedIcon className="w-5 h-5 text-primary" />
    No private keys stored
  </p>
</div>

                </div>
              </div>
            </CardBody>
          </Card>
        ) : needsNetworkSwitch ? (
          /* Wrong Network */
          <Card>
            <CardHeader>
              <CardTitle>Network Not Supported</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 text-2xl">
                  ⚠️
                </div>
                <h3 className="text-lg font-semibold text-textPrimary">
                  Switch to Ethereum Mainnet
                </h3>
                <p className="text-sm text-textSecondary max-w-md">
                  Portfolio analysis is currently only available on Ethereum Mainnet. 
                  Please switch your network to continue.
                </p>
                <Button 
                  variant="warning"
                  onClick={handleSwitchToMainnet}
                >
                  Switch to Mainnet
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : portfolioLoading ? (
          /* Loading State */
          <Card>
            <CardBody>
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <h3 className="text-lg font-semibold text-textPrimary">
                  Loading Portfolio...
                </h3>
                <p className="text-sm text-textSecondary">
                  Fetching token balances and calculating metrics
                </p>
              </div>
            </CardBody>
          </Card>
        ) : displayPortfolio ? (
          /* Portfolio Data Loaded - either real data or empty when error occurs */
          <div className="space-y-6">
            {/* Overview KPIs */}
            <PortfolioOverview portfolio={displayPortfolio} />
            
            {/* Charts and Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Allocation Chart */}
              <AllocationChart 
                allocations={displayPortfolio.allocations}
                totalValue={displayPortfolio.totalValueUsd}
              />
              
              {/* Risk Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Analysis</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {/* Risk Score */}
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">
                        <span className={PortfolioAnalysisService.getRiskColor(displayPortfolio.riskScore)}>
                          {displayPortfolio.riskScore}/100
                        </span>
                      </div>
                      <Badge 
                        variant={PortfolioAnalysisService.getRiskBadgeVariant(displayPortfolio.riskScore)}
                      >
                        {displayPortfolio.riskScore < 30 ? 'Low Risk' : 
                         displayPortfolio.riskScore < 70 ? 'Medium Risk' : 'High Risk'}
                      </Badge>
                    </div>
                    
                    {/* Risk Factors */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Diversification</span>
                          <span>{PortfolioAnalysisService.calculateDiversityScore(displayPortfolio.allocations).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${PortfolioAnalysisService.calculateDiversityScore(displayPortfolio.allocations)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Stablecoin Exposure</span>
                          <span>{displayPortfolio.stablecoinExposure.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${displayPortfolio.stablecoinExposure}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                 
                </CardBody>
              </Card>
            </div>
            
            {/* Token Holdings Table */}
            <TokenTable 
              ethBalance={displayPortfolio.ethBalance}
              tokenBalances={displayPortfolio.tokenBalances}
            />
          </div>
        ) : (
          /* No Portfolio Data */
          <Card>
            <CardBody>
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl">
                  💰
                </div>
                <h3 className="text-lg font-semibold text-textPrimary">
                  No Assets Found
                </h3>
                <p className="text-sm text-textSecondary">
                  This wallet appears to have no ETH or token balances on Ethereum Mainnet.
                </p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
