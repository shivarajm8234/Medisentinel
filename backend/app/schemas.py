from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime
from app.models import RoleEnum, SeverityEnum


# ─── Auth / User ───────────────────────────────────────────────────
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[RoleEnum] = None


class UserBase(BaseModel):
    username: str
    is_active: bool = True
    role: RoleEnum = RoleEnum.viewer


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ─── Device ────────────────────────────────────────────────────────
class DeviceBase(BaseModel):
    device_id: str
    device_type: str
    status: str = "active"
    metadata_json: Dict[str, Any] = {}


class DeviceCreate(DeviceBase):
    pass


class DeviceUpdate(BaseModel):
    status: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None


class Device(DeviceBase):
    id: int
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# ─── Alert ─────────────────────────────────────────────────────────
class AlertBase(BaseModel):
    device_id: str
    type: str
    severity: SeverityEnum
    description: str


class AlertCreate(AlertBase):
    pass


class AlertUpdate(BaseModel):
    is_resolved: Optional[bool] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[int] = None


class Alert(AlertBase):
    id: int
    timestamp: datetime
    is_resolved: bool
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)
