import json
from datetime import datetime

class ReportGenerator:
    """
    Generates analytics reports and executive summaries for TwinGuard hospital SOC viva presentation.
    """
    @staticmethod
    def generate_summary_report(attack_history, defense_history, devices):
        total_attacks = len(attack_history)
        successful_defenses = len([d for d in defense_history if d.get("result", "SUCCESS") == "SUCCESS"])
        isolated_devices = len([d for d in devices if d.get("status") == "ISOLATED"])
        
        response_times = [d.get("response_time_ms", 350) for d in defense_history if isinstance(d.get("response_time_ms"), (int, float))]
        avg_response_time = int(sum(response_times) / len(response_times)) if response_times else 350

        risk_scores = [d.get("risk_score", 15) for d in devices]
        avg_risk_score = int(sum(risk_scores) / len(risk_scores)) if risk_scores else 20

        target_counts = {}
        for a in attack_history:
            t = a.get("target_device", "Unknown Target")
            target_counts[t] = target_counts.get(t, 0) + 1
        most_targeted_device = max(target_counts, key=target_counts.get) if target_counts else "Hospital Server"

        attack_type_counts = {}
        for a in attack_history:
            at = a.get("attack_type", "Unknown Attack")
            attack_type_counts[at] = attack_type_counts.get(at, 0) + 1
        most_common_attack = max(attack_type_counts, key=attack_type_counts.get) if attack_type_counts else "Ransomware"

        return {
            "title": "TwinGuard - Smart Hospital Cybersecurity SOC Incident Report",
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "total_attacks": total_attacks,
            "successful_defenses": successful_defenses,
            "isolated_devices": isolated_devices,
            "avg_response_time_ms": avg_response_time,
            "avg_risk_score": avg_risk_score,
            "most_targeted_device": most_targeted_device,
            "most_common_attack": most_common_attack,
            "defense_success_rate": f"{(successful_defenses / max(1, total_attacks)) * 100:.1f}%",
            "status_summary": {
                "safe": len([d for d in devices if d.get("status") == "SAFE"]),
                "monitoring": len([d for d in devices if d.get("status") == "UNDER_MONITORING"]),
                "under_attack": len([d for d in devices if d.get("status") == "UNDER_ATTACK"]),
                "defended": len([d for d in devices if d.get("status") == "DEFENDED"]),
                "isolated": isolated_devices
            }
        }
