import React, { useState, useEffect } from 'react';
import { Search, History, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function AttackHistory({ attackHistory = [], onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [dbLogs, setDbLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAttackHistory = async () => {
    setLoading(true);
    try {
      const logs = await api.getAttacks();
      setDbLogs(logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttackHistory();
  }, [attackHistory]);

  const logs = dbLogs.length > 0 ? dbLogs : attackHistory;

  const filteredLogs = logs.filter((log) => {
    const target = (log.target_device || log.target || '').toLowerCase();
    const type = (log.attack_type || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = target.includes(query) || type.includes(query);
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
            Comprehensive security audit history loaded dynamically from Firebase Cloud Firestore.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }} onClick={fetchAttackHistory} disabled={loading}>
            <RefreshCw size={14} /> Refresh Logs
          </button>

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
                <tr key={log.attack_id || idx}>
                  <td className="font-mono" style={{ color: 'var(--accent-blue)' }}>{log.attack_id}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{log.timestamp}</td>
                  <td style={{ fontWeight: 600 }}>{log.attack_type}</td>
                  <td style={{ fontWeight: 600 }}>{log.target_device || log.target}</td>
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
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No attack incident records found in database. Launch a simulation to record events.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
