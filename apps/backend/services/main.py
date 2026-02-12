from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from dotenv import load_dotenv
import os

from .risk_engine.router import router as risk_router
from .liquidity_monitor.router import router as liquidity_router

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    print("🚀 FastAPI Services starting up...")
    yield
    print("👋 FastAPI Services shutting down...")


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
