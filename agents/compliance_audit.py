import logging
import json
import hashlib
from typing import Dict, Any
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://medi_user:medi_password@localhost:5432/medisentinel")

class ComplianceAuditAgent:
    def __init__(self):
        self.engine = create_async_engine(DATABASE_URL, echo=False)
        self.SessionLocal = sessionmaker(self.engine, class_=AsyncSession, expire_on_commit=False)
        self.last_hash = "GENESIS_HASH_00000000000000000000000000000000000000000000000000000"
        
    async def log_event(self, action: str, actor: str, target: str, details: Dict[str, Any]):
        """
        Appends a cryptographically linked log entry.
        """
        content_to_hash = f"{self.last_hash}{action}{actor}{target}{json.dumps(details, sort_keys=True)}"
        current_hash = hashlib.sha256(content_to_hash.encode()).hexdigest()
        
        async with self.SessionLocal() as session:
            # We construct a raw insert to avoid needing the full SQLAlchemy models here
            # or we could define a lightweight model. Let's use raw SQL for simplicity in agent.
            from sqlalchemy import text
            try:
                await session.execute(
                    text("""
                        INSERT INTO audit_logs (action, actor, target, details, previous_hash, current_hash)
                        VALUES (:action, :actor, :target, :details, :prev_hash, :curr_hash)
                    """),
                    {
                        "action": action,
                        "actor": actor,
                        "target": target,
                        "details": json.dumps(details),
                        "prev_hash": self.last_hash,
                        "curr_hash": current_hash
                    }
                )
                await session.commit()
                self.last_hash = current_hash
                logger.info(f"ComplianceAudit: Logged event '{action}' with hash {current_hash[:8]}...")
            except Exception as e:
                logger.error(f"ComplianceAudit error: {e}")
                await session.rollback()
