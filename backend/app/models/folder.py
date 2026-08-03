"""Folder Database Model — Supports nested folders"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Folder(Base):
    __tablename__ = "folders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(10), default="📁")
    color = Column(String(20), default="default")

    # Ownership
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Nested folders support — self-referential
    parent_id = Column(Integer, ForeignKey("folders.id"), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    notes = relationship("Note", back_populates="folder")
    children = relationship(
        "Folder",
        primaryjoin="Folder.parent_id == Folder.id",
        foreign_keys="[Folder.parent_id]",
        uselist=True,
        lazy="select",
    )

    def __repr__(self):
        return f"<Folder(id={self.id}, name={self.name})>"
