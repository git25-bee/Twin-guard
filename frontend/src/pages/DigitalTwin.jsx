import React, { useState } from 'react';
import { Lock, Eye, CheckCircle, ShieldAlert, Cpu, Activity, Radio } from 'lucide-react';
import DigitalTwinGraph from '../components/DigitalTwinGraph';

export default function DigitalTwin({ devices = [], onNodeSelect, onIsolate, onMonitor, onMarkSafe }) {
  const [selectedDevId, setSelectedDevId] = useState(devices[0]?.id || 'node-firewall');

  const selectedDev = devices.find(d => d.id === selectedDevId || d.name.toLowerCase() === selectedDevId.toLowerCase()) || 
                      devices[0] || 
                      { id: 'node-firewall', name: 'Hospital Firewall', status: 'ONLINE', risk_score: 15, cpu_usage: 20, memory_usage: 30, network_traffic: 400, detected_threat: 'None', device_type: 'Perimeter / DMZ' };

  const handleSelect = (dev) => {
    if (dev) {
      setSelectedDevId(dev.id || dev.name);
      if (onNodeSelect) onNodeSelect(dev);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #38bdf8, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Hospital Digital Twin Network Visualizer
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Real-time interactive Cytoscape.js topology map of hospital core server, DMZ firewall, patient databases, and connected medical endpoints.
        </p>
      </div>

      {/* Main Layout: Visualizer Canvas & Live Inspector Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', height: 'calc(100vh - 180px)' }}>
        {/* Cytoscape Network Visualizer Canvas */}
        <div className="card" style={{ padding: '0.75rem', height: '100%', position: 'relative' }}>
          <DigitalTwinGraph devices={devices} onNodeSelect={handleSelect} selectedNodeId={selectedDev.id} />
        </div>

        {/* Live Inspector Panel */}
        <div className="card" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
              <span className={`status-badge ${selectedDev.status}`} style={{ marginBottom: '0.5rem' }}>
                {selectedDev.status}
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>{selectedDev.name}</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedDev.device_type} • {selectedDev.hospital_department || 'General Hospital'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', marginTop: '0.25rem' }} className="font-mono">
                IP: {selectedDev.ip_address || '192.168.1.1'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Asset Risk Index</span>
                <span style={{ fontWeight: 800, color: selectedDev.risk_score > 70 ? 'var(--accent-red)' : selectedDev.risk_score > 40 ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
                  {selectedDev.risk_score}/100
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>CPU Workload</span>
                <span style={{ fontWeight: 600 }}>{selectedDev.cpu_usage}%</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Memory Utilization</span>
                <span style={{ fontWeight: 600 }}>{selectedDev.memory_usage}%</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Network Traffic</span>
                <span style={{ fontWeight: 600 }}>{selectedDev.network_traffic} MB/s</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', background: selectedDev.detected_threat !== 'None' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(30, 41, 59, 0.4)', padding: '0.5rem', borderRadius: '6px', border: '1px solid ' + (selectedDev.detected_threat !== 'None' ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-color)') }}>
                <span style={{ color: 'var(--text-muted)' }}>Active Threat</span>
                <span style={{ color: selectedDev.detected_threat !== 'None' ? 'var(--accent-red)' : 'var(--text-muted)', fontWeight: 700 }}>
                  {selectedDev.detected_threat}
                </span>
              </div>
            </div>

            {/* Interactive Mitigation Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: 'auto' }}>
              <button className="btn btn-outline" onClick={() => onIsolate(selectedDev.name || selectedDev.id)}>
                <Lock size={14} /> Isolate
              </button>
              <button className="btn btn-primary" onClick={() => onMonitor(selectedDev.name || selectedDev.id)}>
                <Eye size={14} /> Defense
              </button>
              <button className="btn btn-success" onClick={() => onMarkSafe(selectedDev.name || selectedDev.id)}>
                <CheckCircle size={14} /> Safe
              </button>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}

