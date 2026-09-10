import urllib.request
import json
import ssl
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def make_request(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    encoded_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            status_code = resp.status
            content = resp.read().decode("utf-8")
            return status_code, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        return e.code, json.loads(content) if content else {}

def run_tests():
    print("=== STARTING COMPREHENSIVE ResQ Hub API TESTS ===")
    
    # 1. Health check
    status, body = make_request("/health")
    assert status == 200, f"Health check failed: {status}"
    print("[PASS] 1. Health check: OK")

    # 2. Login as Dispatcher
    status, body = make_request("/auth/login", method="POST", data={
        "email": "dispatcher@resqhub.com",
        "password": "ResqHub@123"
    })
    assert status == 200 and "access_token" in body, f"Dispatcher login failed: {body}"
    dispatcher_token = body["access_token"]
    print(f"[PASS] 2. Dispatcher login: Token received, user={body['user']['name']} ({body['user']['role']})")

    # 3. Login as Citizen
    status, body = make_request("/auth/login", method="POST", data={
        "email": "citizen@resqhub.com",
        "password": "ResqHub@123"
    })
    assert status == 200 and "access_token" in body, f"Citizen login failed: {body}"
    citizen_token = body["access_token"]
    print(f"[PASS] 3. Citizen login: Token received, user={body['user']['name']}")

    # 4. Auth Me check
    status, body = make_request("/auth/me", token=dispatcher_token)
    assert status == 200 and body["role"] == "DISPATCHER"
    print("[PASS] 4. Auth /me verified for Dispatcher")

    # 5. Create Incident with Hyderabad coordinates (Kukatpally)
    new_inc_data = {
        "emergency_type": "Cardiac Emergency",
        "description": "Patient experiencing severe chest pain and breathlessness. Needs ALS ambulance immediately.",
        "priority": "CRITICAL",
        "location": "Kukatpally Housing Board, Phase 2",
        "latitude": 17.4849,
        "longitude": 78.4138,
        "caller_phone": "+91 98765 12345"
    }
    status, body = make_request("/incidents", method="POST", data=new_inc_data, token=citizen_token)
    assert status == 201, f"Incident creation failed: {body}"
    incident = body["incident"]
    inc_id = incident["id"]
    recommended_ambs = body["recommended_ambulances"]
    print(f"[PASS] 5. Incident created: ID={inc_id}, Priority={incident['priority']}, Status={incident['status']}")
    assert len(recommended_ambs) > 0, "No recommended ambulances returned!"
    nearest_amb = recommended_ambs[0]
    print(f"       Nearest recommended ambulance: {nearest_amb['id']} ({nearest_amb['vehicle_number']}) at distance {nearest_amb['distance_km']} km")

    # 6. Assign Ambulance to Incident
    status, body = make_request(f"/incidents/{inc_id}/assign-ambulance", method="POST", data={
        "ambulance_id": nearest_amb["id"]
    }, token=dispatcher_token)
    assert status == 200 and body["success"] is True, f"Assign ambulance failed: {body}"
    print(f"[PASS] 6. Ambulance {nearest_amb['id']} successfully assigned to {inc_id}. Incident status={body['incident']['status']}")

    # 7. Get Recommended Hospitals for Incident
    status, body = make_request(f"/incidents/{inc_id}/recommended-hospitals", token=dispatcher_token)
    assert status == 200 and len(body) > 0, f"Get recommended hospitals failed: {body}"
    best_hospital = body[0]
    print(f"[PASS] 7. Recommended hospitals retrieved. Top recommendation: {best_hospital['name']} (Distance: {best_hospital['distance_km']} km, Available Beds: {best_hospital['available_beds']}, Match Score: {best_hospital.get('match_score')})")

    # 8. Assign Hospital to Incident
    status, body = make_request(f"/incidents/{inc_id}/assign-hospital", method="POST", data={
        "hospital_id": best_hospital["id"]
    }, token=dispatcher_token)
    assert status == 200 and body["success"] is True, f"Assign hospital failed: {body}"
    print(f"[PASS] 8. Hospital {best_hospital['name']} assigned to incident {inc_id}")

    # 9. Update Incident Status to IN_PROGRESS and then RESOLVED
    status, body = make_request(f"/incidents/{inc_id}", method="PUT", data={
        "status": "IN_PROGRESS",
        "notes": "Paramedic team arrived on-scene. Patient vitals stabilized."
    }, token=dispatcher_token)
    assert status == 200 and body["status"] == "IN_PROGRESS"
    print(f"[PASS] 9. Incident status transitioned to IN_PROGRESS. Timeline entries: {len(body['timeline'])}")

    status, body = make_request(f"/incidents/{inc_id}", method="PUT", data={
        "status": "RESOLVED",
        "notes": "Patient handed over to Apollo Emergency trauma team. Scene cleared."
    }, token=dispatcher_token)
    assert status == 200 and body["status"] == "RESOLVED"
    print(f"[PASS] 10. Incident resolved! Status={body['status']}, Response time={body['response_time_minutes']} mins")

    # 10. Check Analytics
    status, body = make_request("/analytics/overview", token=dispatcher_token)
    assert status == 200, f"Analytics overview failed: {body}"
    print(f"[PASS] 11. Analytics Overview: Total={body['total_emergencies']}, Resolved={body['resolved_emergencies']}, Active={body['active_emergencies']}, Fleet Utilization={body['ambulance_utilization_rate']}%")

    # 11. Check Notifications
    status, body = make_request("/notifications", token=dispatcher_token)
    assert status == 200 and len(body) > 0, f"Notifications failed: {body}"
    print(f"[PASS] 12. Notifications retrieved: {len(body)} logged alerts in system")

    # 13. Check Hospital Capacity Update - verify Dispatcher gets 403 Forbidden (RBAC working)
    status, body = make_request("/hospitals/HOSP-201/capacity", method="PUT", data={
        "available_beds": 18,
        "icu_beds": 7,
        "emergency_capacity": "HIGH",
        "status": "AVAILABLE"
    }, token=dispatcher_token)
    assert status == 403, f"RBAC failed to reject Dispatcher: {status}"
    print("[PASS] 13a. RBAC security guard verified: Dispatcher correctly rejected with 403 Forbidden")

    # Login as Hospital Staff
    status, body = make_request("/auth/login", method="POST", data={
        "email": "hospital@resqhub.com",
        "password": "ResqHub@123"
    })
    hospital_token = body["access_token"]
    status, body = make_request("/hospitals/HOSP-201/capacity", method="PUT", data={
        "available_beds": 18,
        "icu_beds": 7,
        "emergency_capacity": "HIGH",
        "status": "AVAILABLE"
    }, token=hospital_token)
    assert status == 200 and body["available_beds"] == 18, f"Hospital capacity update failed: {body}"
    print(f"[PASS] 13b. Hospital capacity updated by authorized Hospital Staff: Available beds={body['available_beds']}")

    print("\n=== ALL 13 TEST SUITES PASSED FLAWLESSLY! ===")

if __name__ == "__main__":
    run_tests()
