import os
import time
import datetime
import uuid
import jwt
from functools import wraps

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

from database import DatabaseManager
from attack_engine import AttackEngine
from defense_engine import DefenseEngine
from ai_engine import AISecurityEngine
from risk_engine import RiskEngine

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

SECRET_KEY = os.environ.get("JWT_SECRET", "twinguard-super-secret-jwt-key-2026")
app.config['SECRET_KEY'] = SECRET_KEY

# Initialize Database Manager & Core Engines
db_manager = DatabaseManager()

# Initial 12 digital twin nodes
INITIAL_DEVICES = [
    {"id": "node-internet", "name": "Internet Gateway", "device_type": "Perimeter / WAN", "hospital_department": "Perimeter / WAN", "ip_address": "203.0.113.1", "mac_address": "00:1A:2B:3C:4D:01", "os_firmware": "TwinGuard Gateway v3.4", "network_segment": "WAN-01", "location": "Perimeter Rack A", "connection_protocol": "HTTPS", "status": "ONLINE", "risk_score": 10, "cpu_usage": 15, "memory_usage": 25, "temperature": 35.0, "network_traffic": 450},
    {"id": "node-firewall", "name": "Hospital Firewall", "device_type": "Perimeter / DMZ", "hospital_department": "Perimeter / DMZ", "ip_address": "192.168.1.1", "mac_address": "00:1A:2B:3C:4D:02", "os_firmware": "FortiTwin OS 7.2", "network_segment": "DMZ-01", "location": "Perimeter Rack B", "connection_protocol": "SSH", "status": "ONLINE", "risk_score": 12, "cpu_usage": 20, "memory_usage": 30, "temperature": 38.2, "network_traffic": 400},
    {"id": "node-server", "name": "Core Hospital Server", "device_type": "Data Center / Server", "hospital_department": "IT Operations", "ip_address": "192.168.1.10", "mac_address": "00:1A:2B:3C:4D:03", "os_firmware": "Enterprise Linux 9", "network_segment": "VLAN-Core", "location": "Data Center Rm 101", "connection_protocol": "gRPC", "status": "ONLINE", "risk_score": 15, "cpu_usage": 28, "memory_usage": 45, "temperature": 41.0, "network_traffic": 850},
    {"id": "node-patient-db", "name": "Patient Database (PHI)", "device_type": "Health Records / DB", "hospital_department": "Health Information", "ip_address": "192.168.1.20", "mac_address": "00:1A:2B:3C:4D:04", "os_firmware": "SecureDB v15.2", "network_segment": "VLAN-DB", "location": "Data Center Rm 102", "connection_protocol": "TLS / SQL", "status": "ONLINE", "risk_score": 18, "cpu_usage": 32, "memory_usage": 60, "temperature": 42.5, "network_traffic": 600},
    {"id": "node-ehr", "name": "EHR Server System", "device_type": "Health Records / EHR", "hospital_department": "Clinical Records", "ip_address": "192.168.1.30", "mac_address": "00:1A:2B:3C:4D:05", "os_firmware": "EpicTwin OS v4.1", "network_segment": "VLAN-EHR", "location": "Data Center Rm 103", "connection_protocol": "HL7 / FHIR", "status": "ONLINE", "risk_score": 14, "cpu_usage": 24, "memory_usage": 40, "temperature": 39.0, "network_traffic": 520},
    {"id": "ICU-MONITOR-01", "name": "ICU Bedside Monitor 01", "device_type": "ICU Ward / Medical", "hospital_department": "ICU Ward", "ip_address": "192.168.10.15", "mac_address": "00:1A:2B:3C:4D:06", "os_firmware": "MedMon OS v2.0", "network_segment": "VLAN-10", "location": "ICU Room 101", "connection_protocol": "MQTT", "status": "ONLINE", "risk_score": 15, "cpu_usage": 18, "memory_usage": 22, "temperature": 36.6, "network_traffic": 110},
    {"id": "VENTILATOR-01", "name": "ICU Ventilator Unit 01", "device_type": "ICU Ward / Medical", "hospital_department": "ICU Ward", "ip_address": "192.168.10.22", "mac_address": "00:1A:2B:3C:4D:07", "os_firmware": "VentilatorTwin v1.8", "network_segment": "VLAN-20", "location": "ICU Room 102", "connection_protocol": "MQTT", "status": "ONLINE", "risk_score": 15, "cpu_usage": 15, "memory_usage": 20, "temperature": 36.5, "network_traffic": 95},
    {"id": "PATIENT-MONITOR-01", "name": "Bedside Patient Monitor 01", "device_type": "Bedside Ward / Medical", "hospital_department": "General Ward", "ip_address": "192.168.10.35", "mac_address": "00:1A:2B:3C:4D:08", "os_firmware": "PatientCare OS v3.1", "network_segment": "VLAN-10", "location": "Ward 3 Bed 12", "connection_protocol": "MQTT", "status": "ONLINE", "risk_score": 15, "cpu_usage": 16, "memory_usage": 21, "temperature": 36.7, "network_traffic": 105},
    {"id": "ECG-01", "name": "Bedside ECG Telemetry 01", "device_type": "Cardiology / Medical", "hospital_department": "Cardiology", "ip_address": "192.168.10.48", "mac_address": "00:1A:2B:3C:4D:09", "os_firmware": "CardioTwin OS v2.4", "network_segment": "VLAN-30", "location": "Cardiology Rm 204", "connection_protocol": "HL7", "status": "ONLINE", "risk_score": 15, "cpu_usage": 19, "memory_usage": 23, "temperature": 36.8, "network_traffic": 130},
    {"id": "SMART-PUMP-01", "name": "ICU Smart Infusion Pump 01", "device_type": "ICU Ward / Medical", "hospital_department": "ICU Ward", "ip_address": "192.168.10.55", "mac_address": "00:1A:2B:3C:4D:10", "os_firmware": "PumpGuard v4.0", "network_segment": "VLAN-30", "location": "ICU Room 104", "connection_protocol": "MQTT", "status": "ONLINE", "risk_score": 15, "cpu_usage": 14, "memory_usage": 18, "temperature": 36.6, "network_traffic": 85},
    {"id": "node-doctor-pc", "name": "Doctor Workstation", "device_type": "Clinical Staff / Workstation", "hospital_department": "Clinical Staff", "ip_address": "192.168.1.105", "mac_address": "00:1A:2B:3C:4D:11", "os_firmware": "Windows 11 Pro Enterprise", "network_segment": "VLAN-10", "location": "Doctor Office 302", "connection_protocol": "RDP / HTTPS", "status": "ONLINE", "risk_score": 20, "cpu_usage": 35, "memory_usage": 50, "temperature": 43.0, "network_traffic": 320},
    {"id": "node-pharmacy", "name": "Pharmacy Medication Dispenser", "device_type": "Pharmacy / Medical", "hospital_department": "Pharmacy Ward", "ip_address": "192.168.1.150", "mac_address": "00:1A:2B:3C:4D:12", "os_firmware": "PharmaTwin OS v1.5", "network_segment": "VLAN-20", "location": "Pharmacy Rm 105", "connection_protocol": "REST / TLS", "status": "ONLINE", "risk_score": 12, "cpu_usage": 22, "memory_usage": 28, "temperature": 37.5, "network_traffic": 210}
]

