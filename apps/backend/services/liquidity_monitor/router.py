from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime

router = APIRouter()


class OrderBookDepth(BaseModel):
    """Order book depth model"""

    bids: float
    asks: float
    spread: float


class ExchangeLiquidity(BaseModel):
    """Exchange liquidity model"""

    exchange: str
    depth: OrderBookDepth
    volume_24h: float


class LiquidityAnalysisRequest(BaseModel):
    """Request model for liquidity analysis"""

    stablecoin_id: str
    exchanges: List[str]


class LiquidityAnalysisResponse(BaseModel):
    """Response model for liquidity analysis"""

    stablecoin_id: str
    total_liquidity: float
    exchanges: List[ExchangeLiquidity]
    avg_spread: float
    liquidity_score: float
    warnings: List[str]
    analyzed_at: datetime


@router.post("/analyze", response_model=LiquidityAnalysisResponse)
async def analyze_liquidity(request: LiquidityAnalysisRequest) -> LiquidityAnalysisResponse:
    """
    Analyze liquidity across multiple exchanges

    - **stablecoin_id**: ID of the stablecoin to analyze
    - **exchanges**: List of exchange names to check
    """
    try:
        # TODO: Implement actual liquidity fetching from exchanges
        # This is a placeholder implementation

        exchanges_data = []
        total_liquidity = 0
        total_spread = 0
        warnings = []

        for exchange in request.exchanges:
            # Placeholder data
            depth = OrderBookDepth(bids=5000000, asks=5100000, spread=0.0001)

            exchange_data = ExchangeLiquidity(exchange=exchange, depth=depth, volume_24h=1000000)

            exchanges_data.append(exchange_data)
            total_liquidity += depth.bids + depth.asks
            total_spread += depth.spread

        avg_spread = total_spread / len(request.exchanges) if request.exchanges else 0

        # Calculate liquidity score (0-1)
        liquidity_score = min(total_liquidity / 100000000, 1.0)

        # Check for warnings
        if liquidity_score < 0.3:
            warnings.append("Low liquidity detected")
        if avg_spread > 0.005:
            warnings.append("High bid-ask spread")

        return LiquidityAnalysisResponse(
            stablecoin_id=request.stablecoin_id,
            total_liquidity=round(total_liquidity, 2),
            exchanges=exchanges_data,
            avg_spread=round(avg_spread, 6),
            liquidity_score=round(liquidity_score, 4),
            warnings=warnings,
            analyzed_at=datetime.now(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Liquidity analysis failed: {str(e)}")


@router.get("/health")
async def health():
    """Health check for liquidity monitor"""
    return {"status": "healthy", "service": "liquidity_monitor"}
