import React, { useState } from 'react';
import { Shield, ShieldCheck, Lock, Activity, RefreshCw, Cpu, CheckCircle } from 'lucide-react';

export default function DefenseCenter({ devices = [], onTriggerDefense, onReset }) {
  const [autoDefense, setAutoDefense] = useState(true);

  const handleDefenseAction = (targetName, actionCode) => {
    onTriggerDefense(targetName, actionCode);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Automated Defense & Mitigation Center</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time multi-threaded threat monitoring, firewall rules engine, and network isolation controls.
          </p>
        </div>

        {/* Auto Defense Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <Shield size={20} color={autoDefense ? 'var(--accent-green)' : 'var(--text-muted)'} />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Automated Threat Mitigation</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {autoDefense ? 'Python Defense Thread ACTIVE' : 'Manual Defense Mode'}
            </div>
          </div>
          <button
            className={`btn ${autoDefense ? 'btn-success' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            onClick={() => setAutoDefense(!autoDefense)}
          >
            {autoDefense ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>
      </div>

      {/* Engine Status Grid */}
      <div className="grid-cards">
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Thread 1: Threat Monitor</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-green)', marginTop: '0.25rem' }}>
            ● RUNNING (2000ms loop)
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Thread 2: Auto Mitigation</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: autoDefense ? 'var(--accent-blue)' : 'var(--text-muted)', marginTop: '0.25rem' }}>
            {autoDefense ? '● ACTIVE (3000ms loop)' : '○ PAUSED'}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Firewall Policies</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-purple)', marginTop: '0.25rem' }}>
            14 SPI Rules Active
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mean Time to Defend (MTTD)</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-yellow)', marginTop: '0.25rem' }}>
            320 ms
          </div>
        </div>
      </div>

      {/* Hospital Devices Mitigation Matrix */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Device Security & Defense Control Matrix</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Device Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Risk Score</th>
                <th>Threat Detected</th>
                <th>Active Defense Action</th>
                <th>Manual Mitigation Control</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((dev) => (
                <tr key={dev.id}>
                  <td style={{ fontWeight: 600 }}>{dev.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{dev.device_type}</td>
                  <td>
                    <span className={`status-badge ${dev.status}`}>{dev.status}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: dev.risk_score > 70 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                    {dev.risk_score}/100
                  </td>
                  <td style={{ color: dev.detected_threat !== 'None' ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                    {dev.detected_threat}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{dev.defense_action || 'None'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => handleDefenseAction(dev.name, 'ISOLATE_DEVICE')}
                        title="Isolate network adapter"
                      >
                        <Lock size={12} /> Isolate
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => handleDefenseAction(dev.name, 'BLOCK_TRAFFIC')}
                        title="Block ports"
                      >
                        <Shield size={12} /> Block Traffic
                      </button>
                      <button
                        className="btn btn-success"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => handleDefenseAction(dev.name, 'MARK_SAFE')}
                        title="Mark verified safe"
                      >
                        <CheckCircle size={12} /> Safe
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
