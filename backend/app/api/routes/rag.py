"""RAG Document Indexing & Query Routes"""
import os
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.ai.rag_pipeline import rag_service, vector_store
from app.models.document import Document

router = APIRouter()


class RAGQueryRequest(BaseModel):
    question: str
    collection: str = "default"
    model: str = "llama3"
    n_results: int = 5


@router.post("/upload")
async def upload_and_index(
    file: UploadFile = File(...),
    collection: str = Form("default"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Upload a document and index it into the vector store."""
    # Validate file type
    allowed_extensions = {"pdf", "docx", "doc", "xlsx", "xls", "csv", "pptx", "ppt", "txt", "md"}
    ext = Path(file.filename).suffix.lstrip(".").lower()
    
    if ext not in allowed_extensions:
        raise HTTPException(400, f"Unsupported file type: .{ext}")
    
    if file.size and file.size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, "File too large")
    
    # Save file
    upload_dir = Path(settings.UPLOAD_DIR) / "rag"
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    safe_name = f"{current_user.id}_{int(__import__('time').time())}_{file.filename}"
    file_path = upload_dir / safe_name
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Create document record
    doc = Document(
        title=file.filename,
        filename=safe_name,
        file_path=str(file_path),
        file_type=ext,
        file_size=len(content),
        owner_id=current_user.id,
        vector_collection=collection,
    )
    db.add(doc)
    await db.flush()
    
    # Index document
    result = await rag_service.ingest_document(
        file_path=str(file_path),
        file_type=ext,
        document_id=doc.id,
        document_title=file.filename,
        collection_name=collection,
    )
    
    if result.get("success"):
        doc.is_indexed = True
        doc.chunk_count = result.get("chunks", 0)
        doc.document_hash = result.get("document_hash")
    
    return {
        "document_id": doc.id,
        "filename": file.filename,
        "collection": collection,
        "indexed": result.get("success", False),
        "chunks": result.get("chunks", 0),
        "total_chars": result.get("total_chars", 0),
        "document_hash": result.get("document_hash"),
    }


@router.post("/query")
async def query_knowledge_base(
    body: RAGQueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Query the RAG knowledge base."""
    result = await rag_service.query(
        question=body.question,
        collection_name=body.collection,
        model=body.model,
        n_results=body.n_results,
    )
    return result


@router.get("/collections")
async def list_collections(current_user=Depends(get_current_user)):
    """List all vector store collections."""
    collections = vector_store.list_collections()
    return {"collections": collections}


@router.delete("/collections/{name}")
async def delete_collection(
    name: str,
    current_user=Depends(get_current_user),
):
    """Delete a vector store collection."""
    success = vector_store.delete_collection(name)
    if not success:
        raise HTTPException(404, "Collection not found")
    return {"message": f"Collection '{name}' deleted"}


@router.get("/documents")
async def list_rag_documents(
    collection: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """List indexed documents."""
    from sqlalchemy import select
    
    query = select(Document).where(
        Document.owner_id == current_user.id,
        Document.is_indexed == True,
        Document.is_deleted == False,
    )
    if collection:
        query = query.where(Document.vector_collection == collection)
    
    result = await db.execute(query)
    docs = result.scalars().all()
    
    return [
        {
            "id": d.id,
            "title": d.title,
            "file_type": d.file_type,
            "file_size": d.file_size,
            "chunk_count": d.chunk_count,
            "collection": d.vector_collection,
            "created_at": d.created_at.isoformat(),
        }
        for d in docs
    ]
