"""NLP API Routes — Writing Suite"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.core.security import get_current_user
from app.ai.writing_service import ai_writing_service

router = APIRouter()


class EmailRequest(BaseModel):
    purpose: str
    context: str
    recipient: str = ""
    tone: str = "professional"
    model: str = "llama3"


class SummarizeRequest(BaseModel):
    content: str
    max_length: int = 500
    model: str = "llama3"


class MeetingMinutesRequest(BaseModel):
    transcript: str
    attendees: List[str] = []
    model: str = "llama3"


class ProposalRequest(BaseModel):
    project_name: str
    description: str
    objectives: str
    budget: str = ""
    timeline: str = ""
    model: str = "llama3"


class ResumeRequest(BaseModel):
    resume_text: str
    job_description: str = ""
    model: str = "llama3"


class GrammarRequest(BaseModel):
    text: str
    model: str = "llama3"


class PromptOptimizeRequest(BaseModel):
    prompt: str
    model: str = "llama3"


class CodeGenRequest(BaseModel):
    description: str
    language: str = "python"
    include_tests: bool = False
    model: str = "llama3"


class SQLGenRequest(BaseModel):
    description: str
    schema: str = ""
    dialect: str = "SQL"
    model: str = "llama3"


class TranslateRequest(BaseModel):
    text: str
    target_language: str
    source_language: str = "auto"
    model: str = "llama3"


class InsightsRequest(BaseModel):
    data_summary: str
    model: str = "llama3"


@router.post("/email")
async def generate_email(body: EmailRequest, current_user=Depends(get_current_user)):
    result = await ai_writing_service.generate_email(
        purpose=body.purpose, context=body.context,
        recipient=body.recipient, tone=body.tone, model=body.model
    )
    return {"result": result}


@router.post("/summarize")
async def summarize(body: SummarizeRequest, current_user=Depends(get_current_user)):
    result = await ai_writing_service.generate_report_summary(
        content=body.content, max_length=body.max_length, model=body.model
    )
    return {"result": result}


@router.post("/meeting-minutes")
async def meeting_minutes(body: MeetingMinutesRequest, current_user=Depends(get_current_user)):
    result = await ai_writing_service.generate_meeting_minutes(
        transcript=body.transcript, attendees=body.attendees, model=body.model
    )
    return {"result": result}


@router.post("/proposal")
async def generate_proposal(body: ProposalRequest, current_user=Depends(get_current_user)):
    result = await ai_writing_service.generate_proposal(
        project_name=body.project_name, description=body.description,
        objectives=body.objectives, budget=body.budget,
        timeline=body.timeline, model=body.model
    )
    return {"result": result}


@router.post("/resume-analyze")
async def analyze_resume(body: ResumeRequest, current_user=Depends(get_current_user)):
    result = await ai_writing_service.analyze_resume(
        resume_text=body.resume_text, job_description=body.job_description, model=body.model
    )
    return result


@router.post("/grammar")
async def check_grammar(body: GrammarRequest, current_user=Depends(get_current_user)):
    result = await ai_writing_service.check_grammar(text=body.text, model=body.model)
    return result


@router.post("/prompt-optimize")
async def optimize_prompt(body: PromptOptimizeRequest, current_user=Depends(get_current_user)):
    result = await ai_writing_service.optimize_prompt(prompt=body.prompt, model=body.model)
    return {"result": result}


@router.post("/code")
async def generate_code(body: CodeGenRequest, current_user=Depends(get_current_user)):
    result = await ai_writing_service.generate_code(
        description=body.description, language=body.language,
        include_tests=body.include_tests, model=body.model
    )
    return {"result": result}


@router.post("/sql")
async def generate_sql(body: SQLGenRequest, current_user=Depends(get_current_user)):
    result = await ai_writing_service.generate_sql(
        description=body.description, schema=body.schema,
        dialect=body.dialect, model=body.model
    )
    return {"result": result}


@router.post("/translate")
async def translate(body: TranslateRequest, current_user=Depends(get_current_user)):
    result = await ai_writing_service.translate_text(
        text=body.text, target_language=body.target_language,
        source_language=body.source_language, model=body.model
    )
    return {"result": result}


@router.post("/insights")
async def business_insights(body: InsightsRequest, current_user=Depends(get_current_user)):
    result = await ai_writing_service.generate_business_insights(
        data_summary=body.data_summary, model=body.model
    )
    return {"result": result}


@router.post("/sentiment")
async def analyze_sentiment(
    text: str,
    model: str = "llama3",
    current_user=Depends(get_current_user),
):
    """Sentiment analysis using local Ollama."""
    from app.ai.ollama_client import ollama_client
    messages = [
        {"role": "system", "content": "Analyze the sentiment of text. Respond with JSON: {sentiment: positive/negative/neutral, score: 0-1, confidence: 0-1, emotions: [...]}"},
        {"role": "user", "content": f"Analyze sentiment: {text[:500]}"},
    ]
    response = await ollama_client.chat(messages, model=model)
    import json, re
    try:
        match = re.search(r'\{.*\}', response, re.DOTALL)
        if match:
            return json.loads(match.group())
    except Exception:
        pass
    return {"sentiment": "neutral", "score": 0.5, "raw": response}
