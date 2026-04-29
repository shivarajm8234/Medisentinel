import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ShieldAlert, Globe } from 'lucide-react';
import { useStore } from '../useStore';

const MOCK_DATA = Array.from({ length: 20 }, (_, i) => ({
  time: new Date(Date.now() - (20 - i) * 1000).toLocaleTimeString(),
  packets: Math.floor(Math.random() * 50) + 10,
}));

const NetworkMonitor: React.FC = () => {
  const { alerts } = useStore();
  const [data, setData] = useState(MOCK_DATA);

  // Simulate live graph updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const newArr = [...prev.slice(1), {
          time: new Date().toLocaleTimeString(),
          packets: Math.floor(Math.random() * 50) + 10 + (Math.random() > 0.9 ? 150 : 0) // random spike
        }];
        return newArr;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const networkAlerts = alerts.filter(a => a.type.includes('Network'));

  return (
    <div className="main-content">
      <h1 className="page-title" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Activity color="var(--color-primary)" />
        Network Monitor Panel
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', height: '350px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Live Traffic (Packets/sec)</h2>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
              <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid var(--color-primary)' }} />
              <Line type="monotone" dataKey="packets" stroke="var(--color-primary)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe color="var(--color-accent)" /> Geographic IP Map
          </h2>
          <div style={{ background: 'rgba(0,0,0,0.3)', height: '200px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ color: 'var(--text-muted)' }}>Map visualization active</p>
          </div>
          <div style={{ marginTop: '16px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>45.33.32.156</span>
              <span style={{ color: 'var(--color-accent)' }}>C2 Beacon (Russia)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>104.21.14.99</span>
              <span style={{ color: 'var(--color-warning)' }}>Data Exfil (China)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Detected Anomalies</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Timestamp</th>
              <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Source</th>
              <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Type</th>
              <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Severity</th>
              <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>AI Confidence</th>
            </tr>
          </thead>
          <tbody>
            {networkAlerts.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No network anomalies detected.</td>
              </tr>
            ) : networkAlerts.map(alert => (
              <tr key={alert.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 8px', fontSize: '0.9rem' }}>{new Date(alert.timestamp).toLocaleTimeString()}</td>
                <td style={{ padding: '12px 8px', fontSize: '0.9rem' }}>{alert.device_id}</td>
                <td style={{ padding: '12px 8px', fontSize: '0.9rem' }}>{alert.type}</td>
                <td style={{ padding: '12px 8px' }}>
                  <span className={`live-badge`} style={{ 
                    color: alert.severity === 'critical' ? 'var(--color-danger)' : 
                           alert.severity === 'high' ? 'var(--color-accent)' : 'var(--color-warning)'
                  }}>
                    {alert.severity.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px 8px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(0, 243, 255, 0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(0, 243, 255, 0.3)' }}>LSTM: {Math.floor(Math.random() * 15) + 80}%</div>
                    <div style={{ background: 'rgba(255, 0, 85, 0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255, 0, 85, 0.3)' }}>iForest: Yes</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NetworkMonitor;
