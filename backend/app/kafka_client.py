import asyncio
import json
import logging
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from app.config import get_settings
from app.ws_manager import ws_manager

settings = get_settings()
logger = logging.getLogger(__name__)

async def get_kafka_producer():
    producer = AIOKafkaProducer(bootstrap_servers=settings.kafka_bootstrap_servers)
    await producer.start()
    try:
        yield producer
    finally:
        await producer.stop()

async def produce_message(topic: str, message: dict):
    producer = AIOKafkaProducer(bootstrap_servers=settings.kafka_bootstrap_servers)
    await producer.start()
    try:
        await producer.send_and_wait(topic, json.dumps(message).encode('utf-8'))
    finally:
        await producer.stop()

async def consume_kafka_alerts():
    consumer = AIOKafkaConsumer(
        'alerts', 'anomalies',
        bootstrap_servers=settings.kafka_bootstrap_servers,
        group_id="backend-alert-consumer",
        auto_offset_reset="earliest"
    )
    # Await Kafka to be ready logic might be needed in a real env, we will retry
    while True:
        try:
            await consumer.start()
            logger.info("Kafka consumer started listening for alerts.")
            break
        except Exception as e:
            logger.warning(f"Waiting for Kafka... {e}")
            await asyncio.sleep(5)

    try:
        async for msg in consumer:
            logger.info(f"Received message on topic {msg.topic}: {msg.value}")
            data = json.loads(msg.value.decode('utf-8'))
            
            # Broadcast to UI via WebSockets
            ws_payload = {
                "topic": msg.topic,
                "data": data
            }
            await ws_manager.broadcast(json.dumps(ws_payload))
            
            # Save alert to DB here if it's an alert (omitted for brevity, handled by agents or another service usually)
            
    finally:
        await consumer.stop()
