"""Documents Management Routes"""
import os
import time
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
import base64
import hashlib
import io
from cryptography.fernet import Fernet

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.document import Document
from app.ai.rag_pipeline import extract_text
from app.blockchain.blockchain_service import blockchain_service

router = APIRouter()


class UnlockRequest(BaseModel):
    password: str


class CorrectionRequest(BaseModel):
    password: str
    content_text: str


class ConvertRequest(BaseModel):
    format: str
    password: Optional[str] = None


def get_fernet(password: str) -> Fernet:
    key = base64.urlsafe_b64encode(hashlib.sha256(password.encode()).digest())
    return Fernet(key)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form("general"),
    is_public: bool = Form(False),
    password: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Upload a document."""
    ext = Path(file.filename).suffix.lstrip(".").lower()
    
    upload_dir = Path(settings.UPLOAD_DIR) / "documents"
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    safe_name = f"{current_user.id}_{int(time.time())}_{file.filename}"
    file_path = upload_dir / safe_name
    
    content = await file.read()
    
    # Optional password encryption
    tags_metadata = {}
    if password:
        fernet = get_fernet(password)
        encrypted_content = fernet.encrypt(content)
        content_to_save = encrypted_content
        tags_metadata = {
            "password_hash": hashlib.sha256(password.encode()).hexdigest(),
            "is_locked": True
        }
    else:
        content_to_save = content
        
    with open(file_path, "wb") as f:
        f.write(content_to_save)
    
    # Extract text from raw content (if readable)
    text = ""
    try:
        text = extract_text(str(file_path), ext)
    except Exception:
        text = "Encrypted binary document content."
        
    # Generate hash
    doc_hash = hashlib.sha256(content_to_save).hexdigest()
    
    doc = Document(
        title=file.filename,
        filename=safe_name,
        file_path=str(file_path),
        file_type=ext,
        file_size=len(content_to_save),
        content_text=text[:10000] if text else None,
        category=category,
        is_public=is_public,
        owner_id=current_user.id,
        document_hash=doc_hash,
        tags=tags_metadata,
    )
    db.add(doc)
    await db.flush()
    
    # Register document on blockchain
    block = await blockchain_service.add_record(
        db=db,
        data={
            "document_id": doc.id,
            "document_title": doc.title,
            "document_hash": doc_hash,
            "registered_by": current_user.email,
            "version": 1,
        },
        record_type="document",
        issuer=current_user.email,
        description=f"Register Document: {doc.title} (v1)",
    )
    
    return {
        "id": doc.id,
        "title": doc.title,
        "file_type": doc.file_type,
        "file_size": doc.file_size,
        "category": doc.category,
        "document_hash": doc_hash,
        "is_locked": bool(password),
        "blockchain_record": block["index"],
    }


@router.get("/")
async def list_documents(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    file_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """List user documents."""
    query = select(Document).where(
        Document.owner_id == current_user.id,
        Document.is_deleted == False,
    )
    if category:
        query = query.where(Document.category == category)
    if file_type:
        query = query.where(Document.file_type == file_type)
    
    result = await db.execute(query.offset(skip).limit(limit))
    docs = result.scalars().all()
    
    total_result = await db.execute(
        select(func.count(Document.id)).where(
            Document.owner_id == current_user.id,
            Document.is_deleted == False,
        )
    )
    total = total_result.scalar()
    
    return {
        "total": total,
        "documents": [
            {
                "id": d.id,
                "title": d.title,
                "file_type": d.file_type,
                "file_size": d.file_size,
                "category": d.category,
                "is_indexed": d.is_indexed,
                "summary": d.summary,
                "document_hash": d.document_hash,
                "created_at": d.created_at.isoformat(),
            }
            for d in docs
        ],
    }


@router.get("/{doc_id}")
async def get_document(
    doc_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get document details."""
    result = await db.execute(
        select(Document).where(Document.id == doc_id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")
    
    return {
        "id": doc.id,
        "title": doc.title,
        "file_type": doc.file_type,
        "file_size": doc.file_size,
        "content_text": doc.content_text,
        "summary": doc.summary,
        "category": doc.category,
        "tags": doc.tags,
        "is_indexed": doc.is_indexed,
        "chunk_count": doc.chunk_count,
        "document_hash": doc.document_hash,
        "created_at": doc.created_at.isoformat(),
    }


@router.delete("/{doc_id}")
async def delete_document(
    doc_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Soft delete a document."""
    result = await db.execute(
        select(Document).where(
            Document.id == doc_id,
            Document.owner_id == current_user.id
        )
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")
    
    doc.is_deleted = True
    return {"message": "Document deleted"}


@router.get("/{doc_id}/download")
async def download_document(
    doc_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Download a document file."""
    result = await db.execute(
        select(Document).where(Document.id == doc_id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")
    
    if not os.path.exists(doc.file_path):
        raise HTTPException(404, "File not found on disk")
    
    return FileResponse(
        path=doc.file_path,
        filename=doc.title,
        media_type="application/octet-stream",
    )


@router.post("/{doc_id}/unlock")
async def unlock_document(
    doc_id: int,
    body: UnlockRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Decrypt and return document text content."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")
        
    is_locked = doc.tags and doc.tags.get("is_locked")
    if not is_locked:
        # Not locked, read file directly
        with open(doc.file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        return {"content": content, "is_locked": False}
        
    pwd_hash = doc.tags.get("password_hash")
    input_hash = hashlib.sha256(body.password.encode()).hexdigest()
    if pwd_hash != input_hash:
        raise HTTPException(400, "Incorrect document password")
        
    try:
        fernet = get_fernet(body.password)
        with open(doc.file_path, "rb") as f:
            enc_data = f.read()
        dec_data = fernet.decrypt(enc_data)
        return {"content": dec_data.decode("utf-8", errors="ignore"), "is_locked": True}
    except Exception as e:
        raise HTTPException(400, f"Decryption failed: {str(e)}")


@router.post("/{doc_id}/correct")
async def write_correction(
    doc_id: int,
    body: CorrectionRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Write correction to document (re-encrypt, update DB, register on blockchain)."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")
        
    is_locked = doc.tags and doc.tags.get("is_locked")
    if is_locked:
        pwd_hash = doc.tags.get("password_hash")
        input_hash = hashlib.sha256(body.password.encode()).hexdigest()
        if pwd_hash != input_hash:
            raise HTTPException(400, "Incorrect document password")
            
    # Save correction
    content_bytes = body.content_text.encode("utf-8")
    if is_locked:
        fernet = get_fernet(body.password)
        content_to_save = fernet.encrypt(content_bytes)
    else:
        content_to_save = content_bytes
        
    with open(doc.file_path, "wb") as f:
        f.write(content_to_save)
        
    # Recalculate hash
    new_hash = hashlib.sha256(content_to_save).hexdigest()
    doc.document_hash = new_hash
    doc.version += 1
    doc.content_text = body.content_text[:10000]
    
    # Register block on blockchain
    block = await blockchain_service.add_record(
        db=db,
        data={
            "document_id": doc.id,
            "document_title": doc.title,
            "document_hash": new_hash,
            "registered_by": current_user.email,
            "version": doc.version,
            "correction_text": body.content_text[:100],
        },
        record_type="document_correction",
        issuer=current_user.email,
        description=f"Correction registered for: {doc.title} (v{doc.version})",
    )
    await db.commit()
    
    return {
        "success": True,
        "version": doc.version,
        "document_hash": new_hash,
        "blockchain_record": block["index"],
        "block_hash": block["hash"],
    }


@router.get("/{doc_id}/corrections")
async def read_corrections(
    doc_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Retrieve full history of modifications from the blockchain ledger."""
    from app.models.blockchain_record import BlockchainRecord
    
    result = await db.execute(
        select(BlockchainRecord).order_by(BlockchainRecord.block_index)
    )
    records = result.scalars().all()
    
    history = []
    for r in records:
        data = r.data or {}
        if data.get("document_id") == doc_id:
            history.append({
                "index": r.block_index,
                "timestamp": r.timestamp.isoformat() if r.timestamp else None,
                "version": data.get("version", 1),
                "author": r.issuer,
                "hash": data.get("document_hash"),
                "description": r.description,
            })
            
    return {"history": history}


@router.post("/{doc_id}/convert")
async def convert_document(
    doc_id: int,
    body: ConvertRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Convert decrypted text document format offline."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")
        
    is_locked = doc.tags and doc.tags.get("is_locked")
    raw_content = b""
    
    if is_locked:
        if not body.password:
            raise HTTPException(400, "Password required for conversion")
        pwd_hash = doc.tags.get("password_hash")
        input_hash = hashlib.sha256(body.password.encode()).hexdigest()
        if pwd_hash != input_hash:
            raise HTTPException(400, "Incorrect password")
        fernet = get_fernet(body.password)
        with open(doc.file_path, "rb") as f:
            enc_data = f.read()
        raw_content = fernet.decrypt(enc_data)
    else:
        with open(doc.file_path, "rb") as f:
            raw_content = f.read()
            
    text_content = raw_content.decode("utf-8", errors="ignore")
    target_format = body.format.lower().strip()
    
    if target_format == "pdf":
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        
        pdf_buffer = io.BytesIO()
        doc_template = SimpleDocTemplate(pdf_buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        normal_style = styles["Normal"]
        
        story = [
            Paragraph(f"<b>Converted Report: {doc.title}</b>", styles["Heading1"]),
            Spacer(1, 15),
            Paragraph(text_content.replace("\n", "<br/>"), normal_style)
        ]
        doc_template.build(story)
        pdf_buffer.seek(0)
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={Path(doc.title).stem}.pdf"}
        )
    elif target_format == "txt":
        txt_buffer = io.BytesIO(text_content.encode("utf-8"))
        return StreamingResponse(
            txt_buffer,
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename={Path(doc.title).stem}.txt"}
        )
    else:
        raise HTTPException(400, f"Unsupported target format: {target_format}")


@router.get("/shared/{doc_id}")
async def get_shared_document(
    doc_id: int,
    password: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve and download a shared document (verifying password offline if locked)."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")
        
    is_locked = doc.tags and doc.tags.get("is_locked")
    if is_locked:
        if not password:
            raise HTTPException(401, "Password required to view this shared document")
        pwd_hash = doc.tags.get("password_hash")
        input_hash = hashlib.sha256(password.encode()).hexdigest()
        if pwd_hash != input_hash:
            raise HTTPException(400, "Incorrect password")
            
        fernet = get_fernet(password)
        with open(doc.file_path, "rb") as f:
            enc_data = f.read()
        dec_data = fernet.decrypt(enc_data)
        
        return StreamingResponse(
            io.BytesIO(dec_data),
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={doc.title}"}
        )
        
    return FileResponse(
        path=doc.file_path,
        filename=doc.title,
        media_type="application/octet-stream",
    )

