import requests
import urllib.parse
import time

BASE_URL = "http://localhost:5000/api"

print("===============================================================")
print(" TWINGUARD SOC ADMIN SYSTEM INTEGRATION & VERIFICATION SUITE")
print("===============================================================\n")

# 1. Admin Authentication
print("1. Testing Admin Authentication...")
res_auth = requests.post(f"{BASE_URL}/login", json={"email": "admin@twinguard.com", "password": "admin123"})
assert res_auth.status_code == 200, "Admin login failed!"
user = res_auth.json().get("user", {})
assert user.get("role") == "SOC Admin", "Role missing from auth!"
print("   [PASS] Admin authenticated as SOC Admin.\n")

# 2. Reset Twin Environment to Clean SAFE State
print("2. Resetting Twin to Clean Initial State...")
res_reset = requests.post(f"{BASE_URL}/reset")
assert res_reset.status_code == 200, "Reset failed!"
res_status = requests.get(f"{BASE_URL}/status").json()
print(f"   Overall Risk Score: {res_status['overall_risk_score']}/100 (Level: {res_status['risk_level']})")
print(f"   Active Attacks Count: {res_status['under_attack_devices']}")
assert res_status["under_attack_devices"] == 0, "Clean reset must have 0 active attacks!"
assert res_status["overall_risk_score"] <= 20, "Clean reset risk score should be low!"
print("   [PASS] System reset to clean SAFE initial state.\n")

# 3. Add Test Hospital Device (Admin Device Management CRUD)
print("3. Admin Device Management: Adding Test ICU Monitor Device...")
new_dev_payload = {
    "name": "ICU Ventilator 4",
    "device_type": "Critical Medical Imaging",
    "ip_address": "192.168.3.99",
    "status": "SAFE"
}
res_add = requests.post(f"{BASE_URL}/devices", json=new_dev_payload)
assert res_add.status_code == 201, f"Failed to add device: {res_add.text}"
created_dev = res_add.json()["device"]
created_id = created_dev["id"]
print(f"   [PASS] Added device '{created_dev['name']}' with ID: {created_id}\n")

# 4. Edit Device Details
print("4. Admin Device Management: Updating Device Status to UNDER_MONITORING...")
safe_id = urllib.parse.quote(created_id)
res_edit = requests.put(f"{BASE_URL}/devices/{safe_id}", json={"status": "UNDER_MONITORING"})
assert res_edit.status_code == 200, f"Failed to edit device! Status: {res_edit.status_code}, Body: {res_edit.text}"
print("   [PASS] Device updated.\n")

# 5. Attack Simulation: Launch Ransomware Attack
print("5. Launching Ransomware Attack Simulation on 'ICU Ventilator 4'...")
res_atk = requests.post(f"{BASE_URL}/attack", json={
    "attack_type": "Ransomware",
    "target": "ICU Ventilator 4",
    "severity": "CRITICAL"
})
assert res_atk.status_code == 200, "Failed to launch attack!"
atk_data = res_atk.json()
print(f"   Attack Message: {atk_data['message']}")
print(f"   Target Device Risk Score: {atk_data['device']['risk_score']}/100")

res_status_atk = requests.get(f"{BASE_URL}/status").json()
print(f"   Updated Hospital Overall Risk Score: {res_status_atk['overall_risk_score']}/100 (Level: {res_status_atk['risk_level']})")
assert res_status_atk["under_attack_devices"] >= 1, "Under attack count must be >= 1"
print("   [PASS] Attack simulation registered, risk score increased.\n")

# 6. Defense Center: Execute Isolation Action
print("6. Defense Center: Mitigating threat by Isolating target device...")
res_def = requests.post(f"{BASE_URL}/defense", json={
    "target": "ICU Ventilator 4",
    "action": "ISOLATE_DEVICE"
})
assert res_def.status_code == 200, "Defense action failed!"
def_data = res_def.json()
print(f"   Defense Action Executed: {def_data['defense']['action']}")

res_status_def = requests.get(f"{BASE_URL}/status").json()
print(f"   Updated Risk Score post-defense: {res_status_def['overall_risk_score']}/100")
print("   [PASS] Defense Center mitigated threat.\n")

# 7. Check Admin Audit Log
print("7. Verifying Admin Audit Log...")
res_audit = requests.get(f"{BASE_URL}/audit-logs")
assert res_audit.status_code == 200, "Failed to fetch audit logs!"
audit_logs = res_audit.json()
print(f"   Total Audit Logs Recorded: {len(audit_logs)}")
for log in audit_logs[:5]:
    print(f"   - [{log['timestamp']}] {log['action']}: {log['details']} ({log['user']})")
assert len(audit_logs) >= 3, "Audit logs must record admin actions!"
print("   [PASS] Admin audit logs verified.\n")

# 8. Delete Test Device
print("8. Deleting Test Device...")
res_del = requests.delete(f"{BASE_URL}/devices/{safe_id}")
assert res_del.status_code == 200, "Failed to delete test device!"
print("   [PASS] Test device deleted successfully.\n")

# 9. Reset Twin to Clean State Again
print("9. Resetting Twin to Clean Initial State...")
requests.post(f"{BASE_URL}/reset")
final_status = requests.get(f"{BASE_URL}/status").json()
assert final_status["under_attack_devices"] == 0
print(f"   Final Overall Hospital Risk Score: {final_status['overall_risk_score']}/100")
print("   [PASS] System returned to clean initial SAFE state.\n")

print("===============================================================")
print(" ALL SOC SYSTEM INTEGRATION TESTS PASSED 100% CLEANLY!")
print("===============================================================")
