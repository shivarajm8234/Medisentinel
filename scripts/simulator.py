import paho.mqtt.client as mqtt
import time
import json
import random
import threading
import math

MQTT_BROKER = "localhost"
MQTT_PORT = 1883

client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    print(f"Simulator connected with result code {rc}")

client.on_connect = on_connect
client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.loop_start()

def simulate_device(device_id, device_type):
    print(f"Starting simulation for {device_id} ({device_type})")
    
    tick = 0
    while True:
        tick += 1
        
        # Base healthy metrics
        cpu = 30 + math.sin(tick * 0.1) * 10 + random.uniform(-2, 2)
        mem = 40 + random.uniform(-1, 1)
        temp = 35 + random.uniform(0, 1)
        
        # Introduce occasional anomalies
        is_anomaly = random.random() > 0.98
        
        if is_anomaly:
            cpu = 99
            temp = 88
            print(f"ANOMALY INJECTED: {device_id}")

        payload = {
            "device_id": device_id,
            "device_type": device_type,
            "network": {
                "bytes_sent": random.randint(100, 500) if not is_anomaly else random.randint(5000, 10000),
                "bytes_received": random.randint(100, 500),
                "packet_rate": random.randint(10, 50) if not is_anomaly else random.randint(500, 1000),
            },
            "metrics": {
                "cpu": cpu,
                "mem": mem,
                "temp": temp,
                "batt": 100,
                "errors": int(is_anomaly)
            },
            "timestamp": time.time()
        }

        client.publish(f"devices/{device_id}/data", json.dumps(payload))
        
        # Status heartbeat
        status_payload = {"status": "active"}
        client.publish(f"devices/{device_id}/status", json.dumps(status_payload))
        
        time.sleep(2)

devices = [
    ("MED-ESP32-001", "pacemaker_monitor"),
    ("MED-RPI-042", "mri_controller"),
    ("MED-CUSTOM-X9", "iv_pump"),
    ("MED-SENSOR-11", "vitals_tracker")
]

threads = []
for dev_id, dev_type in devices:
    t = threading.Thread(target=simulate_device, args=(dev_id, dev_type))
    t.daemon = True
    t.start()
    threads.append(t)

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("Simulator stopped.")
    client.loop_stop()
    client.disconnect()
