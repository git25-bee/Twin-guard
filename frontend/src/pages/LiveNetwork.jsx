import React, { useState } from 'react';
import { Radio, Search, Activity, Cpu, HardDrive, Thermometer, ShieldAlert, Lock, CheckCircle, RefreshCw, Plus, X } from 'lucide-react';
import { api } from '../services/api';

export default function LiveNetwork({ devices = [], onTriggerAttack, onTriggerDefense, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [submittingEvent, setSubmittingEvent] = useState(false);

  const [eventForm, setEventForm] = useState({
    event_type: 'Suspicious Traffic',
    target_device: devices[0]?.name || 'ICU Bedside Monitor 01',
    severity: 'MEDIUM',
    description: 'Unusual communication detected from an unknown network source.',
    source: 'Manual SOC Operator'
  });

  const medicalKeywords = ['icu', 'monitor', 'ventilator', 'pump', 'ecg', 'patient', 'medical', 'pharmacy', 'cardiology', 'ward', 'sensor'];

  const filteredDevices = devices.filter((dev) => {
    const isMedical = medicalKeywords.some(k => 
      (dev.device_type || '').toLowerCase().includes(k) || 
      (dev.name || '').toLowerCase().includes(k) ||
      (dev.id || '').toLowerCase().includes(k) ||
      (dev.hospital_department || '').toLowerCase().includes(k)
    );
    const query = searchQuery.toLowerCase();
    const matchesSearch = (dev.name || '').toLowerCase().includes(query) ||
                          (dev.id || '').toLowerCase().includes(query) ||
                          (dev.ip_address || '').includes(query) ||
                          (dev.hospital_department || '').toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'ALL' || dev.status === statusFilter;
    return (isMedical || devices.length <= 4) && matchesSearch && matchesStatus;
  });


  const handleLogEventSubmit = async (e) => {
    e.preventDefault();
    setSubmittingEvent(true);
    try {
      await api.logSecurityEvent(
        eventForm.event_type,
        eventForm.target_device,
        eventForm.severity,
        eventForm.description
      );
      setEventModalOpen(false);
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error("Failed to log security event:", err);
    } finally {
      setSubmittingEvent(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Radio color="var(--accent-blue)" size={24} /> Live Hospital Network & Telemetry Monitor
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time MQTT telemetry, heartbeat monitoring, and device status streaming from hospital subnets.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }} onClick={() => setEventModalOpen(true)}>
            <Plus size={14} /> Log Security Event
          </button>

          <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }} onClick={onRefresh}>
            <RefreshCw size={14} /> Refresh Stream
          </button>

          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search devices or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.45rem 0.75rem 0.45rem 2rem',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '0.45rem 0.75rem',
              color: 'var(--text-main)',
              fontSize: '0.85rem'
            }}
          >
            <option value="ALL">All Device States</option>
            <option value="ONLINE">Online</option>
            <option value="UNSTABLE">Unstable</option>
            <option value="OFFLINE">Offline</option>
            <option value="UNDER_ATTACK">Under Attack</option>
            <option value="ISOLATED">Isolated</option>
          </select>
        </div>
      </div>

      {/* Network Metrics Cards */}
      <div className="grid-cards" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Connected Devices</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-blue)', marginTop: '0.25rem' }}>
            {devices.length}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Online / Active Heartbeats</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-green)', marginTop: '0.25rem' }}>
            {devices.filter(d => d.status === 'ONLINE' || d.status === 'SAFE').length}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Offline / Unstable Devices</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-orange)', marginTop: '0.25rem' }}>
            {devices.filter(d => d.status === 'OFFLINE' || d.status === 'UNSTABLE').length}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Under Attack / Air-gapped</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-red)', marginTop: '0.25rem' }}>
            {devices.filter(d => d.status === 'UNDER_ATTACK' || d.status === 'ISOLATED').length}
          </div>
        </div>
      </div>

      {/* Live Devices Network Table */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Live Network Telemetry Matrix</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Device ID & Name</th>
                <th>Dept / Location</th>
                <th>IP & MAC Address</th>
                <th>Protocol</th>
                <th>Status</th>
                <th>CPU / Temp</th>
                <th>Risk Score</th>
                <th>Last Seen</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((dev) => (
                <tr key={dev.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{dev.name}</div>
                    <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--accent-blue)' }}>{dev.id}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{dev.hospital_department || 'ICU Ward'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dev.location || 'Main Building'}</div>
                  </td>
                  <td>
                    <div className="font-mono">{dev.ip_address}</div>
                    <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{dev.mac_address || '00:1A:2B:3C:4D:5E'}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#E0F2FE', color: '#0284C7', fontWeight: 600 }}>
                      {dev.connection_protocol || 'MQTT'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${dev.status}`}>{dev.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <span><Cpu size={12} /> {dev.cpu_usage || 20}%</span>
                      <span><Thermometer size={12} /> {dev.temperature || 36.6}°C</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: dev.risk_score > 70 ? 'var(--accent-red)' : 'var(--text-main)' }}>
                    {dev.risk_score}/100
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {dev.last_seen || 'Just now'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                        onClick={() => onTriggerAttack('Ransomware', dev.name || dev.id)}
                        title="Simulate Ransomware attack"
                      >
                        <ShieldAlert size={12} /> Attack
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                        onClick={() => onTriggerDefense(dev.name || dev.id, 'BLOCK_TRAFFIC')}
                        title="Apply Defense"
                      >
                        <Activity size={12} /> Defense
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                        onClick={() => onTriggerDefense(dev.name || dev.id, 'ISOLATE_DEVICE')}
                        title="Isolate device"
                      >
                        <Lock size={12} /> Isolate
                      </button>
                      <button
                        className="btn btn-success"
                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                        onClick={() => onTriggerDefense(dev.name || dev.id, 'MARK_SAFE')}
                        title="Mark safe"
                      >
                        <CheckCircle size={12} /> Safe
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredDevices.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No network devices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Security Event Entry Modal */}
      {eventModalOpen && (
        <div className="modal-overlay" onClick={() => setEventModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Log Manual Security Event</h3>
              <button onClick={() => setEventModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLogEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Event Type
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suspicious Traffic"
                  value={eventForm.event_type}
                  onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Target Hospital Device
                </label>
                <select
                  value={eventForm.target_device}
                  onChange={(e) => setEventForm({ ...eventForm, target_device: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                >
                  {devices.map((d) => (
                    <option key={d.id} value={d.name}>{d.name} ({d.ip_address})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Severity Level
                  </label>
                  <select
                    value={eventForm.severity}
                    onChange={(e) => setEventForm({ ...eventForm, severity: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Event Source
                  </label>
                  <input
                    type="text"
                    value={eventForm.source}
                    onChange={(e) => setEventForm({ ...eventForm, source: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Description / SOC Analyst Notes
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Unusual communication detected from an unknown network source."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEventModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submittingEvent}>
                  {submittingEvent ? 'Saving to Firebase...' : 'Log Security Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

