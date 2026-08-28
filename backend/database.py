import os
import datetime
import requests
import google.auth
import google.auth.transport.requests
from google.oauth2 import service_account

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False


class FirestoreRESTClient:
    """
    Direct REST API Client for Google Cloud Firestore.
    Bypasses Windows gRPC URL encoding issues and communicates directly over HTTPS with Cloud Firestore.
    """
    def __init__(self, project_id, cred_path):
        self.project_id = project_id
        self.cred_path = cred_path
        self.token = None
        self.refresh_token()

    def refresh_token(self):
        try:
            credentials_obj = service_account.Credentials.from_service_account_file(
                self.cred_path,
                scopes=["https://www.googleapis.com/auth/cloud-platform", "https://www.googleapis.com/auth/datastore"]
            )
            auth_req = google.auth.transport.requests.Request()
            credentials_obj.refresh(auth_req)
            self.token = credentials_obj.token
        except Exception as e:
            print(f"[Firestore REST Client Auth Error]: {e}")

    def collection(self, name):
        return FirestoreRESTCollection(self, name)


class FirestoreRESTCollection:
    def __init__(self, client, name):
        self.client = client
        self.name = name

    def document(self, doc_id):
        return FirestoreRESTDocRef(self.client, self.name, doc_id)

    def add(self, data):
        doc_id = f"auto-{datetime.datetime.now().timestamp()}"
        ref = self.document(doc_id)
        ref.set(data)
        return None, ref

    def stream(self):
        if not self.client.token:
            self.client.refresh_token()
        url = f"https://firestore.googleapis.com/v1/projects/{self.client.project_id}/databases/(default)/documents/{self.name}"
        headers = {"Authorization": f"Bearer {self.client.token}"}
        
        r = requests.get(url, headers=headers)
        if r.status_code == 401:
            self.client.refresh_token()
            headers = {"Authorization": f"Bearer {self.client.token}"}
            r = requests.get(url, headers=headers)
        
        results = []
        if r.status_code == 200:
            docs_json = r.json().get("documents", [])
            for d in docs_json:
                doc_name = d.get("name", "")
                doc_id = doc_name.split("/")[-1]
                fields = d.get("fields", {})
                data = {}
                for k, v in fields.items():
                    if "stringValue" in v:
                        data[k] = v["stringValue"]
                    elif "integerValue" in v:
                        data[k] = int(v["integerValue"])
                    elif "doubleValue" in v:
                        data[k] = float(v["doubleValue"])
                    elif "booleanValue" in v:
                        data[k] = v["booleanValue"]
                results.append(InMemoryDocumentSnapshot(doc_id, data))
        return results

    def get(self):
        return self.stream()

    def order_by(self, field, direction=None):
        return self

    def limit(self, count):
        return self


