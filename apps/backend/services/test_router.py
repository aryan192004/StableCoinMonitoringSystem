"""Test script to verify market_data router registration"""

import sys
from pathlib import Path

# Add services directory to path
services_dir = Path(__file__).parent
sys.path.insert(0, str(services_dir))

print("=" * 60)
print("Testing Market Data Router Registration")
print("=" * 60)

# Import the app
from main import app

# Check registered routes
print(f"\nTotal routes in app: {len(app.routes)}")
print("\nAll routes:")
for route in app.routes:
    if hasattr(route, "path"):
        print(f"  - {route.path}")

# Check specifically for market routes
market_routes = [r for r in app.routes if hasattr(r, "path") and "/market" in r.path]
print(f"\nMarket routes found: {len(market_routes)}")
for route in market_routes:
    print(f"  - {route.path}")

# Try to import market_data_router directly
print("\n" + "=" * 60)
print("Direct import test:")
print("=" * 60)
try:
    from market_data.router import router as market_data_router

    print(f"✓ Market data router imported successfully")
    print(f"✓ Has {len(market_data_router.routes)} routes")
    for route in market_data_router.routes:
        if hasattr(route, "path"):
            print(f"  - {route.path}")
except Exception as e:
    print(f"✗ Failed to import market data router: {e}")
    import traceback

    traceback.print_exc()
