import React from 'react';
import { Activity, ShieldAlert, Cpu, HardDrive, Clock, FileCheck } from 'lucide-react';
import { useStore } from '../useStore';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

const Dashboard = () => {
  const { alerts, devices } = useStore();

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.is_resolved);
  const activeThreatsCount = alerts.filter(a => !a.is_resolved).length;
  
  // Mock timeline data
  const timelineData = Array.from({length: 24}, (_, i) => ({
    hour: i,
    threats: Math.floor(Math.random() * 5) + (i > 10 && i < 14 ? 15 : 0) // spike in middle
  }));

  return (
    <div className="main-content">
      <div className="header">
        <div>
          <h1 className="page-title">Global Security Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Real-time autonomous defense matrix active.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Active Threats</span>
            <ShieldAlert size={18} color="var(--color-danger)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{activeThreatsCount}</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Mean Time to Detect (MTD)</span>
            <Clock size={18} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-success)' }}>4.2s</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Mean Time to Respond (MTR)</span>
            <Activity size={18} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-success)' }}>8.7s</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Compliance Score</span>
            <FileCheck size={18} color="var(--color-success)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>96%</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {[
          { name: 'Agent 1: Network Monitor', status: 'Healthy', ping: '12ms' },
          { name: 'Agent 2: IoT Guardian', status: 'Healthy', ping: '8ms' },
          { name: 'Agent 3: Threat Intel', status: 'Healthy', ping: '45ms' },
          { name: 'Agent 4: Incident Response', status: 'Active', ping: '5ms' },
          { name: 'Agent 5: Compliance Audit', status: 'Hashing', ping: '2ms' }
        ].map((agent, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px var(--color-success)' }}></div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{agent.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{agent.status} • {agent.ping}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px', height: '250px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Rolling Threat Timeline (24h)</h2>
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={timelineData}>
                <YAxis hide domain={[0, 'dataMax + 5']} />
                <Line type="monotone" dataKey="threats" stroke="var(--color-accent)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="glass-panel" style={{ padding: '24px', flexGrow: 1 }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-primary)' }}>System Overhead</h2>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <Cpu size={32} color="var(--color-primary)" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>2.8%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ML CPU Overhead</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <HardDrive size={32} color="var(--color-primary)" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>14.2%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Memory Usage</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Activity size={32} color="var(--color-primary)" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>420 msg/s</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kafka Throughput</div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert color="var(--color-danger)" size={20} /> Critical Unresolved
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {criticalAlerts.length === 0 ? (
               <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No critical alerts.</div>
            ) : criticalAlerts.slice(0, 5).map(alert => (
              <div key={alert.id} style={{ background: 'rgba(255,0,85,0.1)', border: '1px solid rgba(255,0,85,0.3)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--color-danger)' }}>{alert.device_id}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
                <div style={{ fontSize: '0.9rem' }}>{alert.type}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
