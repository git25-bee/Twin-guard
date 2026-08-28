import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DeviceModal from './components/DeviceModal';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DigitalTwin from './pages/DigitalTwin';
import LiveNetwork from './pages/LiveNetwork';
import DeviceManagement from './pages/DeviceManagement';
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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('twinguard_auth') === 'true';
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [devices, setDevices] = useState(INITIAL_NODES);
  const [statusData, setStatusData] = useState({});
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [alert, setAlert] = useState(null);
  const [attackHistory, setAttackHistory] = useState([]);

  // Login Handler
  const handleLogin = () => {
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('twinguard_auth');
    localStorage.removeItem('twinguard_user');
    setIsAuthenticated(false);
  };

  // Fetch digital twin status & devices
  const refreshData = async () => {
    if (!isAuthenticated) return;
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
    if (isAuthenticated) {
      refreshData();
      const interval = setInterval(refreshData, 2000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

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
    const confirmed = window.confirm("Are you sure you want to reset the Twin to a clean state?");
    if (!confirmed) return;

    try {
      const res = await api.resetTwin();
      await refreshData();
      setAlert({
        type: 'SUCCESS',
        message: 'Twin reset successfully.',
        details: 'System returned to a clean state with safe parameters and 0 active threats.'
      });
    } catch (err) {
      console.error("Failed to reset Twin:", err);
    }
  };

  // Protect pages: show Login page if unauthenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

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
      case 'admin-devices':
        return (
          <DeviceManagement
            devices={devices}
            onRefresh={refreshData}
          />
        );
      case 'live-network':
        return (
          <LiveNetwork
            devices={devices}
            onTriggerAttack={handleTriggerAttack}
            onTriggerDefense={handleTriggerDefense}
            onRefresh={refreshData}
          />
        );
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
            onRefresh={refreshData}
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
            onTriggerDefense={handleTriggerDefense}
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
        onLogout={handleLogout}
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
