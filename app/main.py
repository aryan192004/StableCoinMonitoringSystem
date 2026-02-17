"""Compatibility wrapper for frameworks looking for `app/main.py`."""
from main import app as app

__all__ = ["app"]
