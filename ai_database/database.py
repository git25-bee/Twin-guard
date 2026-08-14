import os
import sqlite3
import datetime

try:
    import mysql.connector
    MYSQL_AVAILABLE = True
except ImportError:
    MYSQL_AVAILABLE = False


class DatabaseManager:
    """
    Manages persistence for Devices, Attack Logs, Defense Logs, AI Recommendations, and Risk History.
    Uses MySQL if available and configured, otherwise falls back gracefully to SQLite.
    """
    def __init__(self, use_sqlite_fallback=True):
        self.use_sqlite = use_sqlite_fallback
        self.sqlite_db_path = os.path.join(os.path.dirname(__file__), "hospital_twin.db")
        self.mysql_config = {
            "host": os.environ.get("MYSQL_HOST", "localhost"),
            "user": os.environ.get("MYSQL_USER", "root"),
            "password": os.environ.get("MYSQL_PASSWORD", ""),
            "database": os.environ.get("MYSQL_DATABASE", "hospital_cyber_twin"),
            "port": int(os.environ.get("MYSQL_PORT", 3306))
        }
        self.init_db()

    def get_connection(self):
        if not self.use_sqlite and MYSQL_AVAILABLE:
            try:
                conn = mysql.connector.connect(**self.mysql_config)
                return conn, "mysql"
            except Exception as e:
                print(f"[DB Warning] MySQL connection failed ({e}). Falling back to SQLite.")
                self.use_sqlite = True

        conn = sqlite3.connect(self.sqlite_db_path)
        conn.row_factory = sqlite3.Row
        return conn, "sqlite"

    def init_db(self):
        conn, db_type = self.get_connection()
        cursor = conn.cursor()

        if db_type == "mysql":
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS devices (
                    device_id VARCHAR(50) PRIMARY KEY,
                    device_name VARCHAR(100) NOT NULL,
                    device_type VARCHAR(50) NOT NULL,
                    ip_address VARCHAR(50),
                    status VARCHAR(30) DEFAULT 'SAFE',
                    risk_score INT DEFAULT 15,
                    cpu_usage INT DEFAULT 20,
                    memory_usage INT DEFAULT 30,
                    network_traffic INT DEFAULT 100,
                    detected_threat VARCHAR(100) DEFAULT 'None',
                    defense_action VARCHAR(100) DEFAULT 'None',
                    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS attack_logs (
                    attack_id VARCHAR(50) PRIMARY KEY,
                    attack_type VARCHAR(50) NOT NULL,
                    target_device VARCHAR(100) NOT NULL,
                    severity VARCHAR(20) NOT NULL,
                    risk_score INT NOT NULL,
                    timestamp VARCHAR(50) NOT NULL,
                    status VARCHAR(30) DEFAULT 'ACTIVE'
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS defense_logs (
                    defense_id VARCHAR(50) PRIMARY KEY,
                    attack_id VARCHAR(50),
                    target_device VARCHAR(100) NOT NULL,
                    action VARCHAR(100) NOT NULL,
                    response_time_ms INT DEFAULT 350,
                    result VARCHAR(50) DEFAULT 'SUCCESS',
                    timestamp VARCHAR(50) NOT NULL
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ai_recommendations (
                    recommendation_id VARCHAR(50) PRIMARY KEY,
                    attack_type VARCHAR(50) NOT NULL,
                    target_device VARCHAR(100) NOT NULL,
                    recommendation TEXT NOT NULL,
                    reason TEXT,
                    confidence INT DEFAULT 95,
                    timestamp VARCHAR(50) NOT NULL
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS risk_history (
                    id INTEGER PRIMARY KEY AUTO_INCREMENT,
                    overall_risk INT NOT NULL,
                    timestamp VARCHAR(50) NOT NULL
                );
            """)
        else:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS devices (
                    device_id TEXT PRIMARY KEY,
                    device_name TEXT NOT NULL,
                    device_type TEXT NOT NULL,
                    ip_address TEXT,
                    status TEXT DEFAULT 'SAFE',
                    risk_score INTEGER DEFAULT 15,
                    cpu_usage INTEGER DEFAULT 20,
                    memory_usage INTEGER DEFAULT 30,
                    network_traffic INTEGER DEFAULT 100,
                    detected_threat TEXT DEFAULT 'None',
                    defense_action TEXT DEFAULT 'None',
                    last_activity TEXT
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS attack_logs (
                    attack_id TEXT PRIMARY KEY,
                    attack_type TEXT NOT NULL,
                    target_device TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    risk_score INTEGER NOT NULL,
                    timestamp TEXT NOT NULL,
                    status TEXT DEFAULT 'ACTIVE'
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS defense_logs (
                    defense_id TEXT PRIMARY KEY,
                    attack_id TEXT,
                    target_device TEXT NOT NULL,
                    action TEXT NOT NULL,
                    response_time_ms INTEGER DEFAULT 350,
                    result TEXT DEFAULT 'SUCCESS',
                    timestamp TEXT NOT NULL
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ai_recommendations (
                    recommendation_id TEXT PRIMARY KEY,
                    attack_type TEXT NOT NULL,
                    target_device TEXT NOT NULL,
                    recommendation TEXT NOT NULL,
                    reason TEXT,
                    confidence INTEGER DEFAULT 95,
                    timestamp TEXT NOT NULL
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS risk_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    overall_risk INTEGER NOT NULL,
                    timestamp TEXT NOT NULL
                );
            """)

        conn.commit()
        conn.close()

    def save_attack(self, attack_id, attack_type, target, severity, risk_score, timestamp, status="ACTIVE"):
        conn, _ = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO attack_logs (attack_id, attack_type, target_device, severity, risk_score, timestamp, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (attack_id, attack_type, target, severity, risk_score, timestamp, status)
        )
        conn.commit()
        conn.close()

    def save_defense(self, defense_id, attack_id, target, action, response_time_ms, result, timestamp):
        conn, _ = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO defense_logs (defense_id, attack_id, target_device, action, response_time_ms, result, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (defense_id, attack_id, target, action, response_time_ms, result, timestamp)
        )
        conn.commit()
        conn.close()

    def save_ai_recommendation(self, rec_id, attack_type, target, recommendation, reason, confidence, timestamp):
        conn, _ = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO ai_recommendations (recommendation_id, attack_type, target_device, recommendation, reason, confidence, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (rec_id, attack_type, target, recommendation, reason, confidence, timestamp)
        )
        conn.commit()
        conn.close()

    def get_attack_history(self):
        conn, db_type = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM attack_logs ORDER BY timestamp DESC LIMIT 50")
        rows = cursor.fetchall()
        conn.close()

        result = []
        for r in rows:
            if db_type == "sqlite":
                result.append(dict(r))
            else:
                result.append({
                    "attack_id": r[0], "attack_type": r[1], "target_device": r[2],
                    "severity": r[3], "risk_score": r[4], "timestamp": r[5], "status": r[6]
                })
        return result

    def get_defense_history(self):
        conn, db_type = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM defense_logs ORDER BY timestamp DESC LIMIT 50")
        rows = cursor.fetchall()
        conn.close()

        result = []
        for r in rows:
            if db_type == "sqlite":
                result.append(dict(r))
            else:
                result.append({
                    "defense_id": r[0], "attack_id": r[1], "target_device": r[2],
                    "action": r[3], "response_time_ms": r[4], "result": r[5], "timestamp": r[6]
                })
        return result
