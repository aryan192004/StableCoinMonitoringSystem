from fastapi import APIRouter, HTTPException
from .calculator import calculate_risk_score, RiskCalculationRequest, RiskCalculationResponse

router = APIRouter()


@router.post("/calculate", response_model=RiskCalculationResponse)
async def calculate_risk(request: RiskCalculationRequest) -> RiskCalculationResponse:
    """
    Calculate risk score for a stablecoin based on multiple factors

    - **peg_deviation**: Percentage deviation from $1.00
    - **liquidity_depth**: Total order book depth in USD
    - **volume_24h**: 24-hour trading volume
    - **volume_7d**: 7-day trading volume
    - **reserve_transparency_score**: Reserve transparency rating (0-1)
    """
    try:
        result = calculate_risk_score(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk calculation failed: {str(e)}")


@router.get("/health")
async def health():
    """Health check for risk engine"""
    return {"status": "healthy", "service": "risk_engine"}
