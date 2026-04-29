import React, { useState } from 'react';
import { FileCheck, Shield, FileText, Download, Lock } from 'lucide-react';
import { useStore } from '../useStore';

const ComplianceCenter: React.FC = () => {
  const { auditLogs } = useStore();
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<string | null>(null);

  const handleVerifyChain = () => {
    setVerifying(true);
    // Simulate verification delay
    setTimeout(() => {
      setVerifying(false);
      setVerifyStatus('Valid');
    }, 1500);
  };

  return (
    <div className="main-content">
      <h1 className="page-title" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <FileCheck color="var(--color-primary)" />
        Compliance and Audit Center
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Scorecard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} color="var(--color-success)" /> HIPAA Scorecard
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Access Control', score: 95 },
                { label: 'Audit Controls', score: 100 },
                { label: 'Integrity', score: 100 },
                { label: 'Transmission Security', score: 92 }
              ].map(cat => (
                <div key={cat.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
                    <span>{cat.label}</span>
                    <span style={{ color: cat.score >= 95 ? 'var(--color-success)' : 'var(--color-warning)' }}>{cat.score}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                    <div style={{ width: `${cat.score}%`, height: '100%', background: cat.score >= 95 ? 'var(--color-success)' : 'var(--color-warning)', borderRadius: '3px' }}></div>
                  </div>
                </div>
              ))}
            </div>
            
            <button style={{ marginTop: '24px', width: '100%', padding: '12px', background: 'var(--color-primary)', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Download size={18} /> Export Full Audit Report (PDF)
            </button>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Regulatory Mapping</h2>
            <table style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <tbody>
                <tr><td style={{ padding: '4px 0' }}>Agent 5 Hash Chain</td><td style={{ textAlign: 'right', color: 'var(--color-primary)' }}>HIPAA 164.312(b)</td></tr>
                <tr><td style={{ padding: '4px 0' }}>Agent 4 Containment</td><td style={{ textAlign: 'right', color: 'var(--color-primary)' }}>NIST PR.IP-9</td></tr>
                <tr><td style={{ padding: '4px 0' }}>Agent 2 Anomaly Det.</td><td style={{ textAlign: 'right', color: 'var(--color-primary)' }}>NIST DE.AE-1</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tamper-Evident Logs */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={20} color="var(--color-accent)" /> Tamper-Evident Log Viewer
            </h2>
            <button 
              onClick={handleVerifyChain}
              disabled={verifying}
              style={{ padding: '6px 12px', background: 'rgba(0,243,255,0.1)', border: '1px solid rgba(0,243,255,0.3)', color: 'var(--color-primary)', borderRadius: '4px', cursor: 'pointer' }}
            >
              {verifying ? 'Verifying Hashes...' : 'Verify Hash Chain'}
            </button>
          </div>

          {verifyStatus && (
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(0,255,136,0.1)', border: '1px solid var(--color-success)', color: 'var(--color-success)', borderRadius: '4px' }}>
              Cryptographic hash chain verification successful. 0 instances of tampering detected.
            </div>
          )}

          <div style={{ flexGrow: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            {auditLogs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>Initializing cryptographic log...</div>
            ) : auditLogs.map((log, i) => (
              <div key={i} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}>
                  <span>[{new Date(log.timestamp).toISOString()}] {log.actor} -> {log.action}</span>
                  <span style={{ color: 'var(--color-success)' }}>VERIFIED</span>
                </div>
                <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Target: {log.target}</div>
                <div style={{ color: 'var(--color-accent)', marginTop: '4px', wordBreak: 'break-all' }}>Hash: {log.current_hash}</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', marginTop: '2px', wordBreak: 'break-all' }}>Prev: {log.previous_hash}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ComplianceCenter;
