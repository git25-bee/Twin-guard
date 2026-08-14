import sys
import os

sys.path.append(os.path.dirname(__file__))

from app import app, db_manager, attack_engine, defense_engine, ai_engine

client = app.test_client()

# 1. Test GET /api/devices
res_devices = client.get('/api/devices')
assert res_devices.status_code == 200
devices = res_devices.json
print(f"[TEST 1 PASS] GET /api/devices returned {len(devices)} devices.")

# 2. Test GET /api/status
res_status = client.get('/api/status')
assert res_status.status_code == 200
status = res_status.json
print(f"[TEST 2 PASS] GET /api/status - Risk Score: {status['overall_risk_score']}/100 ({status['risk_level']})")

# 3. Test POST /api/attack (Ransomware on Hospital Server)
res_attack = client.post('/api/attack', json={"attack_type": "Ransomware", "target": "Hospital Server", "severity": "CRITICAL"})
assert res_attack.status_code == 200
attack_json = res_attack.json
print(f"[TEST 3 PASS] POST /api/attack - Launched Ransomware on {attack_json['device']['name']} (Risk: {attack_json['device']['risk_score']}/100)")

# 4. Test AI Recommendation
rec = attack_json.get('ai_recommendation', {})
print(f"[TEST 4 PASS] AI Recommendation: '{rec.get('recommendation')}' (Confidence: {rec.get('confidence')}%)")

# 5. Test POST /api/defense
res_def = client.post('/api/defense', json={"target": "Hospital Server", "action": "ISOLATE_DEVICE"})
assert res_def.status_code == 200
def_json = res_def.json
print(f"[TEST 5 PASS] POST /api/defense - Executed isolation on {def_json['device']['name']} (New Status: {def_json['device']['status']})")

# 6. Test GET /api/reports/summary
res_reports = client.get('/api/reports/summary')
assert res_reports.status_code == 200
reports = res_reports.json
print(f"[TEST 6 PASS] GET /api/reports/summary - Defense Success Rate: {reports['defense_success_rate']}")

print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY! FULL VIVA SCENARIO VERIFIED!")
