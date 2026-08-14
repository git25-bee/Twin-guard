import os
import json
import random
from datetime import datetime

class AISecurityEngine:
    """
    AI Security Recommendation Engine powered by Google Gemini API with seamless local heuristic ML fallback.
    """
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY", "")
        self.client = None

        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                print("[AI Engine] Gemini API client initialized successfully.")
            except Exception as e:
                print(f"[AI Engine Warning] Failed to initialize Gemini API client: {e}. Using local AI fallback.")

    def get_recommendation(self, attack_type, target_device, risk_score, severity="HIGH", network_activity=None):
        """
        Generates security recommendations for detected cyber attacks.
        """
        # Attempt Gemini API first if configured
        if self.client:
            try:
                prompt = f"""
                You are a SOC Cybersecurity AI Expert for a Smart Hospital Network.
                Analyze the following cyber threat in the hospital digital twin and provide actionable defense recommendations in valid JSON format ONLY.

                THREAT DETAILS:
                - Attack Type: {attack_type}
                - Target Asset: {target_device}
                - Risk Score: {risk_score}/100
                - Severity Level: {severity}
                - Network Activity: {network_activity or 'Abnormal Spike'}

                Return a JSON object with EXACTLY these keys:
                "recommendation": string summary of action
                "reason": string explanation of why this action is required
                "risk": int risk score (0-100)
                "confidence": int confidence percentage (0-100)
                "action_code": string one of ("ISOLATE_DEVICE", "BLOCK_TRAFFIC", "ACTIVATE_FIREWALL", "PROTECT_DATABASE", "MARK_SAFE")
                "threat_prediction": string short prediction of potential impact
                "defense_comparison": list of 3 objects with "action", "effectiveness", "impact"
                """
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt
                )

                cleaned_text = response.text.strip()
                if cleaned_text.startswith("```json"):
                    cleaned_text = cleaned_text[7:]
                if cleaned_text.endswith("```"):
                    cleaned_text = cleaned_text[:-3]

                data = json.loads(cleaned_text.strip())
                return data
            except Exception as e:
                print(f"[AI Engine Warning] Gemini API call failed ({e}). Falling back to local AI engine.")

        # Local Fallback Recommendation Generator
        return self._local_heuristic_recommendation(attack_type, target_device, risk_score, severity)

    def _local_heuristic_recommendation(self, attack_type, target_device, risk_score, severity):
        """
        Provides intelligent, deterministic recommendations based on SOC expert rules & mock ML models.
        """
        attack_type_upper = (attack_type or "GENERIC").upper()

        if "RANSOMWARE" in attack_type_upper:
            rec = f"Immediately isolate {target_device} and enforce emergency file system snapshot lock."
            reason = f"Ransomware activity detected on {target_device}. High risk of encrypting critical patient records."
            action_code = "ISOLATE_DEVICE"
            pred = "Immediate threat of lateral movement to Patient Database within 60 seconds."
            comp = [
                {"action": "Isolate Endpoint & Lock Storage", "effectiveness": "98%", "impact": "Completely halts encryption spread"},
                {"action": "Block External Port Traffic", "effectiveness": "82%", "impact": "Prevents C2 server command relay"},
                {"action": "Antivirus Scan", "effectiveness": "45%", "impact": "Too slow for zero-day ransomware payloads"}
            ]
            confidence = 96
        elif "DDOS" in attack_type_upper:
            rec = f"Activate DDoS Mitigation Rules on Firewall and rate-limit IP traffic to {target_device}."
            reason = f"Massive SYN/UDP packet flood detected targeting {target_device}, driving CPU/Bandwidth saturation."
            action_code = "BLOCK_TRAFFIC"
            pred = "Hospital operational web services & EHR access may experience total outage in 2 minutes."
            comp = [
                {"action": "Activate Anycast Scrubbing & Rate Limiting", "effectiveness": "95%", "impact": "Absorbs volumetric attack traffic"},
                {"action": "Isolate Target Device", "effectiveness": "60%", "impact": "Stop traffic but causes self-inflicted outage"},
                {"action": "Increase Server Resources", "effectiveness": "20%", "impact": "Temporarily delays collapse without stopping attack"}
            ]
            confidence = 94
        elif "SQL" in attack_type_upper:
            rec = f"Enable Web Application Firewall (WAF) SQLi filters and temporarily revoke write access to Patient Database."
            reason = f"Malicious database queries detected trying to bypass authentication on {target_device}."
            action_code = "PROTECT_DATABASE"
            pred = "Unauthorized exfiltration of Sensitive Health Information (PHI/EHR)."
            comp = [
                {"action": "WAF Rule Enforcement & Parameterized Queries", "effectiveness": "97%", "impact": "Blocks SQL syntax injection completely"},
                {"action": "Isolate Patient Database", "effectiveness": "90%", "impact": "Prevents data leakage but halts doctor workflows"},
                {"action": "Log & Monitor", "effectiveness": "30%", "impact": "Allows attacker to read database while logging"}
            ]
            confidence = 92
        elif "INSIDER" in attack_type_upper:
            rec = f"Revoke active privileges for flagged credential on {target_device} and enable MFA re-verification."
            reason = f"Anomalous off-hours administrative access and bulk data export detected."
            action_code = "ISOLATE_DEVICE"
            pred = "Privilege escalation and internal record tampering."
            comp = [
                {"action": "Session Revocation & Credential Reset", "effectiveness": "96%", "impact": "Terminates unauthorized access immediately"},
                {"action": "Network Isolation", "effectiveness": "88%", "impact": "Limits user access across network"},
                {"action": "Send Email Alert", "effectiveness": "40%", "impact": "High risk of delayed response"}
            ]
            confidence = 90
        elif "PHISHING" in attack_type_upper:
            rec = f"Quarantine malicious link domain on Firewall and flag target inbox on {target_device}."
            reason = f"Credential harvesting email link accessed on {target_device}."
            action_code = "BLOCK_TRAFFIC"
            pred = "Potential compromise of staff credentials leading to administrative access."
            comp = [
                {"action": "Domain Block & Password Reset", "effectiveness": "94%", "impact": "Neutralizes compromised credential vector"},
                {"action": "Isolate Device", "effectiveness": "75%", "impact": "Effective but disrupts clinical staff work"},
                {"action": "User Warning Toast", "effectiveness": "50%", "impact": "Relies on human reaction speed"}
            ]
            confidence = 88
        else:  # Malware / Default
            rec = f"Execute automated endpoint sandbox scan and restrict outbound network traffic on {target_device}."
            reason = f"Suspicious process execution and unexpected socket connections on {target_device}."
            action_code = "BLOCK_TRAFFIC"
            pred = "Potential malware beaconing and internal network recon."
            comp = [
                {"action": "Quarantine Process & Network Block", "effectiveness": "93%", "impact": "Halts execution without shutting down PC"},
                {"action": "Isolate Device", "effectiveness": "95%", "impact": "Ensures zero network propagation"},
                {"action": "Passive Logging", "effectiveness": "25%", "impact": "Inadequate for active malware payloads"}
            ]
            confidence = 89

        return {
            "recommendation": rec,
            "reason": reason,
            "risk": max(10, min(100, int(risk_score))),
            "confidence": confidence,
            "action_code": action_code,
            "threat_prediction": pred,
            "defense_comparison": comp,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
