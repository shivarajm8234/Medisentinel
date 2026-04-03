from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Security
    secret_key: str = "medisentinel_super_secret_key_change_in_prod"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # Database
    database_url: str = "sqlite+aiosqlite:///./medisentinel.db"

    # Kafka
    kafka_bootstrap_servers: str = "localhost:9092"

    # MQTT
    mqtt_broker_host: str = "localhost"
    mqtt_broker_port: int = 1883

    # Backend
    backend_url: str = "http://localhost:8000"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
