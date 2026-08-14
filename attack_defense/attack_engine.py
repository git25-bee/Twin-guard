import uuid
import time
from datetime import datetime

class AttackEngine:
    """
    Simulates cyber attacks on the Hospital Digital Twin environment safely without affecting real network infrastructure.
    Attacks: Ransomware, DDoS, SQL Injection, Malware, Insider Threat, Phishing.
    """
    def __init__(self, devices_state, db_manager):
        self.devices_state = devices_state
        self.db_manager = db_manager
        self.active_attacks = {}

    def launch_attack(self, attack_type, target_name, severity="HIGH"):
        """
        Launches an attack simulation on the target device.
        """
        # Find device in state
        target_device = None
        for dev in self.devices_state:
            if dev["name"].lower() == target_name.lower() or dev["id"].lower() == target_name.lower():
                target_device = dev
                break

        if not target_device:
            # Default to Hospital Server if target not found
            target_device = self.devices_state[2]

        attack_id = f"ATK-{str(uuid.uuid4())[:8].upper()}"
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Set device under attack
        target_device["status"] = "UNDER_ATTACK"
        target_device["detected_threat"] = attack_type
        
        # Attack severity dynamics
        if attack_type == "Ransomware":
            target_device["risk_score"] = 88
            target_device["cpu_usage"] = 92
            target_device["memory_usage"] = 85
            target_device["network_traffic"] = 450
        elif attack_type == "DDoS":
            target_device["risk_score"] = 82
            target_device["cpu_usage"] = 98
            target_device["memory_usage"] = 90
            target_device["network_traffic"] = 1250
        elif attack_type == "SQL Injection":
            target_device["risk_score"] = 85
            target_device["cpu_usage"] = 75
            target_device["memory_usage"] = 65
            target_device["network_traffic"] = 380
        elif attack_type == "Insider Threat":
            target_device["risk_score"] = 78
            target_device["cpu_usage"] = 60
            target_device["memory_usage"] = 55
            target_device["network_traffic"] = 600
        elif attack_type == "Phishing":
            target_device["risk_score"] = 72
            target_device["cpu_usage"] = 50
            target_device["memory_usage"] = 45
            target_device["network_traffic"] = 280
        else: # Malware
            target_device["risk_score"] = 79
            target_device["cpu_usage"] = 84
            target_device["memory_usage"] = 78
            target_device["network_traffic"] = 520

        target_device["last_activity"] = timestamp

        attack_record = {
            "attack_id": attack_id,
            "attack_type": attack_type,
            "target_device": target_device["name"],
            "severity": severity,
            "risk_score": target_device["risk_score"],
            "timestamp": timestamp,
            "status": "ACTIVE"
        }

        self.active_attacks[attack_id] = attack_record
        
        # Save to database
        if self.db_manager:
            try:
                self.db_manager.save_attack(
                    attack_id, attack_type, target_device["name"],
                    severity, target_device["risk_score"], timestamp, "ACTIVE"
                )
            except Exception as e:
                print(f"[Attack Engine DB Warning] {e}")

        return attack_record, target_device
