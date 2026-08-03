"""Users API Routes"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional, List

from app.core.database import get_db
from app.core.security import get_current_user, get_current_active_admin, hash_password
from app.models.user import User, LoginHistory

router = APIRouter()


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    theme: Optional[str] = None
    language: Optional[str] = None


@router.get("/me")
async def get_current_user_profile(current_user=Depends(get_current_user)):
    """Get current user profile."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "employee_id": current_user.employee_id,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "department": current_user.department,
        "position": current_user.position,
        "phone": current_user.phone,
        "avatar_url": current_user.avatar_url,
        "bio": current_user.bio,
        "theme": current_user.theme,
        "language": current_user.language,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "is_mfa_enabled": current_user.is_mfa_enabled,
        "last_login": current_user.last_login.isoformat() if current_user.last_login else None,
        "created_at": current_user.created_at.isoformat(),
    }


@router.put("/me")
async def update_profile(
    body: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Update current user profile."""
    for key, value in body.model_dump(exclude_none=True).items():
        setattr(current_user, key, value)
    await db.flush()
    return {"message": "Profile updated"}


@router.get("/", dependencies=[Depends(get_current_active_admin)])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    role: Optional[str] = None,
    department: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """List all users (admin only)."""
    query = select(User)
    if role:
        query = query.where(User.role == role)
    if department:
        query = query.where(User.department == department)
    
    result = await db.execute(query.offset(skip).limit(limit))
    users = result.scalars().all()
    
    count_result = await db.execute(select(func.count(User.id)))
    total = count_result.scalar()
    
    return {
        "total": total,
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "username": u.username,
                "full_name": u.full_name,
                "role": u.role,
                "department": u.department,
                "is_active": u.is_active,
                "last_login": u.last_login.isoformat() if u.last_login else None,
                "created_at": u.created_at.isoformat(),
            }
            for u in users
        ],
    }


@router.get("/{user_id}", dependencies=[Depends(get_current_active_admin)])
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User not found")
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "department": user.department,
        "is_active": user.is_active,
        "last_login": user.last_login.isoformat() if user.last_login else None,
    }


@router.put("/{user_id}/deactivate", dependencies=[Depends(get_current_active_admin)])
async def deactivate_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User not found")
    user.is_active = False
    return {"message": f"User {user.email} deactivated"}


@router.get("/me/login-history")
async def get_login_history(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(LoginHistory)
        .where(LoginHistory.user_id == current_user.id)
        .order_by(LoginHistory.created_at.desc())
        .limit(20)
    )
    history = result.scalars().all()
    return [
        {
            "ip_address": h.ip_address,
            "success": h.success,
            "failure_reason": h.failure_reason,
            "created_at": h.created_at.isoformat(),
        }
        for h in history
    ]
