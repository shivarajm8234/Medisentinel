import json
import logging
import numpy as np
from sklearn.ensemble import IsolationForest

logger = logging.getLogger(__name__)

class NetworkMonitorAgent:
    def __init__(self):
        # Isolation Forest for fast anomaly detection on network traffic
        self.iso_forest = IsolationForest(contamination=0.05, random_state=42)
        self.is_trained = False
        self.training_data = []
        
    def analyze_traffic(self, network_data: dict) -> bool:
        """
        Analyze network data pattern. 
        Returns True if anomaly is detected, False otherwise.
        """
        # Mock feature extraction
        try:
            bytes_sent = float(network_data.get('bytes_sent', 0))
            bytes_received = float(network_data.get('bytes_received', 0))
            packet_rate = float(network_data.get('packet_rate', 0))
            
            features = np.array([[bytes_sent, bytes_received, packet_rate]])
            
            if not self.is_trained:
                self.training_data.append(features[0])
                if len(self.training_data) > 100:
                    self.train(np.array(self.training_data))
                return False # Default to normal while training
            
            prediction = self.iso_forest.predict(features)
            # prediction == -1 means anomaly
            is_anomaly = prediction[0] == -1
            
            if is_anomaly:
                logger.warning(f"NetworkMonitor: Anomaly detected! {network_data}")
                
            return is_anomaly
            
        except Exception as e:
            logger.error(f"Error analyzing traffic: {e}")
            return False

    def train(self, data: np.ndarray):
        logger.info("NetworkMonitor: Training Isolation Forest model...")
        self.iso_forest.fit(data)
        self.is_trained = True
        self.training_data = [] # Free memory
        logger.info("NetworkMonitor: Training complete.")
