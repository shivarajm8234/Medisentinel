import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ThreatLog from './components/ThreatLog';
import { useStore } from './useStore';
import { Package } from 'lucide-react';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const { devices, alerts } = useStore();

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'endpoints':
        return (
          <div className="main-content">
            <h1 className="page-title" style={{ marginBottom: '16px' }}>IoT Endpoints</h1>
            <div className="glass-panel" style={{ padding: '24px' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {devices.map(d => (
                    <div key={d.device_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <Package size={24} color={d.status === 'active' ? 'var(--color-primary)' : 'var(--color-accent)'} />
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{d.device_id}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Type: {d.device_type}</div>
                          </div>
                       </div>
                       <div>
                          <span className={`live-badge`} style={{ color: d.status === 'active' ? 'var(--color-success)' : 'var(--color-accent)' }}>
                            {d.status.toUpperCase()}
                          </span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        );
      case 'threats':
        return (
           <div className="main-content">
             <h1 className="page-title" style={{ marginBottom: '16px' }}>Full Threat Log</h1>
             <ThreatLog alerts={alerts} />
           </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      {renderView()}
    </div>
  );
}

export default App;
