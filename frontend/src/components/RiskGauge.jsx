import React from 'react';

export default function RiskGauge({ score = 15, level = "LOW" }) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  // Calculate needle rotation angle (-90deg to +90deg)
  const angle = -90 + (normalizedScore / 100) * 180;

  const getColor = (lvl) => {
    switch (lvl) {
      case 'CRITICAL': return '#EF4444';
      case 'HIGH': return '#F97316';
      case 'MEDIUM': return '#F59E0B';
      default: return '#22C55E';
    }
  };

  const currentColor = getColor(level);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem 0' }}>
      <svg width="220" height="120" viewBox="0 0 200 110">
        {/* Background Arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="18"
          strokeLinecap="round"
        />

        {/* Low Segment (0-30) */}
        <path
          d="M 20 100 A 80 80 0 0 1 60 38"
          fill="none"
          stroke="#22C55E"
          strokeWidth="14"
          opacity="0.85"
        />
        {/* Medium Segment (30-60) */}
        <path
          d="M 60 38 A 80 80 0 0 1 100 20"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="14"
          opacity="0.85"
        />
        {/* High Segment (60-80) */}
        <path
          d="M 100 20 A 80 80 0 0 1 140 38"
          fill="none"
          stroke="#F97316"
          strokeWidth="14"
          opacity="0.85"
        />
        {/* Critical Segment (80-100) */}
        <path
          d="M 140 38 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#EF4444"
          strokeWidth="14"
          opacity="0.85"
        />

        {/* Needle */}
        <g transform={`rotate(${angle}, 100, 100)`}>
          <line x1="100" y1="100" x2="100" y2="35" stroke={currentColor} strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="100" r="8" fill={currentColor} />
        </g>
      </svg>

      <div style={{ textAlign: 'center', marginTop: '-0.5rem' }}>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: currentColor }}>
          {normalizedScore}
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
        </div>
        <div style={{
          display: 'inline-block',
          marginTop: '0.2rem',
          padding: '0.2rem 0.75rem',
          borderRadius: '12px',
          background: `${currentColor}15`,
          color: currentColor,
          fontSize: '0.75rem',
          fontWeight: 700,
          border: `1px solid ${currentColor}33`
        }}>
          RISK LEVEL: {level}
        </div>
      </div>
    </div>
  );
}
