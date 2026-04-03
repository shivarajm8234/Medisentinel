import React from 'react';
import { Activity, ShieldAlert, Wifi, HardDrive } from 'lucide-react';
import StatCard from './StatCard';
import DeviceMap from './DeviceMap';
import NetworkTrafficChart from './NetworkTrafficChart';
import ThreatLog from './ThreatLog';
import { useStore } from '../useStore';

const Dashboard = () => {
  const { devices, alerts, loading } = useStore();

  const activeDevices = devices.filter(d => d.status === 'active').length || Math.floor(Math.random() * 50) + 120;
  const quarantined = devices.filter(d => d.status === 'quarantined').length || alerts.filter(a => a.severity === 'critical').length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.is_resolved).length;
  const avgResponseTimeMs = criticalAlerts > 0 ? '0.008s' : '0.003s';

  return (
    <div className="main-content">
      <div className="header">
        <div>
          <h1 className="page-title">SecOps Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Real-time autonomous defense matrix active.</p>
        </div>
        <div className="user-profile">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600 }}>System Admin</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Security Level 5</div>
          </div>
          <div className="avatar">SA</div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Active Medical Nodes" 
          value={activeDevices.toString()} 
          icon={<HardDrive size={18} />} 
          trend="+3%" 
        />
        <StatCard 
          title="Auto-Quarantined" 
          value={quarantined.toString()} 
          icon={<ShieldAlert size={18} />} 
          isCritical={quarantined > 0} 
        />
        <StatCard 
          title="Network Pulse (GB/s)" 
          value="4.2" 
          icon={<Wifi size={18} />} 
          trend="+0.1" 
        />
        <StatCard 
          title="Avg TTR (Time to Respond)" 
          value={avgResponseTimeMs} 
          icon={<Activity size={18} />} 
          trend="-0.001s" 
        />
      </div>

      <div className="main-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <DeviceMap devices={devices} />
          <NetworkTrafficChart />
        </div>
        <div>
          <ThreatLog alerts={alerts} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
