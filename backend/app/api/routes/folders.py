"""Folders CRUD API Routes"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.folder import Folder
from app.models.note import Note

router = APIRouter()


class FolderCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: str = "📁"
    color: str = "default"
    parent_id: Optional[int] = None


class FolderUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    parent_id: Optional[int] = None


def folder_to_dict(folder: Folder, note_count: int = 0) -> dict:
    return {
        "id": folder.id,
        "name": folder.name,
        "description": folder.description,
        "icon": folder.icon,
        "color": folder.color,
        "parent_id": folder.parent_id,
        "note_count": note_count,
        "created_at": folder.created_at.isoformat(),
        "updated_at": folder.updated_at.isoformat() if folder.updated_at else None,
    }


@router.get("/")
async def list_folders(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """List all folders with note counts."""
    result = await db.execute(
        select(Folder)
        .where(Folder.user_id == current_user.id)
        .order_by(Folder.name)
    )
    folders = result.scalars().all()

    # Get note counts per folder
    counts_result = await db.execute(
        select(Note.folder_id, func.count(Note.id))
        .where(Note.user_id == current_user.id, Note.is_trashed == False)
        .group_by(Note.folder_id)
    )
    counts = {fid: cnt for fid, cnt in counts_result.all()}

    return [folder_to_dict(f, counts.get(f.id, 0)) for f in folders]


@router.post("/")
async def create_folder(
    body: FolderCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Validate parent if given
    if body.parent_id:
        parent_result = await db.execute(
            select(Folder).where(Folder.id == body.parent_id, Folder.user_id == current_user.id)
        )
        if not parent_result.scalar_one_or_none():
            raise HTTPException(404, "Parent folder not found")

    folder = Folder(
        name=body.name,
        description=body.description,
        icon=body.icon,
        color=body.color,
        parent_id=body.parent_id,
        user_id=current_user.id,
    )
    db.add(folder)
    await db.flush()
    return folder_to_dict(folder)


@router.put("/{folder_id}")
async def update_folder(
    folder_id: int,
    body: FolderUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(Folder).where(Folder.id == folder_id, Folder.user_id == current_user.id)
    )
    folder = result.scalar_one_or_none()
    if not folder:
        raise HTTPException(404, "Folder not found")

    update_data = body.dict(exclude_none=True)
    for field, value in update_data.items():
        setattr(folder, field, value)
    folder.updated_at = datetime.utcnow()
    await db.flush()
    return folder_to_dict(folder)


@router.delete("/{folder_id}")
async def delete_folder(
    folder_id: int,
    move_notes_to: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Delete a folder. Optionally move notes to another folder."""
    result = await db.execute(
        select(Folder).where(Folder.id == folder_id, Folder.user_id == current_user.id)
    )
    folder = result.scalar_one_or_none()
    if not folder:
        raise HTTPException(404, "Folder not found")

    # Move notes out
    notes_result = await db.execute(
        select(Note).where(Note.folder_id == folder_id, Note.user_id == current_user.id)
    )
    notes = notes_result.scalars().all()
    for note in notes:
        note.folder_id = move_notes_to

    # Move child folders up
    children_result = await db.execute(
        select(Folder).where(Folder.parent_id == folder_id, Folder.user_id == current_user.id)
    )
    for child in children_result.scalars().all():
        child.parent_id = folder.parent_id

    await db.delete(folder)
    return {"message": f"Folder deleted, {len(notes)} notes unlinked"}


@router.get("/{folder_id}/notes")
async def get_folder_notes(
    folder_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """List all notes in a folder."""
    result = await db.execute(
        select(Note).where(
            Note.folder_id == folder_id,
            Note.user_id == current_user.id,
            Note.is_trashed == False,
        ).order_by(desc(Note.updated_at))
    )
    from app.api.routes.notes import note_to_dict
    notes = result.scalars().all()
    return [note_to_dict(n) for n in notes]
