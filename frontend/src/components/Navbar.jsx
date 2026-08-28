import React from 'react';
import { ShieldAlert, RefreshCw, Activity, LogOut } from 'lucide-react';

export default function Navbar({ overallRisk, riskLevel, onReset, activeAttacksCount, onLogout }) {
  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'var(--accent-red)';
      case 'HIGH': return 'var(--accent-orange)';
      case 'MEDIUM': return 'var(--accent-yellow)';
      default: return 'var(--accent-green)';
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <ShieldAlert size={26} color="var(--accent-blue)" />
        <div>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            TwinGuard
          </span>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>
            Smart Hospital Cybersecurity Digital Twin
          </div>
        </div>
        <span className="brand-badge" style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' }}>ENTERPRISE SOC</span>
      </div>

      <div className="navbar-actions">
        {/* Risk Pill Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          background: '#F8FAFC',
          padding: '0.4rem 0.8rem',
          borderRadius: '20px',
          border: `1px solid ${getRiskColor(riskLevel)}`
        }}>
          <Activity size={16} color={getRiskColor(riskLevel)} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hospital Risk:</span>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: getRiskColor(riskLevel) }}>
            {overallRisk}/100 ({riskLevel})
          </span>
        </div>

        {/* Active Threats Indicator */}
        {activeAttacksCount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#FEF2F2',
            color: 'var(--accent-red)',
            padding: '0.4rem 0.8rem',
            borderRadius: '20px',
            border: '1px solid #FCA5A5',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-red)', display: 'inline-block', animation: 'pulse-red 1s infinite' }}></span>
            {activeAttacksCount} THREATS ACTIVE
          </div>
        )}

        {/* Reset Button */}
        <button className="btn btn-outline" onClick={onReset} title="Reset all devices to Safe state">
          <RefreshCw size={14} /> Reset Twin
        </button>

        {/* Logout Button */}
        {onLogout && (
          <button className="btn btn-outline" onClick={onLogout} title="Sign Out of TwinGuard SOC" style={{ color: '#DC2626', borderColor: '#FECACA', backgroundColor: '#FEF2F2' }}>
            <LogOut size={14} color="#DC2626" /> Logout
          </button>
        )}
      </div>
    </header>
  );
}
