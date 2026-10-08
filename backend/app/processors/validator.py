import os
import mimetypes
from pathlib import Path
from typing import Dict, Any, Tuple
from app.core.config import MAX_UPLOAD_SIZE, ALL_ALLOWED_EXTENSIONS

# Common magic bytes signatures
MAGIC_SIGNATURES = {
    b"%PDF-": "pdf",
    b"\x89PNG\r\n\x1a\n": "png",
    b"\xff\xd8\xff": "jpeg",
    b"GIF87a": "gif",
    b"GIF89a": "gif",
    b"RIFF": "riff",  # WAV or WEBP
    b"PK\x03\x04": "zip",  # ZIP, DOCX, XLSX, PPTX
    b"II*\x00": "tiff",
    b"MM\x00*": "tiff",
    b"BM": "bmp",
}

def detect_file_type(file_path: str, original_filename: str) -> Tuple[str, str, str]:
    """
    Returns (file_type, file_category, mime_type)
    """
    ext = Path(original_filename).suffix.lower()
    mime_type, _ = mimetypes.guess_type(original_filename)
    if not mime_type:
        mime_type = "application/octet-stream"

    # Read first 32 bytes for signature
    magic_type = None
    try:
        with open(file_path, "rb") as f:
            header = f.read(32)
            for magic, fmt in MAGIC_SIGNATURES.items():
                if header.startswith(magic):
                    magic_type = fmt
                    break
    except Exception:
        pass

    # Resolve specific Office XML formats
    file_type = ext.replace(".", "") if ext else "unknown"
    if magic_type == "zip":
        if ext in [".docx", ".xlsx", ".pptx"]:
            file_type = ext.replace(".", "")
        else:
            file_type = "zip"
    elif magic_type in ["jpeg", "png", "tiff", "bmp"]:
        file_type = magic_type
    elif magic_type == "pdf":
        file_type = "pdf"
    elif magic_type == "riff":
        if ext == ".webp":
            file_type = "webp"
        elif ext == ".wav":
            file_type = "wav"

    # Map to major category
    if file_type in ["pdf", "docx", "txt", "pptx", "md", "xml", "log"]:
        file_category = "document"
    elif file_type in ["csv", "tsv", "xlsx", "json"]:
        file_category = "tabular"
    elif file_type in ["jpg", "jpeg", "png", "tiff", "bmp", "webp"]:
        file_category = "image"
    elif file_type in ["wav", "mp3", "ogg", "flac"]:
        file_category = "audio"
    elif file_type == "zip":
        file_category = "archive"
    else:
        file_category = "other"

    return file_type, file_category, mime_type

def validate_uploaded_file(file_path: str, filename: str) -> Dict[str, Any]:
    if not os.path.exists(file_path):
        return {"is_valid": False, "error": "File does not exist"}

    file_size = os.path.getsize(file_path)
    if file_size == 0:
        return {"is_valid": False, "error": "Uploaded file is empty (0 bytes)"}

    if file_size > MAX_UPLOAD_SIZE:
        return {"is_valid": False, "error": f"File exceeds maximum allowed size of {MAX_UPLOAD_SIZE // (1024*1024)}MB"}

    ext = Path(filename).suffix.lower()
    if ext and ext not in ALL_ALLOWED_EXTENSIONS:
        return {"is_valid": False, "error": f"Unsupported file extension: {ext}"}

    file_type, file_category, mime_type = detect_file_type(file_path, filename)

    return {
        "is_valid": True,
        "filename": filename,
        "file_path": file_path,
        "file_size": file_size,
        "file_type": file_type,
        "file_category": file_category,
        "mime_type": mime_type
    }
