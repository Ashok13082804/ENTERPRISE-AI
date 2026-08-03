"""Admin, Dashboard, Projects, Tasks, Notifications, Search Routes"""
# ─── admin.py ─────────────────────────────────────────────────────────────────
from fastapi import APIRouter, Depends
from app.core.security import get_current_active_admin

router = APIRouter()

@router.get("/system-info")
async def system_info(current_user=Depends(get_current_active_admin)):
    import platform, sys
    return {
        "platform": platform.system(),
        "python": sys.version,
        "app": "Unified Enterprise AI Platform v1.0",
    }

@router.get("/logs")
async def get_logs(lines: int = 100, current_user=Depends(get_current_active_admin)):
    from pathlib import Path
    log_file = Path("./logs/app.log")
    if not log_file.exists():
        return {"logs": []}
    with open(log_file) as f:
        log_lines = f.readlines()[-lines:]
    return {"logs": log_lines}
