import json
import httpx

BASE_URL = "http://127.0.0.1:8000"
client = httpx.Client(base_url=BASE_URL, timeout=10.0)

results = {}

def test_endpoint(name, method, url, **kwargs):
    try:
        if method == "GET":
            resp = client.get(url, **kwargs)
        else:
            resp = client.post(url, **kwargs)
        status = resp.status_code
        data = resp.json()
        results[name] = {"status": status, "success": 200 <= status < 300, "sample": str(data)[:120]}
        print(f"[{status}] {method} {url} -> OK")
        return data
    except Exception as e:
        results[name] = {"status": "ERROR", "success": False, "error": str(e)}
        print(f"[FAIL] {method} {url} -> {e}")
        return None

print("=== 1. Health ===")
test_endpoint("health", "GET", "/api/health")

print("\n=== 2. Branches ===")
test_endpoint("branches", "GET", "/api/branches")

print("\n=== 3. Forecast BR001 ===")
test_endpoint("forecast", "GET", "/api/branches/BR001/forecast")

print("\n=== 4. Bottlenecks BR001 ===")
test_endpoint("bottlenecks", "GET", "/api/branches/BR001/bottlenecks")

print("\n=== 5. Recommendations BR001 ===")
test_endpoint("recommendations", "GET", "/api/branches/BR001/recommendations")

print("\n=== 6. Intelligence BR001 ===")
test_endpoint("intelligence", "GET", "/api/branches/BR001/intelligence")

print("\n=== 7. Analysis Waiting Times ===")
test_endpoint("waiting_times", "GET", "/api/analysis/waiting-times")

print("\n=== 8. Analysis Feedback ===")
test_endpoint("feedback", "GET", "/api/analysis/feedback")

print("\n=== 9. Customer Service Options ===")
test_endpoint("service_options", "GET", "/api/customer/service-options")

print("\n=== 10. Customer Branches ===")
test_endpoint("customer_branches", "GET", "/api/customer/branches")

print("\n=== 11. Customer Recommendation ===")
test_endpoint("customer_recommendation", "POST", "/api/customer/recommendation", json={
    "service_type": "ACCOUNT_SERVICES",
    "customer_urgency": "MEDIUM",
    "customer_time": "11:00",
    "customer_lat": 12.9716,
    "customer_lon": 77.5946
})

print("\n=== 12. Customer Chat ===")
test_endpoint("customer_chat", "POST", "/api/customer/chat", json={
    "message": "What is the best time to visit Bangalore branch for cash withdrawal?",
    "session_id": "test-session"
})

print("\n=== 13. Auth Login ===")
login_data = test_endpoint("auth_login", "POST", "/api/auth/login", json={
    "email": "manager@avenue.demo",
    "password": "manager123"
})

token = login_data.get("access_token") if login_data else None

print("\n=== 14. Auth Me ===")
if token:
    test_endpoint("auth_me", "GET", "/api/auth/me", headers={"Authorization": f"Bearer {token}"})
else:
    print("[SKIP] auth_me because login token not received")

print("\n=== 15. Simulation ===")
test_endpoint("simulation", "POST", "/api/simulate", json={
    "branch_id": "BR001",
    "action_type": "STAFF_REASSIGNMENT",
    "parameters": {
        "reallocations": [
            {
                "from_service": "Account Services",
                "to_service": "Cash Deposit / Withdrawal",
                "staff_count": 1
            }
        ]
    }
})

print("\n=== SUMMARY ===")
print(json.dumps(results, indent=2))
