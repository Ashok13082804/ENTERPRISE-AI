"""
AI Writing Suite — Email, Report, Proposal, Resume Analyzer
All powered by local Ollama (no cloud API)
"""
from typing import Dict, Any, List, Optional
from app.ai.ollama_client import ollama_client


class AIWritingService:
    """Enterprise AI writing assistant powered by Ollama."""

    async def generate_email(
        self,
        purpose: str,
        context: str,
        recipient: str = "",
        tone: str = "professional",
        model: str = None,
    ) -> str:
        messages = [
            {
                "role": "system",
                "content": (
                    f"You are a professional business email writer. "
                    f"Write emails in a {tone} tone. "
                    f"Format properly with Subject, Greeting, Body, and Sign-off."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Write a {tone} email for: {purpose}\n"
                    f"Context: {context}\n"
                    f"Recipient: {recipient or 'Team'}"
                ),
            },
        ]
        return await ollama_client.chat(messages, model=model)

    async def generate_report_summary(
        self, content: str, max_length: int = 500, model: str = None
    ) -> str:
        messages = [
            {
                "role": "system",
                "content": "You are an expert business analyst. Summarize reports concisely with key insights, metrics, and recommendations.",
            },
            {
                "role": "user",
                "content": f"Summarize this report in {max_length} words:\n\n{content[:3000]}",
            },
        ]
        return await ollama_client.chat(messages, model=model)

    async def generate_meeting_minutes(
        self, transcript: str, attendees: List[str] = None, model: str = None
    ) -> str:
        messages = [
            {
                "role": "system",
                "content": "You are a professional meeting secretary. Generate structured meeting minutes with: Date, Attendees, Agenda, Key Discussion Points, Decisions Made, Action Items, Next Steps.",
            },
            {
                "role": "user",
                "content": (
                    f"Generate meeting minutes from this transcript:\n\n{transcript[:4000]}\n\n"
                    f"Attendees: {', '.join(attendees) if attendees else 'Not specified'}"
                ),
            },
        ]
        return await ollama_client.chat(messages, model=model)

    async def generate_proposal(
        self,
        project_name: str,
        description: str,
        objectives: str,
        budget: str = "",
        timeline: str = "",
        model: str = None,
    ) -> str:
        messages = [
            {
                "role": "system",
                "content": "You are a senior business consultant. Write professional project proposals with Executive Summary, Problem Statement, Proposed Solution, Objectives, Methodology, Timeline, Budget, and Expected Outcomes.",
            },
            {
                "role": "user",
                "content": (
                    f"Write a professional proposal for:\n"
                    f"Project: {project_name}\n"
                    f"Description: {description}\n"
                    f"Objectives: {objectives}\n"
                    f"Budget: {budget}\n"
                    f"Timeline: {timeline}"
                ),
            },
        ]
        return await ollama_client.chat(messages, model=model)

    async def analyze_resume(self, resume_text: str, job_description: str = "", model: str = None) -> Dict[str, Any]:
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an expert HR recruiter and career coach. "
                    "Analyze resumes and provide detailed JSON feedback including: "
                    "score (0-100), strengths, weaknesses, skills_found, missing_skills, "
                    "experience_years, education_level, recommendations, ats_score."
                    " Always respond with valid JSON."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Analyze this resume:\n{resume_text[:3000]}\n\n"
                    f"Job Description: {job_description[:1000] if job_description else 'General'}"
                ),
            },
        ]
        response = await ollama_client.chat(messages, model=model)
        try:
            import json, re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except Exception:
            pass
        return {"analysis": response, "score": 0}

    async def check_grammar(self, text: str, model: str = None) -> Dict[str, Any]:
        messages = [
            {
                "role": "system",
                "content": "You are a grammar and style expert. Check text for errors and improvements. Return JSON with: corrected_text, errors (list), suggestions (list), readability_score.",
            },
            {
                "role": "user",
                "content": f"Check grammar and style:\n\n{text[:2000]}",
            },
        ]
        response = await ollama_client.chat(messages, model=model)
        try:
            import json, re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except Exception:
            pass
        return {"corrected_text": response, "errors": [], "suggestions": []}

    async def optimize_prompt(self, prompt: str, model: str = None) -> str:
        messages = [
            {
                "role": "system",
                "content": "You are a prompt engineering expert. Optimize and improve AI prompts to get better, more precise results. Include clear context, role, task, format, and constraints.",
            },
            {
                "role": "user",
                "content": f"Optimize this prompt:\n\n{prompt}",
            },
        ]
        return await ollama_client.chat(messages, model=model)

    async def generate_code(
        self,
        description: str,
        language: str = "python",
        include_tests: bool = False,
        model: str = None,
    ) -> str:
        messages = [
            {
                "role": "system",
                "content": (
                    f"You are an expert {language} developer. "
                    "Write clean, production-ready code with comments. "
                    "Follow best practices, SOLID principles, and error handling."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Write {language} code for: {description}"
                    + ("\nAlso write unit tests." if include_tests else "")
                ),
            },
        ]
        return await ollama_client.chat(messages, model=model)

    async def generate_sql(
        self,
        description: str,
        schema: str = "",
        dialect: str = "SQL",
        model: str = None,
    ) -> str:
        messages = [
            {
                "role": "system",
                "content": (
                    f"You are a senior database engineer expert in {dialect}. "
                    "Write optimized, production-ready SQL queries with explanations."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Write a {dialect} query for: {description}\n"
                    + (f"Schema:\n{schema}" if schema else "")
                ),
            },
        ]
        return await ollama_client.chat(messages, model=model)

    async def generate_business_insights(
        self, data_summary: str, model: str = None
    ) -> str:
        messages = [
            {
                "role": "system",
                "content": "You are a senior business analyst and data scientist. Provide actionable business insights, trends, risks, and recommendations based on data.",
            },
            {
                "role": "user",
                "content": f"Provide business insights for:\n\n{data_summary[:3000]}",
            },
        ]
        return await ollama_client.chat(messages, model=model)

    async def translate_text(
        self,
        text: str,
        target_language: str,
        source_language: str = "auto",
        model: str = None,
    ) -> str:
        messages = [
            {
                "role": "system",
                "content": f"You are a professional translator. Translate text accurately to {target_language}. Preserve formatting and tone.",
            },
            {
                "role": "user",
                "content": f"Translate to {target_language}:\n\n{text[:2000]}",
            },
        ]
        return await ollama_client.chat(messages, model=model)


# Singleton
ai_writing_service = AIWritingService()
