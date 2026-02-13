"""
Market Data Router - CoinGecko and Binance Integration
Provides endpoints for historical price data and real-time prices
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api_clients import CoinGeckoClient, BinanceClient, COINGECKO_ID_MAP

router = APIRouter()


@router.get("/market-chart")
async def get_market_chart(
    coin_id: str = Query(..., description="CoinGecko coin ID (e.g., 'tether', 'usd-coin')"),
    vs_currency: str = Query("usd", description="Target currency"),
    days: int = Query(7, description="Number of days (1, 7, 14, 30, 90, 180, 365)"),
):
    """
    Get historical market data from CoinGecko

    Returns price, market cap, and volume history for charting
    """
    try:
        async with CoinGeckoClient() as client:
            data = await client.get_market_chart(coin_id, vs_currency, days)
            return {
                "coin_id": coin_id,
                "vs_currency": vs_currency,
                "days": days,
                "prices": data["prices"],
                "market_caps": data["market_caps"],
                "total_volumes": data["total_volumes"],
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch market data: {str(e)}")


@router.get("/price")
async def get_current_price(
    coin_ids: str = Query(..., description="Comma-separated CoinGecko coin IDs"),
    vs_currencies: str = Query("usd", description="Comma-separated target currencies"),
):
    """
    Get current prices for multiple coins from CoinGecko
    """
    try:
        coin_id_list = [c.strip() for c in coin_ids.split(",")]
        vs_currency_list = [c.strip() for c in vs_currencies.split(",")]

        async with CoinGeckoClient() as client:
            prices = await client.get_price(coin_id_list, vs_currency_list)
            return prices
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch prices: {str(e)}")


@router.get("/binance/ticker")
async def get_binance_ticker(
    symbol: str = Query(..., description="Trading pair symbol (e.g., 'USDTUSDC', 'BTCUSDT')"),
):
    """
    Get current price from Binance
    """
    try:
        async with BinanceClient() as client:
            ticker = await client.get_ticker_price(symbol)
            return ticker
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch Binance ticker: {str(e)}")


@router.get("/binance/ticker-24h")
async def get_binance_ticker_24h(
    symbol: str = Query(..., description="Trading pair symbol"),
):
    """
    Get 24h ticker statistics from Binance
    """
    try:
        async with BinanceClient() as client:
            ticker = await client.get_ticker_24h(symbol)
            return ticker
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch 24h ticker: {str(e)}")


@router.get("/binance/klines")
async def get_binance_klines(
    symbol: str = Query(..., description="Trading pair symbol (e.g., 'USDTUSDT', 'USDCUSDT')"),
    interval: str = Query("1d", description="Kline interval (1m, 1h, 1d, etc.)"),
    limit: int = Query(100, description="Number of klines (max 1000)"),
):
    """
    Get candlestick/klines data from Binance for charting

    Returns OHLCV data for the specified symbol and interval
    """
    try:
        async with BinanceClient() as client:
            klines = await client.get_klines(symbol, interval, limit)
            return {
                "symbol": symbol,
                "interval": interval,
                "limit": limit,
                "klines": klines,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch klines: {str(e)}")


@router.get("/compare-peg-deviation")
async def compare_peg_deviation(
    symbols: str = Query(
        ..., description="Comma-separated stablecoin symbols (e.g., 'USDT,USDC,DAI')"
    ),
    days: int = Query(7, description="Number of days for historical data"),
):
    """
    Compare peg deviations across multiple stablecoins

    Returns historical price data and deviation statistics for comparison
    """
    try:
        symbol_list = [s.strip().upper() for s in symbols.split(",")]
        results = []

        async with CoinGeckoClient() as client:
            for symbol in symbol_list:
                coin_id = COINGECKO_ID_MAP.get(symbol)
                if not coin_id:
                    continue

                data = await client.get_market_chart(coin_id, "usd", days)

                # Calculate deviation statistics
                prices = [price[1] for price in data["prices"]]
                deviations = [((p - 1.0) / 1.0) * 100 for p in prices]

                current_price = prices[-1] if prices else 1.0
                current_deviation = deviations[-1] if deviations else 0.0
                max_deviation = max(abs(d) for d in deviations) if deviations else 0.0
                avg_deviation = (
                    sum(abs(d) for d in deviations) / len(deviations) if deviations else 0.0
                )

                results.append(
                    {
                        "symbol": symbol,
                        "coin_id": coin_id,
                        "current_price": current_price,
                        "current_deviation": current_deviation,
                        "max_deviation": max_deviation,
                        "avg_deviation": avg_deviation,
                        "price_history": data["prices"],
                        "deviation_history": [
                            [data["prices"][i][0], deviations[i]] for i in range(len(deviations))
                        ],
                    }
                )

        return {
            "symbols": symbol_list,
            "days": days,
            "comparison": results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compare peg deviations: {str(e)}")
