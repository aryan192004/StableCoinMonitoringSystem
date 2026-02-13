'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';
import { generateLiquidityReport } from '@/utils/pdfReportGenerator';

// Base order book data for different coin/exchange combinations
const baseOrderBookData: Record<string, Record<string, { bids: Array<{ price: number; cumulative: number }>, asks: Array<{ price: number; cumulative: number }> }>> = {
  'USDT': {
    'Binance': {
      bids: [
        { price: 0.9970, cumulative: 420 },
        { price: 0.9980, cumulative: 890 },
        { price: 0.9985, cumulative: 1580 },
        { price: 0.9990, cumulative: 2420 },
        { price: 0.9995, cumulative: 3540 },
        { price: 0.9998, cumulative: 4680 },
        { price: 1.0000, cumulative: 5200 },
      ],
      asks: [
        { price: 1.0000, cumulative: 5100 },
        { price: 1.0002, cumulative: 4550 },
        { price: 1.0005, cumulative: 3420 },
        { price: 1.0010, cumulative: 2310 },
        { price: 1.0015, cumulative: 1480 },
        { price: 1.0020, cumulative: 850 },
        { price: 1.0030, cumulative: 380 },
      ]
    },
    'Coinbase': {
      bids: [
        { price: 0.9975, cumulative: 280 },
        { price: 0.9982, cumulative: 620 },
        { price: 0.9988, cumulative: 1180 },
        { price: 0.9992, cumulative: 1840 },
        { price: 0.9996, cumulative: 2620 },
        { price: 0.9999, cumulative: 3280 },
        { price: 1.0000, cumulative: 3800 },
      ],
      asks: [
        { price: 1.0000, cumulative: 3700 },
        { price: 1.0001, cumulative: 3140 },
        { price: 1.0004, cumulative: 2480 },
        { price: 1.0008, cumulative: 1720 },
        { price: 1.0012, cumulative: 1080 },
        { price: 1.0018, cumulative: 580 },
        { price: 1.0025, cumulative: 240 },
      ]
    },
    'Kraken': {
      bids: [
        { price: 0.9978, cumulative: 180 },
        { price: 0.9984, cumulative: 420 },
        { price: 0.9989, cumulative: 780 },
        { price: 0.9993, cumulative: 1240 },
        { price: 0.9997, cumulative: 1780 },
        { price: 0.9999, cumulative: 2180 },
        { price: 1.0000, cumulative: 2500 },
      ],
      asks: [
        { price: 1.0000, cumulative: 2400 },
        { price: 1.0001, cumulative: 2080 },
        { price: 1.0003, cumulative: 1680 },
        { price: 1.0007, cumulative: 1180 },
        { price: 1.0011, cumulative: 740 },
        { price: 1.0016, cumulative: 380 },
        { price: 1.0022, cumulative: 160 },
      ]
    }
  },
  'USDC': {
    'Binance': {
      bids: [
        { price: 0.9972, cumulative: 340 },
        { price: 0.9981, cumulative: 720 },
        { price: 0.9987, cumulative: 1320 },
        { price: 0.9992, cumulative: 2080 },
        { price: 0.9996, cumulative: 2980 },
        { price: 0.9999, cumulative: 3840 },
        { price: 1.0000, cumulative: 4200 },
      ],
      asks: [
        { price: 1.0000, cumulative: 4100 },
        { price: 1.0001, cumulative: 3720 },
        { price: 1.0003, cumulative: 2880 },
        { price: 1.0006, cumulative: 2020 },
        { price: 1.0010, cumulative: 1280 },
        { price: 1.0015, cumulative: 680 },
        { price: 1.0022, cumulative: 310 },
      ]
    },
    'Coinbase': {
      bids: [
        { price: 0.9976, cumulative: 480 },
        { price: 0.9983, cumulative: 980 },
        { price: 0.9988, cumulative: 1680 },
        { price: 0.9993, cumulative: 2520 },
        { price: 0.9997, cumulative: 3480 },
        { price: 0.9999, cumulative: 4280 },
        { price: 1.0000, cumulative: 4800 },
      ],
      asks: [
        { price: 1.0000, cumulative: 4700 },
        { price: 1.0001, cumulative: 4180 },
        { price: 1.0003, cumulative: 3420 },
        { price: 1.0006, cumulative: 2580 },
        { price: 1.0010, cumulative: 1780 },
        { price: 1.0014, cumulative: 980 },
        { price: 1.0020, cumulative: 440 },
      ]
    },
    'Kraken': {
      bids: [
        { price: 0.9979, cumulative: 220 },
        { price: 0.9985, cumulative: 520 },
        { price: 0.9990, cumulative: 940 },
        { price: 0.9994, cumulative: 1440 },
        { price: 0.9997, cumulative: 1980 },
        { price: 0.9999, cumulative: 2420 },
        { price: 1.0000, cumulative: 2700 },
      ],
      asks: [
        { price: 1.0000, cumulative: 2600 },
        { price: 1.0001, cumulative: 2340 },
        { price: 1.0003, cumulative: 1880 },
        { price: 1.0006, cumulative: 1380 },
        { price: 1.0010, cumulative: 880 },
        { price: 1.0015, cumulative: 480 },
        { price: 1.0021, cumulative: 200 },
      ]
    }
  },
  'DAI': {
    'Binance': {
      bids: [
        { price: 0.9974, cumulative: 180 },
        { price: 0.9982, cumulative: 420 },
        { price: 0.9988, cumulative: 780 },
        { price: 0.9993, cumulative: 1240 },
        { price: 0.9997, cumulative: 1780 },
        { price: 0.9999, cumulative: 2240 },
        { price: 1.0000, cumulative: 2500 },
      ],
      asks: [
        { price: 1.0000, cumulative: 2400 },
        { price: 1.0001, cumulative: 2180 },
        { price: 1.0003, cumulative: 1720 },
        { price: 1.0007, cumulative: 1220 },
        { price: 1.0012, cumulative: 760 },
        { price: 1.0018, cumulative: 400 },
        { price: 1.0026, cumulative: 170 },
      ]
    },
    'Coinbase': {
      bids: [
        { price: 0.9977, cumulative: 240 },
        { price: 0.9984, cumulative: 540 },
        { price: 0.9990, cumulative: 980 },
        { price: 0.9994, cumulative: 1480 },
        { price: 0.9998, cumulative: 2040 },
        { price: 0.9999, cumulative: 2480 },
        { price: 1.0000, cumulative: 2800 },
      ],
      asks: [
        { price: 1.0000, cumulative: 2700 },
        { price: 1.0001, cumulative: 2420 },
        { price: 1.0003, cumulative: 1940 },
        { price: 1.0006, cumulative: 1420 },
        { price: 1.0011, cumulative: 920 },
        { price: 1.0016, cumulative: 500 },
        { price: 1.0023, cumulative: 220 },
      ]
    },
    'Kraken': {
      bids: [
        { price: 0.9980, cumulative: 150 },
        { price: 0.9986, cumulative: 360 },
        { price: 0.9991, cumulative: 660 },
        { price: 0.9995, cumulative: 1040 },
        { price: 0.9998, cumulative: 1460 },
        { price: 0.9999, cumulative: 1780 },
        { price: 1.0000, cumulative: 2000 },
      ],
      asks: [
        { price: 1.0000, cumulative: 1900 },
        { price: 1.0001, cumulative: 1740 },
        { price: 1.0003, cumulative: 1420 },
        { price: 1.0007, cumulative: 1040 },
        { price: 1.0012, cumulative: 680 },
        { price: 1.0018, cumulative: 350 },
        { price: 1.0025, cumulative: 140 },
      ]
    }
  }
};

