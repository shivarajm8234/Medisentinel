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

export interface ThreatIntelType {
  id: number;
  indicator: string;
  type: string;
  confidence: number;
  source_feed: string;
  date_added: string;
}

export interface AuditLogType {
  id: number;
  action: string;
  actor: string;
  target: string;
  details: any;
  timestamp: string;
  previous_hash: string;
  current_hash: string;
}
