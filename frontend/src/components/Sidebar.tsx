import React from 'react';
import { Shield, Activity, HardDrive, AlertTriangle, ShieldAlert, Cpu, Settings } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="sidebar">
      <div className="logo-container">
        <ShieldAlert size={36} className="logo-icon" />
        <span className="logo-text">MediSentinel</span>
      </div>
      
      <div className="nav-menu" style={{ marginTop: '20px' }}>
        <button onClick={() => setActiveView('dashboard')} className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer' }}>
          <Activity size={20} />
          <span>Dashboard</span>
        </button>
        <button onClick={() => setActiveView('endpoints')} className={`nav-item ${activeView === 'endpoints' ? 'active' : ''}`} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer' }}>
          <HardDrive size={20} />
          <span>IoT Endpoints</span>
        </button>
        <button onClick={() => setActiveView('threats')} className={`nav-item ${activeView === 'threats' ? 'active' : ''}`} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer' }}>
          <AlertTriangle size={20} />
          <span>Threat Log</span>
        </button>
        <button className="nav-item" style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer' }}>
          <Shield size={20} />
          <span>Response Sandbox</span>
        </button>
        <button className="nav-item" style={{ marginTop: 'auto', background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer' }}>
          <Settings size={20} />
          <span>System Config</span>
        </button>
      </div>
      
      <div className="glass-panel" style={{ padding: '20px', marginTop: 'auto', background: 'rgba(0,0,0,0.4)', textAlign: 'center', borderRadius: '12px', border: '1px solid rgba(0, 243, 255, 0.1)' }}>
        <Cpu size={24} color="var(--color-primary)" style={{ marginBottom: '8px' }} />
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI Engines Online</p>
        <p style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.9rem' }}>Isolation Forest & LSTM Active</p>
      </div>
    </nav>
  );
};

export default Sidebar;
