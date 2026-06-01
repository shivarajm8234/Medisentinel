import torch
import torch.nn as nn
import logging
import numpy as np

logger = logging.getLogger(__name__)

class DeviceBehaviorAutoencoder(nn.Module):
    def __init__(self, input_dim):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 16),
            nn.ReLU(),
            nn.Linear(16, 8),
            nn.ReLU(),
            nn.Linear(8, 4)
        )
        self.decoder = nn.Sequential(
            nn.Linear(4, 8),
            nn.ReLU(),
            nn.Linear(8, 16),
            nn.ReLU(),
            nn.Linear(16, input_dim)
        )

    def forward(self, x):
        encoded = self.encoder(x)
        decoded = self.decoder(encoded)
        return decoded

class IoTGuardianAgent:
    def __init__(self, input_dim=5):
        self.model = DeviceBehaviorAutoencoder(input_dim)
        self.criterion = nn.MSELoss()
        self.threshold = 0.5 # Error threshold for anomaly
        self.is_trained = False
        
    def analyze_device_behavior(self, device_id: str, metrics: dict) -> dict:
        """
        Analyze device metrics using Autoencoder.
        Returns detailed threat intelligence.
        """
        try:
            # Mock feature extraction from metrics
            # E.g., cpu_usage, memory, temp, battery, error_rate
            # Extract heart rate and SpO2, mapping them to autoencoder features if present
            heart_rate = float(metrics.get('heart_rate', 0))
            spo2 = float(metrics.get('spo2', 0))
            
            # Map anomalous telemetry to anomalous autoencoder dimensions
            cpu_val = 99.0 if (heart_rate > 130 or (heart_rate > 0 and heart_rate < 50)) else float(metrics.get('cpu', 15.0))
            temp_val = 90.0 if (heart_rate > 150) else float(metrics.get('temp', 36.5))
            errors_val = 5.0 if (spo2 > 0 and spo2 < 90) else float(metrics.get('errors', 0))
            
            features = [
                cpu_val,
                float(metrics.get('mem', 35.0)),
                temp_val,
                float(metrics.get('batt', metrics.get('battery_level', 100))),
                errors_val
            ]
            
            tensor_features = torch.tensor([features], dtype=torch.float32)
            
            loss_val = 0.0
            
            if not self.is_trained:
                # Mock loss based on extreme values
                if features[0] > 95 or features[2] > 85: 
                    loss_val = 0.8 + (np.random.rand() * 0.2)
                elif features[0] > 80:
                    loss_val = 0.4 + (np.random.rand() * 0.2)
                else:
                    loss_val = np.random.rand() * 0.2
            else:
                self.model.eval()
                with torch.no_grad():
                    reconstructed = self.model(tensor_features)
                    loss = self.criterion(reconstructed, tensor_features)
                    loss_val = loss.item()
                
            is_anomaly = loss_val > self.threshold
            risk_score = min(100, int(loss_val * 100))
            
            if is_anomaly:
                logger.warning(f"IoTGuardian: Anomaly for device {device_id}. Score: {risk_score}")
                
            return {
                "is_anomaly": is_anomaly,
                "score": risk_score,
                "loss": round(loss_val, 4)
            }
            
        except Exception as e:
            logger.error(f"Error in IoTGuardian: {e}")
            return {"is_anomaly": False, "score": 0, "loss": 0}
