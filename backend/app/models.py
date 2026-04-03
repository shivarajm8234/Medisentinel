import enum
from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class RoleEnum(str, enum.Enum):
    admin = "admin"
    analyst = "analyst"
    viewer = "viewer"


class SeverityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.viewer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, unique=True, index=True, nullable=False)  # Uniquely identifies across systems
    device_type = Column(String, index=True, nullable=False)
    status = Column(String, default="active")  # active, quarantined, offline
    metadata_json = Column(JSON, default={})
    first_seen = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), onupdate=func.now())


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, ForeignKey("devices.device_id"), index=True)
    type = Column(String, nullable=False)  # anomaly, attack, offline
    severity = Column(Enum(SeverityEnum), default=SeverityEnum.medium)
    description = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    is_resolved = Column(Boolean, default=False)
    resolved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
