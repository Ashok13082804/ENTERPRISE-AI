"""Global Search Route"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.document import Document
from app.models.project import Project, Task

router = APIRouter()


@router.get("/")
async def global_search(
    q: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Global search across documents, projects, tasks."""
    results = {"query": q, "documents": [], "projects": [], "tasks": []}

    if not q or len(q) < 2:
        return results

    search_term = f"%{q}%"

    # Documents
    doc_result = await db.execute(
        select(Document).where(
            Document.owner_id == current_user.id,
            Document.is_deleted == False,
            or_(
                Document.title.ilike(search_term),
                Document.content_text.ilike(search_term),
                Document.category.ilike(search_term),
            )
        ).limit(5)
    )
    for d in doc_result.scalars().all():
        results["documents"].append({
            "id": d.id, "title": d.title, "type": "document",
            "file_type": d.file_type, "category": d.category,
        })

    # Projects
    proj_result = await db.execute(
        select(Project).where(
            Project.owner_id == current_user.id,
            or_(
                Project.name.ilike(search_term),
                Project.description.ilike(search_term),
            )
        ).limit(5)
    )
    for p in proj_result.scalars().all():
        results["projects"].append({
            "id": p.id, "name": p.name, "type": "project",
            "status": p.status, "priority": p.priority,
        })

    # Tasks
    task_result = await db.execute(
        select(Task).where(
            Task.creator_id == current_user.id,
            or_(
                Task.title.ilike(search_term),
                Task.description.ilike(search_term),
            )
        ).limit(5)
    )
    for t in task_result.scalars().all():
        results["tasks"].append({
            "id": t.id, "title": t.title, "type": "task",
            "status": t.status, "priority": t.priority,
        })

    results["total"] = (
        len(results["documents"]) + len(results["projects"]) + len(results["tasks"])
    )
    return results
