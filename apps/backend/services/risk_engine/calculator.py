from pydantic import BaseModel, Field
from typing import Dict
from datetime import datetime


class RiskFactors(BaseModel):
    """Risk calculation factors"""

    peg_stability: float = Field(..., ge=0, le=1, description="Peg stability score")
    liquidity: float = Field(..., ge=0, le=1, description="Liquidity score")
    volume_volatility: float = Field(..., ge=0, le=1, description="Volume volatility score")
    reserve_transparency: float = Field(..., ge=0, le=1, description="Reserve transparency score")


class RiskCalculationRequest(BaseModel):
    """Request model for risk calculation"""

    stablecoin_id: str
    peg_deviation: float
    liquidity_depth: float
    volume_24h: float
    volume_7d: float
    reserve_transparency_score: float


class RiskCalculationResponse(BaseModel):
    """Response model for risk calculation"""

    stablecoin_id: str
    overall_score: float = Field(..., ge=0, le=1)
    risk_level: str = Field(..., pattern="^(low|medium|high)$")
    factors: RiskFactors
    calculated_at: datetime


def calculate_risk_score(request: RiskCalculationRequest) -> RiskCalculationResponse:
    """
    Calculate risk score based on weighted factors

    Risk Score Formula:
    - Peg deviation: 30%
    - Liquidity depth: 25%
    - Volume volatility: 20%
    - Reserve transparency: 25%
    """
    # Peg stability score (inverse of deviation)
    peg_stability = min(abs(request.peg_deviation) / 1.0, 1.0)

    # Liquidity score (normalized)
    liquidity_score = min(request.liquidity_depth / 10000000, 1.0)

    # Volume volatility (7d vs 24h)
    avg_volume = request.volume_7d / 7
    volatility = abs(request.volume_24h - avg_volume) / avg_volume if avg_volume > 0 else 0
    volume_volatility_score = min(volatility, 1.0)

    # Reserve transparency (direct)
    transparency_score = request.reserve_transparency_score

    # Weighted calculation
    overall_score = (
        peg_stability * 0.30
        + (1 - liquidity_score) * 0.25  # Invert because higher liquidity = lower risk
        + volume_volatility_score * 0.20
        + (1 - transparency_score) * 0.25  # Invert because higher transparency = lower risk
    )

    # Determine risk level
    if overall_score < 0.3:
        risk_level = "low"
    elif overall_score < 0.7:
        risk_level = "medium"
    else:
        risk_level = "high"

    return RiskCalculationResponse(
        stablecoin_id=request.stablecoin_id,
        overall_score=round(overall_score, 4),
        risk_level=risk_level,
        factors=RiskFactors(
            peg_stability=round(peg_stability, 4),
            liquidity=round(liquidity_score, 4),
            volume_volatility=round(volume_volatility_score, 4),
            reserve_transparency=round(transparency_score, 4),
        ),
        calculated_at=datetime.now(),
    )
