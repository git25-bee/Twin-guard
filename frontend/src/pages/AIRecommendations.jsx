import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle, ShieldAlert, Sparkles, ArrowRight, Eye } from 'lucide-react';
import { api } from '../services/api';

export default function AIRecommendations({ devices = [], onApplyRecommendation }) {
  const [targetDevice, setTargetDevice] = useState('Hospital Server');
  const [attackType, setAttackType] = useState('Ransomware');
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState(null);

  const fetchAI = async () => {
    setLoading(true);
    try {
      const data = await api.getAIRecommendation(targetDevice, attackType);
      setAiData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAI();
  }, [targetDevice, attackType]);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Brain color="var(--accent-purple)" size={24} /> AI Security Recommendation Engine
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Powered by Google Gemini 2.5 API with Scikit-learn Heuristic Fallback for SOC Cyber Defense.
        </p>
      </div>

      {/* Target Threat Selection Bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Target Asset
            </label>
            <select
              value={targetDevice}
              onChange={(e) => setTargetDevice(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
            >
              {devices.map((d) => (
                <option key={d.id} value={d.name}>{d.name} ({d.device_type})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Detected Threat Signature
            </label>
            <select
              value={attackType}
              onChange={(e) => setAttackType(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
            >
              <option value="Ransomware">Ransomware</option>
              <option value="DDoS">DDoS Volumetric</option>
              <option value="SQL Injection">SQL Injection</option>
              <option value="Malware">Zero-Day Malware</option>
              <option value="Insider Threat">Insider Threat</option>
              <option value="Phishing">Phishing</option>
            </select>
          </div>

          <button
            className="btn btn-primary"
            style={{ marginTop: '1.25rem' }}
            onClick={fetchAI}
            disabled={loading}
          >
            <Sparkles size={16} /> {loading ? 'Analyzing...' : 'Generate AI Advice'}
          </button>
        </div>
      </div>

      {/* AI Recommendation Output Card */}
      {aiData && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Main AI Analysis */}
          <div className="card" style={{ borderLeft: '5px solid var(--accent-purple)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="brand-badge" style={{ background: 'var(--accent-purple)' }}>GEMINI AI ADVICE</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Target: {targetDevice}</span>
              </div>
              <div style={{
                background: 'rgba(139, 92, 246, 0.15)',
                color: 'var(--accent-purple)',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}>
                Confidence: {aiData.confidence}%
              </div>
            </div>

            {/* Recommendation Box */}
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                AI Recommended Defense Action
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-blue)', lineHeight: 1.4 }}>
                {aiData.recommendation}
              </div>
            </div>

            {/* Rationale & Threat Prediction */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Root Cause Rationale
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {aiData.reason}
              </p>
            </div>

            {aiData.threat_prediction && (
              <div style={{ marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.85rem', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-red)', textTransform: 'uppercase' }}>
                  Threat Impact Prediction
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {aiData.threat_prediction}
                </div>
              </div>
            )}

            {/* Defense Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.25rem', fontWeight: 700 }}
                onClick={() => onApplyRecommendation(targetDevice, aiData.action_code || 'ISOLATE_DEVICE')}
              >
                <CheckCircle size={16} /> Apply AI Recommendation
              </button>
              <button className="btn btn-outline">
                <Eye size={16} /> View Explanation
              </button>
            </div>
          </div>

          {/* Defense Strategy Comparison Table */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Defense Option Comparison</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {(aiData.defense_comparison || []).map((opt, idx) => (
                <div
                  key={idx}
                  style={{
                    background: idx === 0 ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-primary)',
                    border: `1px solid ${idx === 0 ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                    borderRadius: '8px',
                    padding: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{opt.action}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                      {opt.effectiveness}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {opt.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
