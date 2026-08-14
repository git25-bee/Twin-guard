import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck, X } from 'lucide-react';

export default function AlertBanner({ alert, onClose }) {
  if (!alert) return null;

  const isSuccess = alert.type === 'SUCCESS';

  return (
    <div className={`alert-banner ${isSuccess ? 'success' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {isSuccess ? (
          <CheckCircle2 size={24} color="var(--accent-green)" />
        ) : (
          <AlertTriangle size={24} color="var(--accent-red)" />
        )}
        <div>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: isSuccess ? 'var(--accent-green)' : 'var(--accent-red)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {isSuccess ? '✓ THREAT MITIGATED' : '⚠ SECURITY ALERT'}
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.15rem' }}>
            {alert.message}
          </div>
          {alert.details && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              {alert.details}
            </div>
          )}
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
