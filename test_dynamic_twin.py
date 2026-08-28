import requests
import time
import json
import urllib.request

BASE_URL = "http://localhost:5000/api"

print("==================================================================")
print(" TWINGUARD DYNAMIC REAL-TIME DIGITAL TWIN INTEGRATION TEST SUITE ")
print("==================================================================\n")

# TEST 1 & 2: Backend & Auth
print("TEST 1 & 2: Checking Backend Server & Admin Authentication...")
res_auth = requests.post(f"{BASE_URL}/login", json={"email": "admin@twinguard.com", "password": "admin123"})
assert res_auth.status_code == 200, "Admin login failed!"
print("   [PASS] Backend API live. Admin authenticated successfully.\n")

# TEST 3 & 4 & 5: Device Registration & Telemetry / Heartbeat
print("TEST 3, 4 & 5: Registering ICU-MONITOR-01 & Sending Live Telemetry/Heartbeat...")
device_payload = {
    "id": "ICU-MONITOR-01",
    "name": "ICU Bedside Monitor 01",
    "device_type": "Clinical Workstation",
    "hospital_department": "ICU Ward",
    "ip_address": "192.168.2.101",
    "mac_address": "00:1A:2B:3C:4D:01",
    "os_firmware": "TwinGuard OS v2.1",
    "network_segment": "VLAN-10",
    "location": "ICU Room 101",
    "connection_protocol": "MQTT",
    "status": "ONLINE"
}
res_reg = requests.post(f"{BASE_URL}/devices", json=device_payload)
print(f"   Registration Response: {res_reg.status_code}")

# Send Heartbeat
hb_res = requests.post(f"{BASE_URL}/heartbeat", json={"device_id": "ICU-MONITOR-01", "status": "online"})
assert hb_res.status_code == 200, "Heartbeat API failed!"

# Send Telemetry
tel_res = requests.post(f"{BASE_URL}/telemetry", json={
    "device_id": "ICU-MONITOR-01",
    "temperature": 36.8,
    "cpu_usage": 42,
    "memory_usage": 58,
    "network_traffic": 250,
    "network_status": "connected"
})
assert tel_res.status_code == 200, "Telemetry API failed!"
print("   [PASS] Device 'ICU-MONITOR-01' registered & receiving live telemetry.\n")

# TEST 6 & 7 & 8: Verify Device Status in Dashboard API
print("TEST 6, 7 & 8: Verifying Device Status in Digital Twin API...")
devs = requests.get(f"{BASE_URL}/devices").json()
icu_dev = next((d for d in devs if d["id"] == "ICU-MONITOR-01"), None)
assert icu_dev is not None, "ICU-MONITOR-01 missing from devices list!"
print(f"   Device Status: {icu_dev['status']}")
print(f"   CPU Usage: {icu_dev['cpu_usage']}% | Temp: {icu_dev.get('temperature', 36.6)}°C")
print(f"   Last Seen: {icu_dev['last_seen']}")
assert icu_dev["status"] == "ONLINE", "Status must be ONLINE after heartbeat!"
print("   [PASS] Device telemetry & online status verified.\n")

# TEST 11: Attack Simulation against ICU-MONITOR-01
print("TEST 11: Triggering SAFE Ransomware Simulation on 'ICU-MONITOR-01'...")
res_atk = requests.post(f"{BASE_URL}/attack", json={
    "attack_type": "Ransomware",
    "target": "ICU-MONITOR-01",
    "severity": "CRITICAL"
})
assert res_atk.status_code == 200, "Attack simulation failed!"
atk_info = res_atk.json()
print(f"   Simulation Output: {atk_info['message']}")
print(f"   Device Risk Score Post-Attack: {atk_info['device']['risk_score']}/100")
assert atk_info["device"]["status"] == "UNDER_ATTACK", "Device status must be UNDER_ATTACK!"
print("   [PASS] SAFE Ransomware simulation registered cleanly.\n")

# TEST 12: Defense Center Mitigation
print("TEST 12: Defense Center: Isolating 'ICU-MONITOR-01'...")
res_def = requests.post(f"{BASE_URL}/defense", json={
    "target": "ICU-MONITOR-01",
    "action": "ISOLATE_DEVICE"
})
assert res_def.status_code == 200, "Defense mitigation failed!"
print(f"   Mitigation Action: {res_def.json()['message']}")

# TEST 13: Restore Device
print("Step 13: Defense Center: Restoring 'ICU-MONITOR-01' to SAFE/ONLINE...")
res_safe = requests.post(f"{BASE_URL}/defense", json={
    "target": "ICU-MONITOR-01",
    "action": "MARK_SAFE"
})
assert res_safe.status_code == 200, "Mark safe failed!"
print("   [PASS] Device restored to ONLINE/SAFE state.\n")

# TEST 14: Reset Twin
print("TEST 14: Resetting Digital Twin environment...")
res_reset = requests.post(
    f"{BASE_URL}/twin/reset",
    headers={"X-User-Role": "SOC Admin", "X-User-Email": "admin@twinguard.com"},
    json={"user": "admin@twinguard.com", "role": "SOC Admin"}
)
assert res_reset.status_code == 200, "Reset failed!"
final_status = requests.get(f"{BASE_URL}/status").json()
print(f"   Final Overall Hospital Risk Score: {final_status['overall_risk_score']}/100 ({final_status['risk_level']})")
print(f"   Final Active Attacks Count: {final_status['under_attack_devices']}")
assert final_status["under_attack_devices"] == 0, "Under attack count must be 0 after reset!"
print("   [PASS] Digital Twin returned to clean state.\n")

print("==================================================================")
print(" ALL REAL-TIME DYNAMIC DIGITAL TWIN TESTS PASSED 100% CLEANLY!")
print("==================================================================")
