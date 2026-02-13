"""
Feature Engineering Pipeline for Risk Scoring
Implements 7 core features for ML model + liquidity prediction & anomaly detection features
"""

import numpy as np
from typing import Dict, List, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from collections import deque


@dataclass
class RiskFeatures:
    """
    Container for all computed risk features
    """

    peg_deviation: float
    deviation_duration: float
    volatility: float
    liquidity_score: float
    orderbook_imbalance: float
    cross_exchange_spread: float
    volume_anomaly_score: float


@dataclass
class LiquidityFeatures:
    """
    Container for liquidity prediction features
    """

    liquidity_depth: float
    order_book_depth: float
    volume: float
    spread: float
    volatility: float

    def to_array(self) -> np.ndarray:
        """Convert to numpy array for LSTM model input"""
        return np.array(
            [self.liquidity_depth, self.order_book_depth, self.volume, self.spread, self.volatility]
        )


@dataclass
class AnomalyFeatures:
    """
    Container for anomaly detection features
    """

    liquidity_depth: float
    liquidity_change_pct: float
    volume_zscore: float
    price_change_pct: float
    orderbook_imbalance: float
    cross_exchange_spread: float
    volatility_spike: float
    bid_ask_spread: float

    def to_array(self) -> np.ndarray:
        """Convert to numpy array for anomaly model input"""
        return np.array(
            [
                self.liquidity_depth,
                self.liquidity_change_pct,
                self.volume_zscore,
                self.price_change_pct,
                self.orderbook_imbalance,
                self.cross_exchange_spread,
                self.volatility_spike,
                self.bid_ask_spread,
            ]
        )

    def to_array(self) -> np.ndarray:
        """Convert to numpy array for ML model input"""
        return np.array(
            [
                self.peg_deviation,
                self.deviation_duration,
                self.volatility,
                self.liquidity_score,
                self.orderbook_imbalance,
                self.cross_exchange_spread,
                self.volume_anomaly_score,
            ]
        ).reshape(1, -1)

    def to_dict(self) -> Dict[str, float]:
        """Convert to dictionary for API response"""
        return {
            "peg_deviation_score": abs(self.peg_deviation) / 2.0,  # Normalize to 0-1
            "liquidity_stress_score": 1 - min(self.liquidity_score, 1.0),
            "volatility_score": min(self.volatility / 0.02, 1.0),
            "imbalance_score": abs(self.orderbook_imbalance),
            "spread_score": min(self.cross_exchange_spread / 0.01, 1.0),
            "volume_anomaly_score": min(self.volume_anomaly_score / 5.0, 1.0),
            "duration_score": min(self.deviation_duration / 180.0, 1.0),  # 3 hours max
        }


