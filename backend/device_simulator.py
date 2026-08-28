import sys
import time
import json
import random
import argparse
import threading
import datetime
import urllib.request
import urllib.parse

try:
    import paho.mqtt.client as mqtt
    MQTT_AVAILABLE = True
except ImportError:
    MQTT_AVAILABLE = False

API_BASE = "http://localhost:5000/api"
MQTT_BROKER = "test.mosquitto.org"
MQTT_PORT = 1883

DEFAULT_SIMULATED_DEVICES = [
    {"id": "ICU-MONITOR-01", "name": "ICU Monitor 01", "type": "Clinical Workstation", "dept": "ICU Ward", "ip": "192.168.2.101"},
    {"id": "VENTILATOR-01", "name": "Ventilator Unit 01", "type": "Critical Medical Imaging", "dept": "Respiratory Ward", "ip": "192.168.3.50"},
    {"id": "ECG-01", "name": "ECG Telemetry 01", "type": "Infusion Pumps & Monitors", "dept": "Cardiology", "ip": "192.168.3.80"},
    {"id": "SMART-PUMP-01", "name": "Infusion Smart Pump 01", "type": "Infusion Pumps & Monitors", "dept": "Pediatrics", "ip": "192.168.3.81"},
    {"id": "PATIENT-MONITOR-01", "name": "Bedside Patient Monitor 01", "type": "Clinical Workstation", "dept": "General Ward", "ip": "192.168.2.102"},
]

class DeviceSimulator:
    def __init__(self, device_id, device_name="Simulated Device", ip_address="192.168.1.100"):
        self.device_id = device_id
        self.device_name = device_name
        self.ip_address = ip_address
        self.running = False
        self.mqtt_client = None
        self.thread = None

    def start(self):
        self.running = True
        self.thread = threading.Thread(target=self._run_loop, daemon=True)
        self.thread.start()
        print(f"  [+] Device '{self.device_id}' simulation STARTED.")

    def stop(self):
        self.running = False
        print(f"  [-] Device '{self.device_id}' simulation STOPPED.")

    def _send_http_payload(self, endpoint, data):
        try:
            url = f"{API_BASE}/{endpoint}"
            req = urllib.request.Request(
                url,
                data=json.dumps(data).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=3) as resp:
                pass
        except Exception:
            pass

    def _run_loop(self):
        # Initialize MQTT if available
        if MQTT_AVAILABLE:
            try:
                self.mqtt_client = mqtt.Client(client_id=f"Sim-{self.device_id}")
                self.mqtt_client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
                self.mqtt_client.loop_start()
            except Exception as e:
                self.mqtt_client = None

        tick = 0
        while self.running:
            now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            # Heartbeat payload every 3 seconds
            hb_payload = {
                "device_id": self.device_id,
                "status": "online",
                "timestamp": now_str
            }

            # Send MQTT heartbeat & HTTP fallback
            if self.mqtt_client:
                try:
                    self.mqtt_client.publish(f"twinguard/devices/{self.device_id}/heartbeat", json.dumps(hb_payload))
                except Exception:
                    pass
            self._send_http_payload("heartbeat", hb_payload)

            # Telemetry payload every 5 seconds (every second loop tick)
            if tick % 2 == 0:
                telemetry_payload = {
                    "device_id": self.device_id,
                    "temperature": round(random.uniform(36.2, 37.8), 1),
                    "cpu_usage": random.randint(18, 55),
                    "memory_usage": random.randint(25, 60),
                    "network_traffic": random.randint(90, 320),
                    "network_status": "connected",
                    "timestamp": now_str
                }
                if self.mqtt_client:
                    try:
                        self.mqtt_client.publish(f"twinguard/devices/{self.device_id}/telemetry", json.dumps(telemetry_payload))
                    except Exception:
                        pass
                self._send_http_payload("telemetry", telemetry_payload)

            tick += 1
            time.sleep(2.5)

        if self.mqtt_client:
            try:
                self.mqtt_client.loop_stop()
                self.mqtt_client.disconnect()
            except Exception:
                pass

