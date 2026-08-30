import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DeviceModal from './components/DeviceModal';
import Login from './pages/Login';
import DigitalTwin from './pages/DigitalTwin';
import DeviceManagement from './pages/DeviceManagement';
import AttackDefense from './pages/AttackDefense';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { api } from './services/api';
import { INITIAL_NODES } from './data/initialNodes';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('twinguard_auth') === 'true';
  });

  const [activeTab, setActiveTab] = useState('digital-twin');
  const [devices, setDevices] = useState(INITIAL_NODES);
  const [statusData, setStatusData] = useState({});
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [alert, setAlert] = useState(null);

  // Login Handler
  const handleLogin = () => {
    setIsAuthenticated(true);
    setActiveTab('digital-twin');
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('twinguard_auth');
    localStorage.removeItem('twinguard_user');
    setIsAuthenticated(false);
  };

  const isFetchingRef = React.useRef(false);

  // Fetch digital twin status & devices
  const refreshData = async () => {
    if (!isAuthenticated || isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const devList = await api.getDevices();
      if (devList && Array.isArray(devList) && devList.length > 0) {
        setDevices([...devList]);
      }
      const status = await api.getStatus();
      if (status) {
        setStatusData(status);
      }
    } catch (err) {
      console.error(err);
    } finally {
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
      const interval = setInterval(refreshData, 2500);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

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

  // Reset Environment Handler
  const handleReset = async () => {
    const confirmed = window.confirm("Are you sure you want to reset the Twin to a clean baseline state?");
    if (!confirmed) return;

    try {
      await api.resetTwin();
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
      case 'device-management':
        return (
          <DeviceManagement
            devices={devices}
            onRefresh={refreshData}
          />
        );
      case 'attack-defense':
        return (
          <AttackDefense
            devices={devices}
            statusData={statusData}
            onRefresh={refreshData}
            onReset={handleReset}
          />
        );
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <DigitalTwin
            devices={devices}
            onNodeSelect={(dev) => setSelectedDevice(dev)}
            onIsolate={(target) => handleTriggerDefense(target, 'ISOLATE_DEVICE')}
            onMonitor={(target) => handleTriggerDefense(target, 'UNDER_MONITORING')}
            onMarkSafe={(target) => handleTriggerDefense(target, 'MARK_SAFE')}
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
