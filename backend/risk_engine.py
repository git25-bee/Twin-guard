class RiskEngine:
    """
    Calculates dynamic risk scores (0-100) for hospital devices and overall network health.
    Categories:
      0 - 30  : LOW (Green)
      31 - 60 : MEDIUM (Yellow)
      61 - 80 : HIGH (Orange)
      81 - 100: CRITICAL (Red)
    """

    CRITICALITY_WEIGHTS = {
        "Internet": 0.4,
        "Firewall": 0.9,
        "Hospital Server": 1.0,
        "Patient Database": 1.0,
        "EHR Server": 0.9,
        "Doctor PC": 0.7,
        "Nurse PC": 0.6,
        "Admin PC": 0.7,
        "MRI Machine": 0.8,
        "Medical IoT": 0.7,
        "Pharmacy": 0.6,
        "Laboratory": 0.6
    }

    ATTACK_SEVERITY_MULTIPLIER = {
        "Ransomware": 1.5,
        "DDoS": 1.3,
        "SQL Injection": 1.4,
        "Malware": 1.2,
        "Insider Threat": 1.3,
        "Phishing": 1.1,
        "None": 0.2
    }

    @staticmethod
    def calculate_device_risk(device):
        """
        Calculates risk score for a given device based on status, detected threat, and resource metrics.
        """
        status = device.get("status", "SAFE")
        name = device.get("name") or device.get("device_name") or "Generic Device"
        threat = device.get("detected_threat", "None")
        cpu = device.get("cpu_usage", 20)
        memory = device.get("memory_usage", 30)

        weight = RiskEngine.CRITICALITY_WEIGHTS.get(name, 0.6)
        attack_mult = RiskEngine.ATTACK_SEVERITY_MULTIPLIER.get(threat, 0.2)

        base_score = 15

        if status == "SAFE":
            base_score = 12 + (cpu * 0.1) + (memory * 0.05)
        elif status == "UNDER_MONITORING":
            base_score = 35 + (cpu * 0.2)
        elif status == "SUSPICIOUS":
            base_score = 55 + (cpu * 0.25)
        elif status == "UNDER_ATTACK":
            base_score = 80 * attack_mult * weight
        elif status == "DEFENDED":
            base_score = 25
        elif status == "ISOLATED":
            base_score = 10

        score = max(5, min(100, int(base_score)))
        return score

    @staticmethod
    def get_risk_level(score):
        if score <= 30:
            return "LOW"
        elif score <= 60:
            return "MEDIUM"
        elif score <= 80:
            return "HIGH"
        else:
            return "CRITICAL"

    @staticmethod
    def calculate_overall_risk(devices):
        """
        Computes aggregate hospital risk score from all connected devices.
        """
        if not devices:
            return 15, "LOW"

        total_weighted_risk = 0.0
        total_weight = 0.0

        for dev in devices:
            name = dev.get("name") or dev.get("device_name", "")
            weight = RiskEngine.CRITICALITY_WEIGHTS.get(name, 0.6)
            risk = dev.get("risk_score", RiskEngine.calculate_device_risk(dev))
            
            total_weighted_risk += risk * weight
            total_weight += weight

        overall_score = int(total_weighted_risk / max(1.0, total_weight))
        overall_score = max(5, min(100, overall_score))
        level = RiskEngine.get_risk_level(overall_score)
        
        return overall_score, level
