import { useState, useEffect } from 'react';
import type { Device, Alert, ThreatIntelType, AuditLogType } from './types';

// Let's assume the backend is hosted at localhost:8000 for this prototype
const BACKEND_REST_URL = 'http://localhost:8000';
const BACKEND_WS_URL = 'ws://localhost:8000/ws';

export const useStore = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [threatIntel, setThreatIntel] = useState<ThreatIntelType[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch initial state
    const fetchInitialData = async () => {
      try {
        const [devicesRes, alertsRes] = await Promise.all([
          fetch(`${BACKEND_REST_URL}/devices/`),
          fetch(`${BACKEND_REST_URL}/alerts/`)
        ]);
        if (devicesRes.ok) {
          const devs = await devicesRes.json();
          setDevices(devs);
        }
        if (alertsRes.ok) {
          const alrts = await alertsRes.json();
          // Sort alerts newest first
          alrts.sort((a: Alert, b: Alert) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setAlerts(alrts.slice(0, 50));
        }
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();

    // 2. Setup WebSocket for live updates
    const ws = new WebSocket(BACKEND_WS_URL);
    
    ws.onopen = () => {
      console.log("Connected to MediSentinel live WebSocket");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { topic, data } = msg;

        // Custom event for visualizing network blips
        window.dispatchEvent(new CustomEvent('live-network-event'));

        if (topic === 'devices/auto_registered') {
          // New device registered
          setDevices(prev => {
            if (prev.some(d => d.device_id === data.device_id)) return prev;
            return [...prev, data];
          });
        }
        else if (topic === 'devices/telemetry') {
           // Live data ping - just update last_seen
           setDevices(prev => prev.map(d => 
             d.device_id === data.device_id 
              ? { ...d, last_seen: new Date().toISOString() } 
              : d
           ));
        }
        else if (topic === 'alerts' || topic === 'anomalies') {
            const isDeviceAnomaly = data.type?.includes("Device") || data.severity === "critical";
            
            const newAlert: Alert = {
              id: data.id || Math.floor(Math.random() * 1000000),
              device_id: data.device_id || "UNKNOWN",
              type: data.type || (isDeviceAnomaly ? 'Device Behavior Anomaly' : 'Network Anomaly'),
              severity: data.severity || (isDeviceAnomaly ? 'critical' : 'high'),
              description: data.description || 'Abnormal behavior detected by AI Agents.',
              timestamp: data.timestamp || new Date().toISOString(),
              is_resolved: false
            };

            setAlerts(prev => [newAlert, ...prev].slice(0, 50));

            // Auto-quarantine on critical
            if (newAlert.severity === 'critical') {
                setDevices(prev => prev.map(d => 
                    d.device_id === newAlert.device_id ? {...d, status: 'quarantined'} : d
                ));
            }
        }
      } catch (e) {
        console.error("Failed parsing WS message", e);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  return { devices, alerts, threatIntel, auditLogs, loading };
};
