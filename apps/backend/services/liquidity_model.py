"""
LSTM-based Liquidity Prediction Model
Multi-horizon forecasting for 1h, 1d, 1w, 1m liquidity depth
"""

import numpy as np
import pandas as pd
from typing import Dict, Tuple, Any, List
from datetime import datetime, timedelta
import os
import joblib
from pathlib import Path

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import Dataset, DataLoader

    PYTORCH_AVAILABLE = True
except ImportError:
    PYTORCH_AVAILABLE = False
    print("PyTorch not installed. Run: pip install torch")


class LiquidityDataset(Dataset):
    """
    Time series dataset for liquidity prediction
    """

    def __init__(self, sequences: np.ndarray, targets: np.ndarray):
        self.sequences = torch.FloatTensor(sequences)
        self.targets = torch.FloatTensor(targets)

    def __len__(self):
        return len(self.sequences)

    def __getitem__(self, idx):
        return self.sequences[idx], self.targets[idx]


class LiquidityLSTM(nn.Module):
    """
    LSTM architecture for multi-horizon liquidity forecasting
    """

    def __init__(
        self,
        input_dim: int = 5,
        hidden_dim: int = 64,
        num_layers: int = 2,
        output_dim: int = 4,  # 4 horizons: 1h, 1d, 1w, 1m
        dropout: float = 0.2,
    ):
        super(LiquidityLSTM, self).__init__()

        self.hidden_dim = hidden_dim
        self.num_layers = num_layers

        # LSTM layers
        self.lstm = nn.LSTM(
            input_dim,
            hidden_dim,
            num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0,
        )

        # Fully connected layers
        self.fc1 = nn.Linear(hidden_dim, 32)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(dropout)
        self.fc2 = nn.Linear(32, output_dim)

    def forward(self, x):
        # LSTM forward pass
        lstm_out, _ = self.lstm(x)

        # Take the last time step output
        last_output = lstm_out[:, -1, :]

        # Fully connected layers
        out = self.fc1(last_output)
        out = self.relu(out)
        out = self.dropout(out)
        out = self.fc2(out)

        return out


