"""
Systemic Risk Level Model
Classifies overall systemic risk into low/medium/high categories using XGBoost
"""
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, Optional, List
import joblib
import os
from datetime import datetime
try:
    import xgboost as xgb
except ImportError:
    xgb = None
    print("⚠️  XGBoost not installed. Install with: pip install xgboost")


class SystemicRiskModel:
    """
    Systemic Risk Level classifier using XGBoost
    Output: {0: 'Low', 1: 'Medium', 2: 'High'}
    """
    
    def __init__(self, model_path: str = "models/systemic_risk_model.pkl"):
        self.model_path = model_path
        self.model = None
        self.risk_levels = ['Low', 'Medium', 'High']
        self.feature_names = [
            'market_correlation_avg',
            'contagion_score',
            'aggregate_liquidity_stress',
            'multi_coin_peg_deviation',
            'reserve_concentration_risk',
            'exchange_concentration',
            'total_market_cap_change',
            'cross_market_volatility',
            'regulatory_event_flag',
            'macro_stress_indicator'
        ]
        
        if os.path.exists(model_path):
            self.load_model()
    
    def generate_synthetic_training_data(self, n_samples: int = 4000) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate synthetic training data for systemic risk classification
        Labels: 0 (Low), 1 (Medium), 2 (High)
        """
        np.random.seed(43)
        
        # Low risk conditions (60% of data)
        n_low = int(n_samples * 0.6)
        X_low = np.random.randn(n_low, len(self.feature_names))
        X_low[:, 0] = np.random.uniform(0.1, 0.4, n_low)  # low correlation
        X_low[:, 1] = np.random.uniform(0.0, 0.2, n_low)  # low contagion
        X_low[:, 2] = np.random.uniform(0.0, 0.3, n_low)  # low liquidity stress
        X_low[:, 3] = np.abs(np.random.normal(0.05, 0.03, n_low))  # low multi-coin peg dev
        X_low[:, 4] = np.random.uniform(0.1, 0.4, n_low)  # diversified reserves
        X_low[:, 5] = np.random.uniform(0.2, 0.5, n_low)  # diversified exchanges
        X_low[:, 6] = np.random.normal(0, 0.05, n_low)  # stable market cap
        X_low[:, 7] = np.random.uniform(0.05, 0.15, n_low)  # low volatility
        X_low[:, 8] = np.random.choice([0, 1], n_low, p=[0.95, 0.05])  # rare events
        X_low[:, 9] = np.random.uniform(0, 0.3, n_low)  # low macro stress
        y_low = np.zeros(n_low, dtype=int)
        
        # Medium risk conditions (30% of data)
        n_medium = int(n_samples * 0.3)
        X_medium = np.random.randn(n_medium, len(self.feature_names))
        X_medium[:, 0] = np.random.uniform(0.4, 0.7, n_medium)
        X_medium[:, 1] = np.random.uniform(0.2, 0.5, n_medium)
        X_medium[:, 2] = np.random.uniform(0.3, 0.6, n_medium)
        X_medium[:, 3] = np.abs(np.random.normal(0.3, 0.15, n_medium))
        X_medium[:, 4] = np.random.uniform(0.4, 0.7, n_medium)
        X_medium[:, 5] = np.random.uniform(0.5, 0.75, n_medium)
        X_medium[:, 6] = np.random.normal(0, 0.15, n_medium)
        X_medium[:, 7] = np.random.uniform(0.15, 0.35, n_medium)
        X_medium[:, 8] = np.random.choice([0, 1], n_medium, p=[0.7, 0.3])
        X_medium[:, 9] = np.random.uniform(0.3, 0.6, n_medium)
        y_medium = np.ones(n_medium, dtype=int)
        
        # High risk conditions (10% of data)
        n_high = n_samples - n_low - n_medium
        X_high = np.random.randn(n_high, len(self.feature_names))
        X_high[:, 0] = np.random.uniform(0.7, 0.95, n_high)  # high correlation
        X_high[:, 1] = np.random.uniform(0.5, 1.0, n_high)  # high contagion
        X_high[:, 2] = np.random.uniform(0.6, 1.0, n_high)  # severe liquidity stress
        X_high[:, 3] = np.abs(np.random.normal(1.0, 0.5, n_high))  # high peg deviation
        X_high[:, 4] = np.random.uniform(0.7, 1.0, n_high)  # concentrated reserves
        X_high[:, 5] = np.random.uniform(0.75, 1.0, n_high)  # concentrated exchanges
        X_high[:, 6] = np.random.normal(0, 0.3, n_high)  # volatile market cap
        X_high[:, 7] = np.random.uniform(0.35, 0.8, n_high)  # high volatility
        X_high[:, 8] = np.random.choice([0, 1], n_high, p=[0.3, 0.7])  # frequent events
        X_high[:, 9] = np.random.uniform(0.6, 1.0, n_high)  # high macro stress
        y_high = np.full(n_high, 2, dtype=int)
        
        X = np.vstack([X_low, X_medium, X_high])
        y = np.hstack([y_low, y_medium, y_high])
        
        # Shuffle
        indices = np.arange(len(X))
        np.random.shuffle(indices)
        
        return X[indices], y[indices]
    
    def train(self, X_train: np.ndarray, y_train: np.ndarray,
              X_val: np.ndarray, y_val: np.ndarray,
              params: Optional[Dict] = None) -> Dict[str, float]:
        """Train XGBoost classifier for systemic risk"""
        if xgb is None:
            raise ImportError("XGBoost not installed")
        
        default_params = {
            'objective': 'multi:softmax',
            'num_class': 3,
            'max_depth': 6,
            'learning_rate': 0.05,
            'n_estimators': 300,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'eval_metric': 'mlogloss',
            'random_state': 42
        }
        
        if params:
            default_params.update(params)
        
        print("Training Systemic Risk Level model...")
        self.model = xgb.XGBClassifier(**default_params)
        
        eval_set = [(X_train, y_train), (X_val, y_val)]
        self.model.fit(
            X_train, y_train,
            eval_set=eval_set,
            verbose=100
        )
        
        # Evaluate
        train_pred = self.model.predict(X_train)
        val_pred = self.model.predict(X_val)
        
        train_acc = np.mean(train_pred == y_train)
        val_acc = np.mean(val_pred == y_val)
        
        # Per-class metrics
        from sklearn.metrics import precision_recall_fscore_support
        precision, recall, f1, _ = precision_recall_fscore_support(y_val, val_pred, average='weighted')
        
        metrics = {
            'train_accuracy': float(train_acc),
            'val_accuracy': float(val_acc),
            'val_precision': float(precision),
            'val_recall': float(recall),
            'val_f1': float(f1)
        }
        
        print(f"Systemic Risk Model - Val Accuracy: {val_acc:.3f}, F1: {f1:.3f}")
        return metrics
    
    def predict(self, features: np.ndarray) -> Dict[str, Any]:
        """Predict systemic risk level"""
        if self.model is None:
            return self._fallback_prediction(features)
        
        try:
            if features.ndim == 1:
                features = features.reshape(1, -1)
            
            risk_class = int(self.model.predict(features)[0])
            risk_probabilities = self.model.predict_proba(features)[0]
            
            risk_level = self.risk_levels[risk_class]
            confidence = float(risk_probabilities[risk_class])
            
            return {
                'systemic_risk_level': risk_level,
                'risk_class': risk_class,
                'probabilities': {
                    'Low': float(risk_probabilities[0]),
                    'Medium': float(risk_probabilities[1]),
                    'High': float(risk_probabilities[2])
                },
                'confidence': confidence,
                'timestamp': datetime.now().isoformat(),
                'model_version': '1.0'
            }
        except Exception as e:
            print(f"Prediction error: {e}")
            return self._fallback_prediction(features)
    
    def _fallback_prediction(self, features: np.ndarray) -> Dict[str, Any]:
        """Rule-based fallback"""
        if features.ndim == 1:
            features = features.reshape(1, -1)
        
        # Simple rule: average of key risk indicators
        correlation_risk = features[0, 0]
        contagion_risk = features[0, 1]
        liquidity_stress = features[0, 2]
        
        avg_risk = (correlation_risk + contagion_risk + liquidity_stress) / 3
        
        if avg_risk < 0.35:
            risk_level = 'Low'
            risk_class = 0
        elif avg_risk < 0.65:
            risk_level = 'Medium'
            risk_class = 1
        else:
            risk_level = 'High'
            risk_class = 2
        
        return {
            'systemic_risk_level': risk_level,
            'risk_class': risk_class,
            'probabilities': {'Low': 0.33, 'Medium': 0.34, 'High': 0.33},
            'confidence': 0.5,
            'timestamp': datetime.now().isoformat(),
            'model_version': 'fallback'
        }
    
    def save_model(self):
        """Save trained model"""
        if self.model is not None:
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            joblib.dump(self.model, self.model_path)
            print(f"✅ Systemic Risk model saved to {self.model_path}")
    
    def load_model(self):
        """Load trained model"""
        if not os.path.exists(self.model_path):
            return
        
        try:
            self.model = joblib.load(self.model_path)
            print(f"✅ Systemic Risk model loaded from {self.model_path}")
        except Exception as e:
            print(f"⚠️  Could not load model: {e}")


def train_systemic_risk_model(save_path: str = "models/systemic_risk_model.pkl", n_samples: int = 4000) -> Tuple:
    """Training function for orchestration"""
    model = SystemicRiskModel(model_path=save_path)
    
    X, y = model.generate_synthetic_training_data(n_samples=n_samples)
    
    # 80/20 split
    split_idx = int(len(X) * 0.8)
    X_train, X_val = X[:split_idx], X[split_idx:]
    y_train, y_val = y[:split_idx], y[split_idx:]
    
    metrics = model.train(X_train, y_train, X_val, y_val)
    model.save_model()
    
    return model, metrics


if __name__ == "__main__":
    model, metrics = train_systemic_risk_model()
    print("\nSystemic Risk Model Training Complete")
    print(f"Metrics: {metrics}")
