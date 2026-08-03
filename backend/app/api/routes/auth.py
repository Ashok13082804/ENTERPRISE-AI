"""Authentication API Routes"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr

from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password, create_access_token,
    create_refresh_token, verify_token, generate_otp
)
from app.core.config import settings
from app.repositories.user_repository import UserRepository
from app.models.user import User, LoginHistory

router = APIRouter()


# ─── Schemas ─────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str
    remember_me: bool = False


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    password: str
    role: str = "employee"
    department: str = ""


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class RefreshRequest(BaseModel):
    refresh_token: str


# ─── Endpoints ────────────────────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Email/password login with JWT tokens."""
    repo = UserRepository(db)
    user = await repo.get_by_email(body.email)
    
    # Log attempt
    ip = request.client.host if request.client else "unknown"
    
    if not user:
        # Also try by username
        user = await repo.get_by_username(body.email)
    
    if not user or not verify_password(body.password, user.hashed_password):
        # Log failed attempt
        if user:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= settings.MAX_LOGIN_ATTEMPTS:
                from datetime import timedelta
                user.locked_until = datetime.now(timezone.utc) + timedelta(
                    minutes=settings.LOCKOUT_DURATION_MINUTES
                )
            await db.flush()
        
        history = LoginHistory(
            user_id=user.id if user else 0,
            ip_address=ip,
            user_agent=request.headers.get("user-agent", ""),
            success=False,
            failure_reason="Invalid credentials",
        )
        db.add(history)
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    # Check account lock
    if user.locked_until and user.locked_until > datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account locked. Try again after {user.locked_until.strftime('%H:%M')}",
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is inactive")
    
    # Reset failed attempts
    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login = datetime.now(timezone.utc)
    user.last_login_ip = ip
    await db.flush()
    
    # Log success
    history = LoginHistory(
        user_id=user.id,
        ip_address=ip,
        user_agent=request.headers.get("user-agent", ""),
        success=True,
    )
    db.add(history)
    
    # Create tokens
    token_data = {"sub": str(user.id), "role": user.role, "email": user.email}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "department": user.department,
            "avatar_url": user.avatar_url,
            "theme": user.theme,
        },
    )


@router.post("/register")
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    repo = UserRepository(db)
    
    if await repo.get_by_email(body.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if await repo.get_by_username(body.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    
    user = User(
        email=body.email,
        username=body.username,
        full_name=body.full_name,
        hashed_password=hash_password(body.password),
        role=body.role,
        department=body.department,
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    await db.flush()
    
    return {
        "message": "Registration successful",
        "user_id": user.id,
        "email": user.email,
    }


@router.post("/refresh")
async def refresh_token(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Refresh access token."""
    payload = verify_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    repo = UserRepository(db)
    user = await repo.get_by_id(int(payload["sub"]))
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    
    token_data = {"sub": str(user.id), "role": user.role, "email": user.email}
    return {
        "access_token": create_access_token(token_data),
        "token_type": "bearer",
    }


@router.post("/logout")
async def logout():
    """Logout (client-side token deletion)."""
    return {"message": "Logged out successfully"}


@router.get("/me")
async def get_me(db: AsyncSession = Depends(get_db)):
    """Get current user profile — placeholder."""
    return {"message": "Auth endpoint working"}
