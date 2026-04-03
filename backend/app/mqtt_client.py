import asyncio
import json
import logging
from contextlib import AsyncExitStack
import paho.mqtt.client as mqtt
import httpx
from app.config import get_settings
from app.kafka_client import produce_message

settings = get_settings()
logger = logging.getLogger(__name__)

async def auto_register_device(payload: dict):
    device_id = payload.get("device_id")
    device_type = payload.get("device_type", "unknown")
    status = payload.get("status", "active")
    
    logger.info(f"Auto-registering device if new: {device_id}")
    async with httpx.AsyncClient() as client:
        try:
            # We assume internal service-to-service call. A master token or open port is used here for MQTT bridge.
            device_data = {
                "device_id": device_id,
                "device_type": device_type,
                "status": status,
                "metadata_json": {}
            }
            # The backend will return 400 "Device already registered" if it exists, which is fine to ignore.
            # In a production app, we would authenticate here. (Or bypass if internal).
            res = await client.post(f"{settings.backend_url}/devices/", json=device_data)
            if res.status_code == 200:
                logger.info(f"Successfully auto-registered new device: {device_id}")
        except Exception as e:
            logger.error(f"Failed to auto-register device via backend proxy: {e}")

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        logger.info("Connected to MQTT Broker!")
        # Subscribe to device topics
        client.subscribe("devices/+/data")
        client.subscribe("devices/+/status")
    else:
        logger.error(f"Failed to connect to MQTT broker, return code {rc}")

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        topic = msg.topic
        
        # Forward everything to Kafka robustly via background task
        loop = userdata.get('loop')
        
        # --- Auto Device Registration Logic ---
        if topic.endswith("/status"):
            device_id = payload.get("device_id")
            if device_id and loop and loop.is_running():
                # Trigger HTTP registration asynchronously
                asyncio.run_coroutine_threadsafe(
                    auto_register_device(payload),
                    loop
                )
        
        if loop and loop.is_running():
            asyncio.run_coroutine_threadsafe(
                produce_message("raw_data", {"mqtt_topic": topic, "payload": payload}), 
                loop
            )
            
    except json.JSONDecodeError:
        logger.error(f"Failed to decode MQTT message from topic {msg.topic}")
    except Exception as e:
        logger.error(f"Error handling MQTT message: {e}")

async def start_mqtt_client():
    loop = asyncio.get_running_loop()
    
    client = mqtt.Client(userdata={'loop': loop})
    client.on_connect = on_connect
    client.on_message = on_message

    # Connecting loop with retry
    while True:
        try:
            client.connect(settings.mqtt_broker_host, settings.mqtt_broker_port, 60)
            break
        except Exception as e:
            logger.warning(f"Waiting for MQTT broker... {e}")
            await asyncio.sleep(5)

    client.loop_start()
    return client

async def run_mqtt_bridge():
    # Will be called as a background task to keep the bridge alive
    client = await start_mqtt_client()
    try:
        while True:
            await asyncio.sleep(3600)  # Keep coroutine alive
    finally:
        client.loop_stop()
        client.disconnect()
