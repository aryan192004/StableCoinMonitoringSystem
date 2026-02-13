"""
DefiLlama API Client for Stablecoin Data
Fetches real-time and historical stablecoin data from DefiLlama
"""

import httpx
from typing import Dict, List, Optional, Any
from datetime import datetime
import asyncio
from functools import lru_cache


class DefiLlamaClient:
    """
    Client for DefiLlama Stablecoin API
    Provides access to stablecoin prices, market caps, and historical data
    """

    STABLECOIN_BASE_URL = "https://stablecoins.llama.fi"
    PROTOCOL_BASE_URL = "https://api.llama.fi"

    def __init__(self, timeout: int = 30):
        self.timeout = timeout
        self.session: Optional[httpx.AsyncClient] = None

    async def __aenter__(self):
        self.session = httpx.AsyncClient(timeout=self.timeout)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.aclose()

    async def _get(self, url: str) -> Dict[str, Any]:
        """Internal method to make GET requests"""
        if not self.session:
            self.session = httpx.AsyncClient(timeout=self.timeout)

        try:
            response = await self.session.get(url)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            print(f"HTTP error fetching {url}: {e}")
            raise
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            raise

    async def get_all_stablecoins(self, include_prices: bool = True) -> Dict[str, Any]:
        """
        Get all stablecoins with prices, market cap, circulating supply, and peg info

        Args:
            include_prices: Include current price data

        Returns:
            Dict containing:
            - peggedAssets: List of all stablecoins with their data
            - Each asset includes: id, name, symbol, price, circulating, marketCap, etc.
        """
        url = f"{self.STABLECOIN_BASE_URL}/stablecoins"
        if include_prices:
            url += "?includePrices=true"

        return await self._get(url)

    async def get_stablecoin_history(self, stablecoin_id: int) -> Dict[str, Any]:
        """
        Get historical chart data for a specific stablecoin

        Args:
            stablecoin_id: The DefiLlama ID for the stablecoin (e.g., 1 for USDT)

        Returns:
            Dict containing:
            - id: Stablecoin ID
            - name: Stablecoin name
            - symbol: Token symbol
            - gecko_id: CoinGecko ID
            - pegType: Type of peg (e.g., USD)
            - priceSource: Source of price data
            - pegMechanism: How the peg is maintained
            - circulating: Historical circulating supply data
            - totalCirculating: Aggregate circulating metrics
            - chainCirculating: Breakdown by blockchain
        """
        url = f"{self.STABLECOIN_BASE_URL}/stablecoin/{stablecoin_id}"
        return await self._get(url)

    async def get_all_stablecoin_charts(self) -> Dict[str, Any]:
        """
        Get historical chart data for all stablecoins

        Returns:
            Dict containing time series data with:
            - Date timestamps
            - Supply trends
            - Aggregate metrics across all stablecoins
        """
        url = f"{self.STABLECOIN_BASE_URL}/stablecoincharts/all"
        return await self._get(url)

    async def get_protocols(self) -> List[Dict[str, Any]]:
        """
        Get list of all DeFi protocols with TVL data

        Returns:
            List of protocols with TVL, category, and other metrics
        """
        url = f"{self.PROTOCOL_BASE_URL}/protocols"
        return await self._get(url)

    async def get_protocol_details(self, protocol_slug: str) -> Dict[str, Any]:
        """
        Get detailed information for a specific protocol

        Args:
            protocol_slug: Protocol identifier (e.g., 'uniswap', 'aave')

        Returns:
            Dict with detailed protocol data including TVL history
        """
        url = f"{self.PROTOCOL_BASE_URL}/protocol/{protocol_slug}"
        return await self._get(url)

    async def get_stablecoin_by_symbol(self, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Get stablecoin data by symbol (e.g., 'USDT', 'USDC')

        Args:
            symbol: Stablecoin symbol (case-insensitive)

        Returns:
            Stablecoin data dict or None if not found
        """
        all_data = await self.get_all_stablecoins(include_prices=True)
        symbol_upper = symbol.upper()

        for asset in all_data.get("peggedAssets", []):
            if asset.get("symbol", "").upper() == symbol_upper:
                return asset

        return None

    async def get_market_cap_trends(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get top stablecoins by market cap with trend data

        Args:
            limit: Number of top stablecoins to return

        Returns:
            List of top stablecoins sorted by market cap
        """
        all_data = await self.get_all_stablecoins(include_prices=True)
        assets = all_data.get("peggedAssets", [])

        # Sort by market cap (circulating.peggedUSD)
        sorted_assets = sorted(
            assets, key=lambda x: x.get("circulating", {}).get("peggedUSD", 0), reverse=True
        )

        return sorted_assets[:limit]

    async def get_stablecoin_chains(self, stablecoin_id: int) -> Dict[str, float]:
        """
        Get chain breakdown for a specific stablecoin

        Args:
            stablecoin_id: The DefiLlama ID for the stablecoin

        Returns:
            Dict mapping chain names to circulating amounts
        """
        data = await self.get_stablecoin_history(stablecoin_id)
        chains = {}

        chain_circulating = data.get("chainCirculating", {})
        for chain, chain_data in chain_circulating.items():
            # Get the latest value
            if chain_data and isinstance(chain_data, list) and len(chain_data) > 0:
                latest = chain_data[-1]
                if isinstance(latest, dict) and "circulating" in latest:
                    chains[chain] = latest["circulating"].get("peggedUSD", 0)

        return chains


# Stablecoin ID mapping (common stablecoins)
STABLECOIN_IDS = {
    "USDT": 1,
    "USDC": 2,
    "DAI": 3,
    "BUSD": 4,
    "FRAX": 5,
    "TUSD": 6,
    "USDD": 7,
    "USDP": 8,
    "GUSD": 9,
    "LUSD": 10,
}


def get_stablecoin_id(symbol: str) -> Optional[int]:
    """
    Get DefiLlama stablecoin ID from symbol

    Args:
        symbol: Stablecoin symbol (case-insensitive)

    Returns:
        Stablecoin ID or None if not found
    """
    return STABLECOIN_IDS.get(symbol.upper())


async def example_usage():
    """Example usage of DefiLlamaClient"""
    async with DefiLlamaClient() as client:
        # Get all stablecoins
        print("Fetching all stablecoins...")
        all_stablecoins = await client.get_all_stablecoins(include_prices=True)
        print(f"Found {len(all_stablecoins.get('peggedAssets', []))} stablecoins")

        # Get USDT history
        print("\nFetching USDT history...")
        usdt_history = await client.get_stablecoin_history(1)
        print(f"USDT: {usdt_history.get('name')} - {usdt_history.get('symbol')}")

        # Get market cap trends
        print("\nFetching top stablecoins by market cap...")
        top_stablecoins = await client.get_market_cap_trends(limit=5)
        for i, asset in enumerate(top_stablecoins, 1):
            name = asset.get("name", "Unknown")
            mcap = asset.get("circulating", {}).get("peggedUSD", 0)
            print(f"{i}. {name}: ${mcap:,.0f}")


if __name__ == "__main__":
    asyncio.run(example_usage())
