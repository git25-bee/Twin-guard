import os
import sys
from flask import Flask, jsonify, request
from flask_cors import CORS

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../ai_database")))

from ai_database.database import DatabaseManager
from ai_database.risk_engine import RiskEngine
from ai_database.ai_engine import AISecurityEngine
from ai_database.reports import ReportGenerator
from attack_defense.attack_engine import AttackEngine
from attack_defense.defense_engine import DefenseEngine

app = Flask(__name__)
CORS(app)

db_manager = DatabaseManager(use_sqlite_fallback=True)

INITIAL_DEVICES = [
    {
        "id": "node-internet", "name": "Internet", "device_type": "WAN Gateway",
        "ip_address": "198.51.100.1", "status": "SAFE", "risk_score": 10,
        "cpu_usage": 15, "memory_usage": 20, "network_traffic": 850,
        "detected_threat": "None", "defense_action": "None", "last_activity": "Just now"
    },
    {
        "id": "node-firewall", "name": "Firewall", "device_type": "Perimeter Defense",
        "ip_address": "192.168.1.1", "status": "SAFE", "risk_score": 15,
        "cpu_usage": 25, "memory_usage": 35, "network_traffic": 780,
        "detected_threat": "None", "defense_action": "Active SPI Firewall", "last_activity": "Just now"
    },
    {
        "id": "node-server", "name": "Hospital Server", "device_type": "Core Infrastructure",
        "ip_address": "192.168.1.10", "status": "SAFE", "risk_score": 20,
        "cpu_usage": 30, "memory_usage": 45, "network_traffic": 420,
        "detected_threat": "None", "defense_action": "None", "last_activity": "Just now"
    },
    {
        "id": "node-patient-db", "name": "Patient Database", "device_type": "PHI / SQL Storage",
        "ip_address": "192.168.1.20", "status": "SAFE", "risk_score": 18,
        "cpu_usage": 22, "memory_usage": 50, "network_traffic": 210,
        "detected_threat": "None", "defense_action": "AES-256 Encrypted", "last_activity": "Just now"
    },
    {
        "id": "node-ehr", "name": "EHR Server", "device_type": "Electronic Health Records",
        "ip_address": "192.168.1.25", "status": "SAFE", "risk_score": 16,
        "cpu_usage": 28, "memory_usage": 40, "network_traffic": 190,
        "detected_threat": "None", "defense_action": "None", "last_activity": "Just now"
    },
    {
        "id": "node-doctor-pc", "name": "Doctor PC", "device_type": "Clinical Workstation",
        "ip_address": "192.168.2.101", "status": "SAFE", "risk_score": 14,
        "cpu_usage": 18, "memory_usage": 32, "network_traffic": 95,
        "detected_threat": "None", "defense_action": "None", "last_activity": "Just now"
    },
    {
        "id": "node-nurse-pc", "name": "Nurse PC", "device_type": "Ward Workstation",
        "ip_address": "192.168.2.102", "status": "SAFE", "risk_score": 12,
        "cpu_usage": 15, "memory_usage": 28, "network_traffic": 80,
        "detected_threat": "None", "defense_action": "None", "last_activity": "Just now"
    },
    {
        "id": "node-admin-pc", "name": "Admin PC", "device_type": "Management Workstation",
        "ip_address": "192.168.2.105", "status": "SAFE", "risk_score": 15,
        "cpu_usage": 20, "memory_usage": 35, "network_traffic": 110,
        "detected_threat": "None", "defense_action": "None", "last_activity": "Just now"
    },
    {
        "id": "node-mri", "name": "MRI Machine", "device_type": "Critical Medical Imaging",
        "ip_address": "192.168.3.50", "status": "SAFE", "risk_score": 22,
        "cpu_usage": 42, "memory_usage": 60, "network_traffic": 340,
        "detected_threat": "None", "defense_action": "VLAN Segregated", "last_activity": "Just now"
    },
    {
        "id": "node-iot", "name": "IoT Medical Devices", "device_type": "Infusion Pumps & Monitors",
        "ip_address": "192.168.3.80", "status": "SAFE", "risk_score": 25,
        "cpu_usage": 35, "memory_usage": 40, "network_traffic": 150,
        "detected_threat": "None", "defense_action": "None", "last_activity": "Just now"
    },
    {
        "id": "node-pharmacy", "name": "Pharmacy System", "device_type": "Medication Dispenser",
        "ip_address": "192.168.2.110", "status": "SAFE", "risk_score": 14,
        "cpu_usage": 19, "memory_usage": 30, "network_traffic": 85,
        "detected_threat": "None", "defense_action": "None", "last_activity": "Just now"
    },
    {
        "id": "node-lab", "name": "Laboratory", "device_type": "Pathology Analyzer",
        "ip_address": "192.168.3.60", "status": "SAFE", "risk_score": 18,
        "cpu_usage": 26, "memory_usage": 42, "network_traffic": 160,
        "detected_threat": "None", "defense_action": "None", "last_activity": "Just now"
    }
]

devices_state = [dict(d) for d in INITIAL_DEVICES]

attack_engine = AttackEngine(devices_state, db_manager)
defense_engine = DefenseEngine(devices_state, attack_engine, db_manager)
ai_engine = AISecurityEngine()

