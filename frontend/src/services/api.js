/**
 * Dynamic API Service Module for TwinGuard Hospital Cybersecurity Platform
 * Communicates with Flask REST APIs and Firebase Firestore backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('twinguard_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // --- AUTHENTICATION ---
  async login(email, password) {
    const formattedEmail = (email || '').trim().toLowerCase();
    const formattedPassword = (password || '').trim();

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formattedEmail, password: formattedPassword })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Invalid email or password');
    }

    return await res.json();
  },

  async register(email, password, name, role = 'Security Analyst') {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Registration failed');
    }

    return await res.json();
  },

  async getCurrentUser() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  },

  // --- USER MANAGEMENT ---
  async getUsers() {
    const res = await fetch(`${API_BASE_URL}/users`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return await res.json();
  },

  async updateUser(userId, updates) {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return await res.json();
  },

  async deleteUser(userId) {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  },

  // --- ALERTS ---
  async getAlerts() {
    const res = await fetch(`${API_BASE_URL}/alerts`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return await res.json();
  },

  async createAlert(alertData) {
    const res = await fetch(`${API_BASE_URL}/alerts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(alertData)
    });
    return await res.json();
  },

  async updateAlert(alertId, updates) {
    const res = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return await res.json();
  },

  async deleteAlert(alertId) {
    const res = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  },

  // --- INCIDENTS ---
  async getIncidents() {
    const res = await fetch(`${API_BASE_URL}/incidents`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return await res.json();
  },

  async createIncident(incidentData) {
    const res = await fetch(`${API_BASE_URL}/incidents`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(incidentData)
    });
    return await res.json();
  },

  async updateIncident(incidentId, updates) {
    const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return await res.json();
  },

  async deleteIncident(incidentId) {
    const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  },

  // --- DEVICES / DIGITAL TWINS ---
  async getDevices() {
    const res = await fetch(`${API_BASE_URL}/devices`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return await res.json();
  },

  async addDevice(deviceData) {
    const res = await fetch(`${API_BASE_URL}/devices`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(deviceData)
    });
    return await res.json();
  },

  async updateDevice(id, deviceData) {
    const res = await fetch(`${API_BASE_URL}/devices/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(deviceData)
    });
    return await res.json();
  },

  async deleteDevice(id) {
    const res = await fetch(`${API_BASE_URL}/devices/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  },

  // --- ATTACKS & DEFENSES ---
  async simulateAttack(attackType, targetDevice, severity = 'CRITICAL') {
    const res = await fetch(`${API_BASE_URL}/simulate-attack`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ attack_type: attackType, target_device: targetDevice, severity })
    });
    return await res.json();
  },

  async triggerAttack(attackType, targetDevice, severity = 'CRITICAL') {
    return this.simulateAttack(attackType, targetDevice, severity);
  },

  async triggerDefense(targetDevice, actionCode = 'ISOLATE_DEVICE', attackId = 'ATK-MANUAL') {
    const res = await fetch(`${API_BASE_URL}/trigger-defense`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ attack_id: attackId, action: actionCode, action_code: actionCode, target_device: targetDevice, target: targetDevice })
    });
    return await res.json();
  },

  async logSecurityEvent(eventType, targetDevice, severity, description) {
    const res = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        event_type: eventType,
        target_device: targetDevice,
        severity: severity,
        description: description
      })
    });
    return await res.json();
  },

  async toggleAutoDefense(enabled) {
    const res = await fetch(`${API_BASE_URL}/toggle-autodefense`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ enabled })
    });
    return await res.json();
  },

  async getAIRecommendation(targetDevice, attackType) {
    const res = await fetch(`${API_BASE_URL}/ai-recommendation`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ target_device: targetDevice, attack_type: attackType })
    });
    if (!res.ok) return null;
    return await res.json();
  },

  async triggerAIAgentStep() {
    const res = await fetch(`${API_BASE_URL}/ai-agent/step`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('AI Agent step failed');
    return await res.json();
  },

  async getStatus() {
    const res = await fetch(`${API_BASE_URL}/status`, { headers: getAuthHeaders() });
    if (!res.ok) return { total_devices: 0, safe_devices: 0, under_attack_devices: 0, defended_devices: 0, hospital_risk_score: 15, hospital_risk_level: "LOW" };
    return await res.json();
  },

  async getAttacks() {
    const res = await fetch(`${API_BASE_URL}/attacks`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return await res.json();
  },

  async getDefenses() {
    const res = await fetch(`${API_BASE_URL}/defenses`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return await res.json();
  },

  async getAuditLogs() {
    const res = await fetch(`${API_BASE_URL}/audit-logs`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return await res.json();
  },

  async getReportsSummary() {
    const res = await fetch(`${API_BASE_URL}/reports/summary`, { headers: getAuthHeaders() });
    if (!res.ok) return null;
    return await res.json();
  },

  async resetSystem() {
    const res = await fetch(`${API_BASE_URL}/reset-system`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return await res.json();
  },

  async resetTwin() {
    return this.resetSystem();
  }
};

