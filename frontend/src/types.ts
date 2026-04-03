export interface Device {
  device_id: string;
  device_type: string;
  status: 'active' | 'quarantined' | 'offline';
  metadata_json?: any;
  last_seen?: string;
}

export interface Alert {
  id: number;
  device_id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  is_resolved: boolean;
}
