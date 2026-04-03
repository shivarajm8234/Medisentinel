import { useState, useEffect } from 'react';
import type { Device, Alert } from './types';

const MOCK_DEVICES: Device[] = [
  { device_id: 'MED-ESP32-001', device_type: 'pacemaker_monitor', status: 'active', last_seen: new Date().toISOString() },
  { device_id: 'MED-RPI-042', device_type: 'mri_controller', status: 'active', last_seen: new Date().toISOString() },
  { device_id: 'MED-CUSTOM-X9', device_type: 'iv_pump', status: 'active', last_seen: new Date().toISOString() },
  { device_id: 'MED-SENSOR-11', device_type: 'vitals_tracker', status: 'active', last_seen: new Date().toISOString() },
];

export const useStore = () => {
  const [devices, setDevices] = useState<Device[]>(MOCK_DEVICES);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Local Simulation for Demo
    let alertId = 1;
    const interval = setInterval(() => {
      // Simulate real-time network packets
      window.dispatchEvent(new CustomEvent('live-network-event'));

      // Occasional anomalies
      if (Math.random() > 0.85) {
        const isDeviceAnomaly = Math.random() > 0.5;
        const targetDevice = MOCK_DEVICES[Math.floor(Math.random() * MOCK_DEVICES.length)];
        
        const newAlert: Alert = {
          id: alertId++,
          device_id: targetDevice.device_id,
          type: isDeviceAnomaly ? 'Device Behavior Anomaly' : 'Network Anomaly',
          severity: isDeviceAnomaly ? 'critical' : 'high',
          description: isDeviceAnomaly ? 'Abnormal device CPU and Temp metrics detected by Autoencoder.' : 'Unusual traffic patterns detected by LSTM isolation forest.',
          timestamp: new Date().toISOString(),
          is_resolved: false
        };

        setAlerts(prev => [newAlert, ...prev].slice(0, 50));

        if (newAlert.severity === 'critical') {
            setDevices(prev => prev.map(d => 
                d.device_id === targetDevice.device_id ? {...d, status: 'quarantined'} : d
            ));
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return { devices, alerts, loading };
};
