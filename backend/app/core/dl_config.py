import os
from pathlib import Path

# Base backend directory: /Users/ashokkumar/Downloads/FInal_Year/backend
BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
REPORT_DIR = BASE_DIR / "reports"
EXPORT_DIR = BASE_DIR / "exports"
SAMPLES_DIR = BASE_DIR / "samples"
SUBPROJECTS_DIR = BASE_DIR / "subprojects"
DB_PATH = BASE_DIR / "dl_platform.db"
PROJECTS_JSON_PATH = BASE_DIR / "projects.json"

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

DATABASE_URL = f"sqlite:///{DB_PATH}"
SECRET_KEY = "enterprise-ai-dl-platform-key"
ALGORITHM = "HS256"
