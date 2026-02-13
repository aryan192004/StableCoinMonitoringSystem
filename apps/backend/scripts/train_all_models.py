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
from stability_model import train_stability_model
from systemic_risk_model import train_systemic_risk_model
from correlation_model import train_correlation_model
from volatility_model import train_volatility_model


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

    # Train Market Stability Index Model
    print("=" * 70)
    print("4. TRAINING MARKET STABILITY INDEX MODEL (LightGBM)")
    print("=" * 70)
    try:
        stability_model, metrics = train_stability_model(
            save_path=str(models_dir / "stability_model.pkl")
        )
        print("✅ Market Stability Index model training completed successfully!")
    except Exception as e:
        print(f"❌ Market Stability Index model training failed: {e}")
    print()

    # Train Systemic Risk Level Model
    print("=" * 70)
    print("5. TRAINING SYSTEMIC RISK LEVEL MODEL (XGBoost)")
    print("=" * 70)
    try:
        systemic_risk_model, metrics = train_systemic_risk_model(
            save_path=str(models_dir / "systemic_risk_model.pkl")
        )
        print("✅ Systemic Risk Level model training completed successfully!")
    except Exception as e:
        print(f"❌ Systemic Risk Level model training failed: {e}")
    print()

    # Train Correlation Index Model
    print("=" * 70)
    print("6. TRAINING CORRELATION INDEX MODEL (PCA)")
    print("=" * 70)
    try:
        correlation_model, metrics = train_correlation_model(
            save_path=str(models_dir / "correlation_model.pkl")
        )
        print("✅ Correlation Index model training completed successfully!")
    except Exception as e:
        print(f"❌ Correlation Index model training failed: {e}")
    print()

    # Train Volatility Score Model
    print("=" * 70)
    print("7. TRAINING VOLATILITY SCORE MODEL (Ridge Regression)")
    print("=" * 70)
    try:
        volatility_model, metrics = train_volatility_model(
            save_path=str(models_dir / "volatility_model.pkl")
        )
        print("✅ Volatility Score model training completed successfully!")
    except Exception as e:
        print(f"❌ Volatility Score model training failed: {e}")
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
        ("stability_model.pkl", "Market Stability Index Model (LightGBM)"),
        ("systemic_risk_model.pkl", "Systemic Risk Level Model (XGBoost)"),
        ("correlation_model.pkl", "Correlation Index Model (PCA)"),
        ("volatility_model.pkl", "Volatility Score Model (Ridge)"),
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
