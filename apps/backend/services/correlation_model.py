"""
Correlation Index Model
Computes cross-stablecoin correlation metrics using PCA and rolling correlations
"""
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, Optional, List
import joblib
import os
from datetime import datetime
try:
    from sklearn.decomposition import PCA
    from sklearn.preprocessing import StandardScaler
except ImportError:
    print("  scikit-learn not installed. Install with: pip install scikit-learn")
    PCA = None
    StandardScaler = None


class CorrelationIndexModel:
    """
    Correlation Index analyzer using PCA and rolling correlations
    Output: correlation_index (0-100), dominant_factor_strength, correlation_matrix
    """
    
    def __init__(self, model_path: str = "models/correlation_model.pkl"):
        self.model_path = model_path
        self.pca_model = None
        self.scaler = None
        self.n_components = 5
        self.feature_names = [
            'usdt_price_change',
            'usdc_price_change',
            'dai_price_change',
            'busd_price_change',
            'usdt_volume_change',
            'usdc_volume_change',
            'dai_volume_change',
            'busd_volume_change',
            'btc_price_change',
            'eth_price_change'
        ]
        
        if os.path.exists(model_path):
            self.load_model()
    
    def generate_synthetic_training_data(self, n_samples: int = 2000) -> np.ndarray:
        """
        Generate synthetic multivariate time series for correlation analysis
        Simulates different correlation regimes
        """
        np.random.seed(44)
        
        # Low correlation regime (40%)
        n_low = int(n_samples * 0.4)
        cov_low = np.eye(len(self.feature_names)) * 0.01
        X_low = np.random.multivariate_normal(
            mean=np.zeros(len(self.feature_names)),
            cov=cov_low,
            size=n_low
        )
        
        # Medium correlation regime (40%)
        n_medium = int(n_samples * 0.4)
        cov_medium = np.eye(len(self.feature_names)) * 0.05
        # Add some cross-correlation
        for i in range(4):  # stablecoin prices correlated
            for j in range(4):
                if i != j:
                    cov_medium[i, j] = 0.03
        X_medium = np.random.multivariate_normal(
            mean=np.zeros(len(self.feature_names)),
            cov=cov_medium,
            size=n_medium
        )
        
        # High correlation regime (20%)
        n_high = n_samples - n_low - n_medium
        cov_high = np.eye(len(self.feature_names)) * 0.1
        # Strong cross-correlation
        for i in range(len(self.feature_names)):
            for j in range(len(self.feature_names)):
                if i != j:
                    cov_high[i, j] = 0.08
        X_high = np.random.multivariate_normal(
            mean=np.zeros(len(self.feature_names)),
            cov=cov_high,
            size=n_high
        )
        
        X = np.vstack([X_low, X_medium, X_high])
        
        # Shuffle
        indices = np.arange(len(X))
        np.random.shuffle(indices)
        
        return X[indices]
    
    def train(self, X_train: np.ndarray, params: Optional[Dict] = None) -> Dict[str, float]:
        """Fit PCA and StandardScaler on training data"""
        if PCA is None or StandardScaler is None:
            raise ImportError("scikit-learn not installed")
        
        print("Training Correlation Index model (PCA)...")
        
        # Fit scaler
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X_train)
        
        # Fit PCA
        n_components = params.get('n_components', self.n_components) if params else self.n_components
        self.pca_model = PCA(n_components=n_components, random_state=42)
        self.pca_model.fit(X_scaled)
        
        # Explained variance metrics
        explained_variance = self.pca_model.explained_variance_ratio_
        cumulative_variance = np.cumsum(explained_variance)
        
        metrics = {
            'explained_variance_first_component': float(explained_variance[0]),
            'explained_variance_total': float(cumulative_variance[-1]),
            'n_components': n_components
        }
        
        print(f"Correlation Model - First PC explains {explained_variance[0]:.2%} variance")
        return metrics
    
    def compute_correlation_matrix(self, features: np.ndarray) -> np.ndarray:
        """Compute correlation matrix from features"""
        if features.ndim == 1:
            features = features.reshape(1, -1)
        
        # For single sample, return identity (need time series for correlation)
        if features.shape[0] == 1:
            return np.eye(len(self.feature_names))
        
        # Compute correlation matrix
        df = pd.DataFrame(features, columns=self.feature_names)
        corr_matrix = df.corr().values
        
        return corr_matrix
    
    def predict(self, features: np.ndarray, historical_data: Optional[np.ndarray] = None) -> Dict[str, Any]:
        """
        Analyze correlation structure
        
        Args:
            features: Current feature vector (shape: [n_features])
            historical_data: Rolling window of historical features (shape: [window_size, n_features])
        """
        if self.pca_model is None or self.scaler is None:
            return self._fallback_prediction(features, historical_data)
        
        try:
            if features.ndim == 1:
                features = features.reshape(1, -1)
            
            # Analyze using PCA
            features_scaled = self.scaler.transform(features)
            pca_transformed = self.pca_model.transform(features_scaled)
            
            # Correlation index based on first principal component strength
            first_pc_variance = self.pca_model.explained_variance_ratio_[0]
            correlation_index = float(first_pc_variance * 100)
            
            # Dominant factor strength
            dominant_factor_strength = float(np.abs(pca_transformed[0, 0]))
            
            # Compute correlation matrix if historical data provided
            if historical_data is not None and historical_data.shape[0] > 1:
                corr_matrix = self.compute_correlation_matrix(historical_data)
                avg_correlation = float(np.mean(np.abs(corr_matrix[np.triu_indices_from(corr_matrix, k=1)])))
            else:
                corr_matrix = None
                avg_correlation = correlation_index / 100.0
            
            return {
                'correlation_index': min(correlation_index, 100.0),
                'dominant_factor_strength': dominant_factor_strength,
                'average_correlation': avg_correlation,
                'explained_variance_ratios': self.pca_model.explained_variance_ratio_.tolist(),
                'correlation_matrix': corr_matrix.tolist() if corr_matrix is not None else None,
                'timestamp': datetime.now().isoformat(),
                'model_version': '1.0'
            }
        except Exception as e:
            print(f"Prediction error: {e}")
            return self._fallback_prediction(features, historical_data)
    
    def _fallback_prediction(self, features: np.ndarray, historical_data: Optional[np.ndarray] = None) -> Dict[str, Any]:
        """Statistical fallback without PCA"""
        if features.ndim == 1:
            features = features.reshape(1, -1)
        
        # Compute simple correlation index from feature variance
        feature_variance = np.var(features[0])
        correlation_index = min(feature_variance * 500, 100.0)  # heuristic scaling
        
        # If historical data available, compute true correlation
        if historical_data is not None and historical_data.shape[0] > 1:
            corr_matrix = self.compute_correlation_matrix(historical_data)
            avg_correlation = float(np.mean(np.abs(corr_matrix[np.triu_indices_from(corr_matrix, k=1)])))
            correlation_index = avg_correlation * 100
        else:
            avg_correlation = correlation_index / 100.0
        
        return {
            'correlation_index': correlation_index,
            'dominant_factor_strength': 0.5,
            'average_correlation': avg_correlation,
            'explained_variance_ratios': [0.2, 0.15, 0.12, 0.1, 0.08],
            'correlation_matrix': None,
            'timestamp': datetime.now().isoformat(),
            'model_version': 'fallback'
        }
    
    def save_model(self):
        """Save PCA model and scaler"""
        if self.pca_model is not None and self.scaler is not None:
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            model_data = {
                'pca_model': self.pca_model,
                'scaler': self.scaler,
                'feature_names': self.feature_names
            }
            joblib.dump(model_data, self.model_path)
            print(f" Correlation Index model saved to {self.model_path}")
    
    def load_model(self):
        """Load PCA model and scaler"""
        if not os.path.exists(self.model_path):
            return
        
        try:
            model_data = joblib.load(self.model_path)
            self.pca_model = model_data['pca_model']
            self.scaler = model_data['scaler']
            self.feature_names = model_data.get('feature_names', self.feature_names)
            print(f" Correlation Index model loaded from {self.model_path}")
        except Exception as e:
            print(f"  Could not load model: {e}")


def train_correlation_model(save_path: str = "models/correlation_model.pkl", n_samples: int = 2000) -> Tuple:
    """Training function for orchestration"""
    model = CorrelationIndexModel(model_path=save_path)
    
    X = model.generate_synthetic_training_data(n_samples=n_samples)
    
    metrics = model.train(X)
    model.save_model()
    
    return model, metrics


if __name__ == "__main__":
    model, metrics = train_correlation_model()
    print("\nCorrelation Index Model Training Complete")
    print(f"Metrics: {metrics}")
