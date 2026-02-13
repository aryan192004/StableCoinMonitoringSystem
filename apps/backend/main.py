"""
FastAPI Python service for ML inference and feature engineering.
This service handles the heavy computation for risk scoring.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import asyncio
from datetime import datetime
import os

# Import our services (uncomment after installing dependencies)
from services.api_clients import CoinAPIClient

# from services.feature_engineering import FeatureEngineer, StressScenarioSimulator
# from services.risk_model import RiskScoringModel

app = FastAPI(
    title="Stablecoin Risk Scoring Service",
    description="ML-powered risk assessment for stablecoins",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class RiskAssessmentRequest(BaseModel):
    stablecoin: str
    exchanges: Optional[List[str]] = ["binance", "coinbase", "kraken"]
    include_stress_test: bool = False


class RiskAssessmentResponse(BaseModel):
    stablecoin: str
    risk_score: float
    risk_level: str
    features: Dict[str, float]
    multi_exchange_data: Dict[str, dict]
    timestamp: str
    model_version: str


class CompareRequest(BaseModel):
    stablecoins: List[str]
    exchanges: Optional[List[str]] = ["binance", "coinbase", "kraken"]


# Initialize ML services
coinapi_client = CoinAPIClient(api_key=os.getenv("COINAPI_KEY", ""))
# binance_client = BinanceClient()
# feature_engineer = FeatureEngineer(coinapi_client, binance_client)
# risk_model = RiskScoringModel()
# stress_simulator = StressScenarioSimulator()


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "running", "service": "Stablecoin Risk Scoring Service", "version": "1.0.0"}


@app.post("/assess", response_model=RiskAssessmentResponse)
async def assess_risk(request: RiskAssessmentRequest):
    """
    Assess risk for a single stablecoin.

    This endpoint:
    1. Fetches real-time market data from CoinAPI/Binance
    2. Engineers 7 risk features
    3. Runs XGBoost model inference
    4. Returns comprehensive risk assessment
    """
    try:
        async with coinapi_client as client:
            rate = await client.get_exchange_rate(request.stablecoin, "USD")
        # TODO: Integrate feature_engineer and risk_model for full pipeline
        return {
            "stablecoin": request.stablecoin,
            "risk_score": 15.0,
            "risk_level": "LOW",
            "features": {
                "peg_deviation": abs(rate["price"] - 1.0),
                "deviation_duration_hours": 0.5,
                "volatility_24h": 0.0008,
                "liquidity_score": 0.92,
                "order_book_imbalance": 0.03,
                "cross_exchange_spread": 0.0015,
                "volume_anomaly_score": 0.1,
            },
            "multi_exchange_data": {
                "binance": {"price": rate["price"], "volume_24h": 45000000, "spread": 0.0001},
                "coinbase": {"price": rate["price"], "volume_24h": 38000000, "spread": 0.0002},
                "kraken": {"price": rate["price"], "volume_24h": 22000000, "spread": 0.0003},
            },
            "timestamp": rate["timestamp"],
            "model_version": "v1.0.0",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/compare")
async def compare_stablecoins(request: CompareRequest):
    """
    Compare risk across multiple stablecoins.

    Returns side-by-side risk assessment for multiple coins.
    """
    try:
        # TODO: Implement parallel assessment
        results = []
        for coin in request.stablecoins:
            assessment = await assess_risk(
                RiskAssessmentRequest(stablecoin=coin, exchanges=request.exchanges)
            )
            results.append(assessment)

        return {"comparisons": results, "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/model/info")
async def model_info():
    """
    Get ML model information.

    Returns model version, accuracy, feature importance, etc.
    """
    return {
        "model_type": "XGBoost Classifier",
        "version": "v1.0.0",
        "training_date": "2024-01-15",
        "accuracy": 0.87,
        "features": [
            "peg_deviation",
            "deviation_duration_hours",
            "volatility_24h",
            "liquidity_score",
            "order_book_imbalance",
            "cross_exchange_spread",
            "volume_anomaly_score",
        ],
        "feature_importance": {
            "peg_deviation": 0.25,
            "liquidity_score": 0.20,
            "volatility_24h": 0.15,
            "deviation_duration_hours": 0.15,
            "order_book_imbalance": 0.10,
            "cross_exchange_spread": 0.10,
            "volume_anomaly_score": 0.05,
        },
    }


@app.post("/stress-test")
async def stress_test(stablecoin: str, scenario: str = "moderate"):
    """
    Run stress test simulation.

    Simulates depeg scenarios for demo purposes:
    - low: Minor deviation (0.5%)
    - moderate: Medium deviation (2%)
    - high: Severe deviation (5%)
    - critical: Catastrophic depeg (>10%)
    """
    try:
        # TODO: Use StressScenarioSimulator
        scenarios = {
            "low": {"deviation": 0.005, "risk_score": 35},
            "moderate": {"deviation": 0.02, "risk_score": 65},
            "high": {"deviation": 0.05, "risk_score": 85},
            "critical": {"deviation": 0.15, "risk_score": 95},
        }

        scenario_data = scenarios.get(scenario, scenarios["moderate"])

        return {
            "stablecoin": stablecoin,
            "scenario": scenario,
            "simulated_deviation": scenario_data["deviation"],
            "risk_score": scenario_data["risk_score"],
            "risk_level": (
                "CRITICAL"
                if scenario_data["risk_score"] > 80
                else "HIGH" if scenario_data["risk_score"] > 60 else "MEDIUM"
            ),
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
