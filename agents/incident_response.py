import logging
import httpx
from datetime import datetime
import os

logger = logging.getLogger(__name__)

class IncidentResponseAgent:
    def __init__(self):
        self.backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
        
    async def trigger_response(self, device_id: str, alert_type: str, severity: str, description: str):
        """
        Triggers an autonomous response.
        1. Logs the alert.
        2. Sends an API call to quarantine the device if critical.
        3. Creates an alert in the backend.
        """
        logger.error(f"INCIDENT RESPONSE TRIGGERED: {device_id} | {alert_type} | {severity}")
        
        # 1. Create Alert via Backend API
        alert_payload = {
            "device_id": device_id,
            "type": alert_type,
            "severity": severity,
            "description": description
        }
        
        async with httpx.AsyncClient() as client:
            try:
                # Need to use an internal service token or similar in prod
                response = await client.post(f"{self.backend_url}/alerts/", json=alert_payload)
                if response.status_code == 200:
                    logger.info("Alert successfully registered in backend.")
                else:
                    logger.error(f"Failed to register alert: {response.text}")
                    
                # 2. Autonomous Containment (Quarantine)
                if severity == "critical":
                    logger.warning(f"Autonomous containment: Quarantining device {device_id}")
                    # Update device status
                    await client.patch(
                        f"{self.backend_url}/devices/{device_id}", 
                        json={"status": "quarantined"}
                    )
                    
            except Exception as e:
                logger.error(f"Incident Response Agent failed to reach backend: {e}")
