"""Tasks Routes"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.project import Task

router = APIRouter()


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: Optional[int] = None
    assignee_id: Optional[int] = None
    priority: str = "medium"
    due_date: Optional[str] = None
    estimated_hours: Optional[float] = None
    tags: List[str] = []


@router.get("/")
async def list_tasks(
    project_id: Optional[int] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = select(Task).where(Task.creator_id == current_user.id)
    if project_id:
        query = query.where(Task.project_id == project_id)
    if status:
        query = query.where(Task.status == status)
    result = await db.execute(query.order_by(Task.created_at.desc()))
    tasks = result.scalars().all()
    return [
        {
            "id": t.id, "title": t.title, "description": t.description,
            "project_id": t.project_id, "assignee_id": t.assignee_id,
            "status": t.status, "priority": t.priority,
            "due_date": t.due_date.isoformat() if t.due_date else None,
            "estimated_hours": t.estimated_hours,
            "created_at": t.created_at.isoformat(),
        }
        for t in tasks
    ]


@router.post("/")
async def create_task(
    body: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    task = Task(
        title=body.title, description=body.description,
        project_id=body.project_id, assignee_id=body.assignee_id,
        priority=body.priority, tags=body.tags,
        estimated_hours=body.estimated_hours,
        creator_id=current_user.id,
        due_date=datetime.fromisoformat(body.due_date) if body.due_date else None,
    )
    db.add(task)
    await db.flush()
    return {"id": task.id, "title": task.title, "status": task.status}


@router.put("/{task_id}/status")
async def update_task_status(
    task_id: int, status: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")
    task.status = status
    return {"status": status}


@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Task).where(Task.id == task_id, Task.creator_id == current_user.id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")
    await db.delete(task)
    return {"deleted": True}


class TaskUpdate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[str] = None
    estimated_hours: Optional[float] = None
    tags: List[str] = []


@router.put("/{task_id}")
async def update_task(
    task_id: int,
    body: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Edit a task's title, description, priority, hours, tags, and due date."""
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.creator_id == current_user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")
        
    task.title = body.title
    task.description = body.description
    task.priority = body.priority
    task.estimated_hours = body.estimated_hours
    task.tags = body.tags
    if body.due_date:
        # Standardize ISO format
        clean_date = body.due_date.replace("Z", "")
        task.due_date = datetime.fromisoformat(clean_date)
    else:
        task.due_date = None
        
    await db.commit()
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "priority": task.priority,
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "estimated_hours": task.estimated_hours,
    }

