"""
Notes CRUD API Routes
Full-featured: create, read, update, delete, pin, favorite, archive, trash, restore,
version history, search, filter, bulk ops, export, import, duplicate
"""
import io
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from fastapi.responses import Response
from pydantic import BaseModel, Field
from sqlalchemy import select, desc, asc, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.note import Note, NoteVersion
from app.models.folder import Folder
from app.ai.notes_ai import notes_ai

router = APIRouter()


# ─── Schemas ─────────────────────────────────────────────────────────────────

class NoteCreate(BaseModel):
    title: str = "Untitled Note"
    content: str = ""
    content_type: str = "markdown"
    folder_id: Optional[int] = None
    tags: List[str] = []
    color: str = "default"
    is_pinned: bool = False
    is_favorite: bool = False
    is_ai_generated: bool = False


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    content_type: Optional[str] = None
    folder_id: Optional[int] = None
    tags: Optional[List[str]] = None
    color: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_favorite: Optional[bool] = None
    is_locked: Optional[bool] = None
    ai_summary: Optional[str] = None
    ai_tags: Optional[List[str]] = None


class BulkActionRequest(BaseModel):
    note_ids: List[int]
    action: str  # delete, archive, restore, trash, favorite, unfavorite


def note_to_dict(note: Note) -> dict:
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "content_type": note.content_type,
        "folder_id": note.folder_id,
        "tags": note.tags or [],
        "color": note.color,
        "is_pinned": note.is_pinned,
        "is_favorite": note.is_favorite,
        "is_archived": note.is_archived,
        "is_trashed": note.is_trashed,
        "is_locked": note.is_locked,
        "is_ai_generated": note.is_ai_generated,
        "ai_summary": note.ai_summary,
        "ai_tags": note.ai_tags or [],
        "ai_keywords": note.ai_keywords or [],
        "ai_sentiment": note.ai_sentiment,
        "word_count": note.word_count,
        "char_count": note.char_count,
        "reading_time_minutes": note.reading_time_minutes,
        "version": note.version,
        "created_at": note.created_at.isoformat(),
        "updated_at": note.updated_at.isoformat() if note.updated_at else None,
        "trashed_at": note.trashed_at.isoformat() if note.trashed_at else None,
    }


# ─── List Notes ───────────────────────────────────────────────────────────────

