import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DeviceModal from './components/DeviceModal';
import Dashboard from './pages/Dashboard';
import DigitalTwin from './pages/DigitalTwin';
import AttackSimulation from './pages/AttackSimulation';
import DefenseCenter from './pages/DefenseCenter';
import RiskAnalysis from './pages/RiskAnalysis';
import AIRecommendations from './pages/AIRecommendations';
import AttackHistory from './pages/AttackHistory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { api } from './services/api';
import { INITIAL_NODES } from './data/initialNodes';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [devices, setDevices] = useState(INITIAL_NODES);
  const [statusData, setStatusData] = useState({});
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [alert, setAlert] = useState(null);
  const [attackHistory, setAttackHistory] = useState([]);

  // Fetch digital twin status & devices
  const refreshData = async () => {
    try {
      const devList = await api.getDevices();
      setDevices([...devList]);
      const status = await api.getStatus();
      setStatusData(status);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Attack Trigger Handler
  const handleTriggerAttack = async (attackType, targetName, severity = 'HIGH') => {
    try {
      const res = await api.triggerAttack(attackType, targetName, severity);
      await refreshData();

      setAlert({
        type: 'ATTACK',
        message: `${attackType} detected on ${targetName}!`,
        details: `Severity: ${severity} • Device Risk: ${res.device?.risk_score || 86}/100`
      });

      // Update history
      if (res.attack) {
        setAttackHistory(prev => [res.attack, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Defense Trigger Handler
  const handleTriggerDefense = async (targetName, actionCode = 'ISOLATE_DEVICE') => {
    try {
      const res = await api.triggerDefense(targetName, actionCode);
      await refreshData();

      setAlert({
        type: 'SUCCESS',
        message: `${targetName} ${actionCode === 'ISOLATE_DEVICE' ? 'isolated' : 'defended'} successfully.`,
        details: `Action: ${res.defense?.action || actionCode} • Device Risk reduced`
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Apply AI Recommendation directly
  const handleApplyAIRecommendation = async (targetName, actionCode) => {
    await handleTriggerDefense(targetName, actionCode);
  };

  // Reset Environment Handler
  const handleReset = async () => {
    await api.resetTwin();
    await refreshData();
    setAlert({
      type: 'SUCCESS',
      message: 'Digital Twin environment reset to SAFE state.',
      details: 'All 12 nodes initialized to green safe parameters.'
    });
  };

  // Render current tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            devices={devices}
            statusData={statusData}
            alert={alert}
            onNodeSelect={(dev) => setSelectedDevice(dev)}
            onQuickAttack={handleTriggerAttack}
          />
        );
      case 'digital-twin':
        return (
          <DigitalTwin
            devices={devices}
            onNodeSelect={(dev) => setSelectedDevice(dev)}
            onIsolate={(target) => handleTriggerDefense(target, 'ISOLATE_DEVICE')}
            onMonitor={(target) => handleTriggerDefense(target, 'UNDER_MONITORING')}
            onMarkSafe={(target) => handleTriggerDefense(target, 'MARK_SAFE')}
          />
        );
      case 'live-network':
      case 'attack-sim':
        return (
          <AttackSimulation
            devices={devices}
            onTriggerAttack={handleTriggerAttack}
          />
        );
      case 'defense-center':
        return (
          <DefenseCenter
            devices={devices}
            onTriggerDefense={handleTriggerDefense}
            onReset={handleReset}
          />
        );
      case 'risk-analysis':
        return (
          <RiskAnalysis
            devices={devices}
            statusData={statusData}
          />
        );
      case 'ai-recommendations':
        return (
          <AIRecommendations
            devices={devices}
            onApplyRecommendation={handleApplyAIRecommendation}
          />
        );
      case 'attack-history':
        return (
          <AttackHistory
            attackHistory={attackHistory}
          />
        );
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <Dashboard
            devices={devices}
            statusData={statusData}
            alert={alert}
            onNodeSelect={(dev) => setSelectedDevice(dev)}
            onQuickAttack={handleTriggerAttack}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Navbar
        overallRisk={statusData.overall_risk_score || 15}
        riskLevel={statusData.risk_level || 'LOW'}
        onReset={handleReset}
        activeAttacksCount={statusData.under_attack_devices || 0}
      />

      <div className="main-content-wrapper">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="page-container">
          {renderContent()}
        </main>
      </div>

      {/* Interactive Device Modal */}
      {selectedDevice && (
        <DeviceModal
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
          onIsolate={(target) => handleTriggerDefense(target, 'ISOLATE_DEVICE')}
          onMonitor={(target) => handleTriggerDefense(target, 'UNDER_MONITORING')}
          onMarkSafe={(target) => handleTriggerDefense(target, 'MARK_SAFE')}
        />
      )}
    </div>
  );
}
