import React, { useState } from 'react';
import { Search, Filter, Cpu, Lock, CheckCircle, Eye, ShieldAlert } from 'lucide-react';
import DigitalTwinGraph from '../components/DigitalTwinGraph';

export default function DigitalTwin({ devices = [], onNodeSelect, onIsolate, onMonitor, onMarkSafe }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDev, setSelectedDev] = useState(devices[2] || null);

  const filteredDevices = devices.filter(d => {
    const matchesStatus = filterStatus === 'ALL' || d.status === filterStatus;
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.device_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.ip_address.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const handleSelect = (dev) => {
    setSelectedDev(dev);
    if (onNodeSelect) onNodeSelect(dev);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Hospital Digital Twin Visualizer</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Interactive Cytoscape.js Node Graph Topology of Smart Hospital Network Infrastructure
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search node or IP..."
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '0.45rem 0.75rem',
              color: 'var(--text-main)',
              fontSize: '0.85rem'
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="SAFE">Safe (Green)</option>
            <option value="UNDER_ATTACK">Under Attack (Red)</option>
            <option value="DEFENDED">Defended (Blue)</option>
            <option value="ISOLATED">Isolated (Dark Gray)</option>
          </select>
        </div>
      </div>

      {/* Main Split Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', height: 'calc(100vh - 180px)' }}>
        {/* Cytoscape Canvas */}
        <div className="card" style={{ padding: '0.75rem', height: '100%' }}>
          <DigitalTwinGraph devices={filteredDevices} onNodeSelect={handleSelect} />
        </div>

        {/* Sidebar Inspector Panel */}
        <div className="card" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {selectedDev ? (
            <div>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
                <span className={`status-badge ${selectedDev.status}`} style={{ marginBottom: '0.5rem' }}>
                  {selectedDev.status}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{selectedDev.name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedDev.device_type}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', marginTop: '0.2rem' }} className="font-mono">
                  {selectedDev.ip_address}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Risk Score</span>
                  <span style={{ fontWeight: 700, color: selectedDev.risk_score > 70 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                    {selectedDev.risk_score}/100
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>CPU Usage</span>
                  <span style={{ fontWeight: 600 }}>{selectedDev.cpu_usage}%</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Memory</span>
                  <span style={{ fontWeight: 600 }}>{selectedDev.memory_usage}%</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Traffic Bandwidth</span>
                  <span style={{ fontWeight: 600 }}>{selectedDev.network_traffic} MB/s</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Threat</span>
                  <span style={{ color: selectedDev.detected_threat !== 'None' ? 'var(--accent-red)' : 'var(--text-muted)', fontWeight: 600 }}>
                    {selectedDev.detected_threat}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
                <button className="btn btn-danger" onClick={() => onIsolate(selectedDev.name)}>
                  <Lock size={14} /> Isolate Node
                </button>
                <button className="btn btn-secondary" onClick={() => onMonitor(selectedDev.name)}>
                  <Eye size={14} /> Monitor Node
                </button>
                <button className="btn btn-success" onClick={() => onMarkSafe(selectedDev.name)}>
                  <CheckCircle size={14} /> Mark Node Safe
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
              Select any node in the topology graph to inspect.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
