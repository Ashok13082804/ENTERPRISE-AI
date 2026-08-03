"""Blockchain Record Model"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Boolean
from app.core.database import Base


class BlockchainRecord(Base):
    __tablename__ = "blockchain_records"

    id = Column(Integer, primary_key=True, index=True)
    block_index = Column(Integer, unique=True, nullable=False)
    block_hash = Column(String(255), unique=True, nullable=False, index=True)
    previous_hash = Column(String(255), nullable=False)
    
    # Data
    record_type = Column(String(100), nullable=False)  # certificate, document, audit
    data = Column(JSON, nullable=False)
    data_hash = Column(String(255), nullable=False)
    
    # Metadata
    issuer = Column(String(255), nullable=True)
    recipient = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    
    # Verification
    is_verified = Column(Boolean, default=True)
    nonce = Column(Integer, default=0)
    
    # Timestamps
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    def __repr__(self):
        return f"<BlockchainRecord(index={self.block_index}, hash={self.block_hash[:10]}...)>"
