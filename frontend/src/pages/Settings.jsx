import React, { useState } from 'react';
import { Settings as SettingsIcon, Database, Key, Server, RefreshCw } from 'lucide-react';

export default function Settings() {
  const [apiUrl, setApiUrl] = useState('http://localhost:5000/api');
  const [autoDefense, setAutoDefense] = useState(true);
  const [pollingRate, setPollingRate] = useState(2000);
  const [saveToast, setSaveToast] = useState(false);

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SettingsIcon color="var(--text-muted)" size={24} /> System & API Settings
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Configure REST API endpoints, AI Gemini API Keys, and Database Engine parameters.
        </p>
      </div>

      {saveToast && (
        <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--accent-green)', padding: '0.85rem', borderRadius: '6px', color: 'var(--accent-green)', marginBottom: '1.5rem', fontWeight: 600 }}>
          ✓ System settings updated successfully!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Flask Backend API Settings */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={18} color="var(--accent-blue)" /> Flask REST API Config
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Backend REST API Endpoint URL
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontFamily: 'JetBrains Mono, monospace' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Live Digital Twin Polling Frequency
              </label>
              <select
                value={pollingRate}
                onChange={(e) => setPollingRate(Number(e.target.value))}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              >
                <option value={1000}>1000 ms (Fast - Real-time)</option>
                <option value={2000}>2000 ms (Standard Balanced)</option>
                <option value={5000}>5000 ms (Low Bandwidth)</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI & Database Config */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={18} color="var(--accent-purple)" /> AI & Database Mode
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Database Backend Status</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', marginTop: '0.2rem' }}>
                ● MySQL Mode Active (with SQLite Automatic Fallback)
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Google Gemini API Key</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Using Gemini 2.5 Flash / Local ML Heuristic Engine Fallback
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: '0.5rem', fontWeight: 600 }}>
              Save System Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
