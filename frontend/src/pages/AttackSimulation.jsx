import React, { useState } from 'react';
import { Zap, Play, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AttackSimulation({ devices = [], onTriggerAttack }) {
  const [selectedAttack, setSelectedAttack] = useState('Ransomware');
  const [selectedTarget, setSelectedTarget] = useState('Hospital Server');
  const [selectedSeverity, setSelectedSeverity] = useState('CRITICAL');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const attackPresets = [
    {
      type: 'Ransomware',
      severity: 'CRITICAL',
      target: 'Hospital Server',
      desc: 'Simulates file system structure encryption, CPU saturation at 92%, and ransomware alert logs.'
    },
    {
      type: 'DDoS',
      severity: 'HIGH',
      target: 'Firewall',
      desc: 'Simulates 1.25 GB/s SYN volumetric packet flood to exhaust perimeter bandwidth and disable EHR services.'
    },
    {
      type: 'SQL Injection',
      severity: 'CRITICAL',
      target: 'Patient Database',
      desc: 'Simulates malicious SQL query syntax injection trying to bypass authentication on the PHI database.'
    },
    {
      type: 'Malware',
      severity: 'HIGH',
      target: 'Doctor PC',
      desc: 'Simulates zero-day endpoint Trojan payload execution attempting internal reconnaissance across workstations.'
    },
    {
      type: 'Insider Threat',
      severity: 'MEDIUM',
      target: 'Admin PC',
      desc: 'Simulates anomalous off-hours administrative access attempting unauthorized credential escalation.'
    },
    {
      type: 'Phishing',
      severity: 'MEDIUM',
      target: 'Nurse PC',
      desc: 'Simulates credential harvesting link execution on clinical workstation attempting staff credential theft.'
    }
  ];

  const handleLaunch = async (attackType = selectedAttack, targetName = selectedTarget, severityVal = selectedSeverity) => {
    if (!attackType || !targetName) {
      setErrorMessage("Please select a valid attack type and target system.");
      return;
    }

    setLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      await onTriggerAttack(attackType, targetName, severityVal);
      setStatusMessage(`Attack simulation '${attackType}' launched against ${targetName} successfully!`);
    } catch (err) {
      setErrorMessage("Attack simulation could not be completed. Unable to save attack event to Firebase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Cyber Attack Simulation Engine</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Sandboxed cyber attack simulation generator demonstrating real-time Digital Twin attack detection, Firebase persistence, and response.
        </p>
      </div>

      {statusMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          backgroundColor: '#F0FDF4',
          border: '1px solid #86EFAC',
          borderRadius: '8px',
          padding: '0.85rem 1rem',
          marginBottom: '1.25rem',
          color: '#15803D',
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} color="#22C55E" style={{ flexShrink: 0 }} />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: '8px',
          padding: '0.85rem 1rem',
          marginBottom: '1.25rem',
          color: '#B91C1C',
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          <AlertCircle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Launch Attack Form */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap color="var(--accent-red)" size={18} /> Launch Attack Simulation
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Attack Type */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Select Cyber Attack Type
              </label>
              <select
                value={selectedAttack}
                disabled={loading}
                onChange={(e) => setSelectedAttack(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              >
                <option value="Ransomware">Ransomware Simulation</option>
                <option value="DDoS">DDoS Volumetric Simulation</option>
                <option value="SQL Injection">SQL Injection Simulation</option>
                <option value="Malware">Zero-Day Malware Simulation</option>
                <option value="Insider Threat">Insider Threat Simulation</option>
                <option value="Phishing">Phishing Credential Harvest</option>
              </select>
            </div>

            {/* Target Device */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Target Digital Twin Asset
              </label>
              <select
                value={selectedTarget}
                disabled={loading}
                onChange={(e) => setSelectedTarget(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.name}>{d.name} ({d.device_type})</option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Attack Severity Level
              </label>
              <select
                value={selectedSeverity}
                disabled={loading}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              >
                <option value="CRITICAL">CRITICAL (High Risk Impact)</option>
                <option value="HIGH">HIGH (Elevated Risk Impact)</option>
                <option value="MEDIUM">MEDIUM (Moderate Risk Impact)</option>
              </select>
            </div>

            <button
              className="btn btn-danger"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.8rem',
                marginTop: '0.5rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
              onClick={() => handleLaunch()}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" /> Simulating Attack...
                </>
              ) : (
                <>
                  <Play size={16} /> Attack
                </>
              )}

            </button>
          </div>
        </div>

        {/* Attack Vector Presets */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Pre-Configured Attack Scenarios</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {attackPresets.map((preset, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{preset.type}</span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: preset.severity === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-orange)',
                      background: preset.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(249, 115, 22, 0.15)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {preset.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Target: <strong style={{ color: 'var(--accent-blue)' }}>{preset.target}</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {preset.desc}
                  </div>
                </div>

                <button
                  className="btn btn-outline"
                  disabled={loading}
                  style={{ marginTop: '1rem', width: '100%', fontSize: '0.8rem' }}
                  onClick={() => {
                    setSelectedAttack(preset.type);
                    setSelectedTarget(preset.target);
                    setSelectedSeverity(preset.severity);
                    handleLaunch(preset.type, preset.target, preset.severity);
                  }}
                >
                  Simulate {preset.type}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