@router.get("/")
async def list_notes(
    folder_id: Optional[int] = None,
    tag: Optional[str] = None,
    color: Optional[str] = None,
    is_pinned: Optional[bool] = None,
    is_favorite: Optional[bool] = None,
    is_archived: bool = False,
    is_trashed: bool = False,
    search: Optional[str] = None,
    sort_by: str = "updated_at",  # updated_at, created_at, title, word_count
    sort_order: str = "desc",
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """List notes with filtering, searching, and sorting."""
    query = select(Note).where(
        Note.user_id == current_user.id,
        Note.is_trashed == is_trashed,
        Note.is_archived == is_archived,
    )

    if folder_id is not None:
        query = query.where(Note.folder_id == folder_id)
    if color:
        query = query.where(Note.color == color)
    if is_pinned is not None:
        query = query.where(Note.is_pinned == is_pinned)
    if is_favorite is not None:
        query = query.where(Note.is_favorite == is_favorite)
    if tag:
        # JSON contains search — works for SQLite JSON
        query = query.where(Note.tags.contains([tag]))
    if search:
        q = f"%{search}%"
        query = query.where(
            or_(
                Note.title.ilike(q),
                Note.content.ilike(q),
            )
        )

    # Sorting
    sort_col = {
        "updated_at": Note.updated_at,
        "created_at": Note.created_at,
        "title": Note.title,
        "word_count": Note.word_count,
    }.get(sort_by, Note.updated_at)
    if sort_order == "asc":
        query = query.order_by(asc(sort_col))
    else:
        query = query.order_by(desc(sort_col))

    # Count
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()

    # Paginate
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    notes = result.scalars().all()

    return {
        "notes": [note_to_dict(n) for n in notes],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


# ─── Get Note ─────────────────────────────────────────────────────────────────

@router.get("/{note_id}")
async def get_note(
    note_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(404, "Note not found")
    # Update last viewed
    note.last_viewed_at = datetime.utcnow()
    await db.flush()
    return note_to_dict(note)


# ─── Create Note ─────────────────────────────────────────────────────────────

@router.post("/")
async def create_note(
    body: NoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Create a new note."""
    stats = notes_ai.calculate_stats(body.content)
    note = Note(
        title=body.title,
        content=body.content,
        content_type=body.content_type,
        user_id=current_user.id,
        folder_id=body.folder_id,
        tags=body.tags,
        color=body.color,
        is_pinned=body.is_pinned,
        is_favorite=body.is_favorite,
        is_ai_generated=body.is_ai_generated,
        word_count=stats["word_count"],
        char_count=stats["char_count"],
        reading_time_minutes=stats["reading_time_minutes"],
    )
    db.add(note)
    await db.flush()
    # Save initial version
    version = NoteVersion(
        note_id=note.id,
        title=note.title,
        content=note.content,
        version_number=1,
        word_count=stats["word_count"],
    )
    db.add(version)
    return note_to_dict(note)


# ─── Update Note ─────────────────────────────────────────────────────────────

@router.put("/{note_id}")
async def update_note(
    note_id: int,
    body: NoteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Update a note. Auto-saves version history on content change."""
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(404, "Note not found")

    content_changed = body.content is not None and body.content != note.content

    # Update fields
    update_data = body.dict(exclude_none=True)
    for field, value in update_data.items():
        setattr(note, field, value)

    # Recalculate stats if content changed
    if content_changed:
        stats = notes_ai.calculate_stats(note.content)
        note.word_count = stats["word_count"]
        note.char_count = stats["char_count"]
        note.reading_time_minutes = stats["reading_time_minutes"]
        note.version = (note.version or 1) + 1

        # Save version
        version = NoteVersion(
            note_id=note.id,
            title=note.title,
            content=note.content,
            version_number=note.version,
            word_count=stats["word_count"],
        )
        db.add(version)

    note.updated_at = datetime.utcnow()
    await db.flush()
    return note_to_dict(note)


# ─── Delete Note (to trash) ───────────────────────────────────────────────────

@router.delete("/{note_id}")
async def delete_note(
    note_id: int,
    permanent: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(404, "Note not found")

    if permanent:
        await db.delete(note)
    else:
        note.is_trashed = True
        note.trashed_at = datetime.utcnow()

    return {"message": "Note deleted" if permanent else "Note moved to trash"}


# ─── Note Actions ─────────────────────────────────────────────────────────────

@router.post("/{note_id}/restore")
async def restore_note(
    note_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(404, "Note not found")
    note.is_trashed = False
    note.is_archived = False
    note.trashed_at = None
    return note_to_dict(note)


@router.post("/{note_id}/duplicate")
async def duplicate_note(
    note_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    original = result.scalar_one_or_none()
    if not original:
        raise HTTPException(404, "Note not found")

    stats = notes_ai.calculate_stats(original.content or "")
    copy = Note(
        title=f"{original.title} (Copy)",
        content=original.content,
        content_type=original.content_type,
        user_id=current_user.id,
        folder_id=original.folder_id,
        tags=list(original.tags or []),
        color=original.color,
        word_count=stats["word_count"],
        char_count=stats["char_count"],
        reading_time_minutes=stats["reading_time_minutes"],
    )
    db.add(copy)
    await db.flush()
    return note_to_dict(copy)


# ─── Version History ─────────────────────────────────────────────────────────

@router.get("/{note_id}/versions")
async def get_versions(
    note_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Verify ownership
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(404, "Note not found")

    result = await db.execute(
        select(NoteVersion)
        .where(NoteVersion.note_id == note_id)
        .order_by(desc(NoteVersion.version_number))
        .limit(20)
    )
    versions = result.scalars().all()
    return [
        {
            "id": v.id,
            "version_number": v.version_number,
            "title": v.title,
            "word_count": v.word_count,
            "content_preview": (v.content or "")[:200],
            "created_at": v.created_at.isoformat(),
        }
        for v in versions
    ]


@router.post("/{note_id}/versions/{version_id}/restore")
async def restore_version(
    note_id: int,
    version_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(404, "Note not found")

    ver_result = await db.execute(
        select(NoteVersion).where(NoteVersion.id == version_id, NoteVersion.note_id == note_id)
    )
    version = ver_result.scalar_one_or_none()
    if not version:
        raise HTTPException(404, "Version not found")

    note.content = version.content
    note.title = version.title
    stats = notes_ai.calculate_stats(note.content or "")
    note.word_count = stats["word_count"]
    note.char_count = stats["char_count"]
    note.reading_time_minutes = stats["reading_time_minutes"]
    note.version = (note.version or 1) + 1
    note.updated_at = datetime.utcnow()

    return note_to_dict(note)


# ─── Bulk Actions ─────────────────────────────────────────────────────────────

@router.post("/bulk")
async def bulk_action(
    body: BulkActionRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(Note).where(
            Note.id.in_(body.note_ids),
            Note.user_id == current_user.id,
        )
    )
    notes = result.scalars().all()

    for note in notes:
        if body.action == "trash":
            note.is_trashed = True
            note.trashed_at = datetime.utcnow()
        elif body.action == "restore":
            note.is_trashed = False
            note.is_archived = False
            note.trashed_at = None
        elif body.action == "archive":
            note.is_archived = True
            note.archived_at = datetime.utcnow()
        elif body.action == "favorite":
            note.is_favorite = True
        elif body.action == "unfavorite":
            note.is_favorite = False
        elif body.action == "delete":
            await db.delete(note)

    return {"message": f"Bulk {body.action} applied to {len(notes)} notes"}


# ─── Search Notes ─────────────────────────────────────────────────────────────

@router.get("/search/q")
async def search_notes(
    q: str = Query(..., min_length=1),
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Full-text search across note titles and content."""
    search_q = f"%{q}%"
    result = await db.execute(
        select(Note)
        .where(
            Note.user_id == current_user.id,
            Note.is_trashed == False,
            or_(Note.title.ilike(search_q), Note.content.ilike(search_q)),
        )
        .order_by(desc(Note.updated_at))
        .limit(limit)
    )
    notes = result.scalars().all()
    return [note_to_dict(n) for n in notes]


# ─── Export Note ─────────────────────────────────────────────────────────────

@router.get("/{note_id}/export")
async def export_note(
    note_id: int,
    format: str = "markdown",  # markdown, pdf, docx, txt
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(404, "Note not found")

    safe_title = (note.title or "note").replace(" ", "_")[:50]
    content = note.content or ""

    if format == "txt":
        return Response(
            content=f"{note.title}\n\n{content}",
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename={safe_title}.txt"},
        )

    elif format in ["markdown", "md"]:
        meta = f"---\ntitle: {note.title}\ndate: {note.created_at.strftime('%Y-%m-%d')}\ntags: {', '.join(note.tags or [])}\n---\n\n"
        return Response(
            content=meta + content,
            media_type="text/markdown",
            headers={"Content-Disposition": f"attachment; filename={safe_title}.md"},
        )

    elif format == "pdf":
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib import colors

            buffer = io.BytesIO()
            pdf = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54)
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle("Title", parent=styles["Heading1"], fontSize=20, textColor=colors.HexColor("#4F46E5"))
            meta_style = ParagraphStyle("Meta", parent=styles["Normal"], fontSize=9, textColor=colors.HexColor("#6B7280"))
            body_style = ParagraphStyle("Body", parent=styles["Normal"], fontSize=11, leading=16)

            story = [
                Paragraph(note.title, title_style),
                Paragraph(f"Created: {note.created_at.strftime('%Y-%m-%d')} | Words: {note.word_count} | Reading time: {note.reading_time_minutes} min", meta_style),
                Spacer(1, 20),
            ]
            for paragraph in content.split("\n\n"):
                if paragraph.strip():
                    text = paragraph.strip().replace("\n", "<br/>").replace("<", "&lt;").replace(">", "&gt;")
                    story.append(Paragraph(text, body_style))
                    story.append(Spacer(1, 8))

            pdf.build(story)
            buffer.seek(0)
            return Response(
                content=buffer.getvalue(),
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename={safe_title}.pdf"},
            )
        except Exception as e:
            raise HTTPException(500, f"PDF error: {str(e)}")

    elif format == "docx":
        try:
            from docx import Document as DocxDoc
            doc = DocxDoc()
            doc.add_heading(note.title, level=0)
            doc.add_paragraph(f"Created: {note.created_at.strftime('%Y-%m-%d')}")
            doc.add_paragraph("")
            for para in content.split("\n\n"):
                if para.strip():
                    doc.add_paragraph(para.strip())
            buffer = io.BytesIO()
            doc.save(buffer)
            buffer.seek(0)
            return Response(
                content=buffer.getvalue(),
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                headers={"Content-Disposition": f"attachment; filename={safe_title}.docx"},
            )
        except Exception as e:
            raise HTTPException(500, f"DOCX error: {str(e)}")

    raise HTTPException(400, f"Unsupported format: {format}")


# ─── Stats ────────────────────────────────────────────────────────────────────

@router.get("/stats/overview")
async def get_notes_stats(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get notes statistics for the current user."""
    base = Note.user_id == current_user.id

    total = await db.scalar(select(func.count()).where(base, Note.is_trashed == False))
    pinned = await db.scalar(select(func.count()).where(base, Note.is_pinned == True, Note.is_trashed == False))
    favorites = await db.scalar(select(func.count()).where(base, Note.is_favorite == True, Note.is_trashed == False))
    archived = await db.scalar(select(func.count()).where(base, Note.is_archived == True, Note.is_trashed == False))
    trashed = await db.scalar(select(func.count()).where(base, Note.is_trashed == True))
    ai_notes = await db.scalar(select(func.count()).where(base, Note.is_ai_generated == True, Note.is_trashed == False))

    today = datetime.utcnow().date()
    today_notes = await db.scalar(
        select(func.count()).where(
            base,
            Note.is_trashed == False,
            Note.created_at >= datetime(today.year, today.month, today.day),
        )
    )

    total_words = await db.scalar(select(func.sum(Note.word_count)).where(base, Note.is_trashed == False)) or 0

    # Recent notes
    recent_result = await db.execute(
        select(Note)
        .where(base, Note.is_trashed == False)
        .order_by(desc(Note.updated_at))
        .limit(5)
    )
    recent = recent_result.scalars().all()

    return {
        "total_notes": total or 0,
        "pinned_notes": pinned or 0,
        "favorite_notes": favorites or 0,
        "archived_notes": archived or 0,
        "trashed_notes": trashed or 0,
        "ai_notes": ai_notes or 0,
        "today_notes": today_notes or 0,
        "total_words": total_words,
        "avg_reading_time": round(total_words / 200, 1) if total_words else 0,
        "recent_notes": [
            {"id": n.id, "title": n.title, "updated_at": n.updated_at.isoformat() if n.updated_at else None, "color": n.color}
            for n in recent
        ],
    }


# ─── Purge Trash ────────────────────────────────────────────────────────────

@router.delete("/trash/empty")
async def empty_trash(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(Note).where(Note.user_id == current_user.id, Note.is_trashed == True)
    )
    trashed = result.scalars().all()
    count = len(trashed)
    for note in trashed:
        await db.delete(note)
    return {"message": f"Permanently deleted {count} notes"}
