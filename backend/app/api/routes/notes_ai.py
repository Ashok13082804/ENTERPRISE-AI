"""Notes AI API Routes — All powered by local Ollama"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.note import Note
from app.ai.notes_ai import notes_ai

router = APIRouter()


class NoteAIRequest(BaseModel):
    note_id: Optional[int] = None
    content: Optional[str] = None
    title: Optional[str] = ""
    model: Optional[str] = None
    mode: Optional[str] = None
    prompt: Optional[str] = None
    note_type: Optional[str] = "note"
    count: Optional[int] = 10
    target_language: Optional[str] = None
    level: Optional[str] = "intermediate"


async def get_note_content(note_id: Optional[int], content: Optional[str], user_id: int, db: AsyncSession) -> str:
    """Resolve note content from note_id or direct content."""
    if content:
        return content
    if note_id:
        result = await db.execute(
            select(Note).where(Note.id == note_id, Note.user_id == user_id)
        )
        note = result.scalar_one_or_none()
        if not note:
            raise HTTPException(404, "Note not found")
        return note.content or ""
    raise HTTPException(400, "Provide either note_id or content")


@router.post("/summarize")
async def summarize_note(
    body: NoteAIRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Summarize a note (concise, detailed, or bullet)."""
    content = await get_note_content(body.note_id, body.content, current_user.id, db)
    if not content.strip():
        raise HTTPException(400, "Note content is empty")
    result = await notes_ai.summarize(content, mode=body.mode or "concise", model=body.model)
    return {"result": result, "mode": body.mode or "concise"}


@router.post("/improve")
async def improve_writing(
    body: NoteAIRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Improve writing: rewrite, fix grammar, formal, casual, etc."""
    content = await get_note_content(body.note_id, body.content, current_user.id, db)
    if not content.strip():
        raise HTTPException(400, "Note content is empty")
    result = await notes_ai.improve_writing(content, mode=body.mode or "improve", model=body.model)
    return {"result": result, "mode": body.mode or "improve"}


@router.post("/generate")
async def generate_note(
    body: NoteAIRequest,
    current_user=Depends(get_current_user),
):
    """Generate a note from a prompt (blog, essay, email, report, etc.)."""
    if not body.prompt:
        raise HTTPException(400, "Provide a prompt to generate content")
    result = await notes_ai.generate_note(
        prompt=body.prompt,
        note_type=body.note_type or "note",
        model=body.model,
    )
    return {"result": result, "note_type": body.note_type}


@router.post("/tags")
async def generate_tags(
    body: NoteAIRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Auto-generate tags for a note using AI."""
    content = await get_note_content(body.note_id, body.content, current_user.id, db)
    tags = await notes_ai.generate_tags(body.title or "", content, model=body.model)
    return {"tags": tags}


@router.post("/flashcards")
async def generate_flashcards(
    body: NoteAIRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Generate study flashcards from a note."""
    content = await get_note_content(body.note_id, body.content, current_user.id, db)
    if not content.strip():
        raise HTTPException(400, "Note content is empty")
    flashcards = await notes_ai.generate_flashcards(content, count=body.count or 10, model=body.model)
    return {"flashcards": flashcards, "count": len(flashcards)}


@router.post("/quiz")
async def generate_quiz(
    body: NoteAIRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Generate MCQ quiz from a note."""
    content = await get_note_content(body.note_id, body.content, current_user.id, db)
    if not content.strip():
        raise HTTPException(400, "Note content is empty")
    quiz = await notes_ai.generate_quiz(content, count=body.count or 5, model=body.model)
    return {"quiz": quiz, "count": len(quiz)}


@router.post("/answer")
async def answer_question(
    body: NoteAIRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Answer a question based on note content."""
    if not body.prompt:
        raise HTTPException(400, "Provide a question as 'prompt'")
    content = await get_note_content(body.note_id, body.content, current_user.id, db)
    answer = await notes_ai.answer_question(body.prompt, content, model=body.model)
    return {"answer": answer, "question": body.prompt}


@router.post("/todo")
async def extract_todos(
    body: NoteAIRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Extract to-do items from note content."""
    content = await get_note_content(body.note_id, body.content, current_user.id, db)
    todos = await notes_ai.extract_todos(content, model=body.model)
    return {"todos": todos, "count": len(todos)}


@router.post("/analyze")
async def analyze_note(
    body: NoteAIRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Full analysis: keywords, sentiment, summary all in one."""
    content = await get_note_content(body.note_id, body.content, current_user.id, db)
    if not content.strip():
        raise HTTPException(400, "Note content is empty")

    keywords, sentiment = await __import__("asyncio").gather(
        notes_ai.extract_keywords(content, model=body.model),
        notes_ai.analyze_sentiment(content, model=body.model),
    )
    stats = notes_ai.calculate_stats(content)
    return {
        "keywords": keywords,
        "sentiment": sentiment,
        "stats": stats,
    }


@router.post("/sentiment")
async def sentiment_analysis(
    body: NoteAIRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    content = await get_note_content(body.note_id, body.content, current_user.id, db)
    result = await notes_ai.analyze_sentiment(content, model=body.model)
    return result


@router.post("/keywords")
async def extract_keywords(
    body: NoteAIRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    content = await get_note_content(body.note_id, body.content, current_user.id, db)
    keywords = await notes_ai.extract_keywords(content, model=body.model)
    return {"keywords": keywords}


@router.post("/translate")
async def translate_note(
    body: NoteAIRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not body.target_language:
        raise HTTPException(400, "Provide target_language")
    content = await get_note_content(body.note_id, body.content, current_user.id, db)
    result = await notes_ai.translate(content, body.target_language, model=body.model)
    return {"result": result, "target_language": body.target_language}


@router.post("/interview-questions")
async def interview_questions(
    body: NoteAIRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    content = await get_note_content(body.note_id, body.content, current_user.id, db)
    result = await notes_ai.generate_interview_questions(content, level=body.level or "intermediate", model=body.model)
    return {"result": result}


@router.post("/mindmap")
async def generate_mindmap(
    body: NoteAIRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    content = await get_note_content(body.note_id, body.content, current_user.id, db)
    result = await notes_ai.generate_mindmap(content, model=body.model)
    return result


@router.post("/explain")
async def explain_concept(
    body: NoteAIRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not body.prompt:
        raise HTTPException(400, "Provide concept as 'prompt'")
    context = ""
    if body.note_id or body.content:
        context = await get_note_content(body.note_id, body.content, current_user.id, db)
    result = await notes_ai.explain_concept(body.prompt, context, model=body.model)
    return {"result": result}
