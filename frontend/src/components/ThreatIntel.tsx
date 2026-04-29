import React, { useState, useEffect } from 'react';
import { AlertTriangle, Database, ShieldCheck, UserX } from 'lucide-react';
import { useStore } from '../useStore';

const ThreatIntel: React.FC = () => {
  const { threatIntel } = useStore();
  
  // Mock propagation status
  const agents = ['Network Monitor', 'IoT Guardian', 'Incident Response'];
  const [propagated, setPropagated] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Simulate propagation delay
    if (threatIntel.length > 0) {
      const timer = setTimeout(() => {
        const newProp = { ...propagated };
        agents.forEach(a => newProp[a] = true);
        setPropagated(newProp);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [threatIntel]);

  return (
    <div className="main-content">
      <h1 className="page-title" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Database color="var(--color-primary)" />
        Threat Intelligence Feed
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* IOC Table */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Live STIX/TAXII IOCs</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Indicator</th>
                <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Type</th>
                <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Confidence</th>
                <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Source Feed</th>
                <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {threatIntel.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Awaiting feed ingestion...</td>
                </tr>
              ) : threatIntel.map((ioc, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 8px', fontFamily: 'monospace', color: 'var(--color-primary)' }}>{ioc.indicator}</td>
                  <td style={{ padding: '12px 8px', textTransform: 'uppercase', fontSize: '0.8rem' }}>{ioc.type}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '50px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                        <div style={{ width: `${ioc.confidence}%`, height: '100%', background: ioc.confidence > 80 ? 'var(--color-danger)' : 'var(--color-warning)', borderRadius: '3px' }}></div>
                      </div>
                      <span style={{ fontSize: '0.8rem' }}>{ioc.confidence}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px', fontSize: '0.9rem' }}>{ioc.source_feed}</td>
                  <td style={{ padding: '12px 8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date().toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sidebar panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Propagation Status */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--color-success)" /> Signature Sync
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {agents.map(agent => (
                <div key={agent} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{agent}</span>
                  {propagated[agent] ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', background: 'rgba(0,255,136,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Synced</span>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-warning)', background: 'rgba(255,204,0,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Threat Actor Card */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserX size={18} color="var(--color-danger)" /> Known Threat Actors
            </h3>
            <div style={{ background: 'rgba(255,0,85,0.05)', border: '1px solid rgba(255,0,85,0.2)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--color-danger)', marginBottom: '8px' }}>APT41 (Double Dragon)</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                State-sponsored espionage group. Frequently targets healthcare for IP theft. Associated with recent ransomware variants seen in IOC feed.
              </p>
              <div style={{ marginTop: '12px', fontSize: '0.7rem', color: 'var(--color-accent)' }}>Targets: Medical Imaging, EHR Databases</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ThreatIntel;
