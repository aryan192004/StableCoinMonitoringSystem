"""
Quick Test Script for DefiLlama Integration
Run this to verify all endpoints are working
"""

import asyncio
import sys
from pathlib import Path

# Add services directory to path
services_dir = Path(__file__).parent
sys.path.insert(0, str(services_dir))

from defillama_client import DefiLlamaClient


async def test_all_endpoints():
    """Test all DefiLlama endpoints"""

    print("=" * 70)
    print("DEFILLAMA API INTEGRATION TEST")
    print("=" * 70)

    async with DefiLlamaClient(timeout=30) as client:

        # Test 1: Get all stablecoins
        print("\n[*] Test 1: Get All Stablecoins")
        print("-" * 70)
        try:
            data = await client.get_all_stablecoins(include_prices=True)
            count = len(data.get("peggedAssets", []))
            print(f"[OK] SUCCESS: Retrieved {count} stablecoins")
        except Exception as e:
            print(f"[ERROR] FAILED: {e}")

        # Test 2: Get top stablecoins
        print("\n[*] Test 2: Get Top 5 Stablecoins by Market Cap")
        print("-" * 70)
        try:
            top = await client.get_market_cap_trends(limit=5)
            print(f"[OK] SUCCESS: Retrieved {len(top)} top stablecoins")
            for i, coin in enumerate(top[:5], 1):
                name = coin.get("name", "Unknown")
                symbol = coin.get("symbol", "?")
                mcap = coin.get("circulating", {}).get("peggedUSD", 0)
                print(f"   {i}. {symbol:6} - {name:30} ${mcap:,.0f}")
        except Exception as e:
            print(f"[ERROR] FAILED: {e}")

        # Test 3: Get USDT by symbol
        print("\n[*] Test 3: Get USDT by Symbol")
        print("-" * 70)
        try:
            usdt = await client.get_stablecoin_by_symbol("USDT")
            if usdt:
                print(f"[OK] SUCCESS: Found USDT")
                print(f"   Name: {usdt.get('name')}")
                print(f"   Symbol: {usdt.get('symbol')}")
                print(f"   Price: ${usdt.get('price', 0):.6f}")
                print(f"   Market Cap: ${usdt.get('circulating', {}).get('peggedUSD', 0):,.2f}")
            else:
                print(f"[ERROR] FAILED: USDT not found")
        except Exception as e:
            print(f"[ERROR] FAILED: {e}")

        # Test 4: Get USDT history
        print("\n[*] Test 4: Get USDT Historical Data")
        print("-" * 70)
        try:
            history = await client.get_stablecoin_history(1)  # USDT ID = 1
            print(f"[OK] SUCCESS: Retrieved historical data for {history.get('name')}")
            print(f"   Symbol: {history.get('symbol')}")
            print(f"   Peg Type: {history.get('pegType')}")
            print(f"   Peg Mechanism: {history.get('pegMechanism')}")
        except Exception as e:
            print(f"[ERROR] FAILED: {e}")

        # Test 5: Get chain breakdown
        print("\n[*] Test 5: Get USDT Chain Breakdown")
        print("-" * 70)
        try:
            chains = await client.get_stablecoin_chains(1)  # USDT ID = 1
            print(f"[OK] SUCCESS: Retrieved chain breakdown")
            top_chains = sorted(chains.items(), key=lambda x: x[1], reverse=True)[:5]
            for chain, amount in top_chains:
                print(f"   {chain:20} ${amount:,.0f}")
        except Exception as e:
            print(f"[ERROR] FAILED: {e}")

        # Test 6: Get all stablecoin charts
        print("\n[*] Test 6: Get Aggregate Stablecoin Charts")
        print("-" * 70)
        try:
            charts = await client.get_all_stablecoin_charts()
            print(f"[OK] SUCCESS: Retrieved aggregate charts")
            if isinstance(charts, list) and len(charts) > 0:
                print(f"   Data points: {len(charts)}")
        except Exception as e:
            print(f"[ERROR] FAILED: {e}")

        # Test 7: Get protocols
        print("\n[*] Test 7: Get DeFi Protocols")
        print("-" * 70)
        try:
            protocols = await client.get_protocols()
            print(f"[OK] SUCCESS: Retrieved {len(protocols)} protocols")
        except Exception as e:
            print(f"[ERROR] FAILED: {e}")

    print("\n" + "=" * 70)
    print("TEST COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(test_all_endpoints())
