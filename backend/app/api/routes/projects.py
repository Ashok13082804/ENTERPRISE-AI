"""Projects & Tasks Routes"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.project import Project, Task

router = APIRouter()


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    priority: str = "medium"
    department: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget: Optional[float] = None
    tags: List[str] = []


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
async def list_projects(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(Project).where(Project.owner_id == current_user.id).order_by(Project.created_at.desc())
    )
    projects = result.scalars().all()
    return [
        {
            "id": p.id, "name": p.name, "description": p.description,
            "status": p.status, "priority": p.priority, "progress": p.progress,
            "department": p.department, "budget": p.budget,
            "start_date": p.start_date.isoformat() if p.start_date else None,
            "end_date": p.end_date.isoformat() if p.end_date else None,
            "created_at": p.created_at.isoformat(),
        }
        for p in projects
    ]


@router.post("/")
async def create_project(
    body: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    project = Project(
        name=body.name, description=body.description,
        priority=body.priority, department=body.department,
        budget=body.budget, tags=body.tags,
        owner_id=current_user.id,
        start_date=datetime.fromisoformat(body.start_date) if body.start_date else None,
        end_date=datetime.fromisoformat(body.end_date) if body.end_date else None,
    )
    db.add(project)
    await db.flush()
    return {"id": project.id, "name": project.name, "status": project.status}


@router.put("/{project_id}/status")
async def update_project_status(
    project_id: int, status: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "Project not found")
    project.status = status
    return {"status": status}


@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Project).where(Project.id == project_id, Project.owner_id == current_user.id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "Project not found")
    await db.delete(project)
    return {"deleted": True}


class FileWriteRequest(BaseModel):
    path: str
    content: str


class CodeRunRequest(BaseModel):
    path: str


class AIAssistRequest(BaseModel):
    path: str
    prompt: str


import os
import subprocess
from pathlib import Path
from app.core.config import settings
from app.ai.ollama_client import ollama_client


def get_project_dir(project_id: int) -> Path:
    proj_dir = Path(settings.UPLOAD_DIR) / f"project_{project_id}"
    proj_dir.mkdir(parents=True, exist_ok=True)
    
    # Seed default files
    main_py = proj_dir / "main.py"
    if not main_py.exists():
        with open(main_py, "w", encoding="utf-8") as f:
            f.write("def calculate_sum(a, b):\n    return a + b\n\nif __name__ == '__main__':\n    result = calculate_sum(10, 20)\n    print(f'Calculated sum: {result}')\n")
            
    readme = proj_dir / "README.md"
    if not readme.exists():
        with open(readme, "w", encoding="utf-8") as f:
            f.write("# Project Workspace\n\nWrite, edit, and run your code files offline here!\n")
            
    return proj_dir


@router.get("/{project_id}/files")
async def list_project_files(
    project_id: int,
    current_user=Depends(get_current_user),
):
    """List all workspace files inside the project folder."""
    proj_dir = get_project_dir(project_id)
    files = []
    for item in proj_dir.glob("*"):
        if item.is_file():
            files.append({
                "name": item.name,
                "path": item.name,
                "size": item.stat().st_size
            })
    return {"files": files}


@router.get("/{project_id}/files/read")
async def read_project_file(
    project_id: int,
    path: str,
    current_user=Depends(get_current_user),
):
    """Read a specific project file's content."""
    proj_dir = get_project_dir(project_id)
    file_path = proj_dir / path
    
    # Safety check: prevent path traversal
    if not file_path.resolve().is_relative_to(proj_dir.resolve()):
        raise HTTPException(400, "Invalid file path")
        
    if not file_path.exists():
        raise HTTPException(404, "File not found")
        
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
        
    return {"path": path, "content": content}


@router.post("/{project_id}/files/write")
async def write_project_file(
    project_id: int,
    body: FileWriteRequest,
    current_user=Depends(get_current_user),
):
    """Write text content to a project file (creating it if needed)."""
    proj_dir = get_project_dir(project_id)
    file_path = proj_dir / body.path
    
    if not file_path.resolve().is_relative_to(proj_dir.resolve()):
        raise HTTPException(400, "Invalid file path")
        
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(body.content)
        
    return {"success": True, "path": body.path}


@router.post("/{project_id}/run")
async def run_project_file(
    project_id: int,
    body: CodeRunRequest,
    current_user=Depends(get_current_user),
):
    """Safely execute Python/JavaScript code inside the project folder."""
    proj_dir = get_project_dir(project_id).resolve()
    file_path = (proj_dir / body.path).resolve()
    
    if not file_path.is_relative_to(proj_dir):
        raise HTTPException(400, "Invalid file path")
        
    if not file_path.exists():
        raise HTTPException(404, "File not found")
        
    ext = file_path.suffix.lower()
    
    if ext == ".py":
        # Prefer sys.executable to run inside the same virtual environment
        import sys
        cmd = [sys.executable, str(file_path)]
    elif ext == ".js":
        cmd = ["node", str(file_path)]
    else:
        raise HTTPException(400, f"Running files of type {ext} is not supported")
        
    try:
        proc = subprocess.run(
            cmd,
            cwd=str(proj_dir),
            capture_output=True,
            text=True,
            timeout=5.0
        )
        return {
            "stdout": proc.stdout,
            "stderr": proc.stderr,
            "exit_code": proc.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": "Execution terminated: process timed out after 5.0 seconds",
            "exit_code": -1
        }
    except Exception as e:
        return {
            "stdout": "",
            "stderr": f"Execution error: {str(e)}",
            "exit_code": -1
        }


@router.post("/{project_id}/ai-assist")
async def project_ai_assist(
    project_id: int,
    body: AIAssistRequest,
    current_user=Depends(get_current_user),
):
    """Query local AI assistant with the code file loaded in context."""
    proj_dir = get_project_dir(project_id)
    file_path = proj_dir / body.path
    
    code_context = ""
    if file_path.exists() and file_path.resolve().is_relative_to(proj_dir.resolve()):
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            code_context = f.read()
            
    prompt = (
        f"You are Antigravity, an advanced AI programming assistant. Help the developer with this request:\n"
        f"Request: {body.prompt}\n\n"
    )
    if code_context:
        prompt += f"Active File Name: '{body.path}'\nActive File Content:\n```\n{code_context}\n```\n"
        
    prompt += "Provide complete explanation, tips, or corrected code segments."
    
    try:
        response = await ollama_client.chat(messages=[{"role": "user", "content": prompt}], model="llama3")
    except Exception:
        response = "The local AI helper is currently offline. Please start Ollama or try again later."
        
    return {"response": response}

