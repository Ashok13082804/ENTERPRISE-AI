"""Dashboard Stats Route"""
from fastapi import APIRouter, Depends
from app.core.security import get_current_user

router = APIRouter()

@router.get("/stats")
async def dashboard_stats(current_user=Depends(get_current_user)):
    return {
        "welcome": f"Welcome back, {current_user.full_name}!",
        "role": current_user.role,
        "quick_links": ["AI Chat", "Documents", "Analytics", "ML Studio", "Blockchain"],
    }
