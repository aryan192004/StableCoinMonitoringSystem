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
        # All values replaced with '-'
        return LiquidityAnalysisResponse(
            stablecoin_id=request.stablecoin_id,
            total_liquidity='-',
            exchanges=[],
            avg_spread='-',
            liquidity_score='-',
            warnings=['-'],
            analyzed_at=datetime.now(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Liquidity analysis failed: {str(e)}")


@router.get("/health")
async def health():
    """Health check for liquidity monitor"""
    return {"status": "healthy", "service": "liquidity_monitor"}
