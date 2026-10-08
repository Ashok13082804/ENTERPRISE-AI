"""Application Configuration"""
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # App
    APP_NAME: str = "Unified Enterprise AI Platform"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = "enterprise-ai-platform-super-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    BCRYPT_ROUNDS: int = 12
    MAX_LOGIN_ATTEMPTS: int = 5
    LOCKOUT_DURATION_MINUTES: int = 30
    SESSION_TIMEOUT_MINUTES: int = 120

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./enterprise_ai.db"
    CHROMA_DB_PATH: str = "./chroma_db"

    # Ollama
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEFAULT_MODEL: str = "llama3"
    DEFAULT_EMBEDDING_MODEL: str = "nomic-embed-text"

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # File Upload
    MAX_UPLOAD_SIZE_MB: int = 50
    UPLOAD_DIR: str = "./uploads"

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "./logs/app.log"

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100


settings = Settings()

# ─── Deep Learning Platform / Subproject Constants ───────────────────────────
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
REPORT_DIR = BASE_DIR / "reports"
EXPORT_DIR = BASE_DIR / "exports"
SAMPLES_DIR = BASE_DIR / "samples"
SUBPROJECTS_DIR = BASE_DIR / "subprojects"
DL_DATABASE_URL = f"sqlite:///{BASE_DIR / 'dl_platform.db'}"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)
EXPORT_DIR.mkdir(parents=True, exist_ok=True)
SAMPLES_DIR.mkdir(parents=True, exist_ok=True)
SUBPROJECTS_DIR.mkdir(parents=True, exist_ok=True)

MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50 MB
ALLOWED_DOCUMENT_EXTENSIONS = {
    ".pdf", ".docx", ".txt", ".csv", ".xlsx", ".pptx", ".json", ".xml", ".md", ".log"
}
ALLOWED_IMAGE_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".tiff", ".bmp", ".webp"
}
ALLOWED_DATASET_EXTENSIONS = {
    ".csv", ".tsv", ".xlsx", ".json", ".zip"
}
ALLOWED_AUDIO_EXTENSIONS = {
    ".wav", ".mp3", ".ogg", ".flac"
}
ALL_ALLOWED_EXTENSIONS = (
    ALLOWED_DOCUMENT_EXTENSIONS |
    ALLOWED_IMAGE_EXTENSIONS |
    ALLOWED_DATASET_EXTENSIONS |
    ALLOWED_AUDIO_EXTENSIONS
)

