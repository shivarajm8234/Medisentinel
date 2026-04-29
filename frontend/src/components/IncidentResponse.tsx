import React from 'react';
import { Shield, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useStore } from '../useStore';

const IncidentResponse: React.FC = () => {
  const { alerts } = useStore();
  
  // Sort critical first
  const activeIncidents = [...alerts].filter(a => !a.is_resolved).sort((a, b) => {
    const sevScore = { critical: 4, high: 3, medium: 2, low: 1 };
    return sevScore[b.severity] - sevScore[a.severity];
  });

  const getContainmentAction = (alert: any) => {
    if (alert.severity === 'critical') return { action: 'Device Quarantined', status: 'Success', color: 'var(--color-success)' };
    if (alert.severity === 'high') return { action: 'Traffic Blocked', status: 'Pending Approval', color: 'var(--color-warning)' };
    return { action: 'Alert Logged', status: 'Completed', color: 'var(--text-muted)' };
  };

  return (
    <div className="main-content">
      <h1 className="page-title" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Shield color="var(--color-primary)" />
        Incident Response Console
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Active Incident Queue */}
        <div className="glass-panel" style={{ padding: '24px', height: 'calc(100vh - 150px)', overflowY: 'auto' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Active Incident Queue</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeIncidents.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>No active incidents.</div>
            ) : activeIncidents.map(incident => {
              const containment = getContainmentAction(incident);
              return (
                <div key={incident.id} style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: `1px solid ${incident.severity === 'critical' ? 'rgba(255,0,85,0.3)' : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: '8px', padding: '16px' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{incident.device_id}</div>
                    <span className="live-badge" style={{ 
                      color: incident.severity === 'critical' ? 'var(--color-danger)' : 'var(--color-accent)' 
                    }}>
                      {incident.severity.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>{incident.description}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={14} color="var(--text-muted)" />
                      <span style={{ color: 'var(--text-muted)' }}>{new Date(incident.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ color: containment.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {containment.status === 'Success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                      {containment.action} ({containment.status})
                    </div>
                  </div>
                  
                  {/* Manual Actions */}
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '8px' }}>
                    <button style={{ flex: 1, padding: '8px', background: 'rgba(255,0,85,0.1)', border: '1px solid rgba(255,0,85,0.3)', color: 'var(--color-danger)', borderRadius: '4px', cursor: 'pointer' }}>Force Quarantine</button>
                    <button style={{ flex: 1, padding: '8px', background: 'rgba(0,243,255,0.1)', border: '1px solid rgba(0,243,255,0.3)', color: 'var(--color-primary)', borderRadius: '4px', cursor: 'pointer' }}>Escalate to CISO</button>
                    <button style={{ padding: '8px 16px', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>Dismiss</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Playbooks & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Autonomous Response Metrics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: 'var(--color-success)', fontWeight: 'bold' }}>9.2s</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mean Time to Respond (MTR)</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>142</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Automated Actions (24h)</div>
              </div>
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '24px', flexGrow: 1 }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Containment Action Log</h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', borderLeft: '3px solid var(--color-success)' }}>
                <strong>Agent 4</strong> automatically quarantined MED-ESP32-001 following Critical Autoencoder alert. (Justification: Policy ID 441)
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', borderLeft: '3px solid var(--color-warning)' }}>
                <strong>Analyst Overrride:</strong> John Doe cancelled network block on 10.0.0.42. (Justification: Approved clinical data transfer)
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default IncidentResponse;
