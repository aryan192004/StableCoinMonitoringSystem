"""
Isolation Forest-based Anomaly Detection Model
Detects abnormal market conditions in real-time
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any
from datetime import datetime
import os
import joblib
from pathlib import Path

try:
    from sklearn.ensemble import IsolationForest
    from sklearn.preprocessing import StandardScaler
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("scikit-learn not installed. Run: pip install scikit-learn")


class AnomalyDetectionModel:
    """
    Isolation Forest for real-time market anomaly detection
    Detects: liquidity drops, volume spikes, price movements, order book imbalances
    """
    
    def __init__(self, model_path: str = None, contamination: float = 0.1):
        self.model = None
        self.scaler = None
        self.model_path = model_path or "models/anomaly_model.pkl"
        self.scaler_path = self.model_path.replace('.pkl', '_scaler.pkl')
        self.contamination = contamination  # Expected proportion of anomalies
        
        self.feature_names = [
            'liquidity_depth',
            'liquidity_change_pct',
            'volume_zscore',
            'price_change_pct',
            'orderbook_imbalance',
            'cross_exchange_spread',
            'volatility_spike',
            'bid_ask_spread'
        ]
        
        # Anomaly severity thresholds
        self.severity_thresholds = {
            'low': -0.3,
            'medium': -0.5,
            'high': -0.7
        }
        
        # Load existing model if available
        if os.path.exists(self.model_path):
            self.load_model()
    
    def train(
        self,
        X_train: np.ndarray,
        contamination: float = None
    ) -> Dict[str, Any]:
        """
        Train Isolation Forest on normal market data
        
        Args:
            X_train: Training features (n_samples, 8) - only normal data
            contamination: Expected proportion of anomalies (0.0-0.5)
        
        Returns:
            Training metrics
        """
        if not SKLEARN_AVAILABLE:
            raise ImportError("scikit-learn not installed")
        
        if contamination is not None:
            self.contamination = contamination
        
        # Standardize features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        
        # Initialize and train Isolation Forest
        self.model = IsolationForest(
            n_estimators=100,
            contamination=self.contamination,
            random_state=42,
            n_jobs=-1,
            max_samples='auto'
        )
        
        print(f"Training Isolation Forest with contamination={self.contamination}...")
        self.model.fit(X_train_scaled)
        
        # Calculate training metrics
        predictions = self.model.predict(X_train_scaled)
        anomaly_scores = self.model.score_samples(X_train_scaled)
        
        n_anomalies = np.sum(predictions == -1)
        anomaly_rate = n_anomalies / len(predictions)
        
        metrics = {
            'n_samples': len(X_train),
            'n_anomalies_detected': int(n_anomalies),
            'anomaly_rate': float(anomaly_rate),
            'contamination': self.contamination,
            'avg_anomaly_score': float(np.mean(anomaly_scores)),
            'training_date': datetime.utcnow().isoformat()
        }
        
        return metrics
    
    def detect_anomaly(
        self,
        features: np.ndarray
    ) -> Dict[str, Any]:
        """
        Detect anomalies in current market data
        
        Args:
            features: Feature array (1, 8) or (n_samples, 8)
        
        Returns:
            anomaly_score: Anomaly score (lower = more anomalous)
            is_anomaly: Boolean flag
            severity: Low/Medium/High
            alerts: List of detected anomaly types
        """
        if self.model is None:
            return self._fallback_detection(features)
        
        # Ensure 2D array
        if features.ndim == 1:
            features = features.reshape(1, -1)
        
        # Standardize
        features_scaled = self.scaler.transform(features)
        
        # Predict
        prediction = self.model.predict(features_scaled)[0]
        anomaly_score = self.model.score_samples(features_scaled)[0]
        
        is_anomaly = prediction == -1
        
        # Determine severity based on anomaly score
        if anomaly_score < self.severity_thresholds['high']:
            severity = "High"
        elif anomaly_score < self.severity_thresholds['medium']:
            severity = "Medium"
        elif anomaly_score < self.severity_thresholds['low']:
            severity = "Low"
        else:
            severity = "Normal"
        
        # Identify specific anomaly types
        alerts = self._identify_anomaly_types(features[0])
        
        result = {
            'anomaly_score': float(anomaly_score),
            'is_anomaly': bool(is_anomaly),
            'severity': severity,
            'alerts': alerts,
            'confidence': min(abs(anomaly_score) / 2.0, 1.0),  # Normalized confidence
            'timestamp': datetime.utcnow().isoformat()
        }
        
        return result
    
    def _identify_anomaly_types(self, features: np.ndarray) -> List[Dict[str, str]]:
        """
        Identify specific types of anomalies from feature values
        
        Args:
            features: Feature array (8,)
        
        Returns:
            List of alert dictionaries
        """
        alerts = []
        
        # Feature indices
        LIQUIDITY_DEPTH = 0
        LIQUIDITY_CHANGE = 1
        VOLUME_ZSCORE = 2
        PRICE_CHANGE = 3
        ORDERBOOK_IMBALANCE = 4
        SPREAD = 5
        VOLATILITY = 6
        BID_ASK_SPREAD = 7
        
        # Check for sudden liquidity drop
        if features[LIQUIDITY_CHANGE] < -0.2:  # 20% drop
            alerts.append({
                'type': 'liquidity_drop',
                'severity': 'High',
                'message': f'Liquidity dropped by {abs(features[LIQUIDITY_CHANGE])*100:.1f}%'
            })
        
        # Check for low liquidity
        if features[LIQUIDITY_DEPTH] < 0.3:
            alerts.append({
                'type': 'low_liquidity',
                'severity': 'High' if features[LIQUIDITY_DEPTH] < 0.15 else 'Medium',
                'message': f'Low liquidity depth: {features[LIQUIDITY_DEPTH]:.2f}'
            })
        
        # Check for volume spike
        if abs(features[VOLUME_ZSCORE]) > 3.0:
            alerts.append({
                'type': 'volume_spike',
                'severity': 'High' if abs(features[VOLUME_ZSCORE]) > 5.0 else 'Medium',
                'message': f'Volume {abs(features[VOLUME_ZSCORE]):.1f}σ from average'
            })
        
        # Check for whale activity (extreme volume with price impact)
        if abs(features[VOLUME_ZSCORE]) > 4.0 and abs(features[PRICE_CHANGE]) > 0.01:
            alerts.append({
                'type': 'whale_activity',
                'severity': 'High',
                'message': f'Large trade detected: {features[VOLUME_ZSCORE]:.1f}σ volume, {abs(features[PRICE_CHANGE])*100:.2f}% price change'
            })
        
        # Check for unusual price movement
        if abs(features[PRICE_CHANGE]) > 0.02:  # 2% price change
            alerts.append({
                'type': 'unusual_price_movement',
                'severity': 'High' if abs(features[PRICE_CHANGE]) > 0.05 else 'Medium',
                'message': f'Price changed by {abs(features[PRICE_CHANGE])*100:.2f}%'
            })
        
        # Check for order book imbalance
        if abs(features[ORDERBOOK_IMBALANCE]) > 0.7:
            side = 'buy' if features[ORDERBOOK_IMBALANCE] > 0 else 'sell'
            alerts.append({
                'type': 'orderbook_imbalance',
                'severity': 'Medium',
                'message': f'Strong {side} pressure: {abs(features[ORDERBOOK_IMBALANCE])*100:.1f}% imbalance'
            })
        
        # Check for wide spread
        if features[SPREAD] > 0.01:  # 1% spread
            alerts.append({
                'type': 'wide_spread',
                'severity': 'Medium' if features[SPREAD] < 0.02 else 'High',
                'message': f'Wide cross-exchange spread: {features[SPREAD]*100:.2f}%'
            })
        
        # Check for volatility spike
        if features[VOLATILITY] > 0.05:
            alerts.append({
                'type': 'volatility_spike',
                'severity': 'High' if features[VOLATILITY] > 0.10 else 'Medium',
                'message': f'High volatility: {features[VOLATILITY]*100:.2f}%'
            })
        
        # Check for bid-ask spread widening
        if features[BID_ASK_SPREAD] > 0.005:
            alerts.append({
                'type': 'spread_widening',
                'severity': 'Medium',
                'message': f'Bid-ask spread widened to {features[BID_ASK_SPREAD]*100:.2f}%'
            })
        
        return alerts
    
    def _fallback_detection(self, features: np.ndarray) -> Dict[str, Any]:
        """
        Fallback anomaly detection using rule-based thresholds
        """
        if features.ndim == 1:
            features = features.reshape(1, -1)
        
        # Simple rule-based detection
        anomaly_count = 0
        alerts = []
        
        # Check each feature against thresholds
        if features[0, 0] < 0.3:  # Low liquidity
            anomaly_count += 1
            alerts.append({'type': 'low_liquidity', 'severity': 'High'})
        
        if abs(features[0, 2]) > 3.0:  # Volume spike
            anomaly_count += 1
            alerts.append({'type': 'volume_spike', 'severity': 'Medium'})
        
        if abs(features[0, 3]) > 0.02:  # Large price change
            anomaly_count += 1
            alerts.append({'type': 'price_movement', 'severity': 'High'})
        
        is_anomaly = anomaly_count >= 2
        
        return {
            'anomaly_score': -0.5 if is_anomaly else 0.0,
            'is_anomaly': is_anomaly,
            'severity': 'High' if anomaly_count >= 3 else 'Medium' if anomaly_count >= 2 else 'Low',
            'alerts': alerts,
            'confidence': 0.6,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def save_model(self, path: str = None):
        """Save trained model and scaler to disk"""
        save_path = path or self.model_path
        
        # Create directory if needed
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Save model
        joblib.dump(self.model, save_path)
        
        # Save scaler
        if self.scaler is not None:
            joblib.dump(self.scaler, self.scaler_path)
        
        print(f"Anomaly model saved to {save_path}")
    
    def load_model(self, path: str = None):
        """Load trained model from disk"""
        load_path = path or self.model_path
        
        if os.path.exists(load_path):
            self.model = joblib.load(load_path)
            
            # Load scaler
            if os.path.exists(self.scaler_path):
                self.scaler = joblib.load(self.scaler_path)
            
            print(f"Anomaly model loaded from {load_path}")
        else:
            print(f"No model found at {load_path}")


def generate_synthetic_normal_data(n_samples: int = 5000) -> np.ndarray:
    """
    Generate synthetic "normal" market data for training
    
    Returns:
        X: Features (n_samples, 8)
    """
    np.random.seed(42)
    
    # Normal market conditions
    liquidity_depth = np.random.gamma(5, 0.2, n_samples)  # Healthy liquidity
    liquidity_change_pct = np.random.normal(0, 0.05, n_samples)  # Small changes
    volume_zscore = np.random.normal(0, 1.0, n_samples)  # Normal volume
    price_change_pct = np.random.normal(0, 0.005, n_samples)  # Small price changes
    orderbook_imbalance = np.random.normal(0, 0.2, n_samples)  # Balanced
    cross_exchange_spread = np.random.gamma(2, 0.001, n_samples)  # Tight spread
    volatility_spike = np.random.gamma(2, 0.002, n_samples)  # Low volatility
    bid_ask_spread = np.random.gamma(2, 0.0005, n_samples)  # Tight bid-ask
    
    X = np.column_stack([
        liquidity_depth,
        liquidity_change_pct,
        volume_zscore,
        price_change_pct,
        orderbook_imbalance,
        cross_exchange_spread,
        volatility_spike,
        bid_ask_spread
    ])
    
    return X


def generate_synthetic_anomaly_data(n_samples: int = 500) -> np.ndarray:
    """
    Generate synthetic anomalous market data for testing
    
    Returns:
        X: Features (n_samples, 8)
    """
    np.random.seed(123)
    
    # Crisis/anomalous conditions
    liquidity_depth = np.random.gamma(2, 0.1, n_samples)  # Low liquidity
    liquidity_change_pct = -np.random.gamma(3, 0.1, n_samples)  # Sudden drops
    volume_zscore = np.random.choice([-1, 1], n_samples) * np.random.gamma(3, 1.5, n_samples)  # Volume spikes
    price_change_pct = np.random.choice([-1, 1], n_samples) * np.random.gamma(3, 0.01, n_samples)  # Large moves
    orderbook_imbalance = np.random.choice([-1, 1], n_samples) * np.random.beta(5, 2, n_samples)  # Imbalanced
    cross_exchange_spread = np.random.gamma(3, 0.003, n_samples)  # Wide spread
    volatility_spike = np.random.gamma(3, 0.01, n_samples)  # High volatility
    bid_ask_spread = np.random.gamma(3, 0.002, n_samples)  # Wide bid-ask
    
    X = np.column_stack([
        liquidity_depth,
        liquidity_change_pct,
        volume_zscore,
        price_change_pct,
        orderbook_imbalance,
        cross_exchange_spread,
        volatility_spike,
        bid_ask_spread
    ])
    
    return X


def train_anomaly_model(
    save_path: str = "models/anomaly_model.pkl",
    contamination: float = 0.1
):
    """
    Train Isolation Forest anomaly detection model
    """
    if not SKLEARN_AVAILABLE:
        print("scikit-learn not installed. Skipping training.")
        return None
    
    print("Generating synthetic normal market data...")
    X_train = generate_synthetic_normal_data(n_samples=5000)
    
    print(f"Training samples: {len(X_train)}")
    
    print("\nTraining Isolation Forest...")
    model = AnomalyDetectionModel(model_path=save_path, contamination=contamination)
    metrics = model.train(X_train, contamination=contamination)
    
    print("\nTraining Results:")
    print(f"  Samples: {metrics['n_samples']}")
    print(f"  Anomalies Detected: {metrics['n_anomalies_detected']}")
    print(f"  Anomaly Rate: {metrics['anomaly_rate']:.2%}")
    print(f"  Avg Anomaly Score: {metrics['avg_anomaly_score']:.4f}")
    
    # Test on anomalous data
    print("\n" + "="*50)
    print("Testing on anomalous data...")
    print("="*50)
    
    X_anomaly = generate_synthetic_anomaly_data(n_samples=100)
    
    detection_count = 0
    for i in range(min(10, len(X_anomaly))):
        result = model.detect_anomaly(X_anomaly[i])
        if result['is_anomaly']:
            detection_count += 1
            print(f"\nSample {i+1}: ANOMALY DETECTED")
            print(f"  Score: {result['anomaly_score']:.4f}")
            print(f"  Severity: {result['severity']}")
            print(f"  Alerts: {len(result['alerts'])}")
            for alert in result['alerts'][:3]:  # Show first 3 alerts
                print(f"    - {alert['type']}: {alert.get('message', '')}")
    
    print(f"\nDetection rate on anomalous data: {detection_count}/10")
    
    # Save model
    model.save_model()
    
    print(f"\n✅ Anomaly model trained and saved to {save_path}")
    
    return model


# Test
if __name__ == "__main__":
    # Train model
    model = train_anomaly_model()
    
    if model:
        # Test on normal data
        print("\n" + "="*50)
        print("Testing on normal market conditions...")
        print("="*50)
        
        normal_features = np.array([
            0.9,   # Good liquidity
            0.02,  # Small change
            0.5,   # Normal volume
            0.001, # Small price change
            0.1,   # Balanced orderbook
            0.002, # Tight spread
            0.005, # Low volatility
            0.001  # Tight bid-ask
        ])
        
        result = model.detect_anomaly(normal_features)
        print(f"\nNormal Conditions:")
        print(f"  Anomaly Score: {result['anomaly_score']:.4f}")
        print(f"  Is Anomaly: {result['is_anomaly']}")
        print(f"  Severity: {result['severity']}")
        print(f"  Alerts: {len(result['alerts'])}")
        
        # Test on crisis data
        print("\n" + "="*50)
        print("Testing on crisis conditions...")
        print("="*50)
        
        crisis_features = np.array([
            0.15,  # Low liquidity
            -0.35, # Large drop
            5.5,   # Volume spike
            0.045, # Large price change
            -0.75, # Strong sell pressure
            0.015, # Wide spread
            0.08,  # High volatility
            0.008  # Wide bid-ask
        ])
        
        result = model.detect_anomaly(crisis_features)
        print(f"\nCrisis Conditions:")
        print(f"  Anomaly Score: {result['anomaly_score']:.4f}")
        print(f"  Is Anomaly: {result['is_anomaly']}")
        print(f"  Severity: {result['severity']}")
        print(f"  Alerts: {len(result['alerts'])}")
        for alert in result['alerts']:
            print(f"    - {alert['type']} ({alert['severity']}): {alert.get('message', '')}")
