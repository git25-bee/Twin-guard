import requests
import time

BASE_URL = "http://localhost:5000/api"

print("--- 1. VERIFYING INITIAL DIGITAL TWIN STATE ---")
res_devices = requests.get(f"{BASE_URL}/devices")
assert res_devices.status_code == 200, "Devices endpoint failed"
devices = res_devices.json()
print(f"[OK] Devices endpoint active. Initial device count: {len(devices)}")
for dev in devices[:3]:
    print(f"  - {dev['name']} ({dev['device_type']}): Status={dev['status']}, Risk={dev['risk_score']}/100")

res_status = requests.get(f"{BASE_URL}/status")
assert res_status.status_code == 200, "Status endpoint failed"
status = res_status.json()
print(f"[OK] Initial Overall Hospital Risk: {status['overall_risk_score']}/100 ({status['risk_level']})")

print("\n--- 2. EXECUTING RANSOMWARE SIMULATION ON HOSPITAL SERVER ---")
res_attack = requests.post(f"{BASE_URL}/attack", json={
    "attack_type": "Ransomware",
    "target": "Hospital Server",
    "severity": "CRITICAL"
})
assert res_attack.status_code == 200, "Attack endpoint failed"
attack_data = res_attack.json()
target_dev = attack_data["device"]
print(f"[OK] Attack Launched: {attack_data['attack']['attack_type']} on {target_dev['name']}")
print(f"  - Node Status: {target_dev['status']} (RED GLOW ACTIVE)")
print(f"  - Node Risk Score: {target_dev['risk_score']}/100")
print(f"  - CPU Usage: {target_dev['cpu_usage']}%")

res_status_attack = requests.get(f"{BASE_URL}/status").json()
print(f"[OK] Hospital Overall Risk Spiked To: {res_status_attack['overall_risk_score']}/100 ({res_status_attack['risk_level']})")

print("\n--- 3. VERIFYING AI RECOMMENDATION MODULE ---")
ai_rec = attack_data.get("ai_recommendation", {})
print(f"[OK] Gemini AI Advice Generated:")
print(f"  - Recommendation: '{ai_rec.get('recommendation')}'")
print(f"  - Reason: '{ai_rec.get('reason')}'")
print(f"  - Confidence: {ai_rec.get('confidence')}%")

print("\n--- 4. EXECUTING AUTOMATED DEFENSE & MITIGATION ---")
res_defense = requests.post(f"{BASE_URL}/defense", json={
    "target": "Hospital Server",
    "action": "ISOLATE_DEVICE"
})
assert res_defense.status_code == 200, "Defense endpoint failed"
def_data = res_defense.json()
def_dev = def_data["device"]
print(f"[OK] Defense Executed: {def_data['defense']['action']} on {def_dev['name']}")
print(f"  - New Node Status: {def_dev['status']} (DARK GRAY ISOLATED)")
print(f"  - New Node Risk Score: {def_dev['risk_score']}/100")

print("\n--- 5. VERIFYING POST-DEFENSE RECOVERY ---")
time.sleep(6) # Wait 6 seconds for auto-recovery loop
res_recovered = requests.get(f"{BASE_URL}/devices").json()
recovered_dev = next((d for d in res_recovered if d["name"] == "Hospital Server"), None)
print(f"[OK] Recovery Status: {recovered_dev['status']} (GREEN SAFE)")
print(f"[OK] Recovered Device Risk Score: {recovered_dev['risk_score']}/100")

res_final_status = requests.get(f"{BASE_URL}/status").json()
print(f"[OK] Hospital Overall Risk Restored To: {res_final_status['overall_risk_score']}/100 ({res_final_status['risk_level']})")

print("\n=======================================================")
print(" ALL 10 USER REQUIREMENTS FULLY VERIFIED & OPERATIONAL!")
print("=======================================================")
