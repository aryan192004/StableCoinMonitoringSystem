"""Compatibility wrapper for frameworks looking for `api/main.py`."""
from main import app as app

__all__ = ["app"]
