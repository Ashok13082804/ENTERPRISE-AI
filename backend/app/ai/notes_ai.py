"""
Notes AI Intelligence Service
All powered by local Ollama — no external APIs
Features: summarize, improve writing, generate, flashcards, quiz, Q&A, sentiment, keywords
"""
from typing import Dict, Any, List, Optional
from loguru import logger
from app.ai.ollama_client import ollama_client


class NotesAIService:
    """Comprehensive AI service for Smart Notes, powered entirely by Ollama."""

    # ─── Summarization ────────────────────────────────────────────────────────

    async def summarize(
        self,
        content: str,
        mode: str = "concise",  # concise, detailed, bullet
        model: str = None,
    ) -> str:
        """Summarize note content."""
        mode_instructions = {
            "concise": "Write a 2-3 sentence concise summary.",
            "detailed": "Write a detailed paragraph summary covering all key points.",
            "bullet": "Summarize as 5-7 clear bullet points (•).",
        }
        instruction = mode_instructions.get(mode, mode_instructions["concise"])
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an expert note summarizer. "
                    f"{instruction} "
                    "Be accurate, clear, and capture the essence of the content."
                ),
            },
            {"role": "user", "content": f"Summarize this note:\n\n{content[:4000]}"},
        ]
        return await ollama_client.chat(messages, model=model)

    # ─── Writing Improvement ─────────────────────────────────────────────────

    async def improve_writing(
        self,
        content: str,
        mode: str = "improve",  # improve, rewrite, fix_grammar, formal, casual, shorter, expand, simplify
        model: str = None,
    ) -> str:
        """Improve or rewrite note content."""
        mode_prompts = {
            "improve": "Improve the overall quality, clarity, and flow of this text while keeping the meaning intact:",
            "rewrite": "Completely rewrite this text in a better, clearer, more engaging way:",
            "fix_grammar": "Fix all grammar, spelling, and punctuation errors in this text. Return only the corrected text:",
            "formal": "Rewrite this text in a formal, professional tone:",
            "casual": "Rewrite this text in a casual, friendly, conversational tone:",
            "shorter": "Make this text significantly shorter while keeping all key information:",
            "expand": "Expand this text with more detail, examples, and explanation:",
            "simplify": "Simplify this text so it's easy to understand, avoiding jargon:",
            "professional": "Rewrite this text to sound polished and professional:",
            "bullets": "Convert this text into well-organized bullet points:",
        }
        prompt = mode_prompts.get(mode, mode_prompts["improve"])
        messages = [
            {
                "role": "system",
                "content": "You are an expert writing assistant. Return only the improved text without any explanation or commentary.",
            },
            {"role": "user", "content": f"{prompt}\n\n{content[:3000]}"},
        ]
        return await ollama_client.chat(messages, model=model)

    # ─── AI Generation ────────────────────────────────────────────────────────

    async def generate_note(
        self,
        prompt: str,
        note_type: str = "note",  # note, blog, essay, email, report, meeting, documentation, research, linkedin, readme
        model: str = None,
    ) -> str:
        """Generate a complete note/document from a prompt."""
        type_instructions = {
            "note": "Write a comprehensive, well-structured note with headings and bullet points.",
            "blog": "Write an engaging blog post with an introduction, main sections, and conclusion.",
            "essay": "Write a structured essay with introduction, body paragraphs, and conclusion.",
            "email": "Write a professional email with subject, greeting, body, and sign-off.",
            "report": "Write a professional report with executive summary, findings, and recommendations.",
            "meeting": "Write structured meeting notes with agenda, discussion points, decisions, and action items.",
            "documentation": "Write clear technical documentation with overview, usage, examples, and notes.",
            "research": "Write a research summary with background, key findings, methodology, and conclusions.",
            "linkedin": "Write an engaging LinkedIn post that is professional and attention-grabbing.",
            "readme": "Write a comprehensive README.md with badges, overview, installation, usage, and contributing sections.",
            "flashcards": "Create a set of study flashcards in Q&A format. Format each as:\nQ: [question]\nA: [answer]",
            "todo": "Create a detailed, actionable to-do list with priorities and sub-tasks.",
            "study_notes": "Create comprehensive study notes with key concepts, definitions, and examples.",
            "project_ideas": "Generate creative, innovative project ideas with descriptions and potential impact.",
            "resume_points": "Generate strong, quantified resume bullet points for the given role/context.",
        }
        instruction = type_instructions.get(note_type, type_instructions["note"])
        messages = [
            {
                "role": "system",
                "content": (
                    f"You are an expert content creator and writer. {instruction} "
                    "Use markdown formatting with # headers, **bold**, *italic*, bullet lists, and code blocks where appropriate. "
                    "Make the content comprehensive and high quality."
                ),
            },
            {"role": "user", "content": f"Create content about: {prompt}"},
        ]
        return await ollama_client.chat(messages, model=model)

    # ─── Flashcards & Study ───────────────────────────────────────────────────

    async def generate_flashcards(
        self, content: str, count: int = 10, model: str = None
    ) -> List[Dict[str, str]]:
        """Generate study flashcards from note content."""
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an expert educator. Generate study flashcards from the content. "
                    f"Create exactly {count} flashcards. "
                    "Format your response as a JSON array: "
                    '[{"question": "...", "answer": "..."}, ...]. '
                    "Return ONLY valid JSON, no other text."
                ),
            },
            {
                "role": "user",
                "content": f"Generate {count} flashcards from:\n\n{content[:3000]}",
            },
        ]
        response = await ollama_client.chat(messages, model=model)
        try:
            import json, re
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except Exception as e:
            logger.error(f"Flashcard parse error: {e}")
        # Fallback: parse Q&A format
        cards = []
        for line in response.split("\n"):
            if line.startswith("Q:"):
                cards.append({"question": line[2:].strip(), "answer": ""})
            elif line.startswith("A:") and cards:
                cards[-1]["answer"] = line[2:].strip()
        return cards or [{"question": "Could not parse flashcards", "answer": response[:500]}]

    async def generate_quiz(
        self, content: str, count: int = 5, model: str = None
    ) -> List[Dict[str, Any]]:
        """Generate MCQ quiz from note content."""
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an expert quiz creator. Generate multiple-choice questions from the content. "
                    f"Create exactly {count} MCQs. "
                    "Format as JSON: "
                    '[{"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "A", "explanation": "..."}, ...]. '
                    "Return ONLY valid JSON."
                ),
            },
            {"role": "user", "content": f"Generate {count} MCQs from:\n\n{content[:3000]}"},
        ]
        response = await ollama_client.chat(messages, model=model)
        try:
            import json, re
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except Exception as e:
            logger.error(f"Quiz parse error: {e}")
        return [{"question": "Could not parse quiz", "options": [], "answer": "", "explanation": response[:200]}]

    # ─── Q&A ──────────────────────────────────────────────────────────────────

    async def answer_question(
        self, question: str, note_content: str, model: str = None
    ) -> str:
        """Answer a question based on note content."""
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an intelligent assistant. Answer questions based ONLY on the provided note content. "
                    "If the answer is not in the note, say so clearly. "
                    "Be concise and accurate."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Note Content:\n{note_content[:3000]}\n\n"
                    f"Question: {question}"
                ),
            },
        ]
        return await ollama_client.chat(messages, model=model)

    # ─── Auto-tagging ─────────────────────────────────────────────────────────

    async def generate_tags(
        self, title: str, content: str, model: str = None
    ) -> List[str]:
        """Auto-generate relevant tags for a note."""
        messages = [
            {
                "role": "system",
                "content": (
                    "You are a note organization expert. Generate 5-8 relevant tags/keywords for the given note. "
                    "Tags should be single words or short phrases, lowercase, without # symbol. "
                    "Return ONLY a JSON array of strings: [\"tag1\", \"tag2\", ...]. "
                    "Return ONLY valid JSON, no other text."
                ),
            },
            {
                "role": "user",
                "content": f"Title: {title}\n\nContent:\n{content[:2000]}",
            },
        ]
        response = await ollama_client.chat(messages, model=model)
        try:
            import json, re
            json_match = re.search(r'\[.*?\]', response, re.DOTALL)
            if json_match:
                tags = json.loads(json_match.group())
                return [str(t).lower().strip() for t in tags if t][:8]
        except Exception:
            pass
        # Fallback: split comma-separated
        return [t.strip().lower().strip('"\'') for t in response.replace("[", "").replace("]", "").split(",") if t.strip()][:8]

    # ─── Keyword Extraction ───────────────────────────────────────────────────

    async def extract_keywords(self, content: str, model: str = None) -> List[str]:
        """Extract key topics and entities from note."""
        messages = [
            {
                "role": "system",
                "content": (
                    "Extract the most important keywords, entities, and topics from the text. "
                    "Return ONLY a JSON array of strings (5-10 items): [\"keyword1\", ...]. "
                    "Return ONLY valid JSON."
                ),
            },
            {"role": "user", "content": f"Extract keywords:\n\n{content[:2000]}"},
        ]
        response = await ollama_client.chat(messages, model=model)
        try:
            import json, re
            json_match = re.search(r'\[.*?\]', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except Exception:
            pass
        return []

    # ─── Sentiment Analysis ───────────────────────────────────────────────────

    async def analyze_sentiment(
        self, content: str, model: str = None
    ) -> Dict[str, Any]:
        """Analyze sentiment and tone of note content."""
        messages = [
            {
                "role": "system",
                "content": (
                    "Analyze the sentiment and tone of the text. "
                    "Return JSON: {\"sentiment\": \"positive|negative|neutral\", \"score\": 0.0-1.0, \"tone\": \"formal|casual|urgent|etc\", \"emotions\": [\"...\"], \"summary\": \"...\"}. "
                    "Return ONLY valid JSON."
                ),
            },
            {"role": "user", "content": f"Analyze sentiment:\n\n{content[:2000]}"},
        ]
        response = await ollama_client.chat(messages, model=model)
        try:
            import json, re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except Exception:
            pass
        return {"sentiment": "neutral", "score": 0.5, "tone": "unknown", "emotions": [], "summary": response[:200]}

    # ─── To-Do Extraction ────────────────────────────────────────────────────

    async def extract_todos(self, content: str, model: str = None) -> List[str]:
        """Extract actionable to-do items from note content."""
        messages = [
            {
                "role": "system",
                "content": (
                    "Extract all actionable tasks and to-do items from the text. "
                    "Return ONLY a JSON array of strings: [\"Task 1\", \"Task 2\", ...]. "
                    "Return ONLY valid JSON."
                ),
            },
            {"role": "user", "content": f"Extract to-dos from:\n\n{content[:2000]}"},
        ]
        response = await ollama_client.chat(messages, model=model)
        try:
            import json, re
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except Exception:
            pass
        return []

    # ─── Duplicate Detection ──────────────────────────────────────────────────

    async def check_similarity(
        self, content1: str, content2: str, model: str = None
    ) -> Dict[str, Any]:
        """Check if two notes are similar/duplicate."""
        messages = [
            {
                "role": "system",
                "content": (
                    "Compare two texts and assess their similarity. "
                    "Return JSON: {\"similarity_score\": 0.0-1.0, \"is_duplicate\": true/false, \"reason\": \"...\"}. "
                    "Return ONLY valid JSON."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Text 1:\n{content1[:1000]}\n\n"
                    f"Text 2:\n{content2[:1000]}"
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
        return {"similarity_score": 0.0, "is_duplicate": False, "reason": "Unable to determine"}

    # ─── Explain Concept ──────────────────────────────────────────────────────

    async def explain_concept(
        self, concept: str, context: str = "", model: str = None
    ) -> str:
        """Explain a concept, optionally in the context of a note."""
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an expert teacher. Explain concepts clearly with examples. "
                    "Use simple language and structure explanations with key points."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Explain: {concept}"
                    + (f"\n\nContext from my notes:\n{context[:1000]}" if context else "")
                ),
            },
        ]
        return await ollama_client.chat(messages, model=model)

    # ─── Translate ────────────────────────────────────────────────────────────

    async def translate(
        self, content: str, target_language: str, model: str = None
    ) -> str:
        """Translate note to a target language."""
        messages = [
            {
                "role": "system",
                "content": f"You are a professional translator. Translate the text to {target_language}. Preserve formatting, markdown, and structure. Return only the translated text.",
            },
            {"role": "user", "content": f"Translate to {target_language}:\n\n{content[:3000]}"},
        ]
        return await ollama_client.chat(messages, model=model)

    # ─── Interview Questions ───────────────────────────────────────────────────

    async def generate_interview_questions(
        self, content: str, level: str = "intermediate", model: str = None
    ) -> str:
        """Generate interview questions based on note content."""
        messages = [
            {
                "role": "system",
                "content": (
                    f"You are an expert interviewer. Generate {level}-level interview questions "
                    "based on the given content. Include both technical and conceptual questions. "
                    "Format as a numbered list with brief answer hints."
                ),
            },
            {"role": "user", "content": f"Generate interview questions from:\n\n{content[:3000]}"},
        ]
        return await ollama_client.chat(messages, model=model)

    # ─── Mind Map ────────────────────────────────────────────────────────────

    async def generate_mindmap(self, content: str, model: str = None) -> Dict[str, Any]:
        """Generate a mind map structure from note content."""
        messages = [
            {
                "role": "system",
                "content": (
                    "Generate a mind map from the content. "
                    "Return JSON: {\"central_topic\": \"...\", \"branches\": [{\"topic\": \"...\", \"subtopics\": [\"...\", ...]}]}. "
                    "Return ONLY valid JSON."
                ),
            },
            {"role": "user", "content": f"Create mind map from:\n\n{content[:3000]}"},
        ]
        response = await ollama_client.chat(messages, model=model)
        try:
            import json, re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except Exception:
            pass
        return {"central_topic": "Notes", "branches": [], "raw": response}

    # ─── Utility ──────────────────────────────────────────────────────────────

    def calculate_stats(self, content: str) -> Dict[str, Any]:
        """Calculate word count, char count, and estimated reading time."""
        words = len(content.split()) if content else 0
        chars = len(content)
        # Average reading speed: 200 words per minute
        reading_time = round(words / 200, 1) if words > 0 else 0.0
        return {
            "word_count": words,
            "char_count": chars,
            "reading_time_minutes": reading_time,
        }


# Singleton
notes_ai = NotesAIService()