class FirestoreRESTDocRef:
    def __init__(self, client, collection_name, doc_id):
        self.client = client
        self.collection_name = collection_name
        self.doc_id = doc_id

    def set(self, data, merge=False):
        if not self.client.token:
            self.client.refresh_token()
        url = f"https://firestore.googleapis.com/v1/projects/{self.client.project_id}/databases/(default)/documents/{self.collection_name}?documentId={self.doc_id}"
        headers = {"Authorization": f"Bearer {self.client.token}", "Content-Type": "application/json"}
        
        firestore_fields = {}
        for key, val in data.items():
            if isinstance(val, bool):
                firestore_fields[key] = {"booleanValue": val}
            elif isinstance(val, int):
                firestore_fields[key] = {"integerValue": str(val)}
            elif isinstance(val, float):
                firestore_fields[key] = {"doubleValue": val}
            else:
                firestore_fields[key] = {"stringValue": str(val)}

        payload = {"fields": firestore_fields}
        r = requests.post(url, headers=headers, json=payload)
        if r.status_code == 409 or merge:
            patch_url = f"https://firestore.googleapis.com/v1/projects/{self.client.project_id}/databases/(default)/documents/{self.collection_name}/{self.doc_id}"
            r = requests.patch(patch_url, headers=headers, json=payload)

    def update(self, updates):
        self.set(updates, merge=True)

    def delete(self):
        if not self.client.token:
            self.client.refresh_token()
        url = f"https://firestore.googleapis.com/v1/projects/{self.client.project_id}/databases/(default)/documents/{self.collection_name}/{self.doc_id}"
        headers = {"Authorization": f"Bearer {self.client.token}"}
        requests.delete(url, headers=headers)

    def get(self):
        if not self.client.token:
            self.client.refresh_token()
        url = f"https://firestore.googleapis.com/v1/projects/{self.client.project_id}/databases/(default)/documents/{self.collection_name}/{self.doc_id}"
        headers = {"Authorization": f"Bearer {self.client.token}"}
        r = requests.get(url, headers=headers)
        if r.status_code == 200:
            d = r.json()
            fields = d.get("fields", {})
            data = {}
            for k, v in fields.items():
                if "stringValue" in v:
                    data[k] = v["stringValue"]
                elif "integerValue" in v:
                    data[k] = int(v["integerValue"])
                elif "doubleValue" in v:
                    data[k] = float(v["doubleValue"])
                elif "booleanValue" in v:
                    data[k] = v["booleanValue"]
            return InMemoryDocumentSnapshot(self.doc_id, data)
        return InMemoryDocumentSnapshot(self.doc_id, None)


class InMemoryDocumentSnapshot:
    def __init__(self, doc_id, data):
        self.id = doc_id
        self._data = data
        self.exists = data is not None

    def to_dict(self):
        return dict(self._data) if self._data else {}


class MockFirestoreDB:
    def __init__(self):
        self.collections = {}

    def collection(self, name):
        if name not in self.collections:
            self.collections[name] = InMemoryCollection()
        return self.collections[name]


class InMemoryCollection:
    def __init__(self):
        self.docs = {}

    def document(self, doc_id):
        return InMemoryDocumentRef(self, doc_id)

    def add(self, data):
        doc_id = f"auto-{datetime.datetime.now().timestamp()}"
        self.docs[doc_id] = dict(data)
        return None, InMemoryDocumentRef(self, doc_id)

    def stream(self):
        results = []
        for doc_id, data in self.docs.items():
            results.append(InMemoryDocumentSnapshot(doc_id, data))
        return results

    def get(self):
        return self.stream()

    def order_by(self, field, direction=None):
        return self

    def limit(self, count):
        return self


class InMemoryDocumentRef:
    def __init__(self, collection, doc_id):
        self.collection = collection
        self.doc_id = doc_id

    def set(self, data, merge=False):
        if merge and self.doc_id in self.collection.docs:
            self.collection.docs[self.doc_id].update(data)
        else:
            self.collection.docs[self.doc_id] = dict(data)

    def update(self, updates):
        if self.doc_id in self.collection.docs:
            self.collection.docs[self.doc_id].update(updates)
        else:
            self.collection.docs[self.doc_id] = dict(updates)

    def delete(self):
        if self.doc_id in self.collection.docs:
            del self.collection.docs[self.doc_id]

    def get(self):
        data = self.collection.docs.get(self.doc_id)
        return InMemoryDocumentSnapshot(self.doc_id, data) if data else InMemoryDocumentSnapshot(self.doc_id, None)


