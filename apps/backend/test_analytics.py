"""
Integration test for ML Analytics endpoints
Tests all four new analytics endpoints
"""
import requests
import sys

BASE_URL = "http://localhost:8001"

def test_analytics_endpoints():
    """Test all analytics endpoints"""
    print("=" * 70)
    print("TESTING ML ANALYTICS ENDPOINTS")
    print("=" * 70)
    print()
    
    tests = [
        ("Market Stability Index", f"{BASE_URL}/analytics/stability/usdt"),
        ("Systemic Risk Level", f"{BASE_URL}/analytics/systemic-risk"),
        ("Correlation Index", f"{BASE_URL}/analytics/correlation"),
        ("Volatility Score", f"{BASE_URL}/analytics/volatility/usdt")
    ]
    
    results = []
    
    for name, url in tests:
        print(f"Testing {name}...")
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"   {name}: SUCCESS")
                print(f"     Status: {data.get('status', 'N/A')}")
                print(f"     Model Version: {data.get('model_version', 'N/A')}")
                results.append((name, True, None))
            else:
                print(f"   {name}: FAILED (Status {response.status_code})")
                results.append((name, False, f"Status {response.status_code}"))
        except Exception as e:
            print(f"   {name}: ERROR - {str(e)}")
            results.append((name, False, str(e)))
        print()
    
    # Summary
    print("=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    passed = sum(1 for _, success, _ in results if success)
    total = len(results)
    print(f"Tests Passed: {passed}/{total}")
    print()
    
    for name, success, error in results:
        status = " PASS" if success else f" FAIL: {error}"
        print(f"  {name}: {status}")
    
    print()
    print("=" * 70)
    
    return passed == total

if __name__ == "__main__":
    success = test_analytics_endpoints()
    sys.exit(0 if success else 1)
