"""
Market Stability Index Model
Predicts overall market stability score (0-100) using ensemble tree regressor
"""
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, Optional
import joblib
import os
from datetime import datetime
try:
    import lightgbm as lgb
except ImportError:
    lgb = None
    print("⚠️  LightGBM not installed. Install with: pip install lightgbm")


class MarketStabilityModel:
    """
    Market Stability Index predictor using LightGBM
    Output: 0-100 scale (100 = perfectly stable, 0 = highly unstable)
    """
    
    def __init__(self, model_path: str = "models/stability_model.pkl"):
        self.model_path = model_path
        self.model = None
        self.feature_names = [
            'avg_peg_deviation',
            'peg_deviation_std',
            'max_peg_deviation',
            'avg_liquidity_depth',
            'liquidity_imbalance',
            'avg_spread',
            'volume_stability',
            'cross_exchange_dispersion',
            'reserve_adequacy_ratio',
            'time_since_last_spike'
        ]
        
        if os.path.exists(model_path):
            self.load_model()
    
    def generate_synthetic_training_data(self, n_samples: int = 5000) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate synthetic training data for market stability
        Labels: stability score (0-100)
        """
        np.random.seed(42)
        
        # Stable market conditions (70% of data)
        n_stable = int(n_samples * 0.7)
        X_stable = np.random.randn(n_stable, len(self.feature_names))
        X_stable[:, 0] = np.abs(np.random.normal(0.05, 0.03, n_stable))  # low peg deviation
        X_stable[:, 1] = np.abs(np.random.normal(0.02, 0.01, n_stable))  # low std
        X_stable[:, 2] = np.abs(np.random.normal(0.15, 0.05, n_stable))  # low max dev
        X_stable[:, 3] = np.random.uniform(50000000, 200000000, n_stable)  # high liquidity
        X_stable[:, 4] = np.abs(np.random.normal(0.02, 0.01, n_stable))  # balanced
        X_stable[:, 5] = np.abs(np.random.normal(0.0005, 0.0002, n_stable))  # tight spread
        X_stable[:, 6] = np.random.uniform(0.8, 1.0, n_stable)  # stable volume
        X_stable[:, 7] = np.abs(np.random.normal(0.03, 0.01, n_stable))  # low dispersion
        X_stable[:, 8] = np.random.uniform(0.9, 1.1, n_stable)  # adequate reserves
        X_stable[:, 9] = np.random.uniform(100, 10000, n_stable)  # long time since spike
        y_stable = np.random.uniform(75, 100, n_stable)
        
        # Moderate instability (20% of data)
        n_moderate = int(n_samples * 0.2)
        X_moderate = np.random.randn(n_moderate, len(self.feature_names))
        X_moderate[:, 0] = np.abs(np.random.normal(0.3, 0.15, n_moderate))
        X_moderate[:, 1] = np.abs(np.random.normal(0.1, 0.05, n_moderate))
        X_moderate[:, 2] = np.abs(np.random.normal(0.8, 0.3, n_moderate))
        X_moderate[:, 3] = np.random.uniform(10000000, 80000000, n_moderate)
        X_moderate[:, 4] = np.abs(np.random.normal(0.1, 0.05, n_moderate))
        X_moderate[:, 5] = np.abs(np.random.normal(0.002, 0.001, n_moderate))
        X_moderate[:, 6] = np.random.uniform(0.5, 0.8, n_moderate)
        X_moderate[:, 7] = np.abs(np.random.normal(0.15, 0.05, n_moderate))
        X_moderate[:, 8] = np.random.uniform(0.7, 0.9, n_moderate)
        X_moderate[:, 9] = np.random.uniform(10, 200, n_moderate)
        y_moderate = np.random.uniform(40, 75, n_moderate)
        
        # High instability (10% of data)
        n_unstable = n_samples - n_stable - n_moderate
        X_unstable = np.random.randn(n_unstable, len(self.feature_names))
        X_unstable[:, 0] = np.abs(np.random.normal(1.5, 0.8, n_unstable))
        X_unstable[:, 1] = np.abs(np.random.normal(0.5, 0.2, n_unstable))
        X_unstable[:, 2] = np.abs(np.random.normal(3.0, 1.0, n_unstable))
        X_unstable[:, 3] = np.random.uniform(1000000, 15000000, n_unstable)
        X_unstable[:, 4] = np.abs(np.random.normal(0.3, 0.1, n_unstable))
        X_unstable[:, 5] = np.abs(np.random.normal(0.01, 0.005, n_unstable))
        X_unstable[:, 6] = np.random.uniform(0.2, 0.5, n_unstable)
        X_unstable[:, 7] = np.abs(np.random.normal(0.5, 0.2, n_unstable))
        X_unstable[:, 8] = np.random.uniform(0.3, 0.7, n_unstable)
        X_unstable[:, 9] = np.random.uniform(0, 50, n_unstable)
        y_unstable = np.random.uniform(0, 40, n_unstable)
        
        X = np.vstack([X_stable, X_moderate, X_unstable])
        y = np.hstack([y_stable, y_moderate, y_unstable])
        
        # Shuffle
        indices = np.arange(len(X))
        np.random.shuffle(indices)
        
        return X[indices], y[indices]
    
    def train(self, X_train: np.ndarray, y_train: np.ndarray, 
              X_val: np.ndarray, y_val: np.ndarray,
              params: Optional[Dict] = None) -> Dict[str, float]:
        """Train LightGBM regressor for stability prediction"""
        if lgb is None:
            raise ImportError("LightGBM not installed")
        
        default_params = {
            'objective': 'regression',
            'metric': 'rmse',
            'boosting_type': 'gbdt',
            'num_leaves': 31,
            'learning_rate': 0.05,
            'feature_fraction': 0.9,
            'bagging_fraction': 0.8,
            'bagging_freq': 5,
            'verbose': -1
        }
        
        if params:
            default_params.update(params)
        
        train_data = lgb.Dataset(X_train, label=y_train, feature_name=self.feature_names)
        val_data = lgb.Dataset(X_val, label=y_val, reference=train_data, feature_name=self.feature_names)
        
        print("Training Market Stability Index model...")
        self.model = lgb.train(
            default_params,
            train_data,
            num_boost_round=500,
            valid_sets=[train_data, val_data],
            valid_names=['train', 'val'],
            callbacks=[lgb.early_stopping(stopping_rounds=50), lgb.log_evaluation(period=100)]
        )
        
        # Evaluate
        train_pred = self.model.predict(X_train)
        val_pred = self.model.predict(X_val)
        
        train_rmse = np.sqrt(np.mean((train_pred - y_train) ** 2))
        val_rmse = np.sqrt(np.mean((val_pred - y_val) ** 2))
        train_mae = np.mean(np.abs(train_pred - y_train))
        val_mae = np.mean(np.abs(val_pred - y_val))
        
        metrics = {
            'train_rmse': float(train_rmse),
            'val_rmse': float(val_rmse),
            'train_mae': float(train_mae),
            'val_mae': float(val_mae)
        }
        
        print(f"Market Stability Model - Validation RMSE: {val_rmse:.2f}, MAE: {val_mae:.2f}")
        return metrics
    
    def predict(self, features: np.ndarray) -> Dict[str, Any]:
        """Predict market stability index"""
        if self.model is None:
            return self._fallback_prediction(features)
        
        try:
            if features.ndim == 1:
                features = features.reshape(1, -1)
            
            stability_score = float(self.model.predict(features)[0])
            stability_score = np.clip(stability_score, 0, 100)
            
            # Determine confidence and level
            if stability_score >= 75:
                level = "High Stability"
                confidence = 0.9
            elif stability_score >= 40:
                level = "Moderate Stability"
                confidence = 0.85
            else:
                level = "Low Stability"
                confidence = 0.8
            
            return {
                'stability_index': stability_score,
                'level': level,
                'confidence': confidence,
                'timestamp': datetime.now().isoformat(),
                'model_version': '1.0'
            }
        except Exception as e:
            print(f"Prediction error: {e}")
            return self._fallback_prediction(features)
    
    def _fallback_prediction(self, features: np.ndarray) -> Dict[str, Any]:
        """Rule-based fallback when model unavailable"""
        if features.ndim == 1:
            features = features.reshape(1, -1)
        
        # Simple weighted rule
        peg_dev_score = max(0, 100 - features[0, 0] * 50)
        liquidity_score = min(100, features[0, 3] / 1000000)
        spread_score = max(0, 100 - features[0, 5] * 10000)
        
        stability_score = (peg_dev_score * 0.4 + liquidity_score * 0.3 + spread_score * 0.3)
        stability_score = np.clip(stability_score, 0, 100)
        
        return {
            'stability_index': float(stability_score),
            'level': "Moderate Stability" if stability_score > 50 else "Low Stability",
            'confidence': 0.6,
            'timestamp': datetime.now().isoformat(),
            'model_version': 'fallback'
        }
    
    def save_model(self):
        """Save trained model"""
        if self.model is not None:
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            self.model.save_model(self.model_path)
            print(f"✅ Market Stability model saved to {self.model_path}")
    
    def load_model(self):
        """Load trained model"""
        if lgb is None or not os.path.exists(self.model_path):
            return
        
        try:
            self.model = lgb.Booster(model_file=self.model_path)
            print(f"✅ Market Stability model loaded from {self.model_path}")
        except Exception as e:
            print(f"⚠️  Could not load model: {e}")


def train_stability_model(save_path: str = "models/stability_model.pkl", n_samples: int = 5000) -> Tuple:
    """Training function for orchestration"""
    model = MarketStabilityModel(model_path=save_path)
    
    X, y = model.generate_synthetic_training_data(n_samples=n_samples)
    
    # 80/20 split
    split_idx = int(len(X) * 0.8)
    X_train, X_val = X[:split_idx], X[split_idx:]
    y_train, y_val = y[:split_idx], y[split_idx:]
    
    metrics = model.train(X_train, y_train, X_val, y_val)
    model.save_model()
    
    return model, metrics


if __name__ == "__main__":
    model, metrics = train_stability_model()
    print("\nMarket Stability Model Training Complete")
    print(f"Metrics: {metrics}")
