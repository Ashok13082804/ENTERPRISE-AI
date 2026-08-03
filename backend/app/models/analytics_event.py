"""Analytics Event Model"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, Float
from app.core.database import Base


class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), nullable=False, index=True)
    category = Column(String(100), nullable=True)
    user_id = Column(Integer, nullable=True)
    session_id = Column(String(255), nullable=True)
    value = Column(Float, nullable=True)
    event_metadata = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