@app.route('/api/devices', methods=['GET'])
def get_devices():
    for dev in devices_state:
        dev["risk_score"] = RiskEngine.calculate_device_risk(dev)
    return jsonify(devices_state)

@app.route('/api/status', methods=['GET'])
def get_status():
    overall_risk, level = RiskEngine.calculate_overall_risk(devices_state)
    
    total = len(devices_state)
    safe = len([d for d in devices_state if d["status"] == "SAFE"])
    monitoring = len([d for d in devices_state if d["status"] == "UNDER_MONITORING"])
    under_attack = len([d for d in devices_state if d["status"] == "UNDER_ATTACK"])
    defended = len([d for d in devices_state if d["status"] == "DEFENDED"])
    isolated = len([d for d in devices_state if d["status"] == "ISOLATED"])

    return jsonify({
        "overall_risk_score": overall_risk,
        "risk_level": level,
        "total_devices": total,
        "safe_devices": safe,
        "monitoring_devices": monitoring,
        "under_attack_devices": under_attack,
        "defended_devices": defended,
        "isolated_devices": isolated,
        "active_attacks_count": len(attack_engine.active_attacks),
        "auto_defense_enabled": defense_engine.auto_defense_enabled
    })

@app.route('/api/attacks', methods=['GET'])
def get_attacks():
    history = db_manager.get_attack_history()
    return jsonify(history)

@app.route('/api/attack', methods=['POST'])
def post_attack():
    data = request.json or {}
    attack_type = data.get("attack_type", "Ransomware")
    target = data.get("target", "Hospital Server")
    severity = data.get("severity", "HIGH")

    attack_record, target_device = attack_engine.launch_attack(attack_type, target, severity)

    rec_data = ai_engine.get_recommendation(
        attack_type=attack_type,
        target_device=target_device["name"],
        risk_score=target_device["risk_score"],
        severity=severity,
        network_activity=f"High spike ({target_device['network_traffic']} MB/s)"
    )

    rec_id = f"REC-{attack_record['attack_id'][-6:]}"
    db_manager.save_ai_recommendation(
        rec_id, attack_type, target_device["name"],
        rec_data.get("recommendation", ""), rec_data.get("reason", ""),
        rec_data.get("confidence", 95), attack_record["timestamp"]
    )

    return jsonify({
        "message": f"{attack_type} attack launched successfully on {target_device['name']}",
        "attack": attack_record,
        "device": target_device,
        "ai_recommendation": rec_data
    })

@app.route('/api/defense', methods=['POST'])
def post_defense():
    data = request.json or {}
    target = data.get("target", "Hospital Server")
    action = data.get("action", "ISOLATE_DEVICE")
    attack_id = data.get("attack_id")

    defense_record = defense_engine.execute_defense(target, action_code=action, attack_id=attack_id)

    if not defense_record:
        return jsonify({"error": f"Target device '{target}' not found"}), 404

    target_dev = next((d for d in devices_state if d["name"].lower() == target.lower()), None)

    return jsonify({
        "message": f"Defense action '{action}' executed successfully on {target}",
        "defense": defense_record,
        "device": target_dev
    })

@app.route('/api/ai/recommendation', methods=['GET'])
def get_ai_recommendation():
    target_name = request.args.get("target", "Doctor PC")
    attack_type = request.args.get("attack_type", "Ransomware")
    
    dev = next((d for d in devices_state if d["name"].lower() == target_name.lower()), devices_state[2])
    
    rec_data = ai_engine.get_recommendation(
        attack_type=attack_type,
        target_device=dev["name"],
        risk_score=dev["risk_score"],
        severity="CRITICAL" if dev["risk_score"] > 80 else "HIGH"
    )
    return jsonify(rec_data)

@app.route('/api/ai/apply', methods=['POST'])
def apply_ai_recommendation():
    data = request.json or {}
    target = data.get("target", "Hospital Server")
    action_code = data.get("action_code", "ISOLATE_DEVICE")

    defense_record = defense_engine.execute_defense(target, action_code=action_code)

    return jsonify({
        "message": f"Applied AI recommendation: Executed {action_code} on {target}",
        "defense": defense_record
    })

@app.route('/api/reports/summary', methods=['GET'])
def get_reports_summary():
    attack_history = db_manager.get_attack_history()
    defense_history = db_manager.get_defense_history()
    report = ReportGenerator.generate_summary_report(attack_history, defense_history, devices_state)
    return jsonify(report)

@app.route('/api/reset', methods=['POST'])
def reset_digital_twin():
    global devices_state
    for dev, orig in zip(devices_state, INITIAL_DEVICES):
        dev.update(orig)
    attack_engine.active_attacks.clear()
    return jsonify({"message": "Digital Twin environment reset to SAFE state.", "devices": devices_state})

@app.route('/api/settings', methods=['POST'])
def update_settings():
    data = request.json or {}
    if "auto_defense" in data:
        defense_engine.auto_defense_enabled = bool(data["auto_defense"])
    return jsonify({"message": "Settings updated", "auto_defense": defense_engine.auto_defense_enabled})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
