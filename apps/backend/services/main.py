from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
import uvicorn
from dotenv import load_dotenv
import os
import numpy as np

from services.risk_engine.router import router as risk_router
from services.liquidity_monitor.router import router as liquidity_router

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    print("FastAPI Services starting up...")
    yield
    print("FastAPI Services shutting down...")


app = FastAPI(
    title="Stablecoin Monitoring Services",
    description="FastAPI services for compute-intensive stablecoin analytics",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(risk_router, prefix="/api/risk", tags=["Risk Engine"])
app.include_router(liquidity_router, prefix="/api/liquidity", tags=["Liquidity Monitor"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Stablecoin Monitoring FastAPI Services",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/analytics/stability/{stablecoin}")
async def get_market_stability(stablecoin: str):
    """
    Get Market Stability Index for a stablecoin.
    
    Returns:
    - stability_index: 0-100 score (higher = more stable)
    - stability_level: Stable/Moderate/Unstable
    - confidence: Model confidence
    """
    try:
        # TODO: Integrate MarketStabilityModel
        # For now, return mock predictions
        np.random.seed(hash(stablecoin) % 2**32)
        stability_index = float(np.random.uniform(60, 95))
        
        if stability_index >= 75:
            level = "Stable"
        elif stability_index >= 50:
            level = "Moderate"
        else:
            level = "Unstable"
        
        return {
            "stablecoin": stablecoin.upper(),
            "stability_index": stability_index,
            "stability_level": level,
            "confidence": 0.88,
            "timestamp": datetime.utcnow().isoformat(),
            "model_version": "stability_v1.0",
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/analytics/systemic-risk")
async def get_systemic_risk():
    """
    Get Systemic Risk Level across the stablecoin ecosystem.
    
    Returns:
    - systemic_risk_level: Low/Medium/High
    - risk_class: 0 (Low), 1 (Medium), 2 (High)
    - probabilities: Probability distribution across classes
    """
    try:
        # TODO: Integrate SystemicRiskModel
        # For now, return mock predictions
        return {
            "systemic_risk_level": "Low",
            "risk_class": 0,
            "probabilities": {
                "Low": 0.75,
                "Medium": 0.20,
                "High": 0.05
            },
            "confidence": 0.85,
            "timestamp": datetime.utcnow().isoformat(),
            "model_version": "systemic_risk_v1.0",
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/analytics/correlation")
async def get_correlation_index():
    """
    Get Correlation Index for cross-stablecoin correlations.
    
    Returns:
    - correlation_index: 0-100 score (higher = more correlated)
    - dominant_factor_strength: Strength of principal component
    - average_correlation: Mean pairwise correlation
    """
    try:
        # TODO: Integrate CorrelationIndexModel
        # For now, return mock predictions
        return {
            "correlation_index": 42.5,
            "dominant_factor_strength": 0.65,
            "average_correlation": 0.425,
            "explained_variance_ratios": [0.35, 0.22, 0.15, 0.12, 0.08],
            "timestamp": datetime.utcnow().isoformat(),
            "model_version": "correlation_v1.0",
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/analytics/volatility/{stablecoin}")
async def get_volatility_score(stablecoin: str):
    """
    Get Volatility Score for a stablecoin.
    
    Returns:
    - volatility_score: 0-100 score (higher = more volatile)
    - volatility_regime: Low/Medium/High
    - historical_volatility: Recent volatility measurement
    """
    try:
        # TODO: Integrate VolatilityScoreModel
        # For now, return mock predictions
        np.random.seed(hash(stablecoin) % 2**32)
        volatility_score = float(np.random.uniform(5, 35))
        
        if volatility_score < 30:
            regime = "Low"
        elif volatility_score < 70:
            regime = "Medium"
        else:
            regime = "High"
        
        return {
            "stablecoin": stablecoin.upper(),
            "volatility_score": volatility_score,
            "volatility_regime": regime,
            "historical_volatility": volatility_score / 3000.0,
            "timestamp": datetime.utcnow().isoformat(),
            "model_version": "volatility_v1.0",
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "fastapi-services",
    }


if __name__ == "__main__":
    port = int(os.getenv("FASTAPI_PORT", "8001"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
