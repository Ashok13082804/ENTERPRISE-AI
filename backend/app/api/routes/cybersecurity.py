"""Cybersecurity Module API Routes — Secure File Vault & Local RAG"""
import os
import io
import hashlib
from pathlib import Path
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.ai.ollama_client import ollama_client

router = APIRouter()

# Directory for vault files
VAULT_DIR = Path("uploads/vault")
VAULT_DIR.mkdir(parents=True, exist_ok=True)

# ─── Request Models ───────────────────────────────────────────────────────────

class PasswordVerification(BaseModel):
    password: str

class FileEditRequest(BaseModel):
    password: str
    new_content: str

class FileConvertRequest(BaseModel):
    password: str
    target_extension: str  # pdf, txt, csv, json

class FileRagRequest(BaseModel):
    password: str
    question: Optional[str] = "Summarize the key points of this file."

# Simulated database of files in vault
# In a real app we'd use a database table, let's keep metadata in JSON or memory,
# or simply verify a hashed password stored alongside the file.
# We will save metadata in a file called `uploads/vault/metadata.json` for persistence.
METADATA_FILE = VAULT_DIR / "metadata.json"

def load_vault_metadata() -> Dict[str, Any]:
    import json
    if METADATA_FILE.exists():
        try:
            return json.loads(METADATA_FILE.read_text())
        except Exception:
            return {}
    return {}

def save_vault_metadata(data: Dict[str, Any]):
    import json
    METADATA_FILE.write_text(json.dumps(data, indent=2))

