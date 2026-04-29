import asyncio
import json
import logging
import os
import httpx
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer

from network_monitor import NetworkMonitorAgent
from iot_guardian import IoTGuardianAgent
from incident_response import IncidentResponseAgent
from threat_intelligence import ThreatIntelligenceAgent
from compliance_audit import ComplianceAuditAgent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

network_agent = NetworkMonitorAgent()
iot_agent = IoTGuardianAgent()
ir_agent = IncidentResponseAgent()
ti_agent = ThreatIntelligenceAgent()
audit_agent = ComplianceAuditAgent()

async def get_kafka_producer():
    producer = AIOKafkaProducer(bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS)
    await producer.start()
    return producer

async def threat_intel_worker(producer):
    """
    Background worker for Agent 3 (Threat Intelligence).
    Polls for STIX IOCs and publishes them.
    """
    async with httpx.AsyncClient() as client:
        while True:
            try:
                new_iocs = ti_agent.get_new_intel()
                for ioc in new_iocs:
                    # Publish to Kafka for other agents (if needed)
                    await producer.send_and_wait("threat_intel", json.dumps(ioc).encode('utf-8'))
                    
                    # Also send to backend
                    await client.post(f"{BACKEND_URL}/threat-intel/inject", params=ioc)
                    
                    # Audit Log
                    await audit_agent.log_event(
                        action="ingest_ioc",
                        actor="ThreatIntelligenceAgent",
                        target=ioc["indicator"],
                        details=ioc
                    )
            except Exception as e:
                logger.error(f"Threat Intel Worker Error: {e}")
            
            await asyncio.sleep(5)

async def main():
    logger.info("Starting MediSentinel Agents Orchestrator (All 5 Agents)...")
    
    await asyncio.sleep(10)
    
    producer = await get_kafka_producer()
    
    # Start Agent 3 background task
    asyncio.create_task(threat_intel_worker(producer))
    
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
            data = json.loads(msg.value.decode('utf-8'))
            
            payload = data.get("payload", {})
            device_id = payload.get("device_id", "unknown")
            
            # Agent 1: Network
            network_result = network_agent.analyze_traffic(payload.get("network", {}))
            
            # Agent 2: IoT
            iot_result = iot_agent.analyze_device_behavior(device_id, payload.get("metrics", {}))
            
            anomalies = []
            
            if network_result.get("is_anomaly"):
                anomalies.append({
                    "device_id": device_id,
                    "type": "Network Anomaly",
                    "severity": "high" if network_result.get("score", 0) > 85 else "medium",
                    "description": f"LSTM/IsoForest threat score: {network_result.get('score')}",
                    "details": network_result
                })
                
            if iot_result.get("is_anomaly"):
                anomalies.append({
                    "device_id": device_id,
                    "type": "Device Behavior Anomaly",
                    "severity": "critical" if iot_result.get("score", 0) > 80 else "high",
                    "description": f"Autoencoder risk score: {iot_result.get('score')}",
                    "details": iot_result
                })
                
            # If anomalies, trigger IR Agent and Audit
            for anomaly in anomalies:
                logger.warning(f"Anomaly detected: {anomaly}")
                
                await producer.send_and_wait("alerts", json.dumps(anomaly).encode('utf-8'))
                
                # Agent 4: Incident Response
                await ir_agent.trigger_response(
                    anomaly["device_id"], 
                    anomaly["type"], 
                    anomaly["severity"], 
                    anomaly["description"]
                )
                
                # Agent 5: Audit Log
                await audit_agent.log_event(
                    action="threat_detected",
                    actor="AgentCluster",
                    target=anomaly["device_id"],
                    details=anomaly
                )

    finally:
        logger.info("Stopping Agents Orchestrator...")
        await consumer.stop()
        await producer.stop()

if __name__ == "__main__":
    asyncio.run(main())
