import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'var(--accent-blue)', subtitle }) {
  return (
    <div className="card">
      <div className="card-title">
        <span>{title}</span>
        {Icon && <Icon size={20} color={color} />}
      </div>
      <div className="card-value" style={{ color: color }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