export default function LiquidityPage() {
  const [selectedCoin, setSelectedCoin] = useState('USDT');
  const [selectedExchange, setSelectedExchange] = useState('Binance');
  const [liveOrderBookData, setLiveOrderBookData] = useState(baseOrderBookData);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Symbol mapping for each exchange
  const symbolMap: Record<string, Record<string, string>> = {
    'Binance': {
      'USDT': 'BUSDUSDT',  // Binance doesn't have direct USDT/USD pair, using BUSD as proxy
      'USDC': 'USDCUSDT',
      'DAI': 'DAIUSDT'
    },
    'Coinbase': {
      'USDT': 'USDT-USD',
      'USDC': 'USDC-USD',
      'DAI': 'DAI-USD'
    },
    'Kraken': {
      'USDT': 'USDTZUSD',
      'USDC': 'USDCUSD',
      'DAI': 'DAIUSD'
    }
  };

  // Fetch order book from Binance
  const fetchBinanceOrderBook = async (symbol: string) => {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=1000`);
      const data = await response.json();
      
      // Calculate cumulative depth for bids
      let bidCumulative = 0;
      const bidLevels: Array<{ price: number; cumulative: number }> = [];
      
      for (const bid of data.bids) {
        const price = parseFloat(bid[0]);
        const quantity = parseFloat(bid[1]);
        bidCumulative += quantity * price; // USD value
        bidLevels.push({ price, cumulative: bidCumulative });
      }
      
      // Sample 7 evenly distributed points from bid side
      const bids = [];
      const bidStep = Math.floor(Math.min(bidLevels.length, 50) / 7);
      for (let i = 0; i < 7; i++) {
        const idx = Math.min(i * bidStep, bidLevels.length - 1);
        bids.push({
          price: bidLevels[idx].price,
          cumulative: Math.round(bidLevels[idx].cumulative / 1000) // Keep in thousands for better precision
        });
      }

      // Calculate cumulative depth for asks
      let askCumulative = 0;
      const askLevels: Array<{ price: number; cumulative: number }> = [];
      
      for (const ask of data.asks) {
        const price = parseFloat(ask[0]);
        const quantity = parseFloat(ask[1]);
        askCumulative += quantity * price; // USD value
        askLevels.push({ price, cumulative: askCumulative });
      }
      
      // Sample 7 evenly distributed points from ask side
      const asks = [];
      const askStep = Math.floor(Math.min(askLevels.length, 50) / 7);
      for (let i = 0; i < 7; i++) {
        const idx = Math.min(i * askStep, askLevels.length - 1);
        asks.push({
          price: askLevels[idx].price,
          cumulative: Math.round(askLevels[idx].cumulative / 1000) // Keep in thousands for better precision
        });
      }

      return { bids, asks };
    } catch (error) {
      console.error('Binance API error:', error);
      return null;
    }
  };

  // Fetch order book from Coinbase
  const fetchCoinbaseOrderBook = async (symbol: string) => {
    try {
      const response = await fetch(`https://api.exchange.coinbase.com/products/${symbol}/book?level=2`);
      const data = await response.json();
      
      // Calculate cumulative depth for bids
      let bidCumulative = 0;
      const bidLevels: Array<{ price: number; cumulative: number }> = [];
      
      for (const bid of data.bids) {
        const price = parseFloat(bid[0]);
        const quantity = parseFloat(bid[1]);
        bidCumulative += quantity * price;
        bidLevels.push({ price, cumulative: bidCumulative });
      }
      
      // Sample 7 points from bid side
      const bids = [];
      const bidStep = Math.floor(Math.min(bidLevels.length, 50) / 7);
      for (let i = 0; i < 7; i++) {
        const idx = Math.min(i * bidStep, bidLevels.length - 1);
        bids.push({
          price: bidLevels[idx].price,
          cumulative: Math.round(bidLevels[idx].cumulative / 1000)
        });
      }

      // Calculate cumulative depth for asks
      let askCumulative = 0;
      const askLevels: Array<{ price: number; cumulative: number }> = [];
      
      for (const ask of data.asks) {
        const price = parseFloat(ask[0]);
        const quantity = parseFloat(ask[1]);
        askCumulative += quantity * price;
        askLevels.push({ price, cumulative: askCumulative });
      }
      
      // Sample 7 points from ask side
      const asks = [];
      const askStep = Math.floor(Math.min(askLevels.length, 50) / 7);
      for (let i = 0; i < 7; i++) {
        const idx = Math.min(i * askStep, askLevels.length - 1);
        asks.push({
          price: askLevels[idx].price,
          cumulative: Math.round(askLevels[idx].cumulative / 1000)
        });
      }

      return { bids, asks };
    } catch (error) {
      console.error('Coinbase API error:', error);
      return null;
    }
  };

  // Fetch order book from Kraken
  const fetchKrakenOrderBook = async (symbol: string) => {
    try {
      const response = await fetch(`https://api.kraken.com/0/public/Depth?pair=${symbol}&count=500`);
      const data = await response.json();
      
      if (data.error && data.error.length > 0) {
        console.error('Kraken API error:', data.error);
        return null;
      }

      const pairData = data.result[Object.keys(data.result)[0]];
      
      // Calculate cumulative depth for bids
      let bidCumulative = 0;
      const bidLevels: Array<{ price: number; cumulative: number }> = [];
      
      for (const bid of pairData.bids) {
        const price = parseFloat(bid[0]);
        const quantity = parseFloat(bid[1]);
        bidCumulative += quantity * price;
        bidLevels.push({ price, cumulative: bidCumulative });
      }
      
      // Sample 7 points from bid side
      const bids = [];
      const bidStep = Math.floor(Math.min(bidLevels.length, 50) / 7);
      for (let i = 0; i < 7; i++) {
        const idx = Math.min(i * bidStep, bidLevels.length - 1);
        bids.push({
          price: bidLevels[idx].price,
          cumulative: Math.round(bidLevels[idx].cumulative / 1000)
        });
      }

      // Calculate cumulative depth for asks
      let askCumulative = 0;
      const askLevels: Array<{ price: number; cumulative: number }> = [];
      
      for (const ask of pairData.asks) {
        const price = parseFloat(ask[0]);
        const quantity = parseFloat(ask[1]);
        askCumulative += quantity * price;
        askLevels.push({ price, cumulative: askCumulative });
      }
      
      // Sample 7 points from ask side
      const asks = [];
      const askStep = Math.floor(Math.min(askLevels.length, 50) / 7);
      for (let i = 0; i < 7; i++) {
        const idx = Math.min(i * askStep, askLevels.length - 1);
        asks.push({
          price: askLevels[idx].price,
          cumulative: Math.round(askLevels[idx].cumulative / 1000)
        });
      }

      return { bids, asks };
    } catch (error) {
      console.error('Kraken API error:', error);
      return null;
    }
  };

  // Fetch all order books
  const fetchAllOrderBooks = async () => {
    setIsLoading(true);
    const newData = JSON.parse(JSON.stringify(liveOrderBookData)); // Clone current data

    for (const coin of ['USDT', 'USDC', 'DAI']) {
      for (const exchange of ['Binance', 'Coinbase', 'Kraken']) {
        const symbol = symbolMap[exchange]?.[coin];
        if (!symbol) continue;

        let orderBook = null;
        
        if (exchange === 'Binance') {
          orderBook = await fetchBinanceOrderBook(symbol);
        } else if (exchange === 'Coinbase') {
          orderBook = await fetchCoinbaseOrderBook(symbol);
        } else if (exchange === 'Kraken') {
          orderBook = await fetchKrakenOrderBook(symbol);
        }

        if (orderBook && orderBook.bids.length > 0 && orderBook.asks.length > 0) {
          newData[coin][exchange] = orderBook;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    setLiveOrderBookData(newData);
    setLastUpdate(new Date());
    setIsLoading(false);
  };

  // Update seconds counter every second
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceUpdate(Math.floor((Date.now() - lastUpdate.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [lastUpdate]);

  // Fetch real order book data on mount and every 10 seconds
  useEffect(() => {
    fetchAllOrderBooks(); // Initial fetch
    
    const updateInterval = setInterval(() => {
      fetchAllOrderBooks();
    }, 10000); // Update every 10 seconds

    return () => clearInterval(updateInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exchanges = [
    { 
      name: 'Binance', 
      pairs: ['USDT/USD', 'USDC/USD', 'DAI/USD'],
      totalDepth: '$4.2B',
      avgSpread: '0.01%',
      status: 'excellent',
    },
    { 
      name: 'Coinbase', 
      pairs: ['USDC/USD', 'USDT/USD'],
      totalDepth: '$2.8B',
      avgSpread: '0.02%',
      status: 'good',
    },
    { 
      name: 'Kraken', 
      pairs: ['USDT/USD', 'DAI/USD'],
      totalDepth: '$1.4B',
      avgSpread: '0.03%',
      status: 'good',
    },
    { 
      name: 'Uniswap V3', 
      pairs: ['USDC/ETH', 'DAI/ETH', 'USDT/ETH'],
      totalDepth: '$840M',
      avgSpread: '0.05%',
      status: 'fair',
    },
  ];

  // Get current order book data (live updating)
  const currentData = liveOrderBookData[selectedCoin]?.[selectedExchange] || liveOrderBookData['USDT']['Binance'];
  const bidDepth = currentData.bids;
  const askDepth = currentData.asks;

  const maxDepth = Math.max(
    Math.max(...bidDepth.map(d => d.cumulative)),
    Math.max(...askDepth.map(d => d.cumulative))
  );

  // Format depth values for display (input is in thousands)
  const formatDepth = (val: number): string => {
    if (val === 0) return '0';
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}M`; // millions
    if (val >= 100) return `$${Math.round(val)}K`; // thousands
    return `$${val.toFixed(1)}K`;
  };

  // Handler for Download Report button
  const handleDownloadReport = () => {
    // Gather DEX pools data
    const dexPools = [
      { pool: 'USDC/ETH', dex: 'Uniswap V3', tvl: '$524M', volume24h: '$142M', apy: '12.4%' },
      { pool: 'DAI/USDC', dex: 'Curve', tvl: '$312M', volume24h: '$84M', apy: '8.2%' },
      { pool: 'USDT/USDC', dex: 'Uniswap V2', tvl: '$218M', volume24h: '$56M', apy: '6.8%' },
    ];

    // Generate the PDF report
    generateLiquidityReport({
      selectedCoin,
      selectedExchange,
      exchanges,
      bidDepth,
      askDepth,
      dexPools,
      timestamp: new Date(),
    });
  };

  // Handler for Configure Alerts - navigate to alerts page
  const router = useRouter();
  const handleConfigureAlerts = () => {
    router.push('/dashboard/alerts');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Liquidity Monitoring</h1>
            <p className="text-textSecondary">Real-time order book depth across exchanges</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleDownloadReport}>Download Report</Button>
            <Button variant="primary" onClick={handleConfigureAlerts}>Configure Alerts</Button>
          </div>
        </div>

        {/* Exchange Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {exchanges.map((exchange, i) => (
            <Card key={i} hover>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-textPrimary">{exchange.name}</h3>
                    <p className="text-xs text-textSecondary mt-1">{exchange.pairs.length} pairs</p>
                  </div>
                  <Badge 
                    variant={
                      exchange.status === 'excellent' ? 'success' : 
                      exchange.status === 'good' ? 'neutral' : 'warning'
                    }
                  >
                    {exchange.status}
                  </Badge>
                </div>
                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-textSecondary">Total Depth</span>
                    <span className="font-semibold text-textPrimary">{exchange.totalDepth}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-textSecondary">Avg Spread</span>
                    <span className="font-medium text-primary">{exchange.avgSpread}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Book Depth Visualization */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <CardTitle>Aggregated Order Book Depth</CardTitle>
                <div className="flex items-center gap-2 text-xs text-textSecondary">
                  {isLoading ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-warning animate-spin border-2 border-transparent border-t-warning" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span>Live • Updated {secondsSinceUpdate}s ago</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select 
                className="px-3 py-1.5 text-sm border border-border rounded-lg bg-surface"
                value={selectedCoin}
                onChange={(e) => setSelectedCoin(e.target.value)}
              >
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
                <option value="DAI">DAI</option>
              </select>
              <select 
                className="px-3 py-1.5 text-sm border border-border rounded-lg bg-surface"
                value={selectedExchange}
                onChange={(e) => setSelectedExchange(e.target.value)}
              >
                <option value="Binance">Binance</option>
                <option value="Coinbase">Coinbase</option>
                <option value="Kraken">Kraken</option>
              </select>
              <button
                onClick={() => fetchAllOrderBooks()}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm border border-border rounded-lg bg-surface hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                title="Refresh data"
              >
                <svg 
                  className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </CardHeader>
          <CardBody>
            {/* Depth Chart */}
            <div className="relative h-80 bg-gradient-to-b from-gray-900/5 to-transparent rounded-lg p-6">
              {/* Grid lines */}
              <div className="absolute inset-6 flex flex-col justify-between pointer-events-none">
                {[0, 25, 50, 75, 100].map((pct) => (
                  <div key={pct} className="border-t border-gray-200/30 w-full" />
                ))}
              </div>

              {/* Y-axis labels */}
              <div className="absolute left-0 top-6 bottom-6 flex flex-col justify-between text-xs text-textSecondary">
                {[maxDepth, maxDepth * 0.75, maxDepth * 0.5, maxDepth * 0.25, 0].map((val, i) => (
                  <div key={i} className="pr-2 transition-all duration-500">
                    {formatDepth(val)}
                  </div>
                ))}
              </div>

              {/* Main Chart Area */}
              <div className="relative h-full ml-12">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
                  {/* Bid area (green) */}
                  <defs>
                    <linearGradient id={`bidGradient-${selectedCoin}-${selectedExchange}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id={`askGradient-${selectedCoin}-${selectedExchange}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgb(239, 68, 68)" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="rgb(239, 68, 68)" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  
                  {/* Bid area (green) - left side */}
                  <polygon
                    points={
                      bidDepth.map((d, i) => {
                        const x = (i / (bidDepth.length - 1)) * 480; // 0-480 (left half)
                        const y = 400 - ((d.cumulative / maxDepth) * 400);
                        return `${x},${y}`;
                      }).join(' ') + ' 480,400 0,400'
                    }
                    fill={`url(#bidGradient-${selectedCoin}-${selectedExchange})`}
                    stroke="rgb(34, 197, 94)"
                    strokeWidth="3"
                    style={{ transition: 'all 0.5s ease-in-out' }}
                  />

                  {/* Ask area (red) - right side */}
                  <polygon
                    points={
                      askDepth.map((d, i) => {
                        const x = 520 + (i / (askDepth.length - 1)) * 480; // 520-1000 (right half)
                        const y = 400 - ((d.cumulative / maxDepth) * 400);
                        return `${x},${y}`;
                      }).join(' ') + ' 1000,400 520,400'
                    }
                    fill={`url(#askGradient-${selectedCoin}-${selectedExchange})`}
                    stroke="rgb(239, 68, 68)"
                    strokeWidth="3"
                    style={{ transition: 'all 0.5s ease-in-out' }}
                  />

                  {/* Center price line */}
                  <line
                    x1="500"
                    y1="0"
                    x2="500"
                    y2="400"
                    stroke="rgb(59, 130, 246)"
                    strokeWidth="3"
                    strokeDasharray="8 8"
                  />
                </svg>

                {/* Price labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-textSecondary pt-2">
                  <span className="text-success font-medium">${bidDepth[0].price.toFixed(4)}</span>
                  <span className="text-primary font-bold">$1.0000</span>
                  <span className="text-danger font-medium">${askDepth[askDepth.length - 1].price.toFixed(4)}</span>
                </div>
              </div>

              {/* Legend */}
              <div className="absolute top-4 right-4 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-success/60" />
                  <span className="text-textSecondary">Bid Depth</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-danger/60" />
                  <span className="text-textSecondary">Ask Depth</span>
                </div>
              </div>
            </div>

            {/* Depth Table */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <h4 className="text-sm font-semibold text-success mb-3">Bid Depth</h4>
                <div className="space-y-2">
                  {bidDepth.slice(-5).reverse().map((data, i) => (
                    <div key={i} className="flex justify-between text-sm bg-success/5 rounded-lg px-3 py-2 transition-all duration-500">
                      <span className="text-textSecondary">${data.price.toFixed(4)}</span>
                      <span className="font-medium text-textPrimary">{formatDepth(data.cumulative)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-danger mb-3">Ask Depth</h4>
                <div className="space-y-2">
                  {askDepth.slice(0, 5).map((data, i) => (
                    <div key={i} className="flex justify-between text-sm bg-danger/5 rounded-lg px-3 py-2 transition-all duration-500">
                      <span className="text-textSecondary">${data.price.toFixed(4)}</span>
                      <span className="font-medium text-textPrimary">{formatDepth(data.cumulative)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* DEX Liquidity Pools */}
        <Card>
          <CardHeader>
            <CardTitle>DEX Liquidity Pools</CardTitle>
            <span className="text-sm text-textSecondary">Decentralized exchange pool tracking</span>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {[
                { pool: 'USDC/ETH', dex: 'Uniswap V3', tvl: '$524M', volume24h: '$142M', apy: '12.4%' },
                { pool: 'DAI/USDC', dex: 'Curve', tvl: '$312M', volume24h: '$84M', apy: '8.2%' },
                { pool: 'USDT/USDC', dex: 'Uniswap V2', tvl: '$218M', volume24h: '$56M', apy: '6.8%' },
              ].map((pool, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {pool.dex.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-textPrimary">{pool.pool}</div>
                      <div className="text-sm text-textSecondary">{pool.dex}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="text-xs text-textSecondary mb-1">TVL</div>
                      <div className="font-semibold text-textPrimary">{pool.tvl}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-textSecondary mb-1">24h Volume</div>
                      <div className="font-medium text-textPrimary">{pool.volume24h}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-textSecondary mb-1">APY</div>
                      <div className="font-semibold text-success">{pool.apy}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
