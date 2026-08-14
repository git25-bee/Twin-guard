# TwinGuard: AI-Powered Digital Twin for Smart Hospital Cyber Defense

A comprehensive virtual hospital cybersecurity operations center (SOC) demonstrating simultaneous cyber attack simulation, dynamic risk score analysis, Google Gemini AI defense recommendations, automated multi-threaded threat mitigation, and database persistence.

---

## 🏛 System Architecture & Component Division

### Module 1 – Digital Twin & Frontend
- **Technologies**: React.js, Cytoscape.js, Lucide Icons, Recharts, CSS SOC Dark Theme
- **Features**:
  - Interactive Cytoscape.js network topology visualization of 12 smart hospital nodes (Internet, Firewall, Core Server, Patient DB, EHR, Workstations, MRI Machine, IoT Devices, Pharmacy, Lab).
  - SOC Dashboard pages: Dashboard, Digital Twin, Live Network, Attack Simulation, Defense Center, Risk Analysis, AI Recommendations, Attack History, Reports, Settings.
  - Dynamic status color transitions: 🟢 Safe | 🟡 Monitoring | 🟠 Suspicious | 🔴 Under Attack | 🔵 Defended | ⚫ Isolated.

### Module 2 – Attack & Defense Simulation Engine
- **Technologies**: Python, Flask, Flask-CORS, Multi-Threading
- **Features**:
  - **Attack Engine**: Simulates Ransomware, DDoS, SQL Injection, Zero-Day Malware, Insider Threats, and Phishing.
  - **Defense Engine**: Python multi-threaded background monitor (Thread 1: Threat Monitor, Thread 2: Auto Mitigation) that triggers automated network isolation, traffic scrubbing, and system recovery.
  - **Flask REST API**: Endpoints for devices state, attacks, defense actions, AI recommendations, and reports.

### Module 3 – AI Engine & Database Module
- **Technologies**: Google Gemini API (`gemini-2.5-flash`), Scikit-learn / Heuristic ML Engine, MySQL (with dual SQLite fallback)
- **Features**:
  - **Risk Engine**: Dynamically calculates per-device and overall hospital risk scores (0–100) categorized into LOW (0-30), MEDIUM (31-60), HIGH (61-80), and CRITICAL (81-100).
  - **AI Recommendation Engine**: Generates real-time threat analysis, root cause rationale, confidence ratings, and defense comparison matrices.
  - **Database Persistence**: Logs devices, attack events, defense actions, AI advice, and risk trends.

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- (Optional) MySQL Server (SQLite is automatically used if MySQL is unconfigured)

---

### Step 1: Launch Flask Backend API Server
```bash
cd attack_defense
python -m pip install -r requirements.txt
python app.py
```
*Backend runs on `http://localhost:5000`*

---

### Step 2: Launch React Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🎬 System Walkthrough

### 1. Initial State (Safe Parameters)
- Open the application at `http://localhost:5173`.
- Point out the **12 Digital Twin Nodes** in the Cytoscape graph. All nodes are **🟢 GREEN (SAFE)**.
- Note the Overall Hospital Risk Score is **LOW (15/100)**.

### 2. Scenario 1: Ransomware Attack on Hospital Server
1. Click **"Demo Ransomware Attack"** on the Top Navbar or navigate to **Attack Simulation**.
2. Target: `Hospital Server` | Severity: `CRITICAL`.
3. Observe real-time changes:
   - Hospital Server node changes from **🟢 GREEN → 🔴 RED** with pulsing threat animation.
   - Alert Banner displays: `⚠ SECURITY ALERT: Ransomware detected on Hospital Server!`.
   - Hospital Risk Score spikes from **15 → 88 (CRITICAL)**.
4. Navigate to **AI Recommendations**:
   - Gemini AI generates action: `"Isolate Hospital Server immediately and lock storage snapshots."`
   - Confidence: **96%**. Root cause rationale explains lateral propagation risk to Patient Database.
5. Automated Defense Engine kicks in:
   - Node status updates: **🔴 RED → ⚫ ISOLATED / 🔵 DEFENDED**.
   - Threat is neutralized; Hospital Server enters automatic recovery workflow.
   - Node returns to **🟢 SAFE** and Risk Score drops back to **22/100**.

### 3. Scenario 2: DDoS Attack on Firewall
1. Click **"Demo DDoS Attack"**.
2. Target: `Firewall` | Severity: `HIGH`.
3. Firewall network traffic spikes to **1250 MB/s**.
4. Automated Defense applies Anycast Rate Limiting & Traffic Scrubbing. Node recovers smoothly.

---

## 🔌 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/devices` | Get state of all 12 Digital Twin devices |
| `GET` | `/api/status` | Get aggregate hospital risk score & status counts |
| `POST` | `/api/attack` | Trigger attack simulation (`attack_type`, `target`, `severity`) |
| `POST` | `/api/defense` | Execute defense action (`target`, `action`) |
| `GET` | `/api/ai/recommendation` | Fetch Gemini AI threat advice |
| `POST` | `/api/ai/apply` | Apply AI recommendation to Defense Engine |
| `GET` | `/api/reports/summary` | Get generated SOC incident summary report |
| `POST` | `/api/reset` | Reset Digital Twin environment to SAFE state |
