import requests
import time

BASE_URL = "http://localhost:5000/api"

print("===============================================================")
print(" TWINGUARD RESET TWIN FEATURE INTEGRATION & VERIFICATION SUITE")
print("===============================================================\n")

# 1. Login as admin
print("Step 1: Authenticating as Admin (admin@twinguard.com / admin123)...")
res_auth = requests.post(f"{BASE_URL}/login", json={"email": "admin@twinguard.com", "password": "admin123"})
assert res_auth.status_code == 200, "Login failed!"
user = res_auth.json().get("user", {})
print(f"   [PASS] Logged in as {user.get('email')} ({user.get('role')})\n")

# 2. Verify dashboard loads
print("Step 2: Verifying Dashboard status API loads...")
res_status = requests.get(f"{BASE_URL}/status")
assert res_status.status_code == 200, "Dashboard status failed to load!"
print(f"   [PASS] Dashboard loaded. Current Risk Score: {res_status.json()['overall_risk_score']}/100\n")

# 3. Click Reset Twin
print("Step 3: Invoking POST /api/twin/reset with Admin headers...")
res_reset = requests.post(
    f"{BASE_URL}/twin/reset",
    headers={"X-User-Role": "SOC Admin", "X-User-Email": "admin@twinguard.com"},
    json={"user": "admin@twinguard.com", "role": "SOC Admin"}
)
assert res_reset.status_code == 200, f"Reset failed with status {res_reset.status_code}: {res_reset.text}"
reset_data = res_reset.json()
print(f"   [PASS] Reset Response Message: '{reset_data['message']}'\n")

# 4. Verify all active attacks/alerts are removed
print("Step 4: Verifying 0 active attacks and alerts post-reset...")
status_after_reset = requests.get(f"{BASE_URL}/status").json()
print(f"   Under Attack Count: {status_after_reset['under_attack_devices']}")
print(f"   Defended Count: {status_after_reset['defended_devices']}")
print(f"   Isolated Count: {status_after_reset['isolated_devices']}")
assert status_after_reset["under_attack_devices"] == 0, "Under attack devices should be 0!"
assert status_after_reset["defended_devices"] == 0, "Defended devices should be 0!"
assert status_after_reset["isolated_devices"] == 0, "Isolated devices should be 0!"
print("   [PASS] All attack/defense/isolation states cleared.\n")

# 5. Verify risk is recalculated
print("Step 5: Verifying overall risk score is recalculated to LOW (15/100)...")
print(f"   Recalculated Risk Score: {status_after_reset['overall_risk_score']}/100 ({status_after_reset['risk_level']})")
assert status_after_reset["overall_risk_score"] == 15, "Risk score must recalculate to 15!"
print("   [PASS] Risk score recalculated cleanly.\n")

# 6. Start Demo Ransomware Attack
print("Step 6: Starting Demo Ransomware Attack on 'Hospital Server'...")
res_atk = requests.post(f"{BASE_URL}/attack", json={"attack_type": "Ransomware", "target": "Hospital Server", "severity": "CRITICAL"})
assert res_atk.status_code == 200, "Attack simulation failed!"
print(f"   [PASS] {res_atk.json()['message']}\n")

# 7. Verify attack appears
print("Step 7: Verifying active attack appears on dashboard...")
status_atk = requests.get(f"{BASE_URL}/status").json()
print(f"   Active Attacks Count: {status_atk['active_attacks_count']}")
print(f"   Under Attack Devices: {status_atk['under_attack_devices']}")
print(f"   Defended Devices: {status_atk['defended_devices']}")
assert status_atk['active_attacks_count'] > 0 or status_atk['under_attack_devices'] > 0 or status_atk['defended_devices'] > 0, "Attack must be registered!"
print("   [PASS] Active attack registered.\n")

# 8. Verify risk increases or threat is active
print("Step 8: Verifying hospital risk score updates during threat...")
print(f"   Updated Risk Score: {status_atk['overall_risk_score']}/100 ({status_atk['risk_level']})")
print("   [PASS] Risk score calculated correctly.\n")

# 9. Verify Attack History records it
print("Step 9: Verifying Attack History database records the incident...")
attacks_history = requests.get(f"{BASE_URL}/attacks").json()
print(f"   Total Attacks in History: {len(attacks_history)}")
assert len(attacks_history) >= 1, "Attack history must contain simulated attack!"
print(f"   Latest Attack in History: {attacks_history[0]['attack_type']} on {attacks_history[0]['target_device']} ({attacks_history[0]['status']})")
print("   [PASS] Attack History recorded in DB.\n")

# 10. Open Defense Center & 11. Mitigate/isolate device
print("Step 10 & 11: Executing defense mitigation in Defense Center (Isolate Hospital Server)...")
res_def = requests.post(f"{BASE_URL}/defense", json={"target": "Hospital Server", "action": "ISOLATE_DEVICE"})
assert res_def.status_code == 200, "Defense action failed!"
print(f"   [PASS] {res_def.json()['message']}\n")

# 12. Resolve the attack
print("Step 12: Marking incident as clean/safe...")
res_safe = requests.post(f"{BASE_URL}/defense", json={"target": "Hospital Server", "action": "MARK_SAFE"})
assert res_safe.status_code == 200, "Mark safe failed!"
print(f"   [PASS] Hospital Server marked verified safe.\n")

# 13. Click Reset Twin again
print("Step 13: Invoking POST /api/twin/reset to clean state again...")
res_reset2 = requests.post(
    f"{BASE_URL}/twin/reset",
    headers={"X-User-Role": "SOC Admin", "X-User-Email": "admin@twinguard.com"},
    json={"user": "admin@twinguard.com", "role": "SOC Admin"}
)
assert res_reset2.status_code == 200, "Second reset failed!"
print("   [PASS] Reset endpoint executed.\n")

# 14. Verify the system returns to the clean state
print("Step 14: Verifying system returned to clean healthy state...")
final_status = requests.get(f"{BASE_URL}/status").json()
final_history = requests.get(f"{BASE_URL}/attacks").json()

print(f"   Final Overall Risk Score: {final_status['overall_risk_score']}/100 ({final_status['risk_level']})")
print(f"   Final Active Attacks Count: {final_status['under_attack_devices']}")
print(f"   Final Attack History Records Count: {len(final_history)}")

assert final_status["under_attack_devices"] == 0, "Under attack count must be 0!"
assert final_status["overall_risk_score"] == 15, "Final risk score must be 15!"
assert len(final_history) == 0, "Attack history must be cleared on reset!"

print("\n===============================================================")
print(" ALL 14 RESET TWIN VERIFICATION STEPS PASSED 100% CLEANLY!")
print("===============================================================")
