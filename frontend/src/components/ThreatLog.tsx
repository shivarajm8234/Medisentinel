import React from 'react';
import { AlertCircle, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Alert } from '../types';

interface ThreatLogProps {
  alerts: Alert[];
}

const ThreatLog: React.FC<ThreatLogProps> = ({ alerts }) => {
  return (
    <div className="glass-panel" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)' }}>
           <ShieldAlert size={18} />
           Real-Time Threat Detection Log
        </span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }} className="alert-feed">
        <AnimatePresence>
          {alerts.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No active threats detected.
            </div>
          ) : alerts.map((alert) => (
            <motion.div 
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="alert-item"
            >
              <div className={`alert-icon ${alert.severity}`}>
                {alert.severity === 'critical' ? <ShieldAlert size={20} /> : <AlertCircle size={20} />}
              </div>
              <div className="alert-details">
                <h4 style={{ color: alert.severity === 'critical' ? 'var(--color-accent)' : 'var(--text-main)'}}>
                  {alert.type}
                </h4>
                <p>Node: <span style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{alert.device_id}</span> • {alert.description}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="alert-time">{new Date(alert.timestamp).toLocaleTimeString()}</div>
                {!alert.is_resolved && alert.severity === 'critical' && (
                  <div style={{ color: 'var(--color-accent)', fontSize: '0.7rem', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={10} /> Auto-Quarantined
                  </div>
                )}
                {alert.is_resolved && (
                   <div style={{ color: 'var(--color-success)', fontSize: '0.7rem', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <CheckCircle2 size={10} /> Resolved
                   </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ThreatLog;