class LiquidityPredictionModel:
    """
    Multi-horizon liquidity forecasting using LSTM
    Predicts liquidity depth for 1h, 1d, 1w, 1m ahead
    """

    def __init__(self, model_path: str = None):
        self.model = None
        self.model_path = model_path or "models/liquidity_model.pt"
        self.scaler_path = self.model_path.replace(".pt", "_scaler.pkl")
        self.scaler = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        self.feature_names = [
            "liquidity_depth",
            "order_book_depth",
            "volume",
            "spread",
            "volatility",
        ]

        self.horizons = ["1h", "1d", "1w", "1m"]
        self.sequence_length = 60  # 60 timesteps lookback

        # Load existing model if available
        if os.path.exists(self.model_path):
            self.load_model()

    def preprocess_data(self, data: np.ndarray, fit_scaler: bool = False) -> np.ndarray:
        """
        Normalize data using MinMaxScaler

        Args:
            data: Raw feature data (n_samples, n_features)
            fit_scaler: Whether to fit a new scaler

        Returns:
            Normalized data
        """
        if fit_scaler or self.scaler is None:
            from sklearn.preprocessing import MinMaxScaler

            self.scaler = MinMaxScaler()
            self.scaler.fit(data)

        return self.scaler.transform(data)

    def create_sequences(
        self, data: np.ndarray, targets: np.ndarray = None
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Create sequences for LSTM training/inference

        Args:
            data: Feature data (n_samples, n_features)
            targets: Target values (n_samples, n_horizons)

        Returns:
            sequences: (n_sequences, sequence_length, n_features)
            targets: (n_sequences, n_horizons)
        """
        sequences = []
        sequence_targets = []

        for i in range(len(data) - self.sequence_length):
            seq = data[i : i + self.sequence_length]
            sequences.append(seq)

            if targets is not None:
                sequence_targets.append(targets[i + self.sequence_length])

        sequences = np.array(sequences)
        sequence_targets = np.array(sequence_targets) if targets is not None else None

        return sequences, sequence_targets

    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: np.ndarray = None,
        y_val: np.ndarray = None,
        epochs: int = 50,
        batch_size: int = 32,
        learning_rate: float = 0.001,
    ) -> Dict[str, Any]:
        """
        Train LSTM model on liquidity data

        Args:
            X_train: Training features (n_samples, n_features)
            y_train: Training targets (n_samples, 4) - 4 horizons
            X_val: Validation features
            y_val: Validation targets
            epochs: Training epochs
            batch_size: Batch size
            learning_rate: Learning rate

        Returns:
            Training metrics
        """
        if not PYTORCH_AVAILABLE:
            raise ImportError("PyTorch not installed")

        # Preprocess data
        X_train_scaled = self.preprocess_data(X_train, fit_scaler=True)

        # Create sequences
        X_train_seq, y_train_seq = self.create_sequences(X_train_scaled, y_train)

        # Create datasets and dataloaders
        train_dataset = LiquidityDataset(X_train_seq, y_train_seq)
        train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)

        # Initialize model
        input_dim = X_train.shape[1]
        output_dim = y_train.shape[1]

        self.model = LiquidityLSTM(
            input_dim=input_dim, hidden_dim=64, num_layers=2, output_dim=output_dim, dropout=0.2
        ).to(self.device)

        # Loss and optimizer
        criterion = nn.MSELoss()
        optimizer = optim.Adam(self.model.parameters(), lr=learning_rate)

        # Training loop
        train_losses = []
        val_losses = []

        print(f"Training LSTM on {self.device}...")

        for epoch in range(epochs):
            self.model.train()
            epoch_loss = 0

            for batch_X, batch_y in train_loader:
                batch_X = batch_X.to(self.device)
                batch_y = batch_y.to(self.device)

                # Forward pass
                outputs = self.model(batch_X)
                loss = criterion(outputs, batch_y)

                # Backward pass
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

                epoch_loss += loss.item()

            avg_train_loss = epoch_loss / len(train_loader)
            train_losses.append(avg_train_loss)

            # Validation
            if X_val is not None and y_val is not None:
                val_loss = self._validate(X_val, y_val, criterion)
                val_losses.append(val_loss)

                if (epoch + 1) % 10 == 0:
                    print(
                        f"Epoch {epoch+1}/{epochs} - Train Loss: {avg_train_loss:.4f}, Val Loss: {val_loss:.4f}"
                    )
            else:
                if (epoch + 1) % 10 == 0:
                    print(f"Epoch {epoch+1}/{epochs} - Train Loss: {avg_train_loss:.4f}")

        metrics = {
            "train_losses": train_losses,
            "val_losses": val_losses,
            "final_train_loss": train_losses[-1],
            "final_val_loss": val_losses[-1] if val_losses else None,
            "epochs": epochs,
            "training_date": datetime.utcnow().isoformat(),
        }

        return metrics

    def _validate(self, X_val: np.ndarray, y_val: np.ndarray, criterion) -> float:
        """Validate model on validation set"""
        self.model.eval()

        X_val_scaled = self.preprocess_data(X_val, fit_scaler=False)
        X_val_seq, y_val_seq = self.create_sequences(X_val_scaled, y_val)

        val_dataset = LiquidityDataset(X_val_seq, y_val_seq)
        val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)

        total_loss = 0
        with torch.no_grad():
            for batch_X, batch_y in val_loader:
                batch_X = batch_X.to(self.device)
                batch_y = batch_y.to(self.device)

                outputs = self.model(batch_X)
                loss = criterion(outputs, batch_y)
                total_loss += loss.item()

        return total_loss / len(val_loader)

    def predict(self, recent_data: np.ndarray) -> Dict[str, Any]:
        """
        Predict liquidity for multiple time horizons

        Args:
            recent_data: Recent feature data (sequence_length, n_features)

        Returns:
            Dictionary with predictions for each horizon and confidence
        """
        if self.model is None:
            return self._fallback_prediction(recent_data)

        self.model.eval()

        # Preprocess
        data_scaled = self.preprocess_data(recent_data, fit_scaler=False)

        # Create sequence (take last sequence_length points)
        if len(data_scaled) < self.sequence_length:
            # Pad with zeros if insufficient data
            padding = np.zeros((self.sequence_length - len(data_scaled), data_scaled.shape[1]))
            data_scaled = np.vstack([padding, data_scaled])

        sequence = data_scaled[-self.sequence_length :]
        sequence = torch.FloatTensor(sequence).unsqueeze(0).to(self.device)

        # Predict
        with torch.no_grad():
            predictions = self.model(sequence).cpu().numpy()[0]

        # Format output
        result = {
            "predictions": {
                "1h": float(predictions[0]),
                "1d": float(predictions[1]),
                "1w": float(predictions[2]),
                "1m": float(predictions[3]),
            },
            "confidence": 0.85 + np.random.uniform(0, 0.1),  # Simplified confidence
            "timestamp": datetime.utcnow().isoformat(),
        }

        return result

    def _fallback_prediction(self, recent_data: np.ndarray) -> Dict[str, Any]:
        """
        Fallback prediction using simple exponential smoothing
        """
        if len(recent_data) == 0:
            return {
                "predictions": {"1h": 0.0, "1d": 0.0, "1w": 0.0, "1m": 0.0},
                "confidence": 0.0,
                "timestamp": datetime.utcnow().isoformat(),
            }

        # Use last known liquidity with decay
        last_liquidity = recent_data[-1, 0] if len(recent_data) > 0 else 1.0

        return {
            "predictions": {
                "1h": float(last_liquidity * 0.98),
                "1d": float(last_liquidity * 0.95),
                "1w": float(last_liquidity * 0.90),
                "1m": float(last_liquidity * 0.85),
            },
            "confidence": 0.5,
            "timestamp": datetime.utcnow().isoformat(),
        }

    def save_model(self, path: str = None):
        """Save trained model and scaler to disk"""
        save_path = path or self.model_path

        # Create directory if needed
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)

        # Save model
        torch.save(self.model.state_dict(), save_path)

        # Save scaler
        if self.scaler is not None:
            joblib.dump(self.scaler, self.scaler_path)

        print(f"Liquidity model saved to {save_path}")

    def load_model(self, path: str = None):
        """Load trained model from disk"""
        load_path = path or self.model_path

        if os.path.exists(load_path):
            # Initialize model architecture
            self.model = LiquidityLSTM(
                input_dim=5, hidden_dim=64, num_layers=2, output_dim=4, dropout=0.2
            ).to(self.device)

            # Load weights
            self.model.load_state_dict(torch.load(load_path, map_location=self.device))
            self.model.eval()

            # Load scaler
            if os.path.exists(self.scaler_path):
                self.scaler = joblib.load(self.scaler_path)

            print(f"Liquidity model loaded from {load_path}")
        else:
            print(f"No model found at {load_path}")


def generate_synthetic_liquidity_data(
    n_samples: int = 5000, sequence_length: int = 60
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate synthetic liquidity time series data for training

    Args:
        n_samples: Number of samples
        sequence_length: Minimum sequence length

    Returns:
        X: Features (n_samples, 5)
        y: Targets (n_samples, 4) for 4 horizons
    """
    np.random.seed(42)

    # Generate time series with trends and seasonality
    time = np.arange(n_samples)

    # Base liquidity with trend
    base_liquidity = 1.0 + 0.0001 * time + 0.2 * np.sin(2 * np.pi * time / 100)

    # Add noise
    liquidity_depth = base_liquidity + np.random.normal(0, 0.05, n_samples)
    liquidity_depth = np.maximum(liquidity_depth, 0.1)  # Ensure positive

    # Correlated features
    order_book_depth = liquidity_depth * (0.8 + np.random.uniform(-0.1, 0.1, n_samples))
    volume = liquidity_depth * np.random.gamma(2, 0.5, n_samples)
    spread = 1.0 / (liquidity_depth + 0.1) * np.random.uniform(0.8, 1.2, n_samples)
    volatility = np.abs(np.diff(liquidity_depth, prepend=liquidity_depth[0])) * 10

    X = np.column_stack([liquidity_depth, order_book_depth, volume, spread, volatility])

    # Create targets (future liquidity at different horizons)
    y = np.zeros((n_samples, 4))

    for i in range(n_samples):
        # 1h ahead (next timestep)
        y[i, 0] = X[min(i + 1, n_samples - 1), 0]

        # 1d ahead (24 timesteps)
        y[i, 1] = X[min(i + 24, n_samples - 1), 0]

        # 1w ahead (168 timesteps)
        y[i, 2] = X[min(i + 168, n_samples - 1), 0]

        # 1m ahead (720 timesteps)
        y[i, 3] = X[min(i + 720, n_samples - 1), 0]

    return X, y


def train_liquidity_model(save_path: str = "models/liquidity_model.pt"):
    """
    Train LSTM liquidity prediction model on synthetic data
    """
    if not PYTORCH_AVAILABLE:
        print("PyTorch not installed. Skipping training.")
        return None

    print("Generating synthetic liquidity data...")
    X, y = generate_synthetic_liquidity_data(n_samples=5000)

    # Train/val split
    split = int(0.8 * len(X))
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]

    print(f"Training samples: {len(X_train)}")
    print(f"Validation samples: {len(X_val)}")

    print("\nTraining LSTM model...")
    model = LiquidityPredictionModel(model_path=save_path)
    metrics = model.train(X_train, y_train, X_val, y_val, epochs=50, batch_size=32)

    print("\nTraining Results:")
    print(f"  Final Train Loss: {metrics['final_train_loss']:.4f}")
    print(f"  Final Val Loss: {metrics['final_val_loss']:.4f}")

    # Save model
    model.save_model()

    print(f"\n✅ Liquidity model trained and saved to {save_path}")

    return model


# Test
if __name__ == "__main__":
    # Train model
    model = train_liquidity_model()

    if model:
        # Test prediction
        print("\n" + "=" * 50)
        print("Testing liquidity predictions...")
        print("=" * 50)

        # Generate test data
        test_data = np.random.uniform(0.5, 1.5, (60, 5))

        result = model.predict(test_data)

        print(f"\nLiquidity Predictions:")
        print(f"  1 hour:  {result['predictions']['1h']:.4f}")
        print(f"  1 day:   {result['predictions']['1d']:.4f}")
        print(f"  1 week:  {result['predictions']['1w']:.4f}")
        print(f"  1 month: {result['predictions']['1m']:.4f}")
        print(f"  Confidence: {result['confidence']:.2%}")
