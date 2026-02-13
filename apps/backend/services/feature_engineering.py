"""
Feature Engineering Pipeline for Risk Scoring
Implements 7 core features for ML model
"""

import numpy as np
from typing import Dict, List, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass


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
    """

    def __init__(self):
        self.deviation_start_time: Dict[str, datetime] = {}
        self.historical_volumes: Dict[str, List[float]] = {}

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