def register_device_with_backend(device):
    payload = {
        "name": device.get("name", device["id"]),
        "device_type": device.get("type", "Clinical Workstation"),
        "hospital_department": device.get("dept", "ICU Ward"),
        "ip_address": device.get("ip", "192.168.1.100"),
        "connection_protocol": "MQTT / Telemetry",
        "status": "ONLINE"
    }
    try:
        url = f"{API_BASE}/devices"
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=3) as resp:
            pass
    except Exception:
        pass

def main():
    parser = argparse.ArgumentParser(description="TwinGuard Hospital IoT Device Simulator CLI")
    parser.add_argument("--device", type=str, help="Device ID to simulate (e.g. ICU-MONITOR-01)")
    parser.add_argument("--all", action="store_true", help="Simulate all demo hospital devices simultaneously")
    args = parser.parse_args()

    print("==================================================================")
    print("  TWINGUARD HOSPITAL IOT DEVICE SIMULATOR CLI")
    print("==================================================================")

    active_simulators = {}

    target_devices = []
    if args.all:
        target_devices = DEFAULT_SIMULATED_DEVICES
    elif args.device:
        found = next((d for d in DEFAULT_SIMULATED_DEVICES if d["id"].lower() == args.device.lower()), None)
        if found:
            target_devices = [found]
        else:
            target_devices = [{"id": args.device, "name": args.device, "type": "Clinical Workstation", "dept": "ICU Ward", "ip": "192.168.2.100"}]
    else:
        target_devices = [DEFAULT_SIMULATED_DEVICES[0]]

    # Register and start devices
    for d in target_devices:
        register_device_with_backend(d)
        sim = DeviceSimulator(d["id"], d["name"], d["ip"])
        sim.start()
        active_simulators[d["id"]] = sim

    print("\n  Interactive Terminal Controls:")
    print("   - Type 'status' to view active simulated devices")
    print("   - Type 'stop <device_id>' to simulate network disconnection / offline state")
    print("   - Type 'start <device_id>' to reconnect device")
    print("   - Type 'exit' or Press Ctrl+C to stop simulation\n")

    try:
        while True:
            cmd = input("TwinGuard-Sim> ").strip()
            if not cmd:
                continue

            parts = cmd.split()
            action = parts[0].lower()

            if action == "exit" or action == "quit":
                print("Stopping all simulated devices...")
                for s in active_simulators.values():
                    s.stop()
                break
            elif action == "status":
                print("\n  Current Simulated Devices:")
                for dev_id, sim in active_simulators.items():
                    print(f"   - {dev_id}: {'RUNNING (Sending Telemetry/Heartbeat)' if sim.running else 'STOPPED (Offline)'}")
                print()
            elif action == "stop" and len(parts) > 1:
                dev_id = parts[1]
                sim = next((s for k, s in active_simulators.items() if k.lower() == dev_id.lower()), None)
                if sim:
                    sim.stop()
                else:
                    print(f"  [!] Simulator '{dev_id}' not found.")
            elif action == "start" and len(parts) > 1:
                dev_id = parts[1]
                sim = next((s for k, s in active_simulators.items() if k.lower() == dev_id.lower()), None)
                if sim:
                    if not sim.running:
                        sim.start()
                    else:
                        print(f"  [!] Simulator '{dev_id}' is already running.")
                else:
                    # Create new
                    sim = DeviceSimulator(dev_id, dev_id)
                    sim.start()
                    active_simulators[dev_id] = sim
            else:
                print("  Unknown command. Available commands: status, stop <device_id>, start <device_id>, exit")
    except KeyboardInterrupt:
        print("\nStopping all simulated devices...")
        for s in active_simulators.values():
            s.stop()

if __name__ == '__main__':
    main()
