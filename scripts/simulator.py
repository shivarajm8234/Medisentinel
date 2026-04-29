import paho.mqtt.client as mqtt
import time
import json
import random
import threading
import math
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Simulator")

MQTT_BROKER = "localhost"
MQTT_PORT = 1883

client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    logger.info(f"Simulator connected with result code {rc}")

client.on_connect = on_connect
client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.loop_start()

DEPARTMENTS = ["ICU", "Radiology", "Pharmacy", "ER"]
DEVICE_TYPES = ["infusion_pump", "ventilator", "pacemaker_monitor", "mri_system", "vitals_tracker", "dispenser"]

devices = []
for i in range(12):
    dept = DEPARTMENTS[i % len(DEPARTMENTS)]
    dtype = DEVICE_TYPES[i % len(DEVICE_TYPES)]
    devices.append((f"MED-{dept}-{i+100}", dtype))

# Global anomaly trigger to coordinate attacks across devices
global_anomaly_event = threading.Event()

def attack_coordinator():
    """
    Triggers an attack event every 45-90 seconds.
    """
    while True:
        wait_time = random.uniform(45, 90)
        logger.info(f"Coordinator: Next attack in {wait_time:.1f}s")
        time.sleep(wait_time)
        
        logger.warning("Coordinator: INITIATING SIMULATED ATTACK!")
        global_anomaly_event.set()
        
        # Attack lasts for 5 seconds
        time.sleep(5)
        global_anomaly_event.clear()
        logger.info("Coordinator: Attack ended.")

def simulate_device(device_id, device_type):
    logger.info(f"Starting simulation for {device_id} ({device_type})")
    
    tick = 0
    # Add some random phase shift so they don't all look identical
    phase = random.uniform(0, 100)
    
    while True:
        tick += 1
        
        # Base healthy metrics
        cpu = 30 + math.sin((tick + phase) * 0.1) * 10 + random.uniform(-2, 2)
        mem = 40 + random.uniform(-1, 1)
        temp = 35 + random.uniform(0, 1)
        
        # 1.8% baseline false positive rate (random tiny spikes)
        fp_spike = random.random() < 0.018
        
        is_attack = global_anomaly_event.is_set() and random.random() > 0.5 # 50% chance this device is part of the attack
        
        if fp_spike:
            cpu += 20
        
        if is_attack:
            cpu = random.uniform(85, 99)
            temp = random.uniform(40, 50)
            bytes_sent = random.randint(5000, 15000)
            packet_rate = random.randint(500, 1000)
        else:
            bytes_sent = random.randint(100, 500)
            packet_rate = random.randint(10, 50)

        payload = {
            "device_id": device_id,
            "device_type": device_type,
            "network": {
                "bytes_sent": bytes_sent,
                "bytes_received": random.randint(100, 500),
                "packet_rate": packet_rate,
            },
            "metrics": {
                "cpu": max(0, min(100, cpu)),
                "mem": max(0, min(100, mem)),
                "temp": temp,
                "batt": 100,
                "errors": int(is_attack)
            },
            "timestamp": time.time()
        }

        client.publish(f"devices/{device_id}/data", json.dumps(payload))
        
        # Status heartbeat
        status_payload = {"status": "active"}
        client.publish(f"devices/{device_id}/status", json.dumps(status_payload))
        
        time.sleep(2)

# Start attack coordinator
coord_t = threading.Thread(target=attack_coordinator)
coord_t.daemon = True
coord_t.start()

# Start device simulators
threads = []
for dev_id, dev_type in devices:
    t = threading.Thread(target=simulate_device, args=(dev_id, dev_type))
    t.daemon = True
    t.start()
    threads.append(t)

try:
    logger.info("Simulator running. Press Ctrl+C to stop.")
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    logger.info("Simulator stopped.")
    client.loop_stop()
    client.disconnect()