db_manager.seed_initial_devices(INITIAL_DEVICES)
db_manager.seed_initial_users()


attack_engine = AttackEngine(INITIAL_DEVICES, db_manager)
defense_engine = DefenseEngine(INITIAL_DEVICES, attack_engine, db_manager)
ai_engine = AISecurityEngine()
risk_engine = RiskEngine()


def generate_jwt_token(user_data):
    payload = {
        'user_id': user_data.get('id') or user_data.get('user_id'),
        'email': user_data.get('email'),
        'role': user_data.get('role', 'Security Analyst'),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header:
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
            else:
                token = auth_header
        if not token:
            token = request.headers.get('X-Auth-Token')

        if not token:
            return jsonify({'message': 'Authentication token is missing'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = db_manager.get_user_by_email(data.get('email'))
        except Exception as e:
            return jsonify({'message': 'Invalid or expired token'}), 401

        return f(current_user, *args, **kwargs)
    return decorated


# --- BASE ROUTES ---
@app.route('/', methods=['GET'])
def root_status():
    return jsonify({
        "status": "success",
        "message": "Twin-Guard Backend is running",
        "database": "Firebase Firestore" if not db_manager.is_mock else "Firebase Firestore (In-Memory Fallback)"
    }), 200


@app.route('/api/health', methods=['GET'])
def health_check():
    devices = db_manager.get_devices()
    return jsonify({
        "status": "healthy",
        "database_status": "connected",
        "database_engine": "Firebase Firestore" if not db_manager.is_mock else "Firebase Firestore (In-Memory Fallback)",
        "devices_count": len(devices),
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }), 200


# --- AUTHENTICATION & USER MANAGEMENT ---
@app.route('/api/auth/register', methods=['POST'])
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()
    name = (data.get('name') or '').strip() or email.split('@')[0]
    role = data.get('role', 'Security Analyst')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    existing_user = db_manager.get_user_by_email(email)
    if existing_user:
        return jsonify({"message": "An account with this email already exists"}), 409

    hashed_pw = generate_password_hash(password)
    user_obj = {
        "name": name,
        "email": email,
        "password_hash": hashed_pw,
        "role": role,
        "status": "ACTIVE"
    }

    saved_user = db_manager.save_user(user_obj)
    token = generate_jwt_token(saved_user)
    db_manager.save_audit_log("User Registration", f"New user '{email}' registered with role '{role}'", email)

    clean_user = {k: v for k, v in saved_user.items() if k != "password_hash"}
    return jsonify({
        "status": "success",
        "message": "User registered successfully",
        "token": token,
        "user": clean_user
    }), 201


@app.route('/api/auth/login', methods=['POST'])
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = db_manager.get_user_by_email(email)

    if not user:
        db_manager.save_audit_log("Failed Login", f"Failed login attempt for email '{email}'", email)
        return jsonify({"message": "Invalid email or password"}), 401

    if not check_password_hash(user.get("password_hash", ""), password):
        db_manager.save_audit_log("Failed Login", f"Incorrect password for email '{email}'", email)
        return jsonify({"message": "Invalid email or password"}), 401

    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    db_manager.update_user(user["id"], {"last_login": now_str})
    token = generate_jwt_token(user)

    db_manager.save_audit_log("User Login", f"User '{email}' authenticated successfully", email)
    clean_user = {k: v for k, v in user.items() if k != "password_hash"}

    return jsonify({
        "status": "success",
        "message": "Authenticated successfully",
        "token": token,
        "user": clean_user
    }), 200


@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    if not current_user:
        return jsonify({"message": "User not found"}), 44
    clean_user = {k: v for k, v in current_user.items() if k != "password_hash"}
    return jsonify({"user": clean_user}), 200


@app.route('/api/users', methods=['GET'])
def get_users():
    users = db_manager.get_users()
    return jsonify(users), 200


@app.route('/api/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json or {}
    db_manager.update_user(user_id, data)
    return jsonify({"message": "User updated successfully"}), 200


@app.route('/api/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    db_manager.delete_user(user_id)
    return jsonify({"message": "User deleted successfully"}), 200


# --- ALERTS MANAGEMENT ---
@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    alerts = db_manager.get_alerts()
    return jsonify(alerts), 200


@app.route('/api/alerts', methods=['POST'])
def create_alert():
    data = request.json or {}
    saved = db_manager.save_alert(data)
    db_manager.save_audit_log("Alert Created", f"Security Alert '{saved.get('title')}' created")
    return jsonify({"message": "Alert created successfully", "alert": saved}), 201


@app.route('/api/alerts/<alert_id>', methods=['PUT'])
def update_alert(alert_id):
    data = request.json or {}
    db_manager.update_alert(alert_id, data)
    return jsonify({"message": "Alert updated successfully"}), 200


@app.route('/api/alerts/<alert_id>', methods=['DELETE'])
def delete_alert(alert_id):
    db_manager.delete_alert(alert_id)
    return jsonify({"message": "Alert deleted successfully"}), 200


# --- INCIDENTS MANAGEMENT ---
@app.route('/api/incidents', methods=['GET'])
def get_incidents():
    incidents = db_manager.get_incidents()
    return jsonify(incidents), 200


@app.route('/api/incidents', methods=['POST'])
def create_incident():
    data = request.json or {}
    saved = db_manager.save_incident(data)
    db_manager.save_audit_log("Incident Created", f"Incident '{saved.get('title')}' logged")
    return jsonify({"message": "Incident created successfully", "incident": saved}), 201


@app.route('/api/incidents/<incident_id>', methods=['PUT'])
def update_incident(incident_id):
    data = request.json or {}
    db_manager.update_incident(incident_id, data)
    return jsonify({"message": "Incident updated successfully"}), 200


@app.route('/api/incidents/<incident_id>', methods=['DELETE'])
def delete_incident(incident_id):
    db_manager.delete_incident(incident_id)
    return jsonify({"message": "Incident deleted successfully"}), 200


# --- DIGITAL TWINS & DEVICE CRUD ---
@app.route('/api/devices', methods=['GET'])
@app.route('/api/twin', methods=['GET'])
def get_devices():
    devices = db_manager.get_devices()
    return jsonify(devices), 200


@app.route('/api/devices', methods=['POST'])
def add_device():
    data = request.json or {}
    if not data.get("name"):
        return jsonify({"error": "Device name is required"}), 400

    dev_id = data.get("id") or f"{data['name'].upper().replace(' ', '-')}-{uuid.uuid4().hex[:4].upper()}"
    new_device = {
        "id": dev_id,
        "name": data["name"],
        "device_type": data.get("device_type", "Clinical Workstation"),
        "hospital_department": data.get("hospital_department", "ICU Ward"),
        "ip_address": data.get("ip_address", "192.168.1.100"),
        "mac_address": data.get("mac_address", "00:1A:2B:3C:4D:5E"),
        "os_firmware": data.get("os_firmware", "TwinGuard OS v2.1"),
        "network_segment": data.get("network_segment", "VLAN-10"),
        "location": data.get("location", "Main Building"),
        "connection_protocol": data.get("connection_protocol", "MQTT"),
        "status": data.get("status", "ONLINE"),
        "risk_score": data.get("risk_score", 15),
        "cpu_usage": data.get("cpu_usage", 20),
        "memory_usage": data.get("memory_usage", 30),
        "temperature": data.get("temperature", 36.6),
        "network_traffic": data.get("network_traffic", 100),
        "detected_threat": "None",
        "defense_action": "None",
        "last_seen": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "last_activity": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    db_manager.save_device(new_device)
    db_manager.save_audit_log("Device Registered", f"Device '{new_device['name']}' ({dev_id}) added")
    return jsonify({"message": f"Device '{new_device['name']}' registered successfully", "device": new_device}), 201


@app.route('/api/devices/<device_id>', methods=['PUT'])
def update_device(device_id):
    data = request.json or {}
    devices = db_manager.get_devices()
    target_dev = next((d for d in devices if d["id"].lower() == device_id.lower() or d["name"].lower() == device_id.lower()), None)
    if not target_dev:
        return jsonify({"error": f"Device '{device_id}' not found"}), 404

    target_id = target_dev["id"]
    db_manager.update_device(target_id, data)
    updated_devices = db_manager.get_devices()
    updated_dev = next((d for d in updated_devices if d["id"] == target_id), None)
    return jsonify({"message": f"Device '{target_dev['name']}' updated successfully", "device": updated_dev}), 200


@app.route('/api/devices/<device_id>', methods=['DELETE'])
def delete_device(device_id):
    devices = db_manager.get_devices()
    target_dev = next((d for d in devices if d["id"].lower() == device_id.lower() or d["name"].lower() == device_id.lower()), None)
    if not target_dev:
        return jsonify({"error": f"Device '{device_id}' not found"}), 404

    target_id = target_dev["id"]
    db_manager.delete_device(target_id)
    db_manager.save_audit_log("Device Deleted", f"Device '{target_dev['name']}' ({target_id}) removed")
    return jsonify({"message": f"Device '{target_dev['name']}' deleted successfully"}), 200


# --- ATTACK SIMULATION & DEFENSE ---
@app.route('/api/simulate-attack', methods=['POST'])
@app.route('/api/attack', methods=['POST'])
def simulate_attack():
    data = request.json or {}
    attack_type = data.get("attack_type") or data.get("type") or "Ransomware"
    target_name = data.get("target_device") or data.get("target") or "Core Hospital Server"
    severity = data.get("severity", "CRITICAL")

    attack_record, target_dev = attack_engine.launch_attack(attack_type, target_name, severity)
    ai_rec = ai_engine.get_recommendation(attack_type, target_dev["name"], target_dev.get("risk_score", 50))

    db_manager.save_audit_log("Attack Simulated", f"{attack_type} launched against {target_dev['name']}")

    return jsonify({
        "status": "success",
        "message": f"Attack simulated against {target_dev['name']}",
        "attack": attack_record,
        "result": attack_record,
        "device": target_dev,
        "ai_recommendation": ai_rec
    }), 200


@app.route('/api/trigger-defense', methods=['POST'])
@app.route('/api/defend', methods=['POST'])
@app.route('/api/defense', methods=['POST'])
def trigger_defense():

    data = request.json or {}
    attack_id = data.get("attack_id", "ATTACK-LATEST")
    action = data.get("defense_action") or data.get("action") or data.get("action_code") or "ISOLATE_DEVICE"
    target_name = data.get("target_device") or data.get("target") or data.get("device_id") or "Core Hospital Server"

    devices = db_manager.get_devices()
    target_dev = next((d for d in devices if d["name"].lower() == target_name.lower() or d["id"].lower() == target_name.lower()), None)
    if not target_dev:
        target_dev = next((d for d in devices if target_name.lower() in d["name"].lower()), None)

    if not target_dev:
        return jsonify({"error": f"Target device '{target_name}' not found"}), 404

    target_id = target_dev["id"]
    result = defense_engine.execute_defense(target_dev["name"], action, attack_id)
    db_manager.save_audit_log("Defense Triggered", f"Defense '{action}' applied to {target_dev['name']}")

    updated_devices = db_manager.get_devices()
    updated_dev = next((d for d in updated_devices if d["id"] == target_id), target_dev)

    return jsonify({
        "status": "success",
        "message": f"Defense executed for {target_dev['name']}",
        "defense": result,
        "result": result,
        "device": updated_dev
    }), 200


@app.route('/api/heartbeat', methods=['POST'])
def heartbeat():
    data = request.json or {}
    device_id = data.get("device_id") or data.get("id") or "ICU-MONITOR-01"
    status = data.get("status", "online")
    db_manager.record_heartbeat(device_id, status)
    return jsonify({"status": "success", "message": f"Heartbeat recorded for {device_id}"}), 200


@app.route('/api/telemetry', methods=['POST'])
def telemetry():
    data = request.json or {}
    device_id = data.get("device_id") or data.get("id") or "ICU-MONITOR-01"
    db_manager.record_telemetry(device_id, data)
    return jsonify({"status": "success", "message": f"Telemetry recorded for {device_id}"}), 200



@app.route('/api/events', methods=['POST'])
def log_security_event():
    data = request.json or {}
    event_type = data.get("event_type", "Suspicious Traffic")
    target_name = data.get("target_device") or data.get("target") or "ICU Bedside Monitor 01"
    severity = data.get("severity", "MEDIUM")
    description = data.get("description", "Anomalous network activity detected.")
    source = data.get("source", "Manual Security Entry")
    timestamp = data.get("timestamp") or datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    saved_event = db_manager.save_security_event(event_type, target_name, severity, description, source, timestamp)

    # Update target device status if found
    devices = db_manager.get_devices()
    target_dev = next((d for d in devices if d["name"].lower() == target_name.lower() or d["id"].lower() == target_name.lower() or target_name.lower() in d["name"].lower()), None)

    if target_dev:
        new_status = "SUSPICIOUS" if severity in ["MEDIUM", "LOW"] else "UNDER_ATTACK"
        target_dev["status"] = new_status
        target_dev["detected_threat"] = event_type
        target_dev["risk_score"] = min(95, target_dev.get("risk_score", 15) + (50 if severity == "HIGH" else 35))
        target_dev["last_activity"] = timestamp
        db_manager.save_device(target_dev)

    # Also log alert and audit log
    db_manager.save_alert({
        "title": f"Security Event: {event_type}",
        "message": description,
        "severity": severity,
        "target_device": target_name,
        "timestamp": timestamp
    })
    db_manager.save_audit_log("Manual Security Event", f"Event '{event_type}' logged for {target_name}")

    return jsonify({
        "status": "success",
        "message": f"Security event '{event_type}' logged successfully for {target_name}",
        "event": saved_event,
        "device": target_dev
    }), 201


@app.route('/api/events', methods=['GET'])
def get_security_events():
    events = db_manager.get_security_events()
    return jsonify(events), 200


@app.route('/api/toggle-autodefense', methods=['POST'])
@app.route('/api/autodefense', methods=['POST', 'GET'])
def toggle_autodefense():
    if request.method == 'POST':
        data = request.json or {}
        if "enabled" in data:
            defense_engine.auto_defense_enabled = bool(data["enabled"])
        else:
            defense_engine.auto_defense_enabled = not defense_engine.auto_defense_enabled

        state_str = "ENABLED" if defense_engine.auto_defense_enabled else "DISABLED"
        db_manager.save_audit_log("Auto Defense Toggled", f"Automated mitigation thread set to {state_str}")

    return jsonify({
        "status": "success",
        "auto_defense_enabled": defense_engine.auto_defense_enabled,
        "message": f"Automated threat mitigation is {'ENABLED' if defense_engine.auto_defense_enabled else 'DISABLED'}"
    }), 200


@app.route('/api/ai-recommendation', methods=['POST', 'GET'])
def get_ai_recommendation():
    if request.method == 'POST':
        data = request.json or {}
        target_name = data.get("target_device") or data.get("target") or "Core Hospital Server"
        attack_type = data.get("attack_type") or data.get("type") or "Ransomware"
    else:
        target_name = request.args.get("target", "Core Hospital Server")
        attack_type = request.args.get("type", "Ransomware")

    devices = db_manager.get_devices()
    target_dev = next((d for d in devices if d["name"].lower() == target_name.lower() or d["id"].lower() == target_name.lower() or target_name.lower() in d["name"].lower()), None)
    risk_score = target_dev.get("risk_score", 50) if target_dev else 50

    rec = ai_engine.get_recommendation(attack_type, target_name, risk_score)
    return jsonify(rec), 200


COMPLETED_BATTLE_ROUNDS = []

@app.route('/api/ai-agent/step', methods=['POST'])
def ai_agent_step():
    import random
    devices = db_manager.get_devices()
    under_attack = [d for d in devices if d.get("status") == "UNDER_ATTACK"]

    if under_attack:
        # AI Blue-Team Agent Defends
        target_dev = random.choice(under_attack)
        threat = target_dev.get("detected_threat", "Malware")

        if "DDOS" in threat.upper():
            action_code = "BLOCK_TRAFFIC"
        elif "SQL" in threat.upper():
            action_code = "PROTECT_DATABASE"
        else:
            action_code = "ISOLATE_DEVICE"

        defense_res = defense_engine.execute_defense(target_dev["name"], action_code=action_code)
        rec = ai_engine.get_recommendation(threat, target_dev["name"], target_dev.get("risk_score", 70))

        # Record Completed Battle Round
        round_num = len(COMPLETED_BATTLE_ROUNDS) + 1
        round_record = {
            "round_number": round_num,
            "target_device": target_dev["name"],
            "threat_simulated": threat,
            "defense_applied": action_code,
            "status": "COMPLETED & NEUTRALIZED",
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        COMPLETED_BATTLE_ROUNDS.append(round_record)

        db_manager.save_audit_log("AI Blue-Team Agent", f"Round {round_num} Completed: Defense '{action_code}' applied to {target_dev['name']}")

        return jsonify({
            "status": "success",
            "agent_type": "BLUE_TEAM",
            "action": f"Executed {action_code}",
            "target_device": target_dev["name"],
            "reasoning": f"AI Blue-Team detected active {threat} on {target_dev['name']}. Triggered automated countermeasure {action_code}. Battle Round {round_num} COMPLETED.",
            "defense": defense_res,
            "ai_recommendation": rec,
            "round_completed": round_record,
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }), 200

    else:
        # AI Red-Team Agent Attacks
        available_devices = [d for d in devices if d.get("status") in ["ONLINE", "SAFE"]]
        if not available_devices:
            available_devices = devices

        target_dev = random.choice(available_devices)
        attack_types = ["Ransomware", "DDoS", "SQL Injection", "Zero-Day Malware", "Phishing", "Insider Threat"]
        attack_type = random.choice(attack_types)
        severity = random.choice(["HIGH", "CRITICAL"])

        attack_rec, target_updated = attack_engine.launch_attack(attack_type, target_dev["name"], severity)
        rec = ai_engine.get_recommendation(attack_type, target_updated["name"], target_updated.get("risk_score", 85))

        db_manager.save_audit_log("AI Red-Team Agent", f"Autonomous attack '{attack_type}' launched against {target_updated['name']}")

        return jsonify({
            "status": "success",
            "agent_type": "RED_TEAM",
            "action": f"Simulated {attack_type}",
            "target_device": target_updated["name"],
            "reasoning": f"AI Red-Team identified asset vulnerability on {target_updated['name']}. Initiated simulated {attack_type} ({severity}) payload execution.",
            "attack": attack_rec,
            "ai_recommendation": rec,
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }), 200



@app.route('/api/status', methods=['GET'])
def get_system_status():
    devices = db_manager.get_devices()
    under_attack = sum(1 for d in devices if d.get("status") == "UNDER_ATTACK")
    suspicious = sum(1 for d in devices if d.get("status") == "SUSPICIOUS")
    defended = sum(1 for d in devices if d.get("status") in ["DEFENDED", "SAFE"])
    isolated = sum(1 for d in devices if d.get("status") == "ISOLATED")
    safe = sum(1 for d in devices if d.get("status") in ["ONLINE", "SAFE"])

    risk_score, risk_level = RiskEngine.calculate_overall_risk(devices)

    return jsonify({
        "total_devices": len(devices),
        "safe_devices": safe,
        "under_attack_devices": under_attack,
        "suspicious_devices": suspicious,
        "defended_devices": defended,
        "isolated_devices": isolated,
        "overall_risk_score": risk_score,
        "hospital_risk_score": risk_score,
        "risk_level": risk_level,
        "hospital_risk_level": risk_level,
        "auto_defense_enabled": defense_engine.auto_defense_enabled
    }), 200


@app.route('/api/attacks', methods=['GET'])
def get_attacks():
    return jsonify(db_manager.get_attack_history()), 200


@app.route('/api/defenses', methods=['GET'])
def get_defenses():
    return jsonify(db_manager.get_defense_history()), 200


@app.route('/api/audit-logs', methods=['GET'])
def get_audit_logs():
    return jsonify(db_manager.get_audit_logs()), 200


@app.route('/api/reports/summary', methods=['GET'])
def get_reports_summary():
    devices = db_manager.get_devices()
    attacks = db_manager.get_attack_history()
    defenses = db_manager.get_defense_history()
    risk_score, risk_level = RiskEngine.calculate_overall_risk(devices)

    total_attacks = len(attacks)
    successful_defenses = len(defenses)
    isolated_devices = sum(1 for d in devices if d.get("status") == "ISOLATED")
    rate_str = f"{(successful_defenses / max(1, total_attacks) * 100):.1f}%" if total_attacks > 0 else "100.0%"

    most_targeted = "Core Hospital Server"
    if attacks:
        counts = {}
        for a in attacks:
            t = a.get("target_device") or a.get("target", "")
            counts[t] = counts.get(t, 0) + 1
        most_targeted = max(counts, key=counts.get) if counts else most_targeted

    most_common_attack = "Ransomware"
    if attacks:
        acounts = {}
        for a in attacks:
            t = a.get("attack_type", "")
            acounts[t] = acounts.get(t, 0) + 1
        most_common_attack = max(acounts, key=acounts.get) if acounts else most_common_attack

    return jsonify({
        "title": "TwinGuard Smart Hospital Cybersecurity Executive Incident & SOC Performance Report",
        "generated_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "hospital_name": "TwinGuard Central Hospital",
        "total_devices": len(devices),
        "total_attacks": total_attacks,
        "total_attacks_logged": total_attacks,
        "successful_defenses": successful_defenses,
        "total_defenses_executed": successful_defenses,
        "defense_success_rate": rate_str,
        "isolated_devices": isolated_devices,
        "avg_response_time_ms": 320,
        "avg_risk_score": risk_score,
        "most_targeted_device": most_targeted,
        "most_common_attack": most_common_attack,
        "current_hospital_risk": {"risk_score": risk_score, "risk_level": risk_level},
        "completed_battle_rounds_count": len(COMPLETED_BATTLE_ROUNDS),
        "battle_rounds_log": COMPLETED_BATTLE_ROUNDS,
        "active_devices": [
            {
                "id": d["id"],
                "name": d["name"],
                "department": d.get("hospital_department", "ICU"),
                "status": d["status"],
                "risk_score": d["risk_score"]
            } for d in devices
        ]

    }), 200


@app.route('/api/reset-system', methods=['POST'])
@app.route('/api/reset', methods=['POST'])
@app.route('/api/twin/reset', methods=['POST'])
def reset_system():

    try:
        db_manager.reset_twin_db()
        db_manager.seed_initial_devices(INITIAL_DEVICES)
        db_manager.save_audit_log("System Reset", "Digital Twin platform reset to baseline status")
        return jsonify({
            "status": "success",
            "message": "System baseline restored successfully",
            "devices_count": len(INITIAL_DEVICES)
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to reset system: {e}"}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Twin-Guard Backend Server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)

