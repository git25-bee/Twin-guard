/**
 * Service API Module for AI-Powered Hospital Cybersecurity Digital Twin
 * Connects to Flask REST API endpoints with graceful local fallback.
 */

import { INITIAL_NODES } from '../data/initialNodes';

const API_BASE_URL = 'http://localhost:5000/api';

// In-memory fallback state if Flask backend is offline
let localDevices = JSON.parse(JSON.stringify(INITIAL_NODES));
let localAttacks = [];
let localDefenses = [];

export const api = {
  // GET /api/devices
  async getDevices() {
    try {
      const res = await fetch(`${API_BASE_URL}/devices`);
      if (res.ok) {
        const data = await res.json();
        localDevices = data;
        return data;
      }
    } catch (err) {
      // Return local fallback
    }
    return localDevices;
  },

  // GET /api/status
  async getStatus() {
    try {
      const res = await fetch(`${API_BASE_URL}/status`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      // Calculate from local devices
    }
    const safe = localDevices.filter(d => d.status === 'SAFE').length;
    const underAttack = localDevices.filter(d => d.status === 'UNDER_ATTACK').length;
    const defended = localDevices.filter(d => d.status === 'DEFENDED').length;
    const isolated = localDevices.filter(d => d.status === 'ISOLATED').length;
    
    // Simple local risk score calculation
    let maxRisk = Math.max(...localDevices.map(d => d.risk_score || 15));
    let avgRisk = Math.round(localDevices.reduce((acc, d) => acc + (d.risk_score || 15), 0) / localDevices.length);

    return {
      overall_risk_score: underAttack > 0 ? Math.max(75, maxRisk) : avgRisk,
      risk_level: underAttack > 0 ? "CRITICAL" : avgRisk > 60 ? "HIGH" : avgRisk > 30 ? "MEDIUM" : "LOW",
      total_devices: localDevices.length,
      safe_devices: safe,
      under_attack_devices: underAttack,
      defended_devices: defended,
      isolated_devices: isolated,
      active_attacks_count: underAttack,
      auto_defense_enabled: true
    };
  },

  // POST /api/attack
  async triggerAttack(attackType, targetName, severity = "HIGH") {
    try {
      const res = await fetch(`${API_BASE_URL}/attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attack_type: attackType, target: targetName, severity })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      // Local fallback execution
    }
    const dev = localDevices.find(d => d.name.toLowerCase() === targetName.toLowerCase()) || localDevices[2];
    dev.status = "UNDER_ATTACK";
    dev.detected_threat = attackType;
    dev.risk_score = attackType === "Ransomware" ? 86 : 82;
    dev.cpu_usage = 92;
    dev.network_traffic = 550;

    const atkRecord = {
      attack_id: `ATK-${Math.floor(Math.random()*9000+1000)}`,
      attack_type: attackType,
      target_device: dev.name,
      severity,
      risk_score: dev.risk_score,
      timestamp: new Date().toLocaleTimeString(),
      status: "ACTIVE"
    };
    localAttacks.unshift(atkRecord);

    const recData = {
      recommendation: `Isolate ${dev.name} immediately & deploy anti-${attackType.toLowerCase()} protocols.`,
      reason: `${attackType} spike detected raising device risk to ${dev.risk_score}/100.`,
      risk: dev.risk_score,
      confidence: 95,
      action_code: attackType === "DDoS" ? "BLOCK_TRAFFIC" : "ISOLATE_DEVICE"
    };

    return {
      message: `${attackType} launched on ${dev.name}`,
      attack: atkRecord,
      device: dev,
      ai_recommendation: recData
    };
  },

  // POST /api/defense
  async triggerDefense(targetName, actionCode = "ISOLATE_DEVICE") {
    try {
      const res = await fetch(`${API_BASE_URL}/defense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: targetName, action: actionCode })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      // Local fallback execution
    }
    const dev = localDevices.find(d => d.name.toLowerCase() === targetName.toLowerCase()) || localDevices[2];
    
    if (actionCode === "ISOLATE_DEVICE") {
      dev.status = "ISOLATED";
      dev.defense_action = "Network Isolation Engaged";
      dev.risk_score = 30;
      dev.cpu_usage = 20;
    } else if (actionCode === "MARK_SAFE") {
      dev.status = "SAFE";
      dev.detected_threat = "None";
      dev.defense_action = "System Cleaned & Verified Safe";
      dev.risk_score = 15;
      dev.cpu_usage = 18;
    } else {
      dev.status = "DEFENDED";
      dev.defense_action = "Active Firewall Scrubbing";
      dev.risk_score = 25;
    }

    const defRecord = {
      defense_id: `DEF-${Math.floor(Math.random()*9000+1000)}`,
      target_device: dev.name,
      action: dev.defense_action,
      response_time_ms: 320,
      result: "SUCCESS",
      timestamp: new Date().toLocaleTimeString()
    };
    localDefenses.unshift(defRecord);

    return {
      message: `Defense executed on ${dev.name}`,
      defense: defRecord,
      device: dev
    };
  },

  // GET /api/ai/recommendation
  async getAIRecommendation(targetName, attackType) {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/recommendation?target=${encodeURIComponent(targetName)}&attack_type=${encodeURIComponent(attackType)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      // Fallback
    }
    return {
      recommendation: `Isolate ${targetName} and apply firewall filter against ${attackType}.`,
      reason: `Automated threat signature analysis detected anomalous pattern targeting ${targetName}.`,
      risk: 86,
      confidence: 94,
      action_code: "ISOLATE_DEVICE",
      threat_prediction: "Immediate threat of lateral network propagation.",
      defense_comparison: [
        { action: "Isolate Device", effectiveness: "98%", impact: "Stops encryption & network propagation" },
        { action: "Block Port Traffic", effectiveness: "85%", impact: "Restricts C2 command relay" },
        { action: "Passive Logging", effectiveness: "25%", impact: "Inadequate for active threats" }
      ]
    };
  },

  // POST /api/ai/apply
  async applyAIRecommendation(targetName, actionCode) {
    return this.triggerDefense(targetName, actionCode);
  },

  // GET /api/attacks
  async getAttacks() {
    try {
      const res = await fetch(`${API_BASE_URL}/attacks`);
      if (res.ok) return await res.json();
    } catch (err) {}
    return localAttacks;
  },

  // GET /api/reports/summary
  async getReportsSummary() {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/summary`);
      if (res.ok) return await res.json();
    } catch (err) {}
    return {
      title: "Smart Hospital Cybersecurity SOC Digital Twin Incident Report",
      generated_at: new Date().toLocaleString(),
      total_attacks: Math.max(1, localAttacks.length),
      successful_defenses: Math.max(1, localDefenses.length),
      isolated_devices: localDevices.filter(d => d.status === "ISOLATED").length,
      avg_response_time_ms: 320,
      avg_risk_score: Math.round(localDevices.reduce((a, b) => a + (b.risk_score || 15), 0) / localDevices.length),
      most_targeted_device: "Hospital Server",
      most_common_attack: "Ransomware",
      defense_success_rate: "96.4%"
    };
  },

  // POST /api/reset
  async resetTwin() {
    try {
      const res = await fetch(`${API_BASE_URL}/reset`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (err) {}
    localDevices = JSON.parse(JSON.stringify(INITIAL_NODES));
    localAttacks = [];
    localDefenses = [];
    return { message: "Digital Twin reset to SAFE state", devices: localDevices };
  }
};
