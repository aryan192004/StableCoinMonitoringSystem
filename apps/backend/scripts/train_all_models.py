"""
Master Training Script for All ML Models
Trains XGBoost Risk Model, LSTM Liquidity Model, and Isolation Forest Anomaly Model
"""

import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "services"))

from risk_model import train_hackathon_model as train_risk_model
from liquidity_model import train_liquidity_model
from anomaly_model import train_anomaly_model


def main():
    """
    Train all ML models for the stablecoin monitoring system
    """
    print("=" * 70)
    print("STABLECOIN MONITORING SYSTEM - MODEL TRAINING")
    print("=" * 70)
    print()

    # Create models directory if it doesn't exist
    models_dir = Path(__file__).parent.parent / "models"
    models_dir.mkdir(exist_ok=True)
    print(f"Models will be saved to: {models_dir}")
    print()

    # Train XGBoost Risk Model
    print("=" * 70)
    print("1. TRAINING XGBOOST RISK SCORING MODEL")
    print("=" * 70)
    try:
        risk_model, metrics = train_risk_model(save_path=str(models_dir / "risk_model_v1.pkl"))
        print("✅ Risk model training completed successfully!")
    except Exception as e:
        print(f"❌ Risk model training failed: {e}")
    print()

    # Train LSTM Liquidity Prediction Model
    print("=" * 70)
    print("2. TRAINING LSTM LIQUIDITY PREDICTION MODEL")
    print("=" * 70)
    try:
        liquidity_model = train_liquidity_model(save_path=str(models_dir / "liquidity_model.pt"))
        print("✅ Liquidity model training completed successfully!")
    except Exception as e:
        print(f"❌ Liquidity model training failed: {e}")
    print()

    # Train Isolation Forest Anomaly Detection Model
    print("=" * 70)
    print("3. TRAINING ISOLATION FOREST ANOMALY DETECTION MODEL")
    print("=" * 70)
    try:
        anomaly_model = train_anomaly_model(
            save_path=str(models_dir / "anomaly_model.pkl"), contamination=0.1
        )
        print("✅ Anomaly model training completed successfully!")
    except Exception as e:
        print(f"❌ Anomaly model training failed: {e}")
    print()

    # Summary
    print("=" * 70)
    print("TRAINING SUMMARY")
    print("=" * 70)
    print()
    print(f"Models saved in: {models_dir}")
    print()

    # List trained models
    models = [
        ("risk_model_v1.pkl", "XGBoost Risk Scoring Model"),
        ("liquidity_model.pt", "LSTM Liquidity Prediction Model"),
        ("liquidity_model_scaler.pkl", "Liquidity Model Scaler"),
        ("anomaly_model.pkl", "Isolation Forest Anomaly Model"),
        ("anomaly_model_scaler.pkl", "Anomaly Model Scaler"),
    ]

    print("Trained Models:")
    for filename, description in models:
        filepath = models_dir / filename
        if filepath.exists():
            size = filepath.stat().st_size / 1024  # KB
            print(f"  ✅ {description}")
            print(f"     File: {filename} ({size:.1f} KB)")
        else:
            print(f"  ❌ {description}")
            print(f"     File: {filename} (not found)")

    print()
    print("=" * 70)
    print("ALL TRAINING COMPLETE!")
    print("=" * 70)
    print()
    print("Next steps:")
    print("  1. Update main.py to load these models")
    print("  2. Test API endpoints with trained models")
    print("  3. Integrate with frontend dashboard")
    print()


if __name__ == "__main__":
    main()
