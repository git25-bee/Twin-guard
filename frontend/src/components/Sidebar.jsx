import React from 'react';
import {
  LayoutDashboard,
  Network,
  Server,
  Zap,
  Shield,
  Activity,
  Brain,
  History,
  FileText,
  Settings as SettingsIcon,
  Radio
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'digital-twin', label: 'Digital Twin', icon: Network },
    { id: 'admin-devices', label: 'Device Management', icon: Server },
    { id: 'live-network', label: 'Live Network', icon: Radio },
    { id: 'attack-sim', label: 'Attack Simulation', icon: Zap },
    { id: 'defense-center', label: 'Defense Center', icon: Shield },
    { id: 'risk-analysis', label: 'Risk Analysis', icon: Activity },
    { id: 'ai-recommendations', label: 'AI Recommendations', icon: Brain },
    { id: 'attack-history', label: 'Attack History', icon: History },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="sidebar-container">
      <div style={{ padding: '0 1.5rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        TwinGuard Navigation
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
      
      <div style={{ marginTop: 'auto', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>TwinGuard SOC v1.0</div>
        <div>Enterprise Cyber Defense</div>
      </div>
    </aside>
  );
}