class FeatureEngineer:
    """
    Computes all 7 risk features from raw market data
    Also computes liquidity prediction and anomaly detection features
    """

    def __init__(self):
        self.deviation_start_time: Dict[str, datetime] = {}
        self.historical_volumes: Dict[str, List[float]] = {}
        self.historical_liquidity: Dict[str, deque] = {}
        self.historical_prices: Dict[str, deque] = {}
        self.previous_liquidity: Dict[str, float] = {}
        self.previous_price: Dict[str, float] = {}

    def compute_all_features(
        self,
        current_price: float,
        orderbook: Dict[str, Any],
        ohlcv_history: List[Dict[str, Any]],
        multi_exchange_prices: Dict[str, Dict[str, Any]],
        stablecoin: str,
    ) -> RiskFeatures:
        """
        Compute all 7 features from raw data

        Args:
            current_price: Current price of stablecoin
            orderbook: Order book data (bids/asks)
            ohlcv_history: Historical OHLCV data (24h)
            multi_exchange_prices: Prices across exchanges
            stablecoin: Stablecoin identifier

        Returns:
            RiskFeatures object with all computed features
        """
        # Feature 1: Peg Deviation
        peg_deviation = self.calculate_peg_deviation(current_price)

        # Feature 2: Deviation Duration
        deviation_duration = self.calculate_deviation_duration(peg_deviation, stablecoin)

        # Feature 3: Volatility
        volatility = self.calculate_volatility(ohlcv_history)

        # Feature 4: Liquidity Score
        liquidity_score = self.calculate_liquidity_score(orderbook)

        # Feature 5: Order Book Imbalance
        orderbook_imbalance = self.calculate_orderbook_imbalance(orderbook)

        # Feature 6: Cross-Exchange Spread
        cross_exchange_spread = self.calculate_cross_exchange_spread(multi_exchange_prices)

        # Feature 7: Volume Anomaly Score
        volume_anomaly_score = self.calculate_volume_anomaly(ohlcv_history, stablecoin)

        return RiskFeatures(
            peg_deviation=peg_deviation,
            deviation_duration=deviation_duration,
            volatility=volatility,
            liquidity_score=liquidity_score,
            orderbook_imbalance=orderbook_imbalance,
            cross_exchange_spread=cross_exchange_spread,
            volume_anomaly_score=volume_anomaly_score,
        )

    def calculate_peg_deviation(self, current_price: float) -> float:
        """
        Feature 1: Peg Deviation %

        Formula: ((current_price - 1.0) / 1.0) * 100

        Range: typically [-2%, +2%], crisis > 5%

        Example:
            Price: $0.9880 -> Deviation: -1.20%
            Price: $1.0120 -> Deviation: +1.20%
        """
        peg_deviation = ((current_price - 1.0) / 1.0) * 100
        return round(peg_deviation, 4)

    def calculate_deviation_duration(
        self, peg_deviation: float, stablecoin: str, threshold: float = 0.5
    ) -> float:
        """
        Feature 2: Deviation Duration (minutes)

        Tracks how long the price has been depegged beyond threshold

        Logic:
        - If |deviation| > threshold: increment duration
        - If |deviation| <= threshold: reset duration

        Returns: Minutes since deviation started
        """
        if abs(peg_deviation) > threshold:
            # Start or continue tracking
            if stablecoin not in self.deviation_start_time:
                self.deviation_start_time[stablecoin] = datetime.utcnow()

            duration = (
                datetime.utcnow() - self.deviation_start_time[stablecoin]
            ).total_seconds() / 60
            return round(duration, 2)
        else:
            # Reset if back in range
            self.deviation_start_time.pop(stablecoin, None)
            return 0.0

    def calculate_volatility(self, ohlcv_history: List[Dict[str, Any]]) -> float:
        """
        Feature 3: Volatility Score (Rolling Std)

        Formula: σ(prices) / μ(prices)

        Uses 24h of 1-minute OHLCV data (1440 candles)

        Returns: Coefficient of variation (normalized volatility)

        Interpretation:
            0.001 = Very stable (0.1% std)
            0.01 = Normal (1% std)
            0.02+ = High volatility
        """
        if not ohlcv_history or len(ohlcv_history) < 10:
            return 0.0

        # Extract close prices
        prices = [candle.get("price_close", 1.0) for candle in ohlcv_history]

        # Calculate coefficient of variation
        mean_price = np.mean(prices)
        std_price = np.std(prices)

        volatility = std_price / mean_price if mean_price > 0 else 0.0
        return round(volatility, 6)

    def calculate_liquidity_score(self, orderbook: Dict[str, Any], depth_levels: int = 10) -> float:
        """
        Feature 4: Liquidity Depth Score

        Formula:
            total_depth = Σ(bid_volumes[0:10]) + Σ(ask_volumes[0:10])
            liquidity_score = total_depth / 10M  # Normalize

        Interpretation:
            1.0+ = Healthy liquidity (>$10M depth)
            0.5 = Moderate
            0.3 = Stressed
            <0.1 = Critical (thin order book)

        Returns: Normalized liquidity score [0, inf)
        """
        bids = orderbook.get("bids", [])
        asks = orderbook.get("asks", [])

        if not bids or not asks:
            return 0.1  # Critical if no order book

        # Sum volumes for top N levels
        bid_depth = sum(bid.get("volume", 0) for bid in bids[:depth_levels])
        ask_depth = sum(ask.get("volume", 0) for ask in asks[:depth_levels])

        total_depth = bid_depth + ask_depth

        # Normalize by $10M baseline
        liquidity_score = total_depth / 10_000_000

        return round(liquidity_score, 4)

    def calculate_orderbook_imbalance(self, orderbook: Dict[str, Any]) -> float:
        """
        Feature 5: Order Book Imbalance Ratio

        Formula:
            imbalance = (Σ bid_volumes - Σ ask_volumes) / (Σ bid_volumes + Σ ask_volumes)

        Range: [-1, +1]
            -1 = All sell pressure (no bids)
            0 = Balanced
            +1 = All buy pressure (no asks)

        Interpretation:
            < -0.5 = Strong sell pressure (RISK!)
            -0.2 to +0.2 = Normal
            > +0.5 = Strong buy pressure
        """
        bids = orderbook.get("bids", [])
        asks = orderbook.get("asks", [])

        if not bids and not asks:
            return 0.0

        bid_volume = sum(bid.get("volume", 0) for bid in bids)
        ask_volume = sum(ask.get("volume", 0) for ask in asks)

        total_volume = bid_volume + ask_volume

        if total_volume == 0:
            return 0.0

        imbalance = (bid_volume - ask_volume) / total_volume
        return round(imbalance, 4)

    def calculate_cross_exchange_spread(
        self, multi_exchange_prices: Dict[str, Dict[str, Any]]
    ) -> float:
        """
        Feature 6: Cross-Exchange Spread

        Formula:
            max_price = max(binance, coinbase, kraken)
            min_price = min(binance, coinbase, kraken)
            spread = (max_price - min_price) / min_price * 100

        Interpretation:
            <0.1% = Normal, efficient market
            0.1-0.5% = Slight inefficiency
            >0.5% = Arbitrage opportunity / market stress
            >1.0% = Severe dislocation (RISK!)

        Returns: Spread in percentage
        """
        prices = []

        for exchange_data in multi_exchange_prices.values():
            if isinstance(exchange_data, dict):
                price = exchange_data.get("price", None)
                if price is not None:
                    prices.append(price)

        if len(prices) < 2:
            return 0.0

        max_price = max(prices)
        min_price = min(prices)

        spread = (max_price - min_price) / min_price * 100
        return round(spread, 4)

    def calculate_volume_anomaly(
        self, ohlcv_history: List[Dict[str, Any]], stablecoin: str, window_hours: int = 24
    ) -> float:
        """
        Feature 7: Volume Anomaly Score (Z-score)

        Formula:
            current_volume = last 1 hour volume
            μ_24h = mean(volumes[-24h])
            σ_24h = std(volumes[-24h])
            z_score = (current_volume - μ_24h) / σ_24h

        Interpretation:
            z < 2 = Normal volume
            2 < z < 3 = Elevated volume
            z > 3 = Anomalous spike (3-sigma event)
            z > 5 = Extreme anomaly (potential crisis)

        Returns: Z-score of current volume
        """
        if not ohlcv_history or len(ohlcv_history) < 10:
            return 0.0

        # Extract volumes
        volumes = [candle.get("volume_traded", 0) for candle in ohlcv_history]

        # Store for persistence
        if stablecoin not in self.historical_volumes:
            self.historical_volumes[stablecoin] = []

        self.historical_volumes[stablecoin] = volumes[-1440:]  # Keep 24h

        # Current hourly volume (last 60 candles if 1-min data)
        current_volume = np.mean(volumes[-60:]) if len(volumes) >= 60 else np.mean(volumes)

        # Historical statistics
        mean_volume = np.mean(volumes)
        std_volume = np.std(volumes)

        if std_volume == 0:
            return 0.0

        # Calculate z-score
        z_score = (current_volume - mean_volume) / std_volume

        return round(z_score, 4)

    def compute_liquidity_features(
        self,
        orderbook: Dict[str, Any],
        ohlcv_history: List[Dict[str, Any]],
        multi_exchange_prices: Dict[str, Dict[str, Any]],
        stablecoin: str,
    ) -> LiquidityFeatures:
        """
        Compute features for liquidity prediction model

        Args:
            orderbook: Order book data
            ohlcv_history: Historical OHLCV data
            multi_exchange_prices: Prices across exchanges
            stablecoin: Stablecoin identifier

        Returns:
            LiquidityFeatures object
        """
        # Liquidity depth (top 10 levels)
        liquidity_depth = self.calculate_liquidity_score(orderbook)

        # Order book cumulative depth (top 50 levels)
        order_book_depth = self.calculate_liquidity_score(orderbook, depth_levels=50)

        # Current volume
        volume = 0.0
        if ohlcv_history and len(ohlcv_history) > 0:
            recent_volumes = [c.get("volume_traded", 0) for c in ohlcv_history[-60:]]
            volume = np.mean(recent_volumes) if recent_volumes else 0.0

        # Spread
        spread = self.calculate_cross_exchange_spread(multi_exchange_prices)

        # Volatility
        volatility = self.calculate_volatility(ohlcv_history)

        # Store historical liquidity for rolling calculations
        if stablecoin not in self.historical_liquidity:
            self.historical_liquidity[stablecoin] = deque(maxlen=1000)
        self.historical_liquidity[stablecoin].append(liquidity_depth)

        return LiquidityFeatures(
            liquidity_depth=liquidity_depth,
            order_book_depth=order_book_depth,
            volume=volume,
            spread=spread,
            volatility=volatility,
        )

    def compute_anomaly_features(
        self,
        current_price: float,
        orderbook: Dict[str, Any],
        ohlcv_history: List[Dict[str, Any]],
        multi_exchange_prices: Dict[str, Dict[str, Any]],
        stablecoin: str,
    ) -> AnomalyFeatures:
        """
        Compute features for anomaly detection model

        Args:
            current_price: Current price
            orderbook: Order book data
            ohlcv_history: Historical OHLCV data
            multi_exchange_prices: Prices across exchanges
            stablecoin: Stablecoin identifier

        Returns:
            AnomalyFeatures object
        """
        # Liquidity depth
        liquidity_depth = self.calculate_liquidity_score(orderbook)

        # Liquidity change percentage
        liquidity_change_pct = 0.0
        if stablecoin in self.previous_liquidity:
            prev = self.previous_liquidity[stablecoin]
            if prev > 0:
                liquidity_change_pct = (liquidity_depth - prev) / prev
        self.previous_liquidity[stablecoin] = liquidity_depth

        # Volume z-score
        volume_zscore = self.calculate_volume_anomaly(ohlcv_history, stablecoin)

        # Price change percentage
        price_change_pct = 0.0
        if stablecoin in self.previous_price:
            prev_price = self.previous_price[stablecoin]
            if prev_price > 0:
                price_change_pct = (current_price - prev_price) / prev_price
        self.previous_price[stablecoin] = current_price

        # Order book imbalance
        orderbook_imbalance = self.calculate_orderbook_imbalance(orderbook)

        # Cross-exchange spread
        cross_exchange_spread = self.calculate_cross_exchange_spread(multi_exchange_prices)

        # Volatility spike
        volatility_spike = self.calculate_volatility(ohlcv_history)

        # Bid-ask spread
        bid_ask_spread = self.calculate_bid_ask_spread(orderbook)

        return AnomalyFeatures(
            liquidity_depth=liquidity_depth,
            liquidity_change_pct=liquidity_change_pct,
            volume_zscore=volume_zscore,
            price_change_pct=price_change_pct,
            orderbook_imbalance=orderbook_imbalance,
            cross_exchange_spread=cross_exchange_spread,
            volatility_spike=volatility_spike,
            bid_ask_spread=bid_ask_spread,
        )

    def calculate_bid_ask_spread(self, orderbook: Dict[str, Any]) -> float:
        """
        Calculate bid-ask spread from order book

        Formula: (best_ask - best_bid) / mid_price * 100

        Returns: Spread percentage
        """
        bids = orderbook.get("bids", [])
        asks = orderbook.get("asks", [])

        if not bids or not asks:
            return 0.0

        best_bid = bids[0].get("price", 0.0) if bids else 0.0
        best_ask = asks[0].get("price", 0.0) if asks else 0.0

        if best_bid == 0 or best_ask == 0:
            return 0.0

        mid_price = (best_bid + best_ask) / 2
        spread = (best_ask - best_bid) / mid_price

        return round(spread, 6)

    def get_liquidity_time_series(self, stablecoin: str, length: int = 60) -> np.ndarray:
        """
        Get historical liquidity time series for LSTM input

        Args:
            stablecoin: Stablecoin identifier
            length: Number of timesteps to retrieve

        Returns:
            Array of shape (length, n_features) or empty array
        """
        if stablecoin not in self.historical_liquidity:
            return np.array([])

        history = list(self.historical_liquidity[stablecoin])

        if len(history) < length:
            # Pad with first value if insufficient data
            if len(history) > 0:
                padding = [history[0]] * (length - len(history))
                history = padding + history
            else:
                return np.array([])
        else:
            history = history[-length:]

        # For now, return just liquidity depth
        # In production, would include all 5 liquidity features
        return np.array(history).reshape(-1, 1)


