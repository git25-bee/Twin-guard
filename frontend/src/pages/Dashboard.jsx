import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Activity, Cpu, Lock, Radio } from 'lucide-react';
import StatCard from '../components/StatCard';
import RiskGauge from '../components/RiskGauge';
import DigitalTwinGraph from '../components/DigitalTwinGraph';
import AlertBanner from '../components/AlertBanner';

export default function Dashboard({
  devices = [],
  statusData = {},
  alert,
  onNodeSelect,
  onQuickAttack,
  onTriggerDefense,
  activeAttacks = []
}) {
  const safeCount = statusData.safe_devices || devices.filter(d => d.status === 'SAFE').length;
  const attackCount = statusData.under_attack_devices || devices.filter(d => d.status === 'UNDER_ATTACK').length;
  const defendedCount = statusData.defended_devices || devices.filter(d => d.status === 'DEFENDED').length;
  const isolatedCount = statusData.isolated_devices || devices.filter(d => d.status === 'ISOLATED').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #38bdf8, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            TwinGuard SOC Operations Center
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time Cyber Attack & Automated Defense Digital Twin Monitoring
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button className="btn btn-danger" onClick={() => onQuickAttack('Ransomware', 'Core Hospital Server')}>
            <ShieldAlert size={15} /> Attack
          </button>
          <button className="btn btn-primary" onClick={() => onTriggerDefense && onTriggerDefense('Core Hospital Server', 'BLOCK_TRAFFIC')}>
            <Shield size={15} /> Defense
          </button>
          <button className="btn btn-outline" onClick={() => onTriggerDefense && onTriggerDefense('Core Hospital Server', 'ISOLATE_DEVICE')}>
            <Lock size={15} /> Isolate
          </button>
        </div>


      </div>


      <AlertBanner alert={alert} />

      {/* Metric Cards Grid */}
      <div className="grid-cards">
        <StatCard title="Total Hospital Devices" value={devices.length} icon={Cpu} color="var(--accent-blue)" subtitle={`${devices.length} TwinGuard Nodes`} />
        <StatCard title="Safe Devices" value={safeCount} icon={ShieldCheck} color="var(--accent-green)" subtitle="Operating normally" />
        <StatCard title="Devices Under Attack" value={attackCount} icon={ShieldAlert} color="var(--accent-red)" subtitle={attackCount > 0 ? "ATTACK IN PROGRESS" : "No active threats"} />
        <StatCard title="Defended Devices" value={defendedCount} icon={Shield} color="var(--accent-purple)" subtitle="Threat mitigated" />
        <StatCard title="Isolated Devices" value={isolatedCount} icon={Lock} color="var(--status-isolated)" subtitle="Network air-gapped" />
      </div>

      {/* Main Content Split: Digital Twin Graph + Risk Gauge */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Cytoscape Graph Widget */}
        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Hospital Digital Twin Network Topology</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click node to inspect</span>
          </div>
          <div style={{ flex: 1, minHeight: '380px' }}>
            <DigitalTwinGraph devices={devices} onNodeSelect={onNodeSelect} />
          </div>
        </div>

        {/* Risk Gauge & Quick Stats */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Hospital Risk Score</h3>
          <RiskGauge score={statusData.overall_risk_score || 15} level={statusData.risk_level || "LOW"} />

          <div style={{ background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '1rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Current Threat Status
            </div>
            {attackCount > 0 ? (
              <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem', fontWeight: 600 }}>
                ⚠ Active threat detected on {devices.find(d => d.status === 'UNDER_ATTACK')?.name || 'Hospital Network'}
              </div>
            ) : (
              <div style={{ color: 'var(--accent-green)', fontSize: '0.85rem', fontWeight: 500 }}>
                ✓ All hospital network systems operating within safe parameters.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Security Activity Table */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Security Events</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Device Name</th>
                <th>Type</th>
                <th>IP Address</th>
                <th>Status</th>
                <th>Risk Score</th>
                <th>Detected Threat</th>
                <th>Last Defense Action</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((dev) => (
                <tr key={dev.id} style={{ cursor: 'pointer' }} onClick={() => onNodeSelect(dev)}>
                  <td style={{ fontWeight: 600 }}>{dev.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{dev.device_type}</td>
                  <td className="font-mono">{dev.ip_address}</td>
                  <td>
                    <span className={`status-badge ${dev.status}`}>{dev.status}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: dev.risk_score > 70 ? 'var(--accent-red)' : 'var(--text-main)' }}>
                    {dev.risk_score}/100
                  </td>
                  <td style={{ color: dev.detected_threat !== 'None' ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                    {dev.detected_threat}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{dev.defense_action || 'None'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
