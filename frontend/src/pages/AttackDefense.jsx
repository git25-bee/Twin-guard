import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  ShieldAlert,
  Zap,
  Bot,
  Play,
  Pause,
  RefreshCw,
  Lock,
  CheckCircle,
  AlertTriangle,
  Radio,
  Cpu,
  Activity,
  Database,
  Download
} from 'lucide-react';
import { api } from '../services/api';
import { exportWordDocument } from '../utils/exportDocx';


export const getDeviceEmoji = (dev) => {
  const name = (dev?.name || '').toLowerCase();
  const id = (dev?.id || '').toLowerCase();
  const type = (dev?.device_type || '').toLowerCase();

  if (name.includes('pc') || name.includes('workstation') || type.includes('staff') || id.includes('pc')) return '💻';
  if (name.includes('server') || id.includes('server')) return '🖥️';
  if (name.includes('firewall') || type.includes('perimeter') || id.includes('firewall')) return '🧱';
  if (name.includes('database') || name.includes('db') || type.includes('db')) return '🗄️';
  if (name.includes('ehr') || type.includes('ehr')) return '📋';
  if (name.includes('ventilator')) return '🫁';
  if (name.includes('ecg') || type.includes('cardiology')) return '🫀';
  if (name.includes('pump') || name.includes('infusion')) return '💉';
  if (name.includes('icu') || name.includes('monitor') || name.includes('bedside')) return '🩺';
  if (name.includes('pharmacy')) return '💊';
  if (name.includes('internet') || name.includes('gateway') || id.includes('internet')) return '🌐';
  return '💻';
};

