import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, Lock, Activity, RefreshCw, Cpu, CheckCircle, AlertTriangle, Zap, Server, Database, Radio, Flame } from 'lucide-react';
import { api } from '../services/api';

export default function DefenseCenter({ devices = [], onTriggerDefense, onReset }) {
  const [autoDefense, setAutoDefense] = useState(false);
  const [defenseLogs, setDefenseLogs] = useState([]);
  const [selectedAirGapTarget, setSelectedAirGapTarget] = useState('');
  const [selectedFilterTarget, setSelectedFilterTarget] = useState('');
  const [selectedDbTarget, setSelectedDbTarget] = useState('');
  const [selectedAuditTarget, setSelectedAuditTarget] = useState('');

  const fetchDefenseLogs = async () => {
    try {
      const logs = await api.getDefenseHistory();
      setDefenseLogs(logs || []);
    } catch (err) {
      console.error("Failed to fetch defense logs:", err);
    }
  };

  useEffect(() => {
    api.getStatus().then(data => {
      if (typeof data.auto_defense_enabled === 'boolean') {
        setAutoDefense(data.auto_defense_enabled);
      }
    }).catch(err => console.error(err));

    fetchDefenseLogs();

    // Default dropdown target values
    if (devices.length > 0) {
      const serverDev = devices.find(d => d.name.toLowerCase().includes('server')) || devices[0];
      const firewallDev = devices.find(d => d.name.toLowerCase().includes('firewall')) || devices[0];
      const dbDev = devices.find(d => d.name.toLowerCase().includes('database') || d.name.toLowerCase().includes('patient')) || devices[0];
      
      setSelectedAirGapTarget(serverDev.name);
      setSelectedFilterTarget(firewallDev.name);
      setSelectedDbTarget(dbDev.name);
      setSelectedAuditTarget(devices[0].name);
    }
  }, [devices]);

  const handleToggleAutoDefense = async () => {
    const nextState = !autoDefense;
    setAutoDefense(nextState);
    try {
      await api.toggleAutoDefense(nextState);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDefenseAction = async (targetName, actionCode) => {
    if (!targetName) return;
    await onTriggerDefense(targetName, actionCode);
    await fetchDefenseLogs();
  };

  const handleMassAirGap = async () => {
    const vulnerableDevices = devices.filter(d => d.status === 'UNDER_ATTACK' || d.status === 'SUSPICIOUS');
    if (vulnerableDevices.length === 0) {
      const target = devices.find(d => d.name.toLowerCase().includes('server'))?.name || devices[0]?.name;
      if (target) await handleDefenseAction(target, 'ISOLATE_DEVICE');
      return;
    }
    for (const dev of vulnerableDevices) {
      await handleDefenseAction(dev.name, 'ISOLATE_DEVICE');
    }
  };

  const compromisedCount = devices.filter(d => d.status === 'UNDER_ATTACK').length;
  const suspiciousCount = devices.filter(d => d.status === 'SUSPICIOUS').length;
  const defendedCount = devices.filter(d => d.status === 'DEFENDED' || d.status === 'ISOLATED').length;

  return (
    <div>
      {/* Header & Global Defense Posture */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={26} color="var(--accent-blue)" /> SOC Defense & Mitigation Command Center
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            NIST SP 800-53 / MITRE D3FEND Countermeasure Playbooks and Real-Time Multi-Threaded Air-Gap Controls
          </p>
        </div>

        {/* Auto Mitigation Thread Controller */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: '0 2px 10px rgba(37, 99, 235, 0.08)' }}>
          <Shield size={20} color={autoDefense ? 'var(--accent-green)' : 'var(--text-muted)'} />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Automated Threat Mitigation Engine</div>
            <div style={{ fontSize: '0.7rem', color: autoDefense ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: 600 }}>
              {autoDefense ? '● Python Defense Thread ACTIVE (3000ms loop)' : '○ Manual SOC Command Mode'}
            </div>
          </div>
          <button
            className={`btn ${autoDefense ? 'btn-success' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', fontWeight: 700 }}
            onClick={handleToggleAutoDefense}
          >
            {autoDefense ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>
      </div>

      {/* Global Emergency Action Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', border: '1px solid #bfdbfe' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: uppercaseText('Global Emergency Controls') }}>
              EMERGENCY MITIGATION PLAYBOOKS
            </span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.1rem' }}>
              Instant SOC Threat Isolation & Firewall Hardening
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button className="btn btn-outline" onClick={handleMassAirGap} style={{ fontSize: '0.85rem' }}>

              <Lock size={15} /> Isolate
            </button>
            <button className="btn btn-primary" onClick={() => handleDefenseAction(selectedFilterTarget || 'Hospital Firewall', 'BLOCK_TRAFFIC')} style={{ fontSize: '0.85rem' }}>
              <Shield size={15} /> Defense
            </button>
            <button className="btn btn-success" onClick={onReset} style={{ fontSize: '0.85rem' }}>
              <RefreshCw size={15} /> Reset Baseline
            </button>
          </div>
        </div>
      </div>

      {/* Engine Metrics Cards */}
      <div className="grid-cards" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Threat Monitor Loop</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: '0.25rem' }}>
            ● RUNNING (2000ms polling)
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Compromised Devices</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: compromisedCount > 0 ? 'var(--accent-red)' : 'var(--accent-green)', marginTop: '0.25rem' }}>
            {compromisedCount} Under Active Attack
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active SPI Firewall Rules</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-purple)', marginTop: '0.25rem' }}>
            14 Active Rules
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mean Time to Defend (MTTD)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
            320 ms
          </div>
        </div>
      </div>

      {/* Main Split: Defense Playbooks Launcher (Left) + Execution Log Stream (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Left: MITRE D3FEND Defense Playbook Cards */}
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.85rem', color: 'var(--text-main)' }}>
            NIST SP 800-53 / MITRE D3FEND Defense Countermeasures
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            {/* Playbook 1: Network Air-Gap */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px' }}>
                    D3-AHD / D3-MSI
                  </span>
                  <Lock size={16} color="var(--accent-red)" />
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Network Air-Gap Isolation</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '0.85rem' }}>
                  Disconnects hardware interface and isolates VLAN segment to prevent malware lateral movement.
                </p>
              </div>

              <div>
                <select
                  value={selectedAirGapTarget}
                  onChange={(e) => setSelectedAirGapTarget(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '0.5rem' }}
                >
                  {devices.map(d => <option key={d.id} value={d.name}>{d.name} ({d.status})</option>)}
                </select>
                <button className="btn btn-outline" style={{ width: '100%', fontSize: '0.8rem' }} onClick={() => handleDefenseAction(selectedAirGapTarget, 'ISOLATE_DEVICE')}>
                  Isolate
                </button>
              </div>
            </div>

            {/* Playbook 2: SPI Traffic Filtering */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', background: '#dbeafe', color: '#1d4ed8', borderRadius: '4px' }}>
                    D3-WPS / D3-NPR
                  </span>
                  <Shield size={16} color="var(--accent-blue)" />
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>WAF SPI Traffic Filtering</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '0.85rem' }}>
                  Applies Stateful Packet Inspection rules to drop volumetric DDoS traffic and malicious payloads.
                </p>
              </div>

              <div>
                <select
                  value={selectedFilterTarget}
                  onChange={(e) => setSelectedFilterTarget(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '0.5rem' }}
                >
                  {devices.map(d => <option key={d.id} value={d.name}>{d.name} ({d.status})</option>)}
                </select>
                <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.8rem' }} onClick={() => handleDefenseAction(selectedFilterTarget, 'BLOCK_TRAFFIC')}>
                  Defense
                </button>
              </div>
            </div>

            {/* Playbook 3: DB Transaction Lock */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', background: '#fef3c7', color: '#b45309', borderRadius: '4px' }}>
                    D3-DTL / D3-ZTA
                  </span>
                  <Database size={16} color="var(--accent-yellow)" />
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Database Transaction Lock</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '0.85rem' }}>
                  Enforces read-only PHI snapshot mode and revokes compromised API tokens to stop data exfiltration.
                </p>
              </div>

              <div>
                <select
                  value={selectedDbTarget}
                  onChange={(e) => setSelectedDbTarget(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '0.5rem' }}
                >
                  {devices.map(d => <option key={d.id} value={d.name}>{d.name} ({d.status})</option>)}
                </select>
                <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.8rem' }} onClick={() => handleDefenseAction(selectedDbTarget, 'PROTECT_DATABASE')}>
                  Defense (DB Lock)
                </button>
              </div>
            </div>

            {/* Playbook 4: Verified Safety Audit */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', background: '#dcfce7', color: '#15803d', borderRadius: '4px' }}>
                    D3-VSA / D3-QMD
                  </span>
                  <CheckCircle size={16} color="var(--accent-green)" />
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Verified Safety & Baseline Audit</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '0.85rem' }}>
                  Verifies system integrity, clears threat flags, and restores normal operational status.
                </p>
              </div>

              <div>
                <select
                  value={selectedAuditTarget}
                  onChange={(e) => setSelectedAuditTarget(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '0.5rem' }}
                >
                  {devices.map(d => <option key={d.id} value={d.name}>{d.name} ({d.status})</option>)}
                </select>
                <button className="btn btn-success" style={{ width: '100%', fontSize: '0.8rem' }} onClick={() => handleDefenseAction(selectedAuditTarget, 'MARK_SAFE')}>
                  Mark Safe
                </button>
              </div>
            </div>


          </div>
        </div>

        {/* Right: Real-time Defense Execution Stream */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Mitigation Log Stream</h3>
            <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={fetchDefenseLogs}>
              <RefreshCw size={12} /> Sync
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '380px', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {defenseLogs.length > 0 ? (
              defenseLogs.slice(0, 10).map((log, idx) => (
                <div key={log.defense_id || idx} style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                      {log.action || 'ISOLATE_DEVICE'}
                    </span>
                    <span className={`status-badge ${log.result === 'SUCCESS' ? 'SAFE' : 'UNDER_ATTACK'}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                      {log.result || 'EXECUTED'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    Target: {log.target_device || log.target || 'Core Hospital Server'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    <span>MTTD: {log.response_time_ms || 320} ms</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto', fontSize: '0.85rem' }}>
                No mitigations executed yet. Trigger a playbook action above to view live execution.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Active Device Mitigation & Threat Status Matrix */}
      <div className="card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>
          Live Asset Threat & Defense Mitigation Matrix
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Target Asset</th>
                <th>Department</th>
                <th>Current Status</th>
                <th>Risk Index</th>
                <th>Detected Threat</th>
                <th>Applied Defense Technique</th>
                <th>Quick Countermeasure Action</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((dev) => {
                const getTechnique = () => {
                  if (dev.status === 'ISOLATED') return 'D3-AHD: Air-Gap Hardware Disconnect';
                  if (dev.status === 'UNDER_ATTACK') return 'D3-WPS: WAF SPI Packet Scrubbing (ACTIVE)';
                  if (dev.status === 'SUSPICIOUS') return 'D3-NPR: Network Port Rate-Limiting';
                  if (dev.status === 'DEFENDED') return 'D3-MSI: Micro-Segment Isolation';
                  return 'D3-VSA: Verified Safety Audit';
                };

                return (
                  <tr key={dev.id}>
                    <td style={{ fontWeight: 700 }}>{dev.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{dev.hospital_department || 'General Ward'}</td>
                    <td>
                      <span className={`status-badge ${dev.status}`}>{dev.status}</span>
                    </td>
                    <td style={{ fontWeight: 800, color: dev.risk_score > 70 ? 'var(--accent-red)' : dev.risk_score > 40 ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
                      {dev.risk_score}/100
                    </td>
                    <td style={{ color: dev.detected_threat !== 'None' ? 'var(--accent-red)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {dev.detected_threat}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                      {getTechnique()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                          onClick={() => handleDefenseAction(dev.name, 'ISOLATE_DEVICE')}
                          title="Apply Air-Gap Disconnect (D3-AHD)"
                        >
                          <Lock size={12} /> Isolate
                        </button>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                          onClick={() => handleDefenseAction(dev.name, 'BLOCK_TRAFFIC')}
                          title="Apply WAF Packet Filter (D3-WPS)"
                        >
                          <Shield size={12} /> Defense
                        </button>
                        <button
                          className="btn btn-success"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                          onClick={() => handleDefenseAction(dev.name, 'MARK_SAFE')}
                          title="Restore & Mark Verified Safe (D3-VSA)"
                        >
                          <CheckCircle size={12} /> Safe
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


function uppercaseText(str) {
  return str.toUpperCase();
}


