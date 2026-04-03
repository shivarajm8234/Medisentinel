import asyncio
import json
import logging
import os
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer

from network_monitor import NetworkMonitorAgent
from iot_guardian import IoTGuardianAgent
from incident_response import IncidentResponseAgent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")

network_agent = NetworkMonitorAgent()
iot_agent = IoTGuardianAgent()
ir_agent = IncidentResponseAgent()

async def get_kafka_producer():
    producer = AIOKafkaProducer(bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS)
    await producer.start()
    return producer

async def main():
    logger.info("Starting MediSentinel Agents Orchestrator...")
    
    # Needs a few seconds for Kafka to be ready in docker-compose
    await asyncio.sleep(10)
    
    producer = await get_kafka_producer()
    
    consumer = AIOKafkaConsumer(
        'raw_data',
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        group_id="medisentinel-agents-group",
        auto_offset_reset="earliest"
    )
    
    while True:
        try:
            await consumer.start()
            logger.info("Connected to Kafka. Ready to consume raw_data.")
            break
        except Exception as e:
            logger.warning(f"Waiting for Kafka... {e}")
            await asyncio.sleep(5)

    try:
        async for msg in consumer:
            logger.info(f"Agents consumed: {msg.value}")
            data = json.loads(msg.value.decode('utf-8'))
            
            payload = data.get("payload", {})
            device_id = payload.get("device_id", "unknown")
            
            is_network_anomaly = network_agent.analyze_traffic(payload.get("network", {}))
            is_device_anomaly = iot_agent.analyze_device_behavior(device_id, payload.get("metrics", {}))
            
            anomalies = []
            
            if is_network_anomaly:
                anomalies.append({
                    "device_id": device_id,
                    "type": "Network Anomaly",
                    "severity": "high",
                    "description": "Unusual traffic patterns detected by LSTM/Isolation Forest."
                })
                
            if is_device_anomaly:
                anomalies.append({
                    "device_id": device_id,
                    "type": "Device Behavior Anomaly",
                    "severity": "critical",
                    "description": "Abnormal device metrics detected by Autoencoder."
                })
                
            # If anomalies, trigger IR Agent and forward to 'alerts' topic
            for anomaly in anomalies:
                logger.warning(f"Publishing anomaly to Kafka: {anomaly}")
                # Publish back to Kafka so backend WS can pick it up
                await producer.send_and_wait("alerts", json.dumps(anomaly).encode('utf-8'))
                
                # Trigger internal Incident Response (Quarantine logic, API calls)
                await ir_agent.trigger_response(
                    anomaly["device_id"], 
                    anomaly["type"], 
                    anomaly["severity"], 
                    anomaly["description"]
                )

    finally:
        logger.info("Stopping Agents Orchestrator...")
        await consumer.stop()
        await producer.stop()

if __name__ == "__main__":
    asyncio.run(main())
