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

  const getDeviceEmoji = (dev) => {
    const name = (dev?.name || '').toLowerCase();
    const id = (dev?.id || '').toLowerCase();
    const type = (dev?.device_type || '').toLowerCase();

    if (name.includes('pc') || name.includes('workstation') || type.includes('staff') || id.includes('pc')) return '💻';
    if (name.includes('server') || id.includes('server')) return '🖥️';
    if (name.includes('firewall') || type.includes('perimeter') || id.includes('firewall')) return '🧱';
    if (name.includes('database') || name.includes('db') || type.includes('db')) return '🗄️';
    if (name.includes('ehr') || type.includes('ehr')) return '📋';
    if (name.includes('ventilator')) return '🫁';
    if (name.includes('ecg') || type.includes('cardiology')) return '🫀';
    if (name.includes('pump') || name.includes('infusion')) return '💉';
    if (name.includes('icu') || name.includes('monitor') || name.includes('bedside')) return '🩺';
    if (name.includes('pharmacy')) return '💊';
    if (name.includes('internet') || name.includes('gateway') || id.includes('internet')) return '🌐';
    return '💻';
  };

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #38bdf8, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Hospital Digital Twin Network Visualizer
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Real-time interactive topology map of core servers, firewalls, databases, and connected medical device nodes with miniature designs.
        </p>
      </div>

      {/* Main Layout: Full-Width Network Visualizer Canvas ONLY */}
      <div style={{ width: '100%', height: 'calc(100vh - 170px)' }}>
        <div className="card" style={{ padding: '0.75rem', height: '100%', position: 'relative' }}>
          <DigitalTwinGraph devices={devices} onNodeSelect={handleSelect} selectedNodeId={selectedDevId} />
        </div>
      </div>
    </div>
  );
}


