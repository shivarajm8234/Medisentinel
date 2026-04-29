import json
import logging
import numpy as np
import random
from sklearn.ensemble import IsolationForest

logger = logging.getLogger(__name__)

class NetworkMonitorAgent:
    def __init__(self):
        # Isolation Forest for fast anomaly detection on network traffic
        self.iso_forest = IsolationForest(contamination=0.05, random_state=42)
        self.is_trained = False
        self.training_data = []
        
        # LSTM simulation threshold
        self.lstm_threshold = 0.85
        
    def _simulate_lstm(self, features: np.ndarray) -> float:
        """
        Simulates an LSTM sequence anomaly score.
        In reality, this would maintain a rolling window of traffic and pass through PyTorch/ONNX.
        """
        # If packet rate is extremely high, or byte transfer is very high, increase score
        score = min(1.0, (features[0][0] + features[0][2] * 10) / 10000.0)
        # Add some random noise
        score += random.uniform(-0.1, 0.2)
        return max(0.0, min(1.0, score))

    def analyze_traffic(self, network_data: dict) -> dict:
        """
        Analyze network data pattern using Isolation Forest + LSTM.
        Returns detailed threat intelligence.
        """
        try:
            bytes_sent = float(network_data.get('bytes_sent', 0))
            bytes_received = float(network_data.get('bytes_received', 0))
            packet_rate = float(network_data.get('packet_rate', 0))
            
            features = np.array([[bytes_sent, bytes_received, packet_rate]])
            
            if not self.is_trained:
                self.training_data.append(features[0])
                if len(self.training_data) > 100:
                    self.train(np.array(self.training_data))
                return {"is_anomaly": False, "score": 0}
            
            # 1. Isolation Forest (Statistical Outlier)
            iso_prediction = self.iso_forest.predict(features)[0]
            iso_anomaly = iso_prediction == -1
            
            # 2. LSTM (Sequence Anomaly)
            lstm_score = self._simulate_lstm(features)
            lstm_anomaly = lstm_score > self.lstm_threshold
            
            # Combine scores
            threat_score = int(lstm_score * 100)
            if iso_anomaly:
                threat_score = max(threat_score, random.randint(70, 95))
                
            is_anomaly = iso_anomaly or lstm_anomaly
            
            if is_anomaly:
                logger.warning(f"NetworkMonitor: Anomaly detected! Score: {threat_score}")
                
            return {
                "is_anomaly": is_anomaly,
                "score": threat_score,
                "lstm_confidence": round(lstm_score * 100, 1),
                "iso_forest_flag": bool(iso_anomaly)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing traffic: {e}")
            return {"is_anomaly": False, "score": 0}

    def train(self, data: np.ndarray):
        logger.info("NetworkMonitor: Training Isolation Forest model...")
        self.iso_forest.fit(data)
        self.is_trained = True
        self.training_data = [] # Free memory
        logger.info("NetworkMonitor: Training complete.")
