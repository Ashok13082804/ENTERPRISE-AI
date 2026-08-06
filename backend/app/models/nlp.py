"""NLPVerse SQLAlchemy ORM Models for persistent module execution tracking."""
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, JSON, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class NLPExecutionLog(Base):
    """Logs every NLP sub-website module execution."""
    __tablename__ = "nlp_execution_logs"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(String(200), nullable=False, index=True)
    module_name = Column(String(200), nullable=False)
    category_id = Column(Integer, nullable=True)
    category_name = Column(String(200), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    input_text = Column(Text, nullable=False)
    output_response = Column(Text, nullable=True)
    system_prompt = Column(Text, nullable=True)
    model_used = Column(String(100), nullable=False, default="llama3")
    temperature = Column(Float, default=0.7)
    top_k = Column(Integer, default=40)
    latency_ms = Column(Integer, default=0)
    tokens_processed = Column(Integer, default=0)
    vector_similarity = Column(Float, default=0.95)
    confidence = Column(String(20), nullable=True)
    is_success = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class NLPPromptTemplate(Base):
    """Stores reusable prompt templates per NLP module."""
    __tablename__ = "nlp_prompt_templates"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(String(200), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    system_prompt = Column(Text, nullable=False)
    sample_input = Column(Text, nullable=True)
    model_preference = Column(String(100), default="llama3")
    is_public = Column(Boolean, default=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class NLPOrchestrationPipeline(Base):
    """Stores cross-module AI orchestration pipeline definitions."""
    __tablename__ = "nlp_orchestration_pipelines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    pipeline_steps = Column(JSON, nullable=False)   # list of {module_id, module_name, order}
    is_active = Column(Boolean, default=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_executed_at = Column(DateTime, nullable=True)
    total_executions = Column(Integer, default=0)


class NLPModuleAnalytics(Base):
    """Aggregate analytics per NLP sub-website module."""
    __tablename__ = "nlp_module_analytics"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(String(200), nullable=False, unique=True, index=True)
    module_name = Column(String(200), nullable=False)
    category_id = Column(Integer, nullable=True)
    total_executions = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    avg_latency_ms = Column(Float, default=0.0)
    avg_vector_score = Column(Float, default=0.95)
    last_execution_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
