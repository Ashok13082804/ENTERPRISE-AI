"""Tags CRUD API Routes"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.tag import Tag
from app.models.note import Note

router = APIRouter()


class TagCreate(BaseModel):
    name: str
    color: str = "default"


class TagUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None


@router.get("/")
async def list_tags(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """List all tags for current user with usage counts."""
    result = await db.execute(
        select(Tag)
        .where(Tag.user_id == current_user.id)
        .order_by(desc(Tag.usage_count), Tag.name)
    )
    tags = result.scalars().all()
    return [
        {
            "id": t.id,
            "name": t.name,
            "color": t.color,
            "usage_count": t.usage_count,
            "created_at": t.created_at.isoformat(),
        }
        for t in tags
    ]


@router.post("/")
async def create_tag(
    body: TagCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Check for duplicate
    existing = await db.execute(
        select(Tag).where(Tag.name == body.name.lower(), Tag.user_id == current_user.id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(409, f"Tag '{body.name}' already exists")

    tag = Tag(name=body.name.lower().strip(), color=body.color, user_id=current_user.id)
    db.add(tag)
    await db.flush()
    return {"id": tag.id, "name": tag.name, "color": tag.color, "usage_count": 0}


@router.put("/{tag_id}")
async def update_tag(
    tag_id: int,
    body: TagUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(Tag).where(Tag.id == tag_id, Tag.user_id == current_user.id)
    )
    tag = result.scalar_one_or_none()
    if not tag:
        raise HTTPException(404, "Tag not found")

    if body.name:
        tag.name = body.name.lower().strip()
    if body.color:
        tag.color = body.color
    tag.updated_at = datetime.utcnow()
    await db.flush()
    return {"id": tag.id, "name": tag.name, "color": tag.color}


@router.delete("/{tag_id}")
async def delete_tag(
    tag_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(Tag).where(Tag.id == tag_id, Tag.user_id == current_user.id)
    )
    tag = result.scalar_one_or_none()
    if not tag:
        raise HTTPException(404, "Tag not found")
    await db.delete(tag)
    return {"message": "Tag deleted"}


@router.get("/cloud")
async def tag_cloud(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Return aggregated tag cloud from all notes."""
    result = await db.execute(
        select(Note.tags).where(
            Note.user_id == current_user.id,
            Note.is_trashed == False,
        )
    )
    tag_counts: dict = {}
    for (tags,) in result.all():
        for tag in (tags or []):
            tag_counts[tag] = tag_counts.get(tag, 0) + 1

    return [
        {"name": name, "count": count}
        for name, count in sorted(tag_counts.items(), key=lambda x: -x[1])
    ]
