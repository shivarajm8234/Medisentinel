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
        
    def analyze_device_behavior(self, device_id: str, metrics: dict) -> bool:
        """
        Analyze device metrics using Autoencoder.
        Returns True if anomaly is detected.
        """
        try:
            # Mock feature extraction from metrics
            # E.g., cpu_usage, memory, temp, battery, error_rate
            features = [
                float(metrics.get('cpu', 0)),
                float(metrics.get('mem', 0)),
                float(metrics.get('temp', 0)),
                float(metrics.get('batt', 100)),
                float(metrics.get('errors', 0))
            ]
            
            tensor_features = torch.tensor([features], dtype=torch.float32)
            
            # Simple threshold check for now if not trained
            # In a real scenario, this would load a pre-trained model for the specific device type
            if not self.is_trained:
                if features[0] > 95 or features[2] > 85: # Hardcoded fallback
                    return True
                return False
                
            self.model.eval()
            with torch.no_grad():
                reconstructed = self.model(tensor_features)
                loss = self.criterion(reconstructed, tensor_features)
                
            is_anomaly = loss.item() > self.threshold
            if is_anomaly:
                logger.warning(f"IoTGuardian: Anomaly for device {device_id}. Loss: {loss.item()}")
                
            return is_anomaly
            
        except Exception as e:
            logger.error(f"Error in IoTGuardian: {e}")
            return False
