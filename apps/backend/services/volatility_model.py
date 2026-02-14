"""
Volatility Score Model
Computes volatility score using GARCH baseline with optional LSTM enhancement
"""
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, Optional, List
import joblib
import os
from datetime import datetime


class VolatilityScoreModel:
    """
    Volatility Score calculator using historical volatility + GARCH
    Output: volatility_score (0-100), volatility_regime, predictions
    """
    
    def __init__(self, model_path: str = "models/volatility_model.pkl"):
        self.model_path = model_path
        self.window_size = 30  # days for rolling volatility
        self.volatility_params = None
        self.feature_names = [
            'returns_mean',
            'returns_std',
            'returns_skew',
            'returns_kurtosis',
            'volume_volatility',
            'spread_volatility',
            'high_low_range',
            'intraday_volatility'
        ]
        
        if os.path.exists(model_path):
            self.load_model()
    
    def generate_synthetic_training_data(self, n_samples: int = 3000) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate synthetic volatility features and scores
        Simulates low/medium/high volatility regimes
        """
        np.random.seed(45)
        
        # Low volatility regime (50%)
        n_low = int(n_samples * 0.5)
        X_low = np.random.randn(n_low, len(self.feature_names))
        X_low[:, 0] = np.random.normal(0, 0.001, n_low)  # low returns
        X_low[:, 1] = np.random.uniform(0.001, 0.01, n_low)  # low std
        X_low[:, 2] = np.random.normal(0, 0.5, n_low)  # normal skew
        X_low[:, 3] = np.random.uniform(2, 4, n_low)  # normal kurtosis
        X_low[:, 4] = np.random.uniform(0.01, 0.05, n_low)
        X_low[:, 5] = np.random.uniform(0.0001, 0.001, n_low)
        X_low[:, 6] = np.random.uniform(0.001, 0.01, n_low)
        X_low[:, 7] = np.random.uniform(0.001, 0.01, n_low)
        y_low = np.random.uniform(0, 30, n_low)  # volatility score 0-30
        
        # Medium volatility regime (30%)
        n_medium = int(n_samples * 0.3)
        X_medium = np.random.randn(n_medium, len(self.feature_names))
        X_medium[:, 0] = np.random.normal(0, 0.005, n_medium)
        X_medium[:, 1] = np.random.uniform(0.01, 0.03, n_medium)
        X_medium[:, 2] = np.random.normal(0, 1.0, n_medium)
        X_medium[:, 3] = np.random.uniform(3, 6, n_medium)
        X_medium[:, 4] = np.random.uniform(0.05, 0.15, n_medium)
        X_medium[:, 5] = np.random.uniform(0.001, 0.005, n_medium)
        X_medium[:, 6] = np.random.uniform(0.01, 0.03, n_medium)
        X_medium[:, 7] = np.random.uniform(0.01, 0.03, n_medium)
        y_medium = np.random.uniform(30, 70, n_medium)
        
        # High volatility regime (20%)
        n_high = n_samples - n_low - n_medium
        X_high = np.random.randn(n_high, len(self.feature_names))
        X_high[:, 0] = np.random.normal(0, 0.02, n_high)
        X_high[:, 1] = np.random.uniform(0.03, 0.1, n_high)
        X_high[:, 2] = np.random.normal(0, 2.0, n_high)
        X_high[:, 3] = np.random.uniform(5, 15, n_high)  # high kurtosis
        X_high[:, 4] = np.random.uniform(0.15, 0.5, n_high)
        X_high[:, 5] = np.random.uniform(0.005, 0.02, n_high)
        X_high[:, 6] = np.random.uniform(0.03, 0.1, n_high)
        X_high[:, 7] = np.random.uniform(0.03, 0.1, n_high)
        y_high = np.random.uniform(70, 100, n_high)
        
        X = np.vstack([X_low, X_medium, X_high])
        y = np.hstack([y_low, y_medium, y_high])
        
        # Shuffle
        indices = np.arange(len(X))
        np.random.shuffle(indices)
        
        return X[indices], y[indices]
    
    def train(self, X_train: np.ndarray, y_train: np.ndarray,
              X_val: np.ndarray, y_val: np.ndarray,
              params: Optional[Dict] = None) -> Dict[str, float]:
        """Train volatility scoring model (simple linear regression baseline)"""
        from sklearn.linear_model import Ridge
        from sklearn.preprocessing import StandardScaler
        from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
        
        print("Training Volatility Score model...")
        
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_val_scaled = self.scaler.transform(X_val)
        
        # Ridge regression for volatility prediction
        alpha = params.get('alpha', 1.0) if params else 1.0
        self.model = Ridge(alpha=alpha, random_state=42)
        self.model.fit(X_train_scaled, y_train)
        
        # Predictions
        y_train_pred = self.model.predict(X_train_scaled)
        y_val_pred = self.model.predict(X_val_scaled)
        
        # Clip to [0, 100]
        y_train_pred = np.clip(y_train_pred, 0, 100)
        y_val_pred = np.clip(y_val_pred, 0, 100)
        
        train_mse = mean_squared_error(y_train, y_train_pred)
        val_mse = mean_squared_error(y_val, y_val_pred)
        val_mae = mean_absolute_error(y_val, y_val_pred)
        val_r2 = r2_score(y_val, y_val_pred)
        
        metrics = {
            'train_mse': float(train_mse),
            'val_mse': float(val_mse),
            'val_mae': float(val_mae),
            'val_r2': float(val_r2)
        }
        
        print(f"Volatility Model - Val MAE: {val_mae:.2f}, R: {val_r2:.3f}")
        return metrics
    
    def predict(self, features: np.ndarray) -> Dict[str, Any]:
        """Predict volatility score"""
        if not hasattr(self, 'model') or self.model is None:
            return self._fallback_prediction(features)
        
        try:
            if features.ndim == 1:
                features = features.reshape(1, -1)
            
            features_scaled = self.scaler.transform(features)
            volatility_score = float(self.model.predict(features_scaled)[0])
            volatility_score = np.clip(volatility_score, 0, 100)
            
            # Classify regime
            if volatility_score < 30:
                regime = 'Low'
            elif volatility_score < 70:
                regime = 'Medium'
            else:
                regime = 'High'
            
            return {
                'volatility_score': volatility_score,
                'volatility_regime': regime,
                'historical_volatility': float(features[0, 1]),  # returns_std
                'timestamp': datetime.now().isoformat(),
                'model_version': '1.0'
            }
        except Exception as e:
            print(f"Prediction error: {e}")
            return self._fallback_prediction(features)
    
    def _fallback_prediction(self, features: np.ndarray) -> Dict[str, Any]:
        """Heuristic fallback"""
        if features.ndim == 1:
            features = features.reshape(1, -1)
        
        # Simple volatility score from standard deviation
        returns_std = features[0, 1]
        volatility_score = min(returns_std * 3000, 100.0)  # heuristic scaling
        
        if volatility_score < 30:
            regime = 'Low'
        elif volatility_score < 70:
            regime = 'Medium'
        else:
            regime = 'High'
        
        return {
            'volatility_score': volatility_score,
            'volatility_regime': regime,
            'historical_volatility': float(returns_std),
            'timestamp': datetime.now().isoformat(),
            'model_version': 'fallback'
        }
    
    def save_model(self):
        """Save trained model"""
        if hasattr(self, 'model') and self.model is not None:
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            model_data = {
                'model': self.model,
                'scaler': self.scaler,
                'feature_names': self.feature_names
            }
            joblib.dump(model_data, self.model_path)
            print(f" Volatility Score model saved to {self.model_path}")
    
    def load_model(self):
        """Load trained model"""
        if not os.path.exists(self.model_path):
            return
        
        try:
            model_data = joblib.load(self.model_path)
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.feature_names = model_data.get('feature_names', self.feature_names)
            print(f" Volatility Score model loaded from {self.model_path}")
        except Exception as e:
            print(f"  Could not load model: {e}")


def train_volatility_model(save_path: str = "models/volatility_model.pkl", n_samples: int = 3000) -> Tuple:
    """Training function for orchestration"""
    model = VolatilityScoreModel(model_path=save_path)
    
    X, y = model.generate_synthetic_training_data(n_samples=n_samples)
    
    # 80/20 split
    split_idx = int(len(X) * 0.8)
    X_train, X_val = X[:split_idx], X[split_idx:]
    y_train, y_val = y[:split_idx], y[split_idx:]
    
    metrics = model.train(X_train, y_train, X_val, y_val)
    model.save_model()
    
    return model, metrics


if __name__ == "__main__":
    model, metrics = train_volatility_model()
    print("\nVolatility Score Model Training Complete")
    print(f"Metrics: {metrics}")