class StressScenarioSimulator:
    """
    Generate synthetic stress scenarios for hackathon demo
    """

    @staticmethod
    def simulate_depeg_scenario(severity: str = "moderate") -> RiskFeatures:
        """
        Generate synthetic depeg features for demo

        Args:
            severity: "low", "moderate", "high", "critical"

        Returns:
            RiskFeatures with synthetic stress values
        """
        scenarios = {
            "low": {
                "peg_deviation": np.random.uniform(0.8, 1.5),
                "deviation_duration": np.random.uniform(5, 15),
                "volatility": np.random.uniform(0.008, 0.015),
                "liquidity_score": np.random.uniform(0.6, 0.8),
                "orderbook_imbalance": np.random.uniform(-0.3, -0.15),
                "cross_exchange_spread": np.random.uniform(0.002, 0.005),
                "volume_anomaly_score": np.random.uniform(2.0, 3.0),
            },
            "moderate": {
                "peg_deviation": np.random.uniform(1.5, 3.0),
                "deviation_duration": np.random.uniform(20, 60),
                "volatility": np.random.uniform(0.015, 0.03),
                "liquidity_score": np.random.uniform(0.3, 0.6),
                "orderbook_imbalance": np.random.uniform(-0.5, -0.3),
                "cross_exchange_spread": np.random.uniform(0.005, 0.01),
                "volume_anomaly_score": np.random.uniform(3.0, 4.5),
            },
            "high": {
                "peg_deviation": np.random.uniform(3.0, 8.0),
                "deviation_duration": np.random.uniform(60, 180),
                "volatility": np.random.uniform(0.03, 0.08),
                "liquidity_score": np.random.uniform(0.1, 0.3),
                "orderbook_imbalance": np.random.uniform(-0.7, -0.5),
                "cross_exchange_spread": np.random.uniform(0.01, 0.02),
                "volume_anomaly_score": np.random.uniform(4.5, 7.0),
            },
            "critical": {
                "peg_deviation": np.random.uniform(10.0, 50.0),
                "deviation_duration": np.random.uniform(180, 500),
                "volatility": np.random.uniform(0.1, 0.3),
                "liquidity_score": np.random.uniform(0.01, 0.1),
                "orderbook_imbalance": np.random.uniform(-0.9, -0.7),
                "cross_exchange_spread": np.random.uniform(0.02, 0.1),
                "volume_anomaly_score": np.random.uniform(8.0, 15.0),
            },
        }

        values = scenarios.get(severity, scenarios["moderate"])

        return RiskFeatures(**values)


# Example usage
if __name__ == "__main__":
    # Initialize feature engineer
    engineer = FeatureEngineer()

    # All demo/mock data replaced with '-'
    print("Computed Risk Features:")
    print("  Peg Deviation: -")
    print("  Deviation Duration: -")
    print("  Volatility: -")
    print("  Liquidity Score: -")
    print("  Order Book Imbalance: -")
    print("  Cross-Exchange Spread: -")
    print("  Volume Anomaly Score: -")

    print("\nFeature Array for ML Model:")
    print("-")

    print("\nNormalized Feature Scores:")
    for key in [
        "peg_deviation_score",
        "liquidity_stress_score",
        "volatility_score",
        "imbalance_score",
        "spread_score",
        "volume_anomaly_score",
        "duration_score",
    ]:
        print(f"  {key}: -")
