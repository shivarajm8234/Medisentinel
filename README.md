# MediSentinel Enterprise Cybersecurity Framework

An AI-driven, autonomous cybersecurity framework designed to protect healthcare infrastructure and Medical IoT ecosystems in real-time.

## Features
- **Multi-Agent AI**: Network Monitor, IoT Guardian, and Incident Response agents.
- **Sub-second Anomaly Detection**: Isolation Forest, LSTM, and Autoencoders detect deviations instantly.
- **Kafka & MQTT Backend**: Real-time multi-topic data ingestion.
- **Glassmorphic React Dashboard**: Stunning aesthetic UI with real-time websocket connections.

## Architecture

```
[Medical IoT Endpoints] -> MQTT -> [FastAPI + Kafka Bridge] -> [AI Agents Cluster]
                                            ↓
                                   [WebSockets] -> [React Dashboard]
```

## Quick Start (Docker Compose)

1. Clone repo.
2. Run standard infrastructure (Kafka, Mosquitto, Backend, Agents):
```bash
docker-compose up --build -d
```
3. Start the Frontend dashboard:
```bash
cd frontend
npm install
npm run dev
```
4. Generate Traffic:
```bash
pip install paho-mqtt
python scripts/simulator.py
```
*(The simulator injects mock MQTT traffic and occasional anomalies. The AI agents detect this on the Kafka bus and trigger WebSockets to the UI)*

## Services & Ports
- Backend (FastAPI): `:8000`
- Frontend (React): `:5173` (Vite)
- MQTT (Mosquitto): `:1883`
- Kafka Broker: `:9092`
