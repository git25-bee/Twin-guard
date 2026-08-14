import React, { useState } from 'react';
import { Zap, AlertTriangle, ShieldAlert, Play, Cpu, Server, Database } from 'lucide-react';

export default function AttackSimulation({ devices = [], onTriggerAttack }) {
  const [selectedAttack, setSelectedAttack] = useState('Ransomware');
  const [selectedTarget, setSelectedTarget] = useState('Hospital Server');
  const [selectedSeverity, setSelectedSeverity] = useState('CRITICAL');

  const attackPresets = [
    {
      type: 'Ransomware',
      severity: 'CRITICAL',
      target: 'Hospital Server',
      desc: 'Encrypts critical hospital file systems and spikes CPU to 92%. Demands ransom while threatening patient database access.'
    },
    {
      type: 'DDoS',
      severity: 'HIGH',
      target: 'Firewall',
      desc: 'Floods perimeter gateway with 1.25 GB/s SYN packets to exhaust bandwidth and disable EHR services.'
    },
    {
      type: 'SQL Injection',
      severity: 'CRITICAL',
      target: 'Patient Database',
      desc: 'Injects malicious SQL queries to bypass authentication and attempt unauthorized bulk extraction of PHI records.'
    },
    {
      type: 'Malware',
      severity: 'HIGH',
      target: 'Doctor PC',
      desc: 'Deploys zero-day endpoint Trojan attempting lateral recon across clinical workstations.'
    },
    {
      type: 'Insider Threat',
      severity: 'MEDIUM',
      target: 'Admin PC',
      desc: 'Anomalous off-hours administrative access attempting unauthorized credential escalation.'
    },
    {
      type: 'Phishing',
      severity: 'MEDIUM',
      target: 'Nurse PC',
      desc: 'Credential harvesting link accessed on ward workstation attempting staff credential theft.'
    }
  ];

  const handleLaunch = () => {
    onTriggerAttack(selectedAttack, selectedTarget, selectedSeverity);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Cyber Attack Simulation Engine</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Safe, sandboxed cyber attack generator demonstrating real-time Digital Twin attack detection and response.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Launch Attack Form */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap color="var(--accent-red)" size={18} /> Launch Attack Vector
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Attack Type */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Select Cyber Attack Type
              </label>
              <select
                value={selectedAttack}
                onChange={(e) => setSelectedAttack(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              >
                <option value="Ransomware">Ransomware Attack</option>
                <option value="DDoS">DDoS Volumetric Attack</option>
                <option value="SQL Injection">SQL Injection Attack</option>
                <option value="Malware">Zero-Day Malware</option>
                <option value="Insider Threat">Insider Threat</option>
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
                Attack Severity
              </label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              >
                <option value="CRITICAL">CRITICAL (Risk ~86-95)</option>
                <option value="HIGH">HIGH (Risk ~70-85)</option>
                <option value="MEDIUM">MEDIUM (Risk ~50-70)</option>
              </select>
            </div>

            <button
              className="btn btn-danger"
              style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', fontWeight: 700 }}
              onClick={handleLaunch}
            >
              <Play size={16} /> Execute Attack Simulation
            </button>
          </div>
        </div>

        {/* Attack Vector Presets */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Pre-Configured Viva Demonstration Presets</h3>
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
                  justify: 'space-between'
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
                  style={{ marginTop: '1rem', width: '100%', fontSize: '0.8rem' }}
                  onClick={() => {
                    setSelectedAttack(preset.type);
                    setSelectedTarget(preset.target);
                    setSelectedSeverity(preset.severity);
                    onTriggerAttack(preset.type, preset.target, preset.severity);
                  }}
                >
                  Run {preset.type} Demo
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
