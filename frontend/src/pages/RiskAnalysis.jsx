import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import RiskGauge from '../components/RiskGauge';
import { Activity, ShieldAlert, AlertTriangle, Cpu } from 'lucide-react';

export default function RiskAnalysis({ devices = [], statusData = {} }) {
  const overallRisk = statusData.overall_risk_score ?? statusData.hospital_risk_score ?? 15;
  const riskLevel = statusData.risk_level || statusData.hospital_risk_level || "LOW";


  // Data for device risk comparison bar chart
  const deviceRiskData = devices.map(d => ({
    name: d.name.replace(' Machine', '').replace(' System', ''),
    risk: d.risk_score || 15,
    cpu: d.cpu_usage || 20
  }));

  // Timeline risk trend mock data
  const trendData = [
    { time: '10:00', risk: 15 },
    { time: '10:05', risk: 18 },
    { time: '10:10', risk: 14 },
    { time: '10:15', risk: overallRisk > 50 ? 86 : 22 },
    { time: '10:20', risk: overallRisk > 50 ? 42 : 19 },
    { time: '10:25', risk: overallRisk }
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Hospital Risk Analysis Engine</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Real-time dynamic risk calculation based on asset criticality, attack vector severity, and network traffic dynamics.
        </p>
      </div>

      {/* Top Split: Risk Gauge + Risk Level Legend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Risk Gauge Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Overall Hospital Risk Gauge</h3>
          <RiskGauge score={overallRisk} level={riskLevel} />
        </div>

        {/* Risk Breakdown & Threshold Definition */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Risk Score Threshold Classification</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ color: '#15803D', fontWeight: 700, fontSize: '0.85rem' }}>0 – 30 : LOW RISK</div>
              <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '0.2rem' }}>
                All systems normal. Routine background monitoring active.
              </div>
            </div>

            <div style={{ background: '#FEF3C7', border: '1px solid #FDE047', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ color: '#B45309', fontWeight: 700, fontSize: '0.85rem' }}>31 – 60 : MEDIUM RISK</div>
              <div style={{ fontSize: '0.75rem', color: '#92400E', marginTop: '0.2rem' }}>
                Anomalous traffic spikes or suspicious connection attempts detected.
              </div>
            </div>

            <div style={{ background: '#FFEDD5', border: '1px solid #FDBA74', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ color: '#C2410C', fontWeight: 700, fontSize: '0.85rem' }}>61 – 80 : HIGH RISK</div>
              <div style={{ fontSize: '0.75rem', color: '#9A3412', marginTop: '0.2rem' }}>
                Active malicious payload execution or volumetric DDoS traffic.
              </div>
            </div>

            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ color: '#B91C1C', fontWeight: 700, fontSize: '0.85rem' }}>81 – 100 : CRITICAL RISK</div>
              <div style={{ fontSize: '0.75rem', color: '#991B1B', marginTop: '0.2rem' }}>
                Severe attack threatening Patient Database or core hospital server.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Device Risk Bar Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Device Risk Score Comparison</h3>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer>
              <BarChart data={deviceRiskData}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ background: '#FFFFFF', borderColor: '#E2E8F0', color: '#1E293B', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="risk" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Trend Line Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Hospital Overall Risk Timeline Trend</h3>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ background: '#FFFFFF', borderColor: '#E2E8F0', color: '#1E293B', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="risk" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
