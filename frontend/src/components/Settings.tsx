import React from 'react';
import { Settings as SettingsIcon, Server, ShieldAlert, WifiOff } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="main-content">
      <h1 className="page-title" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <SettingsIcon color="var(--color-primary)" />
        Settings & Configuration
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            AI Agent Toggles
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { id: 'ag1', name: 'Agent 1: Network Monitor', desc: 'LSTM & Isolation Forest for sequence/statistical anomalies.' },
              { id: 'ag2', name: 'Agent 2: IoT Guardian', desc: 'Autoencoder analysis for device telemetry streams.' },
              { id: 'ag3', name: 'Agent 3: Threat Intelligence', desc: 'STIX/TAXII feed parsing and NLP classification.' },
              { id: 'ag4', name: 'Agent 4: Incident Response', desc: 'Autonomous containment and decision tree execution.' },
              { id: 'ag5', name: 'Agent 5: Compliance Audit', desc: 'Tamper-evident hash chaining for HIPAA compliance.' }
            ].map(agent => (
              <div key={agent.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{agent.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{agent.desc}</div>
                </div>
                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                  <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--color-primary)', transition: '.4s', borderRadius: '24px' }}></span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={20} color="var(--color-accent)" /> Integration Config
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Kafka Bootstrap Servers</label>
                <input type="text" defaultValue="localhost:9092" style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>STIX/TAXII Feed Endpoint</label>
                <input type="text" defaultValue="https://ti.alienvault.com/taxii2/" style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', borderRadius: '4px' }} />
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(255,0,85,0.3)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} /> Data Egress & Privacy
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              MediSentinel is operating in <strong>On-Premise / Zero Egress</strong> mode. No patient data or ML telemetry is sent to cloud services.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,0,85,0.1)', borderRadius: '4px' }}>
              <WifiOff color="var(--color-danger)" size={24} />
              <span style={{ fontSize: '0.9rem', color: 'var(--color-danger)' }}>Cloud Telemetry Disabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
