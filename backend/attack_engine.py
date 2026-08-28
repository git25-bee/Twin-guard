import uuid
import time
from datetime import datetime

class AttackEngine:
    """
    Simulates cyber attacks on the Hospital Digital Twin environment safely without affecting real network infrastructure.
    Supported Simulations: Ransomware, DDoS, SQL Injection, Zero-Day Malware, Insider Threat, Phishing.
    """
    def __init__(self, devices_state, db_manager):
        self.devices_state = devices_state
        self.db_manager = db_manager
        self.active_attacks = {}

    def launch_attack(self, attack_type, target_name, severity="HIGH"):
        """
        Launches an attack simulation on the target device and persists state to Firestore.
        """
        target_device = None
        for dev in self.devices_state:
            if dev["name"].lower() == target_name.lower() or dev["id"].lower() == target_name.lower() or target_name.lower() in dev["name"].lower() or target_name.lower() in dev["id"].lower():
                target_device = dev
                break

        if not target_device:
            target_device = self.devices_state[2] if len(self.devices_state) > 2 else self.devices_state[0]

        attack_id = f"ATK-{str(uuid.uuid4())[:8].upper()}"
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Set target device under attack
        target_device["status"] = "UNDER_ATTACK"
        target_device["detected_threat"] = attack_type
        
        # Attack severity dynamics
        if attack_type == "Ransomware":
            target_device["risk_score"] = 88
            target_device["cpu_usage"] = 92
            target_device["memory_usage"] = 85
            target_device["network_traffic"] = 450
            description = f"Simulated Ransomware activity detected on {target_device['name']}. Encrypting file system structures."
        elif attack_type == "DDoS":
            target_device["risk_score"] = 82
            target_device["cpu_usage"] = 98
            target_device["memory_usage"] = 90
            target_device["network_traffic"] = 1250
            description = f"Simulated DDoS volumetric packet flood targeting {target_device['name']}. Bandwidth saturated."
        elif attack_type == "SQL Injection":
            target_device["risk_score"] = 85
            target_device["cpu_usage"] = 75
            target_device["memory_usage"] = 65
            target_device["network_traffic"] = 380
            description = f"Simulated SQL injection exploit attempting auth bypass on {target_device['name']} database."
        elif attack_type == "Insider Threat":
            target_device["risk_score"] = 78
            target_device["cpu_usage"] = 60
            target_device["memory_usage"] = 55
            target_device["network_traffic"] = 600
            description = f"Simulated insider threat credential escalation detected on {target_device['name']}."
        elif attack_type == "Phishing":
            target_device["risk_score"] = 72
            target_device["cpu_usage"] = 50
            target_device["memory_usage"] = 45
            target_device["network_traffic"] = 280
            description = f"Simulated phishing link executed on {target_device['name']}. Credential harvesting attempt."
        else: # Malware
            target_device["risk_score"] = 79
            target_device["cpu_usage"] = 84
            target_device["memory_usage"] = 78
            target_device["network_traffic"] = 520
            description = f"Simulated Zero-Day malware execution on {target_device['name']}. Lateral movement detected."

        target_device["last_activity"] = timestamp

        # Logical Attack Propagation using Digital Twin Network Topology
        target_id_lower = target_device["id"].lower()
        target_name_lower = target_device["name"].lower()

        propagated_targets = []
        if "server" in target_id_lower or "server" in target_name_lower:
            propagated_targets = ["node-patient-db", "node-ehr", "node-doctor-pc"]
        elif "ehr" in target_id_lower or "ehr" in target_name_lower:
            propagated_targets = ["node-patient-db"]
        elif "firewall" in target_id_lower or "firewall" in target_name_lower:
            propagated_targets = ["node-server"]
        elif "patient-db" in target_id_lower or "patient database" in target_name_lower:
            propagated_targets = ["node-ehr"]

        for dev in self.devices_state:
            if (dev["id"].lower() in propagated_targets or any(pt in dev["name"].lower() for pt in propagated_targets)) and dev["status"] == "SAFE":
                dev["status"] = "SUSPICIOUS"
                dev["detected_threat"] = "Propagated Threat Risk"
                dev["risk_score"] = min(75, dev.get("risk_score", 15) + 45)
                dev["last_activity"] = timestamp
                if self.db_manager:
                    try:
                        self.db_manager.save_device(dev)
                    except Exception:
                        pass

        attack_record = {
            "attack_id": attack_id,
            "id": attack_id,
            "attack_type": attack_type,
            "target_device": target_device["name"],
            "severity": severity,
            "risk_score": target_device["risk_score"],
            "timestamp": timestamp,
            "status": "ACTIVE",
            "source": "Digital Twin Simulator",
            "simulation": True,
            "description": description,
            "response": "Automated Threat Alert Generated"
        }

        self.active_attacks[attack_id] = attack_record
        
        # Save updated device status and attack event directly to database
        if self.db_manager:
            try:
                self.db_manager.save_device(target_device)
                self.db_manager.save_attack(
                    attack_id, attack_type, target_device["name"],
                    severity, target_device["risk_score"], timestamp, "ACTIVE",
                    source="Digital Twin Simulator", simulation=True, description=description
                )
            except Exception as e:
                print(f"[Attack Engine DB Warning] {e}")

        return attack_record, target_device

    # Alias for method compatibility
    execute_attack = launch_attack

