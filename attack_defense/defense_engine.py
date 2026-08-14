import time
import uuid
import threading
from datetime import datetime

class DefenseEngine:
    """
    Automated Defense Engine using Python threading to continuously monitor metrics and trigger mitigation.
    Thread 1: Monitors metrics (CPU, Memory, Network Traffic, Risk Score)
    Thread 2: Executes Defense Actions (Isolate Device, Firewall Block, Database Protection, Recovery)
    """
    def __init__(self, devices_state, attack_engine, db_manager):
        self.devices_state = devices_state
        self.attack_engine = attack_engine
        self.db_manager = db_manager
        self.auto_defense_enabled = True
        self.running = True
        self.defense_logs = []

        # Start monitoring and defense threads
        self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.defense_thread = threading.Thread(target=self._defense_loop, daemon=True)
        
        self.monitor_thread.start()
        self.defense_thread.start()

    def execute_defense(self, target_name, action_code="ISOLATE_DEVICE", attack_id=None):
        """
        Executes explicit defense action against a target device.
        """
        target_device = None
        for dev in self.devices_state:
            if dev["name"].lower() == target_name.lower() or dev["id"].lower() == target_name.lower():
                target_device = dev
                break

        if not target_device:
            return None

        defense_id = f"DEF-{str(uuid.uuid4())[:8].upper()}"
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        prev_status = target_device["status"]

        if action_code == "ISOLATE_DEVICE":
            target_device["status"] = "ISOLATED"
            target_device["defense_action"] = "Device Network Isolated"
            target_device["risk_score"] = max(10, target_device["risk_score"] - 45)
            target_device["cpu_usage"] = 25
            target_device["network_traffic"] = 0
        elif action_code in ["BLOCK_TRAFFIC", "ACTIVATE_FIREWALL"]:
            target_device["status"] = "DEFENDED"
            target_device["defense_action"] = "Firewall Rate-Limit & Traffic Scrubbing"
            target_device["risk_score"] = 28
            target_device["cpu_usage"] = 35
            target_device["network_traffic"] = 120
        elif action_code == "PROTECT_DATABASE":
            target_device["status"] = "DEFENDED"
            target_device["defense_action"] = "WAF SQLi Filter & Transaction Lock"
            target_device["risk_score"] = 22
            target_device["cpu_usage"] = 30
        elif action_code == "MARK_SAFE":
            target_device["status"] = "SAFE"
            target_device["detected_threat"] = "None"
            target_device["defense_action"] = "System Cleaned & Verified Safe"
            target_device["risk_score"] = 15
            target_device["cpu_usage"] = 18
            target_device["memory_usage"] = 25
            target_device["network_traffic"] = 90

        target_device["last_activity"] = timestamp

        # Deactivate associated active attack
        for atk_key, atk_val in list(self.attack_engine.active_attacks.items()):
            if atk_val["target_device"].lower() == target_device["name"].lower():
                atk_val["status"] = "MITIGATED"

        defense_record = {
            "defense_id": defense_id,
            "attack_id": attack_id or "ATK-AUTO",
            "target_device": target_device["name"],
            "action": target_device["defense_action"],
            "response_time_ms": 320,
            "result": "SUCCESS",
            "timestamp": timestamp
        }

        self.defense_logs.append(defense_record)

        if self.db_manager:
            try:
                self.db_manager.save_defense(
                    defense_id, attack_id or "ATK-AUTO", target_device["name"],
                    target_device["defense_action"], 320, "SUCCESS", timestamp
                )
            except Exception as e:
                print(f"[Defense DB Warning] {e}")

        # Schedule automatic recovery to SAFE after 6 seconds if ISOLATED or DEFENDED
        threading.Thread(target=self._schedule_recovery, args=(target_device,), daemon=True).start()

        return defense_record

    def _schedule_recovery(self, device):
        """
        Simulates post-defense recovery workflow:
        ISOLATED / DEFENDED -> SAFE
        """
        time.sleep(5)
        if device["status"] in ["ISOLATED", "DEFENDED"]:
            device["status"] = "SAFE"
            device["detected_threat"] = "None"
            device["defense_action"] = "System Recovered & Marked Safe"
            device["risk_score"] = 15
            device["cpu_usage"] = 20
            device["memory_usage"] = 28
            device["network_traffic"] = 100
            device["last_activity"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def _monitor_loop(self):
        """
        Thread 1: Monitors device metrics continuously.
        """
        while self.running:
            time.sleep(2)
            for dev in self.devices_state:
                if dev["status"] == "UNDER_ATTACK":
                    # Keep CPU high while under attack
                    dev["cpu_usage"] = min(99, dev["cpu_usage"] + 2)
                    dev["network_traffic"] = min(1500, dev["network_traffic"] + 20)

    def _defense_loop(self):
        """
        Thread 2: Automatically responds to UNDER_ATTACK devices when auto_defense is enabled.
        """
        while self.running:
            time.sleep(3)
            if self.auto_defense_enabled:
                for dev in self.devices_state:
                    if dev["status"] == "UNDER_ATTACK":
                        # Auto-mitigate attack after detection delay
                        time.sleep(2)
                        threat = dev.get("detected_threat", "")
                        if threat == "DDoS":
                            action = "BLOCK_TRAFFIC"
                        elif threat == "SQL Injection":
                            action = "PROTECT_DATABASE"
                        else:
                            action = "ISOLATE_DEVICE"
                        
                        self.execute_defense(dev["name"], action_code=action)
