"""Notifications Routes"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.notification import Notification

router = APIRouter()


class NotificationCreate(BaseModel):
    title: str
    message: str
    type: str = "info"
    category: Optional[str] = None
    action_url: Optional[str] = None


@router.get("/")
async def list_notifications(
    unread_only: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = select(Notification).where(Notification.user_id == current_user.id)
    if unread_only:
        query = query.where(Notification.is_read == False)
    result = await db.execute(query.order_by(Notification.created_at.desc()).limit(50))
    notifs = result.scalars().all()
    unread_count = (await db.execute(
        select(func.count(Notification.id)).where(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
    )).scalar() or 0
    return {
        "unread_count": unread_count,
        "notifications": [
            {
                "id": n.id, "title": n.title, "message": n.message,
                "type": n.type, "category": n.category,
                "is_read": n.is_read, "action_url": n.action_url,
                "created_at": n.created_at.isoformat(),
            }
            for n in notifs
        ],
    }


@router.put("/{notif_id}/read")
async def mark_read(
    notif_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(Notification).where(Notification.id == notif_id, Notification.user_id == current_user.id)
    )
    notif = result.scalar_one_or_none()
    if notif:
        notif.is_read = True
    return {"read": True}


@router.put("/read-all")
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from sqlalchemy import update
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read == False)
        .values(is_read=True)
    )
    return {"message": "All notifications marked as read"}


@router.post("/")
async def create_notification(
    body: NotificationCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    notif = Notification(
        user_id=current_user.id,
        title=body.title,
        message=body.message,
        type=body.type,
        category=body.category,
        action_url=body.action_url,
    )
    db.add(notif)
    await db.flush()
    return {"id": notif.id, "title": notif.title}
