"""
CoinAPI Client for Real-Time Market Data
Handles rate limiting, caching, and error handling
"""

import aiohttp
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import os
from functools import lru_cache


class CoinAPIClient:
    """
    Client for CoinAPI.io - Primary data source for multi-exchange data
    """

    BASE_URL = "https://rest.coinapi.io/v1"

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {"X-CoinAPI-Key": api_key}
        self.session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession(headers=self.headers)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def get_exchange_rate(self, asset_base: str, asset_quote: str = "USD") -> Dict[str, Any]:
        """
        Get current exchange rate for stablecoin
        All values replaced with '-'
        """
        return {
            "asset": '-',
            "price": '-',
            "timestamp": '-',
        }

    async def get_multi_exchange_rates(
        self, asset_base: str, exchanges: List[str] = ["BINANCE", "COINBASE", "KRAKEN"]
    ) -> Dict[str, Dict[str, Any]]:
        """
        Get prices from multiple exchanges for comparison
        All values replaced with '-'
        """
        return {exchange: {"price": '-', "timestamp": '-', "volume_24h": '-'} for exchange in exchanges}

    async def get_orderbook_depth(self, symbol_id: str, limit: int = 100) -> Dict[str, Any]:
        """
        Get order book depth for liquidity analysis
        All values replaced with '-'
        """
        return {"bids": '-', "asks": '-', "timestamp": '-'}

    async def get_ohlcv_history(
        self,
        symbol_id: str,
        period_id: str = "1MIN",
        limit: int = 1440,  # 24 hours of 1-minute data
    ) -> List[Dict[str, Any]]:
        """
        Get historical OHLCV data for volatility and volume analysis
        All values replaced with '-'
        """
        return ['-']

    def _generate_synthetic_orderbook(self) -> Dict[str, Any]:
        """
        Generate synthetic order book for demo/testing
        """
        import random

        mid_price = 1.0
        bids = []
        asks = []

        # Generate 50 levels on each side
        for i in range(50):
            bid_price = mid_price - (i + 1) * 0.0001  # 1 bps increments
            ask_price = mid_price + (i + 1) * 0.0001

            bid_volume = random.uniform(10000, 500000) * (1 - i * 0.02)  # Decreasing liquidity
            ask_volume = random.uniform(10000, 500000) * (1 - i * 0.02)

            bids.append({"price": bid_price, "volume": bid_volume})
            asks.append({"price": ask_price, "volume": ask_volume})

        return {"bids": bids, "asks": asks, "timestamp": datetime.utcnow().isoformat()}

    def _generate_synthetic_ohlcv(self, limit: int) -> List[Dict[str, Any]]:
        """
        Generate synthetic OHLCV data for demo/testing
        """
        import random

        data = []
        base_price = 1.0

        for i in range(limit):
            # Random walk with mean reversion
            change = random.gauss(0, 0.0005)  # 5 bps std
            price = base_price + change

            # Ensure price stays near $1
            if abs(price - 1.0) > 0.02:
                price = 1.0 + random.uniform(-0.01, 0.01)

            data.append(
                {
                    "time_period_start": (
                        datetime.utcnow() - timedelta(minutes=limit - i)
                    ).isoformat(),
                    "price_open": price,
                    "price_high": price + random.uniform(0, 0.0002),
                    "price_low": price - random.uniform(0, 0.0002),
                    "price_close": price,
                    "volume_traded": random.uniform(1e6, 10e6),
                }
            )

            base_price = price

        return data


class BinanceClient:
    """
    Binance API Client - Backup data source
    """

    BASE_URL = "https://api.binance.com"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def get_orderbook_depth(self, symbol: str, limit: int = 100) -> Dict[str, Any]:
        """
        Get order book depth from Binance

        Endpoint: GET /api/v3/depth
        Usage: Backup for CoinAPI, validate liquidity data

        Example: symbol="USDTUSDC", limit=100
        """
        url = f"{self.BASE_URL}/api/v3/depth"
        params = {"symbol": symbol, "limit": limit}

        async with self.session.get(url, params=params) as response:
            if response.status == 200:
                data = await response.json()

                # Convert to standardized format
                return {
                    "bids": [
                        {"price": float(bid[0]), "volume": float(bid[1])}
                        for bid in data.get("bids", [])
                    ],
                    "asks": [
                        {"price": float(ask[0]), "volume": float(ask[1])}
                        for ask in data.get("asks", [])
                    ],
                    "timestamp": datetime.utcnow().isoformat(),
                }
            else:
                raise Exception(f"Binance API error: {response.status}")

    async def get_ticker_24h(self, symbol: str) -> Dict[str, Any]:
        """
        Get 24h ticker statistics

        Usage: Volume spike detection, price volatility
        """
        url = f"{self.BASE_URL}/api/v3/ticker/24hr"
        params = {"symbol": symbol}

        async with self.session.get(url, params=params) as response:
            if response.status == 200:
                data = await response.json()
                return {
                    "price": float(data.get("lastPrice", 1.0)),
                    "price_change_24h": float(data.get("priceChangePercent", 0)),
                    "volume_24h": float(data.get("volume", 0)),
                    "high_24h": float(data.get("highPrice", 1.0)),
                    "low_24h": float(data.get("lowPrice", 1.0)),
                    "timestamp": datetime.utcnow().isoformat(),
                }
            else:
                raise Exception(f"Binance API error: {response.status}")


# Example usage
if __name__ == "__main__":

    async def main():
        # Test CoinAPI client
        coinapi_key = os.getenv("COINAPI_KEY", "YOUR_API_KEY_HERE")

        async with CoinAPIClient(coinapi_key) as client:
            # Get current price
            rate = await client.get_exchange_rate("USDT", "USD")
            print(f"USDT/USD: ${rate['price']:.4f}")

            # Get multi-exchange prices
            multi_ex = await client.get_multi_exchange_rates("USDT")
            print(f"\nMulti-Exchange Prices:")
            for exchange, data in multi_ex.items():
                print(f"  {exchange}: ${data['price']:.4f}")

            # Get order book
            orderbook = await client.get_orderbook_depth("BITSTAMP_SPOT_USDT_USD")
            print(f"\nOrder Book Depth:")
            print(f"  Top Bid: ${orderbook['bids'][0]['price']:.4f}")
            print(f"  Top Ask: ${orderbook['asks'][0]['price']:.4f}")

    asyncio.run(main())
