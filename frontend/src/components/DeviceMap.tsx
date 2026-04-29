import React from 'react';
import type { Device } from '../types';
import { ShieldAlert, ServerIcon, Crosshair } from 'lucide-react';

interface DeviceMapProps {
  devices: Device[];
}

const DeviceMap: React.FC<DeviceMapProps> = ({ devices: _devices }) => {
  // Mock positioning for visual effect
  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      <div className="panel-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
           <Crosshair size={18} color="var(--color-primary)" />
           Network Topology & Medical Endpoints
        </span>
        <div className="live-badge">
          <div className="live-dot"></div> Live Mapping
        </div>
      </div>
      <div className="device-map-container" style={{ height: '350px' }}>
        <div className="map-grid"></div>
        
        {/* Central Hub */}
        <div className="device-node" style={{ 
          top: '50%', left: '50%', 
          width: '24px', height: '24px', 
          backgroundColor: 'var(--color-primary)',
          boxShadow: '0 0 30px var(--color-primary)' 
        }}>
          <ServerIcon size={12} color="#000" style={{position: 'absolute', top: '6px', left:'6px'}}/>
        </div>

        {/* Mock Devices/Nodes - normally calculated via D3 or Force Graph */}
        {[...Array(8)].map((_, i) => {
           const angle = (i / 8) * (2 * Math.PI);
           const radius = 100 + Math.random() * 50;
           const x = 50 + Math.cos(angle) * (radius / 3) + '%';
           const y = 50 + Math.sin(angle) * (radius / 2) + '%';
           
           // Inject some mock quarantined behavior for visual flair if no actual quarantine data available immediately
           const isQ = Math.random() > 0.8;
           return (
            <div 
              key={i}
              className={`device-node ${isQ ? 'quarantined' : ''}`}
              style={{ top: y, left: x }}
              title={isQ ? 'Quarantined Endpoint' : 'Active Medical Sensor'}
            >
              {isQ && <ShieldAlert size={16} color="var(--color-accent)" style={{position: 'absolute', top: '-25px', left:'-2px'}} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeviceMap;
