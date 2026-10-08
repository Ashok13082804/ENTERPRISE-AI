import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class DBUser(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), default="AI Researcher")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    documents = relationship("DBDocument", back_populates="user", cascade="all, delete-orphan")
    analyses = relationship("DBAnalysis", back_populates="user", cascade="all, delete-orphan")

class DBDocument(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=True)
    file_type = Column(String(50), nullable=False)
    upload_time = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("DBUser", back_populates="documents")
    profile = relationship("DBInputProfile", back_populates="document", uselist=False, cascade="all, delete-orphan")
    analyses = relationship("DBAnalysis", back_populates="document", cascade="all, delete-orphan")

class DBInputProfile(Base):
    __tablename__ = "input_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    profile_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("DBDocument", back_populates="profile")

class DBAnalysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default="pending")  # pending, processing, completed, failed
    mode = Column(String(50), default="auto")       # auto, manual
    total_modules = Column(Integer, default=450)
    applicable_count = Column(Integer, default=0)
    completed_count = Column(Integer, default=0)
    skipped_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    execution_time = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("DBDocument", back_populates="analyses")
    user = relationship("DBUser", back_populates="analyses")
    module_results = relationship("DBModuleResult", back_populates="analysis", cascade="all, delete-orphan")
    report = relationship("DBReport", back_populates="analysis", uselist=False, cascade="all, delete-orphan")
    logs = relationship("DBProcessingLog", back_populates="analysis", cascade="all, delete-orphan")

class DBModuleResult(Base):
    __tablename__ = "module_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=False)
    module_id = Column(String(50), nullable=False)
    module_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False)     # completed, skipped, failed
    confidence = Column(Float, default=0.0)
    result_json = Column(Text, nullable=True)
    visualization_json = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    execution_time = Column(Float, default=0.0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    analysis = relationship("DBAnalysis", back_populates="module_results")

class DBReport(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=True)
    full_report_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    analysis = relationship("DBAnalysis", back_populates="report")
    sections = relationship("DBReportSection", back_populates="report", cascade="all, delete-orphan")

class DBReportSection(Base):
    __tablename__ = "report_sections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    section_index = Column(Integer, nullable=False)
    section_title = Column(String(255), nullable=False)
    content_json = Column(Text, nullable=False)

    report = relationship("DBReport", back_populates="sections")

class DBProcessingLog(Base):
    __tablename__ = "processing_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=False)
    level = Column(String(20), default="INFO")  # INFO, WARNING, ERROR, SUCCESS
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    analysis = relationship("DBAnalysis", back_populates="logs")
