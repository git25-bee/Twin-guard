import React, { useState } from 'react';
import { Search, Filter, History, ShieldAlert } from 'lucide-react';

export default function AttackHistory({ attackHistory = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  // Sample initial records if history empty
  const defaultHistory = [
    {
      attack_id: 'ATK-9821',
      attack_type: 'Ransomware',
      target_device: 'Doctor PC',
      severity: 'CRITICAL',
      risk_score: 86,
      timestamp: '2026-08-12 18:45:10',
      status: 'MITIGATED'
    },
    {
      attack_id: 'ATK-9820',
      attack_type: 'DDoS',
      target_device: 'Firewall',
      severity: 'HIGH',
      risk_score: 82,
      timestamp: '2026-08-12 17:30:22',
      status: 'MITIGATED'
    },
    {
      attack_id: 'ATK-9819',
      attack_type: 'SQL Injection',
      target_device: 'Patient Database',
      severity: 'CRITICAL',
      risk_score: 88,
      timestamp: '2026-08-12 16:15:05',
      status: 'MITIGATED'
    }
  ];

  const logs = attackHistory.length > 0 ? attackHistory : defaultHistory;

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.target_device.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.attack_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History color="var(--accent-blue)" size={24} /> Attack & Security Incident History
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Comprehensive audit log stored in MySQL/SQLite database for hospital SOC compliance.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search attack or target..."
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
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '0.45rem 0.75rem',
              color: 'var(--text-main)',
              fontSize: '0.85rem'
            }}
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Attack ID</th>
                <th>Timestamp</th>
                <th>Attack Type</th>
                <th>Target Asset</th>
                <th>Severity</th>
                <th>Peak Risk Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => (
                <tr key={idx}>
                  <td className="font-mono" style={{ color: 'var(--accent-blue)' }}>{log.attack_id}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{log.timestamp}</td>
                  <td style={{ fontWeight: 600 }}>{log.attack_type}</td>
                  <td style={{ fontWeight: 600 }}>{log.target_device}</td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: log.severity === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-orange)',
                      background: log.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(249, 115, 22, 0.15)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {log.severity}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-red)' }}>
                    {log.risk_score}/100
                  </td>
                  <td>
                    <span className={`status-badge ${log.status === 'ACTIVE' ? 'UNDER_ATTACK' : 'DEFENDED'}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
