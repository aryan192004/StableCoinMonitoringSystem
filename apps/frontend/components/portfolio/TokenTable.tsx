'use client';

import { TokenBalance } from '@stablecoin/types';
import { PortfolioAnalysisService } from '@/services/portfolioService';
import { Card, CardHeader, CardTitle, CardBody, Badge, Table } from '@/components/ui';

interface TokenTableProps {
  ethBalance: TokenBalance;
  tokenBalances: TokenBalance[];
}

export const TokenTable: React.FC<TokenTableProps> = ({ 
  ethBalance, 
  tokenBalances 
}) => {
  // Combine ETH and token balances for display
  const allTokens = [ethBalance, ...tokenBalances].sort((a, b) => 
    (b.valueUsd || 0) - (a.valueUsd || 0)
  );

  const columns = [
    {
      header: 'Asset',
      accessor: 'asset' as const,
    },
    {
      header: 'Balance',
      accessor: 'balance' as const,
    },
    {
      header: 'Price',
      accessor: 'price' as const,
    },
    {
      header: 'Value',
      accessor: 'value' as const,
    },
    {
      header: 'Type',
      accessor: 'type' as const,
    },
  ];

  const data = allTokens.map((token) => ({
    asset: (
      <div className="flex items-center gap-3">
        {token.logoUrl && (
          <img 
            src={token.logoUrl} 
            alt={token.symbol}
            className="w-6 h-6 rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <div>
          <div className="font-medium text-sm">{token.symbol}</div>
          <div className="text-xs text-textSecondary">{token.name}</div>
        </div>
      </div>
    ),
    balance: (
      <div className="text-right">
        <div className="font-mono text-sm">
          {parseFloat(token.formattedBalance).toLocaleString(undefined, {
            maximumFractionDigits: 6
          })}
        </div>
        <div className="text-xs text-textSecondary">{token.symbol}</div>
      </div>
    ),
    price: (
      <div className="text-right">
        <div className="text-sm">
          {token.priceUsd ? `$${token.priceUsd.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
          })}` : 'N/A'}
        </div>
      </div>
    ),
    value: (
      <div className="text-right">
        <div className="font-medium text-sm">
          {token.valueUsd ? PortfolioAnalysisService.formatValue(token.valueUsd) : 'N/A'}
        </div>
      </div>
    ),
    type: (
      <div>
        {token.isStablecoin ? (
          <Badge variant="success" size="sm">Stablecoin</Badge>
        ) : token.symbol === 'ETH' ? (
          <Badge variant="primary" size="sm">Native</Badge>
        ) : (
          <Badge variant="secondary" size="sm">Token</Badge>
        )}
      </div>
    ),
  }));

  if (allTokens.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Holdings</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-center h-32 text-textSecondary">
            <div className="text-center">
              <div className="text-3xl mb-2">💰</div>
              <p>No tokens found</p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Token Holdings</CardTitle>
          <div className="text-sm text-textSecondary">
            {allTokens.length} asset{allTokens.length !== 1 ? 's' : ''}
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="overflow-x-auto">
          <Table columns={columns} data={data} />
        </div>
        
        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-textSecondary">Total Portfolio Value:</span>
            <span className="font-medium">
              {PortfolioAnalysisService.formatValue(
                allTokens.reduce((sum, token) => sum + (token.valueUsd || 0), 0)
              )}
            </span>
          </div>
          
          {/* Stablecoin breakdown */}
          {tokenBalances.some(t => t.isStablecoin) && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-textSecondary">Stablecoin Value:</span>
              <span className="text-green-600">
                {PortfolioAnalysisService.formatValue(
                  tokenBalances
                    .filter(t => t.isStablecoin)
                    .reduce((sum, token) => sum + (token.valueUsd || 0), 0)
                )}
              </span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};