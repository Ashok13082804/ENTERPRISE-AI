"""Document Database Model"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    filename = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, docx, xlsx, etc
    file_size = Column(Integer, nullable=False)  # bytes
    
    # Content
    content_text = Column(Text, nullable=True)  # extracted text
    summary = Column(Text, nullable=True)  # AI-generated summary
    tags = Column(JSON, default=list)
    category = Column(String(100), nullable=True)
    
    # RAG
    is_indexed = Column(Boolean, default=False)
    chunk_count = Column(Integer, default=0)
    vector_collection = Column(String(255), nullable=True)
    
    # OCR
    is_ocr_processed = Column(Boolean, default=False)
    
    # Versioning
    version = Column(Integer, default=1)
    parent_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    
    # Ownership
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    department = Column(String(100), nullable=True)
    is_public = Column(Boolean, default=False)
    
    # Blockchain
    document_hash = Column(String(255), nullable=True)
    blockchain_record_id = Column(Integer, nullable=True)
    
    # Status
    is_deleted = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="documents")
    
    def __repr__(self):
        return f"<Document(id={self.id}, title={self.title})>"