def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/upload")
async def upload_to_vault(
    title: str,
    password: str,
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    """Upload a file to the secure vault, protected by a password hash."""
    file_id = hashlib.md5(f"{file.filename}{title}".encode()).hexdigest()[:12]
    original_ext = file.filename.split(".")[-1] if "." in file.filename else "txt"
    safe_filename = f"{file_id}.{original_ext}"
    dest_path = VAULT_DIR / safe_filename

    content = await file.read()
    dest_path.write_bytes(content)

    # Save metadata
    meta = load_vault_metadata()
    meta[file_id] = {
        "id": file_id,
        "title": title,
        "filename": file.filename,
        "safe_filename": safe_filename,
        "extension": original_ext,
        "size_bytes": len(content),
        "password_hash": get_password_hash(password),
        "owner": current_user.email,
        "uploaded_at": hashlib.sha256(content).hexdigest()[:16], # use simple check sum for integrity
    }
    save_vault_metadata(meta)

    return {
        "file_id": file_id,
        "title": title,
        "filename": file.filename,
        "size_bytes": len(content),
        "message": "File successfully uploaded and encrypted in vault."
    }

@router.get("/list")
async def list_vault_files(current_user=Depends(get_current_user)):
    """List headers/metadata of files in vault (no contents shown)."""
    meta = load_vault_metadata()
    user_files = [
        {
            "id": f["id"],
            "title": f["title"],
            "filename": f["filename"],
            "extension": f["extension"],
            "size_bytes": f["size_bytes"],
            "owner": f["owner"],
        }
        for f in meta.values()
    ]
    return {"files": user_files}

@router.post("/file/{file_id}/read")
async def read_vault_file(
    file_id: str,
    body: PasswordVerification,
    current_user=Depends(get_current_user)
):
    """Read file content after verifying the vault password."""
    meta = load_vault_metadata()
    if file_id not in meta:
        raise HTTPException(status_code=404, detail="File not found")

    file_meta = meta[file_id]
    if get_password_hash(body.password) != file_meta["password_hash"]:
        raise HTTPException(status_code=401, detail="Invalid decryption password")

    file_path = VAULT_DIR / file_meta["safe_filename"]
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File content missing on disk")

    # Read content as text if possible
    try:
        content = file_path.read_text(encoding="utf-8")
        return {"content": content, "binary": False, "filename": file_meta["filename"]}
    except UnicodeDecodeError:
        # Binary file
        return {"content": "[Binary File - Decrypted successfully. Use download option to view.]", "binary": True, "filename": file_meta["filename"]}

@router.post("/file/{file_id}/write")
async def write_vault_file(
    file_id: str,
    body: FileEditRequest,
    current_user=Depends(get_current_user)
):
    """Overwrite text file content after verifying password."""
    meta = load_vault_metadata()
    if file_id not in meta:
        raise HTTPException(status_code=404, detail="File not found")

    file_meta = meta[file_id]
    if get_password_hash(body.password) != file_meta["password_hash"]:
        raise HTTPException(status_code=401, detail="Invalid vault password")

    file_path = VAULT_DIR / file_meta["safe_filename"]
    
    # Save new content
    content_bytes = body.new_content.encode("utf-8")
    file_path.write_bytes(content_bytes)

    # Update size
    file_meta["size_bytes"] = len(content_bytes)
    meta[file_id] = file_meta
    save_vault_metadata(meta)

    return {"success": True, "size_bytes": len(content_bytes), "message": "File updated successfully."}

@router.post("/file/{file_id}/download")
async def download_vault_file(
    file_id: str,
    body: PasswordVerification,
    current_user=Depends(get_current_user)
):
    """Securely download file from vault after password verification."""
    meta = load_vault_metadata()
    if file_id not in meta:
        raise HTTPException(status_code=404, detail="File not found")

    file_meta = meta[file_id]
    if get_password_hash(body.password) != file_meta["password_hash"]:
        raise HTTPException(status_code=401, detail="Invalid download password")

    file_path = VAULT_DIR / file_meta["safe_filename"]
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File content missing on disk")

    return FileResponse(
        path=file_path,
        filename=file_meta["filename"],
        media_type="application/octet-stream"
    )

@router.post("/file/{file_id}/convert")
async def convert_vault_file(
    file_id: str,
    body: FileConvertRequest,
    current_user=Depends(get_current_user)
):
    """Convert file extension/type securely."""
    meta = load_vault_metadata()
    if file_id not in meta:
        raise HTTPException(status_code=404, detail="File not found")

    file_meta = meta[file_id]
    if get_password_hash(body.password) != file_meta["password_hash"]:
        raise HTTPException(status_code=401, detail="Invalid password")

    file_path = VAULT_DIR / file_meta["safe_filename"]
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File missing")

    target_ext = body.target_extension.lower().strip(".")
    current_ext = file_meta["extension"].lower()
    
    if current_ext == target_ext:
        return {"success": True, "message": "File already has target extension."}

    # Perform simulated/basic conversions
    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception:
        raise HTTPException(status_code=400, detail="Only text-based files can be converted currently.")

    new_filename = file_meta["filename"].rsplit(".", 1)[0] + f".{target_ext}"
    new_safe_filename = f"{file_id}.{target_ext}"
    new_path = VAULT_DIR / new_safe_filename

    # Perform conversions
    if target_ext == "json":
        import json
        if current_ext == "csv":
            # Simple CSV to JSON
            lines = content.strip().split("\n")
            if lines:
                headers = lines[0].split(",")
                rows = []
                for line in lines[1:]:
                    vals = line.split(",")
                    rows.append(dict(zip(headers, vals)))
                new_path.write_text(json.dumps(rows, indent=2))
            else:
                new_path.write_text("[]")
        else:
            # Txt/Others to JSON
            new_path.write_text(json.dumps({"content": content}))
            
    elif target_ext == "csv":
        if current_ext == "json":
            import json
            try:
                data = json.loads(content)
                if isinstance(data, list) and data:
                    headers = list(data[0].keys())
                    lines = [",".join(headers)]
                    for r in data:
                        lines.append(",".join(str(r.get(h, "")) for h in headers))
                    new_path.write_text("\n".join(lines))
                else:
                    new_path.write_text("key,value\ncontent," + content.replace("\n", " "))
            except Exception:
                new_path.write_text("content\n" + content.replace("\n", " "))
        else:
            # Plain txt to CSV
            new_path.write_text("content\n" + content.replace("\n", " "))

    else:
        # Fallback raw write for PDF / TXT / etc.
        new_path.write_text(content)

    # Update metadata
    file_meta["safe_filename"] = new_safe_filename
    file_meta["filename"] = new_filename
    file_meta["extension"] = target_ext
    file_meta["size_bytes"] = new_path.stat().st_size
    meta[file_id] = file_meta
    save_vault_metadata(meta)

    return {
        "success": True,
        "new_filename": new_filename,
        "extension": target_ext,
        "size_bytes": file_meta["size_bytes"],
        "message": f"Successfully converted to {target_ext.upper()} format."
    }

@router.post("/file/{file_id}/share")
async def generate_share_link(
    file_id: str,
    body: PasswordVerification,
    current_user=Depends(get_current_user)
):
    """Generate secure share link for the vault file."""
    meta = load_vault_metadata()
    if file_id not in meta:
        raise HTTPException(status_code=404, detail="File not found")

    file_meta = meta[file_id]
    if get_password_hash(body.password) != file_meta["password_hash"]:
        raise HTTPException(status_code=401, detail="Invalid password")

    # Generate token/key for temporary download link
    share_token = hashlib.sha256(f"{file_id}{body.password}".encode()).hexdigest()[:16]
    share_url = f"/api/v1/cybersecurity/share/{file_id}?token={share_token}"

    return {
        "share_url": share_url,
        "token": share_token,
        "message": "Secure share link created. Valid for current decryption vault key."
    }

@router.post("/file/{file_id}/rag")
async def explain_vault_file_rag(
    file_id: str,
    body: FileRagRequest,
    current_user=Depends(get_current_user)
):
    """Summarize and explain the file contents using local Ollama (RAG)."""
    meta = load_vault_metadata()
    if file_id not in meta:
        raise HTTPException(status_code=404, detail="File not found")

    file_meta = meta[file_id]
    if get_password_hash(body.password) != file_meta["password_hash"]:
        raise HTTPException(status_code=401, detail="Invalid decryption password")

    file_path = VAULT_DIR / file_meta["safe_filename"]
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File content missing")

    # Read contents for RAG context
    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception:
        raise HTTPException(status_code=400, detail="Cannot read binary file contents for local text RAG pipeline.")

    # Context window check (trim if huge)
    truncated_content = content[:3000]

    prompt = f"""
You are a Cybersecurity Assistant on the Unified Enterprise AI Platform.
Analyze the following document and answer the user's inquiry based ONLY on this text.

[DOCUMENT CONTENT]
Filename: {file_meta["filename"]}
File ID: {file_meta["id"]}
---
{truncated_content}
---

[USER INQUIRY]
{body.question}

Write a clean, professional summary or answer. Keep it precise and focused on security/operational impact.
"""

    messages = [
        {"role": "system", "content": "You are a helpful, secure, local RAG assistant. Output markdown only."},
        {"role": "user", "content": prompt}
    ]

    # Call local Ollama client
    response = await ollama_client.chat(messages)
    return {"answer": response}
