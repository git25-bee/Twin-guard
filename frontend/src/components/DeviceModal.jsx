import React from 'react';
import { X, ShieldAlert, Cpu, HardDrive, Wifi, Lock, CheckCircle, Eye } from 'lucide-react';

export default function DeviceModal({ device, onClose, onIsolate, onMonitor, onMarkSafe }) {
  if (!device) return null;

  const getRiskColor = (score) => {
    if (score > 80) return 'var(--accent-red)';
    if (score > 60) return 'var(--accent-orange)';
    if (score > 30) return 'var(--accent-yellow)';
    return 'var(--accent-green)';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{device.name}</h3>
              <span className={`status-badge ${device.status}`}>{device.status}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {device.device_type} • IP: <span className="font-mono">{device.ip_address}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          {/* Risk Score */}
          <div style={{ background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: getRiskColor(device.risk_score) }}>
              {device.risk_score}/100
            </div>
          </div>

          {/* Threat */}
          <div style={{ background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Detected Threat</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: device.detected_threat !== 'None' ? 'var(--accent-red)' : 'var(--text-main)', marginTop: '0.25rem' }}>
              {device.detected_threat}
            </div>
          </div>
        </div>

        {/* System Resource Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
          {/* CPU */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                <Cpu size={14} /> CPU Usage
              </span>
              <span style={{ fontWeight: 600 }}>{device.cpu_usage || 20}%</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${device.cpu_usage || 20}%`,
                  background: device.cpu_usage > 80 ? 'var(--accent-red)' : 'var(--accent-blue)'
                }}
              />
            </div>
          </div>

          {/* Memory */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                <HardDrive size={14} /> Memory Usage
              </span>
              <span style={{ fontWeight: 600 }}>{device.memory_usage || 35}%</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${device.memory_usage || 35}%`, background: 'var(--accent-purple)' }}
              />
            </div>
          </div>

          {/* Network Traffic */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                <Wifi size={14} /> Network Bandwidth
              </span>
              <span style={{ fontWeight: 600 }}>{device.network_traffic || 120} MB/s</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.min(100, ((device.network_traffic || 120) / 1000) * 100)}%`,
                  background: device.network_traffic > 500 ? 'var(--accent-yellow)' : 'var(--accent-green)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Defense Status & Last Activity */}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
          <div><strong>Defense Action:</strong> {device.defense_action || 'None'}</div>
          <div><strong>Last Activity:</strong> {device.last_activity || 'Just now'}</div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-outline"
            style={{ flex: 1 }}
            onClick={() => { onIsolate(device.name); onClose(); }}
          >
            <Lock size={15} /> Isolate
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={() => { onMonitor(device.name); onClose(); }}
          >
            <Eye size={15} /> Defense
          </button>
          <button
            className="btn btn-success"
            style={{ flex: 1 }}
            onClick={() => { onMarkSafe(device.name); onClose(); }}
          >
            <CheckCircle size={15} /> Mark Safe
          </button>
        </div>


      </div>
    </div>
  );
}
