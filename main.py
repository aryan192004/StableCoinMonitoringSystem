"""
Repository root FastAPI entrypoint shim for Vercel deployment.

This file loads the real FastAPI `app` defined in `apps/backend/main.py`.
It ensures the backend package directory is on `sys.path` so imports inside
`apps/backend/main.py` (like `from services...`) resolve correctly.
"""

from __future__ import annotations

import os
import sys
import runpy

ROOT_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.join(ROOT_DIR, "apps", "backend")
BACKEND_MAIN = os.path.join(BACKEND_DIR, "main.py")

# Ensure backend package imports (services, etc.) resolve
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

backend_globals = runpy.run_path(BACKEND_MAIN)
app = backend_globals.get("app")

if app is None:
    # Fallback minimal app so Vercel doesn't fail with a missing app variable
    from fastapi import FastAPI

    app = FastAPI(title="stablecoin-backend-fallback")

__all__ = ["app"]
