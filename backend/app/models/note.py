"""Smart Notes Database Models"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text, JSON,
    ForeignKey, Float, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False, default="Untitled Note")
    content = Column(Text, nullable=True, default="")
    content_type = Column(String(20), default="markdown")  # markdown, rich, plain

    # Ownership
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    folder_id = Column(Integer, ForeignKey("folders.id"), nullable=True)

    # Organization
    tags = Column(JSON, default=list)          # List of tag names
    color = Column(String(20), default="default")  # default, red, orange, yellow, green, blue, purple, pink
    labels = Column(JSON, default=list)        # Extra labels

    # State flags
    is_pinned = Column(Boolean, default=False)
    is_favorite = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    is_trashed = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)
    lock_password = Column(String(255), nullable=True)  # hashed

    # AI-generated metadata
    ai_summary = Column(Text, nullable=True)
    ai_tags = Column(JSON, default=list)
    ai_keywords = Column(JSON, default=list)
    ai_sentiment = Column(String(20), nullable=True)
    is_ai_generated = Column(Boolean, default=False)

    # Stats
    word_count = Column(Integer, default=0)
    char_count = Column(Integer, default=0)
    reading_time_minutes = Column(Float, default=0.0)
    version = Column(Integer, default=1)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    trashed_at = Column(DateTime, nullable=True)
    archived_at = Column(DateTime, nullable=True)
    last_viewed_at = Column(DateTime, nullable=True)

    # Relationships
    owner = relationship("User", foreign_keys=[user_id])
    folder = relationship("Folder", back_populates="notes")
    versions = relationship("NoteVersion", back_populates="note", cascade="all, delete-orphan")

    # Indexes for fast search
    __table_args__ = (
        Index("ix_notes_user_id", "user_id"),
        Index("ix_notes_folder_id", "folder_id"),
        Index("ix_notes_is_trashed", "is_trashed"),
        Index("ix_notes_is_archived", "is_archived"),
        Index("ix_notes_created_at", "created_at"),
    )

    def __repr__(self):
        return f"<Note(id={self.id}, title={self.title[:30]})>"


class NoteVersion(Base):
    __tablename__ = "note_versions"

    id = Column(Integer, primary_key=True, index=True)
    note_id = Column(Integer, ForeignKey("notes.id"), nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=True)
    version_number = Column(Integer, nullable=False)
    word_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    note = relationship("Note", back_populates="versions")

    def __repr__(self):
        return f"<NoteVersion(note_id={self.note_id}, v={self.version_number})>"
