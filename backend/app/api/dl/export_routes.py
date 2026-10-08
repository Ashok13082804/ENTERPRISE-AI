import os
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.core.config import EXPORT_DIR

router = APIRouter(prefix="/api/exports", tags=["Report Exports"])

@router.api_route("/{filename}", methods=["GET", "HEAD"])
def download_export_file(filename: str):
    file_path = EXPORT_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Export file not found")

    media_types = {
        ".pdf": "application/pdf",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".html": "text/html",
        ".json": "application/json",
        ".csv": "text/csv",
        ".txt": "text/plain",
        ".zip": "application/zip"
    }
    ext = file_path.suffix.lower()
    media_type = media_types.get(ext, "application/octet-stream")

    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type=media_type
    )