export default function AttackDefense({ devices = [], statusData = {}, onRefresh, onReset }) {
  const [isAiRunning, setIsAiRunning] = useState(true);
  const [speedMs, setSpeedMs] = useState(4000);
  const [aiLogs, setAiLogs] = useState([]);
  const [redTeamCount, setRedTeamCount] = useState(0);
  const [blueTeamCount, setBlueTeamCount] = useState(0);
  const [lastAgentEvent, setLastAgentEvent] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState('');
  const [manualAttackType, setManualAttackType] = useState('Ransomware');

  const [completedRounds, setCompletedRounds] = useState([]);
  const [lastCompletedRound, setLastCompletedRound] = useState(null);

  const logsContainerRef = useRef(null);

  // Auto-scroll AI logs
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = 0;
    }
  }, [aiLogs]);

  // Execute single step of AI Red/Blue Agent
  const runAiAgentStep = async () => {
    try {
      const stepRes = await api.triggerAIAgentStep();
      if (stepRes && stepRes.status === 'success') {
        setLastAgentEvent(stepRes);
        if (stepRes.agent_type === 'RED_TEAM') {
          setRedTeamCount(prev => prev + 1);
        } else {
          setBlueTeamCount(prev => prev + 1);
        }

        if (stepRes.round_completed) {
          setLastCompletedRound(stepRes.round_completed);
          setCompletedRounds(prev => [stepRes.round_completed, ...prev]);
        }

        const newLog = {
          id: Date.now(),
          agent_type: stepRes.agent_type,
          action: stepRes.action,
          target: stepRes.target_device,
          reasoning: stepRes.reasoning,
          timestamp: stepRes.timestamp || new Date().toLocaleTimeString(),
          ai_rec: stepRes.ai_recommendation,
          round_completed: stepRes.round_completed
        };

        setAiLogs(prev => [newLog, ...prev.slice(0, 49)]);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("AI Agent step error:", err);
    }
  };


  // Continuous AI Agent Loop Timer
  useEffect(() => {
    let interval = null;
    if (isAiRunning) {
      interval = setInterval(() => {
        runAiAgentStep();
      }, speedMs);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAiRunning, speedMs]);

  // Manual Trigger Handler (Overrides)
  const handleManualAttack = async () => {
    const target = selectedTarget || (devices[0]?.name || 'Core Hospital Server');
    try {
      await api.simulateAttack(manualAttackType, target, 'CRITICAL');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualDefense = async (targetName, actionCode) => {
    try {
      await api.triggerDefense(targetName, actionCode);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const underAttackCount = devices.filter(d => d.status === 'UNDER_ATTACK').length;
  const defendedCount = devices.filter(d => d.status === 'DEFENDED' || d.status === 'ISOLATED' || d.status === 'SAFE').length;

  return (
    <div>
      {/* Header & AI Agent Controller Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #ef4444 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bot size={28} color="#3b82f6" /> AI Agent Attack & Defense Command Center
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Autonomous AI Red-Team (Attack Generator) vs Blue-Team (MITRE D3FEND Countermeasures) Simulation Loop
          </p>
        </div>

        {/* AI Autonomous Simulation Engine Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: isAiRunning ? '#22c55e' : '#f59e0b' }} className={isAiRunning ? 'pulse-green' : ''}></span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              AI Autonomous Agent: {isAiRunning ? 'ACTIVE' : 'PAUSED'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Speed:</label>
            <select
              value={speedMs}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
              style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
            >
              <option value={2000}>Fast (2s)</option>
              <option value={4000}>Normal (4s)</option>
              <option value={7000}>Slow (7s)</option>
            </select>
          </div>

          <button
            className={`btn ${isAiRunning ? 'btn-secondary' : 'btn-primary'}`}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            onClick={() => setIsAiRunning(!isAiRunning)}
          >
            {isAiRunning ? <Pause size={14} /> : <Play size={14} />}
            {isAiRunning ? 'PAUSE AI' : 'START AI'}
          </button>

          <button
            className="btn btn-outline"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            onClick={runAiAgentStep}
            title="Execute single step"
          >
            Step ➔
          </button>
        </div>
      </div>

      {/* Round Completion Toast Banner */}
      {lastCompletedRound && (
        <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', padding: '0.85rem 1.25rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🏆</span>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                AI Battle Round {lastCompletedRound.round_number} COMPLETED & NEUTRALIZED!
              </div>
              <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>
                Target: <strong>{lastCompletedRound.target_device}</strong> • Threat: <strong>{lastCompletedRound.threat_simulated}</strong> ➔ Mitigated via <strong>{lastCompletedRound.defense_applied}</strong>
              </div>
            </div>
          </div>

          <span style={{ fontSize: '0.72rem', background: 'rgba(255, 255, 255, 0.2)', padding: '0.35rem 0.6rem', borderRadius: '6px', fontWeight: 700 }}>
            {lastCompletedRound.timestamp}
          </span>
        </div>
      )}



      {/* Dynamic Telemetry Metric Cards */}
      <div className="grid-cards" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Zap size={15} color="var(--accent-red)" /> AI Red Attacks
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-red)', marginTop: '0.25rem' }}>
            {redTeamCount} Executed
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
            {underAttackCount} active threats
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Shield size={15} color="var(--accent-blue)" /> AI Blue Defenses
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '0.25rem' }}>
            {blueTeamCount} Mitigations
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
            {defendedCount} devices safe/isolated
          </div>
        </div>

        <div className="card" style={{ border: completedRounds.length > 0 ? '1px solid var(--accent-green)' : 'var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle size={15} color="var(--accent-green)" /> Battle Rounds
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: '0.25rem' }}>
            {completedRounds.length} Completed
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
            Fully neutralized cycles
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Activity size={15} color="var(--accent-purple)" /> Hospital Risk
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: (statusData.overall_risk_score || 15) > 60 ? 'var(--accent-red)' : (statusData.overall_risk_score || 15) > 30 ? 'var(--accent-orange)' : 'var(--accent-green)', marginTop: '0.25rem' }}>
            {statusData.overall_risk_score || 15}/100 ({statusData.risk_level || 'LOW'})
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
            Weighted risk score
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Bot size={15} color="var(--accent-green)" /> Mean Response
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: '0.25rem' }}>
            320 ms
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
            AI autonomous latency
          </div>
        </div>
      </div>


      {/* Main Grid: AI Reasoning Log Feed (Left) & Manual Control / AI Telemetry (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Left: AI Agent Decision Stream & Reasoning Feed */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '440px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Bot size={18} color="var(--accent-blue)" /> Live AI Agent Thinking & Action Stream
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
              {aiLogs.length} events logged
            </span>
          </div>

          <div ref={logsContainerRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingRight: '0.3rem' }}>
            {aiLogs.length > 0 ? (
              aiLogs.map((log) => {
                const isRed = log.agent_type === 'RED_TEAM';
                return (
                  <div
                    key={log.id}
                    style={{
                      background: isRed ? 'rgba(239, 68, 68, 0.05)' : 'rgba(59, 130, 246, 0.05)',
                      border: '1px solid ' + (isRed ? 'rgba(239, 68, 68, 0.25)' : 'rgba(59, 130, 246, 0.25)'),
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isRed ? 'var(--accent-red)' : 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {isRed ? <Zap size={13} /> : <Shield size={13} />}
                        {isRed ? 'AI RED-TEAM AGENT' : 'AI BLUE-TEAM AGENT'}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{log.timestamp}</span>
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.3rem' }}>
                      Target: {log.target} • {log.action}
                    </div>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: '1.3' }}>
                      {log.reasoning}
                    </p>

                    {log.ai_rec?.recommendation && (
                      <div style={{ fontSize: '0.73rem', background: '#ffffff', padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', marginTop: '0.4rem', color: '#1e293b' }}>
                        <strong>AI Rec:</strong> {log.ai_rec.recommendation}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Bot size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <div>AI Agent loop is starting...</div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Automated Red-Team and Blue-Team actions will stream here live.</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Agent Configuration & Quick Override Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '440px' }}>
          
          {/* Last Agent Action Card */}
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                Latest AI Agent Decision Details
              </h3>
              {lastAgentEvent ? (
                <div style={{ fontSize: '0.82rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 700, color: lastAgentEvent.agent_type === 'RED_TEAM' ? 'var(--accent-red)' : 'var(--accent-blue)' }}>
                      {lastAgentEvent.agent_type === 'RED_TEAM' ? '🔴 AI Red-Team (Attack)' : '🔵 AI Blue-Team (Defense)'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{lastAgentEvent.timestamp}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                    {lastAgentEvent.target_device}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.4 }}>
                    {lastAgentEvent.reasoning}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '1rem 0' }}>
                  Waiting for initial AI Agent step execution...
                </div>
              )}
            </div>

            {/* Quick Override Trigger */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Manual AI Agent Direct Override
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <select
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                >
                  {devices.map(d => (
                    <option key={d.id} value={d.name}>{getDeviceEmoji(d)} {d.name} ({d.status})</option>
                  ))}
                </select>

                <select
                  value={manualAttackType}
                  onChange={(e) => setManualAttackType(e.target.value)}
                  style={{ width: '130px', padding: '0.4rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                >
                  <option value="Ransomware">Ransomware</option>
                  <option value="DDoS">DDoS</option>
                  <option value="SQL Injection">SQL Injection</option>
                  <option value="Phishing">Phishing</option>
                  <option value="Zero-Day Malware">Zero-Day Malware</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-outline" style={{ flex: 1, fontSize: '0.8rem', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }} onClick={handleManualAttack}>
                  <Zap size={14} /> Inject Threat
                </button>
                <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.8rem' }} onClick={() => handleManualDefense(selectedTarget || (devices[0]?.name), 'ISOLATE_DEVICE')}>
                  <Shield size={14} /> Force Defend
                </button>
                <button className="btn btn-success" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={onReset} title="Reset Baseline">
                  <RefreshCw size={14} /> Reset
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Dynamic Hospital Asset Threat & Defense Status Matrix */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
              Live Hospital Device Threat & AI Countermeasure Matrix
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Real-time monitoring of all 12 digital twin endpoints with device icon logos and AI agent mitigations.
            </p>
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }} onClick={onRefresh}>
            <RefreshCw size={13} /> Refresh Topology Data
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Device Logo & Name</th>
                <th>Department</th>
                <th>Current Status</th>
                <th>Risk Index</th>
                <th>Active Threat</th>
                <th>Applied AI Defense</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((dev) => {
                const emoji = getDeviceEmoji(dev);
                return (
                  <tr key={dev.id}>
                    <td style={{ fontWeight: 700 }}>
                      <span style={{ fontSize: '1.2rem', marginRight: '0.4rem' }}>{emoji}</span>
                      {dev.name}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{dev.hospital_department || 'General Hospital'}</td>
                    <td>
                      <span className={`status-badge ${dev.status}`}>{dev.status}</span>
                    </td>
                    <td style={{ fontWeight: 800, color: dev.risk_score > 70 ? 'var(--accent-red)' : dev.risk_score > 40 ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
                      {dev.risk_score}/100
                    </td>
                    <td style={{ color: dev.detected_threat !== 'None' ? 'var(--accent-red)' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>
                      {dev.detected_threat}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                      {dev.defense_action || (dev.status === 'ISOLATED' ? 'D3-AHD Air-Gap Hardware Isolation' : dev.status === 'DEFENDED' ? 'D3-WPS WAF SPI Packet Scrubbing' : 'D3-VSA Safety Baseline Audit')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
                          onClick={() => handleManualDefense(dev.name, 'ISOLATE_DEVICE')}
                          title="Apply Air-Gap Isolation"
                        >
                          <Lock size={11} /> Isolate
                        </button>
                        <button
                          className="btn btn-success"
                          style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
                          onClick={() => handleManualDefense(dev.name, 'MARK_SAFE')}
                          title="Mark Verified Safe"
                        >
                          <CheckCircle size={11} /> Safe
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
