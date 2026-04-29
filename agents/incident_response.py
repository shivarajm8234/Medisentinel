import logging
import httpx
from datetime import datetime
import os

logger = logging.getLogger(__name__)

class IncidentResponseAgent:
    def __init__(self):
        self.backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
        
    def _decision_tree(self, alert_type: str, severity: str) -> str:
        """
        Decision Tree + Policy Engine for containment action selection.
        """
        if severity == "critical":
            if "Network" in alert_type:
                return "block_traffic"
            return "quarantine_device"
        elif severity == "high":
            if "IoT" in alert_type or "Behavior" in alert_type:
                return "limit_network_access"
            return "trigger_backup"
        else:
            return "alert_only"

    async def trigger_response(self, device_id: str, alert_type: str, severity: str, description: str):
        """
        Triggers an autonomous response.
        1. Logs the alert.
        2. Executes decision tree.
        3. Creates an alert in the backend.
        """
        logger.error(f"INCIDENT RESPONSE TRIGGERED: {device_id} | {alert_type} | {severity}")
        
        # 1. Decision Tree Action
        action = self._decision_tree(alert_type, severity)
        logger.info(f"Policy Engine Selected Action: {action}")
        
        # 2. Create Alert via Backend API
        alert_payload = {
            "device_id": device_id,
            "type": alert_type,
            "severity": severity,
            "description": f"{description} | Recommended Action: {action}"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                # Need to use an internal service token or similar in prod
                response = await client.post(f"{self.backend_url}/alerts/", json=alert_payload)
                if response.status_code == 200:
                    logger.info("Alert successfully registered in backend.")
                else:
                    logger.error(f"Failed to register alert: {response.text}")
                    
                # 3. Autonomous Containment
                if action == "quarantine_device":
                    logger.warning(f"Autonomous containment: Quarantining device {device_id}")
                    await client.patch(
                        f"{self.backend_url}/devices/{device_id}", 
                        json={"status": "quarantined"}
                    )
                elif action == "block_traffic":
                    logger.warning(f"Autonomous containment: Blocking network traffic for {device_id}")
                    
            except Exception as e:
                logger.error(f"Incident Response Agent failed to reach backend: {e}")
