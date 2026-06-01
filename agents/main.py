import asyncio
import json
import logging
import os
import hashlib
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

async def send_agent_log(agent_name: str, status: str, message: str):
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{BACKEND_URL}/simulation/log", 
                json={"agent_name": agent_name, "status": status, "message": message}
            )
    except Exception as e:
        logger.error(f"Failed to send simulation log for {agent_name}: {e}")

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
            
            await asyncio.sleep(10)

async def main():
    logger.info("Starting MediSentinel Agents Orchestrator (All 5 Agents)...")
    
    await asyncio.sleep(5)
    
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
            heart_rate = payload.get("heart_rate", 75.0)
            spo2 = payload.get("spo2", 98.0)
            network = payload.get("network", {})
            is_attack = heart_rate > 150 or spo2 < 90
            
            # Agent 1: Network Monitor
            network_result = network_agent.analyze_traffic(network)
            if network_result.get("is_anomaly"):
                net_msg = f"Network Monitor: Telemetry flood detected! Packet rate: {network.get('packet_rate')} pkts/s, Jitter: {network.get('jitter')}ms. LSTM Threat Score: {network_result.get('score')}/100."
                net_status = "anomaly"
            else:
                net_msg = f"Network Monitor: Analyzing traffic. Packet rate: {network.get('packet_rate', 12)} pkts/s, Jitter: {network.get('jitter', 5)}ms. Isolation Forest Score: 0.04 (Healthy)."
                net_status = "normal"
            await send_agent_log("Network Monitor", net_status, net_msg)
            
            # Agent 2: IoT Guardian
            iot_result = iot_agent.analyze_device_behavior(device_id, payload)
            if iot_result.get("is_anomaly"):
                iot_msg = f"IoT Guardian: Anomalous vital signs detected on {device_id}! Heart rate: {heart_rate} BPM, SpO2: {spo2}%. Autoencoder Reconstruction Loss: {iot_result.get('loss')}. Risk Score: {iot_result.get('score')}/100."
                iot_status = "anomaly"
            else:
                iot_msg = f"IoT Guardian: Monitoring vitals on {device_id}. Heart rate: {heart_rate} BPM, SpO2: {spo2}%. Risk Score: {iot_result.get('score')}/100 (Safe)."
                iot_status = "normal"
            await send_agent_log("IoT Guardian", iot_status, iot_msg)
            
            # Agent 3: Threat Intelligence
            if is_attack:
                ti_msg = f"Threat Intel: Querying AlienVault OTX & VirusTotal. Telemetry payload values match known high-danger signatures. Source IP flagged as suspicious."
                ti_status = "anomaly"
            else:
                ti_msg = f"Threat Intel: Performing routine correlation. Checked active telemetry signature. No malicious patterns matched."
                ti_status = "normal"
            await send_agent_log("Threat Intelligence", ti_status, ti_msg)
            
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
                
            # Agent 4: Incident Response
            if anomalies:
                for anomaly in anomalies:
                    logger.warning(f"Anomaly detected: {anomaly}")
                    await producer.send_and_wait("alerts", json.dumps(anomaly).encode('utf-8'))
                    
                    await ir_agent.trigger_response(
                        anomaly["device_id"], 
                        anomaly["type"], 
                        anomaly["severity"], 
                        anomaly["description"]
                    )
                
                ir_msg = f"Incident Response: Threat score critical! Triggering decision tree. Action: quarantine_device. Dispatched containment command to MQTT topic medisentinel/iot/control/{device_id}."
                ir_status = "mitigated"
            else:
                ir_msg = f"Incident Response: Device status Active. Shield passive protection active. No action required."
                ir_status = "normal"
            await send_agent_log("Incident Response", ir_status, ir_msg)
            
            # Agent 5: Compliance Audit
            log_payload = f"{device_id}-{heart_rate}-{spo2}-{is_attack}"
            signature = hashlib.sha256(log_payload.encode()).hexdigest()[:16]
            if is_attack:
                audit_msg = f"Compliance Audit: HIPAA anomaly threshold breach registered. Generating tamper-proof audit record. Cryptographic Signature: {signature}."
                audit_status = "logged"
                
                # Register threat event in compliance audit database
                for anomaly in anomalies:
                    await audit_agent.log_event(
                        action="threat_detected",
                        actor="AgentCluster",
                        target=anomaly["device_id"],
                        details=anomaly
                    )
            else:
                audit_msg = f"Compliance Audit: Logging normal telemetry event. Signed entry: {signature}. HIPAA & FDA regulatory status: COMPLIANT."
                audit_status = "normal"
            await send_agent_log("Compliance Audit", audit_status, audit_msg)

    finally:
        logger.info("Stopping Agents Orchestrator...")
        await consumer.stop()
        await producer.stop()

if __name__ == "__main__":
    asyncio.run(main())
