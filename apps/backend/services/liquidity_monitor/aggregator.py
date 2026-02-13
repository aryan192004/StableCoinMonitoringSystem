"""
Orderbook Aggregator Module

Aggregates order book data from multiple exchanges into a unified view.
Converts volumes to USD and samples to specified depth levels.
"""

from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import numpy as np


def convert_volume_to_usd(
    orderbook: Dict[str, Any], current_price: float, side: str = "both"
) -> Dict[str, Any]:
    """
    Convert base-asset volumes to USD volumes

    Args:
        orderbook: Orderbook with {price, volume} entries
        current_price: Current market price for conversion
        side: "bids", "asks", or "both"

    Returns:
        Orderbook with volume_usd field added
    """
    result = {"timestamp": orderbook.get("timestamp")}

    if side in ["bids", "both"] and "bids" in orderbook:
        result["bids"] = [
            {
                "price": bid["price"],
                "volume": bid["volume"],
                "volume_usd": bid["volume"]
                * bid["price"],  # Use actual bid price for USD conversion
            }
            for bid in orderbook["bids"]
        ]

    if side in ["asks", "both"] and "asks" in orderbook:
        result["asks"] = [
            {
                "price": ask["price"],
                "volume": ask["volume"],
                "volume_usd": ask["volume"]
                * ask["price"],  # Use actual ask price for USD conversion
            }
            for ask in orderbook["asks"]
        ]

    return result


def aggregate_orderbooks(
    orderbooks: Dict[str, Dict[str, Any]], depth_levels: int = 50, method: str = "sum"
) -> Dict[str, Any]:
    """
    Aggregate order books from multiple exchanges

    Args:
        orderbooks: Dict of {exchange_name: orderbook_data}
        depth_levels: Number of price levels to return
        method: Aggregation method ("sum" for summing volumes)

    Returns:
        Aggregated orderbook with sampled depth levels
    """
    if not orderbooks:
        return {
            "bids": [],
            "asks": [],
            "per_exchange": {},
            "aggregated_at": datetime.utcnow().isoformat(),
        }

    # Collect all bids and asks with USD volumes across exchanges
    all_bids = []
    all_asks = []

    for exchange, orderbook in orderbooks.items():
        if "bids" in orderbook:
            for bid in orderbook["bids"]:
                all_bids.append(
                    {
                        "price": bid["price"],
                        "volume_usd": bid.get("volume_usd", bid["volume"] * bid["price"]),
                        "exchange": exchange,
                    }
                )

        if "asks" in orderbook:
            for ask in orderbook["asks"]:
                all_asks.append(
                    {
                        "price": ask["price"],
                        "volume_usd": ask.get("volume_usd", ask["volume"] * ask["price"]),
                        "exchange": exchange,
                    }
                )

    # Sort bids (descending) and asks (ascending)
    all_bids.sort(key=lambda x: x["price"], reverse=True)
    all_asks.sort(key=lambda x: x["price"])

    # Aggregate by price levels (sum volumes at same price)
    if method == "sum":
        aggregated_bids = _aggregate_by_price(all_bids)
        aggregated_asks = _aggregate_by_price(all_asks)
    else:
        # Default to sum
        aggregated_bids = _aggregate_by_price(all_bids)
        aggregated_asks = _aggregate_by_price(all_asks)

    # Sample to requested depth levels
    sampled_bids = _sample_orderbook_side(aggregated_bids, depth_levels, is_bid=True)
    sampled_asks = _sample_orderbook_side(aggregated_asks, depth_levels, is_bid=False)

    return {
        "bids": sampled_bids,
        "asks": sampled_asks,
        "per_exchange": {
            exchange: {
                "bids": orderbook.get("bids", [])[:10],  # Keep top 10 for breakdown
                "asks": orderbook.get("asks", [])[:10],
            }
            for exchange, orderbook in orderbooks.items()
        },
        "aggregated_at": datetime.utcnow().isoformat(),
    }


def _aggregate_by_price(orders: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Aggregate orders at the same price level

    Args:
        orders: List of orders with price and volume_usd

    Returns:
        List of aggregated orders
    """
    price_map = {}

    for order in orders:
        price = order["price"]
        if price not in price_map:
            price_map[price] = {"price": price, "volume_usd": 0}
        price_map[price]["volume_usd"] += order["volume_usd"]

    return list(price_map.values())


def _sample_orderbook_side(
    orders: List[Dict[str, Any]], depth_levels: int, is_bid: bool
) -> List[Dict[str, Any]]:
    """
    Sample orderbook side to specified depth levels with cumulative USD depth

    Args:
        orders: List of orders sorted by price
        depth_levels: Number of levels to sample
        is_bid: True for bids, False for asks

    Returns:
        List of sampled orders with cumulative depth
    """
    if not orders:
        return []

    # Calculate cumulative depth
    cumulative = 0
    orders_with_cumulative = []

    for order in orders:
        cumulative += order["volume_usd"]
        orders_with_cumulative.append(
            {
                "price": order["price"],
                "volume_usd": order["volume_usd"],
                "cumulative_usd": cumulative,
            }
        )

    # Sample evenly across the orderbook
    if len(orders_with_cumulative) <= depth_levels:
        return orders_with_cumulative

    # Sample at evenly distributed indices
    sampled = []
    step = len(orders_with_cumulative) / depth_levels

    for i in range(depth_levels):
        idx = int(i * step)
        if idx < len(orders_with_cumulative):
            sampled.append(orders_with_cumulative[idx])

    return sampled


def calculate_aggregated_metrics(aggregated_orderbook: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate summary metrics from aggregated orderbook

    Args:
        aggregated_orderbook: Aggregated orderbook data

    Returns:
        Dict with summary metrics
    """
    bids = aggregated_orderbook.get("bids", [])
    asks = aggregated_orderbook.get("asks", [])

    if not bids or not asks:
        return {
            "total_bid_liquidity_usd": 0,
            "total_ask_liquidity_usd": 0,
            "total_liquidity_usd": 0,
            "spread": 0,
            "spread_bps": 0,
            "mid_price": 1.0,
        }

    # Get best bid and ask
    best_bid = bids[0]["price"] if bids else 0
    best_ask = asks[0]["price"] if asks else 0
    mid_price = (best_bid + best_ask) / 2 if best_bid and best_ask else 1.0

    # Calculate spread
    spread = best_ask - best_bid if best_ask and best_bid else 0
    spread_bps = (spread / mid_price * 10000) if mid_price > 0 else 0

    # Sum total liquidity (top levels or cumulative)
    total_bid_liquidity = bids[-1].get("cumulative_usd", 0) if bids else 0
    total_ask_liquidity = asks[-1].get("cumulative_usd", 0) if asks else 0

    return {
        "total_bid_liquidity_usd": round(total_bid_liquidity, 2),
        "total_ask_liquidity_usd": round(total_ask_liquidity, 2),
        "total_liquidity_usd": round(total_bid_liquidity + total_ask_liquidity, 2),
        "spread": round(spread, 6),
        "spread_bps": round(spread_bps, 2),
        "mid_price": round(mid_price, 6),
        "best_bid": round(best_bid, 6),
        "best_ask": round(best_ask, 6),
    }