class DatabaseManager:
    """
    Manages persistence for Digital Twins, Users, Alerts, Incidents, Attacks, Defenses, Reports,
    Telemetry, Heartbeats, and Audit Logs using Firebase Firestore REST API.
    Collections: 'digital_twins', 'users', 'alerts', 'incidents', 'attacks', 'defenses', 'reports', 'telemetry_logs', 'heartbeat_logs', 'audit_logs'
    """
    def __init__(self):
        self.db = None
        self.is_mock = False
        self.recent_audit_keys = {}
        self.init_firebase()


    def init_firebase(self):
        cred_path = os.environ.get("FIREBASE_CREDENTIALS_PATH")
        if not cred_path:
            default_path = os.path.join(os.path.dirname(__file__), "firebase-key.json")
            if os.path.exists(default_path):
                cred_path = default_path

        project_id = "twinguard-f2ab1"
        if cred_path and os.path.exists(cred_path):
            try:
                self.db = FirestoreRESTClient(project_id, cred_path)
                # Verify live Cloud Firestore connection
                test_docs = self.db.collection('digital_twins').stream()
                print(f"[Firebase Cloud] Successfully connected to Firebase Cloud Firestore for '{project_id}' via REST API!")
                return
            except Exception as e:
                print(f"[Firebase Notice] REST API error ({e}). Operating in memory fallback mode.")

        print("[Firebase Notice] Using fallback store.")
        self.db = MockFirestoreDB()
        self.is_mock = True

    def seed_initial_users(self):
        try:
            admin_user = self.get_user_by_email("admin@twinguard.com")
            if not admin_user:
                from werkzeug.security import generate_password_hash
                self.save_user({
                    "name": "SOC Admin",
                    "email": "admin@twinguard.com",
                    "password_hash": generate_password_hash("admin123"),
                    "role": "SOC Admin",
                    "status": "ACTIVE"
                })
                print("[Database] Default admin user 'admin@twinguard.com' seeded successfully.")
        except Exception as e:
            print(f"[Database Error] Failed to seed default user: {e}")


    # --- USER MANAGEMENT ---
    def save_user(self, user):
        doc_id = user.get("id") or user.get("user_id") or f"usr-{datetime.datetime.now().timestamp()}"
        doc_data = {
            "id": doc_id,
            "user_id": doc_id,
            "name": user.get("name", "User"),
            "email": user["email"].strip().lower(),
            "password_hash": user["password_hash"],
            "role": user.get("role", "Security Analyst"),
            "status": user.get("status", "ACTIVE"),
            "created_at": user.get("created_at") or datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "last_login": user.get("last_login") or datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        try:
            self.db.collection('users').document(doc_id).set(doc_data)
        except Exception as e:
            print(f"[Firestore Error] save_user failed: {e}")
        return doc_data

    def get_user_by_email(self, email):
        if not email:
            return None
        target_email = email.strip().lower()
        try:
            docs = self.db.collection('users').stream()
            for doc in docs:
                d = doc.to_dict()
                if d and d.get("email", "").strip().lower() == target_email:
                    d["id"] = d.get("id", doc.id)
                    return d
        except Exception as e:
            print(f"[Firestore Error] get_user_by_email failed: {e}")
        return None

    def get_users(self):
        users = []
        try:
            docs = self.db.collection('users').stream()
            for doc in docs:
                d = doc.to_dict()
                if d:
                    d["id"] = d.get("id", doc.id)
                    u_clean = {k: v for k, v in d.items() if k != "password_hash"}
                    users.append(u_clean)
        except Exception as e:
            print(f"[Firestore Error] get_users failed: {e}")
        return users

    def update_user(self, user_id, updates):
        try:
            self.db.collection('users').document(user_id).set(updates, merge=True)
        except Exception as e:
            print(f"[Firestore Error] update_user failed for {user_id}: {e}")

    def delete_user(self, user_id):
        try:
            self.db.collection('users').document(user_id).delete()
        except Exception as e:
            print(f"[Firestore Error] delete_user failed for {user_id}: {e}")

    # --- DIGITAL TWINS CRUD OPERATIONS ---
    def get_devices(self):
        devices = []
        try:
            docs = self.db.collection('digital_twins').stream()
            for doc in docs:
                d = doc.to_dict()
                if not d:
                    continue
                d["id"] = d.get("id", doc.id)
                devices.append({
                    "id": d.get("id", doc.id),
                    "name": d.get("name", "Unknown Device"),
                    "device_type": d.get("device_type", "Clinical Workstation"),
                    "hospital_department": d.get("hospital_department", "ICU Ward"),
                    "ip_address": d.get("ip_address", "192.168.1.100"),
                    "mac_address": d.get("mac_address", "00:1A:2B:3C:4D:5E"),
                    "os_firmware": d.get("os_firmware", "TwinGuard OS v2.1"),
                    "network_segment": d.get("network_segment", "VLAN-10"),
                    "location": d.get("location", "Main Building"),
                    "connection_protocol": d.get("connection_protocol", "MQTT"),
                    "status": d.get("status", "ONLINE"),
                    "risk_score": d.get("risk_score", 15),
                    "cpu_usage": d.get("cpu_usage", 20),
                    "memory_usage": d.get("memory_usage", 30),
                    "temperature": d.get("temperature", 36.6),
                    "network_traffic": d.get("network_traffic", 100),
                    "detected_threat": d.get("detected_threat", "None"),
                    "defense_action": d.get("defense_action", "None"),
                    "last_seen": d.get("last_seen", "Just now"),
                    "last_activity": d.get("last_activity", "Just now")
                })
        except Exception as e:
            print(f"[Firestore Error] get_devices failed: {e}")
        return devices

    def save_device(self, dev):
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        doc_data = {
            "id": dev["id"],
            "name": dev["name"],
            "device_type": dev["device_type"],
            "hospital_department": dev.get("hospital_department", "ICU Ward"),
            "ip_address": dev.get("ip_address", "192.168.1.100"),
            "mac_address": dev.get("mac_address", "00:1A:2B:3C:4D:5E"),
            "os_firmware": dev.get("os_firmware", "TwinGuard OS v2.1"),
            "network_segment": dev.get("network_segment", "VLAN-10"),
            "location": dev.get("location", "Main Building"),
            "connection_protocol": dev.get("connection_protocol", "MQTT"),
            "status": dev.get("status", "ONLINE"),
            "risk_score": dev.get("risk_score", 15),
            "cpu_usage": dev.get("cpu_usage", 20),
            "memory_usage": dev.get("memory_usage", 30),
            "temperature": dev.get("temperature", 36.6),
            "network_traffic": dev.get("network_traffic", 100),
            "detected_threat": dev.get("detected_threat", "None"),
            "defense_action": dev.get("defense_action", "None"),
            "last_seen": dev.get("last_seen", now_str),
            "last_activity": dev.get("last_activity", now_str)
        }
        try:
            self.db.collection('digital_twins').document(dev["id"]).set(doc_data)
        except Exception as e:
            print(f"[Firestore Error] save_device failed for {dev['id']}: {e}")

    def update_device(self, device_id, updates):
        try:
            self.db.collection('digital_twins').document(device_id).set(updates, merge=True)
        except Exception as e:
            print(f"[Firestore Error] update_device failed for {device_id}: {e}")

    def delete_device(self, device_id):
        try:
            self.db.collection('digital_twins').document(device_id).delete()
        except Exception as e:
            print(f"[Firestore Error] delete_device failed for {device_id}: {e}")

    def seed_initial_devices(self, initial_devices):
        current_devices = self.get_devices()
        if not current_devices:
            for dev in initial_devices:
                self.save_device(dev)

    # --- ALERTS MANAGEMENT ---
    def save_alert(self, alert):
        alert_id = alert.get("alert_id") or alert.get("id") or f"ALT-{datetime.datetime.now().timestamp()}"
        doc_data = {
            "id": alert_id,
            "alert_id": alert_id,
            "title": alert.get("title", "Security Alert"),
            "severity": alert.get("severity", "HIGH"),
            "description": alert.get("description", ""),
            "source": alert.get("source", "Network IDS"),
            "timestamp": alert.get("timestamp") or datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": alert.get("status", "OPEN"),
            "assigned_analyst": alert.get("assigned_analyst", "Unassigned"),
            "resolution_notes": alert.get("resolution_notes", "")
        }
        try:
            self.db.collection('alerts').document(alert_id).set(doc_data)
        except Exception as e:
            print(f"[Firestore Error] save_alert failed: {e}")
        return doc_data

    def get_alerts(self):
        alerts = []
        try:
            docs = self.db.collection('alerts').stream()
            for doc in docs:
                d = doc.to_dict()
                if d:
                    d["id"] = d.get("id", doc.id)
                    alerts.append(d)
            alerts.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        except Exception as e:
            print(f"[Firestore Error] get_alerts failed: {e}")
        return alerts

    def update_alert(self, alert_id, updates):
        try:
            self.db.collection('alerts').document(alert_id).set(updates, merge=True)
        except Exception as e:
            print(f"[Firestore Error] update_alert failed: {e}")

    def delete_alert(self, alert_id):
        try:
            self.db.collection('alerts').document(alert_id).delete()
        except Exception as e:
            print(f"[Firestore Error] delete_alert failed: {e}")

    # --- INCIDENTS MANAGEMENT ---
    def save_incident(self, incident):
        inc_id = incident.get("incident_id") or incident.get("id") or f"INC-{datetime.datetime.now().timestamp()}"
        doc_data = {
            "id": inc_id,
            "incident_id": inc_id,
            "title": incident.get("title", "Security Incident"),
            "severity": incident.get("severity", "CRITICAL"),
            "target_device": incident.get("target_device", "Hospital Server"),
            "assigned_to": incident.get("assigned_to", "SOC Team"),
            "status": incident.get("status", "OPEN"),
            "notes": incident.get("notes", ""),
            "created_at": incident.get("created_at") or datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "updated_at": incident.get("updated_at") or datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        try:
            self.db.collection('incidents').document(inc_id).set(doc_data)
        except Exception as e:
            print(f"[Firestore Error] save_incident failed: {e}")
        return doc_data

    def get_incidents(self):
        incidents = []
        try:
            docs = self.db.collection('incidents').stream()
            for doc in docs:
                d = doc.to_dict()
                if d:
                    d["id"] = d.get("id", doc.id)
                    incidents.append(d)
            incidents.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        except Exception as e:
            print(f"[Firestore Error] get_incidents failed: {e}")
        return incidents

    def update_incident(self, incident_id, updates):
        updates["updated_at"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        try:
            self.db.collection('incidents').document(incident_id).set(updates, merge=True)
        except Exception as e:
            print(f"[Firestore Error] update_incident failed: {e}")

    def delete_incident(self, incident_id):
        try:
            self.db.collection('incidents').document(incident_id).delete()
        except Exception as e:
            print(f"[Firestore Error] delete_incident failed: {e}")

    # --- TELEMETRY & HEARTBEAT ---
    def record_telemetry(self, device_id, telemetry_data):
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        temp = telemetry_data.get("temperature", 36.6)
        cpu = telemetry_data.get("cpu_usage", 25)
        mem = telemetry_data.get("memory_usage", 35)
        net_traffic = telemetry_data.get("network_traffic", 120)
        net_status = telemetry_data.get("network_status", "connected")

        log_entry = {
            "device_id": device_id,
            "temperature": temp,
            "cpu_usage": cpu,
            "memory_usage": mem,
            "network_traffic": net_traffic,
            "network_status": net_status,
            "timestamp": now_str
        }
        try:
            self.db.collection('telemetry_logs').add(log_entry)
            
            target_id = device_id
            devices = self.get_devices()
            target_dev = next((d for d in devices if d["id"].lower() == device_id.lower() or d["name"].lower() == device_id.lower()), None)
            if target_dev:
                target_id = target_dev["id"]

            self.update_device(target_id, {
                "temperature": temp,
                "cpu_usage": cpu,
                "memory_usage": mem,
                "network_traffic": net_traffic,
                "last_seen": now_str,
                "last_activity": now_str
            })
        except Exception as e:
            print(f"[Firestore Error] record_telemetry failed for {device_id}: {e}")

    def record_heartbeat(self, device_id, status="online"):
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        heartbeat_entry = {
            "device_id": device_id,
            "status": status,
            "timestamp": now_str
        }
        try:
            self.db.collection('heartbeat_logs').add(heartbeat_entry)

            devices = self.get_devices()
            target_dev = next((d for d in devices if d["id"].lower() == device_id.lower() or d["name"].lower() == device_id.lower()), None)
            if target_dev:
                new_status = target_dev["status"]
                if target_dev["status"] not in ["ISOLATED", "UNDER_ATTACK"]:
                    new_status = "ONLINE"
                self.update_device(target_dev["id"], {
                    "last_seen": now_str,
                    "last_activity": now_str,
                    "status": new_status
                })
        except Exception as e:
            print(f"[Firestore Error] record_heartbeat failed for {device_id}: {e}")

    def check_heartbeat_timeouts(self, offline_timeout_seconds=20, unstable_timeout_seconds=10):
        try:
            devices = self.get_devices()
            now = datetime.datetime.now()

            for dev in devices:
                dev_id = dev["id"]
                current_status = dev.get("status", "ONLINE")
                last_seen_str = dev.get("last_seen")

                if current_status in ["ISOLATED", "UNDER_ATTACK"]:
                    continue

                last_seen_dt = None
                if last_seen_str and last_seen_str != "Just now":
                    try:
                        last_seen_dt = datetime.datetime.strptime(last_seen_str, "%Y-%m-%d %H:%M:%S")
                    except Exception:
                        pass

                if last_seen_dt:
                    elapsed = (now - last_seen_dt).total_seconds()
                    new_status = current_status
                    if elapsed > offline_timeout_seconds:
                        new_status = "OFFLINE"
                    elif elapsed > unstable_timeout_seconds:
                        new_status = "UNSTABLE"
                    else:
                        new_status = "ONLINE"

                    if new_status != current_status:
                        self.update_device(dev_id, {"status": new_status})
        except Exception as e:
            print(f"[Firestore Error] check_heartbeat_timeouts failed: {e}")

    def reset_twin_db(self):
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        try:
            devices = self.get_devices()
            for dev in devices:
                self.update_device(dev["id"], {
                    "status": "ONLINE",
                    "risk_score": 15,
                    "cpu_usage": 20,
                    "memory_usage": 30,
                    "temperature": 36.6,
                    "network_traffic": 100,
                    "detected_threat": "None",
                    "defense_action": "None",
                    "last_seen": timestamp,
                    "last_activity": timestamp
                })

            for col_name in ['attacks', 'defenses', 'reports', 'alerts', 'incidents', 'ai_recommendations', 'telemetry_logs', 'heartbeat_logs']:
                docs = self.db.collection(col_name).stream()
                for doc in docs:
                    self.db.collection(col_name).document(doc.id).delete()
        except Exception as e:
            print(f"[Firestore Error] reset_twin_db failed: {e}")
            raise e

    # --- ATTACKS & DEFENSES ---
    def save_attack(self, attack_id, attack_type, target, severity, risk_score, timestamp, status="ACTIVE", source="Digital Twin Simulator", simulation=True, description=""):
        doc_data = {
            "id": attack_id,
            "attack_id": attack_id,
            "attack_type": attack_type,
            "target_device": target,
            "severity": severity,
            "risk_score": risk_score,
            "timestamp": timestamp,
            "status": status,
            "source": source,
            "simulation": simulation,
            "description": description or f"Simulated {attack_type} activity detected on {target}"
        }
        try:
            self.db.collection('attacks').document(attack_id).set(doc_data)
        except Exception as e:
            print(f"[Firestore Error] save_attack failed: {e}")

    def save_defense(self, defense_id, attack_id, target, action, response_time_ms, result, timestamp):
        doc_data = {
            "defense_id": defense_id,
            "attack_id": attack_id,
            "target_device": target,
            "action": action,
            "response_time_ms": response_time_ms,
            "result": result,
            "timestamp": timestamp
        }
        try:
            self.db.collection('defenses').document(defense_id).set(doc_data)
        except Exception as e:
            print(f"[Firestore Error] save_defense failed: {e}")

    def save_ai_recommendation(self, rec_id, attack_type, target, recommendation, reason, confidence, timestamp):
        doc_data = {
            "recommendation_id": rec_id,
            "attack_type": attack_type,
            "target_device": target,
            "recommendation": recommendation,
            "reason": reason,
            "confidence": confidence,
            "timestamp": timestamp
        }
        try:
            self.db.collection('ai_recommendations').document(rec_id).set(doc_data)
        except Exception as e:
            print(f"[Firestore Error] save_ai_recommendation failed: {e}")

    def get_attack_history(self):
        history = []
        try:
            docs = self.db.collection('attacks').stream()
            for doc in docs:
                d = doc.to_dict()
                if d:
                    history.append(d)
            history.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
            return history[:50]
        except Exception as e:
            print(f"[Firestore Error] get_attack_history failed: {e}")
            return history

    def get_defense_history(self):
        history = []
        try:
            docs = self.db.collection('defenses').stream()
            for doc in docs:
                d = doc.to_dict()
                if d:
                    history.append(d)
            history.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
            return history[:50]
        except Exception as e:
            print(f"[Firestore Error] get_defense_history failed: {e}")
            return history

    # --- AUDIT LOGS & EVENTS ---
    def save_security_event(self, event_type, target_device, severity, description, source="Manual Security Entry", timestamp=None):
        ts = timestamp or datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        doc_id = f"EVT-{uuid.uuid4().hex[:8].upper()}"
        doc_data = {
            "id": doc_id,
            "event_id": doc_id,
            "event_type": event_type,
            "target_device": target_device,
            "severity": severity,
            "description": description,
            "source": source,
            "timestamp": ts
        }
        try:
            self.db.collection('events').document(doc_id).set(doc_data)
        except Exception as e:
            print(f"[Firestore Error] save_security_event failed: {e}")
        return doc_data

    def get_security_events(self):
        events = []
        try:
            docs = self.db.collection('events').stream()
            for doc in docs:
                d = doc.to_dict()
                if d:
                    events.append(d)
            events.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
            return events[:50]
        except Exception as e:
            print(f"[Firestore Error] get_security_events failed: {e}")
            return events

    def save_audit_log(self, action, details="", user="System"):
        key = f"{action}:{details}:{user}"
        now_ts = datetime.datetime.now().timestamp()
        if hasattr(self, 'recent_audit_keys') and key in self.recent_audit_keys:
            if (now_ts - self.recent_audit_keys[key]) < 10:
                return  # Skip duplicate log spam within 10 seconds
        if not hasattr(self, 'recent_audit_keys'):
            self.recent_audit_keys = {}
        self.recent_audit_keys[key] = now_ts

        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        doc_data = {
            "action": action,
            "details": details,
            "user": user,
            "timestamp": timestamp
        }
        try:
            self.db.collection('audit_logs').add(doc_data)
        except Exception as e:
            print(f"[Firestore Error] save_audit_log failed: {e}")


    def get_audit_logs(self):
        logs = []
        try:
            docs = self.db.collection('audit_logs').stream()
            for idx, doc in enumerate(docs):
                d = doc.to_dict()
                if d:
                    d["id"] = d.get("id", doc.id)
                    logs.append(d)
            logs.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
            return logs[:50]
        except Exception as e:
            print(f"[Firestore Error] get_audit_logs failed: {e}")
            return logs

